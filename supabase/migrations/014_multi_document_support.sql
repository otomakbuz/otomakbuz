-- ============================================================
-- 014: Tek dosyadan çoklu belge desteği
-- ============================================================
-- Aynı fotoğrafta birden fazla fiş/fatura olabilir (ör. masanın
-- üzerine dizilmiş 5 fiş tek kareye sığdırılmış). OCR bunları
-- ayrı ayrı çıkaracak ve her biri documents tablosuna kendi
-- sub_index'i ile insert edilecek.
--
-- sub_index = aynı file_hash içindeki belgenin 0-tabanlı sırası.
-- Eski tek-belgeli satırlar sub_index=0 olarak kalır (default).
-- ============================================================

alter table public.documents
  add column if not exists sub_index int not null default 0;

-- Eski dosya-hash unique index'ini (workspace_id, file_hash)
-- yenisi ile değiştir: (workspace_id, file_hash, sub_index)
drop index if exists public.uniq_documents_workspace_file_hash;

create unique index uniq_documents_workspace_file_hash
  on public.documents(workspace_id, file_hash, sub_index)
  where file_hash is not null;

comment on column public.documents.sub_index is
  '0-based order of this document within a multi-receipt upload. 0 for single-document files. Part of the file_hash unique constraint so the same photo can contain N receipts.';
