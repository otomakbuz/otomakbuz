"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Eye, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchOpenRouterModels,
  type ModelInfo,
} from "@/lib/actions/ocr-settings";

interface Props {
  value: string;
  onChange: (modelId: string) => void;
  visionOnly?: boolean;
}

function formatPrice(p: number): string {
  if (p === 0) return "ücretsiz";
  if (p < 0.01) return `$${p.toFixed(4)}`;
  if (p < 1) return `$${p.toFixed(3)}`;
  return `$${p.toFixed(2)}`;
}

function formatContext(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return `${n}`;
}

export function OpenRouterModelPicker({
  value,
  onChange,
  visionOnly = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOpenRouterModels()
      .then((list) => {
        setModels(list);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Hata"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const base = visionOnly ? models.filter((m) => m.supports_vision) : models;
    return base.sort((a, b) => a.prompt_price - b.prompt_price);
  }, [models, visionOnly]);

  // Seçili modeli listede bul (deprecated bile olsa göster)
  const selected = useMemo(
    () => models.find((m) => m.id === value),
    [models, value]
  );

  // Öneriler: ucuz, vision destekli, popüler
  const recommended = useMemo(() => {
    const prefer = [
      "openai/gpt-4o-mini",
      "google/gemini-2.0-flash-001",
      "google/gemini-flash-1.5",
      "anthropic/claude-3.5-sonnet",
      "openai/gpt-4o",
    ];
    return prefer
      .map((id) => filtered.find((m) => m.id === id))
      .filter((m): m is ModelInfo => !!m);
  }, [filtered]);

  const others = useMemo(
    () => filtered.filter((m) => !recommended.some((r) => r.id === m.id)),
    [filtered, recommended]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-expanded={open}
        className="flex w-full items-center justify-between h-10 px-3 rounded-md border border-paper-lines bg-paper font-mono text-xs hover:bg-paper-hover transition-colors"
      >
        {loading ? (
          <span className="flex items-center gap-2 text-ink-muted">
            <Loader2 className="h-3 w-3 animate-spin" />
            Modeller yükleniyor...
          </span>
        ) : selected ? (
          <span className="flex items-center gap-2 truncate">
            <span className="font-medium text-ink truncate">
              {selected.name}
            </span>
            <span className="text-[10px] text-ink-faint shrink-0">
              {selected.id}
            </span>
          </span>
        ) : value ? (
          <span className="truncate">{value}</span>
        ) : (
          <span className="text-ink-faint">Model seçin...</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        className="w-[520px] p-0"
        align="start"
      >
        <Command
          filter={(itemValue, search) => {
            // itemValue = model.id, ek olarak name'i de arayalım
            const model = models.find((m) => m.id === itemValue);
            if (!model) return 0;
            const haystack = `${model.id} ${model.name}`.toLowerCase();
            return haystack.includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput
            placeholder="Model ara (gpt, claude, gemini, vision...)"
            className="text-sm"
          />
          <CommandList className="max-h-[340px]">
            {error && (
              <div className="px-3 py-4 text-xs text-red-600">{error}</div>
            )}
            <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>

            {recommended.length > 0 && (
              <CommandGroup heading="Önerilen (vision • ucuz)">
                {recommended.map((m) => (
                  <ModelRow
                    key={m.id}
                    model={m}
                    selected={m.id === value}
                    onSelect={() => {
                      onChange(m.id);
                      setOpen(false);
                    }}
                  />
                ))}
              </CommandGroup>
            )}

            {others.length > 0 && (
              <CommandGroup heading={`Tüm modeller (${others.length})`}>
                {others.slice(0, 50).map((m) => (
                  <ModelRow
                    key={m.id}
                    model={m}
                    selected={m.id === value}
                    onSelect={() => {
                      onChange(m.id);
                      setOpen(false);
                    }}
                  />
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ModelRow({
  model,
  selected,
  onSelect,
}: {
  model: ModelInfo;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <CommandItem value={model.id} onSelect={onSelect} className="py-2">
      <div className="flex items-center gap-2 w-full">
        <Check
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            selected ? "opacity-100 text-receipt-brown" : "opacity-0"
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-ink truncate">
              {model.name}
            </span>
            {model.is_free && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">
                ÜCRETSİZ
              </span>
            )}
            {model.supports_vision && (
              <Eye className="h-3 w-3 text-receipt-gold shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-ink-faint font-mono mt-0.5">
            <span className="truncate">{model.id}</span>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0 text-[10px] text-ink-muted tabular-nums">
          <span className="font-semibold text-ink">
            {formatPrice(model.prompt_price)}
            <span className="text-ink-faint"> / </span>
            {formatPrice(model.completion_price)}
          </span>
          <span className="text-ink-faint">
            {formatContext(model.context)} ctx
          </span>
        </div>
      </div>
    </CommandItem>
  );
}

// Footer açıklaması için ayrı export
export function ModelPickerHint() {
  return (
    <p className="text-[10px] text-ink-faint flex items-center gap-1 mt-1">
      <Sparkles className="h-2.5 w-2.5" />
      Fiyatlar 1M token başına. <Eye className="h-2.5 w-2.5" /> = vision desteği.
    </p>
  );
}
