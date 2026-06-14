-- Update employee seed emails to dummy emails to prevent GitGuardian security alerts
update public.mealfit_employees
set email = 'admin@example.com'
where code = 'admin' and email = 'admin@mealfit.vn';

update public.mealfit_employees
set email = 'staff@example.com'
where code = 'nhanvien' and email = 'staff@mealfit.vn';
