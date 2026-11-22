/* eslint-disable @typescript-eslint/no-require-imports */
import { GarageData, GarageDocument } from "@/types/garage";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { cleanup, fireEvent, render } from "@testing-library/react-native";
import { Linking } from "react-native";

import VehicleManagementScreen from "@/app/(tabs)/vehicle-management";
import CrlvScreen from "@/app/crlv";

const mockPush = jest.fn<(path: string) => void>();
const mockReplace = jest.fn<(path: string) => void>();

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
    ArrowRight: () => <View />,
  };
});

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    canGoBack: () => true,
  }),
}));

let mockGarageValue: {
  garage: GarageData | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
};

jest.mock("@/hooks/useGarage", () => ({
  useGarage: () => mockGarageValue,
}));

function buildGarage(documents: GarageDocument[]): GarageData {
  return {
    userId: "user-1",
    order: {
      orderId: "TT-1",
      status: "linked",
      purchaseDate: "03/10/2025",
      dealership: "Concessionária Toyota",
    },
    vehicle: {
      vehicleId: "CHASSI_12345",
      model: "Corolla",
      version: "XEI",
      color: "Branco",
      year: "2026",
      engine: "2.0",
      chassi: "CHASSI_12345",
    },
    financing: {
      bank: "Banco Toyota",
      paidInstallments: 1,
      totalInstallments: 10,
      installmentAmount: "R$ 1.000,00",
      nextDueDate: "10/12/2026",
      boletoAvailable: false,
    },
    documents,
    recalls: [],
    tracking: {
      vehicleId: "CHASSI_12345",
      model: "Corolla",
      currentStepIndex: 0,
      steps: [],
    },
    createdAt: 1,
    updatedAt: 1,
  } as unknown as GarageData;
}

function setGarage(garage: GarageData | null, isLoading = false) {
  mockGarageValue = {
    garage,
    isLoading,
    error: null,
    reload: jest.fn(),
  };
}

function buildDocument(
  overrides: Partial<GarageDocument> = {}
): GarageDocument {
  return {
    id: "crlv",
    title: "CRLV-e",
    date: "03/10/2025",
    status: "available",
    ...overrides,
  };
}

describe("VehicleManagementScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    setGarage(
      buildGarage([
        buildDocument({ status: "pending" }),
        buildDocument({
          id: "invoice",
          title: "Nota fiscal",
          status: "available",
        }),
      ])
    );
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
  });

  it("mostra o status na lista e navega para o CRLV-e", async () => {
    const screen = await render(<VehicleManagementScreen />);

    expect(screen.getByText("Pendente")).toBeTruthy();
    expect(screen.getByText("Disponível")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("CRLV-e"));

    expect(mockPush).toHaveBeenCalledWith("/crlv");
  });
});

describe("CrlvScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
  });

  it("bloqueia a visualizacao enquanto o documento esta pendente", async () => {
    setGarage(buildGarage([buildDocument({ status: "pending" })]));
    const screen = await render(<CrlvScreen />);

    expect(screen.getByText("Pendente")).toBeTruthy();
    expect(screen.getByText(/está em processamento/)).toBeTruthy();
    expect(screen.queryByText("Visualizar documento")).toBeNull();
  });

  it("abre a url quando o documento esta disponivel", async () => {
    setGarage(
      buildGarage([buildDocument({ url: "https://example.com/crlv.pdf" })])
    );
    const openSpy = jest
      .spyOn(Linking, "openURL")
      .mockResolvedValue(true as never);
    const screen = await render(<CrlvScreen />);

    expect(screen.getByText("Disponível")).toBeTruthy();
    expect(screen.getByText("Corolla")).toBeTruthy();
    expect(screen.getByText("CHASSI_12345")).toBeTruthy();

    await fireEvent.press(screen.getByText("Visualizar documento"));

    expect(openSpy).toHaveBeenCalledWith("https://example.com/crlv.pdf");
  });

  it("avisa quando nao existe arquivo digital no ambiente", async () => {
    setGarage(buildGarage([buildDocument()]));
    const screen = await render(<CrlvScreen />);

    expect(
      screen.getByText(
        "A versão digital deste documento não está disponível neste ambiente."
      )
    ).toBeTruthy();
    expect(screen.queryByText("Visualizar documento")).toBeNull();
  });

  it("mostra estado de carregamento com dimensao fixa", async () => {
    setGarage(null, true);
    const screen = await render(<CrlvScreen />);

    expect(screen.getByLabelText("Carregando CRLV-e")).toBeTruthy();
  });

  it("mostra indisponivel quando o documento nao existe", async () => {
    setGarage(buildGarage([]));
    const screen = await render(<CrlvScreen />);

    expect(screen.getByText("CRLV-e indisponível")).toBeTruthy();
  });
});
