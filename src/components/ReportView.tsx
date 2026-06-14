"use client";

import React, { useState, useMemo } from "react";
import { Order, MealItem } from "../data/mealPrepData";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  Layers, 
  CheckSquare, 
  ShieldAlert,
  Calendar
} from "lucide-react";

interface ReportViewProps {
  orders: Order[];
  meals: MealItem[];
}

export default function ReportView({ orders, meals }: ReportViewProps) {
  // Date periods states
  const [period, setPeriod] = useState<"TODAY" | "WEEK" | "MONTH" | "ALL">("ALL");

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  // Filter orders according to date periods chosen
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    
    // Start of week (7 days ago)
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    
    // Start of month (30 days ago)
    const monthAgo = new Date();
    monthAgo.setDate(now.getDate() - 30);

    return orders.filter(o => {
      if (o.status === "Đã hủy") return false;
      
      const oDate = new Date(o.createdAt);
      if (period === "TODAY") {
        return o.createdAt.split("T")[0] === todayStr || o.deliveryDate === todayStr;
      } else if (period === "WEEK") {
        return oDate >= weekAgo;
      } else if (period === "MONTH") {
        return oDate >= monthAgo;
      }
      return true; // ALL time
    });
  }, [orders, period]);

  // Financial summary counters
  const summary = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    let profit = 0;
    let count = filteredOrders.length;
    let totalItemsCount = 0;

    filteredOrders.forEach(o => {
      revenue += o.totalAmount;
      cost += o.totalCost;
      profit += o.totalProfit;
      o.items.forEach(it => {
        totalItemsCount += it.quantity;
      });
    });

    const averageOrderValue = count > 0 ? Math.round(revenue / count) : 0;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

    return {
      revenue,
      cost,
      profit,
      count,
      totalItemsCount,
      averageOrderValue,
      margin
    };
  }, [filteredOrders]);

  // Revenue & Profit distribution by Categories
  const categoriesAnalysis = useMemo(() => {
    const list: { [key: string]: { name: string; revenue: number; cost: number; profit: number; count: number } } = {};
    
    filteredOrders.forEach(o => {
      o.items.forEach(it => {
        const mealObj = meals.find(m => m.id === it.mealId);
        const categoryName = mealObj?.category || "Combo";
        
        if (!list[categoryName]) {
          list[categoryName] = { name: categoryName, revenue: 0, cost: 0, profit: 0, count: 0 };
        }
        
        const lineVal = it.price * it.quantity;
        const lineCost = it.cost * it.quantity;
        
        list[categoryName].revenue += lineVal;
        list[categoryName].cost += lineCost;
        list[categoryName].profit += (lineVal - lineCost);
        list[categoryName].count += it.quantity;
      });
    });

    return Object.values(list).map(item => {
      const margin = item.revenue > 0 ? Math.round((item.profit / item.revenue) * 100) : 0;
      return {
        ...item,
        margin
      };
    }).sort((a,b) => b.revenue - a.revenue);
  }, [filteredOrders, meals]);

  return (
    <div className="space-y-6">
      {/* Date period controls panel */}
      <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-700" />
          <h4 className="font-bold text-slate-800 text-sm">Thời gian biểu báo cáo doanh thu</h4>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setPeriod("TODAY")}
            className={`text-xs font-bold px-3 py-1.5 rounded-md ${
              period === "TODAY" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Hôm nay
          </button>
          <button 
            onClick={() => setPeriod("WEEK")}
            className={`text-xs font-bold px-3 py-1.5 rounded-md ${
              period === "WEEK" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            7 Ngày qua
          </button>
          <button 
            onClick={() => setPeriod("MONTH")}
            className={`text-xs font-bold px-3 py-1.5 rounded-md ${
              period === "MONTH" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            30 Ngày qua
          </button>
          <button 
            onClick={() => setPeriod("ALL")}
            className={`text-xs font-bold px-3 py-1.5 rounded-md ${
              period === "ALL" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Toàn thời gian
          </button>
        </div>
      </div>

      {/* Numerical statistics cards widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rev */}
        <div className="bg-white p-5 border border-slate-100 rounded-xl shadow-sm text-left">
          <span className="text-[10px] uppercase font-bold text-slate-400">Doanh thu bán cơm</span>
          <h3 className="text-xl font-extrabold text-slate-800 mt-1">{formatVND(summary.revenue)}</h3>
          <p className="text-[10px] text-slate-400 mt-2">Tổng giá trị đơn cơm chưa tính ship</p>
        </div>

        {/* Cost */}
        <div className="bg-white p-5 border border-slate-100 rounded-xl shadow-sm text-left">
          <span className="text-[10px] uppercase font-bold text-slate-400">Giá vốn nguyên liệu</span>
          <h3 className="text-xl font-extrabold text-slate-800 mt-1">{formatVND(summary.cost)}</h3>
          <p className="text-[10px] text-slate-400 mt-2">Tổng chi hao hụt rau, thịt, gia vị thực tế</p>
        </div>

        {/* Profit */}
        <div className="bg-white p-5 border border-slate-100 rounded-xl shadow-sm text-left">
          <span className="text-[10px] uppercase font-bold text-slate-400">Lợi nhuận gộp ròng</span>
          <h3 className="text-xl font-extrabold text-emerald-600 mt-1">+{formatVND(summary.profit)}</h3>
          <p className="text-[10px] text-emerald-600 font-medium mt-2">Thặng dư tích lũy</p>
        </div>

        {/* Margin */}
        <div className="bg-white p-5 border border-slate-100 rounded-xl shadow-sm text-left">
          <span className="text-[10px] uppercase font-bold text-slate-400">Tỷ lệ lãi ròng trung bình</span>
          <h3 className="text-xl font-extrabold text-slate-800 mt-1">{summary.margin}%</h3>
          <p className="text-[10px] text-indigo-600 font-semibold mt-2">Hiệu suất vận hành bếp đạt chuẩn</p>
        </div>
      </div>

      {/* Advanced dynamic charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category composite revenue cost breakdown chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-5 rounded-xl shadow-sm">
          <h4 className="font-bold text-slate-800 text-sm mb-4 text-left">So sánh Doanh thu - Giá vốn theo từng Nhóm sản phẩm</h4>
          <div className="h-80">
            {categoriesAnalysis.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400 text-xs">Không thu thập đủ thông số thích hợp trong mốc thời gian này</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={categoriesAnalysis} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip 
                    formatter={(val: any) => [formatVND(Number(val)), ""]}
                    contentStyle={{ backgroundColor: "#1e293b", color: "#f8fafc", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Legend iconType="rect" wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="cost" name="Giá vốn (Cost)" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  <Line type="monotone" dataKey="profit" name="Lợi nhuận" stroke="#10b981" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Margin yield chart per category */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-4 text-left">Tỷ suất lãi của từng Nhóm (Margin %)</h4>
            <div className="h-60">
              {categoriesAnalysis.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400 text-xs">Chưa có số liệu</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoriesAnalysis} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `${val}%`} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={60} />
                    <Tooltip formatter={(value: any) => [`${value}%`, "Tỷ lệ lãi"]} />
                    <Bar dataKey="margin" name="Tỷ lệ lãi (%)" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-left">
            💡 <strong>Mẹo cơ cấu thực đơn:</strong> Nhóm món nào có tỷ lệ (%) lãi ròng cao nhất chính là &ldquo;gà đẻ trứng vàng&rdquo;. Hãy kích cầu quảng cáo hoặc tạo combo đi kèm nhóm này để nhân rộng thặng dư doanh thu của bếp!
          </div>
        </div>
      </div>

      {/* Transaction table */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm p-5 text-left">
        <h4 className="font-bold text-slate-800 text-sm mb-3">Sao kê chi tiết Doanh thu theo mốc lựa chọn ({filteredOrders.length} đơn)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Mã đơn</th>
                <th className="py-2.5 px-3">Khách hàng</th>
                <th className="py-2.5 px-3 text-right">Doanh thu suất ăn</th>
                <th className="py-2.5 px-3 text-right">Giá gốc Cost</th>
                <th className="py-2.5 px-3 text-right">Lợi gộp thực tế</th>
                <th className="py-2.5 px-3 text-center">Trạng thái phát đơn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400 font-medium">Không tìm thấy dữ liệu phát đơn thích hợp.</td>
                </tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-indigo-700">{o.orderNumber}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{o.customerName}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700">{formatVND(o.totalAmount)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatVND(o.totalCost)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">+{formatVND(o.totalProfit)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${
                        o.status === "Đã giao" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
