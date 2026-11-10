import concurrent.futures
import os
import sys
import urllib.error
import urllib.request

BODY = b'{"email":"a@b.co"}'
DEFAULT_COUNT = 25
MAX_COUNT = 50
MAX_WORKERS = 1


def api_url() -> str:
    base = os.environ.get("SMOKE_API_URL", "").strip()
    if not base:
        raise SystemExit("SMOKE_API_URL não configurada.")
    return base.rstrip("/")


def call(_: int) -> tuple[int, dict[str, str]]:
    request = urllib.request.Request(
        f"{api_url()}/auth/check-email",
        data=BODY,
        headers={"Content-Type": "application/json", "Origin": "https://example.com"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, dict(response.headers)
    except urllib.error.HTTPError as error:
        return error.code, dict(error.headers)


def main() -> int:
    count = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_COUNT
    count = max(1, min(count, MAX_COUNT))
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        results = list(pool.map(call, range(count)))

    codes: dict[int, int] = {}
    for status, _ in results:
        codes[status] = codes.get(status, 0) + 1
    print("codigos:", dict(sorted(codes.items())))

    for status, headers in results:
        if status == 429:
            print("--- 429 headers (cross-origin) ---")
            for key in sorted(headers):
                print(f"{key.lower()}: {headers[key]}")
            exposed = [
                value
                for key, value in headers.items()
                if key.lower() == "access-control-expose-headers"
            ]
            if exposed and "retry-after" in exposed[0].lower():
                print("OK: expose-headers contem retry-after")
                return 0
            print("FALHA: expose-headers ausente ou sem retry-after")
            return 1

    print("nenhum 429 no burst")
    return 1


if __name__ == "__main__":
    sys.exit(main())
