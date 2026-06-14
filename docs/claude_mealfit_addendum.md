# CLAUDE.md — MealFit Addendum

Phụ lục cho `CLAUDE.md` (không thay thế). Mở rộng hướng dẫn khi làm task MealFit.

## 8. Done format
Khi hoàn tất task MealFit, nêu rõ:
1. **Mục tiêu đã xử lý**: mô-đun nào (schema / seed / UI / docs).
2. **File đã sửa**: liệt kê `supabase/migrations/*mealfit.sql`, `scripts/seed/mealfit.ts`, file trong
   `app/` + `components/` + `lib/`, và `docs/mealfit_*`.
3. **DB/API contract**: có đổi schema `mealfit_*` hay thêm route không.
4. **Test/Lệnh đã chạy**: `npm run typecheck`, `npm run build`, `npm run seed`, `supabase db push`.
5. **Rủi ro còn lại**: phần chưa hoàn thiện (CRUD↔Supabase, RLS theo role, seed đơn hàng…).

## 9. Commit discipline
- Mọi commit MealFit có scope `mealfit`, ví dụ `feat(mealfit): migrate to Next.js + Supabase`.
- Gộp các file liên quan vào một commit + entry trong `docs/commit_prompt_map.md`.
- Không đụng file ngoài MealFit trừ khi liên quan, và ghi chú rõ.

## 10. User guide maintenance
- Thay đổi menu/workflow/quyền/UI MealFit phải cập nhật hướng dẫn người dùng (README hoặc trang
  guide khi có).

## 11. Branch workflow
- Áp dụng thay đổi MealFit vào `main` trước, merge nhánh con sau nếu cần thử nghiệm.

## 12. README maintenance
- Nếu MealFit ảnh hưởng onboarding/cấu hình/vận hành, cập nhật `README.md`.
