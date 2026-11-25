/* eslint-disable @typescript-eslint/no-require-imports */
import VehicleManagementScreen from "@/app/(tabs)/vehicle-management";
import RecallDetailScreen from "@/app/recall/[id]";
import type { GarageData, GarageRecall } from "@/types/garage";
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
const mockReplace = jest.fn<(path: string) => void>();
const mockBack = jest.fn<() => void>();
let mockCanGoBack = true;
let mockRouteParams: { id?: string } = { id: "recall-1" };

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
    back: mockBack,
    canGoBack: () => mockCanGoBack,
  }),
  useLocalSearchParams: () => mockRouteParams,
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

function buildGarage(recalls: GarageRecall[]): GarageData {
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
    documents: [
      {
        id: "crlv",
        title: "CRLV-e",
        date: "03/10/2025",
        status: "available",
      },
    ],
    recalls,
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

function buildRecall(overrides: Partial<GarageRecall> = {}): GarageRecall {
  return {
    id: "recall-1",
    title: "Campanha airbag Takata",
    description: "Substituição do módulo do airbag.",
    status: "open",
    severity: "Alta",
    dealership: "Concessionária Toyota",
    ...overrides,
  };
}

function setGarage(
  garage: GarageData | null,
  isLoading = false,
  error: string | null = null
) {
  mockGarageValue = {
    garage,
    isLoading,
    error,
    reload: jest.fn(),
  };
}

describe("RecallDetailScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockBack.mockReset();
    mockCanGoBack = true;
    mockRouteParams = { id: "recall-1" };
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
  });

  it("mostra skeleton de altura fixa no carregamento", async () => {
    setGarage(null, true);

    const screen = await render(<RecallDetailScreen />);
    const skeleton = screen.getByLabelText("Carregando detalhes do recall");

    expect(StyleSheet.flatten(skeleton.props.style).height).toBe(160);
  });

  it("exibe campanha aberta e orienta o agendamento", async () => {
    setGarage(buildGarage([buildRecall()]));

    const screen = await render(<RecallDetailScreen />);

    expect(screen.getByText("Campanha airbag Takata")).toBeTruthy();
    expect(screen.getByText("Substituição do módulo do airbag.")).toBeTruthy();
    expect(screen.getByText("Aberta")).toBeTruthy();
    expect(screen.getByText("Alta")).toBeTruthy();
    expect(screen.getByText("Concessionária Toyota")).toBeTruthy();

    await fireEvent.press(screen.getByText("Agendar reparo"));

    expect(
      screen.getByText(/Concessionária Toyota e informe o chassi CHASSI_12345/)
    ).toBeTruthy();
  });

  it("exibe o aviso de gravidade ausente quando a campanha nao informa severidade", async () => {
    setGarage(buildGarage([buildRecall({ severity: undefined })]));

    const screen = await render(<RecallDetailScreen />);

    expect(screen.getByText("Gravidade não informada")).toBeTruthy();
    expect(screen.queryByText("Alta")).toBeNull();
    expect(screen.getByText("Aberta")).toBeTruthy();
  });

  it("exibe campanha concluida sem acao de agendamento", async () => {
    setGarage(buildGarage([buildRecall({ status: "completed" })]));

    const screen = await render(<RecallDetailScreen />);

    expect(screen.getByText("Concluída")).toBeTruthy();
    expect(
      screen.getByText("Reparo executado. Nenhuma ação é necessária.")
    ).toBeTruthy();
    expect(screen.queryByText("Agendar reparo")).toBeNull();
  });

  it("trata status ausente como campanha aberta", async () => {
    setGarage(buildGarage([buildRecall({ status: undefined })]));

    const screen = await render(<RecallDetailScreen />);

    expect(screen.getByText("Aberta")).toBeTruthy();
  });

  it("trata status desconhecido como campanha aberta", async () => {
    setGarage(buildGarage([buildRecall({ status: "in_progress" })]));

    const screen = await render(<RecallDetailScreen />);

    expect(screen.getByText("Aberta")).toBeTruthy();
  });

  it("exibe estado sem campanha e volta", async () => {
    mockRouteParams = { id: "recall-inexistente" };
    setGarage(buildGarage([buildRecall()]));

    const screen = await render(<RecallDetailScreen />);

    expect(screen.getByText("Campanha de recall indisponível")).toBeTruthy();

    await fireEvent.press(screen.getByText("Voltar"));

    expect(mockBack).toHaveBeenCalled();
  });

  it("volta para a gestao quando nao ha historico", async () => {
    mockCanGoBack = false;
    mockRouteParams = { id: "recall-inexistente" };
    setGarage(buildGarage([buildRecall()]));

    const screen = await render(<RecallDetailScreen />);

    await fireEvent.press(screen.getByText("Voltar"));

    expect(mockReplace).toHaveBeenCalledWith("/vehicle-management");
  });
});

describe("VehicleManagementScreen recalls", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockBack.mockReset();
    mockCanGoBack = true;
    setGarage(
      buildGarage([
        buildRecall(),
        buildRecall({
          id: "recall-2",
          title: "Campanha cinto de seguranca",
          status: "completed",
        }),
      ])
    );
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
  });

  it("mostra badges e navega para o detalhe da campanha", async () => {
    const screen = await render(<VehicleManagementScreen />);

    expect(screen.getByText("Aberta")).toBeTruthy();
    expect(screen.getByText("Concluída")).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("Campanha airbag Takata"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/recall/[id]",
      params: { id: "recall-1" },
    });
  });

  it("mantem o estado vazio e os documentos sem recalls", async () => {
    setGarage(buildGarage([]));

    const screen = await render(<VehicleManagementScreen />);

    expect(screen.getByText("Programas de recall")).toBeTruthy();
    expect(screen.getByText("Nenhum recall registrado.")).toBeTruthy();
    expect(screen.getByText("CRLV-e")).toBeTruthy();
    expect(screen.queryByText("Aberta")).toBeNull();
    expect(screen.queryByText("Concluída")).toBeNull();
  });
});
