import { Order } from "../../data/mealPrepData";
import { buildVietQrImageUrl, formatPaymentAccountLabel, getPaymentNote, normalizeVietQrAccount, type VietQrAccount } from "@/lib/vietqr";

/** Currency formatter used on printed bills / Zalo messages (keeps the ₫ symbol). */
export const formatBillVND = (num: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function paymentBlock(order: Order, account: VietQrAccount | null): string {
  const amount = order.totalAmount + order.deliveryFee;
  const paymentNote = getPaymentNote(order.orderNumber);
  if (!account) {
    return `
      <div class="payment-card empty">
        <div class="payment-title">Thông tin thanh toán</div>
        <div class="payment-muted">Chưa cấu hình tài khoản nhận tiền mặc định. Vui lòng vào Cài đặt để thêm VietQR.</div>
      </div>
    `;
  }
  const qrUrl = buildVietQrImageUrl(account, amount, paymentNote);
  return `
    <div class="payment-card">
      <div class="payment-title">Thông tin thanh toán</div>
      <div class="payment-bank">${escapeHtml(account.bankName)}</div>
      <div class="payment-line">Tên người nhận: ${escapeHtml(account.accountName)}</div>
      <div class="payment-line">Số tài khoản: ${escapeHtml(account.accountNumber)}</div>
      ${account.acqId ? `<div class="payment-line">Mã QR thanh toán: ${escapeHtml(account.acqId)}</div>` : ''}
      <div class="payment-qrwrap">
        <img class="payment-qr" src="${escapeHtml(qrUrl)}" alt="VietQR thanh toán" />
      </div>
      <div class="payment-note">Số tiền: ${formatBillVND(amount)}</div>
      <div class="payment-note">Nội dung CK: ${escapeHtml(paymentNote)}</div>
      <div class="payment-note">Ngân hàng: ${escapeHtml(formatPaymentAccountLabel(account))}</div>
    </div>
  `;
}

/** Auto-generated confirmation message suitable for Zalo / SMS. */
export function getZaloConfirmationText(order: Order, settings: Record<string, string> = {}): string {
  const account = normalizeVietQrAccount(settings);
  const amount = order.totalAmount + order.deliveryFee;
  const paymentNotice =
    order.paymentMethod === "Chuyển khoản" && account
      ? `🔹 Thanh toán qua chuyển khoản: ${account.bankName} - STK: ${account.accountNumber} - Tên: ${account.accountName} - Nội dung CK: ${getPaymentNote(order.orderNumber)} - Tổng tiền: ${formatBillVND(amount)}`
      : order.paymentMethod === "Chuyển khoản"
        ? `🔹 Khách hàng chọn chuyển khoản. Vui lòng cấu hình tài khoản nhận tiền mặc định trong mục Cài đặt.`
        : `🔹 Khách hàng lựa chọn thanh toán COD khi nhận hàng.`;

  const itemsText = order.items
    .map((it) => `- ${it.mealName} (${it.weight}): x${it.quantity} suất`)
    .join("\n");
  return `MealFitVN - XÁC NHẬN ĐƠN HÀNG 💚\n\nKính chào anh/chị ${order.customerName},\nChúng tôi xin xác nhận đơn hàng thành công với thông tin chi tiết dưới đây:\n\n📌 Mã đơn hàng: ${order.orderNumber}\n📅 Ngày dự kiến giao: ${order.deliveryDate}\n📍 Địa chỉ giao: ${order.customerAddress}\n📞 Số điện thoại: ${order.customerPhone}\n\n🛒 Chi tiết phần ăn:\n${itemsText}\n\n💵 Chi tiết thanh toán:\n- Tổng tiền phần ăn: ${formatBillVND(order.totalAmount)}\n- Phí giao hàng: ${formatBillVND(order.deliveryFee)}\n- Tổng cộng thanh toán: ${formatBillVND(amount)}\n\n${paymentNotice}\n\nXin cảm ơn quý khách đã tin dùng MealFit và chúc quý khách ăn ngon miệng, khỏe mạnh!`;
}

/** Clean printable HTML invoice. */
export function renderHTMLInvoice(order: Order, settings: Record<string, string> = {}): string {
  const account = normalizeVietQrAccount(settings);
  const amount = order.totalAmount + order.deliveryFee;
  const itemsRows = order.items
    .map(
      (it, i) => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: left;">${i + 1}. ${escapeHtml(it.mealName)} (${escapeHtml(it.weight)})</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${it.quantity}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatBillVND(it.price)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${formatBillVND(it.price * it.quantity)}</td>
      </tr>
    `,
    )
    .join("");

  const qrArea = paymentBlock(order, account);

  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hóa đơn ${order.orderNumber}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; font-family: Arial, sans-serif; background: #ffffff; color: #111827; }
          .sheet { width: 100%; max-width: 1180px; margin: 0 auto; padding: 18px; }
          .header { display: flex; align-items: stretch; border: 1px solid #86a86d; background: #dfeecf; }
          .header-main { flex: 1; text-align: center; padding: 18px 16px 14px; border-right: 1px solid #86a86d; }
          .header-title { font-size: 32px; font-weight: 800; letter-spacing: 0.4px; line-height: 1.05; }
          .header-sub { margin-top: 2px; font-size: 14px; font-weight: 700; color: #1f2937; }
          .header-side { width: 280px; padding: 18px 16px; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 20px; font-weight: 800; }
          .layout { display: grid; grid-template-columns: minmax(0, 1.45fr) 300px; gap: 0; border-left: 1px solid #111; border-right: 1px solid #111; border-bottom: 1px solid #111; }
          .left { border-right: 1px solid #111; background: #f8fafc; }
          .section { border-bottom: 1px solid #111; }
          .meta-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 13px; }
          .meta-table td, .meta-table th { border: 1px solid #111; padding: 4px 6px; }
          .meta-table th { background: #dfeecf; text-align: center; font-weight: 800; }
          .label { background: #dfeecf; font-weight: 700; width: 115px; }
          .value { background: #f4f4f4; font-weight: 700; }
          .wide-value { background: #f4f4f4; font-style: italic; font-weight: 700; text-align: center; }
          .items { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 13px; }
          .items th, .items td { border: 1px solid #111; padding: 5px 6px; }
          .items th { background: #f4f4f4; font-weight: 800; text-align: center; }
          .summary { padding: 10px 12px; display: grid; gap: 4px; font-size: 13px; }
          .summary-row { display: flex; justify-content: space-between; gap: 12px; }
          .summary-row strong { font-size: 15px; }
          .notes { border-top: 1px solid #111; padding: 10px 12px; font-size: 12px; background: #f8fafc; }
          .right { padding: 14px 12px; }
          .payment-card { border: 1px solid #cbd5e1; border-radius: 16px; padding: 14px 12px; background: #ffffff; text-align: center; }
          .payment-card.empty { color: #6b7280; }
          .payment-title { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
          .payment-bank { font-size: 17px; font-weight: 800; margin-bottom: 4px; }
          .payment-line { font-size: 12px; font-weight: 700; color: #334155; margin-top: 2px; }
          .payment-qrwrap { margin: 14px auto 10px; padding: 10px 8px 8px; border-radius: 16px; background: #fff; }
          .payment-qr { width: 230px; max-width: 100%; display: block; margin: 0 auto; border: 1px solid #cbd5e1; background: #fff; }
          .payment-note { margin-top: 6px; font-size: 12px; color: #334155; font-weight: 700; }
          .payment-muted { font-size: 12px; line-height: 1.45; color: #64748b; }
          .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 12px; padding-top: 10px; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .sheet { padding: 0; max-width: none; }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
        <div class="header">
          <div class="header-main">
            <div class="header-title">HOÁ ĐƠN</div>
            <div class="header-title">(MealFitVN)</div>
          </div>
          <div class="header-side">Thông tin thanh toán</div>
        </div>

        <div class="layout">
          <div class="left">
            <table class="meta-table">
              <tr>
                <td class="label">Mã đơn</td>
                <td class="value" style="width: 260px; text-align:center;">${escapeHtml(order.orderNumber)}</td>
                <td class="label">Tên KH (tùy chọn)</td>
                <td class="value"></td>
              </tr>
              <tr>
                <td class="label">Khách theo đơn</td>
                <td class="value">${escapeHtml(order.customerName)}</td>
                <td class="label">Ngày</td>
                <td class="value" style="text-align:center;">${escapeHtml(order.deliveryDate)}</td>
              </tr>
              <tr>
                <td class="label">NV giới thiệu</td>
                <td class="value">Khách page</td>
                <td class="label">Trạng thái đơn</td>
                <td class="value" style="text-align:center;">${escapeHtml(order.status)}</td>
              </tr>
              <tr>
                <td class="label">SĐT</td>
                <td class="value">${escapeHtml(order.customerPhone)}</td>
                <td class="label">Tiền hàng</td>
                <td class="value" style="text-align:right;">${formatBillVND(order.totalAmount)}</td>
              </tr>
              <tr>
                <td class="label">TT thanh toán</td>
                <td class="value">${escapeHtml(order.paymentStatus)}</td>
                <td class="label">Giảm 5%</td>
                <td class="value" style="text-align:right;">0</td>
              </tr>
              <tr>
                <td class="label">TT giao hàng</td>
                <td class="value">${escapeHtml(order.paymentMethod)}</td>
                <td class="label">Tổng thanh toán</td>
                <td class="value" style="text-align:right;">${formatBillVND(amount)}</td>
              </tr>
              <tr>
                <td class="label">Đã thanh toán</td>
                <td class="value" style="text-align:center;">${order.paymentStatus === 'Đã thanh toán' ? formatBillVND(amount) : '0'}</td>
                <td class="label">Phí ship</td>
                <td class="value" style="text-align:right;">${formatBillVND(order.deliveryFee)}</td>
              </tr>
              <tr>
                <td class="label">Địa chỉ</td>
                <td class="wide-value" colspan="3">${escapeHtml(order.customerAddress || '')}</td>
              </tr>
            </table>

            <table class="items">
              <thead>
                <tr>
                  <th style="width: 42%;">Món</th>
                  <th style="width: 14%;">Trọng lượng</th>
                  <th style="width: 8%;">SL</th>
                  <th style="width: 18%;">Đơn giá</th>
                  <th style="width: 18%;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row"><span>Tổng tiền món:</span><strong>${formatBillVND(order.totalAmount)}</strong></div>
              <div class="summary-row"><span>Phí ship:</span><strong>${formatBillVND(order.deliveryFee)}</strong></div>
              <div class="summary-row"><span>TỔNG THANH TOÁN:</span><strong>${formatBillVND(amount)}</strong></div>
            </div>

            <div class="notes">
              <strong>Ghi chú:</strong> ${escapeHtml(order.notes || 'Khách không có ghi chú thêm.')}
            </div>
          </div>

          <div class="right">
            ${qrArea}
          </div>
        </div>

        <div class="footer">
          MealFitVN - Hóa đơn và mã thanh toán VietQR tự động theo tài khoản mặc định
        </div>
        </div>
      </body>
      </html>
    `;
}

/** Open a print window for the order's invoice. */
export function printInvoice(order: Order, settings: Record<string, string> = {}) {
  const html = renderHTMLInvoice(order, settings);
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
