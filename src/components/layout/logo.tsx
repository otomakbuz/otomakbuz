import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 32, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <Image src="/otomakbuz logo.png" alt="Otomakbuz" width={size} height={size} className="rounded flex-shrink-0" style={{ width: size, height: size }} />
      {showText && (
        <span className="font-bold text-base sm:text-lg tracking-tight whitespace-nowrap">
          <span className="text-receipt-gold">Oto</span>
          <span className="text-receipt-brown">makbuz</span>
        </span>
      )}
    </Link>
  );
}
