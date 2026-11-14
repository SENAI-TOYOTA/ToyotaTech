/* eslint-disable @typescript-eslint/no-require-imports */
import { GarageData } from "@/types/garage";
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
import { Share } from "react-native";

import FinancingScreen from "@/app/(tabs)/financing";
import BoletoScreen from "@/app/boleto";

const mockPush = jest.fn<(path: string) => void>();

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
let mockGarageValue: {
  garage: GarageData | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
};

jest.mock("lucide-react-native", () => {
  const { View } = require("react-native");

  return {
    ArrowLeft: () => <View />,
    ArrowRight: () => <View />,
    Share2: () => <View />,
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

jest.mock("@/hooks/useGarage", () => ({
  useGarage: () => mockGarageValue,
}));

const BARCODE = "1".repeat(47);
const FORMATTED = "11111.11111 11111.111111 11111.111111 1 11111111111111";

function buildGarage(boletoBarcode: string | undefined): GarageData {
  return {
    userId: "user-1",
    order: {
      orderId: "TT-1",
      status: "linked",
      purchaseDate: "",
      dealership: "",
    },
    vehicle: {
      vehicleId: "1",
      model: "Corolla",
      version: "XEI",
      color: "Branco",
      year: "2025",
      engine: "2.0",
      chassi: "CHASSI_123",
    },
    financing: {
      bank: "Banco Toyota",
      contractNumber: "FIN-1",
      paidInstallments: 1,
      totalInstallments: 10,
      installmentAmount: "R$ 1.000,00",
      nextDueDate: "10/12/2026",
      boletoAvailable: true,
      boletoBarcode,
    },
    documents: [],
    recalls: [],
    tracking: {
      vehicleId: "1",
      model: "Corolla",
      currentStepIndex: 0,
      steps: [],
    },
    createdAt: 1,
    updatedAt: 1,
  } as unknown as GarageData;
}

function setGarage(garage: GarageData | null) {
  mockGarageValue = {
    garage,
    isLoading: false,
    error: null,
    reload: jest.fn(),
  };
}

describe("BoletoScreen", () => {
  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    mockPush.mockReset();
    setGarage(buildGarage(BARCODE));
  });

  it("exibe a linha digitavel formatada e o aviso de demonstracao", async () => {
    const screen = await render(<BoletoScreen />);

    expect(screen.getByText(FORMATTED)).toBeTruthy();
    expect(
      screen.getByText(
        "Linha digitável demonstrativa, sem validade para pagamento."
      )
    ).toBeTruthy();
  });

  it("mostra erro em portugues quando o compartilhamento falha", async () => {
    jest.spyOn(Share, "share").mockRejectedValue(new Error("not supported"));
    const screen = await render(<BoletoScreen />);

    await fireEvent.press(screen.getByText("Compartilhar"));

    await waitFor(() => {
      expect(
        screen.getByText("Não foi possível compartilhar a linha digitável.")
      ).toBeTruthy();
    });
  });

  it("mostra indisponivel quando a linha digitavel e invalida", async () => {
    setGarage(buildGarage("123"));
    const screen = await render(<BoletoScreen />);

    expect(screen.getByText("Boleto indisponível")).toBeTruthy();
    expect(screen.queryByText("Compartilhar")).toBeNull();
  });
});

describe("FinancingScreen", () => {
  afterEach(async () => {
    await cleanup();
  });

  beforeEach(() => {
    mockPush.mockReset();
  });

  it("habilita o boleto e navega quando o codigo e valido", async () => {
    setGarage(buildGarage(BARCODE));
    const screen = await render(<FinancingScreen />);
    const button = screen.getByLabelText("Acessar boleto");

    expect(button.props.accessibilityState.disabled).toBe(false);
    await fireEvent.press(button);
    expect(mockPush).toHaveBeenCalledWith("/boleto");
  });

  it("desabilita o boleto quando a garagem legada nao tem codigo", async () => {
    setGarage(buildGarage(undefined));
    const screen = await render(<FinancingScreen />);
    const button = screen.getByLabelText("Acessar boleto");

    expect(button.props.accessibilityState.disabled).toBe(true);
    expect(
      screen.getByText(
        "O boleto não está disponível para este contrato no momento."
      )
    ).toBeTruthy();
  });
});
