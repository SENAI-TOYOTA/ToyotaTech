"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Loader2, Rotate3d } from "lucide-react";
import { Component, type ReactNode, Suspense, useState } from "react";

import CorollaModel from "@/components/3d/CorollaModel";

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
  className?: string;
}

export default function VehicleCanvas({
  height = 300,
  autoRotateSpeed = 0.8,
  color,
  paintColor,
  progress,
  sideProfileOnly = false,
  className = "",
}: VehicleCanvasProps) {
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const cameraPosition: [number, number, number] = sideProfileOnly
    ? [-4.85, 0.18, 0]
    : [0, 1.35, 4.4];
  const cameraFov = sideProfileOnly ? 34 : 40;

  const fallbackView = (
    <img
      src="/img/corolla.webp"
      alt="Toyota Corolla"
      className="size-full object-cover"
    />
  );

  return (
    <div
      style={{ minHeight: height }}
      className={`relative w-full overflow-hidden rounded-2xl bg-ink-soft select-none ${className}`}
    >
      <CanvasErrorBoundary fallback={fallbackView}>
        <Canvas
          style={{ width: "100%", height: "100%", minHeight: height }}
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
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-soft/75">
          <Loader2
            aria-hidden
            size={24}
            className="animate-spin text-primary"
          />
          <span className="text-xs font-medium text-fg-inverse-muted">
            Carregando modelo 3D...
          </span>
        </div>
      ) : null}

      {!sideProfileOnly ? (
        <div className="pointer-events-none absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full border border-white/15 bg-ink/75 px-3 py-1.5 text-xs font-semibold tracking-[0.3px] text-white">
          <Rotate3d aria-hidden size={14} strokeWidth={2.2} />
          <span>Arraste para girar 3D</span>
        </div>
      ) : null}
    </div>
  );
}
