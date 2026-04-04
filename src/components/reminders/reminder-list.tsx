"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Bell, Check, Trash2, CreditCard, Upload, ClipboardCheck,
  MoreHorizontal, Calendar, Building2, FileText, Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeReminder, deleteReminder } from "@/lib/actions/reminders";
import { toast } from "sonner";
import type { Reminder } from "@/types";

const typeConfig: Record<string, { icon: typeof Bell; label: string; color: string }> = {
  payment: { icon: CreditCard, label: "Ödeme", color: "bg-red-50 text-red-600" },
  upload: { icon: Upload, label: "Yükleme", color: "bg-blue-50 text-blue-600" },
  review: { icon: ClipboardCheck, label: "İnceleme", color: "bg-amber-50 text-amber-600" },
  custom: { icon: Bell, label: "Hatırlatıcı", color: "bg-violet-50 text-violet-600" },
};

interface ReminderListProps {
  reminders: Reminder[];
}

export function ReminderList({ reminders: initialReminders }: ReminderListProps) {
  const [reminders, setReminders] = useState(initialReminders);
  const [completing, setCompleting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleComplete(id: string) {
    setCompleting(id);
    try {
      await completeReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success("Tamamlandı");
    } catch {
      toast.error("Hata");
    } finally {
      setCompleting(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu hatırlatıcıyı silmek istediğinize emin misiniz?")) return;
    setDeleting(id);
    try {
      await deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success("Silindi");
    } catch {
      toast.error("Hata");
    } finally {
      setDeleting(null);
    }
  }

  function isOverdue(dueDate: string) {
    return new Date(dueDate) < new Date();
  }

  function isDueToday(dueDate: string) {
    const due = new Date(dueDate);
    const now = new Date();
    return due.toDateString() === now.toDateString();
  }

  if (reminders.length === 0) {
    return (
      <div className="receipt-card rounded">
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-14 h-14 rounded bg-receipt-gold/10 flex items-center justify-center mb-4">
            <Bell className="h-6 w-6 text-receipt-gold/60" />
          </div>
          <p className="text-sm font-medium text-ink mb-1">Henüz hatırlatıcı yok</p>
          <p className="text-xs text-ink-faint text-center max-w-xs">
            Yukarıdaki formu kullanarak yeni hatırlatıcı ekleyebilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="receipt-card rounded overflow-hidden">
      <div className="px-5 py-4 border-b border-paper-lines flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-receipt-brown" />
          <h3 className="font-semibold text-ink text-sm">Hatırlatıcılar</h3>
        </div>
        <span className="text-xs text-ink-faint">{reminders.length} aktif</span>
      </div>

      <div className="divide-y divide-paper-lines/50">
        {reminders.map((r) => {
          const config = typeConfig[r.reminder_type] || typeConfig.custom;
          const Icon = config.icon;
          const overdue = isOverdue(r.due_date);
          const today = isDueToday(r.due_date);

          return (
            <div
              key={r.id}
              className={cn(
                "flex items-start gap-3 px-5 py-4 transition-colors group",
                overdue && "bg-red-50/30",
                today && !overdue && "bg-amber-50/30"
              )}
            >
              {/* Complete button */}
              <button
                onClick={() => handleComplete(r.id)}
                disabled={completing === r.id}
                className={cn(
                  "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  overdue
                    ? "border-red-300 hover:bg-red-100 hover:border-red-400"
                    : "border-paper-lines hover:bg-receipt-gold/10 hover:border-receipt-gold"
                )}
              >
                {completing === r.id ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-receipt-gold animate-pulse" />
                ) : (
                  <Check className="h-3 w-3 text-transparent group-hover:text-receipt-brown transition-colors" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink">{r.title}</p>
                  <span className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
                    config.color
                  )}>
                    <Icon className="h-2.5 w-2.5" />
                    {config.label}
                  </span>
                  {r.is_recurring && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-ink-faint">
                      <Repeat className="h-2.5 w-2.5" />
                      {r.recurrence_rule === "weekly" ? "Haftalık" : r.recurrence_rule === "monthly" ? "Aylık" : "Yıllık"}
                    </span>
                  )}
                </div>

                {r.description && (
                  <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{r.description}</p>
                )}

                <div className="flex items-center gap-3 mt-1.5">
                  <span className={cn(
                    "flex items-center gap-1 text-[11px]",
                    overdue ? "text-red-600 font-medium" : today ? "text-amber-600 font-medium" : "text-ink-faint"
                  )}>
                    <Calendar className="h-3 w-3" />
                    {overdue ? "Gecikti: " : today ? "Bugün: " : ""}
                    {formatDate(r.due_date)}
                  </span>

                  {r.contact_name && (
                    <span className="flex items-center gap-1 text-[11px] text-ink-faint">
                      <Building2 className="h-3 w-3" />
                      {r.contact_name}
                    </span>
                  )}

                  {r.document_name && (
                    <span className="flex items-center gap-1 text-[11px] text-ink-faint">
                      <FileText className="h-3 w-3" />
                      {r.document_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(r.id)}
                disabled={deleting === r.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-faint hover:text-red-500 p-1 mt-0.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
