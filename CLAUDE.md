# CLAUDE.md

Hướng dẫn cho Claude Code trên repo **MealFit**.

## Lệnh
- `npm run dev` — chạy local (port 3000).
- `npm run build` / `npm run typecheck` — kiểm tra trước khi hoàn tất.
- `npm run seed` — seed Supabase từ Excel (cần `SUPABASE_SERVICE_ROLE_KEY`).

## Môi trường
- `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key),
  `SUPABASE_SERVICE_ROLE_KEY` (chỉ server, cho seed), `NEXT_PUBLIC_SITE_URL`, `MEALFIT_XLSX_PATH`.
- Thiếu Supabase env → app chạy offline bằng seed data + `localStorage`.

## Tài khoản demo
- Admin: `admin` / `admin123` · Nhân viên: `nhanvien` / `staff123`.

## Khi làm task MealFit
Đọc `docs/claude_mealfit_addendum.md` và `docs/mealfit_plan.md`. Tuân thủ Done format, commit scope
`mealfit`, cập nhật `docs/commit_prompt_map.md`.
