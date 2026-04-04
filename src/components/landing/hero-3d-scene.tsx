"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

/**
 * Hero 3D Scene — Otomakbuz
 *
 * Arkada iPhone 17 Plus, önde süzülen kağıt dokulu fişler.
 * Brand renkleri: receipt-brown (#8B4513), receipt-gold (#D4A574), paper (#FAF8F3)
 */

// ─────────────────────────────────────────────────────────────
// Procedural kağıt dokusu — noise + lifler
// ─────────────────────────────────────────────────────────────
function usePaperTexture(tint = "#FAF8F3") {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Taban rengi
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, size, size);

    // İnce gürültü (kağıt grenleri)
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 22;
      data[i] = Math.max(0, Math.min(255, data[i] + n));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
    }
    ctx.putImageData(imageData, 0, 0);

    // Kağıt lifleri
    ctx.globalAlpha = 0.09;
    for (let i = 0; i < 420; i++) {
      ctx.strokeStyle = Math.random() > 0.5 ? "#8B7355" : "#D4A574";
      ctx.lineWidth = 0.3 + Math.random() * 0.7;
      const x = Math.random() * size;
      const y = Math.random() * size;
      const len = 10 + Math.random() * 35;
      const angle = Math.random() * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      ctx.stroke();
    }

    // Hafif sararma lekeleri (vintage his)
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 8; i++) {
      const cx = Math.random() * size;
      const cy = Math.random() * size;
      const r = 60 + Math.random() * 120;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, "#c9a16a");
      grad.addColorStop(1, "rgba(201,161,106,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }, [tint]);
}

// ─────────────────────────────────────────────────────────────
// Receipt / Fatura kartı — kağıt dokulu
// ─────────────────────────────────────────────────────────────
function ReceiptCard({
  position,
  rotation,
  title,
  amount,
  lines,
  color = "#FAF8F3",
  scale = 1,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  title: string;
  amount: string;
  lines: string[];
  color?: string;
  scale?: number;
}) {
  const paperTexture = usePaperTexture(color);

  return (
    <Float
      speed={1.4}
      rotationIntensity={0.35}
      floatIntensity={0.55}
      floatingRange={[-0.1, 0.1]}
    >
      <group position={position} rotation={rotation} scale={scale}>
        {/* Kağıt arka plan — procedural doku */}
        <RoundedBox
          args={[1.4, 2.0, 0.025]}
          radius={0.04}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            map={paperTexture}
            color={color}
            roughness={0.92}
            metalness={0.0}
          />
        </RoundedBox>

        {/* Üst şerit (marka rengi) */}
        <mesh position={[0, 0.85, 0.014]}>
          <planeGeometry args={[1.3, 0.12]} />
          <meshBasicMaterial color="#8B4513" />
        </mesh>

        {/* Başlık */}
        <Text
          position={[0, 0.6, 0.016]}
          fontSize={0.12}
          color="#2a1f17"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.2}
        >
          {title}
        </Text>

        {/* Tutar (büyük) */}
        <Text
          position={[0, 0.25, 0.016]}
          fontSize={0.22}
          color="#8B4513"
          anchorX="center"
          anchorY="middle"
        >
          {amount}
        </Text>

        {/* Satır detayları */}
        {lines.map((line, i) => (
          <Text
            key={i}
            position={[0, -0.1 - i * 0.18, 0.016]}
            fontSize={0.09}
            color="#5a4a3d"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.2}
          >
            {line}
          </Text>
        ))}

        {/* Alt barkod benzeri çizgiler */}
        <group position={[0, -0.8, 0.014]}>
          {[...Array(14)].map((_, i) => (
            <mesh key={i} position={[-0.45 + i * 0.07, 0, 0]}>
              <planeGeometry
                args={[0.008 + Math.random() * 0.02, 0.08]}
              />
              <meshBasicMaterial color="#2a1f17" opacity={0.7} transparent />
            </mesh>
          ))}
        </group>
      </group>
    </Float>
  );
}

