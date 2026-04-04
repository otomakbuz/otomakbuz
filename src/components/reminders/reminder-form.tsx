"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createReminder } from "@/lib/actions/reminders";
import { toast } from "sonner";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReminderType, RecurrenceRule } from "@/types";

const typeOptions: { value: ReminderType; label: string }[] = [
  { value: "payment", label: "Ödeme" },
  { value: "upload", label: "Belge Yükleme" },
  { value: "review", label: "İnceleme" },
  { value: "custom", label: "Diğer" },
];

const recurrenceOptions: { value: RecurrenceRule; label: string }[] = [
  { value: "weekly", label: "Haftalık" },
  { value: "monthly", label: "Aylık" },
  { value: "yearly", label: "Yıllık" },
];

interface ReminderFormProps {
  documentId?: string;
  contactId?: string;
  defaultTitle?: string;
}

export function ReminderForm({ documentId, contactId, defaultTitle }: ReminderFormProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(defaultTitle || "");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reminderType, setReminderType] = useState<ReminderType>("custom");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>("monthly");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      toast.error("Başlık ve tarih zorunlu");
      return;
    }

    setSaving(true);
    try {
      await createReminder({
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: new Date(dueDate).toISOString(),
        reminder_type: reminderType,
        document_id: documentId,
        contact_id: contactId,
        is_recurring: isRecurring,
        recurrence_rule: isRecurring ? recurrenceRule : undefined,
      });
      toast.success("Hatırlatıcı eklendi");
      setTitle(defaultTitle || "");
      setDescription("");
      setDueDate("");
      setReminderType("custom");
      setIsRecurring(false);
      setOpen(false);
    } catch {
      toast.error("Hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="receipt-card rounded">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-receipt-brown" />
          <span className="font-semibold text-ink text-sm">Hatırlatıcı Ekle</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-ink-faint" />
        ) : (
          <ChevronDown className="h-4 w-4 text-ink-faint" />
        )}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4 border-t border-paper-lines pt-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1.5">Başlık *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örnek: Fatura ödeme tarihi"
              className="w-full px-3 py-2 text-sm rounded border border-paper-lines bg-paper text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-receipt-gold/30 focus:border-receipt-gold"
            />
          </div>

          {/* Due date + Type row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1.5">Tarih *</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded border border-paper-lines bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-receipt-gold/30 focus:border-receipt-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1.5">Tür</label>
              <select
                value={reminderType}
                onChange={(e) => setReminderType(e.target.value as ReminderType)}
                className="w-full px-3 py-2 text-sm rounded border border-paper-lines bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-receipt-gold/30 focus:border-receipt-gold"
              >
                {typeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1.5">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="İsteğe bağlı not..."
              className="w-full px-3 py-2 text-sm rounded border border-paper-lines bg-paper text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-receipt-gold/30 focus:border-receipt-gold resize-none"
            />
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded border-paper-lines text-receipt-brown focus:ring-receipt-gold/30"
              />
              <span className="text-xs text-ink-muted">Tekrarlansın</span>
            </label>
            {isRecurring && (
              <select
                value={recurrenceRule}
                onChange={(e) => setRecurrenceRule(e.target.value as RecurrenceRule)}
                className="px-2 py-1 text-xs rounded border border-paper-lines bg-paper text-ink"
              >
                {recurrenceOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={saving}
            className={cn(
              "w-full bg-receipt-brown text-white hover:bg-receipt-brown-dark",
              saving && "opacity-60"
            )}
          >
            {saving ? "Kaydediliyor..." : "Hatırlatıcı Ekle"}
          </Button>
        </form>
      )}
    </div>
  );
}
