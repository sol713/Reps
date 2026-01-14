-- ============================================
-- 训练计划表 - 将模板与日期绑定
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

create index if not exists idx_workout_plans_user_date on workout_plans(user_id, planned_date);
create index if not exists idx_workout_plans_template_id on workout_plans(template_id);

alter table workout_plans enable row level security;

drop policy if exists "Users can view own plans" on workout_plans;
drop policy if exists "Users can manage own plans" on workout_plans;

create policy "Users can view own plans"
  on workout_plans for select
  using (user_id = auth.uid());

create policy "Users can manage own plans"
  on workout_plans for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop trigger if exists update_workout_plans_updated_at on workout_plans;
create trigger update_workout_plans_updated_at
  before update on workout_plans
  for each row execute function update_updated_at_column();
