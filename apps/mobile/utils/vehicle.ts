export function canUseCorollaAltisImage(model?: string) {
  return (model ?? "").toLowerCase().includes("corolla altis");
}
