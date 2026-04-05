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

  // Puff pozisyonları: [x, y, z, r]
  const puffs: Array<[number, number, number, number]> = [
    [0, 0, 0, 0.62],
    [-0.55, -0.08, 0, 0.46],
    [0.58, -0.1, 0, 0.50],
    [-0.22, 0.28, 0.05, 0.44],
    [0.32, 0.25, 0.05, 0.46],
    [-0.88, 0.08, -0.05, 0.34],
    [0.9, 0.05, -0.05, 0.36],
    [0, 0.35, -0.1, 0.38],
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
  cycle = 5.5,
  content,
}: {
  phase: number;
  xOffset: number;
  cycle?: number;
  content: ReceiptContent;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = ((state.clock.elapsedTime + phase) % cycle) / cycle; // 0..1

    let y: number, scale: number, rotZ: number;

    // Faz eşikleri — cycle 5.5s. Sıra: belir → 1s bekle → tara → buluta fırla → kaybol
    // 1s idle = 1/5.5 ≈ 0.182 cycle
    const P1_END = 0.12;     // belir
    const IDLE_END = 0.30;   // +1s bekleme (tarama öncesi)
    const SCAN_END = 0.72;   // tarama bitişi
    const LAUNCH_END = 0.94; // buluta fırla bitişi

    if (t < P1_END) {
      // 1) Alt'tan belir
      const p = t / P1_END;
      y = -2.2 + p * 0.4;
      scale = p;
      rotZ = 0;
    } else if (t < IDLE_END) {
      // 1.5) 1 saniye bekle — hafif yüzer, henüz taranmıyor
      const p = (t - P1_END) / (IDLE_END - P1_END);
      y = -1.8 + Math.sin(p * Math.PI) * 0.03;
      scale = 1;
      rotZ = Math.sin(p * Math.PI * 0.8) * 0.02;
    } else if (t < SCAN_END) {
      // 2) Tarama + yükselme — scan line üstten aşağı süpürüyor
      const p = (t - IDLE_END) / (SCAN_END - IDLE_END);
      y = -1.8 + p * 1.4;
      scale = 1;
      rotZ = Math.sin(p * Math.PI * 2) * 0.04;
    } else if (t < LAUNCH_END) {
      // 3) Buluta doğru hızlanarak fırla, küçül
      const p = (t - SCAN_END) / (LAUNCH_END - SCAN_END);
      const eased = p * p;
      y = -0.4 + eased * 2.05;
      scale = 1 - eased * 0.9;
      rotZ = eased * 0.35;
    } else {
      // 4) Görünmez
      y = 1.65;
      scale = 0.001;
      rotZ = 0;
    }

    groupRef.current.position.set(xOffset, y, 0);
    groupRef.current.scale.setScalar(Math.max(scale, 0.001) * 0.8);
    groupRef.current.rotation.z = rotZ;
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
  const count = 10;
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        phase: (i / count) * 3.2,
        x: (i % 2 === 0 ? -1 : 1) * (0.15 + Math.random() * 0.6),
      })),
    []
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      const cycle = 3.2;
      const t = ((state.clock.elapsedTime + p.phase) % cycle) / cycle;
      child.position.y = -0.2 + t * 2.1;
      child.position.x = p.x * (1 - t * 0.85);
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1;
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, -0.2, 0.1]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color="#D4A574" transparent opacity={0.9} />
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
