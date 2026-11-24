/* eslint-disable @typescript-eslint/no-require-imports */
import ContentListingScreen from "@/app/content/index";
import { HighlightItem } from "@/types/content";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { cleanup, fireEvent, render } from "@testing-library/react-native";

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
  };
});

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

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    canGoBack: () => mockCanGoBack,
  }),
}));

let mockHighlightsState: {
  highlights: HighlightItem[];
  isLoading: boolean;
  error: string | null;
  reload: jest.Mock;
};

jest.mock("@/hooks/useHighlights", () => ({
  useHighlights: () => mockHighlightsState,
}));

function setHighlights(
  highlights: HighlightItem[],
  isLoading = false,
  error: string | null = null
) {
  mockHighlightsState = {
    highlights,
    isLoading,
    error,
    reload: jest.fn(),
  };
}

const corolla: HighlightItem = {
  id: "corolla",
  title: "Corolla Altis",
  imageKey: "corolla-main",
};

const yaris: HighlightItem = {
  id: "yaris",
  title: "Yaris Cross",
  imageKey: "yaris-cross",
};

describe("ContentListingScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    setHighlights([corolla, yaris]);
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
    mockCanGoBack = true;
  });

  it("exibe os itens da listagem", async () => {
    const screen = await render(<ContentListingScreen />);

    expect(screen.getByText("Corolla Altis")).toBeTruthy();
    expect(screen.getByText("Yaris Cross")).toBeTruthy();
  });

  it("filtra por titulo sem diferenciar maiusculas", async () => {
    const screen = await render(<ContentListingScreen />);

    await fireEvent.changeText(
      screen.getByPlaceholderText("Título do guia ou notícia"),
      "corolla"
    );

    expect(screen.getByText("Corolla Altis")).toBeTruthy();
    expect(screen.queryByText("Yaris Cross")).toBeNull();
  });

  it("exibe estado vazio com o termo buscado", async () => {
    const screen = await render(<ContentListingScreen />);

    await fireEvent.changeText(
      screen.getByPlaceholderText("Título do guia ou notícia"),
      "sedan"
    );

    expect(screen.getByText('Nenhum resultado para "sedan".')).toBeTruthy();
    expect(screen.getByText("Limpar busca")).toBeTruthy();
  });

  it("limpar busca restaura a lista completa", async () => {
    const screen = await render(<ContentListingScreen />);

    await fireEvent.changeText(
      screen.getByPlaceholderText("Título do guia ou notícia"),
      "sedan"
    );
    await fireEvent.press(screen.getByText("Limpar busca"));

    expect(screen.getByText("Corolla Altis")).toBeTruthy();
    expect(screen.getByText("Yaris Cross")).toBeTruthy();
  });

  it("navega para o detalhe ao tocar no item", async () => {
    const screen = await render(<ContentListingScreen />);

    await fireEvent.press(screen.getByLabelText("Corolla Altis"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/content/[id]",
      params: { id: "corolla" },
    });
  });

  it("exibe estado vazio quando nao ha itens", async () => {
    setHighlights([]);
    const screen = await render(<ContentListingScreen />);

    expect(screen.getByText("Nenhum guia ou notícia disponível.")).toBeTruthy();
  });

  it("recarrega ao puxar para atualizar", async () => {
    const screen = await render(<ContentListingScreen />);
    await fireEvent.press(screen.getByLabelText("Atualizar"));

    expect(mockHighlightsState.reload).toHaveBeenCalled();
  });

  it("exibe erro com acao de tentar novamente", async () => {
    setHighlights([], false, "Não foi possível carregar as novidades.");
    const screen = await render(<ContentListingScreen />);

    expect(
      screen.getByText("Não foi possível carregar as novidades.")
    ).toBeTruthy();
    await fireEvent.press(screen.getByText("Tentar novamente"));

    expect(mockHighlightsState.reload).toHaveBeenCalled();
  });

  it("avisa sobre falha de atualizacao mantendo os itens em cache", async () => {
    setHighlights([corolla], false, "Não foi possível atualizar as novidades.");
    const screen = await render(<ContentListingScreen />);

    expect(screen.getByText("Corolla Altis")).toBeTruthy();
    expect(
      screen.getByText("Não foi possível atualizar as novidades.")
    ).toBeTruthy();
    expect(screen.queryByText("Tentar novamente")).toBeNull();
  });

  it("encontra titulos acentuados ao buscar sem acento", async () => {
    setHighlights([
      {
        id: "noticia",
        title: "Notícia de lançamento",
        imageKey: "corolla-news",
      },
    ]);
    const screen = await render(<ContentListingScreen />);

    await fireEvent.changeText(
      screen.getByPlaceholderText("Título do guia ou notícia"),
      "noticia"
    );

    expect(screen.getByText("Notícia de lançamento")).toBeTruthy();
  });

  it("volta para a home quando nao ha historico", async () => {
    mockCanGoBack = false;
    const screen = await render(<ContentListingScreen />);

    await fireEvent.press(screen.getByLabelText("Voltar"));

    expect(mockReplace).toHaveBeenCalledWith("/home");
  });

  it("exibe skeleton com um unico rotulo de acessibilidade", async () => {
    setHighlights([], true);
    const screen = await render(<ContentListingScreen />);

    expect(
      screen.getAllByLabelText("Carregando guias e notícias")
    ).toHaveLength(1);
  });
});
