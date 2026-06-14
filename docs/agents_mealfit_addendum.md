# MealFit guidelines for agents

Phụ lục cho `AGENTS.md` (không thay thế). Đọc cả hai khi làm việc với MealFit.

## Mô hình dữ liệu
- Tạo bảng MealFit qua migration trong `supabase/migrations/` với timestamp phù hợp
  (`20260613160000_mealfit.sql`).
- Không sửa migration cũ; thêm migration mới cho mọi thay đổi schema.

## Seed dữ liệu
- Script tại `scripts/seed/mealfit.ts` đọc Excel và chèn vào các bảng `mealfit_*`.
- Phải **idempotent**: `upsert` theo `code`.

## UI/UX
- Tuân thủ `docs/mealfit_plan.md` §4: typography (`"Avenir Next", "Segoe UI", sans-serif`), kích
  thước chữ, responsive mobile/tablet/desktop.
- Mọi form CRUD nên dùng `Drawer` + `Toast` (trượt phải, ESC/overlay đóng; toast góc phải ẩn 4s).
- Thêm loading khi chuyển trang / submit form.
- Không để UI tràn ngang hoặc vỡ bố cục.

## Phân quyền
- Kiểm tra `role` (`admin`/`staff`) trước khi cho sửa/xóa. Nhân viên chỉ tạo đơn + xem món.
- Xác thực vào `mealfit_employees`; fallback tài khoản seed khi offline.

## Tài liệu & commit
- Cập nhật `docs/mealfit_plan.md` và `docs/mealfit_prompt.md` khi schema/logic đổi.
- Thêm entry vào `docs/commit_prompt_map.md`: prompt/user request, scope, file chính, lệnh test,
  commit message dạng `<type>(mealfit): <summary>`.
