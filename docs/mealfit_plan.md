# Kế hoạch triển khai MealFit

Tài liệu kế hoạch cho ứng dụng bán hàng **MealFit**. Bao gồm mục tiêu, mô hình dữ liệu, quy trình
seed, yêu cầu UI/UX, phân quyền và lộ trình. Cập nhật để phản ánh stack thực tế đã triển khai.

## Stack thực tế
- **Next.js 15 (App Router) + React 19 + TypeScript**, Tailwind CSS v4.
- **Supabase** (Postgres + Auth) làm backend; client qua `@supabase/ssr`.
- **Fallback offline**: khi thiếu biến môi trường `NEXT_PUBLIC_SUPABASE_*`, app chạy hoàn toàn trên
  dữ liệu seed đóng gói (`src/data/mealPrepData.ts`) + `localStorage`. Cho phép demo không cần DB.

## 1. Mục tiêu
1. **Quản lý món & combo**: danh sách món theo trọng lượng (100/150/200g), giá vốn, giá bán, lợi
   nhuận, tỉ lệ lãi.
2. **Quản lý đơn hàng**: tạo đơn, gán khách/nhân viên, tổng SL/tiền/vốn, giảm giá, phí ship, trạng
   thái thanh toán, xuất bill.
3. **Chi tiết đơn**: món/combo + trọng lượng, số lượng, đơn giá, lợi nhuận.
4. **Khách hàng & nhân viên**: liên hệ; phân quyền `admin`/`staff`.
5. **Báo cáo doanh thu & lợi nhuận** theo thời gian/khách/món.
6. **UI/UX chuyên nghiệp**, responsive 320–430 (mobile) / 768–1024 (tablet) / 1280–1920 (desktop),
   không tràn ngang.
7. **Loading**: màn hình chờ tải trang (`app/(app)/loading.tsx`), spinner nút khi submit.
8. **Drawer + Toast + Validation**: drawer trượt phải (ESC/overlay đóng); toast góc phải tự ẩn 4s.
9. **Import Excel**: tải template, hướng dẫn cột, bảng lỗi, chặn import tới khi sạch.
10. **Landing công khai** showcase món/combo, không cần login.

## 2. Mô hình dữ liệu (Supabase)
Migration: `supabase/migrations/20260613160000_mealfit.sql`.

| Bảng | Mục đích |
| --- | --- |
| `mealfit_products` | món theo `code`, tên, nhóm, `weight`, giá vốn/bán, lợi nhuận, tỉ lệ lãi |
| `mealfit_combos` | combo: mã, tên, mô tả, giá bán/vốn, lợi nhuận, tỉ lệ lãi |
| `mealfit_combo_products` | liên kết combo↔món con (`combo_id`, `product_id`, SL/trọng lượng) |
| `mealfit_customers` | khách: mã, tên, SĐT, địa chỉ, ghi chú |
| `mealfit_employees` | nhân viên: `role` ∈ {admin, staff}, tên, email, mật khẩu |
| `mealfit_orders` | đơn: mã, khách, NV, ngày, tổng SL/tiền/vốn, giảm giá, ship, trạng thái |
| `mealfit_order_items` | chi tiết: món/combo, SL, trọng lượng, giá vốn/bán, lợi nhuận |

RLS bật, policy đọc cho `authenticated`; ghi qua service role (siết theo role ở migration sau).

## 3. Quy trình seed
1. File Excel gốc tại `docs/Meal Prep quản lý bán hàng final_sheet.xlsx` (đặt qua `MEALFIT_XLSX_PATH`).
2. Script `scripts/seed/mealfit.ts` đọc `Bang_gia`, `Combo_tong_hop`, `Combo_chi_tiet`, `Khach_hang`,
   `Nhân_viên`.
3. Upsert theo `code` (idempotent) bằng `@supabase/supabase-js` + `SUPABASE_SERVICE_ROLE_KEY`.
4. Chạy: `npm run seed` (sau khi cấu hình `.env.local`).

## 4. UI/UX
- **Typography**: body `"Avenir Next", "Segoe UI", sans-serif`, base 14px; `h1` 21px, stat 22px,
  `h3` 15px (xem `app/globals.css`).
- **Nút & icon**: `.btn` thu nhỏ padding/font/radius; icon mọi nút (quay lại, xác nhận, hoàn tất, tải
  template, nạp, lưu, hủy, tạo, đăng nhập, sửa, xóa).
- **Responsive**: grid/flex, Tailwind `sm/md/lg/xl/2xl`; không horizontal scroll (`overflow-x:hidden`).
- **Loading states**: `LoadingScreen`, spinner trong `Button`.
- **Animation nền**: `BackgroundAnimation` (blob brand trôi nhẹ, `prefers-reduced-motion` safe).
- **Drawer & Toast**: `components/ui/Drawer.tsx`, `components/ui/Toast.tsx`.
- **Validation**: `components/ui/Field.tsx`; import wizard validate cell-level.
- **Print A4**: tab `Thống kê` ở chế độ `Tổng hợp đơn theo khách` phải có bản in A4 gọn,
  giữ nguyên khối theo khách/order để tránh cắt dở giữa trang; ẩn sidebar/header/filter khi in.

## 5. Phân quyền & xác thực
- **Admin**: toàn quyền + nhập dữ liệu (`/import`).
- **Nhân viên**: tạo đơn, xem món/combo, xem báo cáo; không nhập dữ liệu.
- Auth qua cookie phiên (`lib/auth.ts`); xác thực vào `mealfit_employees`, fallback tài khoản seed
  (`admin/admin123`, `nhanvien/staff123`). Middleware (`middleware.ts`) chặn route nội bộ.

## 6. Các bước triển khai
1. Thiết kế dữ liệu + migration SQL. ✅
2. Seed script đọc Excel → Supabase. ✅ (cần `SUPABASE_SERVICE_ROLE_KEY` để chạy)
3. UI: `/`, `/login`, `/dashboard`, `/orders`, `/products`, `/customers`, `/reports`, `/import`. ✅
4. Form + Drawer + Toast + validation. ✅ (primitives sẵn; refactor form CRUD cũ sang drawer: follow-up)
5. Phân quyền UI theo role. ✅ (nav + `/import` admin-only)
6. Testing: `npm run typecheck` + `npm run build`. ✅
7. Cập nhật tài liệu + `docs/commit_prompt_map.md`. ✅
8. Triển khai: `supabase db push`, `npm run seed`, deploy Next.js. ⏳

## Trạng thái
- ✅ Đọc/ghi trực tiếp Supabase `mealfit_*` qua API routes (service-role server-side) + DataContext
  write-through; fallback localStorage khi offline.
- ✅ Form CRUD món/khách/đơn dùng Drawer/Modal + Toast + ConfirmDialog + validation.
- ✅ Đã seed: 129 products, 32 combos, 4 customers, 2 employees (admin+staff), 3 orders, 5 items.
- ✅ Auth xác thực vào `mealfit_employees` (admin/admin123, nhanvien/staff123).

## Rủi ro / việc còn lại
- Service-role qua API routes vì auth dùng cookie riêng (chưa map Supabase Auth); RLS ghi để service
  role, siết policy theo role là việc sau.
- Mật khẩu nhân viên plain text (bootstrap) — hash khi đưa public.
- Cookie phiên base64 chưa ký — đủ nội bộ, nâng cấp khi public.
