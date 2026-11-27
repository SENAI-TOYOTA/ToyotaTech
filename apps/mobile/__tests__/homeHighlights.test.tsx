/* eslint-disable @typescript-eslint/no-require-imports */
import HomeScreen from "@/app/(tabs)/home";
import { spacing } from "@/theme";
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
import { StyleSheet } from "react-native";

const mockPush = jest.fn<(...args: unknown[]) => void>();

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
    ArrowRight: () => <View />,
  };
});

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  }),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      email: "maria@example.com",
      name: "Maria",
      profile: { fullName: "Maria Silva" },
    },
  }),
}));

jest.mock("@/hooks/useGarage", () => ({
  useGarage: () => ({
    garage: null,
    isLoading: false,
    error: null,
    reload: jest.fn(),
  }),
}));

let mockHighlightState: {
  highlights: HighlightItem[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
};

jest.mock("@/hooks/useHighlights", () => ({
  useHighlights: () => mockHighlightState,
}));

function setHighlights(
  highlights: HighlightItem[],
  error: string | null = null,
  isLoading = false
) {
  mockHighlightState = {
    highlights,
    isLoading,
    error,
    reload: jest.fn(),
  };
}

describe("HomeScreen novidades", () => {
  beforeEach(() => {
    setHighlights([
      { id: "api-1", title: "Novidade 1", imageKey: "corolla-main" },
      { id: "api-2", title: "Novidade 2", imageKey: "corolla-main" },
      { id: "api-3", title: "Novidade 3", imageKey: "corolla-main" },
      {
        id: "api-4",
        title: "Guia 4",
        imageKey: "corolla-main",
        categoryLabel: "MANUTENÇÃO",
        description: "Descrição do guia 4.",
      },
      { id: "api-5", title: "Guia 5", imageKey: "corolla-main" },
    ]);
  });

  afterEach(async () => {
    await cleanup();
  });

  it("renderiza as novidades recebidas da api e separa os guias", async () => {
    const screen = await render(<HomeScreen />);

    expect(screen.getByText("Novidade 1")).toBeTruthy();
    expect(screen.getByText("Novidade 2")).toBeTruthy();
    expect(screen.getByText("Novidade 3")).toBeTruthy();
    expect(screen.getByText("Guia 4")).toBeTruthy();
    expect(screen.getByText("Guia 5")).toBeTruthy();
    expect(screen.getByText("MANUTENÇÃO")).toBeTruthy();
    expect(screen.getByText("Descrição do guia 4.")).toBeTruthy();
    expect(screen.getByText("Guias e Notícias")).toBeTruthy();
  });

  it("adapta o card quando tag e descrição não existem", async () => {
    setHighlights([
      { id: "api-1", title: "Novidade 1", imageKey: "corolla-main" },
      { id: "api-2", title: "Novidade 2", imageKey: "corolla-main" },
      { id: "api-3", title: "Novidade 3", imageKey: "corolla-main" },
      {
        id: "sem-meta",
        title: "Sem metadados",
        imageKey: "corolla-main",
      },
    ]);
    const screen = await render(<HomeScreen />);

    expect(screen.getByText("Sem metadados")).toBeTruthy();
    expect(screen.queryByText("MANUTENÇÃO")).toBeNull();
  });

  it("navega para o detalhe ao tocar na novidade", async () => {
    mockPush.mockReset();
    const screen = await render(<HomeScreen />);

    await fireEvent.press(screen.getByTestId("highlight-card-api-1"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/content/[id]",
      params: { id: "api-1" },
    });
  });

  it("navega para o detalhe ao tocar em guias e notícias", async () => {
    mockPush.mockReset();
    const screen = await render(<HomeScreen />);

    await fireEvent.press(screen.getByTestId("news-card-api-4"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/content/[id]",
      params: { id: "api-4" },
    });
  });

  it("limita novidades a três e não duplica os cards na home", async () => {
    const screen = await render(<HomeScreen />);

    expect(screen.getAllByTestId(/^highlight-card-/)).toHaveLength(3);
    expect(screen.getAllByTestId(/^news-card-/)).toHaveLength(2);
    expect(screen.queryByTestId("news-card-api-1")).toBeNull();
    expect(screen.queryByTestId("highlight-card-api-4")).toBeNull();
  });

  it("mostra estado vazio explicito sem novidades", async () => {
    setHighlights([]);
    const screen = await render(<HomeScreen />);

    expect(screen.getByText("Nenhuma novidade disponível.")).toBeTruthy();
  });

  it("mostra erro e permite tentar novamente", async () => {
    setHighlights([], "Não foi possível carregar as novidades.");
    const screen = await render(<HomeScreen />);

    expect(
      screen.getByText("Não foi possível carregar as novidades.")
    ).toBeTruthy();
    expect(screen.getByText("Tentar novamente")).toBeTruthy();
  });

  it("mostra três skeletons de dimensao fixa no carregamento", async () => {
    setHighlights([], null, true);
    const screen = await render(<HomeScreen />);
    const skeletons =
      screen.root?.queryAll((node) => {
        const style = StyleSheet.flatten(node.props.style);
        return style?.height === 180 && style?.width === 180;
      }) ?? [];

    expect(skeletons).toHaveLength(3);
    expect(screen.getByLabelText("Carregando novidades")).toBeTruthy();
  });

  it("amplia a area de toque do botao de tentar novamente", async () => {
    setHighlights([], "Não foi possível carregar as novidades.");
    const screen = await render(<HomeScreen />);
    const retryPressable = screen.getByText("Tentar novamente").parent;

    expect(retryPressable?.props.hitSlop).toEqual({
      top: spacing.md,
      bottom: spacing.md,
      left: spacing.md,
      right: spacing.md,
    });
  });

  it("navega para a listagem ao tocar em ver todos", async () => {
    const screen = await render(<HomeScreen />);

    await fireEvent.press(screen.getByLabelText("Ver todos"));

    expect(mockPush).toHaveBeenCalledWith("/content");
  });
});
