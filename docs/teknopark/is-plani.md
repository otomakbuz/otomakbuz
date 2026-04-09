# Otomakbuz — İş Planı ve Pitch Deck İçeriği

**Marmara Üniversitesi Teknoloji Geliştirme Bölgesi Başvurusu**
**Nisan 2026**

---

## Slide 1: Kapak

**Otomakbuz**
Yapay Zeka Destekli Mali Belge Tanıma ve Otomatik Muhasebeleştirme Sistemi

*Makbuzunu çek, muhasebeniz hazır.*

---

## Slide 2: Problem

**Türkiye'de 4.2 milyon KOBİ var. Çoğunun muhasebesi kaos.**

- Makbuzlar çekmecede birikiyor, vergi zamanı panik
- Profesyonel muhasebe yazılımları karmaşık ve pahalı (Logo, Parasüt)
- Girişimciler muhasebe bilmiyor ama yasal olarak tutmak zorunda
- Manuel veri girişi hata oranı yüksek, zaman kaybı büyük

**Rakamlarla:**
- Ortalama KOBİ ayda 50-200 makbuz/fatura işliyor
- Manuel giriş: belge başı ~3 dakika = ayda 2.5-10 saat
- Hatalı giriş oranı: ~%15-20 (KDV yanlışlıkları, tutar hataları)

---

## Slide 3: Çözüm

**Fotoğrafla, biz halledelim.**

1. **Çek** → Makbuzu/faturayı telefonla fotoğrafla
2. **AI Tarasın** → Yapay zeka 21 alanı otomatik tanısın (%85+ doğruluk)
3. **Doğrula** → Bir tıkla onayla, muhasebe kaydı otomatik oluşsun
4. **Raporla** → Gelir-gider, KDV, bilanço raporları hazır

**Fark:** Muhasebe bilmene gerek yok. AI senin yerine yapıyor.

---

## Slide 4: Demo Akışı

```
Makbuz Fotoğrafı
      ↓
  AI OCR Tarama (3-8 sn)
  ├── Firma adı: Migros A.Ş.     (%96 güven)
  ├── VKN: 8590377552             (%94 güven)  ✓ Geçerli VKN
  ├── Tarih: 03.04.2026           (%98 güven)
  ├── KDV: ₺53,00 (%20)          (%92 güven)
  └── Toplam: ₺318,00            (%97 güven)
      ↓
  Otomatik Kategori: Market       (önceki veriden)
  Otomatik Cari: Migros A.Ş.     (rehberden eşleşme)
      ↓
  [Doğrula] butonu → Tek tık
      ↓
  ✓ Yevmiye kaydı oluşturuldu
  ✓ Cari hareket kaydedildi
  ✓ KDV raporuna yansıdı
```

---

## Slide 5: Teknolojik Yenilik (AR-GE)

### 1. Çoklu AI Model Fallback
- Tek modele bağımlılık yok — 4+ model arasında otomatik geçiş
- Rate limit veya hata durumunda kesintisiz servis

### 2. Türkçe Mali Belge Tanıma
- VKN/TCKN otomatik doğrulama (Türk algoritması)
- KDV oranı normalizasyonu (eski→yeni mevzuat)
- Belge türü tespiti (e-fatura, fiş, SMM, gider pusulası)

### 3. Öğrenen Sistem
- Her belge AI doğruluk verisini zenginleştirir
- Tedarikçi bazlı kategori tahmini (önceki verilerden)
- Alan bazlı accuracy tracking ve trend analizi

### 4. Uçtan Uca Otomasyon
- Fotoğraf → OCR → Kategori → Muhasebe kaydı: tam otomatik
- VUK uyumlu hesap planı, e-fatura (UBL-TR), e-defter (XBRL GL)

---

## Slide 6: Pazar Büyüklüğü

| Segment | Boyut | Hedef |
|---|---|---|
| Türkiye KOBİ | 4.2 milyon | Adreslenebilir pazar |
| Mikro işletme (<10 çalışan) | 3.8 milyon | Birincil hedef |
| Serbest meslek / Freelancer | ~2 milyon | İkincil hedef |
| Muhasebeci / Mali müşavir | ~115.000 | Dağıtım ortağı |

**TAM (Toplam Adreslenebilir Pazar):** ~6 milyon potansiyel kullanıcı
**SAM (Erişilebilir Pazar):** ~500.000 (dijital araç kullanan mikro işletmeler)
**SOM (Elde Edilebilir Pazar):** ~10.000 (ilk 2 yıl hedefi)

**Pazar trendi:**
- E-fatura zorunluluğu her yıl genişliyor (2026: brüt 2M TL üzeri)
- Dijital muhasebe araçları yıllık ~%25 büyüyor
- Türkiye fintech yatırımları 2025'te $250M+

---

## Slide 7: Rekabet Avantajı

| Özellik | Otomakbuz | Parasüt | Logo | Kolaybi |
|---|---|---|---|---|
| AI ile otomatik tanıma | ✓ (çoklu model) | Basit OCR | Yok | Yok |
| Güven skoru | ✓ (alan bazlı) | Yok | Yok | Yok |
| Muhasebe bilgisi gerektirmez | ✓ | Kısmen | Hayır | Hayır |
| Ücretsiz plan | ✓ | Yok | Yok | Yok |
| Tek tıkla muhasebe kaydı | ✓ | Manuel | Manuel | N/A |
| Türkçe VKN/KDV doğrulama | ✓ | Kısmen | ✓ | ✓ |
| Fiyat (aylık) | 0-199₺ | 499₺+ | 1000₺+ | 200₺+ |

