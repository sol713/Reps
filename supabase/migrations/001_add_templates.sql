-- ============================================
-- 迁移脚本 - 从旧版本升级
-- 执行前请备份数据库
-- ============================================

-- 1. 新增 workout_templates 表
create table if not exists workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  description text,
  color text default '#0A84FF',
  is_archived boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. 新增 template_exercises 表
create table if not exists template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references workout_templates(id) on delete cascade not null,
  exercise_id uuid references exercises(id) not null,
  order_index integer not null default 0,
  target_sets integer default 3,
  target_reps_min integer default 8,
  target_reps_max integer default 12,
  target_weight numeric,
  rest_seconds integer default 90,
  notes text,
  created_at timestamp with time zone default now()
);

-- 3. 扩展 workout_logs 表
alter table workout_logs 
  add column if not exists template_id uuid references workout_templates(id) on delete set null,
  add column if not exists started_at timestamp with time zone,
  add column if not exists ended_at timestamp with time zone,
  add column if not exists notes text;

-- 4. 扩展 workout_sets 表
alter table workout_sets 
  add column if not exists rest_seconds integer,
  add column if not exists rpe numeric,
  add column if not exists notes text;

-- 5. 扩展 pr_records 表
alter table pr_records 
  add column if not exists reps integer default 1,
  add column if not exists estimated_1rm numeric;

-- 6. 新增索引
create index if not exists idx_workout_logs_user_date on workout_logs(user_id, date desc);
create index if not exists idx_workout_sets_log_id on workout_sets(workout_log_id);
create index if not exists idx_workout_sets_exercise_id on workout_sets(exercise_id);
create index if not exists idx_template_exercises_template_id on template_exercises(template_id);
create index if not exists idx_pr_records_user_exercise on pr_records(user_id, exercise_id);

-- 7. RLS 策略
alter table workout_templates enable row level security;
alter table template_exercises enable row level security;

drop policy if exists "Users can view own templates" on workout_templates;
drop policy if exists "Users can manage own templates" on workout_templates;

create policy "Users can view own templates"
  on workout_templates for select
  using (user_id = auth.uid());

create policy "Users can manage own templates"
  on workout_templates for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can manage own template_exercises" on template_exercises;

create policy "Users can manage own template_exercises"
  on template_exercises for all
  using (
    template_id in (
      select id from workout_templates where user_id = auth.uid()
    )
  )
  with check (
    template_id in (
      select id from workout_templates where user_id = auth.uid()
    )
  );

-- 8. 自动更新 updated_at 触发器
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_workout_templates_updated_at on workout_templates;
create trigger update_workout_templates_updated_at
  before update on workout_templates
  for each row execute function update_updated_at_column();
