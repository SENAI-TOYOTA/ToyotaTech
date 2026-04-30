import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, Bell, CarFront, CircleDollarSign, User } from "lucide-react-native";

import Logo from "@/components/Logo";
import TextInput from "@/components/ui/TextInput";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";

const documentOptions = ["Nota fiscal", "CRLV-e", "Documentos", "Manual do veículo"];

export default function VehicleManagementScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <Logo size={fontSize.xxl + spacing.xs} />

          <Text style={styles.title}>Gestão do veículo</Text>
          <Text style={styles.subtitle}>Documentos digitais, lembretes e mais!</Text>

          <View style={styles.documentList}>
            {documentOptions.map((option) => (
              <View key={option} style={styles.documentButtonWrapper}>
                <View style={styles.documentButtonShadow} />
                <Pressable style={styles.documentButton}>
                  <Text style={styles.documentButtonText}>{option}</Text>
                  <ArrowRight size={30} strokeWidth={2.4} color={colors.black} />
                </Pressable>
              </View>
            ))}
          </View>

          <View style={styles.recallCard}>
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
                <Pressable style={styles.addButton}>
                  <Text style={styles.addButtonText}>Adicionar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.navigationBar}>
          <CircleDollarSign size={22} strokeWidth={1.8} color={colors.black} />
          <CarFront size={22} strokeWidth={1.8} color={colors.black} />
          <Bell size={22} strokeWidth={1.8} color={colors.black} />
          <User size={22} strokeWidth={1.8} color={colors.black} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.grayLight,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: spacing.md + spacing.xs,
    paddingHorizontal: spacing.lg + 3,
    paddingBottom: spacing.xxl + spacing.xxl,
  },
  title: {
    marginTop: spacing.xxl + spacing.md,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl + spacing.xs,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs - 2,
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.textSecondary,
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
  navigationBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: spacing.xxl + 2,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
});
