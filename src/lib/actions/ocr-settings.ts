"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserWorkspace } from "./auth";
import type { OcrProvider, OcrSettingsView } from "@/types";
import { cookies } from "next/headers";
import crypto from "crypto";

const DEFAULT_MODELS: Record<OcrProvider, string | null> = {
  mock: null,
  openai: "gpt-4o-mini",
  openrouter: "openai/gpt-4o-mini",
  anthropic: "claude-3-5-sonnet-20241022",
  google: "gemini-1.5-flash",
};

function maskKey(key: string | null): string | null {
  if (!key || key.length < 8) return null;
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

/**
 * Mevcut OCR ayarlarını döner. API key hiçbir zaman olduğu gibi döndürülmez,
 * sadece maskelenmiş hali gider.
 */
export async function getOcrSettings(): Promise<OcrSettingsView> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Çalışma alanı bulunamadı");

  const { data, error } = await supabase
    .from("workspaces")
    .select("ocr_provider, ocr_api_key, ocr_model")
    .eq("id", workspace.id)
    .single();
  if (error) throw new Error(error.message);

  return {
    provider: (data.ocr_provider || "mock") as OcrProvider,
    model: data.ocr_model,
    has_key: !!data.ocr_api_key,
    masked_key: maskKey(data.ocr_api_key),
  };
}

/**
 * OCR ayarlarını günceller.
 * - apiKey boş gönderilirse mevcut key korunur (sadece provider/model değişir).
 * - apiKey "__CLEAR__" gönderilirse key silinir.
 */
export async function updateOcrSettings(input: {
  provider: OcrProvider;
  model: string | null;
  apiKey: string;
}) {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Çalışma alanı bulunamadı");

  const update: Record<string, unknown> = {
    ocr_provider: input.provider,
    ocr_model: input.model || DEFAULT_MODELS[input.provider],
  };

  if (input.apiKey === "__CLEAR__") {
    update.ocr_api_key = null;
  } else if (input.apiKey && input.apiKey.trim().length > 0) {
    update.ocr_api_key = input.apiKey.trim();
  }
  // else: boş string → mevcut key'e dokunma

  const { error } = await supabase
    .from("workspaces")
    .update(update)
    .eq("id", workspace.id);

  if (error) throw new Error(error.message);
  return { ok: true };
}

export interface ModelInfo {
  id: string;
  name: string;
  context: number;
  prompt_price: number; // $ / 1M tokens (normalize edilmiş)
  completion_price: number; // $ / 1M tokens
  supports_vision: boolean;
  is_free: boolean;
}

/**
 * OpenRouter'ın /models endpoint'inden canlı liste çeker ve sade bir şemaya dönüştürür.
 * API key gerektirmez; ama kullanıcı kaydedince fiyat görünür olsun.
 */
export async function fetchOpenRouterModels(): Promise<ModelInfo[]> {
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    next: { revalidate: 3600 }, // 1 saat cache
  });
  if (!res.ok) throw new Error(`OpenRouter models çekilemedi: ${res.status}`);
  const json = (await res.json()) as {
    data: Array<{
      id: string;
      name: string;
      context_length: number;
      pricing: { prompt: string; completion: string };
      architecture?: { input_modalities?: string[]; modality?: string };
    }>;
  };

  return json.data.map((m) => {
    const promptPer = parseFloat(m.pricing?.prompt || "0") * 1_000_000;
    const complPer = parseFloat(m.pricing?.completion || "0") * 1_000_000;
    const modalities =
      m.architecture?.input_modalities || [];
    const modalityStr = m.architecture?.modality || "";
    const supportsVision =
      modalities.includes("image") || modalityStr.includes("image");
    return {
      id: m.id,
      name: m.name,
      context: m.context_length || 0,
      prompt_price: promptPer,
      completion_price: complPer,
      supports_vision: supportsVision,
      is_free: promptPer === 0 && complPer === 0,
    };
  });
}

/**
 * API key'in geçerliliğini test eder — küçük bir istek atar.
 */
