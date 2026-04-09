"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";

export interface Insight {
  type: "warning" | "info" | "success";
  title: string;
  description: string;
  metric?: string;
}

/** Dashboard için akıllı harcama insight'ları */
export async function getSmartInsights(): Promise<Insight[]> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) return [];

  const insights: Insight[] = [];

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];

  // Bu ay ve geçen ay harcamalarını çek
  const [thisMonthRes, lastMonthRes, topSuppliersRes, uncategorizedRes] = await Promise.all([
    supabase
      .from("documents")
      .select("total_amount")
      .eq("workspace_id", workspace.id)
      .eq("direction", "expense")
      .gte("issue_date", thisMonth)
      .not("total_amount", "is", null),
    supabase
      .from("documents")
      .select("total_amount")
      .eq("workspace_id", workspace.id)
      .eq("direction", "expense")
      .gte("issue_date", lastMonth)
      .lte("issue_date", lastMonthEnd)
      .not("total_amount", "is", null),
    // En çok harcama yapılan tedarikçiler (bu ay)
    supabase
      .from("documents")
      .select("supplier_name, total_amount")
      .eq("workspace_id", workspace.id)
      .eq("direction", "expense")
      .gte("issue_date", thisMonth)
      .not("total_amount", "is", null)
      .not("supplier_name", "is", null),
    // Kategorisi olmayan belgeler
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspace.id)
      .is("category_id", null)
      .neq("file_type", "manual"),
  ]);

  const thisMonthTotal = thisMonthRes.data?.reduce((s, d) => s + (d.total_amount || 0), 0) || 0;
  const lastMonthTotal = lastMonthRes.data?.reduce((s, d) => s + (d.total_amount || 0), 0) || 0;

  // 1) Aylık harcama karşılaştırması
  if (lastMonthTotal > 0 && thisMonthTotal > 0) {
    const changePercent = Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100);
    if (changePercent > 20) {
      insights.push({
        type: "warning",
        title: "Harcamalar artıyor",
        description: `Bu ay geçen aya göre %${changePercent} daha fazla harcama yaptınız.`,
        metric: `${formatTL(thisMonthTotal)} / ${formatTL(lastMonthTotal)}`,
      });
    } else if (changePercent < -15) {
      insights.push({
        type: "success",
        title: "Harcamalar azaldı",
        description: `Bu ay geçen aya göre %${Math.abs(changePercent)} daha az harcadınız.`,
        metric: `${formatTL(thisMonthTotal)} / ${formatTL(lastMonthTotal)}`,
      });
    }
  }

  // 2) En çok harcama yapılan tedarikçi
  if (topSuppliersRes.data && topSuppliersRes.data.length > 0) {
    const supplierTotals = new Map<string, number>();
    for (const doc of topSuppliersRes.data) {
      const name = doc.supplier_name as string;
      supplierTotals.set(name, (supplierTotals.get(name) || 0) + (doc.total_amount || 0));
    }
    const sorted = Array.from(supplierTotals.entries()).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const [topName, topAmount] = sorted[0];
      const percentage = thisMonthTotal > 0 ? Math.round((topAmount / thisMonthTotal) * 100) : 0;
      if (percentage > 30) {
        insights.push({
          type: "info",
          title: `${topName} baskın tedarikçi`,
          description: `Bu ayki harcamalarınızın %${percentage}'i tek bir tedarikçiye gidiyor.`,
          metric: formatTL(topAmount),
        });
      }
    }
  }

  // 3) Kategorisiz belge uyarısı
  const uncategorizedCount = uncategorizedRes.count || 0;
  if (uncategorizedCount > 3) {
    insights.push({
      type: "warning",
      title: `${uncategorizedCount} belge kategorisiz`,
      description: "Kategorilenmemiş belgeler raporlarınızı eksik gösterir. Belgelere kategori atayın.",
    });
  }

  // 4) Hiç belge yoksa teşvik
  if (thisMonthTotal === 0 && lastMonthTotal === 0) {
    insights.push({
      type: "info",
      title: "Başlayın!",
      description: "Henüz bu ay belge yüklenmemiş. İlk makbuzunuzu yükleyerek başlayın.",
    });
  }

  return insights;
}

function formatTL(amount: number): string {
  return amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
