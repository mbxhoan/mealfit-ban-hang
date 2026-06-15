import { Order } from "../../data/mealPrepData";

/** Currency formatter used on printed bills / Zalo messages (keeps the ₫ symbol). */
export const formatBillVND = (num: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);

/** Auto-generated confirmation message suitable for Zalo / SMS. */
export function getZaloConfirmationText(order: Order): string {
  const paymentNotice =
    order.paymentMethod === "Chuyển khoản"
      ? `🔹 Thanh toán qua chuyển khoản: Ngân hàng Techcombank - STK: 190300123456 - Chuyển khoản nội dung: ${order.orderNumber}`
      : `🔹 Khách hàng lựa chọn thanh toán COD khi nhận hàng.`;

  const itemsText = order.items
    .map((it) => `- ${it.mealName} (Hộp ${it.weight}): x${it.quantity} suất`)
    .join("\n");
  return `MealPrep Healthy Food - XÁC NHẬN ĐƠN HÀNG 💚\n\nKính chào anh/chị ${order.customerName},\nChúng tôi xin xác nhận đơn hàng thành công với thông tin chi tiết dưới đây:\n\n📌 Mã đơn hàng: ${order.orderNumber}\n📅 Ngày dự kiến giao: ${order.deliveryDate}\n📍 Địa chỉ giao: ${order.customerAddress}\n📞 Số điện thoại: ${order.customerPhone}\n\n🛒 Chi tiết phần ăn:\n${itemsText}\n\n💵 Chi tiết thanh toán:\n- Tổng tiền phần ăn: ${formatBillVND(order.totalAmount)}\n- Phí giao hàng: ${formatBillVND(order.deliveryFee)}\n- Tổng cộng thanh toán: ${formatBillVND(order.totalAmount + order.deliveryFee)}\n\n${paymentNotice}\n\nXin cảm ơn quý khách đã tin dùng MealPrep và chúc quý khách một tuần ăn uống thật ngon miệng, khỏe mạnh!`;
}

/** Clean printable HTML invoice. */
export function renderHTMLInvoice(order: Order): string {
  const itemsRows = order.items
    .map(
      (it, i) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: left;">${i + 1}. ${it.mealName} (${it.weight})</td>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">${it.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right;">${formatBillVND(it.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold;">${formatBillVND(it.price * it.quantity)}</td>
      </tr>
    `,
    )
    .join("");

  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hóa đơn ${order.orderNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff; color: #1e293b; padding: 30px; line-height: 1.5; }
          .header { text-align: center; border-bottom: 3px double #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; }
          .brand { font-size: 24px; font-weight: bold; color: #10b981; text-transform: uppercase; letter-spacing: 1px; }
          .title { font-size: 18px; margin-top: 5px; color: #64748b; font-weight: bold; }
          .grid { display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 13px; }
          .col { flex: 1; }
          .col-right { text-align: right; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
          .th { background-color: #f8fafc; padding: 10px; font-weight: bold; text-align: left; border-bottom: 2px solid #cbd5e1; }
          .summary { text-align: right; font-size: 13px; margin-top: 15px; }
          .summary-line { padding: 4px 0; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; font-style: italic; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">MealPrep Health Kitchen</div>
          <div class="title">HÓA ĐƠN KHÁCH HÀNG / INVOICE</div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Mã đơn: ${order.orderNumber} | Ngày giao: ${order.deliveryDate}</div>
        </div>

        <div class="grid">
          <div class="col" style="text-align: left;">
            <strong style="color: #475569; font-size: 14px;">KHÁCH HÀNG:</strong><br>
            <strong>Anh/Chị:</strong> ${order.customerName}<br>
            <strong>Điện thoại:</strong> ${order.customerPhone}<br>
            <strong>Địa chỉ:</strong> ${order.customerAddress}
          </div>
          <div class="col col-right" style="text-align: right;">
            <strong style="color: #475569; font-size: 14px;">THÔNG TIN ĐƠN:</strong><br>
            <strong>Hình thức thanh toán:</strong> ${order.paymentMethod}<br>
            <strong>Trạng thái:</strong> <span style="color: ${order.paymentStatus === "Đã thanh toán" ? "#10b981" : "#ef4444"}">${order.paymentStatus}</span><br>
            <strong>Ngày thanh toán:</strong> ${order.paymentStatus === "Đã thanh toán" ? "Đã xác nhận" : "Chờ xác nhận"}
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th class="th" style="text-align: left;">Món ăn / Suất ăn</th>
              <th class="th" style="text-align: center; width: 80px;">SL</th>
              <th class="th" style="text-align: right; width: 110px;">Đơn giá</th>
              <th class="th" style="text-align: right; width: 130px;">Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-line">Tiền phần ăn: <strong>${formatBillVND(order.totalAmount)}</strong></div>
          <div class="summary-line">Phí vận chuyển: <strong>${formatBillVND(order.deliveryFee)}</strong></div>
          <div class="summary-line" style="font-size: 16px; color: #1e293b; padding-top: 5px; margin-top: 5px; border-top: 1px solid #cbd5e1;">Tổng số tiền thanh toán: <strong style="color: #10b981;">${formatBillVND(order.totalAmount + order.deliveryFee)}</strong></div>
        </div>

        <div id="notes-view" style="margin-top: 20px; font-size: 12px; text-align: left; background-color: #f8fafc; border-left: 3px solid #10b981; padding: 10px;">
          <strong>Ghi chú đơn hàng:</strong> ${order.notes || "Khách không có ghi chú thêm."}
        </div>

        <div class="footer">
          Cảm ơn quý khách hàng đã lựa chọn thực đơn lành mạnh từ MealPrep!<br>
          <i>Chúc quý khách luôn ngập tràn năng lượng và duy trì vóc dáng như ý!</i>
        </div>
      </body>
      </html>
    `;
}

/** Open a print window for the order's invoice. */
export function printInvoice(order: Order) {
  const html = renderHTMLInvoice(order);
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  }
}
