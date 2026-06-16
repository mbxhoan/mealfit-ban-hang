# Commit ↔ Prompt map

Ghi lại mỗi commit MealFit: tóm tắt prompt, scope, file chính, lệnh test, commit message.

---

## 2026-06-16 — change flavor list to grid layout

- **Prompt summary**: Đổi giao diện hiển thị các vị của danh mục món từ dạng danh sách (list) sang dạng lưới (grid).
- **Scope**: MealFit landing page / MenuExplorer component.
- **Main files changed**: `components/home/MenuExplorer.tsx`.
- **Tests run**: `npm run typecheck`, `npm run build` (successful).
- **Commit message**: `style(mealfit): change flavors list to grid layout in MenuExplorer`
- **Notes/Risks**: None. CSS change only.

## 2026-06-16 — ảnh danh mục + dinh dưỡng theo trọng lượng + trang chủ view-only + nút nổi FB/Zalo

- **Prompt summary**: (1) Cho admin upload ảnh theo **danh mục** (ức gà, thăn bò…). (2) Món/vị chưa
  có ảnh riêng thì **dùng ảnh danh mục** (rồi tới emoji). (3) Trang chủ `/` thành **view-only** (bỏ
  đặt hàng), thêm **nút nổi góc dưới phải** Facebook + Zalo có animation rung thu hút. (4) Hiển thị
  món **theo danh mục**: bấm danh mục → ra các vị + **dinh dưỡng theo trọng lượng** (cố định
  100/150/200g + ô nhập gram tùy ý có ràng buộc min–max, tính tuyến tính).
- **Scope**: MealFit schema (2 bảng mới) + repo/API + DataContext + admin UI (form sửa món) +
  landing page (view-only + explorer + floating contact).
- **Quyết định (hỏi user)**: dinh dưỡng **admin tự nhập, có default** chuẩn/100g; link liên hệ
  **admin sửa trong app** (bảng `mealfit_settings`); ảnh+macro danh mục **gộp vào form sửa món**.
- **Main files changed**:
  - DB: `supabase/migrations/20260616120000_categories_settings.sql` (`mealfit_categories`,
    `mealfit_settings` + RLS read).
  - Backend: `lib/mealfit-repo.ts` (`getCategories/upsertCategory`, `getSettings/upsertSettings`,
    bootstrap), `app/api/mealfit/{categories,settings}/route.ts` (admin POST),
    `src/data/mealPrepData.ts` (`CategoryInfo`), `lib/menu.ts` (`CATEGORY_NUTRITION_DEFAULTS`,
    `WEIGHT_MIN/MAX/PRESETS`, `nutritionFor`, `categoryNutrition/Image`, `menuCategories`),
    `contexts/DataContext.tsx` (categories+settings state + write-through).
  - UI: `components/home/MealThumb.tsx` (fallback ảnh danh mục), `components/home/MenuExplorer.tsx`
    (mới — grid danh mục + featured + modal vị/dinh dưỡng), `components/home/FloatingContact.tsx`
    (mới — nút nổi FB/Zalo `mf-shake`), `app/page.tsx` (view-only, bỏ CTA đặt hàng, CTA cuối →
    liên hệ), `app/globals.css` (`@keyframes mf-shake`), `src/components/MealManagement.tsx`
    (form: ảnh+macro danh mục; card: liên hệ trang chủ).
  - Bỏ dùng `components/home/MobileStickyCTA.tsx`.
- **Tests run**: `npm run typecheck` (clean), `npm run build` (19 routes OK, `/` 107 kB, 2 API mới).
- **Commit message**: `feat(mealfit): category photos + nutrition explorer + view-only home with floating contact`
- **Notes/Risks**: Macro/100g là default ước tính (admin chỉnh được). Offline (thiếu Supabase env):
  dinh dưỡng dùng default, link liên hệ trống → nút nổi ẩn, ảnh danh mục chỉ từ localStorage. Cần
  `supabase db push` để tạo 2 bảng mới; app vẫn chạy nếu chưa push.

## 2026-06-15 (d) — in A4 cho "Tổng hợp đơn theo khách" với page break theo khối khách

- **Prompt summary**: Làm bản in A4 cho tab **Tổng hợp đơn theo khách**. Nhóm dữ liệu theo khách
  rồi theo đơn, giữ nguyên khối khách/order khi in để tránh cắt dở giữa trang; ẩn shell nội bộ
  (sidebar/header/filter/tabs) khi xuất giấy; thêm nút `In A4`.
- **Scope**: MealFit UI print layout + statistics grouping.
- **Main files changed**: `src/components/StatisticsView.tsx` (group theo khách/order, nút in,
  banner print-only, page-break handling), `components/app/AppShell.tsx` (class print-hide cho shell),
  `components/ui/BackgroundAnimation.tsx` (accept `className` để ẩn khi in), `app/globals.css`
  (print media rules A4 + break-inside/break-before), `docs/mealfit_plan.md`,
  `docs/mealfit_prompt.md`, `docs/commit_prompt_map.md`.
- **Tests run**: `npm run build` (clean), `npm run typecheck` (clean after build generated
  `.next/types`).
- **Commit message**: `feat(mealfit): add A4 print layout for customer order summary`
- **Notes/Risks**: Print layout relies on browser print CSS support for `break-inside: avoid`; very
  long khách/order vẫn có thể bị tách nếu vượt chiều cao 1 trang A4.

## 2026-06-15 (c) — menu "Thống kê": tổng hợp đi chợ + tổng hợp đơn theo khách

