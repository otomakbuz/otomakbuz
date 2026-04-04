"use client";

import dynamic from "next/dynamic";

/**
 * SSR-safe wrapper for the Hero 3D scene.
 * Three.js/R3F WebGL gerektirdiği için client-only olarak yüklenir.
 */
const Hero3DScene = dynamic(() => import("./hero-3d-scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="h-8 w-8 rounded-full border-2 border-receipt-brown/20 border-t-receipt-brown animate-spin" />
    </div>
  ),
});

export function Hero3D() {
  return <Hero3DScene />;
}
