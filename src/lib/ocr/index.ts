import { OcrAdapter } from "./types";
import { MockOcrAdapter } from "./mock-adapter";
import { OpenAIOcrAdapter } from "./openai-adapter";
import { FallbackOcrAdapter, type FallbackEntry } from "./fallback-adapter";
import { createClient } from "@/lib/supabase/server";

const OPENROUTER_HEADERS = {
  "HTTP-Referer": "https://otomakbuz.com",
  "X-Title": "Otomakbuz",
};

/**
 * OpenRouter üzerinde stabil ve ücretsiz/ucuz vision modellerinden oluşan
 * fallback havuzu. Kullanıcının seçtiği primary model burada varsa çıkarılır.
 *
 * Sıralama: hız + doğruluk + rate-limit toleransı. Önce en güvenilir.
 */
const OPENROUTER_FALLBACK_POOL = [
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.2-11b-vision-instruct:free",
  "qwen/qwen-2.5-vl-72b-instruct:free",
  "meta-llama/llama-3.2-90b-vision-instruct:free",
];

/**
 * OpenAI direkt için fallback havuzu (aynı API key'le).
 */
const OPENAI_FALLBACK_POOL = ["gpt-4o-mini", "gpt-4o"];

/**
 * Workspace ayarlarına göre OCR adapter'ı üretir.
 *
 * Tekil adapter yerine **FallbackOcrAdapter** döner: kullanıcının seçtiği
 * model primary olur, arkada 2-4 yedek model sıralanır. Primary 429/5xx
 * yerse router otomatik olarak sıradakine geçer.
 */
export async function getOcrAdapter(workspaceId?: string): Promise<OcrAdapter> {
  if (workspaceId) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("workspaces")
        .select("ocr_provider, ocr_api_key, ocr_model")
        .eq("id", workspaceId)
        .single();

      if (data?.ocr_api_key) {
        const provider = data.ocr_provider || "openai";
        const apiKey = data.ocr_api_key as string;

        if (provider === "openai") {
          const primary = (data.ocr_model as string) || "gpt-4o-mini";
          const chain = buildChain(primary, OPENAI_FALLBACK_POOL);
          const entries: FallbackEntry[] = chain.map((model) => ({
            label: `OpenAI ${model}`,
            adapter: new OpenAIOcrAdapter({ apiKey, model }),
          }));
          return new FallbackOcrAdapter(entries);
        }

        if (provider === "openrouter") {
          const primary = (data.ocr_model as string) || "google/gemini-2.0-flash-exp:free";
          const chain = buildChain(primary, OPENROUTER_FALLBACK_POOL);
          const entries: FallbackEntry[] = chain.map((model) => ({
            label: `OpenRouter ${model}`,
            adapter: new OpenAIOcrAdapter({
              apiKey,
              model,
              baseURL: "https://openrouter.ai/api/v1",
              extraHeaders: OPENROUTER_HEADERS,
            }),
          }));
          return new FallbackOcrAdapter(entries);
        }
      }
    } catch {
      // Ayar okunamazsa env/mock'a düş
    }
  }

  const adapterType = process.env.OCR_ADAPTER || "mock";
  switch (adapterType) {
    case "mock":
      return new MockOcrAdapter();
    default:
      return new MockOcrAdapter();
  }
}

/**
 * Primary + havuzdaki modelleri birleştir, duplicate'leri çıkar.
 * Primary her zaman ilk sırada.
 */
function buildChain(primary: string, pool: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of [primary, ...pool]) {
    if (!seen.has(m)) {
      seen.add(m);
      out.push(m);
    }
  }
  return out;
}

export type { OcrAdapter, OcrResult } from "./types";
export { FallbackOcrAdapter } from "./fallback-adapter";
