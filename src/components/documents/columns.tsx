"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { Document } from "@/types";
import { StatusBadge } from "./status-badge";
import { ConfidenceBadge } from "./confidence-badge";
import { formatCurrency, formatDate, getDocumentTypeLabel } from "@/lib/utils";

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: "issue_date",
    header: "Tarih",
    cell: ({ row }) => {
      const date = row.getValue("issue_date") as string | null;
      return date ? formatDate(date) : "-";
    },
  },
  {
    accessorKey: "supplier_name",
    header: "Firma",
    cell: ({ row }) => (
      <Link href={`/belge/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
        {row.getValue("supplier_name") || "Bilinmiyor"}
      </Link>
    ),
  },
  {
    accessorKey: "document_type",
    header: "Belge Turu",
    cell: ({ row }) => getDocumentTypeLabel(row.getValue("document_type")),
  },
  {
    accessorKey: "category",
    header: "Kategori",
    cell: ({ row }) => {
      const cat = row.original.category;
      if (!cat) return "-";
      return (
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
          <span>{cat.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: "Toplam",
    cell: ({ row }) => {
      const amount = row.getValue("total_amount") as number | null;
      return amount !== null ? formatCurrency(amount, row.original.currency) : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "confidence_score",
    header: "Guven",
    cell: ({ row }) => <ConfidenceBadge score={row.getValue("confidence_score") as number | null} />,
  },
];