// ─────────────────────────────────────────────────────────────
// iPhone 17 Plus — düz titanyum kenar, yuvarlak köşeler, Dynamic Island
// ─────────────────────────────────────────────────────────────
function roundedRectShape(w: number, h: number, r: number) {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function Phone() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.1 - 0.12;
    groupRef.current.rotation.x = Math.cos(t * 0.25) * 0.04;
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.08;
  });

  // iPhone 17 Plus gerçek oranları
  const W = 1.75;
  const H = 3.6;
  const D = 0.1; // çok ince profil
  const R = 0.32; // corner radius (iPhone'un belirgin yuvarlak köşesi)

  // Ana gövde: düz kenarlı, yalnızca köşeleri yuvarlak extruded geometri
  const bodyGeometry = useMemo(() => {
    const shape = roundedRectShape(W, H, R);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: D,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 6,
      curveSegments: 32,
    });
    geo.center();
    return geo;
  }, []);

  // Ekran camı (siyah OLED substrate) — gövdeden 0.01 küçük, keskin yuvarlak
  const glassGeometry = useMemo(() => {
    const shape = roundedRectShape(W - 0.07, H - 0.07, R - 0.03);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.004,
      bevelEnabled: false,
      curveSegments: 32,
    });
    geo.center();
    return geo;
  }, []);

  return (
    <group ref={groupRef} position={[0, 0, -0.8]} scale={0.98}>
      {/* Titanyum gövde — düz kenarlı, Rose Titanium */}
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#e8a894"
          roughness={0.35}
          metalness={0.75}
        />
      </mesh>

      {/* Siyah ekran camı (bezel) */}
      <mesh geometry={glassGeometry} position={[0, 0, D / 2 + 0.003]}>
        <meshStandardMaterial
          color="#080808"
          roughness={0.15}
          metalness={0.3}
        />
      </mesh>

      {/* Ekran UI background — kağıt beyazı */}
      <mesh position={[0, 0, D / 2 + 0.008]}>
        <planeGeometry args={[W - 0.1, H - 0.1]} />
        <meshBasicMaterial color="#FAF8F3" />
      </mesh>

      {/* Dynamic Island */}
      <mesh position={[0, H / 2 - 0.26, D / 2 + 0.014]}>
        <RoundedBox args={[0.48, 0.14, 0.005]} radius={0.07} smoothness={6}>
          <meshStandardMaterial color="#050505" roughness={0.3} metalness={0.2} />
        </RoundedBox>
      </mesh>

      {/* Ekran içi: status bar saat (sol) */}
      <Text
        position={[-0.62, H / 2 - 0.27, D / 2 + 0.012]}
        fontSize={0.08}
        color="#2a1f17"
        anchorX="center"
        anchorY="middle"
      >
        9:41
      </Text>

      {/* Status bar sağ: sinyal çubukları */}
      <group position={[0.48, H / 2 - 0.27, D / 2 + 0.012]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[i * 0.025, -0.015 + i * 0.008, 0]}>
            <planeGeometry args={[0.018, 0.02 + i * 0.015]} />
            <meshBasicMaterial color="#2a1f17" />
          </mesh>
        ))}
      </group>

      {/* Status bar sağ: pil */}
      <group position={[0.68, H / 2 - 0.27, D / 2 + 0.012]}>
        <mesh>
          <planeGeometry args={[0.09, 0.045]} />
          <meshBasicMaterial color="#2a1f17" transparent opacity={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[0.08, 0.035]} />
          <meshBasicMaterial color="#FAF8F3" />
        </mesh>
        <mesh position={[-0.015, 0, 0.002]}>
          <planeGeometry args={[0.05, 0.028]} />
          <meshBasicMaterial color="#2a1f17" />
        </mesh>
      </group>

      {/* Ekran içi: başlık */}
      <Text
        position={[0, 1.15, D / 2 + 0.012]}
        fontSize={0.11}
        color="#8B4513"
        anchorX="center"
        anchorY="middle"
      >
        OTOMAKBUZ
      </Text>

      {/* Ekran içi: üst çizgi */}
      <mesh position={[0, 1.02, D / 2 + 0.012]}>
        <planeGeometry args={[1.35, 0.008]} />
        <meshBasicMaterial color="#8B4513" opacity={0.3} transparent />
      </mesh>

      {/* Ekran içi: stat kartı */}
      <group position={[0, 0.65, D / 2 + 0.012]}>
        <mesh>
          <planeGeometry args={[1.35, 0.44]} />
          <meshBasicMaterial color="#F5EFE4" />
        </mesh>
        <Text
          position={[0, 0.09, 0.001]}
          fontSize={0.08}
          color="#5a4a3d"
          anchorX="center"
        >
          BU AY TOPLAM
        </Text>
        <Text
          position={[0, -0.08, 0.001]}
          fontSize={0.17}
          color="#8B4513"
          anchorX="center"
        >
          ₺12.450
        </Text>
      </group>

      {/* Ekran içi: mini satırlar */}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[0, 0.1 - i * 0.28, D / 2 + 0.012]}>
          <mesh>
            <planeGeometry args={[1.35, 0.24]} />
            <meshBasicMaterial color="#FAF8F3" />
          </mesh>
          <mesh position={[-0.5, 0, 0.001]}>
            <circleGeometry args={[0.06, 20]} />
            <meshBasicMaterial color="#D4A574" />
          </mesh>
          <Text
            position={[-0.33, 0.03, 0.002]}
            fontSize={0.065}
            color="#2a1f17"
            anchorX="left"
          >
            {["Shell Yakıt", "Migros A.Ş.", "Turkcell", "Aras Kargo"][i]}
          </Text>
          <Text
            position={[-0.33, -0.05, 0.002]}
            fontSize={0.05}
            color="#8a7565"
            anchorX="left"
          >
            {["Fatura", "Perakende fiş", "Fatura", "İrsaliye"][i]}
          </Text>
          <Text
            position={[0.6, 0, 0.002]}
            fontSize={0.07}
            color="#8B4513"
            anchorX="right"
          >
            {["₺420", "₺1.250", "₺380", "₺85"][i]}
          </Text>
        </group>
      ))}

      {/* Home indicator */}
      <mesh position={[0, -H / 2 + 0.12, D / 2 + 0.012]}>
        <planeGeometry args={[0.35, 0.015]} />
        <meshBasicMaterial color="#2a1f17" opacity={0.4} transparent />
      </mesh>

      {/* Sol yan: ses açma tuşları */}
      <mesh position={[-W / 2 - 0.002, 0.55, 0]}>
        <boxGeometry args={[0.015, 0.22, 0.08]} />
        <meshStandardMaterial color="#4a4a4d" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[-W / 2 - 0.002, 0.25, 0]}>
        <boxGeometry args={[0.015, 0.22, 0.08]} />
        <meshStandardMaterial color="#4a4a4d" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Sol yan: action button */}
      <mesh position={[-W / 2 - 0.002, 0.85, 0]}>
        <boxGeometry args={[0.015, 0.1, 0.08]} />
        <meshStandardMaterial color="#4a4a4d" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Sağ yan: power button */}
      <mesh position={[W / 2 + 0.002, 0.55, 0]}>
        <boxGeometry args={[0.015, 0.32, 0.08]} />
        <meshStandardMaterial color="#4a4a4d" roughness={0.3} metalness={0.9} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// Yörünge halkası — telefon önünde, farklı derinliklerde
