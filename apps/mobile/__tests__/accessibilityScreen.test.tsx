/* eslint-disable @typescript-eslint/no-require-imports */
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
import { AccessibilityInfo, Linking, Platform } from "react-native";

import AccessibilityScreen from "@/app/accessibility";

const mockBack = jest.fn<() => void>();
const mockReplace = jest.fn<(path: string) => void>();
let mockCanGoBack = true;

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
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
    back: mockBack,
    canGoBack: () => mockCanGoBack,
  }),
}));

function mockAccessibilityInfo(options?: {
  screenReader?: boolean;
  reduceMotion?: boolean;
}) {
  jest
    .spyOn(AccessibilityInfo, "isScreenReaderEnabled")
    .mockResolvedValue(options?.screenReader ?? false);
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(options?.reduceMotion ?? false);
  jest.spyOn(AccessibilityInfo, "addEventListener").mockReturnValue({
    remove: jest.fn(),
  } as never);
}

describe("AccessibilityScreen", () => {
  beforeEach(() => {
    mockCanGoBack = true;
    mockBack.mockReset();
    mockReplace.mockReset();
    mockAccessibilityInfo({ screenReader: true, reduceMotion: false });
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
  });

  it("exibe os status de acessibilidade do aparelho", async () => {
    const screen = await render(<AccessibilityScreen />);

    await waitFor(() => {
      expect(screen.getByText("Ativo")).toBeTruthy();
      expect(screen.getByText("Inativo")).toBeTruthy();
    });

    expect(
      screen.getByText(
        "Estas informações vêm do sistema operacional. O app não altera essas opções."
      )
    ).toBeTruthy();
    expect(screen.getByText("Leitor de tela")).toBeTruthy();
    expect(screen.getByText("Movimento reduzido")).toBeTruthy();
    expect(screen.getByText("Tamanho do texto")).toBeTruthy();
    expect(screen.getByText(/^\d+%$/)).toBeTruthy();
  });

  it("exibe o skeleton enquanto carrega", async () => {
    jest
      .spyOn(AccessibilityInfo, "isScreenReaderEnabled")
      .mockReturnValue(new Promise(() => {}));
    jest
      .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
      .mockReturnValue(new Promise(() => {}));
    const screen = await render(<AccessibilityScreen />);

    expect(screen.getByLabelText("Carregando acessibilidade")).toBeTruthy();
  });

  it("abre os ajustes do sistema", async () => {
    const openSettings = jest
      .spyOn(Linking, "openSettings")
      .mockResolvedValue(undefined);
    const sendIntent = jest
      .spyOn(Linking, "sendIntent")
      .mockResolvedValue(undefined);
    const screen = await render(<AccessibilityScreen />);

    await fireEvent.press(screen.getByText("Abrir ajustes do sistema"));

    if (Platform.OS === "android") {
      expect(sendIntent).toHaveBeenCalledWith(
        "android.settings.ACCESSIBILITY_SETTINGS"
      );
      return;
    }

    expect(openSettings).toHaveBeenCalled();
  });

  it("mostra indisponivel quando a leitura dos status falha", async () => {
    jest
      .spyOn(AccessibilityInfo, "isScreenReaderEnabled")
      .mockRejectedValue(new Error("failure"));
    const screen = await render(<AccessibilityScreen />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Não foi possível ler as configurações de acessibilidade do aparelho."
        )
      ).toBeTruthy();
    });
    expect(screen.getAllByText("Indisponível")).toHaveLength(2);
  });

  it("volta para a tela anterior", async () => {
    const screen = await render(<AccessibilityScreen />);

    await fireEvent.press(screen.getByLabelText("Voltar"));

    expect(mockBack).toHaveBeenCalled();
  });
});
