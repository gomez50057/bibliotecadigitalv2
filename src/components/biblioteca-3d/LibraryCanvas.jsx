"use client";

import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  Preload,
  RoundedBox,
  Text,
  useTexture
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { CATEGORY_LABELS, SUBCATEGORY_LABELS } from "@/config/taxonomy";
import styles from "./BibliotecaDigital3D.module.css";

const SHELF_Y = [3.05, -6.8];
const BOOKS_PER_SHELF = 12;
const WOOD = "/textures/wood/walnut-premium.webp";
const SHELF_SUPPORT_X = [-10.65, 10.65];
const BOOK_WIDTHS = [1.43, 1.62, 1.52, 1.73, 1.45];
const BOOK_HEIGHTS = [6.1, 6.71, 6.34, 7.02, 6.49, 6.27];
const BOOK_ROTATIONS = [-0.018, 0.008, 0, 0.014, -0.01, 0.018];
const BOOK_COLORS = ["#566456", "#f2efe7", "#6b5d4b", "#7d1735", "#4f665b", "#9a805f"];
const PAGE_LINE_OFFSETS = [-0.3, -0.18, -0.06, 0.06, 0.18, 0.3];

function useTiledTexture(src, repeatX, repeatY, colorSpace = THREE.SRGBColorSpace) {
  const source = useTexture(src);
  return useMemo(() => {
    const texture = source.clone();
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.colorSpace = colorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }, [source, repeatX, repeatY, colorSpace]);
}

function BrassMaterial({ roughness = 0.24 }) {
  return <meshStandardMaterial color="#c7a55a" metalness={0.9} roughness={roughness} />;
}

function useBookTexture() {
  return useMemo(() => {
    const size = 96;
    const data = new Uint8Array(size * size);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const fiber = ((x * 13 + y * 7) % 17) * 2;
        const vertical = x % 5 === 0 ? 18 : 0;
        data[y * size + x] = 116 + fiber + vertical;
      }
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RedFormat);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.5, 8);
    texture.needsUpdate = true;
    return texture;
  }, []);
}

function StaticShelves({ activeCategory, documents }) {
  const woodMap = useTiledTexture(WOOD, 4.4, 1);
  const woodBump = useTiledTexture(WOOD, 4.4, 1, THREE.NoColorSpace);
  const woodProps = { map: woodMap, bumpMap: woodBump, bumpScale: 0.04, roughness: 0.42, metalness: 0.02 };

  return (
    <group position={[0, 0.05, -0.22]}>
      {SHELF_Y.map((shelfY, index) => {
        const shelfDocuments = documents.slice(index * BOOKS_PER_SHELF, (index + 1) * BOOKS_PER_SHELF);
        const active = shelfDocuments.length > 0;
        const shelfCategoryKeys = [...new Set(shelfDocuments.map((document) => document.categoryKey))];
        const subcategories = [...new Set(shelfDocuments.map((document) => document.subcategory))];
        const categoryLabel = active
          ? shelfCategoryKeys.length === 1 ? CATEGORY_LABELS[shelfCategoryKeys[0]] : "Acervo mixto"
          : CATEGORY_LABELS[activeCategory] || "Acervo";
        const sectionLabel = active
          ? subcategories.length === 1 ? SUBCATEGORY_LABELS[subcategories[0]] : "Varias subcategorias"
          : "Disponible";
        return (
          <group key={shelfY}>
            <RoundedBox position={[0, shelfY - 0.44, 0.52]} args={[24, 0.38, 1.26]} radius={0.035} smoothness={3} castShadow receiveShadow>
              <meshStandardMaterial
                {...woodProps}
                color={active ? "#af7955" : "#9d6b4d"}
                emissive="#000"
              />
            </RoundedBox>
            <mesh position={[0, shelfY - 0.29, 0.98]}>
              <boxGeometry args={[23.5, 0.04, 0.052]} />
              <meshStandardMaterial color="#b69352" metalness={0.6} roughness={0.34} />
            </mesh>
            {SHELF_SUPPORT_X.map((x) => (
              <RoundedBox key={x} position={[x, shelfY - 0.72, 0.36]} args={[0.34, 0.52, 0.24]} radius={0.035} smoothness={3} castShadow>
                <BrassMaterial roughness={0.34} />
              </RoundedBox>
            ))}
            <RoundedBox position={[0, shelfY + 7.95, 1.02]} args={[9.2, 1.4, 0.12]} radius={0.18} smoothness={8} castShadow>
              <meshStandardMaterial color="#8a1736" roughness={0.7} metalness={0.01} />
            </RoundedBox>
            <RoundedBox position={[0, shelfY + 7.95, 1.095]} args={[9.08, 1.28, 0.055]} radius={0.16} smoothness={8}>
              <meshStandardMaterial color="#fbfaf7" roughness={0.8} metalness={0} />
            </RoundedBox>
            <Text
              position={[0, shelfY + 8.17, 1.18]}
              fontSize={Math.min(0.44, 7.4 / categoryLabel.length)}
              color="#8a1736"
              maxWidth={7.4}
              whiteSpace="nowrap"
              anchorX="center"
              anchorY="middle"
              textAlign="center"
              letterSpacing={0.1}
            >
              {categoryLabel.toUpperCase()}
            </Text>
            <Text
              position={[0, shelfY + 7.73, 1.182]}
              fontSize={Math.min(0.23, 6.6 / sectionLabel.length)}
              color="#8a1736"
              maxWidth={7.4}
              whiteSpace="nowrap"
              anchorX="center"
              anchorY="middle"
              textAlign="center"
              letterSpacing={0.055}
            >
              {sectionLabel.toUpperCase()}
            </Text>
            <pointLight
              position={[0, shelfY - 0.16, 1.32]}
              color="#edc97a"
              intensity={active ? 0.3 : 0.06}
              distance={4.4}
              decay={2}
            />
          </group>
        );
      })}
    </group>
  );
}

