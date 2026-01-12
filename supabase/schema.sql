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
-- 索引优化
-- ============================================
create index if not exists idx_workout_logs_user_date on workout_logs(user_id, date desc);
create index if not exists idx_workout_sets_log_id on workout_sets(workout_log_id);
create index if not exists idx_workout_sets_exercise_id on workout_sets(exercise_id);
create index if not exists idx_template_exercises_template_id on template_exercises(template_id);
create index if not exists idx_pr_records_user_exercise on pr_records(user_id, exercise_id);

-- ============================================
-- RLS 策略
-- ============================================
alter table exercises enable row level security;
alter table workout_templates enable row level security;
alter table template_exercises enable row level security;
alter table workout_logs enable row level security;
alter table workout_sets enable row level security;
alter table pr_records enable row level security;

-- exercises
drop policy if exists "Everyone can view preset exercises" on exercises;
drop policy if exists "Users can manage own exercises" on exercises;

create policy "Everyone can view preset exercises"
  on exercises for select
  using (is_preset = true or user_id = auth.uid());

create policy "Users can manage own exercises"
  on exercises for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- workout_templates
drop policy if exists "Users can view own templates" on workout_templates;
drop policy if exists "Users can manage own templates" on workout_templates;

create policy "Users can view own templates"
  on workout_templates for select
  using (user_id = auth.uid());

create policy "Users can manage own templates"
  on workout_templates for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- template_exercises
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

-- workout_logs
drop policy if exists "Users can view own workout_logs" on workout_logs;
drop policy if exists "Users can insert own workout_logs" on workout_logs;
drop policy if exists "Users can update own workout_logs" on workout_logs;
drop policy if exists "Users can delete own workout_logs" on workout_logs;

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
drop policy if exists "Users can manage own workout_sets" on workout_sets;

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
drop policy if exists "Users can manage own pr_records" on pr_records;

create policy "Users can manage own pr_records"
  on pr_records for all
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

drop trigger if exists update_workout_templates_updated_at on workout_templates;
create trigger update_workout_templates_updated_at
  before update on workout_templates
  for each row execute function update_updated_at_column();

-- ============================================
-- 预设动作
-- ============================================
insert into exercises (name, body_part, is_preset)
values
  ('平板杠铃卧推', 'chest', true),
  ('上斜哑铃卧推', 'chest', true),
  ('哑铃飞鸟', 'chest', true),
  ('龙门架夹胸', 'chest', true),
  ('引体向上', 'back', true),
  ('高位下拉', 'back', true),
  ('杠铃划船', 'back', true),
  ('坐姿划船', 'back', true),
  ('哑铃肩推', 'shoulder', true),
  ('杠铃推举', 'shoulder', true),
  ('侧平举', 'shoulder', true),
  ('面拉', 'shoulder', true),
  ('杠铃深蹲', 'leg', true),
  ('腿举', 'leg', true),
  ('罗马尼亚硬拉', 'leg', true),
  ('腿弯举', 'leg', true),
  ('杠铃弯举', 'arm', true),
  ('锤式弯举', 'arm', true),
  ('三头下压', 'arm', true),
  ('过头臂屈伸', 'arm', true),
  ('卷腹', 'core', true),
  ('平板支撑', 'core', true),
  ('悬垂举腿', 'core', true)
on conflict do nothing;
