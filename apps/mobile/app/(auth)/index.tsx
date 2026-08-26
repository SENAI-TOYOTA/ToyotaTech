import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { Checkbox } from "expo-checkbox";
import * as AuthSession from "expo-auth-session";
import Constants, { ExecutionEnvironment } from "expo-constants";

import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import SocialButton from "@/components/ui/SocialButton";
import { colors, fonts, fontSize, spacing } from "@/theme";
import { useAuth } from "@/contexts/AuthContext";
import { checkEmail } from "@/services/auth";
import { ApiError } from "@/services/api";
import { AuthScreenLayout } from "./_layout";

const googleIcon = require("@/assets/images/google-icon.png");

function useCognitoDiscovery(issuer?: string) {
  const discovery = useMemo(() => {
    if (!issuer) return null;
    return {
      authorizationEndpoint: `${issuer}/oauth2/authorize`,
      tokenEndpoint: `${issuer}/oauth2/token`,
      revocationEndpoint: `${issuer}/oauth2/revoke`,
      userInfoEndpoint: `${issuer}/oauth2/userInfo`,
      endSessionEndpoint: `${issuer}/logout`,
    };
  }, [issuer]);

  return discovery;
}


export default function LoginScreen() {
  const router = useRouter();
  const { signInWithTokens } = useAuth();
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const canContinue =
    normalizedEmail.includes("@") && acceptedTerms && !isSubmitting && !isGoogleLoading;
  const domainFromEnv = process.env.EXPO_PUBLIC_COGNITO_DOMAIN?.trim();
  const domainFromConfig =
    Constants.expoConfig?.extra?.cognitoDomain ??
    (Constants.manifest as { extra?: { cognitoDomain?: string } } | null)?.extra?.cognitoDomain;
  const defaultDomain = "https://toyotatech-mobile.auth.us-east-1.amazoncognito.com";
  const cognitoDomain = (domainFromEnv || domainFromConfig || defaultDomain)
    .trim()
    .replace(/\/$/, "");
  const cognitoClientId = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID?.trim();
  const redirectUri = useMemo(() => {
    if (Platform.OS === "web") {
      return AuthSession.makeRedirectUri();
    }

    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    if (isExpoGo) {
      return AuthSession.makeRedirectUri({
        scheme: "exp",
      });
    }

    return AuthSession.makeRedirectUri({
      scheme: "mobile",
      native: "mobile://",
    });
  }, []);
  const discovery = useCognitoDiscovery(cognitoDomain || undefined);

  // Debug: log the redirect URI so we can verify it matches the Cognito App Client callbacks
  useEffect(() => {
    console.log("[Auth] redirectUri gerado:", redirectUri);
  }, [redirectUri]);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: cognitoClientId ?? "",
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      scopes: ["openid", "email", "profile", "aws.cognito.signin.user.admin"],
      usePKCE: true,
      // Pula a Hosted UI do Cognito e vai direto ao Google
      extraParams: {
        identity_provider: "Google",
      },
    },
    discovery
  );

  const handleContinuePress = async () => {
    if (!canContinue) {
      setFormError("Preencha e-mail valido e aceite os termos.");
      return;
    }

    setFormError(null);
    if (Platform.OS === "web" && typeof document !== "undefined") {
      (document.activeElement as HTMLElement | null)?.blur();
    }

    setIsSubmitting(true);
    try {
      const checkResult = await checkEmail(normalizedEmail);

      router.push({
        pathname: checkResult.nextRoute === "/login" ? "/(auth)/login" : "/(auth)/register",
        params: { email: normalizedEmail },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Nao foi possivel validar o e-mail. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const finalizeGoogleSignIn = async () => {
      if (response?.type !== "success") {
        return;
      }
      if (!discovery || !cognitoClientId) {
        setFormError("Login Google nao configurado.");
        return;
      }
      if (!request?.codeVerifier) {
        setFormError("Nao foi possivel completar o login Google.");
        return;
      }
      setIsGoogleLoading(true);
      try {
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: cognitoClientId,
            code: response.params.code,
            redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier,
            },
          },
          discovery
        );
        if (!tokenResponse.accessToken || !tokenResponse.idToken || !tokenResponse.refreshToken) {
          throw new Error("Tokens incompletos");
        }
        const expiresAt = Math.floor(Date.now() / 1000) + (tokenResponse.expiresIn ?? 3600);
        await signInWithTokens({
          accessToken: tokenResponse.accessToken,
          idToken: tokenResponse.idToken,
          refreshToken: tokenResponse.refreshToken,
          expiresAt,
        });
      } catch (error) {
        console.error("Falha no login Google:", error);
        setFormError("Nao foi possivel completar o login Google.");
      } finally {
        setIsGoogleLoading(false);
      }
    };

    void finalizeGoogleSignIn();
  }, [cognitoClientId, discovery, redirectUri, request?.codeVerifier, response, signInWithTokens]);

  const handleGooglePress = async () => {
    if (!cognitoDomain || !cognitoClientId) {
      setFormError("Login Google nao configurado.");
      return;
    }
    if (!discovery || !request) {
      setFormError("Login Google ainda nao esta pronto.");
      return;
    }
    setFormError(null);
    setIsGoogleLoading(true);
    try {
      const result = await promptAsync();
      if (result.type !== "success") {
        setIsGoogleLoading(false);
      }
    } catch (error) {
      console.error("Falha ao abrir login Google:", error);
      setFormError("Nao foi possivel abrir o login Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      contentSectionStyle={styles.contentSection}
      footerTextColor={colors.textSecondary}
      bottomContent={
        <View style={styles.bottomContentContainer}>
          <Button
            title={isSubmitting ? "Verificando..." : "Prosseguir"}
            variant="primary"
            icon={<ArrowRight size={36} strokeWidth={3} color={colors.white} strokeLinecap="butt" strokeLinejoin="round" />}
            style={styles.continueButton}
            onPress={handleContinuePress}
            disabled={!canContinue}
          />
        </View>
      }
    >
      <View style={styles.formSection}>
        <SocialButton icon={googleIcon} onPress={isGoogleLoading ? undefined : handleGooglePress} />
        <TextInput
          placeholder="ENDEREÇO DE EMAIL *"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <View style={styles.termsContainer}>
          <Checkbox
            value={acceptedTerms}
            onValueChange={setAcceptedTerms}
            style={styles.checkbox}
            color={acceptedTerms ? colors.black : undefined}
          />
          <Text style={styles.termsText}>
            Ao clicar em prosseguir, você{"\n"}concorda com os{" "}
            <Text style={styles.termsLink}>
              Termos e{"\n"}Condições ToyotaTech
            </Text>
            .
          </Text>
        </View>
        {formError ? <Text style={styles.formErrorText}>{formError}</Text> : null}
        {isGoogleLoading ? (
          <Text style={styles.formInfoText}>Conectando ao Google...</Text>
        ) : null}
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  contentSection: {
    marginTop: spacing.xl + spacing.xl + spacing.sm,
  },
  formSection: {
    gap: spacing.lg,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 2,
    marginTop: 2,
    borderColor: colors.black,
  },
  termsText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 22,
    flex: 1,
  },
  termsLink: {
    textDecorationLine: "underline",
    fontFamily: fonts.medium,
  },
  formErrorText: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  formInfoText: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  bottomContentContainer: {
    width: "100%",
  },
  continueButton: {
    width: "100%",
  },
});
