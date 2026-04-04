import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="mb-8"><Logo size={40} /></div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
