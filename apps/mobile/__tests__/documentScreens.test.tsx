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
import GarantiaToyotaScreen from "@/app/garantia-toyota";
import ManualDoVeiculoScreen from "@/app/manual-do-veiculo";
import NotaFiscalScreen from "@/app/nota-fiscal";

const mockPush = jest.fn<(path: string) => void>();
const mockReplace = jest.fn<(path: string) => void>();
const mockBack = jest.fn<() => void>();
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

  it("mostra o status de excecao na lista e navega para o CRLV-e", async () => {
    const screen = await render(<VehicleManagementScreen />);

    expect(screen.getByText("Pendente")).toBeTruthy();
    expect(screen.queryByText("Disponível")).toBeNull();

    await fireEvent.press(screen.getByLabelText("CRLV-e"));

    expect(mockPush).toHaveBeenCalledWith("/crlv");
  });

  it("nao renderiza badge quando os documentos estao disponiveis", async () => {
    setGarage(
      buildGarage([
        buildDocument({
          id: "invoice",
          title: "Nota fiscal",
          status: "available",
        }),
      ])
    );
    const screen = await render(<VehicleManagementScreen />);

    expect(screen.queryByText("Disponível")).toBeNull();
    expect(screen.queryByText("Pendente")).toBeNull();
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
    const reload = mockGarageValue.reload;
    const openSpy = jest
      .spyOn(Linking, "openURL")
      .mockResolvedValue(true as never);
    const screen = await render(<CrlvScreen />);

    expect(reload).toHaveBeenCalled();
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

describe("NotaFiscalScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
  });

  it("navega da lista para a nota fiscal", async () => {
    setGarage(
      buildGarage([buildDocument({ id: "invoice", title: "Nota fiscal" })])
    );
    const screen = await render(<VehicleManagementScreen />);

    await fireEvent.press(screen.getByLabelText("Nota fiscal"));

    expect(mockPush).toHaveBeenCalledWith("/nota-fiscal");
  });

  it("mostra os dados da compra e nenhuma acao sem arquivo digital", async () => {
    const openSpy = jest.spyOn(Linking, "openURL");
    setGarage(
      buildGarage([buildDocument({ id: "invoice", title: "Nota fiscal" })])
    );
    const screen = await render(<NotaFiscalScreen />);

    expect(screen.getByText("Disponível")).toBeTruthy();
    expect(screen.getByText("TT-1")).toBeTruthy();
    expect(screen.getByText("Concessionária Toyota")).toBeTruthy();
    expect(
      screen.getByText(
        "A versão digital deste documento não está disponível neste ambiente."
      )
    ).toBeTruthy();
    expect(screen.queryByText("Visualizar documento")).toBeNull();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("abre a url quando a nota fiscal tem arquivo digital", async () => {
    const openSpy = jest
      .spyOn(Linking, "openURL")
      .mockResolvedValue(true as never);
    setGarage(
      buildGarage([
        buildDocument({
          id: "invoice",
          title: "Nota fiscal",
          url: "https://example.com/nota-fiscal.pdf",
        }),
      ])
    );
    const screen = await render(<NotaFiscalScreen />);

    await fireEvent.press(screen.getByText("Visualizar documento"));

    expect(openSpy).toHaveBeenCalledWith("https://example.com/nota-fiscal.pdf");
  });

  it("mostra aviso quando nao foi possivel abrir o documento", async () => {
    const openSpy = jest
      .spyOn(Linking, "openURL")
      .mockRejectedValueOnce(new Error("open failed") as never);
    setGarage(
      buildGarage([
        buildDocument({
          id: "invoice",
          title: "Nota fiscal",
          url: "https://example.com/nota-fiscal.pdf",
        }),
      ])
    );
    const screen = await render(<NotaFiscalScreen />);

    await fireEvent.press(screen.getByText("Visualizar documento"));

    expect(
      await screen.findByText("Não foi possível abrir o documento.")
    ).toBeTruthy();
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Visualizar documento")).toBeTruthy();
  });

  it("bloqueia a acao enquanto a nota fiscal esta pendente", async () => {
    setGarage(
      buildGarage([
        buildDocument({
          id: "invoice",
          title: "Nota fiscal",
          status: "pending",
        }),
      ])
    );
    const screen = await render(<NotaFiscalScreen />);

    expect(screen.getByText("Pendente")).toBeTruthy();
    expect(screen.getByText(/está em processamento/)).toBeTruthy();
    expect(screen.queryByText("Visualizar documento")).toBeNull();
  });

  it("mostra estado de carregamento com dimensao fixa", async () => {
    setGarage(null, true);
    const screen = await render(<NotaFiscalScreen />);

    expect(screen.getByLabelText("Carregando nota fiscal")).toBeTruthy();
  });

  it("mostra indisponivel quando o documento nao existe", async () => {
    setGarage(buildGarage([]));
    const screen = await render(<NotaFiscalScreen />);

    expect(screen.getByText("Nota fiscal indisponível")).toBeTruthy();
  });
});

describe("GarantiaToyotaScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockBack.mockReset();
    mockCanGoBack = true;
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
    mockCanGoBack = true;
  });

  it("navega da lista para a garantia toyota", async () => {
    setGarage(
      buildGarage([buildDocument({ id: "warranty", title: "Garantia Toyota" })])
    );
    const screen = await render(<VehicleManagementScreen />);

    await fireEvent.press(screen.getByLabelText("Garantia Toyota"));

    expect(mockPush).toHaveBeenCalledWith("/garantia-toyota");
  });

  it("exibe dados da compra, pedido e veiculo", async () => {
    setGarage(
      buildGarage([buildDocument({ id: "warranty", title: "Garantia Toyota" })])
    );
    const screen = await render(<GarantiaToyotaScreen />);

    expect(screen.getByText("Data da compra")).toBeTruthy();
    expect(screen.getByText("03/10/2025")).toBeTruthy();
    expect(screen.getByText("TT-1")).toBeTruthy();
    expect(screen.getByText("Concessionária Toyota")).toBeTruthy();
    expect(screen.getByText("Corolla")).toBeTruthy();
    expect(screen.getByText("CHASSI_12345")).toBeTruthy();
  });

  it("declara vigencia e cobertura indisponiveis", async () => {
    setGarage(
      buildGarage([buildDocument({ id: "warranty", title: "Garantia Toyota" })])
    );
    const screen = await render(<GarantiaToyotaScreen />);

    expect(
      screen.getByText(/itens de cobertura da garantia ainda não/)
    ).toBeTruthy();
  });

  it("nao sugere garantia ativa ou expirada", async () => {
    setGarage(
      buildGarage([buildDocument({ id: "warranty", title: "Garantia Toyota" })])
    );
    const screen = await render(<GarantiaToyotaScreen />);

    expect(screen.getByText("Disponível")).toBeTruthy();
    expect(screen.queryByText("Ativa")).toBeNull();
    expect(screen.queryByText("Expirada")).toBeNull();
    expect(screen.queryByText(/dias restantes/)).toBeNull();
  });

  it("exibe aviso de processamento quando o termo esta pendente", async () => {
    setGarage(
      buildGarage([
        buildDocument({
          id: "warranty",
          title: "Garantia Toyota",
          status: "pending",
        }),
      ])
    );
    const screen = await render(<GarantiaToyotaScreen />);

    expect(screen.getByText("Pendente")).toBeTruthy();
    expect(screen.getByText(/está em processamento/)).toBeTruthy();
    expect(screen.queryByText("Visualizar termo")).toBeNull();
  });

  it("exibe aviso quando o termo digital nao esta disponivel", async () => {
    setGarage(
      buildGarage([buildDocument({ id: "warranty", title: "Garantia Toyota" })])
    );
    const screen = await render(<GarantiaToyotaScreen />);

    expect(
      screen.getByText(
        "A versão digital deste termo não está disponível neste ambiente."
      )
    ).toBeTruthy();
    expect(screen.queryByText("Visualizar termo")).toBeNull();
  });

  it("abre o termo externo ao tocar em visualizar", async () => {
    const openSpy = jest
      .spyOn(Linking, "openURL")
      .mockResolvedValue(true as never);
    setGarage(
      buildGarage([
        buildDocument({
          id: "warranty",
          title: "Garantia Toyota",
          url: "https://example.com/termo-garantia.pdf",
        }),
      ])
    );
    const screen = await render(<GarantiaToyotaScreen />);

    await fireEvent.press(screen.getByText("Visualizar termo"));

    expect(openSpy).toHaveBeenCalledWith(
      "https://example.com/termo-garantia.pdf"
    );
  });

  it("exibe erro quando a abertura do termo falha", async () => {
    const openSpy = jest
      .spyOn(Linking, "openURL")
      .mockRejectedValueOnce(new Error("open failed") as never);
    setGarage(
      buildGarage([
        buildDocument({
          id: "warranty",
          title: "Garantia Toyota",
          url: "https://example.com/termo-garantia.pdf",
        }),
      ])
    );
    const screen = await render(<GarantiaToyotaScreen />);

    await fireEvent.press(screen.getByText("Visualizar termo"));

    expect(
      await screen.findByText("Não foi possível abrir o documento.")
    ).toBeTruthy();
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Visualizar termo")).toBeTruthy();
  });

  it("exibe indisponibilidade quando nao ha termo do veiculo", async () => {
    setGarage(buildGarage([]));
    const screen = await render(<GarantiaToyotaScreen />);

    expect(screen.getByText("Termo de garantia indisponível")).toBeTruthy();
    expect(screen.getByText("Voltar")).toBeTruthy();
  });

  it("retorna para gestao do veiculo sem pilha de navegacao", async () => {
    mockCanGoBack = false;
    setGarage(
      buildGarage([buildDocument({ id: "warranty", title: "Garantia Toyota" })])
    );
    const screen = await render(<GarantiaToyotaScreen />);

    await fireEvent.press(screen.getByLabelText("Voltar"));

    expect(mockReplace).toHaveBeenCalledWith("/vehicle-management");
  });

  it("retorna para a tela anterior quando existe pilha de navegacao", async () => {
    mockCanGoBack = true;
    setGarage(
      buildGarage([buildDocument({ id: "warranty", title: "Garantia Toyota" })])
    );
    const screen = await render(<GarantiaToyotaScreen />);

    await fireEvent.press(screen.getByLabelText("Voltar"));

    expect(mockBack).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("recarrega a garagem ao carregar a tela", async () => {
    setGarage(
      buildGarage([buildDocument({ id: "warranty", title: "Garantia Toyota" })])
    );
    const reload = mockGarageValue.reload;

    await render(<GarantiaToyotaScreen />);

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("exibe skeleton no carregamento inicial", async () => {
    setGarage(null, true);
    const screen = await render(<GarantiaToyotaScreen />);

    expect(screen.getByLabelText("Carregando garantia")).toBeTruthy();
  });
});

describe("ManualDoVeiculoScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockBack.mockReset();
    mockCanGoBack = true;
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanup();
    jest.restoreAllMocks();
    mockCanGoBack = true;
  });

  it("navega da lista para o manual do veiculo", async () => {
    setGarage(
      buildGarage([buildDocument({ id: "manual", title: "Manual do Corolla" })])
    );
    const screen = await render(<VehicleManagementScreen />);

    await fireEvent.press(screen.getByLabelText("Manual do Corolla"));

    expect(mockPush).toHaveBeenCalledWith("/manual-do-veiculo");
  });

  it("exibe o titulo com o modelo real do veiculo", async () => {
    setGarage(
      buildGarage([buildDocument({ id: "manual", title: "Manual do Corolla" })])
    );
    const screen = await render(<ManualDoVeiculoScreen />);

    expect(screen.getAllByText("Manual do Corolla").length).toBeGreaterThan(0);
    expect(screen.getByText("Corolla")).toBeTruthy();
    expect(screen.getByText("XEI")).toBeTruthy();
  });

  it("exibe aviso de processamento quando o manual esta pendente", async () => {
    setGarage(
      buildGarage([
        buildDocument({
          id: "manual",
          title: "Manual do Corolla",
          status: "pending",
        }),
      ])
    );
    const screen = await render(<ManualDoVeiculoScreen />);

    expect(screen.getByText("Pendente")).toBeTruthy();
    expect(screen.getByText(/está em processamento/)).toBeTruthy();
  });

  it("exibe mensagem clara quando o conteudo ainda nao foi publicado", async () => {
    setGarage(
      buildGarage([buildDocument({ id: "manual", title: "Manual do Corolla" })])
    );
    const screen = await render(<ManualDoVeiculoScreen />);

    expect(
      screen.getByText(/capítulos e a busca por assunto ainda não/)
    ).toBeTruthy();
  });

  it("nao exibe campo de busca nem capitulos sem conteudo", async () => {
    setGarage(
      buildGarage([buildDocument({ id: "manual", title: "Manual do Corolla" })])
    );
    const screen = await render(<ManualDoVeiculoScreen />);

    expect(screen.queryByPlaceholderText(/buscar/i)).toBeNull();
    expect(screen.queryByText(/Capítulo 1/)).toBeNull();
  });

  it("exibe mensagem clara quando o veiculo nao possui manual", async () => {
    setGarage(buildGarage([]));
    const screen = await render(<ManualDoVeiculoScreen />);

    expect(screen.getByText("Manual indisponível")).toBeTruthy();
    expect(screen.getByText("Voltar")).toBeTruthy();
  });

  it("volta para a gestao do veiculo quando nao ha historico", async () => {
    mockCanGoBack = false;
    setGarage(
      buildGarage([buildDocument({ id: "manual", title: "Manual do Corolla" })])
    );
    const screen = await render(<ManualDoVeiculoScreen />);

    await fireEvent.press(screen.getByLabelText("Voltar"));

    expect(mockReplace).toHaveBeenCalledWith("/vehicle-management");
  });

  it("retorna pelo historico quando ha navegacao anterior", async () => {
    setGarage(
      buildGarage([buildDocument({ id: "manual", title: "Manual do Corolla" })])
    );
    const screen = await render(<ManualDoVeiculoScreen />);

    await fireEvent.press(screen.getByLabelText("Voltar"));

    expect(mockBack).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("exibe skeletons fixos durante o carregamento", async () => {
    setGarage(null, true);
    const screen = await render(<ManualDoVeiculoScreen />);

    expect(screen.getByLabelText("Carregando manual")).toBeTruthy();
  });
});
