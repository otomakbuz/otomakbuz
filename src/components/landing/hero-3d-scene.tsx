"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Text } from "@react-three/drei";
import * as THREE from "three";

/**
 * Hero 3D Scene — Otomakbuz
 *
 * Arkada iPhone 17 Plus, önde süzülen kağıt dokulu fişler.
 * Brand renkleri: receipt-brown (#8B4513), receipt-gold (#D4A574), paper (#FAF8F3)
 */

// ─────────────────────────────────────────────────────────────
// Bulut Yükleme Sahnesi — fişler taranır, buluta yüklenir
// ─────────────────────────────────────────────────────────────
function Cloud() {
  const ref = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Group>(null);
  const puffsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.position.y = 1.9 + Math.sin(t * 0.6) * 0.08;
      ref.current.rotation.z = Math.sin(t * 0.3) * 0.02;
    }
    // Glow pulse — bulut canlı nefes alıyor
    if (glowRef.current) {
      const pulse = 1 + Math.sin(t * 1.2) * 0.08;
      glowRef.current.scale.set(pulse, pulse, pulse);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + Math.sin(t * 1.2) * 0.08;
    }
    // Alttaki halka — buluta veri çekiyormuş gibi dönsün
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.8;
      const rpulse = 1 + Math.sin(t * 2) * 0.15;
      ringRef.current.scale.set(rpulse, rpulse, 1);
    }
    // Yazı hafifçe yüzsün
    if (textRef.current) {
      textRef.current.position.y = 0.9 + Math.sin(t * 0.9) * 0.025;
    }
    // Bulut puff'ları hafif nefes alsın
    if (puffsRef.current) {
      const breathe = 1 + Math.sin(t * 0.9) * 0.015;
      puffsRef.current.scale.set(breathe, breathe, breathe);
    }
  });

  // Puff pozisyonları: [x, y, z, r] — derinlik katmanları ile 3D his
  const puffs: Array<[number, number, number, number]> = [
    // Arka katman
    [0, -0.05, -0.35, 0.58],
    [-0.5, 0.1, -0.28, 0.40],
    [0.55, 0.08, -0.30, 0.42],
    // Orta katman (ana gövde)
    [0, 0, 0, 0.65],
    [-0.58, -0.08, -0.05, 0.48],
    [0.60, -0.1, -0.03, 0.52],
    [-0.24, 0.30, 0.05, 0.46],
    [0.34, 0.27, 0.05, 0.48],
    // Ön katman — hafif dışarı çıkık
    [-0.90, 0.06, 0.15, 0.36],
    [0.92, 0.04, 0.18, 0.38],
    [0, 0.38, 0.12, 0.40],
    [-0.35, -0.18, 0.20, 0.32],
    [0.38, -0.16, 0.22, 0.30],
  ];

  return (
    <group ref={ref} position={[0, 1.9, 0]}>
      {/* Arka plan glow — sıcak altın halo */}
      <mesh ref={glowRef} position={[0, 0, -0.5]}>
        <circleGeometry args={[1.9, 48]} />
        <meshBasicMaterial color="#D4A574" transparent opacity={0.28} />
      </mesh>

      {/* "Otomakbuz" yazısı — bulutun üstünde sade */}
      <group ref={textRef} position={[0, 0.78, 0.3]}>
        <Text
          fontSize={0.24}
          color="#3B2C1F"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          outlineWidth={0.015}
          outlineColor="#FFFDF8"
        >
          Otomakbuz
        </Text>
      </group>

      {/* Bulut puff'ları — altın tonlu emissive */}
      <group ref={puffsRef}>
        {puffs.map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} castShadow>
            <sphereGeometry args={[r, 32, 32]} />
            <meshStandardMaterial
              color="#fefaf1"
              roughness={0.82}
              metalness={0.05}
              emissive="#D4A574"
              emissiveIntensity={0.25}
            />
          </mesh>
        ))}
      </group>

      {/* Alt halka — dönen upload göstergesi */}
      <mesh ref={ringRef} position={[0, -0.5, 0.18]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.14, 0.22, 32, 1, 0, Math.PI * 1.5]} />
        <meshBasicMaterial color="#D4A574" side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>

      {/* Alt ok — upload */}
      <Text
        position={[0, -0.52, 0.28]}
        fontSize={0.22}
        color="#8B4513"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        ↑
      </Text>
    </group>
  );
}

