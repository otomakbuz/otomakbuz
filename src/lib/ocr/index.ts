import { OcrAdapter } from "./types";
import { MockOcrAdapter } from "./mock-adapter";
import { OpenAIOcrAdapter } from "./openai-adapter";
import { createClient } from "@/lib/supabase/server";

const OPENROUTER_HEADERS = {
  "HTTP-Referer": "https://otomakbuz.com",
  "X-Title": "Otomakbuz",
};

/**
 * Workspace ayarlarına göre uygun OCR adapter'ı döner.
 * Fallback: env OCR_ADAPTER → yoksa mock.
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

      if (data) {
        const provider = data.ocr_provider || "mock";

        if (provider === "openai" && data.ocr_api_key) {
          return new OpenAIOcrAdapter({
            apiKey: data.ocr_api_key,
            model: data.ocr_model || "gpt-4o-mini",
          });
        }

        if (provider === "openrouter" && data.ocr_api_key) {
          return new OpenAIOcrAdapter({
            apiKey: data.ocr_api_key,
            model: data.ocr_model || "openai/gpt-4o-mini",
            baseURL: "https://openrouter.ai/api/v1",
            extraHeaders: OPENROUTER_HEADERS,
          });
        }

        // Diğer provider'lar ileride eklenecek
      }
    } catch {
      // Ayar okunamazsa mock'a düş
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

export type { OcrAdapter, OcrResult } from "./types";
