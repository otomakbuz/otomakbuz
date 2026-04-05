"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Building2,
  Calendar,
  Receipt,
  TrendingUp,
  Shield,
  Eye,
  Pencil,
  Download,
  FileSpreadsheet,
  Sparkles,
  Clock,
} from "lucide-react";

export type FeatureKey = "scan" | "reports" | "reminders" | "team";

/** Fires once the element scrolls into view. */
function useInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        });
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export function FeatureVisual({ featureKey }: { featureKey: FeatureKey }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="relative">
      {/* Soft glow */}
      <div className="absolute -inset-4 bg-receipt-gold/5 rounded-3xl blur-2xl" />
      <div className="relative aspect-[4/3] rounded-2xl bg-surface border border-paper-lines overflow-hidden shadow-xl shadow-ink/5">
        {featureKey === "scan" && <ScanVisual inView={inView} />}
        {featureKey === "reports" && <ReportsVisual inView={inView} />}
        {featureKey === "reminders" && <RemindersVisual inView={inView} />}
        {featureKey === "team" && <TeamVisual inView={inView} />}
      </div>
    </div>
  );
}

/* ---------- 01 · Akıllı Tarama ---------- */
function ScanVisual({ inView }: { inView: boolean }) {
  const chips = [
    { label: "Firma", value: "Migros A.Ş.", conf: 99 },
    { label: "Tarih", value: "03.04.2026", conf: 98 },
    { label: "Toplam", value: "₺132,50", conf: 99 },
    { label: "KDV %10", value: "₺12,05", conf: 96 },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
      {/* Receipt card */}
      <div className="relative w-[46%] sm:w-[48%] rotate-[-4deg] bg-[#fdfaf2] rounded-sm shadow-2xl shadow-ink/20 border border-paper-lines/80">
        <div
          className="h-2 bg-paper"
          style={{
            WebkitMaskImage:
              "linear-gradient(90deg, #000 0 8%, transparent 8% 12%, #000 12% 22%, transparent 22% 26%, #000 26% 40%, transparent 40% 44%, #000 44% 60%, transparent 60% 64%, #000 64% 78%, transparent 78% 82%, #000 82% 100%)",
            maskImage:
              "linear-gradient(90deg, #000 0 8%, transparent 8% 12%, #000 12% 22%, transparent 22% 26%, #000 26% 40%, transparent 40% 44%, #000 44% 60%, transparent 60% 64%, #000 64% 78%, transparent 78% 82%, #000 82% 100%)",
          }}
        />
        <div className="p-3 sm:p-4 font-mono text-[9px] sm:text-[10px] leading-tight text-ink">
          <div className="text-center font-bold tracking-wider mb-1">
            MİGROS TİCARET A.Ş.
          </div>
          <div className="text-center text-ink-faint text-[8px] sm:text-[9px] mb-2">
            VKN: 6170087398
          </div>
          <div className="border-t border-dashed border-paper-lines my-1.5" />
          <div className="flex justify-between"><span>Süt 1L</span><span>₺32,50</span></div>
          <div className="flex justify-between"><span>Ekmek</span><span>₺15,00</span></div>
          <div className="flex justify-between"><span>Yumurta</span><span>₺85,00</span></div>
          <div className="border-t border-dashed border-paper-lines my-1.5" />
          <div className="flex justify-between font-bold">
            <span>TOPLAM</span>
            <span>₺132,50</span>
          </div>
          <div className="flex justify-between text-ink-faint">
            <span>KDV %10</span>
            <span>₺12,05</span>
          </div>
        </div>
        {/* Scan sweep line — only in view */}
        {inView && (
          <div className="pointer-events-none absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-receipt-gold to-transparent shadow-[0_0_16px_rgba(160,132,92,0.95)] animate-scan-sweep" />
        )}
      </div>

      {/* Extracted field chips */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 space-y-1.5 sm:space-y-2 text-[10px] sm:text-[11px]">
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-wider text-ink-faint font-bold mb-1">
          <Sparkles className="h-2.5 w-2.5 text-receipt-gold" /> OCR Sonucu
        </div>
        {chips.map((c, i) => (
          <div
            key={c.label}
            className={inView ? "animate-chip-in" : "opacity-0"}
            style={{ animationDelay: inView ? `${0.4 + i * 0.15}s` : undefined }}
          >
            <ExtractedChip label={c.label} value={c.value} conf={c.conf} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ExtractedChip({
  label,
  value,
  conf,
}: {
  label: string;
  value: string;
  conf: number;
}) {
  return (
    <div className="flex items-center gap-2 bg-paper rounded-full border border-paper-lines pl-2 pr-3 py-1.5 shadow-sm">
      <CheckCircle2 className="h-3 w-3 text-emerald-600 flex-shrink-0" />
      <span className="text-ink-faint">{label}:</span>
      <span className="font-semibold text-ink tabular-nums">{value}</span>
      <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold tabular-nums">
        %{conf}
      </span>
    </div>
  );
}

/* ---------- 02 · Gelir-Gider Takibi ---------- */
function ReportsVisual({ inView }: { inView: boolean }) {
  const bars = [
    { h: 38, m: "Oca" },
    { h: 52, m: "Şub" },
    { h: 44, m: "Mar" },
    { h: 68, m: "Nis" },
    { h: 60, m: "May" },
    { h: 82, m: "Haz" },
    { h: 74, m: "Tem" },
    { h: 92, m: "Ağu" },
  ];
  return (
    <div className="absolute inset-0 p-4 sm:p-8 flex flex-col">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <div>
          <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-ink-faint font-semibold">
            Aylık Gider
          </div>
          <div className="text-xl sm:text-2xl font-bold text-ink tabular-nums mt-0.5">
            ₺48.920
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-700 font-semibold mt-1">
            <TrendingUp className="h-3 w-3" />
            +%18 geçen aya göre
          </div>
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {["6A", "1Y", "Tümü"].map((t, i) => (
            <span
              key={t}
              className={`text-[9px] sm:text-[10px] px-2 py-1 rounded-full border font-semibold ${
                i === 0
                  ? "bg-ink text-white border-ink"
                  : "border-paper-lines text-ink-muted"
              }`}
            >
              {t}
            </span>
          ))}
          <button className="ml-1 flex items-center gap-1 text-[9px] sm:text-[10px] px-2 py-1 rounded-full border border-paper-lines bg-paper text-ink-muted font-semibold hover:border-ink/20 transition-colors">
            <FileSpreadsheet className="h-2.5 w-2.5" />
            Excel
          </button>
        </div>
      </div>

      {/* Bars */}
      <div className="flex-1 flex items-stretch gap-1.5 sm:gap-3 pb-5 min-h-0">
        {bars.map((b, i) => (
          <div
            key={b.m}
            className="flex-1 h-full flex flex-col justify-end items-center gap-1.5"
          >
            <div
              className={`w-full rounded-t-md ${
                i === bars.length - 1 ? "bg-receipt-brown" : "bg-receipt-gold/70"
              } ${inView ? "animate-bar-grow" : "scale-y-0 origin-bottom"}`}
              style={{
                height: `${b.h}%`,
                animationDelay: inView ? `${0.15 + i * 0.06}s` : undefined,
              }}
            />
            <span className="text-[8px] sm:text-[9px] text-ink-faint font-medium">
              {b.m}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom legend chips */}
      <div className="flex items-center gap-3 pt-2 sm:pt-3 border-t border-paper-lines">
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-ink-muted">
          <div className="w-2 h-2 rounded-sm bg-receipt-brown" />
          Gider
        </div>
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-ink-muted">
          <div className="w-2 h-2 rounded-sm bg-receipt-gold/70" />
          Önceki aylar
        </div>
        <div className="ml-auto flex items-center gap-1 text-[9px] sm:text-[10px] text-ink-faint font-mono">
          <Download className="h-2.5 w-2.5" />
          CSV · PDF
        </div>
      </div>
    </div>
  );
}

/* ---------- 03 · Akıllı Hatırlatıcılar ---------- */
function RemindersVisual({ inView }: { inView: boolean }) {
  // Weekly view, more focused than monthly
  const week = [
    { d: "Pzt", n: 6, kind: "done" },
    { d: "Sal", n: 7, kind: "done" },
    { d: "Çar", n: 8, kind: "today" },
    { d: "Per", n: 9, kind: "none" },
    { d: "Cum", n: 10, kind: "none" },
    { d: "Cmt", n: 11, kind: "none" },
    { d: "Paz", n: 12, kind: "due" },
  ] as const;

  const reminders = [
    {
      title: "Elektrik Faturası",
      meta: "Enerjisa · Aylık tekrarlayan",
      date: "12 Nisan",
      amount: "₺842",
      days: 4,
      urgent: true,
    },
    {
      title: "Kira Ödemesi",
      meta: "Aylık tekrarlayan",
      date: "25 Nisan",
      amount: "₺14.500",
      days: 17,
      urgent: false,
    },
  ];

  return (
    <div className="absolute inset-0 p-4 sm:p-8 flex flex-col gap-3 sm:gap-4">
      {/* Week strip */}
      <div className="bg-paper rounded-xl border border-paper-lines p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-receipt-brown" />
            <span className="text-[11px] sm:text-[12px] font-bold text-ink">
              Bu Hafta
            </span>
          </div>
          <div className="text-[9px] sm:text-[10px] text-ink-faint">
            2 yaklaşan ödeme
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {week.map((w) => (
            <div key={w.d} className="flex flex-col items-center gap-1">
              <span className="text-[8px] sm:text-[9px] text-ink-faint font-semibold uppercase">
                {w.d}
              </span>
              <div
                className={`relative w-full aspect-square max-w-[32px] flex items-center justify-center text-[10px] sm:text-[11px] rounded-lg font-bold ${
                  w.kind === "today"
                    ? "bg-ink text-white"
                    : w.kind === "due"
                    ? "bg-receipt-gold/25 text-receipt-brown"
                    : w.kind === "done"
                    ? "bg-surface text-ink-muted"
                    : "text-ink-muted"
                }`}
              >
                {w.n}
                {w.kind === "due" && inView && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-receipt-brown animate-pulse-dot" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming list */}
      <div className="flex-1 space-y-2 min-h-0">
        {reminders.map((r, i) => (
          <div
            key={r.title}
            className={`bg-paper rounded-xl border border-paper-lines px-3 py-2.5 shadow-sm flex items-center gap-3 ${
              inView ? "animate-chip-in" : "opacity-0"
            }`}
            style={{ animationDelay: inView ? `${0.3 + i * 0.2}s` : undefined }}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                r.urgent ? "bg-amber-100 text-amber-700" : "bg-receipt-gold/15 text-receipt-brown"
              }`}
            >
              <Receipt className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] sm:text-[12px] font-bold text-ink truncate">
                {r.title}
              </div>
              <div className="text-[9px] sm:text-[10px] text-ink-faint truncate">
                {r.meta}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[11px] sm:text-[12px] font-bold text-ink tabular-nums">
                {r.amount}
              </div>
              <div
                className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded mt-0.5 ${
                  r.urgent
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                <Clock className="h-2 w-2" />
                {r.days} gün
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 04 · Çoklu Kullanıcı ---------- */
function TeamVisual({ inView }: { inView: boolean }) {
  const members = [
    {
      name: "Mert Aysüne",
      role: "Yönetici",
      color: "bg-receipt-brown text-white",
      Icon: Shield,
    },
    {
      name: "Ayşe Kaya",
      role: "Editör",
      color: "bg-receipt-gold text-white",
      Icon: Pencil,
    },
    {
      name: "Zeynep D.",
      role: "Görüntüleyici",
      color: "bg-surface text-ink border border-paper-lines",
      Icon: Eye,
    },
  ];

  const auditLog = [
    { who: "Ayşe", what: "Migros fişini onayladı", when: "2 dk önce" },
    { who: "Mert", what: "Yeni kategori ekledi", when: "15 dk önce" },
  ];

  return (
    <div className="absolute inset-0 p-4 sm:p-8 flex flex-col">
      {/* Workspace header */}
      <div className="flex items-center gap-3 pb-3 border-b border-paper-lines">
        <div className="w-9 h-9 rounded-lg bg-receipt-brown flex items-center justify-center text-white flex-shrink-0">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] sm:text-[12px] font-bold text-ink truncate">
            Akbuz Muhasebe
          </div>
          <div className="text-[9px] sm:text-[10px] text-ink-faint">
            3 üye · 128 belge
          </div>
        </div>
        <div className="text-[9px] sm:text-[10px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
          Aktif
        </div>
      </div>

      {/* Member list */}
      <div className="pt-2.5 space-y-1.5">
        {members.map((m, i) => (
          <div
            key={m.name}
            className={`flex items-center gap-3 bg-paper rounded-lg border border-paper-lines px-2.5 py-1.5 ${
              inView ? "animate-chip-in" : "opacity-0"
            }`}
            style={{ animationDelay: inView ? `${0.15 + i * 0.12}s` : undefined }}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${m.color}`}
            >
              {m.name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-ink truncate">
                {m.name}
              </div>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-semibold text-ink-muted uppercase tracking-wider">
              <m.Icon className="h-3 w-3" />
              {m.role}
            </div>
          </div>
        ))}
      </div>

      {/* Audit log */}
      <div className="mt-auto pt-3 border-t border-paper-lines">
        <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-ink-faint font-bold mb-1.5">
          Denetim Kaydı
        </div>
        <div className="space-y-1">
          {auditLog.map((a) => (
            <div
              key={a.what}
              className="flex items-center gap-2 text-[10px] sm:text-[11px]"
            >
              <div className="w-1 h-1 rounded-full bg-receipt-gold flex-shrink-0" />
              <span className="font-bold text-ink">{a.who}</span>
              <span className="text-ink-muted truncate flex-1 min-w-0">
                {a.what}
              </span>
              <span className="text-ink-faint text-[9px] flex-shrink-0">
                {a.when}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
