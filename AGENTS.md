# AGENTS.md

Hướng dẫn cho agent làm việc trên repo **MealFit** (Next.js 15 + Supabase).

## Stack
- Next.js App Router, React 19, TypeScript, Tailwind CSS v4.
- Supabase (Postgres + Auth) qua `@supabase/ssr`. Fallback offline: seed data + `localStorage` khi
  thiếu `NEXT_PUBLIC_SUPABASE_*`.

## Cấu trúc
- `app/` — routes. `(app)/` = nhóm route nội bộ (cần đăng nhập); `/` = landing công khai; `/login`.
- `components/ui/` — primitives (Button, Drawer, Toast, Field, LoadingScreen…).
- `components/app/`, `contexts/` — app shell + state (Data/Auth context).
- `lib/` — format, auth, supabase clients, menu, import helpers.
- `src/components/`, `src/data/`, `src/services/` — UI nghiệp vụ + dữ liệu seed (tái sử dụng).
- `supabase/migrations/`, `scripts/seed/` — schema + seed.

## Quy tắc
- Trước khi sửa, đọc file liên quan. Giữ phong cách code xung quanh.
- Lệnh kiểm tra: `npm run typecheck` và `npm run build` phải sạch trước khi kết thúc.
- Không commit/push trừ khi được yêu cầu. Branch từ `main` nếu cần.
- **MealFit**: đọc thêm `docs/agents_mealfit_addendum.md` (bắt buộc).
