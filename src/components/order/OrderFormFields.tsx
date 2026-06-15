"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { formatBillVND } from "./invoice";
import type { OrderDraft } from "./useOrderDraft";

/**
 * Presentational order form (customer · items · shipment & billing).
 * State + logic live in the `useOrderDraft` hook passed via `draft`.
 * Shared by the desktop modal and the mobile "Lên đơn" page.
 */
export function OrderFormFields({ draft }: { draft: OrderDraft }) {
  const {
    meals,
    customers,
    newOrderCustomerId,
    tempCustomerName,
    setTempCustomerName,
    tempCustomerPhone,
    setTempCustomerPhone,
    tempCustomerAddress,
    setTempCustomerAddress,
    deliveryFee,
    setDeliveryFee,
    paymentMethod,
    setPaymentMethod,
    paymentStatus,
    setPaymentStatus,
    deliveryDate,
    setDeliveryDate,
    notes,
    setNotes,
    orderItems,
    currentMealId,
    currentWeight,
    setCurrentWeight,
    currentQty,
    setCurrentQty,
    draftTotals,
    handleCustomerSelection,
    handleMealSelectionChange,
    addSubItemToDraft,
    removeSubItemFromDraft,
  } = draft;

  const lockCustomer = newOrderCustomerId !== "" && newOrderCustomerId !== "NEW";

  return (
    <div className="space-y-5">
      {/* Section A: Customer Details */}
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
        <h4 className="font-bold text-xs text-slate-700 tracking-tight border-b pb-1">1. Thông tin Khách hàng</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Chọn hồ sơ khách hàng</label>
            <select
              value={newOrderCustomerId}
              onChange={(e) => handleCustomerSelection(e.target.value)}
              className="w-full text-xs border border-slate-200 focus:border-indigo-500 outline-none bg-white font-semibold text-slate-700 rounded-lg p-2"
            >
              <option value="">-- Tạo mới thông tin khách hàng --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
              ))}
              <option value="NEW">+ Khách hàng vãng lai (Gõ tay)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Họ tên khách hàng *</label>
            <input
              type="text"
              required
              placeholder="Nguyễn Văn A"
              value={tempCustomerName}
              onChange={(e) => setTempCustomerName(e.target.value)}
              disabled={lockCustomer}
              className="w-full text-xs border border-slate-200 focus:border-indigo-500 rounded-lg p-2 bg-white text-slate-800 outline-none disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Số điện thoại *</label>
            <input
              type="text"
              required
              placeholder="0912..."
              value={tempCustomerPhone}
              onChange={(e) => setTempCustomerPhone(e.target.value)}
              disabled={lockCustomer}
              className="w-full text-xs border border-slate-200 focus:border-indigo-500 rounded-lg p-2 bg-white text-slate-800 outline-none disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Địa chỉ giao hàng *</label>
            <input
              type="text"
              required
              placeholder="123 Nguyễn Huệ, Quận 1"
              value={tempCustomerAddress}
              onChange={(e) => setTempCustomerAddress(e.target.value)}
              disabled={lockCustomer}
              className="w-full text-xs border border-slate-200 focus:border-indigo-500 rounded-lg p-2 bg-white text-slate-800 outline-none disabled:bg-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Section B: Choose Meals */}
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
        <h4 className="font-bold text-xs text-slate-700 tracking-tight border-b pb-1">2. Chọn món cơm MealPrep & Bảng giá</h4>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end bg-white p-3 border border-slate-100 rounded-lg">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 mb-1">Tên món</label>
            <select
              value={currentMealId}
              onChange={(e) => handleMealSelectionChange(e.target.value)}
              className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none font-semibold text-slate-700"
            >
              <option value="">-- Tìm chọn suất cơm --</option>
              {meals.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.category} - {m.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">Đóng gói</label>
            <select
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none font-bold text-slate-700"
            >
              <option value="">-- Trọng lượng --</option>
              {currentMealId &&
                meals.find((m) => m.id === currentMealId)?.options.map((opt) => (
                  <option key={opt.weight} value={opt.weight}>
                    {opt.weight} ({formatBillVND(opt.price).replace("₫", "")})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="w-16">
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Số lượng</label>
              <input
                type="number"
                min="1"
                value={currentQty}
                onChange={(e) => setCurrentQty(Math.max(1, Number(e.target.value)))}
                className="w-full text-xs border border-slate-200 p-1.5 rounded-lg text-center font-bold text-slate-700 outline-none"
              />
            </div>
            <button
              type="button"
              id="btn-add-line-item"
              onClick={addSubItemToDraft}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 px-3 rounded-lg text-xs shrink-0 self-end cursor-pointer"
            >
              Thêm
            </button>
          </div>
        </div>

        {/* Sub-items table */}
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-100">
              <tr>
                <th className="p-2 border-r">Tên Suất ăn</th>
                <th className="p-2 border-r text-center">Đóng gói</th>
                <th className="p-2 border-r text-center">SL</th>
                <th className="p-2 border-r text-right">Đơn giá</th>
                <th className="p-2 border-r text-right">Thành tiền</th>
                <th className="p-2 text-center" style={{ width: "60px" }}>Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orderItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400 font-medium">
                    Chưa có phần cơm nào được đưa vào giỏ hàng của đơn.
                  </td>
                </tr>
              ) : (
                orderItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-slate-800">{item.mealName}</td>
                    <td className="p-2.5 text-center font-bold text-slate-500">{item.weight}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-slate-800">{item.quantity}</td>
                    <td className="p-2.5 text-right text-slate-600">{formatBillVND(item.price)}</td>
                    <td className="p-2.5 text-right font-bold text-slate-800">{formatBillVND(item.price * item.quantity)}</td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeSubItemFromDraft(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {orderItems.length > 0 && (
          <div className="flex justify-end p-2 bg-white rounded-lg border border-slate-100 text-xs text-slate-700">
            <div>
              Cộng tiền món ăn: <strong className="text-indigo-700 text-sm font-bold">{formatBillVND(draftTotals.priceSum)}</strong>
              <span className="text-emerald-600 font-semibold ml-3">(Lãi dự chi: {formatBillVND(draftTotals.profitSum)})</span>
            </div>
          </div>
        )}
      </div>

      {/* Section C: Shipment & Billing */}
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
        <h4 className="font-bold text-xs text-slate-700 tracking-tight border-b pb-1">3. Cấu hình vận chuyển & Thanh toán</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Ngày giao cơm hàng tuần</label>
            <input
              type="date"
              required
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none font-semibold text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Phí giao hàng (VND)</label>
            <input
              type="number"
              min="0"
              step="5000"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(Number(e.target.value))}
              className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none font-bold text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Hình thức thanh toán</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
              className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none font-bold text-slate-700"
            >
              <option value="Chuyển khoản">Chuyển khoản</option>
              <option value="COD">Thu tiền mặt (COD)</option>
              <option value="Tiền mặt">Tiền mặt tại quầy</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Trạng thái thanh toán của khách</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as typeof paymentStatus)}
              className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none font-bold text-slate-700"
            >
              <option value="Chưa thanh toán">Chờ thanh toán (Chưa trả)</option>
              <option value="Đã thanh toán">Đã hoàn tất thanh toán</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Ghi chú chuẩn bị (như không hành tây, cay...)</label>
            <input
              type="text"
              placeholder="Ghi chú sở thích của khách hàng về gia vị, nguyên liệu..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none text-slate-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
