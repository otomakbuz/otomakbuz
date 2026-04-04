import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image src="/otomakbuz logo.png" alt="Otomakbuz" width={size} height={size} className="rounded" />
      <span className="font-semibold text-lg">Otomakbuz</span>
    </Link>
  );
}
