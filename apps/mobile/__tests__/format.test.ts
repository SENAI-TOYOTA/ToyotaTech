import { formatBoletoBarcode, isValidBoletoBarcode } from "@/utils/format";
import { describe, expect, it } from "@jest/globals";

describe("isValidBoletoBarcode", () => {
  it("aceita exatamente 47 digitos", () => {
    expect(isValidBoletoBarcode("1".repeat(47))).toBe(true);
  });

  it("rejeita tamanho diferente ou caractere nao numerico", () => {
    expect(isValidBoletoBarcode("1".repeat(46))).toBe(false);
    expect(isValidBoletoBarcode("1".repeat(46) + "a")).toBe(false);
  });
});

describe("formatBoletoBarcode", () => {
  it("formata a linha digitavel com 47 digitos", () => {
    const barcode = "12345678901234567890123456789012345678901234567";

    expect(formatBoletoBarcode(barcode)).toBe(
      "12345.67890 12345.678901 23456.789012 3 45678901234567"
    );
  });

  it("retorna o valor limpo quando a entrada nao tem 47 digitos", () => {
    expect(formatBoletoBarcode("123.456")).toBe("123456");
    expect(formatBoletoBarcode("")).toBe("");
  });
});
