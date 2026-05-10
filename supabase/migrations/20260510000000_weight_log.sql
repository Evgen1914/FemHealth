create table weight_log (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  weight_kg numeric(5,1) not null,
  created_at timestamptz not null default now(),
  unique (patient_id, date)
);

create index idx_weight_log_patient on weight_log(patient_id, date desc);

alter table weight_log enable row level security;

create policy "weight_log_select_own" on weight_log
  for select using (auth.uid() = patient_id);

create policy "weight_log_insert_own" on weight_log
  for insert with check (auth.uid() = patient_id);

create policy "weight_log_update_own" on weight_log
  for update using (auth.uid() = patient_id);

create policy "weight_log_delete_own" on weight_log
  for delete using (auth.uid() = patient_id);

-- Врач видит вес привязанной пациентки
create policy "weight_log_select_doctor" on weight_log
  for select using (
    exists (
      select 1 from patient_links
      where patient_links.patient_id = weight_log.patient_id
        and patient_links.doctor_id = auth.uid()
        and patient_links.status = 'active'
    )
  );
