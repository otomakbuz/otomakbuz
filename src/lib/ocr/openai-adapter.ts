import type { OcrAdapter, OcrResult, OcrLineItem } from "./types";

/**
 * OpenAI Vision tabanlı OCR adapter.
 * GPT-4o / GPT-4o-mini ile görsel analiz + yapılandırılmış JSON çıkarımı.
 *
 * Türk vergi belgelerini (VUK 229-237) hedefler: fatura, fiş, SMM, GP, müstahsil, irsaliye.
 */
export interface OpenAIAdapterOptions {
  apiKey: string;
  model?: string;
  baseURL?: string; // e.g., https://api.openai.com/v1 or https://openrouter.ai/api/v1
  extraHeaders?: Record<string, string>; // e.g., HTTP-Referer, X-Title for OpenRouter
}

export class OpenAIOcrAdapter implements OcrAdapter {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseURL: string;
  private readonly extraHeaders: Record<string, string>;

  constructor(opts: OpenAIAdapterOptions) {
    this.apiKey = opts.apiKey;
    this.model = opts.model || "gpt-4o-mini";
    this.baseURL = opts.baseURL || "https://api.openai.com/v1";
    this.extraHeaders = opts.extraHeaders || {};
  }

  /**
   * Model yeteneklerini tespit et.
   * OpenAI'nin strict json_schema modu sadece gpt-4o ve openai/* ailesinde çalışır.
   * Diğer modeller (gemini, claude, qwen, llama, mistral, vb.) için json_object veya
   * salt prompt-based JSON extraction kullanılır.
   */
  private getCapabilities() {
    const m = this.model.toLowerCase();
    const isOpenAI =
      m.startsWith("gpt-") ||
      m.startsWith("openai/gpt-") ||
      m.startsWith("o1") ||
      m.startsWith("openai/o1");
    // json_object geniş desteklenir: OpenAI, Anthropic (Claude), Google (Gemini), Mistral, bazı DeepSeek
    const supportsJsonObject =
      isOpenAI ||
      m.includes("claude") ||
      m.includes("gemini") ||
      m.includes("mistral") ||
      m.includes("deepseek");
    // detail: "high" sadece OpenAI ailesinde geçerli
    const supportsImageDetail = isOpenAI;
    return {
      isOpenAI,
      supportsStrictSchema: isOpenAI,
      supportsJsonObject,
      supportsImageDetail,
    };
  }