// ─────────────────────────────────────────────────────────────
function OrbitingReceipts() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  // Fişler pozitif z'de (kameraya yakın) → telefonun önünde görünür
  const receipts = useMemo(
    () => [
      {
        position: [2.6, 0.9, 1.2] as [number, number, number],
        rotation: [0.12, -0.35, 0.18] as [number, number, number],
        title: "MIGROS A.Ş.",
        amount: "₺1.250,00",
        lines: ["15.03.2026", "KDV %20", "Perakende fiş"],
        scale: 1.05,
      },
      {
        position: [-2.5, 1.3, 1.6] as [number, number, number],
        rotation: [-0.08, 0.42, -0.14] as [number, number, number],
        title: "SHELL YAKIT",
        amount: "₺420,50",
        lines: ["12.03.2026", "Fatura", "VUK 229"],
        scale: 1,
      },
      {
        position: [2.3, -1.1, 2.0] as [number, number, number],
        rotation: [0.18, -0.28, -0.1] as [number, number, number],
        title: "TURKCELL",
        amount: "₺380,00",
        lines: ["10.03.2026", "e-Fatura", "KDV %20"],
        scale: 0.92,
      },
      {
        position: [-2.8, -0.8, 0.9] as [number, number, number],
        rotation: [-0.12, 0.38, 0.12] as [number, number, number],
        title: "ARAS KARGO",
        amount: "₺85,00",
        lines: ["08.03.2026", "İrsaliye", "KDV %20"],
        scale: 0.9,
      },
    ],
    []
  );

  return (
    <group ref={groupRef}>
      {receipts.map((r, i) => (
        <ReceiptCard key={i} {...r} />
      ))}
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
          <Phone />
          <OrbitingReceipts />
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