type ReceiptContent = {
  title: string;
  subtitle: string;
  date: string;
  items: Array<[string, string]>;
  total: string;
  totalLabel: string;
};

function UploadingReceipt({
  phase,
  xOffset,
  cycle = 5.0,
  content,
}: {
  phase: number;
  xOffset: number;
  cycle?: number;
  content: ReceiptContent;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const scanGlowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = ((state.clock.elapsedTime + phase) % cycle) / cycle; // 0..1

    let y: number, scale: number, rotZ: number;
    let scanY = -99; // scan line gizli
    let scanOpacity = 0;

    // Faz eşikleri — daha hızlı ritim, kısa idle
    const P1_END = 0.10;     // belir
    const IDLE_END = 0.18;   // kısa bekleme
    const SCAN_END = 0.62;   // tarama + yükselme
    const LAUNCH_END = 0.90; // buluta fırla
    const W = 0.95;
    const H = 1.38;

    if (t < P1_END) {
      // 1) Alt'tan belir — bounce easing
      const p = t / P1_END;
      const eased = 1 - Math.pow(1 - p, 3);
      y = -2.2 + eased * 0.4;
      scale = eased;
      rotZ = 0;
    } else if (t < IDLE_END) {
      // 1.5) Kısa bekleme — nefes al
      const p = (t - P1_END) / (IDLE_END - P1_END);
      y = -1.8 + Math.sin(p * Math.PI) * 0.02;
      scale = 1;
      rotZ = 0;
    } else if (t < LAUNCH_END) {
      // 2+3) Tarama, yükselme ve fırlatma — scan line tüm süre boyunca aktif
      const isScanning = t < SCAN_END;
      if (isScanning) {
        const p = (t - IDLE_END) / (SCAN_END - IDLE_END);
        y = -1.8 + p * 1.4;
        scale = 1;
        rotZ = Math.sin(p * Math.PI * 2) * 0.03;
      } else {
        const p = (t - SCAN_END) / (LAUNCH_END - SCAN_END);
        const eased = p * p * p;
        y = -0.4 + eased * 2.05;
        scale = 1 - eased * 0.9;
        rotZ = eased * 0.35;
      }

      // Scan line — idle sonundan fırlatma sonuna kadar sürekli süpürür
      const totalScanP = (t - IDLE_END) / (LAUNCH_END - IDLE_END); // 0..1 tüm tarama+fırlatma
      const sweepSpeed = 3; // toplam kaç süpürme
      const scanP = (totalScanP * sweepSpeed) % 1;
      scanY = (H / 2) - scanP * H;
      // Başta fade in, sona doğru fade out
      const fadeIn = Math.min(totalScanP / 0.05, 1);
      const fadeOut = totalScanP > 0.85 ? (1 - totalScanP) / 0.15 : 1;
      scanOpacity = 0.9 * fadeIn * fadeOut;
    } else {
      // 4) Görünmez
      y = 1.65;
      scale = 0.001;
      rotZ = 0;
    }

    groupRef.current.position.set(xOffset, y, 0);
    groupRef.current.scale.setScalar(Math.max(scale, 0.001) * 0.8);
    groupRef.current.rotation.z = rotZ;

    // Scan line pozisyonu
    if (scanRef.current) {
      scanRef.current.position.y = scanY;
      (scanRef.current.material as THREE.MeshBasicMaterial).opacity = scanOpacity;
    }
    if (scanGlowRef.current) {
      scanGlowRef.current.position.y = scanY;
      (scanGlowRef.current.material as THREE.MeshBasicMaterial).opacity = scanOpacity * 0.4;
    }
  });

  const W = 0.95;
  const H = 1.38;

  return (
    <group ref={groupRef}>
      {/* Fiş gövdesi */}
      <mesh castShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial
          color="#fdfaf2"
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Scan line — parlak yatay çizgi */}
      <mesh ref={scanRef} position={[0, -99, 0.01]}>
        <planeGeometry args={[W - 0.04, 0.02]} />
        <meshBasicMaterial color="#D4A574" transparent opacity={0} />
      </mesh>
      {/* Scan glow — çizginin etrafındaki ışık hüzmesi */}
      <mesh ref={scanGlowRef} position={[0, -99, 0.008]}>
        <planeGeometry args={[W - 0.02, 0.12]} />
        <meshBasicMaterial color="#D4A574" transparent opacity={0} />
      </mesh>

      {/* Başlık */}
      <Text
        position={[0, 0.55, 0.006]}
        fontSize={0.075}
        color="#2a1f17"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        maxWidth={W - 0.1}
      >
        {content.title}
      </Text>
      <Text
        position={[0, 0.47, 0.006]}
        fontSize={0.04}
        color="#8a7565"
        anchorX="center"
        anchorY="middle"
        maxWidth={W - 0.1}
      >
        {content.subtitle}
      </Text>
      <Text
        position={[0, 0.41, 0.006]}
        fontSize={0.038}
        color="#8a7565"
        anchorX="center"
        anchorY="middle"
      >
        {content.date}
      </Text>

      {/* Üst kesik çizgi */}
      <mesh position={[0, 0.36, 0.006]}>
        <planeGeometry args={[W - 0.1, 0.004]} />
        <meshBasicMaterial color="#c8b89a" />
      </mesh>

      {/* Ürün satırları */}
      {content.items.map(([name, price], i) => (
        <group key={i} position={[0, 0.28 - i * 0.085, 0.006]}>
          <Text
            position={[-W / 2 + 0.08, 0, 0]}
            fontSize={0.058}
            color="#2a1f17"
            anchorX="left"
            anchorY="middle"
          >
            {name}
          </Text>
          <Text
            position={[W / 2 - 0.08, 0, 0]}
            fontSize={0.058}
            color="#2a1f17"
            anchorX="right"
            anchorY="middle"
          >
            {price}
          </Text>
        </group>
      ))}

      {/* Alt kesik çizgi */}
      <mesh position={[0, -0.25, 0.006]}>
        <planeGeometry args={[W - 0.1, 0.004]} />
        <meshBasicMaterial color="#c8b89a" />
      </mesh>

      {/* Toplam etiketi + tutar */}
      <Text
        position={[-W / 2 + 0.08, -0.33, 0.006]}
        fontSize={0.065}
        color="#2a1f17"
        anchorX="left"
        anchorY="middle"
        fontWeight="bold"
      >
        {content.totalLabel}
      </Text>
      <Text
        position={[W / 2 - 0.08, -0.33, 0.006]}
        fontSize={0.075}
        color="#8B4513"
        anchorX="right"
        anchorY="middle"
        fontWeight="bold"
      >
        {content.total}
      </Text>

      {/* Barkod — ince çubuklar */}
      <group position={[0, -0.52, 0.006]}>
        {Array.from({ length: 24 }).map((_, i) => (
          <mesh key={i} position={[-0.3 + i * 0.026, 0, 0]}>
            <planeGeometry args={[i % 3 === 0 ? 0.006 : 0.003, 0.07]} />
            <meshBasicMaterial color="#2a1f17" />
          </mesh>
        ))}
      </group>

    </group>
  );
}

