-- Разрешаем любому авторизованному пользователю читать doctor_profiles.
-- Без этого пациентка не может найти врача по инвайт-коду,
-- потому что исходная политика требует активной связки (patient_links).
create policy "doctor_profiles_select_authenticated"
  on doctor_profiles for select
  using (auth.role() = 'authenticated');
