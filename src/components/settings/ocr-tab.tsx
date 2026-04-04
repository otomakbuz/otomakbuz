"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getOcrSettings,
  updateOcrSettings,
  testOcrConnection,
  startOpenRouterOAuth,
} from "@/lib/actions/ocr-settings";
import { toast } from "sonner";
import {
  Brain,
  Save,
  PlugZap,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import type { OcrProvider, OcrSettingsView } from "@/types";
import { cn } from "@/lib/utils";
import { OpenRouterModelPicker, ModelPickerHint } from "./model-picker";

const PROVIDERS: {
  value: OcrProvider;
  label: string;
  description: string;
  defaultModel: string;
  disabled?: boolean;
}[] = [
  {
    value: "mock",
    label: "Mock (Demo)",
    description: "Gerçek OCR yapmaz, test amaçlı sahte veri üretir.",
    defaultModel: "",
  },
  {
    value: "openai",
    label: "OpenAI (GPT-4o Vision)",
    description: "En yaygın çözüm. gpt-4o-mini ucuz ve yeterince iyi.",
    defaultModel: "gpt-4o-mini",
  },
  {
    value: "openrouter",
    label: "OpenRouter",
    description:
      "Tek API key ile 100+ modele erişim (Claude, Gemini, Llama, GPT-4o). Maliyet optimizasyonu için ideal.",
    defaultModel: "openai/gpt-4o-mini",
  },
  {
    value: "anthropic",
    label: "Anthropic (Claude)",
    description: "Çok satırlı belgelerde güçlü. (yakında)",
    defaultModel: "claude-3-5-sonnet-20241022",
    disabled: true,
  },
  {
    value: "google",
    label: "Google (Gemini)",
    description: "Fiyat/performans dengesi iyi. (yakında)",
    defaultModel: "gemini-1.5-flash",
    disabled: true,
  },
];

export function OcrTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState<OcrSettingsView | null>(null);

  const [provider, setProvider] = useState<OcrProvider>("mock");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    getOcrSettings()
      .then((s) => {
        setSettings(s);
        setProvider(s.provider);
        setModel(s.model || "");
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));

    // Callback'ten dönüş: başarı/hata toast'ı göster
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("or_connected") === "1") {
        toast.success("OpenRouter bağlantısı başarılı");
        url.searchParams.delete("or_connected");
        window.history.replaceState({}, "", url.toString());
      }
      const orError = url.searchParams.get("or_error");
      if (orError) {
        toast.error(`OpenRouter bağlantısı başarısız: ${orError}`);
        url.searchParams.delete("or_error");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);

  async function handleConnectOpenRouter() {
    setConnecting(true);
    try {
      const { url } = await startOpenRouterOAuth(window.location.origin);
      window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bağlantı başlatılamadı");
      setConnecting(false);
    }
  }

  const current = PROVIDERS.find((p) => p.value === provider);

  async function handleSave() {
    setSaving(true);
    setTestResult(null);
    try {
      await updateOcrSettings({
        provider,
        model: model || current?.defaultModel || null,
        apiKey,
      });
      toast.success("OCR ayarları kaydedildi");
      const fresh = await getOcrSettings();
      setSettings(fresh);
      setApiKey("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kaydetme hatası");
    } finally {
      setSaving(false);
    }
  }

  async function handleClearKey() {
    if (!confirm("API key'i silmek istediğinize emin misiniz?")) return;
    setSaving(true);
    try {
      await updateOcrSettings({
        provider,
        model: model || current?.defaultModel || null,
        apiKey: "__CLEAR__",
      });
      toast.success("API key silindi");
      const fresh = await getOcrSettings();
      setSettings(fresh);
      setApiKey("");
      setTestResult(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Silme hatası");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testOcrConnection();
      setTestResult({ ok: result.ok, message: result.message });
      if (result.ok) toast.success("Bağlantı başarılı");
      else toast.error("Bağlantı başarısız");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Test hatası";
      setTestResult({ ok: false, message: msg });
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="receipt-card rounded p-8 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-receipt-brown" />
      </div>
    );
  }

  return (
    <div className="receipt-card rounded">
      <div className="px-5 py-4 border-b border-paper-lines">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-receipt-brown" />
          <h3 className="font-semibold text-ink text-sm">OCR Sağlayıcısı</h3>
        </div>
        <p className="text-xs text-ink-faint mt-1">
          Belge tarama için kullanılacak AI modelini ve API anahtarını yönetin.
          Anahtar sunucu tarafında saklanır, tarayıcıya gönderilmez.
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Provider seçimi */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-ink">Sağlayıcı</Label>
          <Select
            value={provider}
            onValueChange={(v) => {
              setProvider(v as OcrProvider);
              const p = PROVIDERS.find((pp) => pp.value === v);
              if (p && !model) setModel(p.defaultModel);
            }}
          >
            <SelectTrigger className="h-10 border-paper-lines bg-paper">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((p) => (
                <SelectItem key={p.value} value={p.value} disabled={p.disabled}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{p.label}</span>
                    <span className="text-[10px] text-ink-faint">
                      {p.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {current && (
            <p className="text-xs text-ink-muted">{current.description}</p>
          )}
        </div>

        {/* Model */}
        {provider !== "mock" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-ink">Model</Label>
            {provider === "openrouter" ? (
              <>
                <OpenRouterModelPicker value={model} onChange={setModel} />
                <ModelPickerHint />
              </>
            ) : (
              <>
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={current?.defaultModel || ""}
                  className="h-10 border-paper-lines bg-paper font-mono text-sm"
                />
                <p className="text-xs text-ink-faint">
                  Boş bırakılırsa varsayılan model kullanılır.
                </p>
              </>
            )}
          </div>
        )}

        {/* OpenRouter tek tık bağlantı (PKCE) */}
        {provider === "openrouter" && !settings?.has_key && (
          <div className="rounded border border-receipt-gold/40 bg-gradient-to-br from-amber-50 to-orange-50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-receipt-brown/10 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-receipt-brown" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-ink">
                  Tek tıkla bağlan
                </h4>
                <p className="text-xs text-ink-muted mt-0.5">
                  OpenRouter hesabınıza giriş yapın, biz sizin için otomatik
                  olarak bir API key oluşturup kaydedelim. Manuel kopyalama yok.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleConnectOpenRouter}
              disabled={connecting}
              className="w-full bg-receipt-brown hover:bg-receipt-brown-dark text-white h-10"
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              OpenRouter ile Bağlan
            </Button>
            <p className="text-[10px] text-ink-faint text-center">
              veya aşağıdan manuel olarak API key girin
            </p>
          </div>
        )}

        {/* API Key */}
        {provider !== "mock" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-ink">API Key</Label>
            {settings?.has_key && settings.masked_key && (
              <div className="flex items-center gap-2 p-2.5 rounded border border-emerald-200 bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-xs text-emerald-800 flex-1 font-mono">
                  Kayıtlı: {settings.masked_key}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearKey}
                  className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Sil
                </Button>
              </div>
            )}
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  provider === "openai"
                    ? "sk-..."
                    : provider === "openrouter"
                      ? "sk-or-v1-..."
                      : provider === "anthropic"
                        ? "sk-ant-..."
                        : "API key"
                }
                className="h-10 border-paper-lines bg-paper font-mono text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-ink-faint">
              {settings?.has_key
                ? "Yeni bir anahtar girip Kaydet'e basarsanız mevcut anahtarın üzerine yazılır. Boş bırakırsanız değişmez."
                : "Anahtar kayıt edilince maskelenmiş olarak gösterilir."}
            </p>
          </div>
        )}

        {/* Test sonucu */}
        {testResult && (
          <div
            className={cn(
              "flex items-start gap-2 p-3 rounded border",
              testResult.ok
                ? "border-emerald-200 bg-emerald-50"
                : "border-red-200 bg-red-50"
            )}
          >
            {testResult.ok ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <p
              className={cn(
                "text-xs",
                testResult.ok ? "text-emerald-800" : "text-red-800"
              )}
            >
              {testResult.message}
            </p>
          </div>
        )}

        {/* Butonlar */}
        <div className="flex items-center gap-2 pt-2 border-t border-paper-lines">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-receipt-brown hover:bg-receipt-brown-dark text-white"
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Kaydet
          </Button>
          <Button
            type="button"
            onClick={handleTest}
            disabled={testing || saving}
            variant="outline"
            size="sm"
            className="border-paper-lines hover:border-receipt-gold"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PlugZap className="h-4 w-4 mr-2" />
            )}
            Bağlantıyı Test Et
          </Button>
        </div>
      </div>
    </div>
  );
}
