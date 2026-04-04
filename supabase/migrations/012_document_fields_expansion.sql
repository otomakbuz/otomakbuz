-- Migration: Expand document schema to cover Turkish legal document types
-- Adds: buyer fields, supplier_address, tax office, stopaj, waybill, line items
-- Migrates: legacy document_type values to new legal taxonomy

-- 1) Add new columns to documents table
alter table public.documents
  add column if not exists supplier_address text,
  add column if not exists supplier_tax_office text,
  add column if not exists buyer_name text,
  add column if not exists buyer_tax_id text,
  add column if not exists buyer_tax_office text,
  add column if not exists buyer_address text,
  add column if not exists withholding_amount numeric(12,2),
  add column if not exists waybill_number text,
  add column if not exists line_items jsonb;

-- 2) Migrate legacy document_type values to the new legal taxonomy
--    fatura        -> fatura        (no change)
--    fis           -> perakende_fis
--    pos_slip      -> perakende_fis (merged — POS fişi de perakende/ÖKC fişidir)
--    gider_fisi    -> gider_pusulasi
--    makbuz        -> serbest_meslek_makbuzu (generic makbuz en yakın olduğu için)
update public.documents set document_type = 'perakende_fis' where document_type in ('fis', 'pos_slip');
update public.documents set document_type = 'gider_pusulasi' where document_type = 'gider_fisi';
update public.documents set document_type = 'serbest_meslek_makbuzu' where document_type = 'makbuz';

-- 3) Add check constraint for the new taxonomy (soft — allow null)
alter table public.documents
  drop constraint if exists documents_document_type_check;

alter table public.documents
  add constraint documents_document_type_check
  check (
    document_type is null or document_type in (
      'fatura',
      'perakende_fis',
      'serbest_meslek_makbuzu',
      'gider_pusulasi',
      'mustahsil_makbuzu',
      'irsaliye'
    )
  );

-- 4) Indexes for new searchable fields
create index if not exists idx_documents_buyer_name on public.documents(buyer_name);
create index if not exists idx_documents_buyer_tax_id on public.documents(buyer_tax_id);

-- 5) Comment documentation
comment on column public.documents.supplier_address is 'Belgeyi düzenleyenin (satıcı) adresi';
comment on column public.documents.supplier_tax_office is 'Düzenleyenin bağlı olduğu vergi dairesi';
comment on column public.documents.buyer_name is 'Alıcının (müşterinin) adı veya unvanı';
comment on column public.documents.buyer_tax_id is 'Alıcının VKN veya TCKN''si';
comment on column public.documents.buyer_tax_office is 'Alıcının vergi dairesi';
comment on column public.documents.buyer_address is 'Alıcının adresi';
comment on column public.documents.withholding_amount is 'Stopaj (gelir/kurumlar vergisi tevkifatı) tutarı';
comment on column public.documents.waybill_number is 'Bağlı sevk irsaliyesi numarası (fatura için)';
comment on column public.documents.line_items is 'Belge kalemleri: [{name, quantity, unit_price, vat_rate, total}]';
