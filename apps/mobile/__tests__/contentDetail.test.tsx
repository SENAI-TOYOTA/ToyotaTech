/* eslint-disable @typescript-eslint/no-require-imports */
import ContentDetailScreen from "@/app/content/[id]";
import { ApiError } from "@/services/api";
import { ContentDetailResponse } from "@/types/content";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react-native";

const mockFetchContentDetail =
  jest.fn<(id: string) => Promise<ContentDetailResponse>>();

jest.mock("react-native-reanimated", () => {
  const RN = require("react-native");
  const chainable = () => {
    const chain: Record<string, unknown> = {};
    chain.duration = () => chain;
    chain.delay = () => chain;
    chain.springify = () => chain;
    return chain;
  };
  const Animated = {
    View: RN.View,
    Text: RN.Text,
    ScrollView: RN.ScrollView,
    createAnimatedComponent: (component: unknown) => component,
  };

  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    useSharedValue: (value: unknown) => ({ value }),
    useAnimatedStyle: () => ({}),
    withSpring: (value: unknown) => value,
    withTiming: (value: unknown) => value,
    Easing: { out: (value: unknown) => value, quad: 0 },
    FadeInDown: chainable(),
    FadeInRight: chainable(),
    FadeInUp: chainable(),
  };
});

jest.mock("lucide-react-native", () => {
  const { View } = require("react-native");

  return {
    ArrowLeft: () => <View />,
  };
});

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: "api-1" }),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  }),
}));

jest.mock("@/services/content", () => ({
  fetchContentDetail: (id: string) => mockFetchContentDetail(id),
}));

const detail: ContentDetailResponse = {
  content: {
    id: "api-1",
    title: "Novidade da API",
    imageKey: "corolla-main",
    category: "guide",
    author: "Equipe ToyotaTech",
    publishedAt: "22/11/2026",
    readingTime: 4,
    summary: "Resumo do conteúdo.",
    body: ["Primeiro parágrafo.", "Segundo parágrafo."],
  },
};

beforeEach(() => {
  mockFetchContentDetail.mockReset();
});

afterEach(async () => {
  await cleanup();
});

describe("ContentDetailScreen", () => {
  it("renderiza capa, metadados e corpo", async () => {
    mockFetchContentDetail.mockResolvedValue(detail);
    const screen = await render(<ContentDetailScreen />);

    await waitFor(() =>
      expect(screen.getByText("Novidade da API")).toBeTruthy()
    );

    expect(screen.getByText("GUIA")).toBeTruthy();
    expect(
      screen.getByText("Equipe ToyotaTech · 22/11/2026 · 4 min de leitura")
    ).toBeTruthy();
    expect(screen.getByText("Resumo do conteúdo.")).toBeTruthy();
    expect(screen.getByText("Primeiro parágrafo.")).toBeTruthy();
    expect(screen.getByText("Segundo parágrafo.")).toBeTruthy();
  });

  it("mostra skeleton enquanto carrega", async () => {
    mockFetchContentDetail.mockReturnValue(
      new Promise<ContentDetailResponse>(() => {})
    );
    const screen = await render(<ContentDetailScreen />);

    expect(screen.getByLabelText("Carregando conteúdo")).toBeTruthy();
  });

  it("mostra erro e permite tentar novamente", async () => {
    mockFetchContentDetail.mockRejectedValue(
      new ApiError("Conteúdo não encontrado.", 404)
    );
    const screen = await render(<ContentDetailScreen />);

    await waitFor(() =>
      expect(screen.getByText("Conteúdo indisponível")).toBeTruthy()
    );
    expect(screen.getByText("Conteúdo não encontrado.")).toBeTruthy();

    mockFetchContentDetail.mockResolvedValue(detail);
    await fireEvent.press(screen.getByText("Tentar novamente"));

    await waitFor(() =>
      expect(screen.getByText("Novidade da API")).toBeTruthy()
    );
  });
});
