import { useRouter } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import InteractivePressable from "@/components/ui/InteractivePressable";
import Skeleton from "@/components/ui/Skeleton";
import VehicleFallback from "@/components/ui/VehicleFallback";
import { useAuth } from "@/contexts/AuthContext";
import { fetchTrackingStatus } from "@/services/tracking";
import { borders, colors, fonts, radii, spacing } from "@/theme";
import { TrackingInfo, TrackingStep } from "@/types/tracking";
import { canUseCorollaAltisImage } from "@/utils/vehicle";

const mainCarImage = require("@/assets/images/corolla-main.jpg");
const trackingStepIds = ["step-1", "step-2", "step-3", "step-4", "step-5"];

export default function TrackingScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<TrackingInfo | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchTrackingStatus(token);
        setTrackingData(data);
      } catch (error) {
        console.warn("Falha ao carregar os dados de rastreamento", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [token]);

  if (loading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <View style={styles.header}>
          <InteractivePressable
            onPress={handleBack}
            style={styles.backIcon}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <ArrowLeft size={22} color={colors.black} strokeWidth={1.8} />
          </InteractivePressable>
          <Text style={styles.headerTitle}>Status do pedido</Text>
        </View>
        <View style={styles.contentContainer}>
          <Skeleton
            accessibilityLabel="Carregando status do veículo"
            height={300}
            borderRadius={0}
            style={styles.carCard}
          />
          <Skeleton
            height={24}
            width={140}
            borderRadius={0}
            style={styles.sectionTitle}
          />
          <View style={styles.timelineContainer}>
            {trackingStepIds.map((stepId) => (
              <Skeleton
                key={stepId}
                height={70}
                borderRadius={0}
                style={styles.stepWrapper}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!trackingData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Não foi possível carregar o status do veículo.
        </Text>
        <InteractivePressable
          style={styles.backButton}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </InteractivePressable>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <View style={styles.header}>
        <InteractivePressable
          onPress={handleBack}
          style={styles.backIcon}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <ArrowLeft size={22} color={colors.black} strokeWidth={1.8} />
        </InteractivePressable>
        <Text style={styles.headerTitle}>Status do pedido</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.carCard}>
          <View style={styles.carImageContainer}>
            {canUseCorollaAltisImage(trackingData.model) ? (
              <Image
                source={mainCarImage}
                style={styles.carImage}
                resizeMode="contain"
              />
            ) : (
              <VehicleFallback
                model={trackingData.model}
                version={trackingData.version}
                color={trackingData.color}
                variant="card"
              />
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

        <Text style={styles.sectionTitle}>Rastreamento</Text>

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
    </SafeAreaView>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  backIcon: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
    borderRadius: radii.pill,
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
    borderWidth: borders.thin,
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
    borderRadius: radii.lg,
    borderWidth: borders.thin,
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
    borderRadius: radii.md,
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
    borderWidth: borders.thin,
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
