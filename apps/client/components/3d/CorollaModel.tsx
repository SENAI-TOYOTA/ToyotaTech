"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import {
  Box3,
  Color,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Plane,
  Vector3,
} from "three";

export const COROLLA_MODEL_URI = "/models/corolla.glb";

export interface CorollaModelProps {
  scale?: number;
  color?: string;
  paintColor?: string;
  progress?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onLoaded?: () => void;
}

export function resolveCarColor(inputColor?: string): string {
  if (!inputColor) {
    return "#F4F5F7";
  }
  const trimmed = inputColor.trim();
  if (trimmed.startsWith("#")) {
    return trimmed;
  }
  const normalized = trimmed.toLowerCase();
  if (
    normalized.includes("branco") ||
    normalized.includes("pearl") ||
    normalized.includes("white") ||
    normalized.includes("perola") ||
    normalized.includes("pérola")
  ) {
    return "#F4F5F7";
  }
  if (
    normalized.includes("prata") ||
    normalized.includes("silver") ||
    normalized.includes("metalico") ||
    normalized.includes("metálico") ||
    normalized.includes("metallic")
  ) {
    return "#C0C4CC";
  }
  if (
    normalized.includes("preto") ||
    normalized.includes("black") ||
    normalized.includes("eclipse")
  ) {
    return "#17181c";
  }
  if (
    normalized.includes("cinza") ||
    normalized.includes("gray") ||
    normalized.includes("grey")
  ) {
    return "#4a4e54";
  }
  if (
    normalized.includes("vermelho") ||
    normalized.includes("red") ||
    normalized.includes("granada")
  ) {
    return "#EB0A1E";
  }
  if (normalized.includes("azul") || normalized.includes("blue")) {
    return "#122a4d";
  }
  return "#F4F5F7";
}

export default function CorollaModel({
  scale = 1,
  color,
  paintColor,
  progress,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onLoaded,
}: CorollaModelProps) {
  const gltf = useGLTF(COROLLA_MODEL_URI, false, false);
  const isProgressMode = typeof progress === "number";
  const resolvedHex = resolveCarColor(paintColor ?? color);

  const solidClipPlane = useMemo(() => new Plane(new Vector3(0, 0, -1), 2), []);
  const wireClipPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), 2), []);

  useEffect(() => {
    if (onLoaded) {
      onLoaded();
    }
  }, [onLoaded]);

  const {
    solidScene,
    wireframeScene,
    normalizedScale,
    centeredOffset,
    worldSize,
  } = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.updateMatrixWorld(true);

    const targetColor = new Color(resolvedHex);

    clone.traverse((child) => {
      const mesh = child as Mesh;
      if (mesh.isMesh && mesh.material) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const configureSolidMaterial = (mat: Material): Material => {
          const clonedMat = mat.clone();
          if (isProgressMode) {
            clonedMat.clippingPlanes = [solidClipPlane];
            clonedMat.clipShadows = true;
          }
          if (mat.name && mat.name.toLowerCase().includes("paint")) {
            const pbrMat = clonedMat as
              | MeshPhysicalMaterial
              | MeshStandardMaterial;
            pbrMat.metalness = 0.3;
            pbrMat.roughness = 0.25;
            pbrMat.color.copy(targetColor);
            if ("clearcoat" in pbrMat) {
              (pbrMat as MeshPhysicalMaterial).clearcoat = 0.85;
              (pbrMat as MeshPhysicalMaterial).clearcoatRoughness = 0.12;
            }
          }
          return clonedMat;
        };

        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(configureSolidMaterial);
        } else {
          mesh.material = configureSolidMaterial(mesh.material);
        }
      }
    });

    let wireClone: typeof clone | null = null;
    if (isProgressMode) {
      wireClone = gltf.scene.clone(true);
      wireClone.updateMatrixWorld(true);

      const wireMat = new MeshBasicMaterial({
        color: "#9CA3AF",
        wireframe: true,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        clippingPlanes: [wireClipPlane],
      });

      wireClone.traverse((child) => {
        const mesh = child as Mesh;
        if (mesh.isMesh) {
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          mesh.material = wireMat;
        }
      });
    }

    const box = new Box3().setFromObject(clone);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDimension = Math.max(size.x, size.y, size.z);
    const targetSpan = 3.4;
    const fitScale = maxDimension > 0 ? targetSpan / maxDimension : 1;

    return {
      solidScene: clone,
      wireframeScene: wireClone,
      normalizedScale: fitScale,
      centeredOffset: [
        -center.x * fitScale,
        -center.y * fitScale,
        -center.z * fitScale,
      ] as [number, number, number],
      worldSize: new Vector3(
        size.x * fitScale,
        size.y * fitScale,
        size.z * fitScale,
      ),
    };
  }, [gltf.scene, resolvedHex, isProgressMode, solidClipPlane, wireClipPlane]);

  const clampedProgress = Math.max(0, Math.min(100, progress ?? 100));
  const halfLength = (worldSize.z * scale) / 2 + 0.03;
  const cutZ = -halfLength + (clampedProgress / 100) * (halfLength * 2);

  solidClipPlane.normal.set(0, 0, -1);
  solidClipPlane.constant = cutZ;
  wireClipPlane.normal.set(0, 0, 1);
  wireClipPlane.constant = -cutZ;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={centeredOffset} scale={normalizedScale}>
        <primitive object={solidScene} />
        {isProgressMode && wireframeScene ? (
          <primitive object={wireframeScene} />
        ) : null}
      </group>
    </group>
  );
}
