/* eslint-disable @typescript-eslint/no-require-imports */
import HomeScreen from "@/app/(tabs)/home";
import VehicleManagementScreen from "@/app/(tabs)/vehicle-management";
import VehicleImage from "@/components/ui/VehicleImage";
import type { GarageData } from "@/types/garage";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { cleanup, fireEvent, render } from "@testing-library/react-native";
import { StyleSheet, Text } from "react-native";

const mainCarImage = require("@/assets/images/corolla-main.jpg");

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
    push: jest.fn(),
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

jest.mock("@/hooks/useHighlights", () => ({
  useHighlights: () => ({
    highlights: [],
    isLoading: false,
    error: null,
    reload: jest.fn(),
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

function buildGarage(
  vehicleOverrides: Partial<GarageData["vehicle"]> = {}
): GarageData {
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
      ...vehicleOverrides,
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

function getRenderedImage(
  screen: Awaited<ReturnType<typeof render>>,
  expectedSource: unknown
) {
  const image = screen.root?.queryAll((node) => {
    const source = node.props.source;

    if (
      typeof expectedSource === "object" &&
      expectedSource !== null &&
      "uri" in expectedSource
    ) {
      return (
        typeof source === "object" &&
        source !== null &&
        "uri" in source &&
        source.uri === expectedSource.uri
      );
    }

    return source === expectedSource;
  })[0];

  if (!image) {
    throw new Error("Imagem não renderizada");
  }

  return image;
}

describe("VehicleImage", () => {
  afterEach(async () => {
    await cleanup();
  });

  it("renderiza a imagem remota e o conteudo sobreposto", async () => {
    const screen = await render(
      <VehicleImage imageUrl="https://exemplo.com/carro.jpg">
        <Text>Rótulo do veículo</Text>
      </VehicleImage>
    );

    expect(
      getRenderedImage(screen, { uri: "https://exemplo.com/carro.jpg" }).props
        .source
    ).toEqual({
      uri: "https://exemplo.com/carro.jpg",
    });
    expect(screen.getByText("Rótulo do veículo")).toBeTruthy();
  });

  it("cai no placeholder quando a imagem remota falha", async () => {
    const screen = await render(
      <VehicleImage
        imageUrl="https://exemplo.com/carro.jpg"
        model="Corolla"
        chassi="CHASSI_12345"
      >
        <Text>Rótulo do veículo</Text>
      </VehicleImage>
    );

    await fireEvent(
      getRenderedImage(screen, {
        uri: "https://exemplo.com/carro.jpg",
      }),
      "error"
    );

    expect(screen.getByText("Imagem ilustrativa indisponível")).toBeTruthy();
    expect(screen.getByText("Chassi CHASSI_12345")).toBeTruthy();
    expect(screen.queryByText("Rótulo do veículo")).toBeNull();
  });

  it("usa a imagem empacotada quando nao ha imagem remota", async () => {
    const screen = await render(
      <VehicleImage fallbackSource={mainCarImage}>
        <Text>Rótulo do veículo</Text>
      </VehicleImage>
    );

    expect(getRenderedImage(screen, mainCarImage).props.source).toBe(
      mainCarImage
    );
    expect(screen.getByText("Rótulo do veículo")).toBeTruthy();
  });

  it("degrada para a imagem empacotada quando a remota falha", async () => {
    const screen = await render(
      <VehicleImage
        imageUrl="https://exemplo.com/carro.jpg"
        fallbackSource={mainCarImage}
      />
    );

    await fireEvent(
      getRenderedImage(screen, {
        uri: "https://exemplo.com/carro.jpg",
      }),
      "error"
    );

    expect(getRenderedImage(screen, mainCarImage).props.source).toBe(
      mainCarImage
    );
  });

  it("usa o placeholder quando nao ha imagem disponivel", async () => {
    const screen = await render(
      <VehicleImage model="Corolla" chassi="CHASSI_12345" />
    );

    expect(screen.getByText("Imagem ilustrativa indisponível")).toBeTruthy();
    expect(screen.getByText("Chassi CHASSI_12345")).toBeTruthy();
  });
});

describe("HomeScreen imagem do veiculo", () => {
  afterEach(async () => {
    await cleanup();
  });

  it("renderiza a imagem remota do veiculo com o rotulo", async () => {
    setGarage(buildGarage({ imageUrl: "https://exemplo.com/corolla.jpg" }));

    const screen = await render(<HomeScreen />);

    expect(
      getRenderedImage(screen, { uri: "https://exemplo.com/corolla.jpg" }).props
        .source
    ).toEqual({
      uri: "https://exemplo.com/corolla.jpg",
    });
    expect(screen.getByText("Corolla")).toBeTruthy();
  });

  it("mantem a imagem empacotada do Corolla Altis sem imagem remota", async () => {
    setGarage(buildGarage({ model: "Corolla Altis" }));

    const screen = await render(<HomeScreen />);

    expect(getRenderedImage(screen, mainCarImage).props.source).toBe(
      mainCarImage
    );
    expect(screen.getByText("Corolla Altis")).toBeTruthy();
  });

  it("cai no placeholder sem imagem e sem imagem empacotada", async () => {
    setGarage(buildGarage());

    const screen = await render(<HomeScreen />);

    expect(screen.getByText("Imagem ilustrativa indisponível")).toBeTruthy();
    expect(screen.getAllByText("Corolla")).toHaveLength(1);
  });

  it("mostra skeleton de altura fixa no carregamento inicial", async () => {
    setGarage(null, true);

    const screen = await render(<HomeScreen />);
    const skeleton = screen.getByLabelText("Carregando veículo");

    expect(StyleSheet.flatten(skeleton.props.style).height).toBe(300);
  });
});

describe("VehicleManagementScreen imagem do veiculo", () => {
  beforeEach(() => {
    setGarage(buildGarage());
  });

  afterEach(async () => {
    await cleanup();
  });

  it("renderiza a imagem remota do veiculo", async () => {
    setGarage(buildGarage({ imageUrl: "https://exemplo.com/corolla.jpg" }));

    const screen = await render(<VehicleManagementScreen />);

    expect(
      getRenderedImage(screen, { uri: "https://exemplo.com/corolla.jpg" }).props
        .source
    ).toEqual({
      uri: "https://exemplo.com/corolla.jpg",
    });
  });

  it("mantem o placeholder e os documentos sem imagem", async () => {
    const screen = await render(<VehicleManagementScreen />);
    const serialized = JSON.stringify(screen.toJSON());

    expect(screen.getByText("Imagem ilustrativa indisponível")).toBeTruthy();
    expect(screen.getByText("CRLV-e")).toBeTruthy();
    expect(serialized.indexOf("VEÍCULO VINCULADO")).toBeLessThan(
      serialized.indexOf("CRLV-e")
    );
  });

  it("mostra skeleton de altura fixa no carregamento inicial", async () => {
    setGarage(null, true);

    const screen = await render(<VehicleManagementScreen />);
    const skeleton = screen.getByLabelText("Carregando veículo");

    expect(StyleSheet.flatten(skeleton.props.style).height).toBe(300);
  });
});
