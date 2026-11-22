import sys
from pathlib import Path

PAGE_WIDTH = 595
PAGE_HEIGHT = 842
RED = (0.92, 0.04, 0.12)
BLACK = (0, 0, 0)
WHITE = (1, 1, 1)
GRAY = (0.42, 0.42, 0.42)
LIGHT = (0.96, 0.96, 0.96)
BORDER = (0.72, 0.72, 0.72)


def escape_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def text(
    ops: list,
    x: float,
    y: float,
    size: float,
    value: str,
    font: str = "F1",
    color: tuple = BLACK,
) -> None:
    red, green, blue = color
    ops.append(
        f"BT /{font} {size} Tf {red} {green} {blue} rg "
        f"{x} {y} Td ({escape_text(value)}) Tj ET"
    )


def rect(
    ops: list,
    x: float,
    y: float,
    width: float,
    height: float,
    fill: tuple | None = None,
    stroke: tuple | None = None,
    line_width: float = 0.8,
) -> None:
    if fill is not None:
        red, green, blue = fill
        ops.append(f"{red} {green} {blue} rg")
    if stroke is not None:
        red, green, blue = stroke
        ops.append(f"{red} {green} {blue} RG {line_width} w")
    operator = "B" if fill is not None and stroke is not None else "f" if fill else "S"
    ops.append(f"{x} {y} {width} {height} re {operator}")


def line(
    ops: list,
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    color: tuple = BORDER,
    line_width: float = 0.8,
) -> None:
    red, green, blue = color
    ops.append(f"{red} {green} {blue} RG {line_width} w {x1} {y1} m {x2} {y2} l S")


def field(
    ops: list,
    x: float,
    y: float,
    width: float,
    height: float,
    label: str,
    value: str,
) -> None:
    rect(ops, x, y, width, height, fill=LIGHT, stroke=BORDER)
    text(ops, x + 8, y + height - 12, 7, label, color=GRAY)
    text(ops, x + 8, y + 10, 11, value, font="F2")


def draw_barcode(ops: list, x: float, y: float) -> None:
    pattern = [2, 1, 1, 3, 1, 2, 2, 1, 4, 1, 1, 2, 3, 1, 2, 1, 1, 4, 2, 1]
    cursor = x
    for index, width in enumerate(pattern * 3):
        if index % 2 == 0:
            rect(ops, cursor, y, width, 48, fill=BLACK)
        cursor += width + 1
        if cursor > x + 300:
            break


def draw_qr(ops: list, x: float, y: float) -> None:
    module = 4
    size = 21

    def finder(row: int, col: int) -> bool | None:
        zones = ((0, 0), (0, 14), (14, 0))
        for start_row, start_col in zones:
            if start_row <= row < start_row + 7 and start_col <= col < start_col + 7:
                local_row = row - start_row
                local_col = col - start_col
                if local_row in (0, 6) or local_col in (0, 6):
                    return True
                if 2 <= local_row <= 4 and 2 <= local_col <= 4:
                    return True
                return False
        return None

    for row in range(size):
        for col in range(size):
            fixed = finder(row, col)
            dark = (
                fixed if fixed is not None else (row * 7 + col * 11 + row * col) % 5 < 2
            )
            if dark:
                rect(
                    ops,
                    x + col * module,
                    y + (size - 1 - row) * module,
                    module,
                    module,
                    fill=BLACK,
                )


