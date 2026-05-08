-- ============================================================
-- FemHealth: начальная схема БД
-- RLS включён на каждой таблице с первого дня.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('patient', 'doctor');
create type link_status as enum ('pending', 'active', 'revoked');
create type symptom_type as enum (
  'mood', 'anxiety', 'libido', 'headache', 'bloating',
  'acne', 'hair_loss', 'breast_pain', 'sugar_craving',
  'sleep_issues', 'fatigue', 'other'
);
create type subscription_plan as enum ('free', 'premium', 'premium_doctor');
create type subscription_status as enum ('active', 'past_due', 'canceled', 'trialing');

-- ============================================================
-- TABLES (все таблицы сначала, политики потом)
-- ============================================================

-- 1. profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  email text,
  phone text,
  locale text not null default 'ru',
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 2. patient_profiles
create table patient_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  birth_date date,
  height_cm smallint,
  weight_kg numeric(5,1),
  primary_diagnoses text[] default '{}',
  avg_cycle_length smallint default 28,
  last_period_date date,
  contraception_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 3. doctor_profiles
create table doctor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  full_name text not null,
  specialty text not null default 'Гинеколог-эндокринолог',
  clinic text,
  license_number text,
  verified boolean not null default false,
  invite_code text unique default substr(md5(random()::text), 1, 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 4. patient_links
create table patient_links (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  doctor_id uuid not null references profiles(id) on delete cascade,
  status link_status not null default 'pending',
  permissions text[] default '{cycle,symptoms,labs}',
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique (patient_id, doctor_id)
);

create index idx_patient_links_patient on patient_links(patient_id);
create index idx_patient_links_doctor on patient_links(doctor_id);

-- 5. cycle_entries
create table cycle_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  period_flow smallint check (period_flow between 0 and 4),
  period_end boolean default false,
  clots boolean,
  pain_level smallint check (pain_level between 0 and 10),
  ovulation_test boolean,
  bbt numeric(4,2),
  sexual_activity boolean,
  contraception_used boolean,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique (patient_id, date)
);

create index idx_cycle_entries_patient_date on cycle_entries(patient_id, date desc);

-- 6. symptoms
create table symptoms (
  id uuid primary key default gen_random_uuid(),
  cycle_entry_id uuid not null references cycle_entries(id) on delete cascade,
  patient_id uuid not null references profiles(id) on delete cascade,
  type symptom_type not null,
  severity smallint not null check (severity between 0 and 10),
  created_at timestamptz not null default now()
);

create index idx_symptoms_entry on symptoms(cycle_entry_id);
create index idx_symptoms_patient on symptoms(patient_id);

-- 7. markers (справочник)
create table markers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_ru text not null,
  name_en text,
  category text not null,
  default_unit text not null,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

-- 8. marker_references
create table marker_references (
  id uuid primary key default gen_random_uuid(),
  marker_id uuid not null references markers(id) on delete cascade,
  condition text not null default 'default',
  reference_low numeric,
  reference_high numeric,
  unit text not null,
  source text not null,
  created_at timestamptz not null default now()
);

create index idx_marker_references_marker on marker_references(marker_id);

-- 9. lab_results
create table lab_results (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  taken_at date not null,
  lab_name text,
  cycle_day smallint,
  file_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index idx_lab_results_patient on lab_results(patient_id, taken_at desc);

-- 10. lab_values
create table lab_values (
  id uuid primary key default gen_random_uuid(),
  lab_result_id uuid not null references lab_results(id) on delete cascade,
  marker_code text not null references markers(code),
  value numeric not null,
  unit text not null,
  reference_low numeric,
  reference_high numeric,
  created_at timestamptz not null default now()
);

create index idx_lab_values_result on lab_values(lab_result_id);
create index idx_lab_values_marker on lab_values(marker_code);

-- 11. doctor_comments
create table doctor_comments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references profiles(id) on delete cascade,
  patient_id uuid not null references profiles(id) on delete cascade,
  target_type text not null check (target_type in ('lab_result', 'cycle_entry', 'symptom', 'general')),
  target_id uuid,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index idx_doctor_comments_patient on doctor_comments(patient_id, created_at desc);
create index idx_doctor_comments_doctor on doctor_comments(doctor_id);

-- 12. subscriptions
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  plan subscription_plan not null default 'free',
  status subscription_status not null default 'active',
  started_at timestamptz not null default now(),
  trial_ends_at timestamptz,
  next_billing_at timestamptz,
  yookassa_payment_method_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 13. consents
create table consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('pdn', 'marketing', 'doctor_share')),
  version text not null,
  accepted boolean not null,
  accepted_at timestamptz not null default now(),
  ip inet
);

