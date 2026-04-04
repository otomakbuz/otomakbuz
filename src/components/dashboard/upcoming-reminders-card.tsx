"use client";

import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Bell, Calendar, CreditCard, Upload, ClipboardCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Reminder } from "@/types";

const typeIcons: Record<string, typeof Bell> = {
  payment: CreditCard,
  upload: Upload,
  review: ClipboardCheck,
  custom: Bell,
};

const typeColors: Record<string, string> = {
  payment: "text-red-500",
  upload: "text-blue-500",
  review: "text-amber-500",
  custom: "text-violet-500",
};

interface UpcomingRemindersCardProps {
  reminders: Reminder[];
}

export function UpcomingRemindersCard({ reminders }: UpcomingRemindersCardProps) {
  function isOverdue(dueDate: string) {
    return new Date(dueDate) < new Date();
  }

  return (
    <div className="receipt-card rounded">
      <div className="flex items-center justify-between px-5 py-4 border-b border-paper-lines">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-receipt-brown" />
          <h3 className="font-semibold text-ink text-sm">Yaklaşan Hatırlatıcılar</h3>
        </div>
        <Link
          href="/hatirlaticilar"
          className="text-xs text-receipt-brown hover:text-receipt-brown-dark flex items-center gap-0.5"
        >
          Tümü <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="p-2">
        {reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-6">
            <div className="w-10 h-10 rounded bg-receipt-gold/10 flex items-center justify-center mb-2">
              <Bell className="h-4 w-4 text-receipt-gold/50" />
            </div>
            <p className="text-xs text-ink-faint text-center">
              7 gün içinde hatırlatıcı yok
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {reminders.slice(0, 5).map((r) => {
              const Icon = typeIcons[r.reminder_type] || Bell;
              const overdue = isOverdue(r.due_date);

              return (
                <div
                  key={r.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded transition-colors",
                    overdue ? "bg-red-50/50" : "hover:bg-receipt-gold/3"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded flex items-center justify-center flex-shrink-0",
                    overdue ? "bg-red-50" : "bg-receipt-gold/10"
                  )}>
                    <Icon className={cn("h-3.5 w-3.5", overdue ? "text-red-500" : typeColors[r.reminder_type] || "text-receipt-brown")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-ink truncate">{r.title}</p>
                    <span className={cn(
                      "flex items-center gap-1 text-[10px] mt-0.5",
                      overdue ? "text-red-600 font-medium" : "text-ink-faint"
                    )}>
                      <Calendar className="h-2.5 w-2.5" />
                      {overdue ? "Gecikti: " : ""}{formatDate(r.due_date)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
