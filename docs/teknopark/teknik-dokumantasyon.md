# Otomakbuz — Teknik Dokümantasyon

**Proje:** Yapay Zeka Destekli Türkçe Mali Belge Tanıma ve Otomatik Muhasebeleştirme Sistemi
**Sürüm:** 1.0 | **Tarih:** Nisan 2026

---

## 1. Proje Özeti

Otomakbuz, küçük işletme ve girişimcilerin mali belgelerini (makbuz, fatura, fiş) fotoğraflayarak yapay zeka ile otomatik olarak tanıyan, muhasebeleştiren ve raporlayan bir bulut tabanlı SaaS platformudur.

**Temel AR-GE Bileşenleri:**
- Çoklu yapay zeka modeli ile Türkçe mali belge tanıma (OCR + NLU)
- Otomatik alan çıkarma ve güven skoru hesaplama
- Akıllı kategorizasyon ve muhasebe kaydı oluşturma
- Türkçe belge formatlarına özel doğrulama ve düzeltme kuralları

---

## 2. Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                    KULLANICI KATMANI                      │
│              Next.js 16 (App Router, React 19)           │
│           Tailwind CSS v4 + shadcn/ui + Recharts         │
├─────────────────────────────────────────────────────────┤
│                   UYGULAMA KATMANI                        │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Server   │  │   OCR    │  │ Muhasebe │  │ Raporlar│ │
│  │ Actions   │  │ Pipeline │  │  Motoru  │  │  Motoru │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │              │              │              │      │
├───────┴──────────────┴──────────────┴──────────────┴─────┤
│                     VERİ KATMANI                          │
│                                                           │
│  ┌─────────────┐  ┌──────────┐  ┌──────────────────────┐│
│  │  Supabase   │  │ Supabase │  │   Supabase Auth      ││
│  │  PostgreSQL │  │ Storage  │  │   (JWT + RLS)        ││
│  │  + RLS      │  │ (Private)│  │                      ││
│  └─────────────┘  └──────────┘  └──────────────────────┘│
├─────────────────────────────────────────────────────────┤
│                   AI SERVİS KATMANI                       │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ OpenAI   │  │OpenRouter│  │ Anthropic│  │ Google  │ │
│  │ GPT-4o   │  │ Gemini   │  │ Claude   │  │ Gemini  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│            ▲ FallbackOcrAdapter (Otomatik Yedekleme) ▲   │
└─────────────────────────────────────────────────────────┘
```

---

## 3. AI / OCR Pipeline (AR-GE Çekirdeği)

### 3.1 Çoklu Model Fallback Mimarisi

Sistem tek bir AI modeline bağımlı değildir. **FallbackOcrAdapter** tasarım kalıbı ile:

1. Kullanıcının seçtiği birincil model (ör: GPT-4o) denenir
2. Rate limit (429) veya sunucu hatası (5xx) alınırsa otomatik olarak sıradaki modele geçilir
3. Fallback havuzu: Gemini 2.0 Flash → Gemini 2.5 Flash → Qwen 2.5 VL 72B → Llama 4 Scout

**Bu yaklaşımın avantajları:**
- %99.9+ uptime — tek model çökse bile servis devam eder
- Maliyet optimizasyonu — ucuz modeller önce denenir
- Model karşılaştırma verisi toplanır

### 3.2 Alan Çıkarma ve Güven Skorlama

Her belge için 21 ayrı alan çıkarılır ve her alana 0-100 arası güven skoru atanır:

| Alan Grubu | Alanlar |
|---|---|
| **Düzenleyen** | Firma adı, VKN/TCKN, vergi dairesi, adres |
| **Alıcı** | Ad/unvan, VKN/TCKN, vergi dairesi, adres |
| **Belge Meta** | Belge no, tarih, saat, irsaliye no, belge türü |
| **Tutarlar** | Ara toplam, KDV tutarı, KDV oranı, stopaj, genel toplam |
| **Diğer** | Para birimi, ödeme yöntemi, kalemler |

**Güven skoru hesaplama:** AI modelinin her alan için döndürdüğü olasılık değeri normalize edilerek 0-100 skalasına dönüştürülür. %85 üzeri "Yüksek Güven", %60-84 "Orta", %30-59 "Düşük", %30 altı "Okunamadı" olarak sınıflandırılır.

### 3.3 Türkçe Belge Tanıma Özelleştirmeleri

Genel OCR modellerinin Türkçe mali belgelerdeki başarısını artırmak için özel kurallar geliştirilmiştir:

- **VKN/TCKN Doğrulama:** 10 haneli VKN ve 11 haneli TCKN için Türk algoritmasına uygun kontrol digit hesaplama
- **KDV Oranı Normalizasyonu:** Eski oranları (%18, %8) güncel Türk vergi mevzuatına göre düzeltme (%20, %10)
- **Belge Türü Tespiti:** OCR metninde Türkçe anahtar kelimeler aranarak belge türü otomatik sınıflandırma (e-fatura, fiş, serbest meslek makbuzu, gider pusulası)
- **Çoklu Belge Çıkarma:** Tek fotoğrafta birden fazla fiş/fatura varsa her biri ayrı belge olarak işlenir
- **Duplikasyon Kontrolü:** SHA-256 dosya hash'i + içerik tuple eşleştirmesi ile mükerrer kayıt engelleme

### 3.4 Otomatik Muhasebeleştirme

Belge doğrulandığında (verify) otomatik olarak:

1. **Kategori Tahmini:** Aynı tedarikçinin önceki belgelerinin kategorisine bakılarak otomatik kategori atanır
2. **Cari Eşleştirme:** Firma adı ile mevcut cari hesaplar eşleştirilir
3. **Yevmiye Kaydı:** Çift taraflı muhasebe kaydı oluşturulur (VUK uyumlu hesap planı)
4. **Cari Hareket:** Tedarikçi/müşteri bazlı borç-alacak kaydı oluşturulur

---

## 4. Teknoloji Stack'i

| Katman | Teknoloji | Seçim Gerekçesi |
|---|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript 5 | SSR + App Router ile performans, type safety |
| **UI** | Tailwind CSS v4, shadcn/ui | Hızlı geliştirme, tutarlı tasarım sistemi |
| **Veritabanı** | Supabase (PostgreSQL) | Yönetilen DB, gerçek zamanlı, RLS ile güvenlik |
| **Kimlik Doğrulama** | Supabase Auth | JWT tabanlı, cookie yönetimi, oturum yenileme |
| **Depolama** | Supabase Storage | Özel bucket, imzalı URL'ler, 1 yıl expiry |
| **AI/OCR** | OpenAI, OpenRouter, Anthropic, Google | BYOK modeli, çoklu sağlayıcı, fallback zinciri |
| **Grafikler** | Recharts | React uyumlu, SVG tabanlı finansal grafikler |
| **3D** | React Three Fiber (Three.js) | Landing page hero sahnesi |
| **PDF** | jsPDF | Fatura PDF oluşturma |
| **Excel** | ExcelJS | XLSX dışa/içe aktarma |
| **E-Fatura** | Özel UBL-TR oluşturucu | Türk e-fatura XML standardı |
| **E-Defter** | Özel XBRL GL oluşturucu | Türk e-defter XML standardı |
| **Döviz** | TCMB XML API | Günlük döviz kuru (1 saat cache) |

---

## 5. Veri Güvenliği ve Çok Kiracılı İzolasyon

### 5.1 Row Level Security (RLS)

Tüm veritabanı tabloları PostgreSQL RLS politikalarıyla korunur. Her politika `workspace_id = get_user_workspace_id()` koşulunu kullanır. Bu SECURITY DEFINER fonksiyon, her satır için alt sorgu yerine tek bir fonksiyon çağrısı yapar — hem güvenlik hem performans sağlar.

### 5.2 Veri İzolasyonu

- Her kullanıcı bir workspace'e aittir
- Workspace üyeleri roller ile yönetilir (owner, editor, viewer)
- Belgeler, cariler, hesaplar, faturalar — tümü workspace_id ile izole edilir
- Bir workspace'in verileri başka bir workspace'ten asla görülemez

### 5.3 Dosya Güvenliği

- Supabase Storage bucket'ları private olarak yapılandırılmıştır
- Dosya erişimi sunucu tarafında oluşturulan imzalı URL'ler ile sağlanır
- Dosya hash'leri (SHA-256) ile bütünlük kontrolü yapılır

### 5.4 API Anahtarı Yönetimi

- BYOK (Bring Your Own Key) modeli — API anahtarları workspace düzeyinde saklanır
- Anahtarlar veritabanında tutulur, client'a asla gönderilmez
- Her OCR isteği sunucu tarafında yapılır

---

## 6. Veritabanı Şeması (Özet)

**19 migration** ile evrimleşen şema, temel tablolar:

| Tablo | Açıklama | Satır Tahmini |
|---|---|---|
| workspaces | Çok kiracılı kök tablo | 1 / işletme |
| documents | OCR ile taranan belgeler | ~100-500 / ay |
| contacts | Tedarikçi ve müşteriler | ~50-200 |
| categories | Özel gelir-gider kategorileri | ~10-30 |
| accounts | Hesap planı (VUK uyumlu) | ~200+ |
| journal_entries + lines | Yevmiye kayıtları | ~100-500 / ay |
| ledger_entries | Cari borç-alacak hareketleri | ~100-500 / ay |
| reminders | Hatırlatıcılar ve tekrarlayan görevler | ~10-50 |
| bank_accounts + transactions | Banka hesapları ve mutabakat | ~50-500 / ay |
| products + stock_movements | Stok yönetimi | ~20-200 |

---

## 7. Performans Metrikleri

| Metrik | Değer |
|---|---|
| Ortalama OCR işlem süresi | 3-8 saniye / belge |
| Desteklenen dosya formatları | JPEG, PNG, WEBP, HEIC, PDF |
| Maksimum dosya boyutu | 10 MB |
| Eşzamanlı kullanıcı desteği | Sınırsız (Supabase ölçeklenebilir) |
| Sayfa yüklenme süresi | <1 saniye (Turbopack + SSR) |
| API yanıt süresi | <200ms (RPC + cache) |

---

## 8. Yol Haritası

| Dönem | Hedef |
|---|---|
| **Q2 2026** | MVP tamamlama, teknopark başvurusu, ilk 50 kullanıcı |
| **Q3 2026** | GİB e-fatura entegrasyonu, mobil PWA, muhasebeci portalı |
| **Q4 2026** | Açık beta, 500+ kullanıcı, ücretli plan lansmanı |
| **Q1 2027** | Muhasebeci marketplace, banka API entegrasyonları |
