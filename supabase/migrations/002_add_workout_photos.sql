-- ============================================
-- 迁移脚本 - 添加训练照片功能
-- 执行前请备份数据库
-- ============================================

-- 1. 扩展 workout_sets 表添加 photo_url 字段
alter table workout_sets 
  add column if not exists photo_url text;

-- 2. 创建 Storage bucket (需要在 Supabase Dashboard 执行或使用 storage API)
-- 注意: 这部分需要在 Supabase Dashboard > Storage 中手动创建
-- 或者使用以下 SQL (需要 service_role 权限):

-- insert into storage.buckets (id, name, public)
-- values ('workout-photos', 'workout-photos', false)
-- on conflict (id) do nothing;

-- 3. Storage RLS 策略 (需要在 Dashboard 中配置或使用 SQL)
-- 策略1: 用户只能上传到自己的文件夹
-- 策略2: 用户只能读取自己的文件
-- 策略3: 用户只能删除自己的文件

-- 文件路径格式: {user_id}/{date}/{filename}
-- 例如: 123e4567-e89b-12d3-a456-426614174000/2024-01-15/abc123.jpg

-- ============================================
-- 手动步骤 (在 Supabase Dashboard 中完成):
-- 
-- 1. 进入 Storage > Create new bucket
--    - Name: workout-photos
--    - Public: OFF (私有)
--
-- 2. 进入 Storage > workout-photos > Policies
--    添加以下策略:
--
--    SELECT (读取):
--    - Policy name: Users can view own photos
--    - Target roles: authenticated
--    - USING: (bucket_id = 'workout-photos' AND auth.uid()::text = (storage.foldername(name))[1])
--
--    INSERT (上传):
--    - Policy name: Users can upload own photos
--    - Target roles: authenticated
--    - WITH CHECK: (bucket_id = 'workout-photos' AND auth.uid()::text = (storage.foldername(name))[1])
--
--    DELETE (删除):
--    - Policy name: Users can delete own photos
--    - Target roles: authenticated
--    - USING: (bucket_id = 'workout-photos' AND auth.uid()::text = (storage.foldername(name))[1])
-- ============================================
