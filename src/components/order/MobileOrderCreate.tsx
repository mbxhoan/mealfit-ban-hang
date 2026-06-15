"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, FileText, Plus, X, ShoppingBag } from "lucide-react";
import { Order } from "../../data/mealPrepData";
import { useOrderDraft } from "./useOrderDraft";
import { OrderFormFields } from "./OrderFormFields";
import { OrderBillView } from "./OrderBillView";
import { formatBillVND } from "./invoice";

/**
 * Mobile-optimised "Lên đơn" screen: full page instead of a modal.
 * Sticky bottom bar shows Quay lại + Lưu; after saving, Lưu becomes Ra bill.
 */
export function MobileOrderCreate() {
  const router = useRouter();
  const draft = useOrderDraft();
  const [savedOrder, setSavedOrder] = useState<Order | null>(null);
  const [showBill, setShowBill] = useState(false);

  const handleSave = async () => {
    const order = await draft.save();
    if (order) setSavedOrder(order);
  };

  const startNewOrder = () => {
    draft.reset();
    setSavedOrder(null);
    setShowBill(false);
  };

  const grandTotal = draft.draftTotals.priceSum + Number(draft.deliveryFee || 0);

  return (
    <div className="pb-28">
      {/* Page header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => router.push("/orders")}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <ShoppingBag className="h-5 w-5 text-indigo-600" />
        <h2 className="text-sm font-bold text-slate-800">Lên đơn nhanh</h2>
        {savedOrder && (
          <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
            Đã lưu · {savedOrder.orderNumber}
          </span>
        )}
      </div>

      <OrderFormFields draft={draft} />

      {/* Sticky bottom action bar (replaces the global bottom nav on this screen) */}
      <div className="app-shell-print-hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase text-slate-400">Tổng cộng</div>
            <div className="truncate text-sm font-bold text-indigo-700">{formatBillVND(grandTotal)}</div>
          </div>

          {savedOrder ? (
            <>
              <button
                onClick={startNewOrder}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                Đơn mới
              </button>
              <button
                onClick={() => setShowBill(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                <FileText className="h-4 w-4" />
                Ra bill
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/orders")}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Quay lại
              </button>
              <button
                onClick={handleSave}
                disabled={draft.submitting}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {draft.submitting ? "Đang lưu…" : "Lưu"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Full-screen bill sheet */}
      {showBill && savedOrder && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Xuất hóa đơn · {savedOrder.orderNumber}</h3>
            </div>
            <button onClick={() => setShowBill(false)} className="rounded-full p-1 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <OrderBillView order={savedOrder} />
          </div>

          <div className="flex gap-2.5 border-t border-slate-100 bg-slate-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              onClick={startNewOrder}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Lên đơn mới
            </button>
            <button
              onClick={() => router.push("/orders")}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
            >
              Về danh sách đơn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
