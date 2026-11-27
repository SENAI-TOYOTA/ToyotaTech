import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Linking,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import InteractivePressable from "@/components/ui/InteractivePressable";
import Screen from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import Skeleton from "@/components/ui/Skeleton";
import {
  borders,
  colors,
  fonts,
  fontSize,
  radii,
  sizes,
  spacing,
  touch,
} from "@/theme";

const iconSize = fontSize.lg;
const iconStrokeWidth = borders.strong;
const statusLoadingSlots = ["screenReader", "reduceMotion", "fontScale"];
const statusSkeletonHeight = sizes.inputField + spacing.sm;

interface StatusRowProps {
  label: string;
  description: string;
  value: string;
}

function StatusRow({ label, description, value }: StatusRowProps) {
  return (
    <View style={styles.statusRow}>
      <View style={styles.statusText}>
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={styles.statusDescription}>{description}</Text>
      </View>
      <Badge label={value} />
    </View>
  );
}

function statusLabel(isEnabled: boolean, hasError: boolean) {
  if (hasError) {
    return "Indisponível";
  }
  return isEnabled ? "Ativo" : "Inativo";
}

export default function AccessibilityScreen() {
  const router = useRouter();
  const { fontScale } = useWindowDimensions();
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadStatus = async () => {
      try {
        const [screenReader, reduceMotion] = await Promise.all([
          AccessibilityInfo.isScreenReaderEnabled(),
          AccessibilityInfo.isReduceMotionEnabled(),
        ]);
        if (!isActive) {
          return;
        }
        setScreenReaderEnabled(screenReader);
        setReduceMotionEnabled(reduceMotion);
        setStatusError(null);
      } catch {
        if (!isActive) {
          return;
        }
        setStatusError(
          "Não foi possível ler as configurações de acessibilidade do aparelho."
        );
      } finally {
        if (isActive) {
          setIsLoadingStatus(false);
        }
      }
    };

    void loadStatus();

    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      setScreenReaderEnabled
    );
    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotionEnabled
    );

    return () => {
      isActive = false;
      screenReaderSubscription.remove();
      reduceMotionSubscription.remove();
    };
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/profile");
  };

  const handleOpenSettings = async () => {
    setSettingsError(null);
    try {
      if (Platform.OS === "android") {
        await Linking.sendIntent("android.settings.ACCESSIBILITY_SETTINGS");
        return;
      }
      if (Platform.OS === "ios") {
        await Linking.openSettings();
        return;
      }
      setSettingsError(
        "Use as configurações do navegador para ajustar a acessibilidade."
      );
    } catch {
      setSettingsError("Não foi possível abrir as configurações do sistema.");
    }
  };

  const header = (
    <View style={styles.header}>
      <InteractivePressable
        onPress={handleBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <ArrowLeft
          size={iconSize}
          strokeWidth={iconStrokeWidth}
          color={colors.black}
        />
      </InteractivePressable>
      <Text style={styles.headerTitle}>Acessibilidade</Text>
    </View>
  );

  return (
    <Screen edges={["top", "bottom"]} header={header}>
      <ScreenSectionHeader
        title="Acessibilidade"
        subtitle="Estados do aparelho e acesso aos ajustes"
        style={styles.sectionHeader}
      />

      <Text style={styles.statusNotice}>
        Estas informações vêm do sistema operacional. O app não altera essas
        opções.
      </Text>

      {isLoadingStatus ? (
        <View style={styles.statusSkeletons}>
          {statusLoadingSlots.map((slotId, index) => (
            <Skeleton
              key={slotId}
              height={statusSkeletonHeight}
              borderRadius={radii.sm}
              accessibilityLabel={
                index === 0 ? "Carregando acessibilidade" : undefined
              }
            />
          ))}
        </View>
      ) : (
        <>
          <Card padding={0} style={styles.statusCard}>
            <StatusRow
              label="Leitor de tela"
              description="Indica se o leitor de tela do aparelho está ativo."
              value={statusLabel(screenReaderEnabled, Boolean(statusError))}
            />
            <View style={styles.divider} />
            <StatusRow
              label="Movimento reduzido"
              description="Indica se o aparelho está com movimento reduzido."
              value={statusLabel(reduceMotionEnabled, Boolean(statusError))}
            />
            <View style={styles.divider} />
            <StatusRow
              label="Tamanho do texto"
              description="Segue a escala de texto definida no sistema."
              value={`${Math.round(fontScale * 100)}%`}
            />
          </Card>
          {statusError ? (
            <Text style={styles.errorText}>{statusError}</Text>
          ) : null}
        </>
      )}

      {Platform.OS === "web" ? (
        <Text style={styles.settingsHint}>
          Ajuste a acessibilidade nas configurações do navegador.
        </Text>
      ) : (
        <Button
          title="Abrir ajustes do sistema"
          variant="secondary"
          onPress={() => {
            void handleOpenSettings();
          }}
          style={styles.settingsButton}
        />
      )}

      {Platform.OS === "ios" ? (
        <Text style={styles.settingsHint}>
          No iOS, o botão abre os ajustes do app. A acessibilidade fica em
          Ajustes &gt; Acessibilidade.
        </Text>
      ) : null}

      {settingsError ? (
        <Text style={styles.errorText}>{settingsError}</Text>
      ) : null}

      <Card style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>Sobre</Text>
        <Text style={styles.aboutText}>
          O app segue essas configurações nas telas que já oferecem suporte. As
          opções continuam sendo controladas pelo aparelho.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  backButton: {
    minWidth: touch.minTarget,
    minHeight: touch.minTarget,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
    borderRadius: radii.sm,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.black,
  },
  sectionHeader: {
    marginTop: spacing.lg,
  },
  statusNotice: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.md + spacing.xs,
    color: colors.textSecondary,
  },
  statusCard: {
    marginTop: spacing.lg,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - spacing.xs,
  },
  statusText: {
    flex: 1,
    gap: spacing.xs - 2,
  },
  statusLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  statusDescription: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.md + spacing.xs,
    color: colors.textSecondary,
  },
  divider: {
    height: borders.thin,
    backgroundColor: colors.grayLight,
  },
  statusSkeletons: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  settingsButton: {
    marginTop: spacing.lg,
  },
  settingsHint: {
    marginTop: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.md + spacing.xs,
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: spacing.sm,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  aboutCard: {
    marginTop: spacing.lg,
  },
  aboutTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  aboutText: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.md + spacing.xs,
    color: colors.textSecondary,
  },
});
