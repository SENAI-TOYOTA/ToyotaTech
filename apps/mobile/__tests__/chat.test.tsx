/* eslint-disable @typescript-eslint/no-require-imports */
import ChatScreen from "@/app/chat";
import type { GarageData } from "@/types/garage";
import { chatReplyDelay } from "@/utils/chat";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockUser = {
  email: "julio@example.com",
  name: "Julio",
  isVerified: true,
  profile: {
    fullName: "Julio Coronetti",
    birthDate: "01/01/1990",
    cpf: "12345678909",
  },
};

const garage: GarageData = {
  userId: "user-1",
  chassi: "CHASSI_12345",
  order: {
    orderId: "TT-12345",
    status: "linked",
    purchaseDate: "03/10/2025",
    dealership: "Concessionária Toyota",
  },
  vehicle: {
    vehicleId: "CHASSI_12345",
    model: "Toyota Corolla Altis",
    version: "Hybrid 2025",
    color: "Branco Pérola",
    year: "2025",
    engine: "1.8 Hybrid",
    chassi: "CHASSI_12345",
  },
  financing: {
    bank: "Banco Toyota do Brasil S.A",
    contractNumber: "FIN-ABC",
    paidInstallments: 12,
    totalInstallments: 48,
    installmentAmount: "R$ 2.850,00",
    nextDueDate: "05/12/2026",
    boletoAvailable: true,
    boletoBarcode: "00190500954014481606906809350314337370000000100",
  },
  documents: [
    {
      id: "invoice",
      title: "Nota fiscal",
      date: "03/10/2025",
      status: "available",
    },
    {
      id: "crlv",
      title: "CRLV-e",
      date: "03/10/2025",
      status: "available",
    },
  ],
  recalls: [],
  tracking: {
    vehicleId: "CHASSI_12345",
    model: "Toyota Corolla Altis",
    version: "Hybrid 2025",
    color: "Branco Pérola",
    year: "2025",
    engine: "1.8 Hybrid",
    currentStepIndex: 3,
    steps: [
      { id: "1", label: "Início da produção", status: "completed" },
      { id: "2", label: "Pintura", status: "completed", date: "12/05/2026" },
      {
        id: "3",
        label: "Processo de montagem",
        status: "completed",
        date: "15/05/2026",
      },
      { id: "4", label: "Aguardando o embarque", status: "current" },
      { id: "5", label: "Em trânsito", status: "pending" },
      { id: "6", label: "Saiu para entrega", status: "pending" },
    ],
  },
  createdAt: 0,
  updatedAt: 0,
};

let mockGarageState: {
  garage: GarageData | null;
  isLoading: boolean;
  error: string | null;
} = {
  garage,
  isLoading: false,
  error: null,
};

jest.mock("@/hooks/useGarage", () => ({
  useGarage: () => ({ ...mockGarageState, reload: jest.fn() }),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: mockUser }),
}));

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");

  return {
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 47, right: 0, bottom: 34, left: 0 }),
  };
});

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
    withDelay: (_delay: number, value: unknown) => value,
    withRepeat: (value: unknown) => value,
    cancelAnimation: () => undefined,
    FadeIn: chainable(),
    FadeInDown: chainable(),
  };
});

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: mockBack,
    canGoBack: () => true,
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock("lucide-react-native", () => {
  const { View } = require("react-native");

  return {
    ArrowLeft: View,
    ArrowUpRight: View,
    Send: View,
  };
});

jest.mock("react-native-svg", () => {
  const { View } = require("react-native");

  return {
    Circle: View,
    Defs: View,
    Ellipse: View,
    G: View,
    LinearGradient: View,
    Path: View,
    Rect: View,
    Stop: View,
    Svg: View,
  };
});

describe("ChatScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockBack.mockClear();
    mockPush.mockClear();
    mockGarageState = { garage, isLoading: false, error: null };
  });

  afterEach(async () => {
    await cleanup();
    jest.useRealTimers();
  });

  it("abre com nome, saudação e sugestões contextuais", async () => {
    const screen = await render(<ChatScreen />);

    expect(screen.getByText("Oi, Julio! Tudo bem?")).toBeTruthy();
    expect(
      screen.getByText("Sou o Techy, seu assistente Toyota. Como posso ajudar?")
    ).toBeTruthy();
    expect(screen.getByText("Meu status")).toBeTruthy();
    expect(screen.getByText("Meu boleto")).toBeTruthy();
    expect(screen.getByText("Meus documentos")).toBeTruthy();
  });

  it("responde o status real e abre a tela de tracking", async () => {
    const screen = await render(<ChatScreen />);

    await fireEvent.press(screen.getByLabelText("Meu status"));

    expect(screen.getByText("Como está a montagem do meu carro?")).toBeTruthy();
    expect(screen.getByLabelText("Techy está digitando")).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(chatReplyDelay);
    });

    expect(
      screen.getByText(/Aguardando o embarque \(etapa 4 de 6\)/)
    ).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("Ver status"));

    expect(mockPush).toHaveBeenCalledWith("/tracking");
  });

  it("responde o financiamento e abre o boleto", async () => {
    const screen = await render(<ChatScreen />);

    await fireEvent.press(screen.getByLabelText("Meu boleto"));

    await act(async () => {
      jest.advanceTimersByTime(chatReplyDelay);
    });

    expect(screen.getByText(/R\$ 2\.850,00/)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText("Abrir boleto"));

    expect(mockPush).toHaveBeenCalledWith("/boleto");
  });

  it("envia a mensagem digitada e consulta o chassi", async () => {
    const screen = await render(<ChatScreen />);

    expect(screen.getByLabelText("Enviar mensagem")).toBeDisabled();

    await fireEvent.changeText(
      screen.getByLabelText("Mensagem para o Techy"),
      "Quero ver meu chassi"
    );

    expect(screen.getByLabelText("Enviar mensagem")).toBeEnabled();

    await fireEvent.press(screen.getByLabelText("Enviar mensagem"));

    expect(screen.getByText("Quero ver meu chassi")).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(chatReplyDelay);
    });

    expect(screen.getByText(/CHASSI_12345/)).toBeTruthy();
  });

  it("mostra carregamento quando a garagem ainda não chegou", async () => {
    mockGarageState = { garage: null, isLoading: true, error: null };

    const screen = await render(<ChatScreen />);

    expect(screen.getByText(/carregando os dados/)).toBeTruthy();
  });

  it("fecha pelo botão de voltar", async () => {
    const screen = await render(<ChatScreen />);

    await fireEvent.press(screen.getByLabelText("Voltar"));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
