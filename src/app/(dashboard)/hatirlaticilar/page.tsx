import { getReminders } from "@/lib/actions/reminders";
import { ReminderForm } from "@/components/reminders/reminder-form";
import { ReminderList } from "@/components/reminders/reminder-list";
import { Bell } from "lucide-react";

export default async function HatirlaticilarPage() {
  const reminders = await getReminders();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Bell className="h-5 w-5 text-receipt-brown" />
          <h1 className="text-2xl font-bold text-ink tracking-tight">Hatırlatıcılar</h1>
        </div>
        <p className="text-ink-muted text-sm">
          Ödeme tarihleri, belge yüklemeleri ve diğer hatırlatıcılarınız.
        </p>
      </div>

      {/* Form */}
      <ReminderForm />

      {/* List */}
      <ReminderList reminders={reminders} />
    </div>
  );
}
