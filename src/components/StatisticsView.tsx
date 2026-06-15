"use client";

import React, { useMemo, useState } from "react";
import { Order, MealItem } from "../data/mealPrepData";
import { COMBO_COMPONENTS } from "../data/comboComponents";
import { CATEGORY_EMOJI } from "@/lib/menu";
import { formatNumber } from "@/lib/format";
import { StatStrip, type Stat } from "@/components/ui/StatStrip";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { currentWeek, rangeForPreset, type DatePreset } from "@/lib/dateRange";
import {
  ShoppingCart,
  Users,
  Calendar,
  Package,
  Scale,
  Layers,
  Boxes,
  RotateCcw,
  Printer,
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

const formatDeliveryDate = (value: string) => {
  if (!value) return "Chưa có";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

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

interface PrepRow {
  dishName: string;
  weight: string;
  bags: number;
  total: number;
}

interface PrepSection {
  title: string;
  badge: string;
  rows: PrepRow[];
  totalBags: number;
  totalGrams: number;
}

interface CustomerOrderBlock {
  orderId: string;
  orderCode: string;
  deliveryDate: string;
  status: Order["status"];
  paymentStatus: Order["paymentStatus"];
  sections: PrepSection[];
  totalBags: number;
  totalGrams: number;
}

interface CustomerGroup {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orders: CustomerOrderBlock[];
  totalBags: number;
  totalGrams: number;
}

export default function StatisticsView({ orders, meals }: StatisticsViewProps) {
  const [tab, setTab] = useState<Tab>("shopping");
  // Default the kitchen view to the current week; allow month or a custom range.
  const [preset, setPreset] = useState<DatePreset>("week");
  const [fromDate, setFromDate] = useState<string>(() => currentWeek().from);
  const [toDate, setToDate] = useState<string>(() => currentWeek().to);
  const [delivery, setDelivery] = useState<DeliveryFilter>("undelivered");
  const [payment, setPayment] = useState<PaymentFilter>("all");

  const applyPreset = (p: DatePreset) => {
    setPreset(p);
    if (p !== "custom") {
      const r = rangeForPreset(p, { from: fromDate, to: toDate });
      setFromDate(r.from);
      setToDate(r.to);
    }
  };

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

  // ----- Tab 1.b: per-customer breakdown, grouped so each customer's orders stay together when printed -----
  const customerGroups = useMemo(() => {
    const map = new Map<string, CustomerGroup>();

    for (const o of filteredOrders) {
      const key = o.customerId || `${o.customerName}|${o.customerPhone}`;
      let group = map.get(key);
      if (!group) {
        group = {
          customerId: key,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          customerAddress: o.customerAddress,
          orders: [],
          totalBags: 0,
          totalGrams: 0,
        };
        map.set(key, group);
      }

      const sections: PrepSection[] = [];

      const singles = o.items.filter((it) => it.weight !== "Combo");
      if (singles.length > 0) {
        const rows = singles.map((it) => ({
          dishName: it.mealName,
          weight: it.weight,
          bags: it.quantity,
          total: it.quantity * parseWeightG(it.weight),
        }));
        sections.push({
          title: "Món lẻ",
          badge: "Lẻ",
          rows,
          totalBags: rows.reduce((sum, row) => sum + row.bags, 0),
          totalGrams: rows.reduce((sum, row) => sum + row.total, 0),
        });
      }

      for (const it of o.items.filter((x) => x.weight === "Combo")) {
        const comboName = resolveComboName(it);
        const comps = comboName ? COMBO_COMPONENTS[comboName] : null;
        const rows: PrepRow[] = comps
          ? comps.map((c) => {
              const bags = c.quantity * it.quantity;
              return { dishName: c.name, weight: c.weight, bags, total: bags * parseWeightG(c.weight) };
            })
          : [{ dishName: it.mealName, weight: "Combo", bags: it.quantity, total: 0 }];

        sections.push({
          title: comboName ?? it.mealName,
          badge: "Combo",
          rows,
          totalBags: rows.reduce((sum, row) => sum + row.bags, 0),
          totalGrams: rows.reduce((sum, row) => sum + row.total, 0),
        });
      }

      const orderTotalBags = sections.reduce((sum, section) => sum + section.totalBags, 0);
      const orderTotalGrams = sections.reduce((sum, section) => sum + section.totalGrams, 0);

      group.orders.push({
        orderId: o.id,
        orderCode: o.orderNumber,
        deliveryDate: o.deliveryDate,
        status: o.status,
        paymentStatus: o.paymentStatus,
        sections,
        totalBags: orderTotalBags,
        totalGrams: orderTotalGrams,
      });

      group.totalBags += orderTotalBags;
      group.totalGrams += orderTotalGrams;
    }

    return [...map.values()];
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
        sub: `${customerGroups.length} khách`,
        icon: <Layers className="h-5 w-5" />,
        accent: "bg-orange-50 text-orange-600",
      },
    ],
    [filteredOrders.length, shopping, customerGroups.length],
  );

  const resetFilters = () => {
    const w = currentWeek();
    setPreset("week");
    setFromDate(w.from);
    setToDate(w.to);
    setDelivery("undelivered");
    setPayment("all");
  };

  const presetLabel =
    preset === "week" ? "Tuần này" : preset === "month" ? "Tháng này" : preset === "all" ? "Tất cả" : "Tùy chọn";

  const filterSummary = [
    `Kỳ: ${presetLabel}`,
    fromDate ? `Từ ${formatDeliveryDate(fromDate)}` : "Từ đầu kỳ",
    toDate ? `đến ${formatDeliveryDate(toDate)}` : "đến hiện tại",
    delivery === "undelivered"
      ? "Trạng thái giao: chưa giao"
      : delivery === "delivered"
        ? "Trạng thái giao: đã giao"
        : "Trạng thái giao: tất cả",
    payment === "paid" ? "Thanh toán: đã thanh toán" : payment === "unpaid" ? "Thanh toán: chưa thanh toán" : "Thanh toán: tất cả",
  ].join(" · ");
  const customerTotalGrams = customerGroups.reduce((sum, group) => sum + group.totalGrams, 0);

  return (
    <div className="space-y-6">
      <div className="mf-print-only hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="text-base font-bold text-slate-900">
          {tab === "shopping" ? "MealFit - Tổng hợp đi chợ" : "MealFit - Tổng hợp đơn theo khách"}
        </div>
        <div className="mt-1 text-xs text-slate-500">{filterSummary}</div>
        <div className="mt-1 text-xs font-semibold text-slate-600">
          {tab === "shopping"
            ? `${shopping.groups.length} nhóm hàng · ${formatNumber(shopping.totalBags)} gói · ${kg(shopping.totalGrams)} kg`
            : `${customerGroups.length} khách · ${filteredOrders.length} đơn · ${kg(customerTotalGrams)} kg`}
        </div>
      </div>

      <div className="mf-print-hide">
        <StatStrip stats={stats} />
      </div>

      {/* Filter bar */}
      <div className="mf-print-hide rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-700" />
          <h4 className="text-sm font-bold text-slate-800">Bộ lọc đơn hàng</h4>
          <span className="text-[11px] text-slate-400">— lọc theo ngày giao + trạng thái để thống kê đúng đơn cần chuẩn bị</span>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Kỳ</span>
            <div className="w-36">
              <SearchableSelect
                value={preset}
                onChange={(v) => applyPreset(v as DatePreset)}
                searchable={false}
                ariaLabel="Chọn kỳ thống kê"
                options={[
                  { value: "week", label: "Tuần này" },
                  { value: "month", label: "Tháng này" },
                  { value: "custom", label: "Tùy chọn" },
                  { value: "all", label: "Tất cả" },
                ]}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Từ ngày (giao)</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPreset("custom"); }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Đến ngày (giao)</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPreset("custom"); }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Trạng thái giao</span>
            <div className="w-44">
              <SearchableSelect
                value={delivery}
                onChange={(v) => setDelivery(v as DeliveryFilter)}
                searchable={false}
                ariaLabel="Lọc trạng thái giao"
                options={[
                  { value: "undelivered", label: "Chưa giao hàng" },
                  { value: "delivered", label: "Đã giao" },
                  { value: "all", label: "Tất cả (trừ đã hủy)" },
                ]}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-slate-500">Thanh toán</span>
            <div className="w-40">
              <SearchableSelect
                value={payment}
                onChange={(v) => setPayment(v as PaymentFilter)}
                searchable={false}
                ariaLabel="Lọc thanh toán"
                options={[
                  { value: "all", label: "Tất cả" },
                  { value: "paid", label: "Đã thanh toán" },
                  { value: "unpaid", label: "Chưa thanh toán" },
                ]}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
              />
            </div>
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
      <div className="mf-print-hide flex w-fit gap-1 rounded-lg bg-slate-100 p-1">
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
        <ShoppingTab shopping={shopping} onPrint={() => window.print()} />
      ) : (
        <CustomerTab groups={customerGroups} totalGrams={customerTotalGrams} onPrint={() => window.print()} />
      )}
    </div>
  );
}

