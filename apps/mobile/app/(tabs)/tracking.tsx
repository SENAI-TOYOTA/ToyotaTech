import { useRouter } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { fetchGarageStatus } from "@/services/garage";
import { colors, fonts, spacing } from "@/theme";
import { TrackingInfo, TrackingStep } from "@/types/tracking";

function canUseCorollaAltisImage(model?: string) {
  return (model ?? "").toLowerCase().includes("corolla altis");
}

const mainCarImage = require("@/assets/images/corolla-main.png");

export default function TrackingScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<TrackingInfo | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchGarageStatus(token);
        setTrackingData(data.tracking);
      } catch (error) {
        console.error("Failed to fetch tracking data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!trackingData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Erro ao carregar status do veículo.
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backIcon,
            pressed && { opacity: 0.7, backgroundColor: colors.grayLight },
          ]}
          hitSlop={10}
        >
          <ArrowLeft size={24} color={colors.black} />
        </Pressable>
        <Text style={styles.headerTitle}>Status do Pedido</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Car Card */}
        <View style={styles.carCard}>
          <View style={styles.carImageContainer}>
            {canUseCorollaAltisImage(trackingData.model) ? (
              <Image
                source={mainCarImage}
                style={styles.carImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.vehicleFallbackCard}>
                <Text style={styles.vehicleFallbackEyebrow}>
                  VEICULO VINCULADO
                </Text>
                <Text style={styles.vehicleFallbackModel}>
                  {trackingData.model}
                </Text>
                <Text style={styles.vehicleFallbackSpecs}>
                  {trackingData.version} • {trackingData.color}
                </Text>
                <Text style={styles.vehicleFallbackNote}>
                  Imagem ilustrativa indisponivel
                </Text>
              </View>
            )}
          </View>
          <View style={styles.carDetails}>
            <Text style={styles.carModel}>{trackingData.model}</Text>
            <Text style={styles.carSpecs}>
              {trackingData.version} • {trackingData.color}
            </Text>
            <Text style={styles.carSpecs}>
              {trackingData.year} • {trackingData.engine}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Acompanhamento</Text>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          {trackingData.steps.map((step, index) => (
            <TimelineStep
              key={step.id}
              step={step}
              isLast={index === trackingData.steps.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function TimelineStep({
  step,
  isLast,
}: {
  step: TrackingStep;
  isLast: boolean;
}) {
  const isCompleted = step.status === "completed";
  const isCurrent = step.status === "current";

  return (
    <View style={styles.stepWrapper}>
      <View style={styles.indicatorContainer}>
        <View
          style={[
            styles.indicator,
            isCompleted && styles.indicatorCompleted,
            isCurrent && styles.indicatorCurrent,
          ]}
        >
          {isCompleted && (
            <Check size={14} color={colors.white} strokeWidth={3} />
          )}
          {isCurrent && <View style={styles.innerCircle} />}
        </View>
        {!isLast && (
          <View
            style={[styles.connector, isCompleted && styles.connectorCompleted]}
          />
        )}
      </View>

      <View style={styles.stepContent}>
        <Text
          style={[
            styles.stepLabel,
            isCompleted && styles.stepLabelCompleted,
            isCurrent && styles.stepLabelCurrent,
          ]}
        >
          {step.label}
        </Text>
        {step.date && <Text style={styles.stepDate}>{step.date}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorText: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.black,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  backIcon: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.black,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  carCard: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  carImageContainer: {
    height: 180,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  carImage: {
    width: "100%",
    height: "100%",
  },
  vehicleFallbackCard: {
    width: "100%",
    height: "100%",
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    padding: spacing.md,
    justifyContent: "center",
  },
  vehicleFallbackEyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 1,
  },
  vehicleFallbackModel: {
    marginTop: spacing.sm,
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 30,
    color: colors.black,
  },
  vehicleFallbackSpecs: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
  },
  vehicleFallbackNote: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  carDetails: {
    marginTop: spacing.sm,
  },
  carModel: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.black,
  },
  carSpecs: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.black,
  },
  timelineContainer: {
    paddingLeft: spacing.xs,
  },
  stepWrapper: {
    flexDirection: "row",
    minHeight: 70,
  },
  indicatorContainer: {
    alignItems: "center",
    width: 30,
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  indicatorCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  indicatorCurrent: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.grayLight,
    marginVertical: 4,
  },
  connectorCompleted: {
    backgroundColor: colors.primary,
  },
  stepContent: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingBottom: spacing.xl,
  },
  stepLabel: {
    fontFamily: fonts.medium,
    fontSize: 18,
    color: colors.gray,
  },
  stepLabelCompleted: {
    color: colors.black,
    fontFamily: fonts.semiBold,
  },
  stepLabelCurrent: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  stepDate: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  backButton: {
    borderWidth: 1,
    borderColor: colors.black,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  backButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.black,
  },
});
