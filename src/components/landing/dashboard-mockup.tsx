import { FileText, Upload, BarChart3, CheckCircle, Clock, TrendingUp } from "lucide-react";

export function DashboardMockup() {
  return (
    <div className="relative mx-auto max-w-5xl animate-fade-up animate-fade-up-delay-3">
      {/* Glow behind */}
      <div className="absolute inset-x-12 -bottom-8 h-32 bg-receipt-gold/8 rounded-full blur-3xl" />

      {/* Browser frame with perspective tilt */}
      <div
        className="relative rounded-xl border border-paper-lines/80 bg-paper shadow-2xl shadow-ink/5 overflow-hidden"
        style={{
          transform: "perspective(2000px) rotateX(2deg)",
          transformOrigin: "center bottom",
        }}
      >
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border-b border-paper-lines">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-paper rounded-full border border-paper-lines px-3 py-1 text-xs text-ink-faint text-center max-w-xs mx-auto">
              app.otomakbuz.com/panel
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="flex min-h-[360px]">
          {/* Mini sidebar */}
          <div className="w-48 receipt-sidebar p-3 hidden sm:block flex-shrink-0">
            <div className="flex items-center gap-2 px-2 py-1.5 mb-4">
              <div className="w-6 h-6 rounded bg-white/20" />
              <span className="text-xs font-bold text-white">Otomakbuz</span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/20 text-white text-[11px] font-medium">
                <BarChart3 className="h-3 w-3" /> Panel
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-white/60 text-[11px]">
                <Upload className="h-3 w-3" /> Belge Yükle
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-white/60 text-[11px]">
                <FileText className="h-3 w-3" /> Belgeler
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-5 bg-surface">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <MockStatCard label="Bu Ay Belge" value="47" icon={<FileText className="h-3.5 w-3.5 text-receipt-brown" />} />
              <MockStatCard label="Toplam Gider" value="₺12.840" icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-600" />} />
              <MockStatCard label="Bekleyen" value="3" icon={<Clock className="h-3.5 w-3.5 text-amber-600" />} />
            </div>

            {/* Table */}
            <div className="receipt-card rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 border-b border-paper-lines">
                <span className="text-[11px] font-semibold text-ink">Son Belgeler</span>
              </div>
              <div className="divide-y divide-paper-lines/50">
                <MockRow supplier="Migros Ticaret A.Ş." date="03.04.2026" amount="₺1.245,00" status="verified" />
                <MockRow supplier="Shell Petrol" date="02.04.2026" amount="₺890,50" status="verified" />
                <MockRow supplier="Yemeksepeti" date="01.04.2026" amount="₺156,00" status="needs_review" />
                <MockRow supplier="Vodafone Türkiye" date="01.04.2026" amount="₺299,90" status="verified" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockStatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="receipt-card rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-ink-muted">{label}</span>
        <div className="w-6 h-6 rounded bg-receipt-gold/10 flex items-center justify-center">{icon}</div>
      </div>
      <span className="text-base font-bold text-ink">{value}</span>
    </div>
  );
}

function MockRow({ supplier, date, amount, status }: { supplier: string; date: string; amount: string; status: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-[11px]">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-medium text-ink truncate">{supplier}</span>
        <span className="text-ink-faint hidden sm:inline">{date}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-ink tabular-nums">{amount}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
          status === "verified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        }`}>
          {status === "verified" ? "Doğrulandı" : "Bekliyor"}
        </span>
      </div>
    </div>
  );
}