// ---------------- Tab 1.a ----------------
function ShoppingTab({
  shopping,
  onPrint,
}: {
  shopping: {
    groups: { category: string; bags: number; grams: number; rows: { dishName: string; weight: string; isCombo: boolean; bags: number; grams: number }[] }[];
    totalBags: number;
    totalGrams: number;
  };
  onPrint: () => void;
}) {
  if (shopping.groups.length === 0) {
    return <EmptyState text="Không có đơn nào khớp bộ lọc để tổng hợp đi chợ." />;
  }
  return (
    <div className="space-y-6">
      {/* Header + print */}
      <div className="mf-print-hide flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <ShoppingCart className="h-4 w-4 text-indigo-700" />
          Bảng tổng hợp đi chợ
        </h4>
        <button onClick={onPrint} className="btn mf-print-hide bg-slate-900 text-white hover:bg-slate-800">
          <Printer />
          In A4
        </button>
      </div>

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
          <table className="mf-print-table w-full text-left text-xs text-slate-600">
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
              {/* Grand total pinned to the top for a quick "đi chợ" read */}
              <tr className="border-b-2 border-indigo-200 bg-indigo-50 text-xs font-extrabold text-indigo-800">
                <td className="px-4 py-3" colSpan={3}>
                  TỔNG CỘNG ĐI CHỢ
                </td>
                <td className="px-4 py-3 text-right">{formatNumber(shopping.totalBags)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatNumber(shopping.totalGrams)}</td>
                <td className="px-4 py-3 text-right font-mono">{kg(shopping.totalGrams)} kg</td>
              </tr>
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
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------- Tab 1.b ----------------
function CustomerTab({
  groups,
  totalGrams,
  onPrint,
}: {
  groups: CustomerGroup[];
  totalGrams: number;
  onPrint: () => void;
}) {
  if (groups.length === 0) {
    return <EmptyState text="Không có đơn nào khớp bộ lọc để tổng hợp theo khách." />;
  }

  return (
    <div className="space-y-4">
      <div className="mf-print-hide flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="space-y-1">
          <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Users className="h-4 w-4 text-indigo-700" />
            Đơn theo khách ({groups.length} khách)
          </h4>
          <p className="text-[11px] text-slate-500">
            Mỗi khách được giữ nguyên theo khối riêng khi in A4 để tránh cắt dở giữa chừng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            Tổng: {kg(totalGrams)} kg
          </span>
          <button onClick={onPrint} className="btn mf-print-hide bg-slate-900 text-white hover:bg-slate-800">
            <Printer />
            In A4
          </button>
        </div>
      </div>

      {groups.map((group, groupIndex) => (
        <section
          key={group.customerId}
          className={`mf-print-section overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm ${
            groupIndex > 0 ? "mf-print-page-break-before" : ""
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h5 className="truncate text-sm font-bold text-slate-800">{group.customerName}</h5>
                <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                  {group.orders.length} đơn
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <span className="font-mono font-semibold text-slate-600">{group.customerPhone}</span>
                <span className="max-w-[48rem] truncate" title={group.customerAddress}>
                  {group.customerAddress}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-indigo-700">
                {formatNumber(group.totalBags)} túi
              </span>
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700">
                {kg(group.totalGrams)} kg
              </span>
            </div>
          </div>

          <div className="space-y-4 p-4">
            {group.orders.map((order) => (
              <article
                key={order.orderId}
                className="mf-print-order overflow-hidden rounded-lg border border-slate-100"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-white px-3 py-2.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        Đơn {order.orderCode}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600">
                        Giao: {formatDeliveryDate(order.deliveryDate)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                      <span
                        className={`rounded px-2 py-0.5 ${
                          order.status === "Đã giao"
                            ? "bg-emerald-50 text-emerald-700"
                            : order.status === "Đã hủy"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {order.status}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 ${
                          order.paymentStatus === "Đã thanh toán"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
                    <span className="rounded bg-slate-100 px-2.5 py-1">{formatNumber(order.totalBags)} túi</span>
                    <span className="rounded bg-slate-100 px-2.5 py-1">{kg(order.totalGrams)} kg</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="mf-print-table w-full text-left text-xs text-slate-600">
                    <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-semibold uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2.5">Nhóm</th>
                        <th className="px-3 py-2.5">Tên món</th>
                        <th className="px-3 py-2.5 text-right">Số túi</th>
                        <th className="px-3 py-2.5 text-center">Trọng lượng</th>
                        <th className="px-3 py-2.5 text-right">Tổng cộng (g)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.sections.map((section, sectionIndex) => (
                        <React.Fragment key={`${order.orderId}-${section.title}-${sectionIndex}`}>
                          {section.rows.map((row, rowIndex) => (
                            <tr key={`${order.orderId}-${section.title}-${rowIndex}`} className="border-b border-slate-50 hover:bg-slate-50/70">
                              {rowIndex === 0 && (
                                <td rowSpan={section.rows.length} className="border-r border-slate-100 px-3 py-2.5 align-top">
                                  <div className="space-y-1">
                                    <div className="font-bold text-slate-800">{section.title}</div>
                                    <span
                                      className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                        section.badge === "Combo" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {section.badge}
                                    </span>
                                  </div>
                                </td>
                              )}
                              <td className="px-3 py-2.5 font-medium text-slate-700">{row.dishName}</td>
                              <td className="px-3 py-2.5 text-right font-semibold text-slate-700">{formatNumber(row.bags)}</td>
                              <td className="px-3 py-2.5 text-center">
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-500">
                                  {row.weight}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-700">{formatNumber(row.total)}</td>
                            </tr>
                          ))}
                          <tr className="border-b-2 border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-700">
                            <td className="px-3 py-2 text-right" colSpan={2}>
                              Cộng {section.title}
                            </td>
                            <td className="px-3 py-2 text-right">{formatNumber(section.totalBags)}</td>
                            <td className="px-3 py-2 text-center">-</td>
                            <td className="px-3 py-2 text-right font-mono">{formatNumber(section.totalGrams)} g</td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-indigo-50 text-xs font-extrabold text-indigo-800">
                        <td className="px-3 py-3" colSpan={2}>
                          TỔNG ĐƠN
                        </td>
                        <td className="px-3 py-3 text-right">{formatNumber(order.totalBags)}</td>
                        <td className="px-3 py-3 text-center">-</td>
                        <td className="px-3 py-3 text-right">{kg(order.totalGrams)} kg</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
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
