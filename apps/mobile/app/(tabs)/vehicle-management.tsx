import { ArrowRight } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import TextInput from "@/components/ui/TextInput";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";

const documentOptions = ["Nota fiscal", "CRLV-e", "Documentos", "Manual do veículo"];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function InteractivePressable({
  children,
  style,
  onPress,
  ...props
}: React.ComponentProps<typeof Pressable>) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      {...props}
      style={[style, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function VehicleManagementScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <ScreenSectionHeader
            title="Gestão do veículo"
            subtitle="Documentos digitais, lembretes e mais!"
            style={styles.sectionHeader}
          />
        </Animated.View>

        <View style={styles.documentList}>
          {documentOptions.map((option, index) => (
            <Animated.View
              key={option}
              entering={FadeInDown.delay(200 + index * 100)
                .duration(600)
                .springify()}
              style={styles.documentButtonWrapper}
            >
              <View style={styles.documentButtonShadow} />
              <InteractivePressable style={styles.documentButton}>
                <Text style={styles.documentButtonText}>{option}</Text>
                <ArrowRight size={30} strokeWidth={2.4} color={colors.black} />
              </InteractivePressable>
            </Animated.View>
          ))}
        </View>

        <Animated.View
          entering={FadeInDown.delay(700).duration(600).springify()}
          style={styles.recallCard}
        >
          <Text style={styles.recallTitle}>Programas de recall</Text>
          <Text style={styles.recallDescription}>
            Notificações e agendamentos de reparos obrigatórios.
          </Text>

          <View style={styles.recallActions}>
            <TextInput
              placeholder="Título do recall (ex: Airbag)"
              containerStyle={styles.recallInputContainer}
              style={styles.recallInput}
            />

            <View style={styles.addButtonWrapper}>
              <View style={styles.addButtonShadow} />
              <InteractivePressable style={styles.addButton}>
                <Text style={styles.addButtonText}>Adicionar</Text>
              </InteractivePressable>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg + 3,
    paddingBottom: spacing.xxl + spacing.xxl,
  },
  sectionHeader: {
    marginTop: spacing.lg,
  },
  documentList: {
    marginTop: spacing.xl + spacing.sm + 2,
    gap: spacing.xl,
  },
  documentButtonWrapper: {
    height: spacing.xxl - spacing.sm + 2,
    marginRight: spacing.sm - 1,
  },
  documentButtonShadow: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.sm - 1,
    right: -(spacing.sm - 1),
    bottom: -spacing.xs,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: "transparent",
  },
  documentButton: {
    height: spacing.xxl - spacing.sm,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md + 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  documentButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  recallCard: {
    marginTop: spacing.xl + spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.black,
    paddingHorizontal: spacing.md - 2,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm + 2,
  },
  recallTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl + spacing.xs,
    color: colors.textPrimary,
  },
  recallDescription: {
    marginTop: spacing.xs - 2,
    maxWidth: 320,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    lineHeight: fontSize.md + spacing.xs,
    color: colors.textSecondary,
  },
  recallActions: {
    marginTop: spacing.md + 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md + 2,
  },
  recallInputContainer: {
    flex: 1,
    minHeight: spacing.xxl - spacing.xs,
    borderRadius: 0,
    backgroundColor: colors.grayLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md - 2,
  },
  recallInput: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  addButtonWrapper: {
    width: 108,
    height: spacing.xxl - spacing.sm,
    marginRight: 4,
  },
  addButtonShadow: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.xs,
    right: -spacing.xs,
    bottom: -spacing.xs,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: "transparent",
  },
  addButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
});
