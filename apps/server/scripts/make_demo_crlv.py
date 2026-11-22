import sys
from pathlib import Path

PAGE_WIDTH = 595
PAGE_HEIGHT = 842


def build_content() -> str:
    lines = [
        ("DOCUMENTO DE DEMONSTRA\\307\\303O", 20),
        ("CRLV-e - ToyotaTech", 16),
        ("Ambiente academico.", 12),
        ("Nao e um documento valido.", 12),
        ("Sem valor legal.", 12),
    ]
    parts = ["BT"]
    position_y = 760
    for text, size in lines:
        parts.append(f"/F1 {size} Tf")
        parts.append(f"50 {position_y} Td")
        parts.append(f"({text}) Tj")
        position_y -= 30
    parts.append("ET")
    return "\n".join(parts)


def build_pdf() -> bytes:
    content = build_content().encode("latin-1")
    objects = {
        1: "<< /Type /Catalog /Pages 2 0 R >>",
        2: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        3: (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] "
            "/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>"
        ),
        4: (
            "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica "
            "/Encoding /WinAnsiEncoding >>"
        ),
        5: f"<< /Length {len(content)} >>\nstream\n"
        + content.decode("latin-1")
        + "\nendstream",
    }

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = {}
    for number in range(1, 6):
        offsets[number] = len(pdf)
        pdf.extend(f"{number} 0 obj\n{objects[number]}\nendobj\n".encode("latin-1"))

    xref_offset = len(pdf)
    pdf.extend(b"xref\n0 6\n0000000000 65535 f \n")
    for number in range(1, 6):
        pdf.extend(f"{offsets[number]:010d} 00000 n \n".encode("latin-1"))
    pdf.extend(
        b"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"
        + str(xref_offset).encode("ascii")
        + b"\n%%EOF\n"
    )
    return bytes(pdf)


def main() -> None:
    output = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/opencode/crlv-demo.pdf")
    output.write_bytes(build_pdf())
    print(output)


if __name__ == "__main__":
    main()
