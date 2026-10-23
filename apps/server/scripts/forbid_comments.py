import sys
import tokenize
from pathlib import Path

EXCLUDE_DIRS = {
    ".git",
    ".aws-sam",
    "__pycache__",
    ".venv",
    "venv",
    ".pytest_cache",
    ".ruff_cache",
}


def python_files(root: Path) -> list[Path]:
    return sorted(
        path for path in root.rglob("*.py") if not EXCLUDE_DIRS.intersection(path.parts)
    )


def find_comments(path: Path) -> list[int]:
    with path.open("rb") as handle:
        return [
            token.start[0]
            for token in tokenize.tokenize(handle.readline)
            if token.type == tokenize.COMMENT
        ]


def main() -> int:
    root = Path.cwd()
    violations = [
        f"{path.relative_to(root)}:{line}"
        for path in python_files(root)
        for line in find_comments(path)
    ]
    for violation in violations:
        print(violation)
    if violations:
        print(f"Comments are not allowed ({len(violations)} found)")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
