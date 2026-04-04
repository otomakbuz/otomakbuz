"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Reminder, ReminderType, RecurrenceRule } from "@/types";

// Tüm hatırlatıcıları getir (tamamlanmamış önce, tarihe göre sıralı)
export async function getReminders(showCompleted = false): Promise<Reminder[]> {
  const supabase = await createClient();

  let query = supabase
    .from("reminders")
    .select("*, contact:contacts(company_name), document:documents(supplier_name)")
    .order("is_completed", { ascending: true })
    .order("due_date", { ascending: true });

  if (!showCompleted) {
    query = query.eq("is_completed", false);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data || []).map((r: Record<string, unknown>) => ({
    ...r,
    contact_name: (r.contact as Record<string, unknown> | null)?.company_name || null,
    document_name: (r.document as Record<string, unknown> | null)?.supplier_name || null,
  })) as Reminder[];
}

// Yaklaşan hatırlatıcılar (RPC - 7 gün içinde)
export async function getUpcomingReminders(days = 7): Promise<Reminder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_upcoming_reminders", { p_days: days });
  if (error) throw new Error(error.message);
  return (data || []) as Reminder[];
}

// Bekleyen hatırlatıcı sayısı (header badge)
export async function getPendingReminderCount(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_pending_reminder_count");
  if (error) return 0;
  return (data as number) || 0;
}

// Yeni hatırlatıcı oluştur
interface CreateReminderInput {
  title: string;
  description?: string;
  due_date: string;
  reminder_type?: ReminderType;
  document_id?: string;
  contact_id?: string;
  is_recurring?: boolean;
  recurrence_rule?: RecurrenceRule;
}

export async function createReminder(input: CreateReminderInput): Promise<Reminder> {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum bulunamadı");

  // Get workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!workspace) throw new Error("Workspace bulunamadı");

  const { data, error } = await supabase
    .from("reminders")
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      title: input.title,
      description: input.description || null,
      due_date: input.due_date,
      reminder_type: input.reminder_type || "custom",
      document_id: input.document_id || null,
      contact_id: input.contact_id || null,
      is_recurring: input.is_recurring || false,
      recurrence_rule: input.recurrence_rule || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/hatirlaticilar");
  revalidatePath("/panel");
  return data as Reminder;
}

// Hatırlatıcıyı tamamla
export async function completeReminder(id: string): Promise<void> {
  const supabase = await createClient();

  // Tekrarlayan mı kontrol et
  const { data: reminder } = await supabase
    .from("reminders")
    .select("is_recurring, recurrence_rule, due_date, title, description, reminder_type, workspace_id, user_id, document_id, contact_id")
    .eq("id", id)
    .single();

  // Mevcut olanı tamamla
  const { error } = await supabase
    .from("reminders")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Tekrarlayan ise bir sonrakini oluştur
  if (reminder?.is_recurring && reminder.recurrence_rule) {
    const currentDue = new Date(reminder.due_date);
    let nextDue: Date;

    switch (reminder.recurrence_rule) {
      case "weekly":
        nextDue = new Date(currentDue.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        nextDue = new Date(currentDue);
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case "yearly":
        nextDue = new Date(currentDue);
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        break;
      default:
        nextDue = new Date(currentDue.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    await supabase.from("reminders").insert({
      workspace_id: reminder.workspace_id,
      user_id: reminder.user_id,
      title: reminder.title,
      description: reminder.description,
      due_date: nextDue.toISOString(),
      reminder_type: reminder.reminder_type,
      document_id: reminder.document_id,
      contact_id: reminder.contact_id,
      is_recurring: true,
      recurrence_rule: reminder.recurrence_rule,
    });
  }

  revalidatePath("/hatirlaticilar");
  revalidatePath("/panel");
}

// Hatırlatıcıyı sil
export async function deleteReminder(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reminders")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/hatirlaticilar");
  revalidatePath("/panel");
}
