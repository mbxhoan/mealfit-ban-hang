"use client";

import React, { useState } from "react";
import { Printer, Clipboard, Save } from "lucide-react";
import { Order } from "../../data/mealPrepData";
import { uploadInvoiceToDrive } from "../../services/googleDriveService";
import { useToast } from "@/components/ui/Toast";
import { formatBillVND, getZaloConfirmationText, printInvoice, renderHTMLInvoice } from "./invoice";

type DriveStatus = { status: "idle" | "loading" | "success" | "error"; msg: string };

/**
 * Bill actions (print · Google Drive · Zalo template) + a mini invoice preview.
 * Shared by the desktop bill modal and the mobile "Ra bill" sheet.
 */
export function OrderBillView({ order }: { order: Order }) {
  const toast = useToast();
  const [drive, setDrive] = useState<DriveStatus>({ status: "idle", msg: "" });

  const handleCopyConfirmation = () => {
    navigator.clipboard.writeText(getZaloConfirmationText(order));
    toast.success("Đã sao chép mẫu tin nhắn xác nhận đơn (Zalo/SMS)!");
  };

  const handleSaveToGoogleDrive = async () => {
    setDrive({ status: "loading", msg: "Đang tiến hành kết nối & đăng hóa đơn lên Google Drive..." });
    const htmlContent = renderHTMLInvoice(order);
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Left: actions */}
      <div className="space-y-4">
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl space-y-3">
          <h4 className="font-bold text-indigo-900 text-xs">Phát hành hóa đơn / Ra Bill</h4>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Bạn có thể in hóa đơn bán hàng để đính kèm lên hộp cơm MealPrep, hoặc tự động xuất lưu trữ lên Google Drive.
          </p>
          <div className="flex flex-col gap-2">
            <button
              id="btn-trigger-print-win"
              onClick={() => printInvoice(order)}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-3 rounded-lg shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              In hóa đơn bán hàng (A4/A5)
            </button>
            <button
              id="btn-trigger-drive-save"
              onClick={handleSaveToGoogleDrive}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-lg shadow-sm cursor-pointer"
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

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-700 text-xs">Mẫu tin nhắn gửi khách hàng</h4>
            <button
              id="btn-copy-template-text"
              type="button"
              onClick={handleCopyConfirmation}
              className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold hover:text-indigo-800"
            >
              <Clipboard className="w-3.5 h-3.5" />
              Sao chép mẫu
            </button>
          </div>
          <textarea
            readOnly
            value={getZaloConfirmationText(order)}
            className="w-full h-36 border border-slate-200 rounded-lg p-2.5 outline-none font-mono text-[10px] text-slate-600 bg-white"
          />
        </div>
      </div>

      {/* Right: mini bill */}
      <div className="bg-slate-100 p-4 rounded-xl border border-dashed border-slate-300 max-h-[60vh] overflow-y-auto">
        <div className="bg-white p-4 shadow-sm space-y-4 text-[11px] text-slate-800 font-sans text-left">
          <div className="text-center font-bold text-slate-900 border-b pb-2">
            <h5 className="text-sm font-bold text-emerald-600 uppercase">MEALPREP HEALTHY</h5>
            <p className="text-[9px] text-slate-400">Suất Ăn Lành Mạnh • Tinh Tế</p>
            <p className="text-[9px] text-slate-500 font-mono mt-1">Mã đơn: {order.orderNumber}</p>
          </div>

          <div className="space-y-1">
            <div><strong>Họ tên:</strong> {order.customerName}</div>
            <div><strong>SĐT:</strong> {order.customerPhone}</div>
            <div className="truncate"><strong>Địa chỉ:</strong> {order.customerAddress}</div>
            <div><strong>Giao ngày:</strong> {order.deliveryDate}</div>
          </div>

          <div className="border-t border-b py-2 space-y-1.5 text-[10px]">
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between items-start">
                <span>{it.quantity} x {it.mealName} ({it.weight})</span>
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
            <div className="flex justify-between border-t border-double pt-1.5 text-slate-900 font-bold">
              <span>TỔNG CỘNG:</span>
              <span className="font-mono text-emerald-600 text-xs">{formatBillVND(order.totalAmount + order.deliveryFee)}</span>
            </div>
            <div className="text-slate-400 font-normal text-[9px] text-center mt-3">
              Hình thức: {order.paymentMethod} ({order.paymentStatus})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
