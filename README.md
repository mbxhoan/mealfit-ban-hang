# MealFit — Healthy Meal Prep Sales Management

Ứng dụng quản lý bán hàng thực đơn dinh dưỡng MealFit: thực đơn/combo theo trọng lượng (giá vốn, giá
bán, lợi nhuận, tỉ lệ lãi), đơn hàng & chi tiết đơn, khách hàng, báo cáo doanh thu, ra bill — kèm
landing page công khai showcase món ăn.

**Stack**: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase.

## Tính năng
- 🔐 Đăng nhập + phân quyền **admin / nhân viên**, loading screen, hiệu ứng nút.
- 🍱 Quản lý thực đơn & combo, đơn hàng, khách hàng, báo cáo doanh thu/lợi nhuận.
- 📋 **Thống kê** đi chợ & soạn đơn: lọc đơn theo ngày giao + trạng thái (mặc định *chưa giao hàng*),
  tự bung combo thành món con, tổng hợp theo **danh mục → món → trọng lượng** (số gói + kg theo
  danh mục) và breakdown **đơn theo từng khách** (combo / món lẻ).
- 🧩 Drawer (trượt phải, ESC/overlay đóng) + Toast (góc phải, tự ẩn 4s) + validation.
- 📥 Import wizard: tải template, hướng dẫn cột, bảng lỗi (dòng/cột/giá trị/lỗi), chặn import tới khi sạch.
- 🌿 Landing công khai (không cần login), animation nền, branding (favicon/OG/Twitter/apple-icon).
- 📱 Responsive 320–430 / 768–1024 / 1280–1920, không horizontal scroll.

## Chạy local
```bash
npm install
cp .env.example .env.local   # điền Supabase keys (hoặc bỏ qua để chạy offline bằng seed data)
npm run dev                  # http://localhost:3000
```
Tài khoản demo — Admin: `admin`/`admin123` · Nhân viên: `nhanvien`/`staff123`.

## Supabase
```bash
supabase db push             # áp dụng supabase/migrations/20260613160000_mealfit.sql
npm run seed                 # cần SUPABASE_SERVICE_ROLE_KEY + MEALFIT_XLSX_PATH
```
Thiếu `NEXT_PUBLIC_SUPABASE_*` → app tự chạy ở chế độ offline (seed data đóng gói + `localStorage`).

## Cấu trúc
- `app/` routes · `components/ui` primitives · `components/app` + `contexts` shell/state
- `lib/` helpers · `src/components` UI nghiệp vụ · `supabase/migrations`, `scripts/seed`
- `docs/` — prompt, plan, addenda, commit map.

Xem thêm: [docs/mealfit_plan.md](docs/mealfit_plan.md), [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md).
