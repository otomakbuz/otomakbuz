/**
 * TCMB döviz kuru çekme.
 * XML API: https://www.tcmb.gov.tr/kurlar/today.xml
 */

interface ExchangeRate {
  code: string;
  name: string;
  buying: number;
  selling: number;
}

let cachedRates: { rates: ExchangeRate[]; fetchedAt: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 saat

export async function getTcmbRates(): Promise<ExchangeRate[]> {
  // Cache kontrolü
  if (cachedRates && Date.now() - cachedRates.fetchedAt < CACHE_TTL) {
    return cachedRates.rates;
  }

  try {
    const res = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`TCMB HTTP ${res.status}`);

    const xml = await res.text();
    const rates: ExchangeRate[] = [];

    // Basit XML parse — DOMParser server'da yok, regex ile
    const currencyRegex = /<Currency[^>]*CurrencyCode="([^"]+)"[^>]*>[\s\S]*?<Isim>([^<]+)<\/Isim>[\s\S]*?<ForexBuying>([^<]*)<\/ForexBuying>[\s\S]*?<ForexSelling>([^<]*)<\/ForexSelling>[\s\S]*?<\/Currency>/g;

    let match;
    while ((match = currencyRegex.exec(xml)) !== null) {
      const buying = parseFloat(match[3]);
      const selling = parseFloat(match[4]);
      if (buying > 0 && selling > 0) {
        rates.push({
          code: match[1],
          name: match[2],
          buying,
          selling,
        });
      }
    }

    cachedRates = { rates, fetchedAt: Date.now() };
    return rates;
  } catch (err) {
    // Cache varsa eski veriyi dön
    if (cachedRates) return cachedRates.rates;
    console.error("[TCMB] Kur çekme hatası:", err);
    return [];
  }
}

/** Tek bir döviz kurunun TL karşılığını al */
export async function getExchangeRate(currencyCode: string): Promise<{ buying: number; selling: number } | null> {
  const rates = await getTcmbRates();
  const rate = rates.find((r) => r.code === currencyCode);
  return rate ? { buying: rate.buying, selling: rate.selling } : null;
}

/** Döviz tutarını TL'ye çevir */
export async function convertToTry(amount: number, currencyCode: string): Promise<{ tryAmount: number; rate: number } | null> {
  if (currencyCode === "TRY") return { tryAmount: amount, rate: 1 };
  const rate = await getExchangeRate(currencyCode);
  if (!rate) return null;
  return { tryAmount: amount * rate.selling, rate: rate.selling };
}
