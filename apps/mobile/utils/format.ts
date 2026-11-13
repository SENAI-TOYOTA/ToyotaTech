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

export function formatBoletoBarcode(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 47) {
    return digits;
  }
  return [
    `${digits.slice(0, 5)}.${digits.slice(5, 10)}`,
    `${digits.slice(10, 15)}.${digits.slice(15, 21)}`,
    `${digits.slice(21, 26)}.${digits.slice(26, 32)}`,
    digits.slice(32, 33),
    digits.slice(33, 47),
  ].join(" ");
}
