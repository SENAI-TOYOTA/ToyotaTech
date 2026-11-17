/* eslint-disable react/no-unknown-property */
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Rotate3d } from "lucide-react-native";
import { Component, ReactNode, Suspense, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import CorollaModel from "@/components/3d/CorollaModel";
import { useIsWide } from "@/components/ui/Screen";
import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

const fallbackCarImage = require("@/assets/images/corolla-main.png");

interface CanvasErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  state: CanvasErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export interface VehicleCanvasProps {
  height?: number;
  autoRotateSpeed?: number;
  color?: string;
  paintColor?: string;
  progress?: number;
  sideProfileOnly?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function VehicleCanvas({
  height,
  autoRotateSpeed = 0.8,
  color,
  paintColor,
  progress,
  sideProfileOnly = false,
  style,
}: VehicleCanvasProps) {
  const isWide = useIsWide();
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const resolvedHeight = height ?? (isWide ? 280 : 250);
  const cameraPosition: [number, number, number] = sideProfileOnly
    ? [isWide ? -4.85 : -5.4, 0.18, 0]
    : [0, 1.35, 4.4];
  const cameraFov = sideProfileOnly ? 34 : 40;

  const fallbackView = (
    <Image
      source={fallbackCarImage}
      style={styles.fallbackImage}
      resizeMode="cover"
    />
  );

  return (
    <View
      style={[
        styles.container,
        { height: resolvedHeight },
        isWide && styles.containerWide,
        style,
      ]}
    >
      <CanvasErrorBoundary fallback={fallbackView}>
        <Canvas
          style={styles.canvas}
          camera={{
            position: cameraPosition,
            fov: cameraFov,
            near: 0.1,
            far: 100,
          }}
          onCreated={({ gl, scene, camera }) => {
            gl.localClippingEnabled = true;
            scene.environmentIntensity = 1.0;
            if (sideProfileOnly) {
              camera.lookAt(0, 0.05, 0);
            }
          }}
        >
          <ambientLight intensity={1.35} />
          <hemisphereLight args={["#ffffff", "#232630", 1.05]} />

          <directionalLight position={[0, 2.6, 6]} intensity={2.6} />
          <directionalLight position={[3.8, 3.8, 4.2]} intensity={2.0} />
          <directionalLight position={[-3.8, 3.8, 4.2]} intensity={2.0} />
          <directionalLight position={[-5.5, 2.4, 0]} intensity={2.2} />
          <directionalLight position={[0, 4.5, -5]} intensity={1.2} />
          <directionalLight position={[-4, 3, -4]} intensity={1.2} />

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.78, 0]}>
            <circleGeometry args={[2.1, 48]} />
            <meshBasicMaterial color="#0b0c10" transparent opacity={0.45} />
          </mesh>

          <OrbitControls
            enabled={!sideProfileOnly}
            enableZoom={false}
            enablePan={false}
            autoRotate={!sideProfileOnly}
            autoRotateSpeed={autoRotateSpeed}
            target={sideProfileOnly ? [0, 0.05, 0] : [0, 0, 0]}
            maxPolarAngle={Math.PI / 2.1}
            minPolarAngle={Math.PI / 4}
          />

          <Suspense fallback={null}>
            <CorollaModel
              color={color}
              paintColor={paintColor}
              progress={progress}
              onLoaded={() => setIsModelLoaded(true)}
            />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>

      {!isModelLoaded ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>{t("Loading 3D model...")}</Text>
        </View>
      ) : null}

      {!sideProfileOnly ? (
        <View style={styles.badge} pointerEvents="none">
          <Rotate3d size={14} strokeWidth={2.2} color={colors.white} />
          <Text style={styles.badgeText}>{t("Drag to rotate 3D")}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 240,
    backgroundColor: colors.inkSoft,
    borderRadius: radius.xl,
    overflow: "hidden",
    position: "relative",
  },
  containerWide: {
    flex: 1,
    minHeight: 280,
  },
  canvas: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  fallbackImage: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(29, 31, 38, 0.72)",
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textInverseMuted,
  },
  badge: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: "rgba(17, 18, 22, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  badgeText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: colors.white,
    letterSpacing: 0.3,
  },
});
