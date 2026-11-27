import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, View } from "react-native";

import VehicleFallback from "@/components/ui/VehicleFallback";

interface VehicleImageProps {
  model?: string;
  version?: string;
  color?: string;
  chassi?: string;
  variant?: "hero" | "card";
  imageUrl?: string;
  fallbackSource?: ImageSourcePropType;
  children?: ReactNode;
}

export default function VehicleImage({
  model,
  version,
  color,
  chassi,
  variant = "hero",
  imageUrl,
  fallbackSource,
  children,
}: VehicleImageProps) {
  const [remoteFailed, setRemoteFailed] = useState(false);

  useEffect(() => {
    setRemoteFailed(false);
  }, [imageUrl]);

  if (imageUrl && !remoteFailed) {
    return (
      <View style={styles.fill}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.fill}
          resizeMode="cover"
          onError={() => setRemoteFailed(true)}
        />
        {children}
      </View>
    );
  }

  if (fallbackSource) {
    return (
      <View style={styles.fill}>
        <Image source={fallbackSource} style={styles.fill} resizeMode="cover" />
        {children}
      </View>
    );
  }

  return (
    <VehicleFallback
      model={model}
      version={version}
      color={color}
      chassi={chassi}
      variant={variant}
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    width: "100%",
    height: "100%",
  },
});
