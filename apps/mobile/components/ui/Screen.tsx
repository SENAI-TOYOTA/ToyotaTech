import { ReactNode } from "react";
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";

import Footer from "@/components/layout/Footer";
import { colors, layout, spacing } from "@/theme";

interface ScreenProps {
  children: ReactNode;
  maxWidth?: number;
  contentStyle?: StyleProp<ViewStyle>;
  showFooter?: boolean;
}

export function useIsWide() {
  const { width } = useWindowDimensions();
  return width >= layout.wideBreakpoint;
}

export function useIsMedium() {
  const { width } = useWindowDimensions();
  return width >= layout.mediumBreakpoint;
}

export default function Screen({
  children,
  maxWidth = layout.maxContentWidth,
  contentStyle,
  showFooter = true,
}: ScreenProps) {
  const isMedium = useIsMedium();

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[
          styles.content,
          { maxWidth },
          isMedium && styles.contentMedium,
          contentStyle,
        ]}
      >
        {children}
      </View>
      {showFooter ? <Footer /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },
  content: {
    width: "100%",
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  contentMedium: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl + spacing.lg,
  },
});
