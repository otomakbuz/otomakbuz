/**
 * Türk Tek Düzen Hesap Planı (TDMS) — temel hesaplar.
 * Kaynak: VUK Muhasebe Sistemi Uygulama Genel Tebliği
 */
export interface DefaultAccount {
  code: string;
  name: string;
  account_type: "asset" | "liability" | "equity" | "expense" | "income";
  parent_code: string | null;
}

export const DEFAULT_CHART_OF_ACCOUNTS: DefaultAccount[] = [
  // 1 - DÖNEN VARLIKLAR
  { code: "100", name: "Kasa", account_type: "asset", parent_code: null },
  { code: "101", name: "Alınan Çekler", account_type: "asset", parent_code: null },
  { code: "102", name: "Bankalar", account_type: "asset", parent_code: null },
  { code: "108", name: "Diğer Hazır Değerler", account_type: "asset", parent_code: null },
  { code: "120", name: "Alıcılar", account_type: "asset", parent_code: null },
  { code: "121", name: "Alacak Senetleri", account_type: "asset", parent_code: null },
  { code: "126", name: "Verilen Depozito ve Teminatlar", account_type: "asset", parent_code: null },
  { code: "150", name: "İlk Madde ve Malzeme", account_type: "asset", parent_code: null },
  { code: "152", name: "Mamuller", account_type: "asset", parent_code: null },
  { code: "153", name: "Ticari Mallar", account_type: "asset", parent_code: null },
  { code: "157", name: "Diğer Stoklar", account_type: "asset", parent_code: null },
  { code: "180", name: "Gelecek Aylara Ait Giderler", account_type: "asset", parent_code: null },
  { code: "190", name: "Devreden KDV", account_type: "asset", parent_code: null },
  { code: "191", name: "İndirilecek KDV", account_type: "asset", parent_code: null },

  // 2 - DURAN VARLIKLAR
  { code: "250", name: "Arazi ve Arsalar", account_type: "asset", parent_code: null },
  { code: "252", name: "Binalar", account_type: "asset", parent_code: null },
  { code: "253", name: "Tesis, Makine ve Cihazlar", account_type: "asset", parent_code: null },
  { code: "254", name: "Taşıtlar", account_type: "asset", parent_code: null },
  { code: "255", name: "Demirbaşlar", account_type: "asset", parent_code: null },
  { code: "257", name: "Birikmiş Amortismanlar (-)", account_type: "asset", parent_code: null },
  { code: "260", name: "Haklar", account_type: "asset", parent_code: null },
  { code: "264", name: "Özel Maliyetler", account_type: "asset", parent_code: null },
  { code: "268", name: "Birikmiş Amortismanlar (-)", account_type: "asset", parent_code: null },

  // 3 - KISA VADELİ YABANCI KAYNAKLAR
  { code: "300", name: "Banka Kredileri", account_type: "liability", parent_code: null },
  { code: "320", name: "Satıcılar", account_type: "liability", parent_code: null },
  { code: "321", name: "Borç Senetleri", account_type: "liability", parent_code: null },
  { code: "326", name: "Alınan Depozito ve Teminatlar", account_type: "liability", parent_code: null },
  { code: "335", name: "Personele Borçlar", account_type: "liability", parent_code: null },
  { code: "336", name: "Diğer Çeşitli Borçlar", account_type: "liability", parent_code: null },
  { code: "340", name: "Alınan Sipariş Avansları", account_type: "liability", parent_code: null },
  { code: "360", name: "Ödenecek Vergi ve Fonlar", account_type: "liability", parent_code: null },
  { code: "361", name: "Ödenecek Sosyal Güvenlik Kesintileri", account_type: "liability", parent_code: null },
  { code: "380", name: "Gelecek Aylara Ait Gelirler", account_type: "liability", parent_code: null },
  { code: "391", name: "Hesaplanan KDV", account_type: "liability", parent_code: null },

  // 4 - UZUN VADELİ YABANCI KAYNAKLAR
  { code: "400", name: "Banka Kredileri", account_type: "liability", parent_code: null },
  { code: "420", name: "Satıcılar", account_type: "liability", parent_code: null },

  // 5 - ÖZKAYNAKLAR
  { code: "500", name: "Sermaye", account_type: "equity", parent_code: null },
  { code: "520", name: "Sermaye Yedekleri", account_type: "equity", parent_code: null },
  { code: "540", name: "Yasal Yedekler", account_type: "equity", parent_code: null },
  { code: "570", name: "Geçmiş Yıllar Kârları", account_type: "equity", parent_code: null },
  { code: "580", name: "Geçmiş Yıllar Zararları (-)", account_type: "equity", parent_code: null },
  { code: "590", name: "Dönem Net Kârı", account_type: "equity", parent_code: null },
  { code: "591", name: "Dönem Net Zararı (-)", account_type: "equity", parent_code: null },

  // 6 - GELİR TABLOSU HESAPLARI
  { code: "600", name: "Yurt İçi Satışlar", account_type: "income", parent_code: null },
  { code: "601", name: "Yurt Dışı Satışlar", account_type: "income", parent_code: null },
  { code: "602", name: "Diğer Gelirler", account_type: "income", parent_code: null },
  { code: "610", name: "Satıştan İadeler (-)", account_type: "income", parent_code: null },
  { code: "611", name: "Satış İskontoları (-)", account_type: "income", parent_code: null },
  { code: "620", name: "Satılan Mamuller Maliyeti (-)", account_type: "expense", parent_code: null },
  { code: "621", name: "Satılan Ticari Mallar Maliyeti (-)", account_type: "expense", parent_code: null },
  { code: "622", name: "Satılan Hizmet Maliyeti (-)", account_type: "expense", parent_code: null },
  { code: "630", name: "Araştırma ve Geliştirme Giderleri (-)", account_type: "expense", parent_code: null },
  { code: "631", name: "Pazarlama Satış Dağıtım Giderleri (-)", account_type: "expense", parent_code: null },
  { code: "632", name: "Genel Yönetim Giderleri (-)", account_type: "expense", parent_code: null },
  { code: "640", name: "İştiraklerden Temettü Gelirleri", account_type: "income", parent_code: null },
  { code: "642", name: "Faiz Gelirleri", account_type: "income", parent_code: null },
  { code: "644", name: "Konusu Kalmayan Karşılıklar", account_type: "income", parent_code: null },
  { code: "646", name: "Kambiyo Kârları", account_type: "income", parent_code: null },
  { code: "649", name: "Diğer Olağan Gelir ve Kârlar", account_type: "income", parent_code: null },
  { code: "653", name: "Komisyon Giderleri (-)", account_type: "expense", parent_code: null },
  { code: "654", name: "Karşılık Giderleri (-)", account_type: "expense", parent_code: null },
  { code: "656", name: "Kambiyo Zararları (-)", account_type: "expense", parent_code: null },
  { code: "659", name: "Diğer Olağan Gider ve Zararlar (-)", account_type: "expense", parent_code: null },
  { code: "660", name: "Kısa Vadeli Borçlanma Giderleri (-)", account_type: "expense", parent_code: null },
  { code: "689", name: "Diğer Olağandışı Gider ve Zararlar (-)", account_type: "expense", parent_code: null },
  { code: "691", name: "Dönem Kârı Vergi ve Diğer Yükümlülükler (-)", account_type: "expense", parent_code: null },

  // 7 - MALİYET HESAPLARI
  { code: "710", name: "Direkt İlk Madde ve Malzeme Giderleri", account_type: "expense", parent_code: null },
  { code: "720", name: "Direkt İşçilik Giderleri", account_type: "expense", parent_code: null },
  { code: "730", name: "Genel Üretim Giderleri", account_type: "expense", parent_code: null },
  { code: "740", name: "Hizmet Üretim Maliyeti", account_type: "expense", parent_code: null },
  { code: "750", name: "Araştırma ve Geliştirme Giderleri", account_type: "expense", parent_code: null },
  { code: "760", name: "Pazarlama Satış ve Dağıtım Giderleri", account_type: "expense", parent_code: null },
  { code: "770", name: "Genel Yönetim Giderleri", account_type: "expense", parent_code: null },
  { code: "780", name: "Finansman Giderleri", account_type: "expense", parent_code: null },
];
