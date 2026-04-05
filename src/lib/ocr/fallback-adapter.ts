import type { OcrAdapter, OcrResult } from "./types";

/**
 * FallbackOcrAdapter — birden fazla OCR adapter'ını sırayla dener.
 *
 * Akış:
 *   Primary → retry (429/5xx) → Secondary → retry → ... → hepsi fail → error
 *
 * Her adapter için retry-with-exponential-backoff; sadece geçici hatalarda
 * (rate limit, 5xx, timeout, empty response) retry yapılır. Kalıcı hatalarda
 * (auth, bad request, parse) bir sonraki adapter'a hemen geçilir.
 */

export interface FallbackEntry {
  adapter: OcrAdapter;
  label: string; // human-readable ör. "OpenRouter: gpt-4o-mini"
}

export interface FallbackOptions {
  /** Her adapter için retry sayısı. Default 2 (yani toplam 3 deneme). */
  retries?: number;
  /** Exponential backoff başlangıç gecikmesi (ms). Default 1000. */
  retryDelayMs?: number;
}

export class FallbackOcrAdapter implements OcrAdapter {
  private readonly entries: FallbackEntry[];
  private readonly retries: number;
  private readonly baseDelay: number;

  constructor(entries: FallbackEntry[], opts: FallbackOptions = {}) {
    if (!entries.length) {
      throw new Error("FallbackOcrAdapter: en az bir adapter gerekli");
    }
    this.entries = entries;
    this.retries = opts.retries ?? 2;
    this.baseDelay = opts.retryDelayMs ?? 1000;
  }

  async processDocument(fileUrl: string, fileType: string): Promise<OcrResult[]> {
    const errors: string[] = [];

    for (let i = 0; i < this.entries.length; i++) {
      const { adapter, label } = this.entries[i];

      for (let attempt = 0; attempt <= this.retries; attempt++) {
        try {
          const result = await adapter.processDocument(fileUrl, fileType);
          if (i > 0 || attempt > 0) {
            console.log(
              `[OCR] ✔ ${label} başarılı (adapter #${i + 1}, deneme ${attempt + 1})`
            );
          }
          return result;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          const retryable = isRetryableError(e);

          if (retryable && attempt < this.retries) {
            const delay = this.baseDelay * Math.pow(2, attempt);
            console.warn(
              `[OCR] ⟳ ${label} geçici hata (${attempt + 1}/${this.retries}, ${delay}ms bekleniyor): ${msg.slice(0, 120)}`
            );
            await sleep(delay);
            continue;
          }

          errors.push(`${label}: ${msg}`);
          console.warn(
            `[OCR] ✗ ${label} vazgeçildi${i < this.entries.length - 1 ? " → sonraki sağlayıcıya geçiliyor" : ""}`
          );
          break; // bir sonraki adapter
        }
      }
    }

    throw new Error(
      `Tüm OCR sağlayıcıları başarısız oldu.\n\n${errors
        .map((e, i) => `${i + 1}. ${e}`)
        .join("\n\n")}`
    );
  }
}

/**
 * Geçici (retry edilebilir) hata mı?
 * - 429 rate limit
 * - 5xx sunucu hatası
 * - timeout / network
 * - empty response (bazı modeller zaman zaman boş döner)
 */
function isRetryableError(err: unknown): boolean {
  const msg = String(err instanceof Error ? err.message : err || "").toLowerCase();
  return (
    /\b429\b/.test(msg) ||
    msg.includes("rate limit") ||
    msg.includes("rate-limited") ||
    msg.includes("rate_limit") ||
    msg.includes("temporarily") ||
    msg.includes("timeout") ||
    msg.includes("timed out") ||
    msg.includes("econnreset") ||
    msg.includes("network") ||
    msg.includes("fetch failed") ||
    msg.includes("boş yanıt") ||
    msg.includes("empty response") ||
    /\b5\d{2}\b/.test(msg)
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
