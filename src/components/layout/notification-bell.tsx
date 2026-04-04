"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPendingReminderCount } from "@/lib/actions/reminders";

export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    getPendingReminderCount().then(setCount).catch(() => setCount(0));
  }, []);

  return (
    <Link
      href="/hatirlaticilar"
      className="relative flex items-center justify-center w-8 h-8 rounded hover:bg-receipt-gold/10 transition-colors"
    >
      <Bell className="h-4 w-4 text-ink-muted" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
