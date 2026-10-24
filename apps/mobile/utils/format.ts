export function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (!digits) {
    return "";
  }
  let result = digits.slice(0, 2);
  if (digits.length > 2) {
    result += `/${digits.slice(2, 4)}`;
  }
  if (digits.length > 4) {
    result += `/${digits.slice(4, 8)}`;
  }
  return result;
}

export function normalizeCpf(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function formatCpf(value: string) {
  const digits = normalizeCpf(value);
  if (!digits) {
    return "";
  }
  let result = digits.slice(0, 3);
  if (digits.length > 3) {
    result += `.${digits.slice(3, 6)}`;
  }
  if (digits.length > 6) {
    result += `.${digits.slice(6, 9)}`;
  }
  if (digits.length > 9) {
    result += `-${digits.slice(9, 11)}`;
  }
  return result;
}