function Book({ document, index, shelfIndex, selected, onSelect, tooltipPortal }) {
  const ref = useRef(null);
  const scaleRef = useRef(new THREE.Vector3(1, 1, 1));
  const [hovered, setHovered] = useState(false);
  const visualIndex = shelfIndex % 2 === 0 ? index : BOOKS_PER_SHELF - index - 1;
  const width = BOOK_WIDTHS[visualIndex % BOOK_WIDTHS.length];
  const height = BOOK_HEIGHTS[visualIndex % BOOK_HEIGHTS.length];
  const depth = 0.44 + (visualIndex % 3) * 0.025;
  const x = -9.15 + index * 1.68;
  const baseY = SHELF_Y[shelfIndex] + height / 2 - 0.34;
  const baseRotation = BOOK_ROTATIONS[visualIndex % BOOK_ROTATIONS.length];
  const active = hovered || selected;
  const targetY = selected ? baseY + 0.12 : hovered ? baseY + 0.09 : baseY;
  const targetZ = selected ? 1.28 : hovered ? 1.08 : 0.58;
  const targetRotationY = selected ? -0.12 : hovered ? -0.085 : 0;
  const targetRotationZ = selected ? 0 : hovered ? baseRotation * 0.25 : baseRotation;
  const targetScale = selected ? 1.075 : hovered ? 1.045 : 1;
  const bookColor = BOOK_COLORS[visualIndex % BOOK_COLORS.length];
  const lightBook = bookColor === "#f2efe7";
  const trimColor = lightBook ? "#9b8f78" : "#8f8060";
  const labelColor = lightBook ? "#e6dfd1" : "#f3eee4";
  const labelBorderColor = lightBook ? "#b8ad98" : "#a99b82";
  const pageColor = lightBook ? "#f8f4ea" : "#e9dfc7";
  const titleColor = "#202a31";
  const spineTitleWidth = height * 0.52;
  const spineTitleSize = Math.min(0.16, Math.sqrt((spineTitleWidth * width * 0.42) / (document.title.length * 0.72)));
  const spineColor = lightBook ? "#d6cfc0" : "#5d5146";
  const bookTexture = useBookTexture();

  useEffect(() => {
    if (!ref.current) return;
    ref.current.position.set(x, baseY - 0.32, 0.28);
    ref.current.scale.setScalar(0.95);
  }, [document.id, x, baseY]);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.14);
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetZ, 0.14);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetRotationY, 0.13);
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, targetRotationZ, 0.13);
    scaleRef.current.set(targetScale, targetScale, targetScale);
    ref.current.scale.lerp(scaleRef.current, 0.14);
  });

  return (
    <group
      ref={ref}
      position={[x, baseY, 0.58]}
      rotation={[0, 0, baseRotation]}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered(true);
        if (globalThis.document?.body) globalThis.document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        setHovered(false);
        if (globalThis.document?.body) globalThis.document.body.style.cursor = "default";
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(document);
      }}
    >
      <RoundedBox args={[width, height, depth]} radius={0.012} smoothness={2} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={bookColor}
          roughness={0.94}
          metalness={0.005}
          clearcoat={0}
          clearcoatRoughness={1}
          bumpMap={bookTexture}
          bumpScale={0.012}
          emissive={selected ? "#8a6a2e" : hovered ? "#3a2d18" : "#000"}
          emissiveIntensity={selected ? 0.12 : hovered ? 0.03 : 0}
        />
      </RoundedBox>
      <RoundedBox position={[-width * 0.1, 0, depth / 2 + 0.006]} args={[width * 0.78, height * 0.92, 0.018]} radius={0.008} smoothness={2} castShadow>
        <meshPhysicalMaterial color={bookColor} roughness={0.92} metalness={0.004} clearcoat={0} bumpMap={bookTexture} bumpScale={0.01} />
      </RoundedBox>
      <mesh position={[-width * 0.43, 0, depth / 2 + 0.026]}>
        <boxGeometry args={[0.048, height * 0.9, 0.018]} />
        <meshStandardMaterial color={spineColor} roughness={0.84} />
      </mesh>
      {[-height * 0.34, height * 0.34].map((y) => (
        <mesh key={y} position={[0, y, depth / 2 + 0.026]} castShadow>
          <boxGeometry args={[width * 0.62, 0.01, 0.012]} />
          <meshStandardMaterial color={trimColor} metalness={0.03} roughness={0.78} />
        </mesh>
      ))}
      {[-width * 0.33, width * 0.33].map((edge) => (
        <mesh key={edge} position={[edge, 0, depth / 2 + 0.028]}>
          <boxGeometry args={[0.008, height * 0.78, 0.012]} />
          <meshStandardMaterial color={trimColor} metalness={0.02} roughness={0.82} />
        </mesh>
      ))}
      <mesh position={[0, 0, depth / 2 + 0.03]}>
        <boxGeometry args={[width * 0.54, height * 0.72, 0.018]} />
        <meshStandardMaterial color={labelColor} roughness={0.78} metalness={0.01} />
      </mesh>
      <mesh position={[0, 0, depth / 2 + 0.043]}>
        <boxGeometry args={[width * 0.56, height * 0.74, 0.006]} />
        <meshStandardMaterial color={labelBorderColor} metalness={0.01} roughness={0.84} />
      </mesh>
      <mesh position={[0, 0, depth / 2 + 0.049]}>
        <boxGeometry args={[width * 0.51, height * 0.69, 0.007]} />
        <meshStandardMaterial color={labelColor} roughness={0.82} metalness={0} />
      </mesh>
      <mesh position={[0, height * 0.23, depth / 2 + 0.055]}>
        <boxGeometry args={[width * 0.34, 0.026, 0.008]} />
        <meshStandardMaterial color="#7d1735" metalness={0.01} roughness={0.78} />
      </mesh>
      <Text
        position={[0, -height * 0.04, depth / 2 + 0.057]}
        rotation={[0, 0, Math.PI / 2]}
        fontSize={spineTitleSize}
        color={titleColor}
        maxWidth={spineTitleWidth}
        lineHeight={1.05}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0}
      >
        {document.title.toUpperCase()}
      </Text>
      <Text
        position={[0, height * 0.27, depth / 2 + 0.058]}
        fontSize={0.095}
        color={titleColor}
        maxWidth={width * 0.38}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0}
      >
        {document.year}
      </Text>
      <mesh position={[width / 2 - 0.015, 0, 0]} castShadow>
        <boxGeometry args={[0.018, height * 0.9, depth * 0.76]} />
        <meshStandardMaterial color={pageColor} roughness={0.96} />
      </mesh>
      {PAGE_LINE_OFFSETS.map((offset) => (
        <mesh key={offset} position={[width / 2 - 0.004, height * offset, 0]}>
          <boxGeometry args={[0.006, 0.006, depth * 0.66]} />
          <meshStandardMaterial color="#cfc4ae" roughness={0.98} />
        </mesh>
      ))}
      {selected && <pointLight position={[0, 0, 0.6]} color="#d8bd78" intensity={0.62} distance={2} decay={2} />}
      {hovered && (
        <Html
          center
          portal={tooltipPortal}
          position={[0, height / 2 + 0.18, depth / 2 + 0.42]}
          className={styles.bookTooltip}
          zIndexRange={[1000, 100]}
        >
          <strong>{document.title}</strong>
          <span>
            {CATEGORY_LABELS[document.categoryKey]} - {SUBCATEGORY_LABELS[document.subcategory]} - {document.year}
          </span>
        </Html>
      )}
    </group>
  );
}

