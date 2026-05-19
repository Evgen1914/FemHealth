-- Пациентка и врач могут удалять свою связку (отвязка / отмена / отклонение заявки)
create policy "patient_links_delete_own" on patient_links
  for delete using (auth.uid() = patient_id or auth.uid() = doctor_id);