**Konumlandırma:** "Muhasebe bilmeyen girişimcinin muhasebe asistanı"
Rakipler muhasebecilere satıyor. Biz girişimciye satıyoruz.

---

## Slide 8: İş Modeli

### Gelir Modeli: Freemium SaaS

| Plan | Fiyat | İçerik |
|---|---|---|
| **Ücretsiz** | 0₺ | 30 belge/ay, temel raporlar |
| **Starter** | 79₺/ay | 200 belge/ay, e-fatura, tüm raporlar |
| **Pro** | 199₺/ay | Sınırsız belge, çoklu kullanıcı, API |
| **Muhasebeci** | 499₺/ay | 10 müşteriye kadar, portal erişimi |

### Birim Ekonomisi

| Metrik | Değer |
|---|---|
| AI maliyeti / belge | ~₺0.50 |
| Altyapı maliyeti / kullanıcı / ay | ~₺15 |
| Ortalama gelir / ödeme yapan kullanıcı | ~₺120/ay |
| Brüt marj | ~%85 |
| Break-even | 22 ödeme yapan müşteri |
| Hedef CAC | <₺150 (organik ağırlıklı) |
| Hedef LTV | >₺1.500 (12+ ay tutma) |

---

## Slide 9: Büyüme Stratejisi

### Faz 1: Çekirdek (0-6 ay)
- Teknopark + üniversite girişimcilik kulüpleri → ilk 200 kullanıcı
- Ücretsiz plan ile kullanıcı tabanı ve AI veri havuzu oluştur
- Community building: CEO buluşturmaları, startup etkinlikleri

### Faz 2: Büyüme (6-12 ay)
- Freemium → ücretli plan dönüşümü başlat
- Muhasebeci portal → B2B2C kanalı aç
- Google Ads + SEO ("online muhasebe programı")
- Hedef: 1.000 kullanıcı, 100 ödeme yapan

### Faz 3: Ölçekleme (12-24 ay)
- GİB e-fatura direkt entegrasyonu
- Banka API entegrasyonları (otomatik mutabakat)
- Muhasebeci marketplace
- Hedef: 5.000 kullanıcı, 500 ödeme yapan, aylık ₺50.000+ gelir

---

## Slide 10: Ekip ve Yetkinlik

**[Adınız]** — Kurucu & Geliştirici
- Full-stack geliştirme (TypeScript, React, Next.js, Supabase)
- AI/ML entegrasyon deneyimi
- Türk vergi mevzuatı bilgisi
- [Ek bilgileriniz]

**Ürün kendisi ekip yetkinliğinin kanıtıdır:**
- 19 veritabanı migration'ı
- 105+ React bileşeni
- 20 server action dosyası
- Çoklu AI provider entegrasyonu
- E-fatura (UBL-TR) ve e-defter (XBRL GL) oluşturucuları

---

## Slide 11: Yol Haritası

```
Q2 2026  ─── MVP Tamamlama + Teknopark Girişi
              ├── AI OCR pipeline ✓
              ├── Otomatik muhasebeleştirme ✓
              ├── E-fatura / E-defter ✓
              └── İlk 50 kullanıcı

Q3 2026  ─── Beta Lansmanı
              ├── GİB e-fatura entegrasyonu
              ├── Mobil PWA
              ├── Muhasebeci portalı
              └── 200 kullanıcı

Q4 2026  ─── Ücretli Plan Lansmanı
              ├── Freemium → Paid dönüşüm
              ├── Banka API entegrasyonları
              ├── WhatsApp fatura gönderimi
              └── 500 kullanıcı, 50 ödeme yapan

Q1 2027  ─── Ölçekleme
              ├── Muhasebeci marketplace
              ├── Gelişmiş AI (fine-tuned model)
              ├── Sektörel raporlama
              └── 1.000+ kullanıcı
```

---

## Slide 12: Talep

**Marmara TGB'den beklentimiz:**

1. **Fiziksel alan** — Ofis/çalışma alanı
2. **AR-GE desteği** — TÜBİTAK 1512/1507 başvuru mentorluğu
3. **Network** — Yatırımcı ve mentor erişimi
4. **Vergi avantajı** — Teknoloji geliştirme bölgesi gelir vergisi muafiyeti

**Karşılığında:**

- Aktif olarak geliştirilen, çalışan bir ürün (demo hazır)
- Net AR-GE bileşeni (AI belge tanıma + Türkçe NLU)
- Ölçeklenebilir iş modeli
- Türkiye pazarına özel çözüm

---

## Ek: Finansal Projeksiyonlar (24 Ay)

| Ay | Kullanıcı | Ödeme Yapan | MRR (₺) | Aylık Maliyet (₺) | Net (₺) |
|---|---|---|---|---|---|
| 1-3 | 50 | 0 | 0 | 2.000 | -2.000 |
| 4-6 | 200 | 10 | 1.000 | 3.000 | -2.000 |
| 7-9 | 500 | 40 | 4.000 | 5.000 | -1.000 |
| 10-12 | 1.000 | 80 | 8.000 | 7.000 | +1.000 |
| 13-18 | 2.500 | 200 | 22.000 | 12.000 | +10.000 |
| 19-24 | 5.000 | 500 | 55.000 | 20.000 | +35.000 |

**Break-even:** ~10. ay
**24. ay kümülatif gelir:** ~₺350.000
**24. ay MRR:** ₺55.000 (~$1.400/ay)
