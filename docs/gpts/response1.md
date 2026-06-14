Dưới đây là các tài liệu và mã nguồn cần thiết để triển khai hoàn chỉnh ứng dụng MealFit như bạn yêu cầu. Mỗi tài liệu/mã nguồn đều được trích xuất từ file gốc để bạn dễ dàng tải về và sử dụng.

### 1. Prompt cho MealFit

Tài liệu này định nghĩa hành vi và phạm vi kiến thức cho trợ lý MealFit. Nó mô tả cách trả lời câu hỏi về món ăn, combo, giá vốn, giá bán, lợi nhuận, đơn hàng và báo cáo. Prompt sử dụng ngôn ngữ thân thiện, chuyên nghiệp, kèm hướng dẫn định dạng số, trích dẫn và an toàn dữ liệu. Đây là nội dung dùng làm “system prompt” cho chatbot của MealFit.
👉 Xem chi tiết: {{file:file-3MXDw8tHGfFrEFonWJvt92}}

### 2. Kế hoạch triển khai MealFit

Tài liệu này liệt kê mục tiêu, mô hình dữ liệu, quy trình seed dữ liệu, yêu cầu UI/UX, phân quyền và lộ trình triển khai từng bước cho ứng dụng MealFit. Bạn có thể dùng để quản lý dự án hoặc phân chia công việc cho đội ngũ.
👉 Xem chi tiết: {{file:file-JGXXt4XdnNBjXH3QYPdVoM}}

### 3. Migration SQL

File SQL tạo các bảng mới (`mealfit_products`, `mealfit_combos`, `mealfit_customers`, `mealfit_orders`, …) trong Supabase phục vụ MealFit. Đây là bước đầu để định nghĩa schema dữ liệu, bạn chỉ cần chạy `supabase db push` sau khi thêm migration vào dự án.
👉 Tải file SQL: {{file:file-SffTg7KBGaLBKgp7Q2ZZL1}}

### 4. Script seed dữ liệu

Script TypeScript dùng Node.js để đọc file Excel của MealFit và import dữ liệu vào Supabase. Script xử lý:

* đọc sheet `Bang_gia` và tạo sản phẩm theo từng trọng lượng,
* tạo combo và map thành phần từ `Combo_tong_hop` + `Combo_chi_tiet`,
* tạo khách hàng từ `Khach_hang`,
* tạo nhân viên mẫu từ `Nhân_viên`.
  Bạn cần cài `xlsx`, `@supabase/supabase-js` và thiết lập các biến môi trường trước khi chạy.
  👉 Xem code: {{file:file-4iJWVV5k7ZQiz81JrXFUHe}}

### 5. Phụ lục hướng dẫn cho Agents

Tài liệu này bổ sung các nguyên tắc cho agent khi làm việc với MealFit: cách viết migration, seed dữ liệu idempotent, quy tắc UI/UX, phân quyền và cập nhật tài liệu. Nó nên được đọc cùng với `AGENTS.md` hiện có để đảm bảo tuân thủ quy trình dự án.
👉 Xem chi tiết: {{file:file-SjC3qKXFx3JDUzVrcNPNxL}}

### 6. Phụ lục hướng dẫn cho Claude

Tài liệu bổ sung cho `CLAUDE.md` mô tả cách lập báo cáo khi làm việc với MealFit, tiêu chuẩn commit (scope `mealfit`), hướng dẫn cập nhật user guide và nhánh phát triển.
👉 Xem chi tiết: {{file:file-4vXiSNNuzzHVPTLXF1CEkr}}

### 7. Entry mẫu cho commit_prompt_map

Đây là entry mẫu để bạn thêm vào `docs/commit_prompt_map.md` khi tạo commit giới thiệu MealFit. Nó ghi lại tóm tắt prompt, phạm vi, file chính đã sửa, lệnh test và commit message chuẩn.
👉 Xem entry mẫu: {{file:file-HzzwXXC7f6xzx7kNmEDLXp}}

---

Bạn có thể tải xuống các file trên, thêm vào dự án của mình và tùy chỉnh theo nhu cầu. Các file migration và seed cần được chạy trong môi trường Supabase/Node để tạo bảng và nạp dữ liệu. Nếu cần hỗ trợ thêm trong quá trình triển khai hoặc mở rộng tính năng (như import đơn hàng, xây UI chi tiết), hãy cho tôi biết!
