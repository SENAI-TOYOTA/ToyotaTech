type ClassValue = string | number | false | null | undefined;

/**
 * Concatena classes condicionalmente (sem dependências externas).
 * Obs.: não resolve conflitos de utilitários Tailwind — para overrides
 * via `className`, prefira classes que não colidam com as do componente.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

