import React, { useMemo } from "react";
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Percent, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  Users 
} from "lucide-react";

interface DashboardProps {
  orders: Order[];
  meals: MealItem[];
  customersCount: number;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ orders, meals, customersCount, onNavigate }: DashboardProps) {
  // Format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const activeOrders = orders.filter(o => o.status !== "Đã hủy");
    let totalRevenue = 0;
    let totalCost = 0;
    
    activeOrders.forEach(o => {
      totalRevenue += o.totalAmount;
      totalCost += o.totalCost;
    });

    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;
    
    // Status counts
    const counts = {
      new: orders.filter(o => o.status === "Mới").length,
      processing: orders.filter(o => o.status === "Đang xử lý").length,
      delivering: orders.filter(o => o.status === "Đang giao").length,
      delivered: orders.filter(o => o.status === "Đã giao").length,
      cancelled: orders.filter(o => o.status === "Đã hủy").length,
    };

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      counts,
      totalOrdersCount: orders.length,
      activeOrdersCount: activeOrders.length
    };
  }, [orders]);

  // Data for Category distribution Chart
  const categoryData = useMemo(() => {
    const categories: { [key: string]: { value: number; count: number } } = {};
    orders.filter(o => o.status !== "Đã hủy").forEach(o => {
      o.items.forEach(item => {
        // Find meal to know its category if it is not written
        const meal = meals.find(m => m.id === item.mealId);
        const cat = meal?.category || "Khác";
        if (!categories[cat]) {
          categories[cat] = { value: 0, count: 0 };
        }
        categories[cat].value += item.price * item.quantity;
        categories[cat].count += item.quantity;
      });
    });

    return Object.keys(categories).map(cat => ({
      name: cat,
      revenue: categories[cat].value,
      quantity: categories[cat].count
    })).sort((a,b) => b.revenue - a.revenue);
  }, [orders, meals]);

  // Data for Sales timeline of past few days
  const timelineData = useMemo(() => {
    const groups: { [key: string]: { revenue: number; profit: number; count: number } } = {};
    
    // Create baseline for latest 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" });
      groups[dayStr] = { revenue: 0, profit: 0, count: 0 };
    }

    orders.filter(o => o.status !== "Đã hủy").forEach(o => {
      const date = new Date(o.createdAt);
      const dayStr = date.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" });
      if (groups[dayStr] !== undefined) {
        groups[dayStr].revenue += o.totalAmount;
        groups[dayStr].profit += o.totalProfit;
        groups[dayStr].count += 1;
      }
    });

    return Object.keys(groups).map(day => ({
      date: day,
      "Doanh thu": groups[day].revenue,
      "Lợi nhuận": groups[day].profit,
      "Đơn hàng": groups[day].count
    }));
  }, [orders]);

  // Best selling products
  const bestSellers = useMemo(() => {
    const itemsMap: { [key: string]: { name: string; qty: number; revenue: number } } = {};
    orders.filter(o => o.status !== "Đã hủy").forEach(o => {
      o.items.forEach(itm => {
        if (!itemsMap[itm.mealId]) {
          itemsMap[itm.mealId] = { name: itm.mealName, qty: 0, revenue: 0 };
        }
        itemsMap[itm.mealId].qty += itm.quantity;
        itemsMap[itm.mealId].revenue += itm.price * itm.quantity;
      });
    });

    return Object.values(itemsMap)
      .sort((a,b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders]);

  const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#6366f1", "#ef4444", "#ec4899", "#8b5cf6"];

  return (
    <div id="dashboard-tab-view" className="space-y-6">
      {/* Upper Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div id="card-revenue" className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doanh thu ròng</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2 tracking-tight">{formatVND(stats.totalRevenue)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Tối ưu hóa lợi nhuận real-time</span>
          </div>
        </div>

        <div id="card-profit" className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lợi nhuận thực tế</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2 tracking-tight">{formatVND(stats.totalProfit)}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span>Chi phí vốn ròng: {formatVND(stats.totalCost)}</span>
          </div>
        </div>

        <div id="card-orders" className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng đơn hàng</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2 tracking-tight">{stats.totalOrdersCount} đơn</h3>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex gap-3 text-xs text-slate-500">
            <span className="flex items-center text-orange-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              {stats.counts.new} Mới
            </span>
            <span className="flex items-center text-sky-600 font-medium">
              <Truck className="w-3.5 h-3.5 mr-1" />
              {stats.counts.delivering} Đang phát
            </span>
          </div>
        </div>

        <div id="card-margin" className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tỷ suất lãi suất gộp</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2 tracking-tight">{stats.profitMargin}%</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>{customersCount} khách hàng đăng ký</span>
          </div>
        </div>
      </div>

      {/* Real-time Order Actions Alert bar */}
      {stats.counts.new > 0 && (
        <div id="pending-orders-alert" className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shrink-0" />
            <div>
              <strong className="font-semibold text-amber-900">Tính năng thông báo:</strong> Bạn đang có {stats.counts.new} đơn hàng mới cần xác nhận, chuẩn bị & in hóa đơn cho khách.
            </div>
          </div>
          <button 
            id="btn-navigate-orders"
            onClick={() => onNavigate("orders")} 
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-lg scroll-smooth transition-colors shrink-0"
          >
            Xử lý ngay
          </button>
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Timeline Line Chart */}
        <div id="chart-sales-timeline" className="lg:col-span-2 bg-white border border-slate-100 p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-800 text-sm tracking-tight text-left">Hành trình Doanh thu & Lợi nhuận (7 Ngày qua)</h4>
            <span className="text-xs text-emerald-600 font-medium flex items-center bg-emerald-50 px-2.5 py-1 rounded-full">
              Real-time update
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  formatter={(value: any) => [formatVND(Number(value)), ""]}
                  contentStyle={{ backgroundColor: "#1e293b", color: "#f8fafc", borderRadius: "8px", fontSize: "12px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", pt: 10 }} />
                <Line type="monotone" dataKey="Doanh thu" stroke="#0ea5e9" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Lợi nhuận" stroke="#10b981" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div id="chart-category-share" className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm">
          <h4 className="font-bold text-slate-800 text-sm tracking-tight text-left mb-4">Doanh thu theo Nhóm Món</h4>
          <div className="h-60 flex items-center justify-center relative">
            {categoryData.length === 0 ? (
              <p className="text-xs text-slate-400">Không có dữ liệu bán hàng</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="revenue"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatVND(Number(value)), "Doanh thu"]} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {categoryData.length > 0 && (
              <div className="absolute text-center">
                <p className="text-2xl font-bold text-slate-800">{categoryData.length}</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Nhóm hàng</p>
              </div>
            )}
          </div>
          
          {/* Custom Labels for share chart */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryData.slice(0, 4).map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate">{item.name}</span>
                <span className="font-semibold text-slate-800 ml-auto">{formatVND(item.revenue).replace("₫", "")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Best selling items + Real-time activity log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top selling food items list */}
        <div id="top-selling-meals" className="lg:col-span-2 bg-white border border-slate-100 p-5 rounded-xl shadow-sm">
          <h4 className="font-bold text-slate-800 text-sm tracking-tight text-left mb-4">Danh sách Món ăn bán chạy hàng đầu</h4>
          {bestSellers.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">Chưa ghi nhận số liệu bán hàng.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Tên Món</th>
                    <th className="py-2.5 px-3 text-center">Đã bán (Khối lượng)</th>
                    <th className="py-2.5 px-3 text-right">Tổng Doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bestSellers.map((itm, i) => (
                    <tr key={itm.name} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-medium text-slate-800 flex items-center gap-2">
                        <span className="w-5 h-5 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                          #{i+1}
                        </span>
                        {itm.name}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium text-slate-800">{itm.qty} suất</td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-800">{formatVND(itm.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Real-time Order Actions logs */}
        <div id="latest-activities" className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm tracking-tight text-left mb-4">Trạng thái phát đơn mới nhất</h4>
            <div className="space-y-4">
              {orders.slice(0, 4).map((o, index) => (
                <div key={o.id} className="flex gap-3 text-xs items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    o.status === "Đã giao" ? "bg-emerald-500" : 
                    o.status === "Đang giao" ? "bg-sky-500" : 
                    o.status === "Đang xử lý" ? "bg-amber-500" : "bg-red-500"
                  }`} />
                  <div className="flex-1 text-left">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">{o.customerName}</span>
                      <span className="text-slate-400 text-[10px] font-normal">
                        {new Date(o.createdAt).toLocaleTimeString("vi-VN", { hour: "numeric", minute: "numeric" })}
                      </span>
                    </div>
                    <p className="text-slate-500">{o.items.length} món • {formatVND(o.totalAmount)}</p>
                    <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-md mt-1 ${
                      o.status === "Đã giao" ? "bg-emerald-50 text-emerald-700" :
                      o.paymentStatus === "Đã thanh toán" ? "bg-indigo-50 text-indigo-700" : 
                      o.status === "Mới" ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-500"
                    }`}>
                      {o.status} ({o.paymentStatus})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button 
            id="view-all-orders-btn"
            onClick={() => onNavigate("orders")} 
            className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg text-xs transition-colors"
          >
            Đi tới danh sách đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}
