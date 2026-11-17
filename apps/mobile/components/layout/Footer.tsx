import { Href, useRouter } from "expo-router";
import { Headphones, LifeBuoy } from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import Logo from "@/components/Logo";
import { customerServicePhone, roadsidePhone } from "@/constants/aftersales";
import { t } from "@/i18n";
import { colors, fonts, fontSize, layout, radius, spacing } from "@/theme";

const columns: { title: string; links: { label: string; route: Href }[] }[] = [
  {
    title: "After-sales",
    links: [
      { label: "Order status", route: "/tracking" },
      { label: "Book a service", route: "/schedule-service" },
      { label: "Maintenance plan", route: "/maintenance" },
      { label: "Warranty", route: "/warranty" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Toyota Store", route: "/store" },
      { label: "Points and rewards", route: "/rewards" },
      { label: "News and videos", route: "/news" },
      { label: "Dealerships", route: "/dealers" },
    ],
  },
  {
    title: "My account",
    links: [
      { label: "Profile", route: "/profile" },
      { label: "Financing", route: "/financing" },
      { label: "Documents", route: "/vehicle-management" },
      { label: "Toyota Assistant", route: "/assistant" },
    ],
  },
];

function FooterLink({ label, route }: { label: string; route: Href }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push(route)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      <Text style={[styles.link, isHovered && styles.linkHovered]}>
        {t(label)}
      </Text>
    </Pressable>
  );
}

export default function Footer() {
  const isMedium = useWindowDimensions().width >= layout.mediumBreakpoint;

  return (
    <View style={styles.footer}>
      <View style={styles.inner}>
        <View style={[styles.top, isMedium && styles.topWide]}>
          <View style={styles.brand}>
            <Logo size={fontSize.xl} inverse />
            <Text style={styles.brandText}>
              {t(
                "Everything about your Toyota after the purchase: order, services, financing and much more."
              )}
            </Text>
            <View style={styles.contact}>
              <Headphones size={16} strokeWidth={1.8} color={colors.primary} />
              <Text style={styles.contactText}>
                {t("Customer service")}: {customerServicePhone}
              </Text>
            </View>
            <View style={styles.contact}>
              <LifeBuoy size={16} strokeWidth={1.8} color={colors.primary} />
              <Text style={styles.contactText}>
                {t("Roadside assistance 24h")}: {roadsidePhone}
              </Text>
            </View>
          </View>
          <View style={styles.columns}>
            {columns.map((column) => (
              <View key={column.title} style={styles.column}>
                <Text style={styles.columnTitle}>{t(column.title)}</Text>
                {column.links.map((link) => (
                  <FooterLink
                    key={link.label}
                    label={link.label}
                    route={link.route}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
        <View style={styles.bottom}>
          <Text style={styles.copy}>
            {t("2026 ToyotaTech. All rights reserved.")}
          </Text>
          <Text style={styles.copy}>
            {t("Academic project developed with SENAI and Toyota.")}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    alignItems: "center",
    backgroundColor: colors.ink,
    marginTop: spacing.xl,
  },
  inner: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.xl + spacing.sm,
    paddingBottom: spacing.lg,
  },
  top: {
    gap: spacing.xl,
  },
  topWide: {
    flexDirection: "row",
  },
  brand: {
    flex: 1,
    minWidth: 240,
    gap: spacing.sm + 2,
  },
  brandText: {
    maxWidth: 320,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm + 1,
    lineHeight: 21,
    color: colors.textInverseMuted,
  },
  contact: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  contactText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.white,
  },
  columns: {
    flex: 1.6,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  column: {
    flexGrow: 1,
    flexBasis: 140,
    gap: spacing.sm + 2,
  },
  columnTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    letterSpacing: 1,
    color: colors.white,
    textTransform: "uppercase",
  },
  link: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm + 1,
    color: colors.textInverseMuted,
    borderRadius: radius.sm,
  },
  linkHovered: {
    color: colors.white,
    textDecorationLine: "underline",
  },
  bottom: {
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  copy: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs + 1,
    color: "rgba(255, 255, 255, 0.5)",
  },
});
