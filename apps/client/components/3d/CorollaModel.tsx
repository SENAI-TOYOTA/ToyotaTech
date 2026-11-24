"use client";

import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  Box3,
  BufferGeometry,
  Color,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Plane,
  Quaternion,
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

interface WireframeMeshPart {
  key: string;
  geometry: BufferGeometry;
  position: [number, number, number];
  quaternion: [number, number, number, number];
  scale: [number, number, number];
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
  const gltf = useGLTF(COROLLA_MODEL_URI, true);
  const invalidate = useThree((state) => state.invalidate);
  const isProgressMode = typeof progress === "number";
  const resolvedHex = resolveCarColor(paintColor ?? color);

  const solidClipPlane = useMemo(() => new Plane(new Vector3(0, 0, -1), 0), []);
  const wireClipPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), []);

  const wireMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: "#9CA3AF",
        wireframe: true,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        clippingPlanes: [wireClipPlane],
      }),
    [wireClipPlane],
  );

  useEffect(() => {
    return () => {
      wireMaterial.dispose();
    };
  }, [wireMaterial]);

  const {
    solidScene,
    wireframeParts,
    clonedMaterials,
    normalizedScale,
    centeredOffset,
    worldSize,
  } = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.updateMatrixWorld(true);

    const targetColor = new Color(resolvedHex);
    const createdMaterials: Material[] = [];
    const wireParts: WireframeMeshPart[] = [];
    const materialCache = new Map<Material, Material>();

    const configureSolidMaterial = (mat: Material): Material => {
      const cached = materialCache.get(mat);
      if (cached) {
        return cached;
      }

      const isPaint = Boolean(
        mat.name && mat.name.toLowerCase().includes("paint"),
      );
      if (!isPaint && !isProgressMode) {
        return mat;
      }

      const clonedMat = mat.clone();
      if (isProgressMode) {
        clonedMat.clippingPlanes = [solidClipPlane];
        clonedMat.clipShadows = true;
      }
      if (isPaint) {
        const pbrMat = clonedMat as MeshPhysicalMaterial | MeshStandardMaterial;
        pbrMat.metalness = 0.3;
        pbrMat.roughness = 0.25;
        pbrMat.color.copy(targetColor);
        if ("clearcoat" in pbrMat) {
          (pbrMat as MeshPhysicalMaterial).clearcoat = 0.85;
          (pbrMat as MeshPhysicalMaterial).clearcoatRoughness = 0.12;
        }
      }
      materialCache.set(mat, clonedMat);
      createdMaterials.push(clonedMat);
      return clonedMat;
    };

    const tempPos = new Vector3();
    const tempQuat = new Quaternion();
    const tempScale = new Vector3();
    let partIdx = 0;

    clone.traverse((child) => {
      const mesh = child as Mesh;
      if (mesh.isMesh && mesh.material) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(configureSolidMaterial);
        } else {
          mesh.material = configureSolidMaterial(mesh.material);
        }

        if (isProgressMode && mesh.geometry) {
          mesh.matrixWorld.decompose(tempPos, tempQuat, tempScale);
          wireParts.push({
            key: `wire-${partIdx++}`,
            geometry: mesh.geometry,
            position: [tempPos.x, tempPos.y, tempPos.z],
            quaternion: [tempQuat.x, tempQuat.y, tempQuat.z, tempQuat.w],
            scale: [tempScale.x, tempScale.y, tempScale.z],
          });
        }
      }
    });

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
      wireframeParts: wireParts,
      clonedMaterials: createdMaterials,
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
  }, [gltf.scene, resolvedHex, isProgressMode, solidClipPlane]);

  useEffect(() => {
    return () => {
      for (const mat of clonedMaterials) {
        mat.dispose();
      }
    };
  }, [clonedMaterials]);

  useEffect(() => {
    if (onLoaded) {
      onLoaded();
    }
    invalidate();
  }, [onLoaded, invalidate]);

  const clampedProgress = Math.max(0, Math.min(100, progress ?? 100));
  const isZLongitudinal = worldSize.z >= worldSize.x;
  const longitudinalSpan = (isZLongitudinal ? worldSize.z : worldSize.x) * scale;
  const halfLength = longitudinalSpan / 2 + 0.02;
  const cutCoord = -halfLength + (clampedProgress / 100) * (halfLength * 2);

  useEffect(() => {
    if (isZLongitudinal) {
      solidClipPlane.setComponents(0, 0, -1, cutCoord);
      wireClipPlane.setComponents(0, 0, 1, -cutCoord);
    } else {
      solidClipPlane.setComponents(-1, 0, 0, cutCoord);
      wireClipPlane.setComponents(1, 0, 0, -cutCoord);
    }
    invalidate();
  }, [solidClipPlane, wireClipPlane, isZLongitudinal, cutCoord, invalidate]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={centeredOffset} scale={normalizedScale}>
        <primitive object={solidScene} />
        {isProgressMode
          ? wireframeParts.map((part) => (
              <mesh
                key={part.key}
                geometry={part.geometry}
                material={wireMaterial}
                position={part.position}
                quaternion={part.quaternion}
                scale={part.scale}
              />
            ))
          : null}
      </group>
    </group>
  );
}