function Scene({ documents, activeCategory, selectedDocument, onSelect, tooltipPortal }) {
  return (
    <>
      <mesh position={[0, 0, -1.15]}>
        <planeGeometry args={[80, 44]} />
        <meshBasicMaterial color="#f5f3f5" toneMapped={false} />
      </mesh>
      <ambientLight intensity={0.7} color="#fff7ed" />
      <hemisphereLight intensity={0.62} color="#fff8ee" groundColor="#5b3628" />
      <directionalLight position={[0, 3, 8]} intensity={1.1} color="#fff4df" />
      <spotLight
        castShadow
        position={[5.5, 7.5, 6]}
        angle={0.55}
        penumbra={0.8}
        intensity={2.8}
        color="#f5dfba"
        shadow-mapSize={[1536, 1536]}
        shadow-bias={-0.00025}
      />
      <spotLight position={[-5, 4.6, 5]} angle={0.7} penumbra={1} intensity={1.6} color="#a9d9f0" />
      <spotLight position={[0, 5.5, -1]} angle={0.68} penumbra={1} intensity={1.15} color="#d1a958" />
      <StaticShelves activeCategory={activeCategory} documents={documents} />
      {documents.map((document, index) => (
        <Book
          key={document.id}
          document={document}
          index={index % BOOKS_PER_SHELF}
          shelfIndex={Math.floor(index / BOOKS_PER_SHELF)}
          selected={selectedDocument?.id === document.id}
          onSelect={onSelect}
          tooltipPortal={tooltipPortal}
        />
      ))}
      <ContactShadows position={[0, -7.55, 0.5]} opacity={0.24} scale={25} blur={2.6} far={5} resolution={512} color="#3b2118" />
      <Environment resolution={256}>
        <Lightformer intensity={2.4} color="#fff0d5" position={[0, 5, 3]} scale={[7, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer intensity={1.8} color="#b7dff0" position={[-6, 0, 2]} scale={[2, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer intensity={1.1} color="#c9a24a" position={[6, 1, 0]} scale={[2, 5, 1]} rotation-y={-Math.PI / 2} />
      </Environment>
      <Preload all />
    </>
  );
}

export default function LibraryCanvas(props) {
  return (
    <Canvas
      className={styles.canvas}
      camera={{ position: [-0.2, 0.9, 29], fov: 48, near: 0.1, far: 48 }}
      dpr={[1, 1.5]}
      shadows
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={({ gl }) => {
        gl.setClearColor("#000000", 0);
        gl.toneMappingExposure = 1.08;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
      onPointerMissed={() => props.onSelect(null)}
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}
