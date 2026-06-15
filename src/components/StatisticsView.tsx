"use client";

import React, { useMemo, useState } from "react";
import { Order, MealItem } from "../data/mealPrepData";
import { COMBO_COMPONENTS } from "../data/comboComponents";
import { CATEGORY_EMOJI } from "@/lib/menu";
import { formatNumber } from "@/lib/format";
import { StatStrip, type Stat } from "@/components/ui/StatStrip";
import {
  ShoppingCart,
  Users,
  Calendar,
  Package,
  Scale,
  Layers,
  Boxes,
  RotateCcw,
} from "lucide-react";

interface StatisticsViewProps {
  orders: Order[];
  meals: MealItem[];
}

type Tab = "shopping" | "customer";
type DeliveryFilter = "undelivered" | "delivered" | "all";
type PaymentFilter = "all" | "paid" | "unpaid";

// Order the categories the way the kitchen thinks about shopping; anything unknown sinks to the end.
const CATEGORY_SORT = [
  "Ức gà",
  "Đùi gà",
  "Cốt lết",
  "Nạc heo",
  "Thăn bò",
  "Tôm",
  "Cá thu",
  "Cá hồi",
  "Cá tầm",
  "Cá bóp",
];
const catRank = (c: string) => {
  const i = CATEGORY_SORT.indexOf(c);
  return i < 0 ? 999 : i;
};

// "100g" -> 100, "190" -> 190, "Combo" -> 0
const parseWeightG = (w: string) => parseInt(String(w), 10) || 0;
const kg = (g: number) => (g / 1000).toFixed(2);

// Delivery statuses that count as "not delivered yet" (i.e. still need to be shopped/prepped).
const UNDELIVERED: Order["status"][] = ["Mới", "Đang xử lý", "Đang giao"];

/** A single dish requirement, after combos have been exploded into their components. */
interface DishLine {
  category: string;
  dishName: string;
  weight: string;
  isCombo: boolean; // dish comes from inside a combo
  comboName: string | null;
  bags: number; // số túi / số gói
  grams: number; // bags * weight(g)
  orderId: string;
  orderCode: string;
  customerName: string;
}

/** One aggregated shopping row (a dish at a weight, either standalone or combo-sourced). */
interface ShopRow {
  category: string;
  dishName: string;
  weight: string;
  isCombo: boolean;
  bags: number;
  grams: number;
}

