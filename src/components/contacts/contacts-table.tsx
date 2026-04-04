"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { contactColumns } from "./contact-columns";
import type { Contact } from "@/types";
import { Building2, Plus } from "lucide-react";
import Link from "next/link";

export function ContactsTable({ contacts }: { contacts: Contact[] }) {
  const table = useReactTable({
    data: contacts,
    columns: contactColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
            <Building2 className="h-7 w-7 text-brand/60" />
          </div>
          <p className="text-sm font-medium text-ink mb-1">Henuz firma eklenmemis</p>
          <p className="text-xs text-ink-faint mb-4 text-center max-w-xs">
            Tedarikci ve musterilerinizi ekleyerek belgelerinizi firmalarla iliskilendirin.
          </p>
          <Link href="/rehber/yeni">
            <Button size="sm" className="bg-brand hover:bg-brand-dark">
              <Plus className="h-4 w-4 mr-1.5" />
              Firma Ekle
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-xs font-semibold text-ink-muted">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-slate-50/50 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <p className="text-xs text-ink-faint">
          {contacts.length} firma
        </p>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            &lsaquo;
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            &rsaquo;
          </Button>
        </div>
      </div>
    </div>
  );
}
