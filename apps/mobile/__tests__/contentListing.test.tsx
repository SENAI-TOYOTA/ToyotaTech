/* eslint-disable @typescript-eslint/no-require-imports */
import ContentListingScreen from "@/app/content/index";
import { CONTENT_PAGE_SIZE } from "@/hooks/useContentListing";
import type { ContentSort, ContentType, HighlightItem } from "@/types/content";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

const mockPush = jest.fn<(...args: unknown[]) => void>();
const mockReplace = jest.fn<(...args: unknown[]) => void>();
let mockCanGoBack = true;

jest.mock("react-native-reanimated", () => {
  const RN = require("react-native");
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
  };
});

jest.mock("lucide-react-native", () => {
  const { View } = require("react-native");

  return {
    ArrowLeft: () => <View />,
    ArrowUpDown: () => <View />,
  };
});

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    canGoBack: () => mockCanGoBack,
  }),
}));

jest.mock("@/components/ui/Screen", () => {
  const { Pressable, View } = require("react-native");

  function MockScreen({
    children,
    header,
    onRefresh,
  }: {
    children: unknown;
    header?: unknown;
    onRefresh?: () => void;
  }) {
    return (
      <View>
        {header}
        <Pressable accessibilityLabel="Atualizar" onPress={onRefresh} />
        {children}
      </View>
    );
  }

  return { __esModule: true, default: MockScreen };
});

interface MockListingParams {
  type?: ContentType;
  category?: string;
  query?: string;
  sort?: ContentSort;
}

interface MockListingState {
  highlights: HighlightItem[];
  categories: string[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  reload: jest.Mock;
  loadMore: jest.Mock;
}

let mockListingParams: MockListingParams = {};
let mockListingState: MockListingState;

jest.mock("@/hooks/useContentListing", () => ({
  CONTENT_PAGE_SIZE: 4,
  useContentListing: (params: MockListingParams) => {
    mockListingParams = params;
    return mockListingState;
  },
}));

const corolla: HighlightItem = {
  id: "corolla",
  title: "Corolla Altis",
  imageKey: "corolla-main",
  category: "guide",
  categoryLabel: "LANÇAMENTO",
};
const yaris: HighlightItem = {
  id: "yaris",
  title: "Yaris Cross",
  imageKey: "yaris-cross",
  category: "guide",
  categoryLabel: "SUV COMPACTO",
};

function setListing(overrides: Partial<MockListingState> = {}) {
  mockListingState = {
    highlights: [corolla, yaris],
    categories: ["LANÇAMENTO", "SUV COMPACTO"],
    total: 2,
    hasMore: false,
    isLoading: false,
    isRefreshing: false,
    isLoadingMore: false,
    error: null,
    reload: jest.fn(),
    loadMore: jest.fn(),
    ...overrides,
  };
}

describe("ContentListingScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockListingParams = {};
    setListing();
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
    jest.useRealTimers();
    mockCanGoBack = true;
  });

  it("exibe os itens e a contagem de resultados", async () => {
    const screen = await render(<ContentListingScreen />);

    expect(screen.getByText("Corolla Altis")).toBeTruthy();
    expect(screen.getByText("Yaris Cross")).toBeTruthy();
    expect(screen.getByText("2 resultados")).toBeTruthy();
  });

  it("filtra por tipo ao tocar no chip", async () => {
    const screen = await render(<ContentListingScreen />);

    await fireEvent.press(screen.getByLabelText("Guias"));

    expect(mockListingParams.type).toBe("guide");
  });

  it("filtra por categoria ao tocar no chip", async () => {
    const screen = await render(<ContentListingScreen />);

    await fireEvent.press(screen.getByLabelText("LANÇAMENTO"));

    expect(mockListingParams.category).toBe("LANÇAMENTO");
  });

  it("alterna a ordenacao entre recentes e antigos", async () => {
    const screen = await render(<ContentListingScreen />);

    await fireEvent.press(screen.getByLabelText("Mais recentes"));

    expect(mockListingParams.sort).toBe("oldest");
    expect(screen.getByText("Mais antigos")).toBeTruthy();
  });

  it("aplica debounce na busca", async () => {
    jest.useFakeTimers();
    const screen = await render(<ContentListingScreen />);

    await fireEvent.changeText(
      screen.getByPlaceholderText("Título ou resumo do guia ou notícia"),
      "corolla"
    );

    expect(mockListingParams.query).toBeUndefined();

    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    expect(mockListingParams.query).toBe("corolla");
  });

  it("carrega mais ao tocar no botao", async () => {
    setListing({ hasMore: true });
    const screen = await render(<ContentListingScreen />);

    await fireEvent.press(screen.getByLabelText("Carregar mais"));

    expect(mockListingState.loadMore).toHaveBeenCalled();
  });

  it("nao exibe carregar mais no fim da lista", async () => {
    const screen = await render(<ContentListingScreen />);

    expect(screen.queryByText("Carregar mais")).toBeNull();
  });

  it("recarrega ao puxar para atualizar", async () => {
    const screen = await render(<ContentListingScreen />);

    await fireEvent.press(screen.getByLabelText("Atualizar"));

    expect(mockListingState.reload).toHaveBeenCalled();
  });

  it("navega para o detalhe ao tocar no item", async () => {
    const screen = await render(<ContentListingScreen />);

    await fireEvent.press(screen.getByLabelText("Corolla Altis"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/content/[id]",
      params: { id: "corolla" },
    });
  });

  it("exibe erro com acao de tentar novamente", async () => {
    setListing({
      highlights: [],
      categories: [],
      total: 0,
      error: "Falha ao carregar.",
    });
    const screen = await render(<ContentListingScreen />);

    expect(screen.getByText("Falha ao carregar.")).toBeTruthy();
    await fireEvent.press(screen.getByText("Tentar novamente"));

    expect(mockListingState.reload).toHaveBeenCalled();
  });

  it("exibe estado vazio sem filtros", async () => {
    setListing({ highlights: [], categories: [], total: 0 });
    const screen = await render(<ContentListingScreen />);

    expect(screen.getByText("Nenhum guia ou notícia disponível.")).toBeTruthy();
    expect(screen.queryByText("Limpar filtros")).toBeNull();
  });

  it("exibe estado vazio com filtros e limpa", async () => {
    setListing({ highlights: [], categories: [], total: 0 });
    const screen = await render(<ContentListingScreen />);

    await fireEvent.press(screen.getByLabelText("Guias"));

    expect(
      screen.getByText("Nenhum resultado para os filtros selecionados.")
    ).toBeTruthy();
    await fireEvent.press(screen.getByText("Limpar filtros"));

    expect(mockListingParams.type).toBeUndefined();
  });

  it("exibe skeleton com um unico rotulo de acessibilidade", async () => {
    setListing({ highlights: [], categories: [], total: 0, isLoading: true });
    const screen = await render(<ContentListingScreen />);
    const skeletons =
      screen.root?.queryAll((node) => {
        const style = StyleSheet.flatten(node.props.style);
        return style?.height === 94;
      }) ?? [];

    expect(skeletons).toHaveLength(CONTENT_PAGE_SIZE);
    expect(screen.getByLabelText("Carregando guias e notícias")).toBeTruthy();
  });
});