function UploadParticles() {
  const groupRef = useRef<THREE.Group>(null);
  const count = 16;
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        phase: (i / count) * 4.0 + Math.random() * 0.5,
        x: (i % 2 === 0 ? -1 : 1) * (0.1 + Math.random() * 0.7),
        speed: 0.7 + Math.random() * 0.6,
        size: 0.02 + Math.random() * 0.03,
        z: -0.1 + Math.random() * 0.3,
        // Renk tonu: altın ile kahve arası
        colorIdx: i % 3,
      })),
    []
  );

  const COLORS = ["#D4A574", "#C8956E", "#E0B890"];

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      const cycle = 3.2 / p.speed;
      const t = ((state.clock.elapsedTime + p.phase) % cycle) / cycle;
      // Spiral hareket — düz çizgi yerine hafif kıvrım
      child.position.y = -0.4 + t * 2.5;
      child.position.x = p.x * (1 - t * 0.85) + Math.sin(t * Math.PI * 3) * 0.08;
      child.position.z = p.z + Math.cos(t * Math.PI * 2) * 0.05;
      // Boyut: yukarı çıktıkça küçülsün
      const s = p.size * (1 - t * 0.5);
      child.scale.setScalar(s / p.size);
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = t < 0.1 ? t / 0.1 : t > 0.8 ? (1 - t) / 0.2 : 0.85;
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, -0.4, p.z]}>
          <sphereGeometry args={[p.size, 10, 10]} />
          <meshBasicMaterial color={COLORS[p.colorIdx]} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

