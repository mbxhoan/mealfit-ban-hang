"use client";

import React, { useState } from "react";
import { Printer, Clipboard, Save, CreditCard } from "lucide-react";
import { Order } from "../../data/mealPrepData";
import { uploadInvoiceToDrive } from "../../services/googleDriveService";
import { useToast } from "@/components/ui/Toast";
import { useData } from "@/contexts/DataContext";
import { buildVietQrImageUrl, formatPaymentAccountLabel, getPaymentNote, normalizeVietQrAccount } from "@/lib/vietqr";
import { formatBillVND, getZaloConfirmationText, printInvoice, renderHTMLInvoice } from "./invoice";

type DriveStatus = { status: "idle" | "loading" | "success" | "error"; msg: string };

/**
 * Bill actions (print · Google Drive · Zalo template) + a mini invoice preview.
 * Shared by the desktop bill modal and the mobile "Ra bill" sheet.
 */
export function OrderBillView({ order }: { order: Order }) {
  const toast = useToast();
  const { settings } = useData();
  const [drive, setDrive] = useState<DriveStatus>({ status: "idle", msg: "" });
  const paymentAccount = normalizeVietQrAccount(settings);
  const amount = order.totalAmount + order.deliveryFee;
  const qrUrl = paymentAccount ? buildVietQrImageUrl(paymentAccount, amount, getPaymentNote(order.orderNumber)) : "";

  const handleCopyConfirmation = () => {
    navigator.clipboard.writeText(getZaloConfirmationText(order, settings));
    toast.success("Đã sao chép mẫu tin nhắn xác nhận đơn (Zalo/SMS)!");
  };

  const handleSaveToGoogleDrive = async () => {
    setDrive({ status: "loading", msg: "Đang tiến hành kết nối & đăng hóa đơn lên Google Drive..." });
    const htmlContent = renderHTMLInvoice(order, settings);
    const fileName = `MealPrep_Invoice_${order.orderNumber}_${order.customerName.replace(/\s+/g, "_")}.html`;
    const result = await uploadInvoiceToDrive(fileName, htmlContent);
    if (result.success) {
      setDrive({ status: "success", msg: `Lưu hóa đơn ${order.orderNumber} vào Google Drive thành công!` });
      toast.success(`Đã xuất hóa đơn ${order.orderNumber} lên Google Drive!`);
    } else {
      setDrive({ status: "error", msg: `Lỗi: ${result.error || "Không thể thực hiện tác vụ"}` });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1.05fr]">
      {/* Left: actions */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-brand-600" />
            <h4 className="font-bold text-slate-900 text-sm">Phát hành hóa đơn / Ra bill</h4>
          </div>
          <p className="text-slate-600 text-[12px] leading-relaxed">
            In hóa đơn A4/A5 có sẵn mã VietQR để gửi khách, hoặc xuất HTML lưu trữ lên Google Drive.
          </p>
          <div className="flex flex-col gap-2">
            <button
              id="btn-trigger-print-win"
              onClick={() => printInvoice(order, settings)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              In hóa đơn bán hàng (A4/A5)
            </button>
            <button
              id="btn-trigger-drive-save"
              onClick={handleSaveToGoogleDrive}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Tải lên Google Drive
            </button>
          </div>
        </div>

        {drive.status !== "idle" && (
          <div
            className={`p-3 rounded-xl border text-[11px] font-medium ${
              drive.status === "loading"
                ? "bg-amber-50 border-amber-200 text-amber-800 animate-pulse"
                : drive.status === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {drive.msg}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-700 text-sm">Mẫu tin nhắn gửi khách hàng</h4>
            <button
              id="btn-copy-template-text"
              type="button"
              onClick={handleCopyConfirmation}
              className="flex items-center gap-1 text-[11px] text-brand-600 font-bold hover:text-brand-700"
            >
              <Clipboard className="w-3.5 h-3.5" />
              Sao chép mẫu
            </button>
          </div>
          <textarea
            readOnly
            value={getZaloConfirmationText(order, settings)}
            className="w-full h-40 rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none font-mono text-[10px] text-slate-600"
          />
        </div>
      </div>

      {/* Right: mini bill */}
      <div className="max-h-[68vh] overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-3">
        <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm text-left text-[12px] text-slate-800">
          <div className="border-b border-slate-200 pb-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-400">MealFitVN</div>
            <h5 className="mt-1 text-xl font-black tracking-tight text-slate-900">HOÁ ĐƠN</h5>
            <p className="text-sm font-semibold text-slate-700">(MealFitVN)</p>
            <p className="mt-1 text-[10px] font-mono text-slate-500">Mã đơn: {order.orderNumber}</p>
          </div>

          <div className="grid grid-cols-[1fr_1fr] gap-x-3 gap-y-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[11px] font-semibold text-slate-700">
            <div>Mã đơn</div>
            <div className="text-right text-slate-900">{order.orderNumber}</div>
            <div>Khách theo đơn</div>
            <div className="text-right text-slate-900">{order.customerName || '---'}</div>
            <div>SĐT</div>
            <div className="text-right text-slate-900">{order.customerPhone || '---'}</div>
            <div>Ngày giao</div>
            <div className="text-right text-slate-900">{order.deliveryDate}</div>
            <div>TT thanh toán</div>
            <div className="text-right text-slate-900">{order.paymentStatus}</div>
            <div>Phí ship</div>
            <div className="text-right text-slate-900">{formatBillVND(order.deliveryFee)}</div>
          </div>

          <div className="space-y-1.5 rounded-2xl border border-slate-200 p-3 text-[11px]">
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between items-start">
                <span className="pr-3">{it.quantity} x {it.mealName} ({it.weight})</span>
                <span className="font-mono">{formatBillVND(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1 font-semibold text-slate-700">
            <div className="flex justify-between">
              <span>Cộng tiền cơm:</span>
              <span className="font-mono">{formatBillVND(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí giao nhận:</span>
              <span className="font-mono">{formatBillVND(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-dashed pt-2 text-slate-900 font-extrabold">
              <span>TỔNG CỘNG:</span>
              <span className="font-mono text-emerald-600 text-base">{formatBillVND(amount)}</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 text-center">
            <div className="text-lg font-black text-slate-900">Thông tin thanh toán</div>
            {paymentAccount ? (
              <>
                <div className="mt-2 text-sm font-bold text-slate-800">{paymentAccount.bankName}</div>
                <div className="text-[11px] font-semibold text-slate-600">Tên người nhận: {paymentAccount.accountName}</div>
                <div className="text-[11px] font-semibold text-slate-600">Số tài khoản: {paymentAccount.accountNumber}</div>
                {paymentAccount.acqId && <div className="text-[11px] font-semibold text-slate-600">Mã QR thanh toán: {paymentAccount.acqId}</div>}
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                  <img
                    src={qrUrl}
                    alt="VietQR thanh toán"
                    className="mx-auto max-h-[260px] w-full max-w-[320px] rounded-lg border border-slate-200 object-contain"
                  />
                </div>
                <div className="mt-3 space-y-1 text-[11px] font-semibold text-slate-600">
                  <div>Số tiền: {formatBillVND(amount)}</div>
                  <div>Nội dung CK: {getPaymentNote(order.orderNumber)}</div>
                  <div>Ngân hàng: {formatPaymentAccountLabel(paymentAccount)}</div>
                </div>
              </>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                Chưa có tài khoản nhận tiền mặc định. Vào <strong>Cài đặt</strong> để thêm VietQR.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
