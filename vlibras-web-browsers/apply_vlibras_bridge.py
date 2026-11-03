from pathlib import Path
import re
import sys

source = Path("src/widget/app.tsx")
if not source.is_file():
    print("ERRO: execute este script na raiz de vlibras-web-browsers (não encontrei src/widget/app.tsx).")
    sys.exit(1)

text = source.read_text(encoding="utf-8")
event_name = "toyota-tech:vlibras:translate"
if event_name in text:
    print("Ponte Toyota Tech já aparece em src/widget/app.tsx; nada foi alterado.")
    sys.exit(0)

# Add import relative to src/widget/app.tsx.
import_pattern = re.compile(r'import\s*\{[^}]*\buseEffect\b[^}]*\}\s*from\s*["\']preact/hooks["\'];')
match = import_pattern.search(text)
if not match:
    print("ERRO: não encontrei o import de useEffect em src/widget/app.tsx. Não alterei o arquivo.")
    sys.exit(2)
text = text[:match.end()] + '\nimport { useTranslate } from "./hooks/use-translate";' + text[match.end():]

component_marker = "export const WidgetApp = () => {"
if component_marker not in text:
    print("ERRO: não encontrei o início de WidgetApp. Não alterei o arquivo.")
    sys.exit(3)

bridge = '''export const WidgetApp = () => {
  // Bridge event used by the Toyota Tech chatbot. This uses the VLibras
  // translation hook/store rather than unsupported legacy window.plugin APIs.
  const toyotaTranslateRequest = useTranslate();
  useEffect(() => {
    const targetWindow = window as any;
    const handleToyotaTranslate = (event: Event) => {
      const detail = (event as CustomEvent<{ text?: string }>).detail;
      const text = detail?.text?.trim();
      if (!text) return;
      toyotaTranslateRequest.mutate(text);
    };

    targetWindow.__TOYOTA_VLIBRAS_BRIDGE_READY = true;
    targetWindow.addEventListener("toyota-tech:vlibras:translate", handleToyotaTranslate);
    return () => {
      targetWindow.removeEventListener("toyota-tech:vlibras:translate", handleToyotaTranslate);
      targetWindow.__TOYOTA_VLIBRAS_BRIDGE_READY = false;
    };
  }, [toyotaTranslateRequest.mutate]);'''
text = text.replace(component_marker, bridge, 1)

backup = source.with_suffix(source.suffix + ".toyota-backup")
if not backup.exists():
    backup.write_text(source.read_text(encoding="utf-8"), encoding="utf-8")
source.write_text(text, encoding="utf-8")
print("Ponte aplicada em src/widget/app.tsx; backup salvo em", backup)
