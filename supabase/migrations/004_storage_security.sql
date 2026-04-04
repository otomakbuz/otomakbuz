-- ============================================================
-- Migration 004: Storage Security Fix
-- Sorun: Mevcut policy tüm authenticated kullanıcılara tüm dosyaları açıyor
-- Çözüm: Dosya yolunu workspace_id ile scope'la
-- Dosya path formatı: {workspace_id}/{filename}
-- ============================================================

-- Eski policy'leri kaldır
drop policy if exists "Users can upload document files" on storage.objects;
drop policy if exists "Users can view own document files" on storage.objects;
drop policy if exists "Users can delete own document files" on storage.objects;

-- Yeni workspace-scoped policy'ler
-- Dosya yolu: documents/{workspace_id}/dosya.jpg
create policy "Upload files to own workspace folder"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = (public.get_user_workspace_id())::text
  );

create policy "View files in own workspace folder"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = (public.get_user_workspace_id())::text
  );

create policy "Delete files in own workspace folder"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = (public.get_user_workspace_id())::text
  );
