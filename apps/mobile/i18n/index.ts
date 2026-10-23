import ptBR from "./pt-BR.json";

type Params = Record<string, string | number>;

const dictionary: Record<string, string> = ptBR;

export const locale = "pt-BR";

export function t(text: string, params?: Params): string;
export function t(
  text: string | null | undefined,
  params?: Params
): string | undefined;
export function t(text: string | null | undefined, params?: Params) {
  if (text === null || text === undefined) {
    return undefined;
  }
  const translated = dictionary[text] ?? text;
  if (!params) {
    return translated;
  }
  return translated.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match
  );
}

export function formatNumber(value: number) {
  return value.toLocaleString(locale);
}