def build_content() -> str:
    ops: list = []
    rect(ops, 0, 782, PAGE_WIDTH, 60, fill=RED)
    text(ops, 40, 806, 26, "CRLV-e", font="F2", color=WHITE)
    text(
        ops,
        40,
        790,
        9,
        "Certificado de Registro e Licenciamento de Veículo",
        color=WHITE,
    )
    text(ops, 455, 806, 10, "DEMONSTRAÇÃO", font="F2", color=WHITE)

    rect(ops, 40, 724, 515, 36, fill=(1, 0.93, 0.93), stroke=RED, line_width=1.2)
    text(
        ops,
        62,
        737,
        10,
        "ESPÉCIME DE DEMONSTRAÇÃO - SEM VALOR LEGAL",
        font="F2",
        color=RED,
    )

    text(ops, 40, 688, 11, "IDENTIFICAÇÃO DO VEÍCULO", font="F2")
    line(ops, 40, 682, 555, 682, color=RED, line_width=1.2)

    field(ops, 40, 620, 130, 42, "PLACA", "DEMO1A23")
    field(ops, 180, 620, 230, 42, "CHASSI", "9BRBL3HE0S0000000")
    field(ops, 420, 620, 135, 42, "RENAVAM", "00000000000")

    field(ops, 40, 560, 260, 42, "MARCA / MODELO", "TOYOTA COROLLA ALTIS")
    field(ops, 310, 560, 110, 42, "ANO / MODELO", "2025")
    field(ops, 430, 560, 125, 42, "COR", "BRANCO PÉROLA")

    field(ops, 40, 500, 160, 42, "COMBUSTÍVEL", "HÍBRIDO")
    field(ops, 210, 500, 120, 42, "CATEGORIA", "PARTICULAR")
    field(ops, 340, 500, 80, 42, "EXERCÍCIO", "2026")
    field(ops, 430, 500, 125, 42, "VALIDADE", "31/12/2026")

    field(ops, 40, 440, 260, 42, "MUNICÍPIO / UF", "SÃO PAULO / SP")
    field(ops, 310, 440, 110, 42, "EMISSÃO", "22/11/2026")
    field(ops, 430, 440, 125, 42, "SEGURANÇA", "DEMO-0000-0000")

    text(ops, 40, 400, 11, "OBSERVAÇÕES", font="F2")
    line(ops, 40, 394, 555, 394)
    text(
        ops,
        40,
        374,
        9,
        "Documento gerado exclusivamente para demonstração.",
        color=GRAY,
    )
    text(
        ops,
        40,
        360,
        9,
        "Dados, placas e códigos são fictícios; sem valor legal.",
        color=GRAY,
    )

    text(ops, 40, 318, 8, "CÓDIGO DE SEGURANÇA", color=GRAY)
    draw_barcode(ops, 40, 258)
    draw_qr(ops, 448, 250)

    line(ops, 40, 210, 555, 210)
    text(
        ops,
        40,
        188,
        9,
        "Documento de demonstração. Valores ilustrativos.",
        font="F2",
    )
    text(
        ops,
        40,
        172,
        8,
        "Dados reais do seu veículo constarão no documento oficial.",
        color=GRAY,
    )
    text(ops, 40, 80, 8, "ToyotaTech - CRLV-e demo", color=GRAY)
    text(ops, 520, 80, 8, "1 / 1", color=GRAY)

    return "\n".join(ops)


def build_pdf() -> bytes:
    content = build_content()
    content_bytes = content.encode("latin-1")
    objects = {
        1: "<< /Type /Catalog /Pages 2 0 R >>",
        2: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        3: (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] "
            "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>"
        ),
        4: (
            "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica "
            "/Encoding /WinAnsiEncoding >>"
        ),
        5: (
            "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold "
            "/Encoding /WinAnsiEncoding >>"
        ),
        6: (f"<< /Length {len(content_bytes)} >>\nstream\n{content}\nendstream"),
    }

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = {}
    for number in range(1, 7):
        offsets[number] = len(pdf)
        pdf.extend(f"{number} 0 obj\n{objects[number]}\nendobj\n".encode("latin-1"))

    xref_offset = len(pdf)
    pdf.extend(b"xref\n0 7\n0000000000 65535 f \n")
    for number in range(1, 7):
        pdf.extend(f"{offsets[number]:010d} 00000 n \n".encode("latin-1"))
    pdf.extend(
        b"trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n"
        + str(xref_offset).encode("ascii")
        + b"\n%%EOF\n"
    )

    result = bytes(pdf)
    start = int(result.rsplit(b"startxref\n", 1)[1].split(b"\n", 1)[0])
    if result[start : start + 4] != b"xref":
        raise ValueError("xref invalido")
    if b"/Count 1" not in result or b"%%EOF" not in result:
        raise ValueError("estrutura pdf invalida")
    return result


def main() -> None:
    output = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/opencode/crlv-demo.pdf")
    output.write_bytes(build_pdf())
    print(output)


if __name__ == "__main__":
    main()
