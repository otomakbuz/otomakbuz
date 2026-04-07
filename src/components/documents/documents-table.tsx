"use client";

import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, flexRender, SortingState, RowSelectionState,
} from "@tanstack/react-table";
import { useState, useTransition } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import type { Document } from "@/types";
import { ChevronLeft, ChevronRight, Trash2, RefreshCw } from "lucide-react";
import { bulkDeleteDocuments, retryOcr } from "@/lib/actions/documents";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DocumentsTable({ data }: { data: Document[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const table = useReactTable({
    data, columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    state: { sorting, rowSelection },
    initialState: { pagination: { pageSize: 20 } },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((r) => r.original.id);
  const hasFailedSelected = selectedRows.some((r) => r.original.status === "failed");

  function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      try {
        await bulkDeleteDocuments(selectedIds);
        toast.success(`${selectedIds.length} belge silindi`);
        setRowSelection({});
        router.refresh();
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  function handleRetryOcr() {
    const failedIds = selectedRows
      .filter((r) => r.original.status === "failed")
      .map((r) => r.original.id);
    if (failedIds.length === 0) return;
    startTransition(async () => {
      let success = 0;
      let fail = 0;
      for (const id of failedIds) {
        try {
          await retryOcr(id);
          success++;
        } catch {
          fail++;
        }
      }
      if (success > 0) toast.success(`${success} belge yeniden tarandı`);
      if (fail > 0) toast.error(`${fail} belge yeniden taranamadı`);
      setRowSelection({});
      router.refresh();
    });
  }

  return (
    <div>
      {/* Toplu işlem toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-receipt-gold/10 border border-receipt-gold/30">
          <span className="text-sm font-medium text-ink">
            {selectedIds.length} belge seçili
          </span>
          <div className="flex gap-2 ml-auto">
            {hasFailedSelected && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetryOcr}
                disabled={isPending}
                className="gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
                Yeniden OCR
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkDelete}
              disabled={isPending}
              className="gap-1.5 text-red-600 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Sil
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                  Henuz belge yok. Yukle sayfasindan belge ekleyin.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-slate-500">
          {data.length} belgeden {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} arasi gosteriliyor
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
