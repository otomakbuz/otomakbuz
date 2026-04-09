import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 32, showText = true, variant = "default" }: { size?: number; showText?: boolean; variant?: "default" | "light" }) {
  const isLight = variant === "light";
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <Image src="/logo-icon.png" alt="Otomakbuz" width={size} height={size} className={isLight ? "flex-shrink-0 brightness-150" : "flex-shrink-0"} style={{ width: size, height: size }} />
      {showText && (
        <span className="font-bold text-base sm:text-lg tracking-tight whitespace-nowrap">
          {isLight ? (
            <span className="text-white">Otomakbuz</span>
          ) : (
            <>
              <span className="text-receipt-gold">Oto</span>
              <span className="text-receipt-brown">makbuz</span>
            </>
          )}
        </span>
      )}
    </Link>
  );
}
