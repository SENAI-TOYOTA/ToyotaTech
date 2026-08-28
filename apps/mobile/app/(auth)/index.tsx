import * as AuthSession from "expo-auth-session";
import { Checkbox } from "expo-checkbox";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import Button from "@/components/ui/Button";
import SocialButton from "@/components/ui/SocialButton";
import TextInput from "@/components/ui/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/services/api";
import { checkEmail } from "@/services/auth";
import { colors, fonts, fontSize, spacing } from "@/theme";
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
    normalizedEmail.includes("@") &&
    acceptedTerms &&
    !isSubmitting &&
    !isGoogleLoading;
  const domainFromEnv = process.env.EXPO_PUBLIC_COGNITO_DOMAIN?.trim();
  const domainFromConfig =
    Constants.expoConfig?.extra?.cognitoDomain ??
    (Constants.manifest as { extra?: { cognitoDomain?: string } } | null)?.extra
      ?.cognitoDomain;
  const defaultDomain =
    "https://toyotatech-mobile.auth.us-east-1.amazoncognito.com";
  const cognitoDomain = (domainFromEnv || domainFromConfig || defaultDomain)
    .trim()
    .replace(/\/$/, "");
  const cognitoClientId = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID?.trim();
  const redirectUri = useMemo(() => {
    if (Platform.OS === "web") {
      return AuthSession.makeRedirectUri();
    }

    const isExpoGo =
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
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

  useEffect(() => {
    if (__DEV__) {
      console.warn("[Auth] generated redirectUri:", redirectUri);
    }
  }, [redirectUri]);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: cognitoClientId ?? "",
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      scopes: ["openid", "email", "profile", "aws.cognito.signin.user.admin"],
      usePKCE: true,
      extraParams: {
        identity_provider: "Google",
      },
    },
    discovery
  );

  const handleContinuePress = async () => {
    if (!canContinue) {
      setFormError("Enter a valid email and accept the terms.");
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
        pathname:
          checkResult.nextRoute === "/login"
            ? "/(auth)/login"
            : "/(auth)/register",
        params: { email: normalizedEmail },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Unable to validate email. Try again.");
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
        setFormError("Google sign-in not configured.");
        return;
      }
      if (!request?.codeVerifier) {
        setFormError("Unable to complete Google sign-in.");
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
        if (
          !tokenResponse.accessToken ||
          !tokenResponse.idToken ||
          !tokenResponse.refreshToken
        ) {
          throw new Error("Incomplete tokens");
        }
        const expiresAt =
          Math.floor(Date.now() / 1000) + (tokenResponse.expiresIn ?? 3600);
        await signInWithTokens({
          accessToken: tokenResponse.accessToken,
          idToken: tokenResponse.idToken,
          refreshToken: tokenResponse.refreshToken,
          expiresAt,
        });
      } catch (error) {
        console.error("Google sign-in failed:", error);
        setFormError("Unable to complete Google sign-in.");
      } finally {
        setIsGoogleLoading(false);
      }
    };

    void finalizeGoogleSignIn();
  }, [
    cognitoClientId,
    discovery,
    redirectUri,
    request?.codeVerifier,
    response,
    signInWithTokens,
  ]);

  const handleGooglePress = async () => {
    if (!cognitoDomain || !cognitoClientId) {
      setFormError("Google sign-in not configured.");
      return;
    }
    if (!discovery || !request) {
      setFormError("Google sign-in not ready yet.");
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
      console.error("Failed to open Google sign-in:", error);
      setFormError("Unable to open Google sign-in.");
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
            title={isSubmitting ? "Verifying..." : "Continue"}
            variant="primary"
            icon={
              <ArrowRight
                size={36}
                strokeWidth={3}
                color={colors.white}
                strokeLinecap="butt"
                strokeLinejoin="round"
              />
            }
            style={styles.continueButton}
            onPress={handleContinuePress}
            disabled={!canContinue}
          />
        </View>
      }
    >
      <View style={styles.formSection}>
        <SocialButton
          icon={googleIcon}
          onPress={isGoogleLoading ? undefined : handleGooglePress}
        />
        <TextInput
          placeholder="EMAIL ADDRESS *"
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
            By clicking continue, you{"\n"}agree to the{" "}
            <Text style={styles.termsLink}>
              ToyotaTech{"\n"}Terms and Conditions
            </Text>
            .
          </Text>
        </View>
        {formError ? (
          <Text style={styles.formErrorText}>{formError}</Text>
        ) : null}
        {isGoogleLoading ? (
          <Text style={styles.formInfoText}>Connecting to Google...</Text>
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
