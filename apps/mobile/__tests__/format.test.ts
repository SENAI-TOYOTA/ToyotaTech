import { formatBoletoBarcode } from "@/utils/format";
import { describe, expect, it } from "@jest/globals";

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