  async processDocument(fileUrl: string, fileType: string): Promise<OcrResult> {
    const isPdf = fileType.toLowerCase() === "pdf";
    if (isPdf) {
      // GPT-4o Vision native PDF desteği henüz sınırlı — MVP için PDF'yi reddediyoruz.
      // İleride: PDF → ilk sayfayı görsele dönüştür.
      throw new Error(
        "OpenAI sağlayıcısı şu an sadece görsel formatları destekliyor (JPG/PNG/WEBP). PDF desteği yakında."
      );
    }

    const caps = this.getCapabilities();

    const systemPromptBase = `Sen Türk vergi belgelerini (VUK 229-237) analiz eden bir OCR asistanısın.
Fatura, perakende fişi, serbest meslek makbuzu, gider pusulası, müstahsil makbuzu veya sevk irsaliyesi olabilir.
Görseldeki bilgileri aşağıdaki JSON şemasına göre çıkar. Emin olmadığın alanları null bırak.
Para birimi varsayılan TRY. Tarih formatı YYYY-MM-DD.`;

    // Strict schema desteklenmiyorsa, şema bilgisini sistem promptuna gömüyoruz.
    const schemaHint = caps.supportsStrictSchema
      ? ""
      : `

YANIT SADECE JSON OLMALI — hiç açıklama, markdown, code fence yazma.
Şema:
{
  "supplier_name": string|null,
  "supplier_tax_id": string|null,
  "supplier_tax_office": string|null,
  "supplier_address": string|null,
  "buyer_name": string|null,
  "buyer_tax_id": string|null,
  "buyer_tax_office": string|null,
  "buyer_address": string|null,
  "document_type": "fatura"|"perakende_fis"|"serbest_meslek_makbuzu"|"gider_pusulasi"|"mustahsil_makbuzu"|"irsaliye"|null,
  "document_number": string|null,
  "issue_date": string|null,
  "issue_time": string|null,
  "waybill_number": string|null,
  "subtotal_amount": number|null,
  "vat_amount": number|null,
  "vat_rate": number|null,
  "withholding_amount": number|null,
  "total_amount": number|null,
  "currency": string,
  "payment_method": string|null,
  "line_items": [{"name": string, "quantity": number, "unit_price": number, "vat_rate": number|null, "total": number}]|null,
  "raw_text": string,
  "overall_confidence": number,
  "field_confidence": {"supplier_name": number, "total_amount": number, ...}
}`;

    const systemPrompt = systemPromptBase + schemaHint;

    const userPrompt = `Bu belgeyi analiz et ve JSON olarak döndür. Her alan için 0-100 arası confidence (field_confidence) ver.
Belge türü için: fatura | perakende_fis | serbest_meslek_makbuzu | gider_pusulasi | mustahsil_makbuzu | irsaliye`;

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        supplier_name: { type: ["string", "null"] },
        supplier_tax_id: { type: ["string", "null"] },
        supplier_tax_office: { type: ["string", "null"] },
        supplier_address: { type: ["string", "null"] },
        buyer_name: { type: ["string", "null"] },
        buyer_tax_id: { type: ["string", "null"] },
        buyer_tax_office: { type: ["string", "null"] },
        buyer_address: { type: ["string", "null"] },
        document_type: {
          type: ["string", "null"],
          enum: [
            "fatura",
            "perakende_fis",
            "serbest_meslek_makbuzu",
            "gider_pusulasi",
            "mustahsil_makbuzu",
            "irsaliye",
            null,
          ],
        },
        document_number: { type: ["string", "null"] },
        issue_date: { type: ["string", "null"] },
        issue_time: { type: ["string", "null"] },
        waybill_number: { type: ["string", "null"] },
        subtotal_amount: { type: ["number", "null"] },
        vat_amount: { type: ["number", "null"] },
        vat_rate: { type: ["number", "null"] },
        withholding_amount: { type: ["number", "null"] },
        total_amount: { type: ["number", "null"] },
        currency: { type: "string" },
        payment_method: { type: ["string", "null"] },
        line_items: {
          type: ["array", "null"],
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string" },
              quantity: { type: "number" },
              unit_price: { type: "number" },
              vat_rate: { type: ["number", "null"] },
              total: { type: "number" },
            },
            required: ["name", "quantity", "unit_price", "vat_rate", "total"],
          },
        },
        raw_text: { type: "string" },
        overall_confidence: { type: "number" },
        field_confidence: {
          type: "object",
          additionalProperties: { type: "number" },
        },
      },
      required: [
        "supplier_name",
        "supplier_tax_id",
        "supplier_tax_office",
        "supplier_address",
        "buyer_name",
        "buyer_tax_id",
        "buyer_tax_office",
        "buyer_address",
        "document_type",
        "document_number",
        "issue_date",
        "issue_time",
        "waybill_number",
        "subtotal_amount",
        "vat_amount",
        "vat_rate",
        "withholding_amount",
        "total_amount",
        "currency",
        "payment_method",
        "line_items",
        "raw_text",
        "overall_confidence",
        "field_confidence",
      ],
    } as const;

    // Görsel içerik — detail sadece OpenAI ailesinde gönderilir
    const imageContent = caps.supportsImageDetail
      ? { type: "image_url", image_url: { url: fileUrl, detail: "high" } }
      : { type: "image_url", image_url: { url: fileUrl } };

    // Response format — modelin yeteneğine göre seç
    let responseFormat: Record<string, unknown> | undefined;
    if (caps.supportsStrictSchema) {
      responseFormat = {
        type: "json_schema",
        json_schema: {
          name: "turkish_tax_document",
          schema,
          strict: true,
        },
      };
    } else if (caps.supportsJsonObject) {
      responseFormat = { type: "json_object" };
    }
    // Desteklemeyen modeller için response_format hiç gönderilmez — promptla yetiniriz.

    const body: Record<string, unknown> = {
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [{ type: "text", text: userPrompt }, imageContent],
        },
      ],
      temperature: 0.1,
    };
    if (responseFormat) body.response_format = responseFormat;

    const res = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...this.extraHeaders,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      // Sağlayıcı hata mesajını temizle, kullanıcıya okunur bir metin üret
      let friendly = errBody.slice(0, 300);
      try {
        const parsed = JSON.parse(errBody) as {
          error?: {
            message?: string;
            metadata?: { raw?: string; provider_name?: string };
          };
        };
        const raw = parsed.error?.metadata?.raw;
        const msg = parsed.error?.message;
        const provider = parsed.error?.metadata?.provider_name;
        if (raw) friendly = raw;
        else if (msg) friendly = provider ? `${provider}: ${msg}` : msg;
      } catch {
        // JSON değilse ham metni kullan
      }

      if (res.status === 429) {
        throw new Error(
          `OCR servisi şu anda yoğun (rate limit). ${friendly} — Ayarlar'dan farklı bir model seçin veya kendi API anahtarınızı ekleyin.`
        );
      }
      if (res.status === 401 || res.status === 403) {
        throw new Error(
          `OCR yetkilendirme hatası. API anahtarınızı Ayarlar > OCR bölümünden kontrol edin. (${friendly})`
        );
      }
      throw new Error(`OCR hatası (${res.status}): ${friendly}`);
    }

    const json = (await res.json()) as {
      choices: { message: { content: string } }[];
      usage?: unknown;
    };

    const content = json.choices?.[0]?.message?.content;
    if (!content)
      throw new Error(
        `Model (${this.model}) boş yanıt döndü. Farklı bir model deneyin.`
      );

    // Esnek JSON extraction — model markdown code fence veya ön/arka metinle sarmış olabilir
    const extractJson = (text: string): string => {
      // Markdown code fence (```json ... ```)
      const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fence) return fence[1].trim();
      // İlk { ile son } arası
      const first = text.indexOf("{");
      const last = text.lastIndexOf("}");
      if (first !== -1 && last > first) return text.slice(first, last + 1);
      return text.trim();
    };

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(extractJson(content));
    } catch (e) {
      throw new Error(
        `Model (${this.model}) geçerli JSON üretemedi: ${
          e instanceof Error ? e.message : "bilinmeyen"
        }. Daha yetenekli bir model seçin (ör. gpt-4o-mini, gemini-2.0-flash, claude-3-5-sonnet).`
      );
    }

    // Field scores'u OcrFieldScore şemasına çevir
    const fieldConf = (parsed.field_confidence as Record<string, number>) || {};
    const field_scores = {
      supplier_name: fieldConf.supplier_name ?? 0,
      supplier_tax_id: fieldConf.supplier_tax_id ?? 0,
      supplier_tax_office: fieldConf.supplier_tax_office ?? 0,
      supplier_address: fieldConf.supplier_address ?? 0,
      buyer_name: fieldConf.buyer_name ?? 0,
      buyer_tax_id: fieldConf.buyer_tax_id ?? 0,
      buyer_tax_office: fieldConf.buyer_tax_office ?? 0,
      buyer_address: fieldConf.buyer_address ?? 0,
      document_type: fieldConf.document_type ?? 0,
      document_number: fieldConf.document_number ?? 0,
      issue_date: fieldConf.issue_date ?? 0,
      issue_time: fieldConf.issue_time ?? 0,
      waybill_number: fieldConf.waybill_number ?? 0,
      subtotal_amount: fieldConf.subtotal_amount ?? 0,
      vat_amount: fieldConf.vat_amount ?? 0,
      vat_rate: fieldConf.vat_rate ?? 0,
      withholding_amount: fieldConf.withholding_amount ?? 0,
      total_amount: fieldConf.total_amount ?? 0,
      currency: fieldConf.currency ?? 100,
      payment_method: fieldConf.payment_method ?? 0,
      line_items: fieldConf.line_items ?? 0,
    };

    return {
      supplier_name: (parsed.supplier_name as string) ?? null,
      supplier_tax_id: (parsed.supplier_tax_id as string) ?? null,
      supplier_tax_office: (parsed.supplier_tax_office as string) ?? null,
      supplier_address: (parsed.supplier_address as string) ?? null,
      buyer_name: (parsed.buyer_name as string) ?? null,
      buyer_tax_id: (parsed.buyer_tax_id as string) ?? null,
      buyer_tax_office: (parsed.buyer_tax_office as string) ?? null,
      buyer_address: (parsed.buyer_address as string) ?? null,
      document_type: (parsed.document_type as string) ?? null,
      document_number: (parsed.document_number as string) ?? null,
      issue_date: (parsed.issue_date as string) ?? null,
      issue_time: (parsed.issue_time as string) ?? null,
      waybill_number: (parsed.waybill_number as string) ?? null,
      subtotal_amount: (parsed.subtotal_amount as number) ?? null,
      vat_amount: (parsed.vat_amount as number) ?? null,
      vat_rate: (parsed.vat_rate as number) ?? null,
      withholding_amount: (parsed.withholding_amount as number) ?? null,
      total_amount: (parsed.total_amount as number) ?? null,
      currency: (parsed.currency as string) || "TRY",
      payment_method: (parsed.payment_method as string) ?? null,
      line_items: (parsed.line_items as OcrLineItem[]) ?? null,
      raw_ocr_text: (parsed.raw_text as string) || "",
      confidence_score: Math.round(
        ((parsed.overall_confidence as number) ?? 0) as number
      ),
      field_scores,
    };
  }
}
