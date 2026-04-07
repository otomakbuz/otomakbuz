"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { Document } from "@/types";
import { StatusBadge } from "./status-badge";
import { ConfidenceBadge } from "./confidence-badge";
import { DirectionBadge } from "./direction-badge";
import { formatCurrency, formatDate, getDocumentTypeLabel } from "@/lib/utils";
import type { DocumentDirection } from "@/types";

export const columns: ColumnDef<Document>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="rounded accent-[#A0845C]"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="rounded accent-[#A0845C]"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
  },
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
      <Link href={`/belge/${row.original.id}`} className="font-medium text-brand hover:text-brand-dark hover:underline transition-colors">
        {row.getValue("supplier_name") || "Bilinmiyor"}
      </Link>
    ),
  },
  {
    accessorKey: "document_type",
    header: "Belge Türü",
    cell: ({ row }) => getDocumentTypeLabel(row.getValue("document_type")),
  },
  {
    accessorKey: "direction",
    header: "Yön",
    cell: ({ row }) => {
      const direction = row.getValue("direction") as DocumentDirection;
      return <DirectionBadge direction={direction || "expense"} />;
    },
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
    header: "Güven",
    cell: ({ row }) => <ConfidenceBadge score={row.getValue("confidence_score") as number | null} />,
  },
];