create index idx_consents_user on consents(user_id);

-- 14. audit_log
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references profiles(id) on delete cascade,
  patient_id uuid not null references profiles(id) on delete cascade,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index idx_audit_log_patient on audit_log(patient_id, created_at desc);
create index idx_audit_log_actor on audit_log(actor_id);

-- ============================================================
-- RLS: включаем на всех таблицах
-- ============================================================

alter table profiles enable row level security;
alter table patient_profiles enable row level security;
alter table doctor_profiles enable row level security;
alter table patient_links enable row level security;
alter table cycle_entries enable row level security;
alter table symptoms enable row level security;
alter table markers enable row level security;
alter table marker_references enable row level security;
alter table lab_results enable row level security;
alter table lab_values enable row level security;
alter table doctor_comments enable row level security;
alter table subscriptions enable row level security;
alter table consents enable row level security;
alter table audit_log enable row level security;

-- ============================================================
-- RLS POLICIES
-- (все политики после всех таблиц — нет проблем с порядком)
-- ============================================================

-- profiles
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- patient_profiles: свои данные
create policy "patient_profiles_select_own" on patient_profiles for select using (auth.uid() = user_id);
create policy "patient_profiles_update_own" on patient_profiles for update using (auth.uid() = user_id);
create policy "patient_profiles_insert_own" on patient_profiles for insert with check (auth.uid() = user_id);

-- patient_profiles: врач видит своих пациенток
create policy "patient_profiles_select_doctor" on patient_profiles for select using (
  exists (
    select 1 from patient_links
    where patient_links.patient_id = patient_profiles.user_id
      and patient_links.doctor_id = auth.uid()
      and patient_links.status = 'active'
  )
);

-- doctor_profiles: свои данные
create policy "doctor_profiles_select_own" on doctor_profiles for select using (auth.uid() = user_id);
create policy "doctor_profiles_update_own" on doctor_profiles for update using (auth.uid() = user_id);
create policy "doctor_profiles_insert_own" on doctor_profiles for insert with check (auth.uid() = user_id);

-- doctor_profiles: пациентка видит своего врача
create policy "doctor_profiles_select_patient" on doctor_profiles for select using (
  exists (
    select 1 from patient_links
    where patient_links.doctor_id = doctor_profiles.user_id
      and patient_links.patient_id = auth.uid()
      and patient_links.status = 'active'
  )
);

-- patient_links
create policy "patient_links_select_own" on patient_links for select using (auth.uid() = patient_id or auth.uid() = doctor_id);
create policy "patient_links_insert_patient" on patient_links for insert with check (auth.uid() = patient_id);
create policy "patient_links_update_own" on patient_links for update using (auth.uid() = patient_id or auth.uid() = doctor_id);

-- cycle_entries: свои
create policy "cycle_entries_select_own" on cycle_entries for select using (auth.uid() = patient_id);
create policy "cycle_entries_insert_own" on cycle_entries for insert with check (auth.uid() = patient_id);
create policy "cycle_entries_update_own" on cycle_entries for update using (auth.uid() = patient_id);
create policy "cycle_entries_delete_own" on cycle_entries for delete using (auth.uid() = patient_id);

-- cycle_entries: врач
create policy "cycle_entries_select_doctor" on cycle_entries for select using (
  exists (
    select 1 from patient_links
    where patient_links.patient_id = cycle_entries.patient_id
      and patient_links.doctor_id = auth.uid()
      and patient_links.status = 'active'
      and 'cycle' = any(patient_links.permissions)
  )
);

