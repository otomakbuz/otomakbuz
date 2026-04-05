-- ============================================================
-- 013: Belge tekilleştirme (deduplication)
-- ============================================================
-- İki katmanlı dedup:
--   1. file_hash  — dosyanın SHA-256'sı (aynı dosya = aynı hash)
--   2. (supplier_tax_id, document_number, issue_date) tuple'ı
--      aynı belgenin farklı fotoğrafı/taraması için içerik bazlı
--
-- Her iki kontrol de workspace scope'unda (farklı workspace'ler
-- aynı belgeyi paylaşabilir — kanuni zorunluluk yok).
-- ============================================================

alter table public.documents
  add column if not exists file_hash text;

create index if not exists idx_documents_file_hash
  on public.documents(workspace_id, file_hash)
  where file_hash is not null;

-- Katman 1: dosya ikizi engelleme
create unique index if not exists uniq_documents_workspace_file_hash
  on public.documents(workspace_id, file_hash)
  where file_hash is not null;

-- Katman 2: içerik ikizi engelleme
-- Üç alan birden dolu olan belgeler için unique; nullable alanlar
-- partial index ile kontrol edilir (ör. e-arşiv fatura)
create unique index if not exists uniq_documents_content_tuple
  on public.documents(workspace_id, supplier_tax_id, document_number, issue_date)
  where supplier_tax_id is not null
    and document_number is not null
    and issue_date is not null;

comment on column public.documents.file_hash is
  'SHA-256 hash of the original uploaded file (hex). Used to detect exact-duplicate uploads.';
