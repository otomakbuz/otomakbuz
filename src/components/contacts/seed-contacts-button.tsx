"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { seedMockContacts } from "@/lib/actions/contacts";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DatabaseZap } from "lucide-react";

export function SeedContactsButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSeed() {
    setLoading(true);
    try {
      const result = await seedMockContacts();
      toast.success(result.message);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSeed}
      disabled={loading}
      className="gap-1.5 text-xs"
    >
      <DatabaseZap className="h-3.5 w-3.5" />
      {loading ? "Ekleniyor..." : "Demo Verisi Ekle"}
    </Button>
  );
}
