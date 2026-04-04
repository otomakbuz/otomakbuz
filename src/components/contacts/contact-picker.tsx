"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { searchContacts } from "@/lib/actions/contacts";
import { Building2, Check, ChevronsUpDown, Plus, X } from "lucide-react";

interface ContactPickerProps {
  value: string | null;
  displayValue?: string;
  onChange: (contactId: string | null, companyName: string | null) => void;
}

interface ContactOption {
  id: string;
  company_name: string;
  tax_id: string | null;
  type: string;
}

export function ContactPicker({ value, displayValue, onChange }: ContactPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<ContactOption[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 1) { setOptions([]); return; }
    setLoading(true);
    try {
      const results = await searchContacts(q);
      setOptions(results as ContactOption[]);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search, doSearch]);

  // Load initial options when opened
  useEffect(() => {
    if (open && options.length === 0 && !search) {
      doSearch(" "); // Fetch all
    }
  }, [open, options.length, search, doSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button type="button" className="flex items-center justify-between w-full h-11 px-3 rounded-md border border-input bg-background text-sm font-normal hover:bg-accent hover:text-accent-foreground transition-colors">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 text-ink-faint flex-shrink-0" />
              {displayValue || "Firma sec (opsiyonel)"}
            </div>
            {value ? (
              <X className="h-4 w-4 text-ink-faint hover:text-ink flex-shrink-0" onClick={(e) => {
                e.stopPropagation();
                onChange(null, null);
              }} />
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-ink-faint flex-shrink-0" />
            )}
          </button>
        }
      />
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Firma ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
            autoFocus
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {loading && (
            <p className="text-xs text-ink-faint text-center py-3">Araniyor...</p>
          )}
          {!loading && options.length === 0 && search.length > 0 && (
            <p className="text-xs text-ink-faint text-center py-3">Firma bulunamadi</p>
          )}
          {options.map((opt) => (
            <button
              key={opt.id}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors"
              onClick={() => {
                onChange(opt.id, opt.company_name);
                setOpen(false);
                setSearch("");
              }}
            >
              <Building2 className="h-4 w-4 text-ink-faint flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-ink truncate">{opt.company_name}</p>
                {opt.tax_id && <p className="text-xs text-ink-faint">VKN: {opt.tax_id}</p>}
              </div>
              {value === opt.id && <Check className="h-4 w-4 text-brand ml-auto flex-shrink-0" />}
            </button>
          ))}
        </div>
        <div className="border-t border-slate-100 p-2">
          <a href="/rehber/yeni" target="_blank" className="flex items-center gap-2 px-3 py-2 text-sm text-brand hover:bg-brand/5 rounded-lg transition-colors">
            <Plus className="h-4 w-4" />
            Yeni Firma Ekle
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}
