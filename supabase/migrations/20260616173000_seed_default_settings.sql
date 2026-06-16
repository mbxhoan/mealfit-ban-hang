-- Seed default MealFit contact + payment settings so a fresh database has the
-- public links and the default VietQR account ready for bills/invoices.

insert into public.mealfit_settings (key, value, updated_at)
values
  ('facebook_url', 'https://www.facebook.com/mealfitvietnam', now()),
  ('zalo_url', 'https://zalo.me/0903123981', now()),
  ('payment_bank_name', 'VIB', now()),
  ('payment_bank_code', 'VIB', now()),
  ('payment_account_number', '865884858', now()),
  ('payment_account_name', 'Phạm Thị Linh Uyên', now()),
  ('payment_acq_id', '970441', now()),
  ('payment_qr_template', 'compact2', now())
on conflict (key) do update
set value = excluded.value,
    updated_at = excluded.updated_at;
