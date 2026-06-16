todo

- [x] tổng hợp đi chợ
- [x] sidebar
- [x] chọn vào đơn hàng ra tổng số tiền, bao nhiêu đơn chưa thanh toán/đã thanh toán, bao nhiêu đơn chưa giao/đã giao, tổng món 
- [x] in bảng tổng hợp đi chợ ra A4.
- [x] dòng tổng cộng đi chợ phải ở trên đầu.
- [x] in bảng tổng hợp đơn theo khách ra A4: nên break page hợp lý tránh trường hợp đơn hàng của khách A, 1 phần nằm ở trang trước, phần còn lại nằm ở trang sau. Vì tổng hợp đơn này là mục đích cho nhân viên soạn món ăn để giao cho khách nên cần chính xác, rõ ràng dễ hiểu và tránh gây rối khi view trên web và đặc biệt là khi in ra.
- [ ] thêm thống kê thêm số lượng đơn

- [x] video cần có motion nhiều element chuyển động nhiều hơn, thú vị và sinh động hơn thay vì để ảnh cứng như hiện tại
- [x] tham khảo thêm trang "https://hub.rag.delfi.vn" tôi đang làm hiệu ứng nền animation như thế nào
- [x] "Ăn sạch, nhanh, ngon mỗi ngày."
- [x] lên bill trên điện thoại
- [x] trên admin, bộ lọc thống kê và đơn hàng mặc định là theo tuần hiện tại, có cho phép chọn ngày tới ngày hoặc theo tháng hiện tại
- [x] áp dụng select tìm kiếm cho tất cả các nơi có input là select
- [x] [RESPONSIVE] trên giao diện điện thoại cần bổ sung như sau:
1. Có bottom menu nav bar gồm 4 chức năng Đơn hàng, Thực đơn (bao gồm combo luôn), Lên đơn, Thống kê, Báo cáo. Tính năng Lên đơn sẽ được highlight và nằm giữa, tính năng này là tạo đơn hàng cho khách nhanh. Sau khi lên đơn có option ra bill cho khách luôn.
2. Khi bấm "Lên đơn" trên điện thoại thay vì hiển thị popup modal form thì chuyển form ra 1 trang mới, bên dưới bottom navbar bây giờ là nút "Quay lại" và "Lưu", bấm lưu rồi thì nút "Lưu" chuyển thành nút "Ra bill", vì người dùng dùng điện thoại đa số là chỉ để lên đơn, ra bill cho khách nên giao diện cần tối ưu cho người dùng thao tác lên đơn, tối ưu cả về diện tích hiển thị nữa

=== 

giao diện nhìn còn khá cơ bản và khá giống AI làm, chưa có hiệu ứng animation chạy nền, video chưa sinh động lắm cũng không autoplay khi load trang, logo cũng chưa phỉa logo của mealfit, xuống dòng text chưa hợp lý khi mà "Ăn sạch, gọn gàng" bị xuống dòng. Cải thiện thêm về frontend theo hướng sinh động thẩm mỹ mà vẫn chuyên nghiệp tối giản, thu hút: thêm các animation linh động, theo theme food, thực phẩm healthy nhẹ nhàng, thu hút, chuyên nghiệp mà nhìn không trẻ con - con nít, không sến, tối giản, animation chạy nền ở background và các element text cho xịn xò. Có element chạy hay chuyển động ở nền, các hiệu sinh động ứng khi hover, click, scroll, theo theme

===

1. thêm menu "Thống kê", trong đó có 2 tính năng tương ứng 2 tab/phần:
1.a. "tổng hợp đi chợ": tổng hợp tất cả các món, và danh mục đi chợ theo bộ lọc đơn hàng, ví dụ lọc các đơn hàng đã thanh toán, chưa giao hàng thì ra số lượng tổng ức gà, tổng món ức gà cajun 100g, 150g là bao nhiêu,... để dùng cái này đi chợ khi cần (theo ảnh minh hoạ đính kèm hoặc vào sheet Thống kê món trong file excel @). mục đích như sau: tôi lọc từ ngày đến ngày, thì tự động đọc vào chi tiết đơn hàng (món lẻ và cả combo luôn) và thống kê lại các món (thuộc đơn hàng có trạng thái là "Chưa giao hàng") cần chuẩn bị theo doanh mục và món, ví dụ "ức gà tổng là 10 món (1,2kg có 6 món 100g và 4 món 150g) trong đó ức gà gừng tỏi 100g 3, ức gà tiêu chanh 100g 3, ức gà cajun 150g 4". Bảng này phục cho việc thống kê các món chưa làm, chưa giao nhưng đã lên đơn để tôi đi chợ đúng chính xác khối lượng thực phẩm đó.

Ở bảng tổng hợp đi chợ, phải gom nhóm món thuộc combo và món lẻ vào chung danh mục, ví dụ ức gà bbq của combo không được gom vào chung nhóm thuộc danh mục ức gà mà nằm lẻ, dẫn tới khối lượng tổng theo danh mục sẽ không chính xác - phải cộng món của combo nữa, nếu là món thuộc combo hãy thêm ghi chú combo để tôi biết

1.b. "tổng hợp đơn theo khách": với mục tiêu là thống kê đơn hàng ở trạng thái đã đặt hàng nhưng chưa giao của khách, ví dụ:
#1 - Thu Hường - Combo Bulk Fit v5 - Ức gà BBQ 200g x3, Ức gà tiêu chanh 200g x3,...
#2 - Bảo Hân - Món lẻ - Đùi gà cajun 150g x2, Đùi gà ngũ vị 150g x2,… Breakdown chi tiết món, số lượng phần và trọng lượng thành nhiều dòng và cột (mỗi món của khách sẽ là 1 dòng), ví dụ tên khách "Thu Hường" xong là tới 4 cột "Tên món" - "Số túi" (3) - "Trọng lượng" (200) - "Tổng trọng lượng" (số túi x trọng lượng).

Thêm cho tôi tính tổng theo kg của danh mục, ví dụ tổng ức gà là 4.15 kg, tổng cá hồi là 2.45kg