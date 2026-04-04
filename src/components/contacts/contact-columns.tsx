"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Contact } from "@/types";
import { Building2, Phone, Mail, MapPin } from "lucide-react";

const typeLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  supplier: { label: "Tedarikçi", variant: "default" },
  customer: { label: "Müşteri", variant: "secondary" },
  both: { label: "Tedarikçi/Müşteri", variant: "outline" },
};

export const contactColumns: ColumnDef<Contact>[] = [
  {
    accessorKey: "company_name",
    header: "Firma",
    cell: ({ row }) => (
      <Link href={`/rehber/${row.original.id}`} className="font-medium text-ink hover:text-brand transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-4 w-4 text-brand" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{row.original.company_name}</p>
            {row.original.tax_id && (
              <p className="text-xs text-ink-faint">VKN: {row.original.tax_id}</p>
            )}
          </div>
        </div>
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Tür",
    cell: ({ row }) => {
      const t = typeLabels[row.original.type] || typeLabels.supplier;
      return <Badge variant={t.variant} className="text-xs">{t.label}</Badge>;
    },
  },
  {
    accessorKey: "phone",
    header: "Telefon",
    cell: ({ row }) => row.original.phone ? (
      <div className="flex items-center gap-1.5 text-sm text-ink-muted">
        <Phone className="h-3.5 w-3.5" />
        {row.original.phone}
      </div>
    ) : <span className="text-ink-faint text-sm">-</span>,
  },
  {
    accessorKey: "email",
    header: "E-posta",
    cell: ({ row }) => row.original.email ? (
      <div className="flex items-center gap-1.5 text-sm text-ink-muted">
        <Mail className="h-3.5 w-3.5" />
        <span className="truncate max-w-[180px]">{row.original.email}</span>
      </div>
    ) : <span className="text-ink-faint text-sm">-</span>,
  },
  {
    accessorKey: "city",
    header: "Şehir",
    cell: ({ row }) => row.original.city ? (
      <div className="flex items-center gap-1.5 text-sm text-ink-muted">
        <MapPin className="h-3.5 w-3.5" />
        {row.original.city}
      </div>
    ) : <span className="text-ink-faint text-sm">-</span>,
  },
  {
    accessorKey: "is_active",
    header: "Durum",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "outline"} className="text-xs">
        {row.original.is_active ? "Aktif" : "Pasif"}
      </Badge>
    ),
  },
];
