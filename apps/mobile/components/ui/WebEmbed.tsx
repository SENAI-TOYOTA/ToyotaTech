import { createElement } from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { colors, radius } from "@/theme";

interface WebEmbedProps {
  src: string;
  title: string;
  style?: StyleProp<ViewStyle>;
}

export default function WebEmbed({ src, title, style }: WebEmbedProps) {
  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {createElement("iframe", {
        src,
        title,
        loading: "lazy",
        allow:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowFullScreen: true,
        referrerPolicy: "no-referrer-when-downgrade",
        style: { border: 0, width: "100%", height: "100%" },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
});
