/* eslint-disable @typescript-eslint/no-require-imports */
import { ApiError } from "@/services/api";
import {
  consumePendingRegistrationPassword,
  setPendingRegistrationPassword,
} from "@/services/pendingRegistration";
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

import VerifyEmailScreen from "@/app/(auth)/verify-email";

const mockReplace = jest.fn<(args: unknown) => void>();
const mockVerifyEmail =
  jest.fn<
    (payload: { email: string; code: string }) => Promise<{ message: string }>
  >();
const mockResendVerification =
  jest.fn<(email: string) => Promise<{ message: string }>>();
const mockSignIn =
  jest.fn<(email: string, password: string) => Promise<void>>();

jest.mock("lucide-react-native", () => {
  const { View } = require("react-native");

  return {
    ArrowRight: () => <View />,
  };
});

jest.mock("expo-router", () => ({
  Stack: () => null,
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => ({ email: "user@example.com" }),
}));

jest.mock("react-native-otp-entry", () => {
  const { Pressable, Text } = require("react-native");

  return {
    OtpInput: ({ onTextChange }: { onTextChange: (text: string) => void }) => (
      <Pressable testID="otp-input" onPress={() => onTextChange("123456")}>
        <Text>OTP</Text>
      </Pressable>
    ),
  };
});

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ signIn: mockSignIn }),
}));

jest.mock("@/services/auth", () => ({
  verifyEmail: (payload: { email: string; code: string }) =>
    mockVerifyEmail(payload),
  resendVerification: (email: string) => mockResendVerification(email),
}));

const EMAIL = "user@example.com";
const PASSWORD = "Senha123";

describe("VerifyEmailScreen", () => {
  afterEach(async () => {
    await cleanup();
  });

  beforeEach(() => {
    mockReplace.mockReset();
    mockVerifyEmail.mockReset();
    mockResendVerification.mockReset();
    mockSignIn.mockReset();
    setPendingRegistrationPassword(EMAIL, PASSWORD);
    mockVerifyEmail.mockResolvedValue({ message: "E-mail verificado." });
  });

  it("autentica automaticamente com a senha pendente do mesmo email", async () => {
    mockSignIn.mockResolvedValue(undefined);
    const screen = await render(<VerifyEmailScreen />);

    await fireEvent.press(screen.getByTestId("otp-input"));
    await fireEvent.press(screen.getByText("Verificar"));

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith({
        email: EMAIL,
        code: "123456",
      });
      expect(mockSignIn).toHaveBeenCalledWith(EMAIL, PASSWORD);
      expect(mockReplace).toHaveBeenCalledWith("/home");
    });
  });

  it("mostra o erro do auto-login e oferece ir para o login", async () => {
    mockSignIn.mockRejectedValue(new ApiError("Muitas requisições.", 429, 10));
    const screen = await render(<VerifyEmailScreen />);

    await fireEvent.press(screen.getByTestId("otp-input"));
    await fireEvent.press(screen.getByText("Verificar"));

    await waitFor(() => {
      expect(
        screen.getByText("Muitas requisições. Tente novamente em 10s.")
      ).toBeTruthy();
    });
    expect(mockReplace).not.toHaveBeenCalledWith("/home");

    await fireEvent.press(screen.getByText("Ir para login"));

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: "/(auth)/login",
      params: { email: EMAIL },
    });
  });

  it("limpa a senha pendente ao desmontar a tela", async () => {
    const screen = await render(<VerifyEmailScreen />);

    await screen.unmount();

    expect(consumePendingRegistrationPassword(EMAIL)).toBeNull();
  });
});