const RECEIPT_CONTENTS: ReceiptContent[] = [
  {
    title: "MİGROS A.Ş.",
    subtitle: "Kadıköy Şb.",
    date: "03.04.2026",
    items: [
      ["Süt 1L", "₺32,50"],
      ["Ekmek", "₺15,00"],
      ["Yumurta", "₺85,00"],
      ["Peynir", "₺132,50"],
    ],
    totalLabel: "TOPLAM",
    total: "₺265,00",
  },
  {
    title: "SHELL YAKIT",
    subtitle: "Bağdat Cd.",
    date: "02.04.2026",
    items: [
      ["V-Power 95", "₺1.240"],
      ["Yağ Kontrol", "₺0,00"],
      ["KDV %20", "₺248,00"],
    ],
    totalLabel: "TOPLAM",
    total: "₺1.488",
  },
  {
    title: "TURKCELL",
    subtitle: "e-Fatura",
    date: "01.04.2026",
    items: [
      ["Hat Ücreti", "₺320,00"],
      ["İnternet", "₺180,00"],
      ["KDV %20", "₺100,00"],
    ],
    totalLabel: "TOPLAM",
    total: "₺600,00",
  },
];

function CloudUploadScene() {
  return (
    <group position={[2.6, 0, -0.1]}>
      <Cloud />
      <UploadingReceipt phase={0} xOffset={-0.55} content={RECEIPT_CONTENTS[0]} />
      <UploadingReceipt phase={1.9} xOffset={0.55} content={RECEIPT_CONTENTS[1]} />
      <UploadingReceipt phase={3.7} xOffset={0} content={RECEIPT_CONTENTS[2]} />
      <UploadParticles />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// Ana sahne
// ─────────────────────────────────────────────────────────────
export default function Hero3DScene() {
  return (
    <div
      aria-hidden
      style={{
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        {/* Aydınlatma — sıcak, titanyumu öne çıkaran */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[4, 6, 5]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        {/* Rose rim light — frame'in pembe tonu için */}
        <directionalLight
          position={[-4, 2, 3]}
          intensity={0.8}
          color="#ffd4c4"
        />
        <pointLight position={[0, -3, 3]} intensity={0.4} color="#D4A574" />
        <pointLight position={[3, 4, 2]} intensity={0.5} color="#ffffff" />

        {/* Ortam yansımaları */}
        <Suspense fallback={null}>
          <Environment preset="studio" />
        </Suspense>

        {/* Objeler */}
        <Suspense fallback={null}>
          <CloudUploadScene />
        </Suspense>

        {/* Yumuşak zemin gölgesi */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -2.5, 0]}
          receiveShadow
        >
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.18} />
        </mesh>
      </Canvas>
    </div>
  );
}
