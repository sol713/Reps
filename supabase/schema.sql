create extension if not exists "pgcrypto";

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  body_part text not null,
  is_preset boolean default false,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  date date not null default current_date,
  created_at timestamp with time zone default now()
);

create table if not exists workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid references workout_logs(id) on delete cascade,
  exercise_id uuid references exercises(id),
  set_number integer not null,
  set_type text default 'normal',
  weight numeric,
  reps integer,
  segments jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists pr_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  exercise_id uuid references exercises(id),
  weight numeric not null,
  achieved_at timestamp with time zone default now()
);

alter table exercises enable row level security;
alter table workout_logs enable row level security;
alter table workout_sets enable row level security;
alter table pr_records enable row level security;

drop policy if exists "Users can view own workout_logs" on workout_logs;
drop policy if exists "Users can insert own workout_logs" on workout_logs;
drop policy if exists "Users can update own workout_logs" on workout_logs;
drop policy if exists "Users can delete own workout_logs" on workout_logs;

drop policy if exists "Users can manage own workout_sets" on workout_sets;

drop policy if exists "Users can manage own pr_records" on pr_records;

drop policy if exists "Everyone can view preset exercises" on exercises;
drop policy if exists "Users can manage own exercises" on exercises;

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

create policy "Users can manage own pr_records"
  on pr_records for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Everyone can view preset exercises"
  on exercises for select
  using (is_preset = true or user_id = auth.uid());

create policy "Users can manage own exercises"
  on exercises for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 预设动作请在 SQL 编辑器中以管理员身份执行以下插入
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
  ('悬垂举腿', 'core', true);
