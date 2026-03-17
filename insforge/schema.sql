-- ============================================
-- Reps - InsForge Database Schema
-- ============================================

create extension if not exists "pgcrypto";

-- ============================================
-- 动作库
-- ============================================
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  body_part text not null,
  is_preset boolean default false,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- ============================================
-- 训练模板
-- ============================================
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

-- ============================================
-- 训练日志
-- ============================================
create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  date date not null default current_date,
  template_id uuid references workout_templates(id) on delete set null,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now()
);

-- ============================================
-- 训练组
-- ============================================
create table if not exists workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid references workout_logs(id) on delete cascade,
  exercise_id uuid references exercises(id),
  set_number integer not null,
  set_type text default 'normal',
  weight numeric,
  reps integer,
  segments jsonb,
  rest_seconds integer,
  rpe numeric,
  notes text,
  photo_url text,
  created_at timestamp with time zone default now()
);

-- ============================================
-- 个人记录
-- ============================================
create table if not exists pr_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  exercise_id uuid references exercises(id),
  weight numeric not null,
  reps integer default 1,
  estimated_1rm numeric,
  achieved_at timestamp with time zone default now()
);

-- ============================================
-- 训练计划
-- ============================================
create table if not exists workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  template_id uuid references workout_templates(id) on delete cascade not null,
  planned_date date not null,
  completed boolean default false,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- 索引优化
-- ============================================
create index if not exists idx_workout_logs_user_date on workout_logs(user_id, date desc);
create index if not exists idx_workout_sets_log_id on workout_sets(workout_log_id);
create index if not exists idx_workout_sets_exercise_id on workout_sets(exercise_id);
create index if not exists idx_template_exercises_template_id on template_exercises(template_id);
create index if not exists idx_pr_records_user_exercise on pr_records(user_id, exercise_id);
create index if not exists idx_workout_plans_user_date on workout_plans(user_id, planned_date);
create index if not exists idx_workout_plans_template_id on workout_plans(template_id);

-- ============================================
-- RLS 策略
-- ============================================
alter table exercises enable row level security;
alter table workout_templates enable row level security;
alter table template_exercises enable row level security;
alter table workout_logs enable row level security;
alter table workout_sets enable row level security;
alter table pr_records enable row level security;
alter table workout_plans enable row level security;

-- exercises
create policy "Everyone can view preset exercises"
  on exercises for select
  using (is_preset = true or user_id = auth.uid());

create policy "Users can manage own exercises"
  on exercises for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- workout_templates
create policy "Users can view own templates"
  on workout_templates for select
  using (user_id = auth.uid());

create policy "Users can manage own templates"
  on workout_templates for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- template_exercises
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

-- workout_logs
create policy "Users can view own workout_logs"
  on workout_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own workout_logs"
  on workout_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workout_logs"
  on workout_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own workout_logs"
  on workout_logs for delete
  using (auth.uid() = user_id);

-- workout_sets
create policy "Users can manage own workout_sets"
  on workout_sets for all
  using (
    workout_log_id in (
      select id from workout_logs where user_id = auth.uid()
    )
  )
  with check (
    workout_log_id in (
      select id from workout_logs where user_id = auth.uid()
    )
  );

-- pr_records
create policy "Users can manage own pr_records"
  on pr_records for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- workout_plans
create policy "Users can view own plans"
  on workout_plans for select
  using (user_id = auth.uid());

create policy "Users can manage own plans"
  on workout_plans for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================
-- 自动更新 updated_at
-- ============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_workout_templates_updated_at
  before update on workout_templates
  for each row execute function update_updated_at_column();

create trigger update_workout_plans_updated_at
  before update on workout_plans
  for each row execute function update_updated_at_column();

-- ============================================
-- 预设动作（全新设计）
-- ============================================
insert into exercises (name, body_part, is_preset) values
  -- 胸部 (chest) - 8个动作，覆盖上中下胸 + 不同器械
  ('杠铃平板卧推', 'chest', true),
  ('哑铃上斜卧推', 'chest', true),
  ('哑铃下斜卧推', 'chest', true),
  ('器械推胸', 'chest', true),
  ('龙门架绳索夹胸', 'chest', true),
  ('蝴蝶机夹胸', 'chest', true),
  ('双杠臂屈伸', 'chest', true),
  ('俯卧撑', 'chest', true),

  -- 背部 (back) - 8个动作，覆盖宽度+厚度
  ('引体向上', 'back', true),
  ('高位下拉', 'back', true),
  ('杠铃俯身划船', 'back', true),
  ('哑铃单臂划船', 'back', true),
  ('坐姿绳索划船', 'back', true),
  ('T杠划船', 'back', true),
  ('直臂下压', 'back', true),
  ('山羊挺身', 'back', true),

  -- 肩部 (shoulder) - 7个动作，前中后束全覆盖
  ('杠铃站姿推举', 'shoulder', true),
  ('哑铃坐姿推举', 'shoulder', true),
  ('哑铃侧平举', 'shoulder', true),
  ('绳索侧平举', 'shoulder', true),
  ('俯身哑铃飞鸟', 'shoulder', true),
  ('绳索面拉', 'shoulder', true),
  ('哑铃前平举', 'shoulder', true),

  -- 腿部 (leg) - 9个动作，股四+股二+臀+小腿
  ('杠铃深蹲', 'leg', true),
  ('前蹲', 'leg', true),
  ('腿举', 'leg', true),
  ('腿屈伸', 'leg', true),
  ('俯卧腿弯举', 'leg', true),
  ('罗马尼亚硬拉', 'leg', true),
  ('保加利亚分腿蹲', 'leg', true),
  ('臀推', 'leg', true),
  ('站姿提踵', 'leg', true),

  -- 手臂 (arm) - 8个动作，肱二+肱三均衡覆盖
  ('杠铃弯举', 'arm', true),
  ('哑铃交替弯举', 'arm', true),
  ('锤式弯举', 'arm', true),
  ('牧师凳弯举', 'arm', true),
  ('绳索三头下压', 'arm', true),
  ('仰卧杠铃臂屈伸', 'arm', true),
  ('绳索过头臂屈伸', 'arm', true),
  ('窄距卧推', 'arm', true),

  -- 核心 (core) - 6个动作，腹直肌+腹斜肌+深层核心
  ('卷腹', 'core', true),
  ('悬垂举腿', 'core', true),
  ('绳索卷腹', 'core', true),
  ('俄罗斯转体', 'core', true),
  ('平板支撑', 'core', true),
  ('死虫式', 'core', true)
on conflict do nothing;
