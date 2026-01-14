alter table workout_sets 
  add column if not exists photo_url text;

insert into storage.buckets (id, name, public)
values ('workout-photos', 'workout-photos', false)
on conflict (id) do nothing;

create policy "Users can view own photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'workout-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload own photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'workout-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'workout-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'workout-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