export default function StatisticsView({ orders, meals }: StatisticsViewProps) {
  const [tab, setTab] = useState<Tab>("shopping");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [delivery, setDelivery] = useState<DeliveryFilter>("undelivered");
  const [payment, setPayment] = useState<PaymentFilter>("all");

  // Dish name -> category, built from the live menu (combo children only carry a name).
  const categoryByName = useMemo(() => {
    const m = new Map<string, string>();
    meals.forEach((meal) => {
      if (meal.category !== "Combo") m.set(meal.name.normalize("NFC"), meal.category);
    });
    return m;
  }, [meals]);

  const categoryOf = (name: string, mealId?: string): string => {
    if (mealId) {
      const meal = meals.find((x) => x.id === mealId);
      if (meal && meal.category !== "Combo") return meal.category;
    }
    return categoryByName.get(name.normalize("NFC")) ?? "Khác";
  };

  // Resolve the combo composition for an order line (match by name, fall back to the menu id).
  const resolveComboName = (item: { mealId: string; mealName: string }): string | null => {
    if (COMBO_COMPONENTS[item.mealName]) return item.mealName;
    const meal = meals.find((x) => x.id === item.mealId);
    if (meal && COMBO_COMPONENTS[meal.name]) return meal.name;
    return null;
  };

  // Orders that match the date + delivery + payment filters. Cancelled orders are never shopped.
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        if (o.status === "Đã hủy") return false;
        const d = o.deliveryDate || "";
        if (fromDate && d < fromDate) return false;
        if (toDate && d > toDate) return false;
        if (delivery === "undelivered" && !UNDELIVERED.includes(o.status)) return false;
        if (delivery === "delivered" && o.status !== "Đã giao") return false;
        if (payment === "paid" && o.paymentStatus !== "Đã thanh toán") return false;
        if (payment === "unpaid" && o.paymentStatus !== "Chưa thanh toán") return false;
        return true;
      })
      .sort((a, b) => (a.deliveryDate || "").localeCompare(b.deliveryDate || "") || a.orderNumber.localeCompare(b.orderNumber));
  }, [orders, fromDate, toDate, delivery, payment]);

  // Explode every order item into individual dish requirements (combos -> their components).
  const lines = useMemo(() => {
    const out: DishLine[] = [];
    for (const o of filteredOrders) {
      for (const it of o.items) {
        const isComboLine = it.weight === "Combo";
        if (isComboLine) {
          const comboName = resolveComboName(it);
          const comps = comboName ? COMBO_COMPONENTS[comboName] : null;
          if (comps) {
            for (const c of comps) {
              const bags = c.quantity * it.quantity;
              out.push({
                category: categoryOf(c.name),
                dishName: c.name,
                weight: c.weight,
                isCombo: true,
                comboName,
                bags,
                grams: bags * parseWeightG(c.weight),
                orderId: o.id,
                orderCode: o.orderNumber,
                customerName: o.customerName,
              });
            }
          } else {
            // Unknown combo composition — keep it visible rather than silently dropping it.
            out.push({
              category: "Combo",
              dishName: it.mealName,
              weight: "Combo",
              isCombo: true,
              comboName: it.mealName,
              bags: it.quantity,
              grams: 0,
              orderId: o.id,
              orderCode: o.orderNumber,
              customerName: o.customerName,
            });
          }
        } else {
          out.push({
            category: categoryOf(it.mealName, it.mealId),
            dishName: it.mealName,
            weight: it.weight,
            isCombo: false,
            comboName: null,
            bags: it.quantity,
            grams: it.quantity * parseWeightG(it.weight),
            orderId: o.id,
            orderCode: o.orderNumber,
            customerName: o.customerName,
          });
        }
      }
    }
    return out;
  }, [filteredOrders, meals]); // eslint-disable-line react-hooks/exhaustive-deps

  // ----- Tab 1.a: shopping summary aggregated by category > dish (combo vs lẻ kept separate) -----
  const shopping = useMemo(() => {
    const byKey = new Map<string, ShopRow>();
    for (const l of lines) {
      const key = `${l.category}|${l.dishName}|${l.weight}|${l.isCombo}`;
      const e = byKey.get(key);
      if (e) {
        e.bags += l.bags;
        e.grams += l.grams;
      } else {
        byKey.set(key, {
          category: l.category,
          dishName: l.dishName,
          weight: l.weight,
          isCombo: l.isCombo,
          bags: l.bags,
          grams: l.grams,
        });
      }
    }
    // Group into categories.
    const catMap = new Map<string, { rows: ShopRow[]; bags: number; grams: number }>();
    for (const r of byKey.values()) {
      let g = catMap.get(r.category);
      if (!g) {
        g = { rows: [], bags: 0, grams: 0 };
        catMap.set(r.category, g);
      }
      g.rows.push(r);
      g.bags += r.bags;
      g.grams += r.grams;
    }
    const groups = [...catMap.entries()]
      .map(([category, g]) => ({
        category,
        bags: g.bags,
        grams: g.grams,
        rows: g.rows.sort(
          (a, b) =>
            a.dishName.localeCompare(b.dishName, "vi") ||
            parseWeightG(a.weight) - parseWeightG(b.weight) ||
            Number(a.isCombo) - Number(b.isCombo),
        ),
      }))
      .sort((a, b) => catRank(a.category) - catRank(b.category) || a.category.localeCompare(b.category, "vi"));

    const totalBags = groups.reduce((s, g) => s + g.bags, 0);
    const totalGrams = groups.reduce((s, g) => s + g.grams, 0);
    return { groups, totalBags, totalGrams };
  }, [lines]);

  // ----- Tab 1.b: per-customer breakdown, one block per combo + one "Món lẻ" block per order -----
  interface CustomerBlock {
    stt: number;
    customerName: string;
    orderType: string; // combo name or "Món lẻ"
    orderCode: string;
    rows: { dishName: string; weight: string; bags: number; total: number }[];
  }
  const customerBlocks = useMemo(() => {
    const blocks: CustomerBlock[] = [];
    let stt = 0;
    for (const o of filteredOrders) {
      // "Món lẻ" block: all non-combo items of this order.
      const singles = o.items.filter((it) => it.weight !== "Combo");
      if (singles.length > 0) {
        blocks.push({
          stt: ++stt,
          customerName: o.customerName,
          orderType: "Món lẻ",
          orderCode: o.orderNumber,
          rows: singles.map((it) => ({
            dishName: it.mealName,
            weight: it.weight,
            bags: it.quantity,
            total: it.quantity * parseWeightG(it.weight),
          })),
        });
      }
      // One block per combo line.
      for (const it of o.items.filter((x) => x.weight === "Combo")) {
        const comboName = resolveComboName(it);
        const comps = comboName ? COMBO_COMPONENTS[comboName] : null;
        const rows = comps
          ? comps.map((c) => {
              const bags = c.quantity * it.quantity;
              return { dishName: c.name, weight: c.weight, bags, total: bags * parseWeightG(c.weight) };
            })
          : [{ dishName: it.mealName, weight: "Combo", bags: it.quantity, total: 0 }];
        blocks.push({
          stt: ++stt,
          customerName: o.customerName,
          orderType: comboName ?? it.mealName,
          orderCode: o.orderNumber,
          rows,
        });
      }
    }
    const totalGrams = blocks.reduce((s, b) => s + b.rows.reduce((ss, r) => ss + r.total, 0), 0);
    return { blocks, totalGrams };
  }, [filteredOrders, meals]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats: Stat[] = useMemo(
    () => [
      {
        label: "Đơn cần soạn",
        value: filteredOrders.length,
        icon: <ShoppingCart className="h-5 w-5" />,
        accent: "bg-brand-50 text-brand-600",
      },
      {
        label: "Tổng số gói/túi",
        value: formatNumber(shopping.totalBags),
        icon: <Package className="h-5 w-5" />,
        accent: "bg-indigo-50 text-indigo-600",
      },
      {
        label: "Tổng khối lượng",
        value: `${kg(shopping.totalGrams)} kg`,
        icon: <Scale className="h-5 w-5" />,
        accent: "bg-emerald-50 text-emerald-600",
      },
      {
        label: "Nhóm hàng",
        value: shopping.groups.length,
        sub: `${customerBlocks.blocks.length} dòng khách`,
        icon: <Layers className="h-5 w-5" />,
        accent: "bg-orange-50 text-orange-600",
      },
    ],
    [filteredOrders.length, shopping, customerBlocks.blocks.length],
  );

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setDelivery("undelivered");
    setPayment("all");
  };

  return (
    <div className="space-y-6">
      <StatStrip stats={stats} />

      {/* Filter bar */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-700" />
          <h4 className="text-sm font-bold text-slate-800">Bộ lọc đơn hàng</h4>
          <span className="text-[11px] text-slate-400">— lọc theo ngày giao + trạng thái để thống kê đúng đơn cần chuẩn bị</span>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Từ ngày (giao)</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Đến ngày (giao)</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Trạng thái giao</span>
            <select
              value={delivery}
              onChange={(e) => setDelivery(e.target.value as DeliveryFilter)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="undelivered">Chưa giao hàng</option>
              <option value="delivered">Đã giao</option>
              <option value="all">Tất cả (trừ đã hủy)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Thanh toán</span>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value as PaymentFilter)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="all">Tất cả</option>
              <option value="paid">Đã thanh toán</option>
              <option value="unpaid">Chưa thanh toán</option>
            </select>
          </label>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Đặt lại
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-lg bg-slate-100 p-1">
        <button
          onClick={() => setTab("shopping")}
          className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-bold transition ${
            tab === "shopping" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Tổng hợp đi chợ
        </button>
        <button
          onClick={() => setTab("customer")}
          className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-bold transition ${
            tab === "customer" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Tổng hợp đơn theo khách
        </button>
      </div>

      {tab === "shopping" ? (
        <ShoppingTab shopping={shopping} />
      ) : (
        <CustomerTab blocks={customerBlocks.blocks} totalGrams={customerBlocks.totalGrams} />
      )}
    </div>
  );
}

// ---------------- Tab 1.a ----------------
function ShoppingTab({
  shopping,
}: {
  shopping: {
    groups: { category: string; bags: number; grams: number; rows: { dishName: string; weight: string; isCombo: boolean; bags: number; grams: number }[] }[];
    totalBags: number;
    totalGrams: number;
  };
}) {
  if (shopping.groups.length === 0) {
    return <EmptyState text="Không có đơn nào khớp bộ lọc để tổng hợp đi chợ." />;
  }
  return (
    <div className="space-y-6">
      {/* Category kg totals — quick "đi chợ" glance */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
          <Scale className="h-4 w-4 text-emerald-600" />
          Tổng khối lượng theo danh mục
        </h4>
        <div className="flex flex-wrap gap-2">
          {shopping.groups.map((g) => (
            <div
              key={g.category}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
            >
              <span>{CATEGORY_EMOJI[g.category] ?? "🍽️"}</span>
              <span className="font-semibold text-slate-700">{g.category}</span>
              <span className="font-extrabold text-emerald-600">{kg(g.grams)} kg</span>
              <span className="text-[10px] text-slate-400">· {formatNumber(g.bags)} gói</span>
            </div>
          ))}
          <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs">
            <Boxes className="h-3.5 w-3.5 text-indigo-600" />
            <span className="font-semibold text-indigo-700">Tổng cộng</span>
            <span className="font-extrabold text-indigo-700">{kg(shopping.totalGrams)} kg</span>
            <span className="text-[10px] text-indigo-400">· {formatNumber(shopping.totalBags)} gói</span>
          </div>
        </div>
      </div>

      {/* Detailed table grouped by category */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Danh mục</th>
                <th className="px-4 py-2.5">Món</th>
                <th className="px-4 py-2.5 text-center">Trọng lượng</th>
                <th className="px-4 py-2.5 text-right">Số lượng (gói)</th>
                <th className="px-4 py-2.5 text-right">Tổng gam (g)</th>
                <th className="px-4 py-2.5 text-right">Tổng kg</th>
              </tr>
            </thead>
            <tbody>
              {shopping.groups.map((g) => (
                <React.Fragment key={g.category}>
                  {g.rows.map((r, i) => (
                    <tr key={`${g.category}-${r.dishName}-${r.weight}-${r.isCombo}`} className="border-b border-slate-50 hover:bg-slate-50/70">
                      {i === 0 && (
                        <td rowSpan={g.rows.length} className="border-r border-slate-100 px-4 py-2.5 align-top">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <span>{CATEGORY_EMOJI[g.category] ?? "🍽️"}</span>
                            {g.category}
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-slate-700">{r.dishName}</span>
                        {r.isCombo && (
                          <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">Combo</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-500">{r.weight}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-700">{formatNumber(r.bags)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-500">{formatNumber(r.grams)}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-700">{kg(r.grams)}</td>
                    </tr>
                  ))}
                  {/* Category subtotal */}
                  <tr className="border-b-2 border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-700">
                    <td className="px-4 py-2 text-right" colSpan={3}>
                      Cộng {g.category}
                    </td>
                    <td className="px-4 py-2 text-right">{formatNumber(g.bags)}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatNumber(g.grams)}</td>
                    <td className="px-4 py-2 text-right font-mono text-emerald-600">{kg(g.grams)} kg</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-50 text-xs font-extrabold text-indigo-800">
                <td className="px-4 py-3" colSpan={3}>
                  TỔNG CỘNG ĐI CHỢ
                </td>
                <td className="px-4 py-3 text-right">{formatNumber(shopping.totalBags)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatNumber(shopping.totalGrams)}</td>
                <td className="px-4 py-3 text-right font-mono">{kg(shopping.totalGrams)} kg</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------- Tab 1.b ----------------
function CustomerTab({
  blocks,
  totalGrams,
}: {
  blocks: { stt: number; customerName: string; orderType: string; orderCode: string; rows: { dishName: string; weight: string; bags: number; total: number }[] }[];
  totalGrams: number;
}) {
  if (blocks.length === 0) {
    return <EmptyState text="Không có đơn nào khớp bộ lọc để tổng hợp theo khách." />;
  }
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Users className="h-4 w-4 text-indigo-700" />
          Đơn theo khách ({blocks.length} dòng)
        </h4>
        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          Tổng: {kg(totalGrams)} kg
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2.5 text-center">STT</th>
              <th className="px-4 py-2.5">Tên khách</th>
              <th className="px-4 py-2.5">Tên order</th>
              <th className="px-4 py-2.5">Tên món</th>
              <th className="px-4 py-2.5 text-right">Số túi</th>
              <th className="px-4 py-2.5 text-center">Trọng lượng</th>
              <th className="px-4 py-2.5 text-right">Tổng cộng (g)</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((b) => (
              <React.Fragment key={`${b.orderCode}-${b.stt}`}>
                {b.rows.map((r, i) => (
                  <tr key={`${b.stt}-${r.dishName}-${r.weight}-${i}`} className="border-b border-slate-50 hover:bg-slate-50/70">
                    {i === 0 && (
                      <td rowSpan={b.rows.length} className="border-r border-slate-100 px-4 py-2.5 text-center align-top font-bold text-slate-500">
                        {b.stt}
                      </td>
                    )}
                    {i === 0 && (
                      <td rowSpan={b.rows.length} className="border-r border-slate-100 px-4 py-2.5 align-top font-bold text-slate-800">
                        {b.customerName}
                      </td>
                    )}
                    {i === 0 && (
                      <td rowSpan={b.rows.length} className="border-r border-slate-100 px-4 py-2.5 align-top">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            b.orderType === "Món lẻ" ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {b.orderType}
                        </span>
                        <div className="mt-1 font-mono text-[9px] text-slate-400">{b.orderCode}</div>
                      </td>
                    )}
                    <td className="px-4 py-2.5 font-medium text-slate-700">{r.dishName}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-700">{formatNumber(r.bags)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-500">{r.weight}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-700">{formatNumber(r.total)}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-6 py-12 text-center shadow-sm">
      <Boxes className="mx-auto mb-3 h-10 w-10 text-slate-300" />
      <p className="text-sm font-medium text-slate-500">{text}</p>
      <p className="mt-1 text-xs text-slate-400">Thử mở rộng khoảng ngày hoặc đổi trạng thái giao/thanh toán.</p>
    </div>
  );
}