export async function testOcrConnection(): Promise<{
  ok: boolean;
  message: string;
  provider: OcrProvider;
}> {
  const supabase = await createClient();
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Çalışma alanı bulunamadı");

  const { data, error } = await supabase
    .from("workspaces")
    .select("ocr_provider, ocr_api_key, ocr_model")
    .eq("id", workspace.id)
    .single();
  if (error) throw new Error(error.message);

  const provider = (data.ocr_provider || "mock") as OcrProvider;

  if (provider === "mock") {
    return { ok: true, provider, message: "Mock sağlayıcı aktif — her zaman çalışır." };
  }

  if (!data.ocr_api_key) {
    return { ok: false, provider, message: "API key tanımlı değil." };
  }

  try {
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${data.ocr_api_key}` },
      });
      if (!res.ok) {
        const body = await res.text();
        return {
          ok: false,
          provider,
          message: `OpenAI hata: ${res.status} ${body.slice(0, 200)}`,
        };
      }
      const json = (await res.json()) as { data?: { id: string }[] };
      const model = data.ocr_model || "gpt-4o-mini";
      const found = json.data?.some((m) => m.id === model);
      return {
        ok: true,
        provider,
        message: found
          ? `Bağlantı başarılı • model "${model}" erişilebilir.`
          : `Bağlantı başarılı • fakat "${model}" modeli listede yok.`,
      };
    }

    if (provider === "openrouter") {
      // OpenRouter'ın /auth/key endpoint'i key doğrulama için idealdir
      const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: {
          Authorization: `Bearer ${data.ocr_api_key}`,
          "HTTP-Referer": "https://otomakbuz.com",
          "X-Title": "Otomakbuz",
        },
      });
      if (!res.ok) {
        const body = await res.text();
        return {
          ok: false,
          provider,
          message: `OpenRouter hata: ${res.status} ${body.slice(0, 200)}`,
        };
      }
      const json = (await res.json()) as {
        data?: {
          label?: string;
          usage?: number;
          limit?: number | null;
          is_free_tier?: boolean;
        };
      };
      const info = json.data;
      const model = data.ocr_model || "openai/gpt-4o-mini";
      const usage = info?.usage ?? 0;
      const limit = info?.limit;
      const limitTxt =
        limit !== null && limit !== undefined
          ? `$${usage.toFixed(2)} / $${limit.toFixed(2)}`
          : `$${usage.toFixed(2)} (limitsiz)`;
      return {
        ok: true,
        provider,
        message: `Bağlantı başarılı • model "${model}" • kullanım ${limitTxt}`,
      };
    }

    if (provider === "anthropic") {
      // Anthropic'in bir /models endpoint'i var — versiyon header gerekli
      const res = await fetch("https://api.anthropic.com/v1/models", {
        headers: {
          "x-api-key": data.ocr_api_key,
          "anthropic-version": "2023-06-01",
        },
      });
      if (!res.ok) {
        const body = await res.text();
        return {
          ok: false,
          provider,
          message: `Anthropic hata: ${res.status} ${body.slice(0, 200)}`,
        };
      }
      return { ok: true, provider, message: "Bağlantı başarılı." };
    }

    if (provider === "google") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(data.ocr_api_key)}`
      );
      if (!res.ok) {
        const body = await res.text();
        return {
          ok: false,
          provider,
          message: `Google hata: ${res.status} ${body.slice(0, 200)}`,
        };
      }
      return { ok: true, provider, message: "Bağlantı başarılı." };
    }

    return { ok: false, provider, message: "Desteklenmeyen sağlayıcı." };
  } catch (e) {
    return {
      ok: false,
      provider,
      message: e instanceof Error ? e.message : "Bilinmeyen hata",
    };
  }
}

// ============================================================
// OpenRouter OAuth PKCE flow
// ============================================================

const PKCE_COOKIE = "or_pkce_verifier";

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * PKCE akışını başlatır: code_verifier üretir, cookie'ye koyar,
 * OpenRouter auth URL'ini döner. Client bu URL'e yönlendirir.
 */
export async function startOpenRouterOAuth(
  origin: string
): Promise<{ url: string }> {
  // Auth kontrolü — workspace olmayan kullanıcı key üretemesin
  const workspace = await getUserWorkspace();
  if (!workspace) throw new Error("Çalışma alanı bulunamadı");

  // 32 byte random verifier → base64url (43-128 char aralığında olmalı)
  const verifier = base64UrlEncode(crypto.randomBytes(32));
  const challenge = base64UrlEncode(
    crypto.createHash("sha256").update(verifier).digest()
  );

  const cookieStore = await cookies();
  cookieStore.set(PKCE_COOKIE, verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 dakika
  });

  const callbackUrl = `${origin}/ayarlar/openrouter-callback`;
  const url =
    `https://openrouter.ai/auth?callback_url=${encodeURIComponent(callbackUrl)}` +
    `&code_challenge=${encodeURIComponent(challenge)}` +
    `&code_challenge_method=S256`;

  return { url };
}

/**
 * OAuth callback: OpenRouter'dan gelen code'u API key'e çevirir
 * ve workspace'e kaydeder. Verifier cookie'den okunur.
 */
export async function exchangeOpenRouterCode(
  code: string
): Promise<{ ok: boolean; message: string }> {
  const workspace = await getUserWorkspace();
  if (!workspace) return { ok: false, message: "Çalışma alanı bulunamadı" };

  const cookieStore = await cookies();
  const verifier = cookieStore.get(PKCE_COOKIE)?.value;
  if (!verifier) {
    return {
      ok: false,
      message: "PKCE verifier bulunamadı (oturum süresi dolmuş olabilir).",
    };
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/auth/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        code_verifier: verifier,
        code_challenge_method: "S256",
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        ok: false,
        message: `OpenRouter hata: ${res.status} ${body.slice(0, 200)}`,
      };
    }

    const json = (await res.json()) as { key?: string; user_id?: string };
    if (!json.key) {
      return { ok: false, message: "OpenRouter yanıtında key yok." };
    }

    // Key'i workspace'e kaydet + provider'ı openrouter yap
    const supabase = await createClient();
    const { error } = await supabase
      .from("workspaces")
      .update({
        ocr_provider: "openrouter",
        ocr_api_key: json.key,
        ocr_model: DEFAULT_MODELS.openrouter,
      })
      .eq("id", workspace.id);

    if (error) return { ok: false, message: error.message };

    // Verifier'ı temizle
    cookieStore.delete(PKCE_COOKIE);

    return { ok: true, message: "OpenRouter bağlantısı başarılı" };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Bilinmeyen hata",
    };
  }
}
