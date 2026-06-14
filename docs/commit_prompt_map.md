# Commit ↔ Prompt map

Ghi lại mỗi commit MealFit: tóm tắt prompt, scope, file chính, lệnh test, commit message.

---

## 2026-06-14 (b) — wire Supabase read/write, seed all data, CRUD via Drawer/Toast

- **Prompt summary**: Nối đọc/ghi trực tiếp Supabase cho `mealfit_*`; chuyển toàn bộ form CRUD
  (món/khách/đơn) sang Drawer/Modal + Toast + validation; seed hết dữ liệu từ sheet; tạo sẵn 1 admin
  + 1 nhân viên trong seed và authentication.
- **Scope**: MealFit data layer + UI CRUD + seed + schema apply.
- **Main files changed**: `lib/supabase/admin.ts`, `lib/mealfit-repo.ts`, `app/api/mealfit/**`,
  `contexts/DataContext.tsx`, `components/ui/ConfirmDialog.tsx`,
  `src/components/{CustomerManagement,MealManagement,OrderManagement}.tsx`,
  `app/(app)/{customers,products,orders}/page.tsx`, `scripts/seed/mealfit.ts`,
  `supabase/migrations/20260613160000_mealfit.sql`, `package.json`.
- **Tests run**: `psql -f migration` (7 tables + RLS + 2 employees), `npm run seed`
  (129 products, 32 combos, 4 customers, 2 employees, 3 orders, 5 items), `npm run typecheck`,
  `npm run build` (green). E2E: `GET /api/mealfit` → 75 meals + aggregates + orders; POST/DELETE
  customer round-trip; auth `or(email,code)` query verified.
- **Commit message**: `feat(mealfit): wire Supabase CRUD, seed data, drawer/toast forms`
- **Notes/Risks**: Service-role qua API routes (RLS strict, bypass server-side) vì auth dùng cookie
  riêng (chưa map Supabase Auth). Password nhân viên plain text (bootstrap) — hash khi public. RLS
  ghi vẫn để service role; siết theo role là việc sau.

## 2026-06-14 — migrate MealFit to Next.js + Supabase full app

- **Prompt summary**: Triển khai full app bán hàng MealFit theo `docs/prompt1.md` + `docs/response1.md`
  và các PDF: migrate Vite SPA → Next.js 15 + Supabase; auth + phân quyền admin/staff; landing công
  khai; Drawer/Toast/Validation; import wizard (template + bảng lỗi + chặn import); loading states;
  animation nền; branding (favicon/OG/apple-icon); typography Avenir Next; responsive.
- **Ticket/Issue ID**: —
- **Scope**: MealFit product — Next.js app shell, Supabase wiring, auth, UI primitives, feature pages,
  import, branding, docs.
- **Main files changed**:
  - Config: `package.json`, `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, `.env.example`,
    `.env.local`, `middleware.ts`.
  - DB/seed: `supabase/migrations/20260613160000_mealfit.sql`, `scripts/seed/mealfit.ts`.
  - lib: `lib/{format,auth,menu,import-products}.ts`, `lib/supabase/{env,client,server}.ts`.
  - app: `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (landing), `app/login/*`,
    `app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`, `app/twitter-image.tsx`,
    `app/(app)/{layout,loading}.tsx`, `app/(app)/{dashboard,orders,products,customers,reports,import}/page.tsx`.
  - components: `components/ui/{Button,Spinner,LoadingScreen,BackgroundAnimation,Drawer,Toast,Field}.tsx`,
    `components/app/AppShell.tsx`, `contexts/{DataContext,AuthContext}.tsx`.
  - Reuse: `src/components/*` (+`"use client"`), `src/data/mealPrepData.ts`, `src/services/*`.
  - docs: `docs/mealfit_prompt.md`, `docs/mealfit_plan.md`, `docs/agents_mealfit_addendum.md`,
    `docs/claude_mealfit_addendum.md`, `docs/commit_prompt_map.md`, `AGENTS.md`, `CLAUDE.md`, `README.md`.
- **Tests run**: `npm run typecheck` (clean), `npm run build` (15 routes OK), dev smoke test
  (`/`=200, `/login`=200, `/dashboard`→307 `/login`).
- **Commit message**: `feat(mealfit): migrate to Next.js + Supabase app with auth, landing, import`
- **Notes/Risks**: CRUD hiện ghi `localStorage`; chưa nối CRUD trực tiếp Supabase. Form CRUD cũ chưa
  chuyển hết sang Drawer+Toast. Chưa seed `Don_hang`; RLS chưa siết theo role. Cần `SUPABASE_SERVICE_ROLE_KEY`
  để chạy `npm run seed` và `supabase db push`.
