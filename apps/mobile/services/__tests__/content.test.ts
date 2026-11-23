import { HighlightsResponse } from "@/types/content";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import { fetchHighlights, resetHighlightsCache } from "../content";

const mockApiRequest =
  jest.fn<(path: string, options?: unknown) => Promise<HighlightsResponse>>();

jest.mock("../api", () => ({
  apiRequest: (path: string, options?: unknown) =>
    mockApiRequest(path, options),
}));

const payload: HighlightsResponse = {
  highlights: [
    { id: "corolla", title: "Corolla Altis", imageKey: "corolla-main" },
  ],
};

beforeEach(() => {
  resetHighlightsCache();
  mockApiRequest.mockReset();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("fetchHighlights", () => {
  it("deduplica chamadas simultaneas", async () => {
    let resolveRequest: (value: HighlightsResponse) => void = () => {};
    mockApiRequest.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    const first = fetchHighlights();
    const second = fetchHighlights();

    expect(mockApiRequest).toHaveBeenCalledTimes(1);

    resolveRequest(payload);

    await expect(Promise.all([first, second])).resolves.toEqual([
      payload,
      payload,
    ]);
  });

  it("reaproveita o cache dentro do ttl", async () => {
    mockApiRequest.mockResolvedValue(payload);

    await fetchHighlights();
    await fetchHighlights();

    expect(mockApiRequest).toHaveBeenCalledTimes(1);
  });

  it("busca de novo depois do ttl", async () => {
    const now = jest.spyOn(Date, "now").mockReturnValue(1_000);
    mockApiRequest.mockResolvedValue(payload);

    await fetchHighlights();
    now.mockReturnValue(1_000 + 60_001);
    await fetchHighlights();

    expect(mockApiRequest).toHaveBeenCalledTimes(2);
  });

  it("ignora o cache quando force e usado", async () => {
    mockApiRequest.mockResolvedValue(payload);

    await fetchHighlights();
    await fetchHighlights(true);

    expect(mockApiRequest).toHaveBeenCalledTimes(2);
  });

  it("permite nova tentativa depois de uma falha", async () => {
    mockApiRequest.mockRejectedValueOnce(new Error("offline"));

    await expect(fetchHighlights()).rejects.toThrow("offline");

    mockApiRequest.mockResolvedValue(payload);
    await fetchHighlights();

    expect(mockApiRequest).toHaveBeenCalledTimes(2);
  });
});