- **Prompt summary**: Thêm menu **Thống kê** gồm 2 tab. (1.a) *Tổng hợp đi chợ*: lọc đơn theo
  khoảng ngày + trạng thái giao/thanh toán (mặc định "Chưa giao hàng"), bung combo thành món con,
  gom theo **danh mục → món → trọng lượng**, tính số gói + tổng gam + **tổng kg theo danh mục**;
  món thuộc combo giữ thành dòng riêng có nhãn "Combo" nhưng vẫn cộng vào tổng danh mục. (1.b)
  *Tổng hợp đơn theo khách*: mỗi combo / cụm món lẻ của đơn là 1 cụm (STT, Tên khách, Tên order),
  breakdown từng món thành dòng: Tên món · Số túi · Trọng lượng · Tổng cộng (túi×trọng lượng).
- **Scope**: MealFit UI (new statistics screen) + combo composition data.
- **Main files changed**: `src/data/comboComponents.ts` (AUTO-GEN từ sheet `Combo_chi_tiet`:
  32 combo → 256 dòng món con), `src/components/StatisticsView.tsx` (logic bung combo + 2 bảng),
  `app/(app)/statistics/page.tsx` (route), `components/app/AppShell.tsx` (nav "Thống kê" +
  title + icon `ClipboardList`), `docs/commit_prompt_map.md`, `README.md`.
- **Quyết định**:
  - "Chưa giao hàng" = status ∈ {Mới, Đang xử lý, Đang giao} (enum app không có "Chưa giao hàng");
    luôn loại "Đã hủy" khỏi mọi chế độ.
  - Trục ngày = `deliveryDate` (ngày giao) vì mục tiêu là chuẩn bị hàng để giao.
  - Cá tách theo danh mục thật của app (Cá hồi / Cá thu / Cá tầm / Cá bóp) thay vì gộp "Cá" như
    sheet Excel — khớp ví dụ user ("tổng cá hồi 2.45kg").
  - Combo bung qua bảng tra cứu tĩnh `COMBO_COMPONENTS` (khớp theo tên combo) vì `order_items`
    lưu combo dạng 1 dòng (`weight="Combo"`), không có món con; seed cũng chưa đổ `mealfit_combo_products`.
- **Tests run**: `npm run typecheck` (clean), `npm run build` (17 routes OK, `/statistics` 7.23 kB),
  kiểm chứng số học bằng node trên seed orders (combo "Power Fit v1" → 8 món con, tổng đúng 2.50 kg).
- **Commit message**: `feat(mealfit): thêm menu Thống kê (tổng hợp đi chợ + đơn theo khách)`
- **Notes/Risks**: `comboComponents.ts` là snapshot từ workbook — regen nếu combo đổi. Nếu đơn dùng
  tên combo không khớp `COMBO_COMPONENTS`, dòng combo giữ nguyên dưới danh mục "Combo" (không mất
  dữ liệu) thay vì bung. Combo trong dữ liệu hiện đều SL món/combo = 1.

## 2026-06-15 (b) — nâng bảng đơn hàng (sort/cột/lọc/phân trang/bulk/sửa) + sidebar logo MealFit

- **Prompt summary**: Nâng bảng Quản lý đơn hàng thành table chuẩn: sort + auto width, chọn cột (lưu
  state), lọc đa trường gọn 1 dropdown, phân trang (10/20/50/100, mặc định 10), mặc định sort theo
  thời gian cập nhật mới nhất, chọn nhiều đơn để đổi trạng thái giao/thanh toán hoặc xóa, admin sửa
  món/thông tin đơn (mọi trạng thái trừ `Đã hủy`). Sau đó đặt logo sidebar = logo MealFit.
- **Scope**: MealFit UI (orders table) + branding sidebar.
- **Main files changed**: `src/components/OrderManagement.tsx` (rewrite table: cấu hình cột, sort,
  filter dropdown, pagination, bulk bar, edit-order modal), `src/data/mealPrepData.ts` (thêm
  `Order.updatedAt?`; chuẩn hóa file về NFC), `components/app/AppShell.tsx` (sidebar logo dùng
  `/logo.png`), `public/logo.png` (copy từ `app/icon.png`).
- **Quyết định**: sửa đơn cho admin mọi trạng thái trừ `Đã hủy`; bulk đổi trạng thái cho cả 2 role,
  bulk xóa admin-only (khớp nút xóa đơn lẻ).
- **Tests run**: `npm run typecheck` (clean), `npm run build` (16 routes OK, `/orders` 15.9 kB).
- **Commit message**: `feat(mealfit): nâng bảng đơn hàng (sort/cột/lọc/phân trang/bulk/sửa) + sidebar logo`
- **Notes/Risks**: Sort "cập nhật mới nhất" dùng `updatedAt ?? createdAt`; offline lưu nguyên object
  nên đúng ngay, Supabase mode chưa round-trip `updated_at` (fallback `createdAt`) — follow-up map
  `updated_at` trong `lib/mealfit-repo.ts` nếu cần. Đã chuẩn hóa Unicode `mealPrepData.ts` +
  `OrderManagement.tsx` về NFC (trước đó dạng hỗn hợp gây lệch literal type).

## 2026-06-15 — fix GitGuardian security leak warning by using example.com domains for demo accounts

- **Prompt summary**: Resolve GitGuardian "Company Email Password exposed on GitHub" warning for the initial commit.
- **Scope**: MealFit authentication / seed data.
- **Main files changed**: `lib/auth.ts`, `scripts/seed/mealfit.ts`, `supabase/migrations/20260613160000_mealfit.sql`, `supabase/migrations/20260615002500_update_employee_emails.sql`.
- **Tests run**: `npm run typecheck`, `npm run build` (successful).
- **Commit message**: `fix(mealfit): use dummy example.com emails for demo accounts to prevent security alerts`
- **Notes/Risks**: None. Demo logins still work with the `admin`/`nhanvien` codes or their updated emails.

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