-- symptoms: свои
create policy "symptoms_select_own" on symptoms for select using (auth.uid() = patient_id);
create policy "symptoms_insert_own" on symptoms for insert with check (auth.uid() = patient_id);
create policy "symptoms_update_own" on symptoms for update using (auth.uid() = patient_id);
create policy "symptoms_delete_own" on symptoms for delete using (auth.uid() = patient_id);

-- symptoms: врач
create policy "symptoms_select_doctor" on symptoms for select using (
  exists (
    select 1 from patient_links
    where patient_links.patient_id = symptoms.patient_id
      and patient_links.doctor_id = auth.uid()
      and patient_links.status = 'active'
      and 'symptoms' = any(patient_links.permissions)
  )
);

-- markers & marker_references: все авторизованные
create policy "markers_select_authenticated" on markers for select using (auth.role() = 'authenticated');
create policy "marker_references_select_authenticated" on marker_references for select using (auth.role() = 'authenticated');

-- lab_results: свои
create policy "lab_results_select_own" on lab_results for select using (auth.uid() = patient_id);
create policy "lab_results_insert_own" on lab_results for insert with check (auth.uid() = patient_id);
create policy "lab_results_update_own" on lab_results for update using (auth.uid() = patient_id);
create policy "lab_results_delete_own" on lab_results for delete using (auth.uid() = patient_id);

-- lab_results: врач
create policy "lab_results_select_doctor" on lab_results for select using (
  exists (
    select 1 from patient_links
    where patient_links.patient_id = lab_results.patient_id
      and patient_links.doctor_id = auth.uid()
      and patient_links.status = 'active'
      and 'labs' = any(patient_links.permissions)
  )
);

-- lab_values: свои (через lab_results)
create policy "lab_values_select_own" on lab_values for select using (
  exists (select 1 from lab_results where lab_results.id = lab_values.lab_result_id and lab_results.patient_id = auth.uid())
);
create policy "lab_values_insert_own" on lab_values for insert with check (
  exists (select 1 from lab_results where lab_results.id = lab_values.lab_result_id and lab_results.patient_id = auth.uid())
);
create policy "lab_values_update_own" on lab_values for update using (
  exists (select 1 from lab_results where lab_results.id = lab_values.lab_result_id and lab_results.patient_id = auth.uid())
);
create policy "lab_values_delete_own" on lab_values for delete using (
  exists (select 1 from lab_results where lab_results.id = lab_values.lab_result_id and lab_results.patient_id = auth.uid())
);

-- lab_values: врач
create policy "lab_values_select_doctor" on lab_values for select using (
  exists (
    select 1 from lab_results
    join patient_links on patient_links.patient_id = lab_results.patient_id
    where lab_results.id = lab_values.lab_result_id
      and patient_links.doctor_id = auth.uid()
      and patient_links.status = 'active'
      and 'labs' = any(patient_links.permissions)
  )
);

-- doctor_comments
create policy "doctor_comments_select_own" on doctor_comments for select using (auth.uid() = patient_id or auth.uid() = doctor_id);
create policy "doctor_comments_update_doctor" on doctor_comments for update using (auth.uid() = doctor_id);
create policy "doctor_comments_insert_doctor" on doctor_comments for insert with check (
  auth.uid() = doctor_id
  and exists (
    select 1 from patient_links
    where patient_links.patient_id = doctor_comments.patient_id
      and patient_links.doctor_id = auth.uid()
      and patient_links.status = 'active'
  )
);

-- subscriptions
create policy "subscriptions_select_own" on subscriptions for select using (auth.uid() = user_id);
create policy "subscriptions_insert_own" on subscriptions for insert with check (auth.uid() = user_id);
create policy "subscriptions_update_own" on subscriptions for update using (auth.uid() = user_id);

-- consents
create policy "consents_select_own" on consents for select using (auth.uid() = user_id);
create policy "consents_insert_own" on consents for insert with check (auth.uid() = user_id);

-- audit_log
create policy "audit_log_select_own" on audit_log for select using (auth.uid() = patient_id or auth.uid() = actor_id);

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  for t in
    select table_name from information_schema.columns
    where column_name = 'updated_at'
      and table_schema = 'public'
  loop
    execute format(
      'create trigger set_updated_at before update on %I for each row execute function update_updated_at()',
      t
    );
  end loop;
end;
$$;
