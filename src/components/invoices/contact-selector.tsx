"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Building2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchContacts } from "@/lib/actions/contacts";

interface ContactOption {
  id: string;
  company_name: string;
  tax_id: string | null;
  type: string;
}

interface ContactSelectorProps {
  contacts: ContactOption[];
  selectedContactId: string | null;
  onSelect: (contact: ContactOption | null) => void;
  onCreateNew?: () => void;
}

export function ContactSelector({
  contacts: initialContacts,
  selectedContactId,
  onSelect,
  onCreateNew,
}: ContactSelectorProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<ContactOption[]>(initialContacts);
  const ref = useRef<HTMLDivElement>(null);

  const selectedContact = initialContacts.find(
    (c) => c.id === selectedContactId
  );

  useEffect(() => {
    if (!search.trim()) {
      setResults(initialContacts);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await searchContacts(search);
        setResults(data as ContactOption[]);
      } catch {
        setResults(
          initialContacts.filter((c) =>
            c.company_name.toLowerCase().includes(search.toLowerCase())
          )
        );
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, initialContacts]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1">
          {selectedContact ? (
            <div className="flex items-center gap-2 p-2 rounded border border-paper-lines bg-surface/50">
              <Building2 className="h-4 w-4 text-ink-muted" />
              <span className="text-sm font-medium text-ink">
                {selectedContact.company_name}
              </span>
              {selectedContact.tax_id && (
                <span className="text-xs text-ink-faint ml-auto">
                  VKN: {selectedContact.tax_id}
                </span>
              )}
              <button
                type="button"
                className="text-xs text-red-500 hover:text-red-700 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(null);
                  setSearch("");
                }}
              >
                Temizle
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded border border-dashed border-paper-lines hover:border-receipt-gold/50 transition-colors">
              <Search className="h-4 w-4 text-ink-faint" />
              <span className="text-sm text-ink-faint">
                Mevcut cariden seç veya manuel gir...
              </span>
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover rounded-lg shadow-lg border border-paper-lines max-h-64 overflow-auto">
          <div className="p-2 border-b border-paper-lines">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari ara..."
                className="pl-7 h-8 text-sm"
                autoFocus
              />
            </div>
          </div>
          <div className="py-1">
            {results.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-ink-faint">
                Cari bulunamadı
              </div>
            ) : (
              results.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface/50 transition-colors text-left"
                  onClick={() => {
                    onSelect(contact);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Building2 className="h-4 w-4 text-ink-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink truncate">
                      {contact.company_name}
                    </div>
                    {contact.tax_id && (
                      <div className="text-xs text-ink-faint">
                        VKN: {contact.tax_id}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      contact.type === "customer"
                        ? "bg-blue-100 text-blue-700"
                        : contact.type === "supplier"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {contact.type === "customer"
                      ? "Müşteri"
                      : contact.type === "supplier"
                        ? "Tedarikçi"
                        : "Her İkisi"}
                  </span>
                </button>
              ))
            )}
          </div>
          {onCreateNew && (
            <div className="border-t border-paper-lines p-1">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface/50 transition-colors text-left text-sm text-receipt-brown font-medium"
                onClick={() => {
                  onCreateNew();
                  setOpen(false);
                }}
              >
                <UserPlus className="h-4 w-4" />
                Yeni Cari Ekle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
