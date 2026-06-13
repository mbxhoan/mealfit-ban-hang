import React, { useState, useEffect } from "react";
import { 
  INITIAL_ORDERS, 
  INITIAL_CUSTOMERS, 
  INITIAL_MEAL_ITEMS, 
  Order, 
  Customer, 
  MealItem 
} from "./data/mealPrepData";
import { fetchUserInfo, DriveUserInfo, getAccessToken, saveManualToken, getSavedManualToken } from "./services/googleDriveService";
import Dashboard from "./components/Dashboard";
import OrderManagement from "./components/OrderManagement";
import MealManagement from "./components/MealManagement";
import CustomerManagement from "./components/CustomerManagement";
import ReportView from "./components/ReportView";
import { 
  Grid, 
  ShoppingBag, 
  Tag, 
  Users, 
  TrendingUp, 
  Cloud,
  CheckCircle,
  LogOut,
  Settings,
  Shield,
  HeartPulse,
  Save
} from "lucide-react";

export default function App() {
  // Tabs: "dashboard" | "orders" | "meals" | "customers" | "reports" | "gdrive"
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Local state with LocalStorage persistence helper
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("mealprep_orders_v2");
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [meals, setMeals] = useState<MealItem[]>(() => {
    const saved = localStorage.getItem("mealprep_meals_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length < 50) {
          return INITIAL_MEAL_ITEMS;
        }
        return parsed;
      } catch (e) {
        return INITIAL_MEAL_ITEMS;
      }
    }
    return INITIAL_MEAL_ITEMS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem("mealprep_customers_v2");
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  // Google OAuth state
  const [manualToken, setManualToken] = useState<string>(getSavedManualToken());
  const [driveUser, setDriveUser] = useState<DriveUserInfo | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("mealprep_orders_v2", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("mealprep_meals_v2", JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem("mealprep_customers_v2", JSON.stringify(customers));
  }, [customers]);

  // Load User Info if Access Token is cached
  const attemptLoadUserInfo = async (tokenToUse?: string) => {
    const tok = tokenToUse || getAccessToken();
    if (tok) {
      setCheckingAuth(true);
      const user = await fetchUserInfo(tok);
      if (user) {
        setDriveUser(user);
      } else {
        // failed or expired, clean up
        setDriveUser(null);
      }
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    attemptLoadUserInfo();
  }, []);

  const handleApplyManualToken = async (e: React.FormEvent) => {
    e.preventDefault();
    saveManualToken(manualToken);
    if (manualToken) {
      await attemptLoadUserInfo(manualToken);
      alert("Đã kết nối tài khoản Google Drive thành công!");
    } else {
      setDriveUser(null);
      alert("Đã ngắt kết nối tài khoản.");
    }
  };

  const handleLogoutDrive = () => {
    saveManualToken("");
    setManualToken("");
    setDriveUser(null);
    alert("Đã ngắt kết nối tài khoản Google Drive.");
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden antialiased">
      {/* Left Sidebar */}
      <aside className="w-64 bg-slate-800 text-slate-300 flex flex-col border-r border-slate-700 shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-slate-700">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900 font-extrabold shadow-sm">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-white font-bold text-sm tracking-tight block">MealPrep Pro</span>
            <span className="text-[9px] text-emerald-400 block font-semibold uppercase tracking-wider">CRM System</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Quản lý chính</div>
          
          {/* Dashboard tab */}
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-md transition-all text-left w-full ${
              activeTab === "dashboard"
                ? "bg-slate-900 text-white border-l-4 border-emerald-500"
                : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
            }`}
          >
            <Grid className="w-4 h-4 text-slate-400" />
            Tổng quan Dashboard
          </button>

          {/* Orders tab */}
          <button
            id="tab-btn-orders"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-md transition-all text-left w-full relative ${
              activeTab === "orders"
                ? "bg-slate-900 text-white border-l-4 border-emerald-500"
                : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-slate-400" />
            <span>Đơn hàng</span>
            {orders.filter(o => o.status === "Mới").length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                {orders.filter(o => o.status === "Mới").length}
              </span>
            )}
          </button>

          {/* Meals tab */}
          <button
            id="tab-btn-meals"
            onClick={() => setActiveTab("meals")}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-md transition-all text-left w-full ${
              activeTab === "meals"
                ? "bg-slate-900 text-white border-l-4 border-emerald-500"
                : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
            }`}
          >
            <Tag className="w-4 h-4 text-slate-400" />
            Thực đơn & Gói món
          </button>

          <div className="pt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Vận hành</div>

          {/* Customers tab */}
          <button
            id="tab-btn-customers"
            onClick={() => setActiveTab("customers")}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-md transition-all text-left w-full ${
              activeTab === "customers"
                ? "bg-slate-900 text-white border-l-4 border-emerald-500"
                : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 text-slate-400" />
            Khách hàng
          </button>

          {/* Reports tab */}
          <button
            id="tab-btn-reports"
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-md transition-all text-left w-full ${
              activeTab === "reports"
                ? "bg-slate-900 text-white border-l-4 border-emerald-500"
                : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-slate-400" />
            Báo cáo doanh thu
          </button>

          {/* Google Drive setup tab */}
          <button
            id="tab-btn-gdrive"
            onClick={() => setActiveTab("gdrive")}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-md transition-all text-left w-full ${
              activeTab === "gdrive"
                ? "bg-slate-900 text-white border-l-4 border-emerald-500"
                : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            Kết nối Google Drive
          </button>
        </nav>

        {/* Sidebar avatar status */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
              AD
            </div>
            <div className="text-left text-xs">
              <p className="text-white font-medium">Admin Quản lý</p>
              <p className="text-slate-400 text-[10px]">Trực tuyến</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Right Header Navigation */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 select-none">
          <h1 className="text-lg font-semibold text-slate-800 tracking-tight">
            {activeTab === "dashboard" && "Bảng Điều Khiển Tổng Quan"}
            {activeTab === "orders" && "Quản lý Đơn hàng hoạt động"}
            {activeTab === "meals" && "Thực đơn & Bảng giá đóng gói"}
            {activeTab === "customers" && "Hồ sơ Khách hàng & Dinh dưỡng"}
            {activeTab === "reports" && "Phân tích Kết quả Kinh doanh"}
            {activeTab === "gdrive" && "Không gian Lưu trữ Đám mây Drive"}
          </h1>

          {/* Header Controls / Auth details */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md text-xs font-medium text-slate-600">
              <span>Thứ Bảy, 13 Tháng 6</span>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-lg p-1.5 px-3 text-xs">
              <Cloud className={`w-3.5 h-3.5 ${driveUser ? "text-emerald-500" : "text-slate-400"}`} />
              {driveUser ? (
                <div className="flex items-center gap-2 text-left text-[11px]">
                  <span className="text-slate-700 font-bold font-mono truncate max-w-[120px]" title={driveUser.email}>
                    Drive: {driveUser.name}
                  </span>
                  <button 
                    onClick={handleLogoutDrive}
                    className="text-[9px] bg-slate-200 hover:bg-slate-300 font-bold rounded p-0.5 px-1.5 text-slate-600 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setActiveTab("gdrive")} 
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-bold transition-all"
                >
                  Kết nối Drive ↗
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Primary View content panel wrapper */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {activeTab === "dashboard" && (
            <Dashboard 
              orders={orders} 
              meals={meals} 
              customersCount={customers.length} 
              onNavigate={(category) => setActiveTab(category)} 
            />
          )}

          {activeTab === "orders" && (
            <OrderManagement 
              orders={orders} 
              setOrders={setOrders} 
              customers={customers}
              setCustomers={setCustomers}
              meals={meals} 
            />
          )}

          {activeTab === "meals" && (
            <MealManagement 
              meals={meals} 
              setMeals={setMeals} 
            />
          )}

          {activeTab === "customers" && (
            <CustomerManagement 
              customers={customers} 
              setCustomers={setCustomers} 
            />
          )}

          {activeTab === "reports" && (
            <ReportView 
              orders={orders} 
              meals={meals} 
            />
          )}

          {/* GOOGLE DRIVE CONNECTIVITY CONFIGURATION SCREEN */}
          {activeTab === "gdrive" && (
            <div className="max-w-xl mx-auto bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-5 text-left text-xs text-slate-600">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Cloud className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">CẤU HÌNH KẾT NỐI GOOGLE DRIVE</h3>
              </div>

              <p className="leading-relaxed text-slate-500">
                Hệ thống hỗ trợ xuất và lưu trữ tất cả hóa đơn bán hàng trực tiếp lên Google Drive cá nhân của bạn. Bản sao của hóa đơn sẽ được mã hóa an toàn dưới dạng file HTML chuẩn chỉ để in ấn.
              </p>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3">
                <div className="flex gap-2 items-center text-emerald-950 font-bold">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Về quyền riêng tư dữ liệu
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Ứng dụng sử dụng phân quyền tối giản <strong className="font-extrabold text-slate-900">drive.file</strong>. Ứng dụng chỉ có thể đọc và sửa đổi những tập tin do chính ứng dụng này tạo ra trong Google Drive của bạn, không thể can thiệp vào bất kỳ thư mục hay tệp tin cá nhân nào khác hiện có của bạn.
                </p>
              </div>

              {driveUser ? (
                <div className="p-4 border rounded-xl bg-slate-50 space-y-4">
                  <div className="flex gap-3 items-center">
                    {driveUser.picture ? (
                      <img src={driveUser.picture} referrerPolicy="no-referrer" alt="avatar" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 uppercase">
                        {driveUser.name.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <h5 className="font-bold text-slate-800">{driveUser.name}</h5>
                      <p className="text-[10px] text-slate-400 font-medium font-mono">{driveUser.email}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold p-2.5 rounded-lg flex items-center gap-2.5 border border-emerald-100">
                    <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
                    ỦY QUYỀN HOẠT ĐỘNG HOÀN TẤT THÀNH CÔNG! QUÝ BẾP ĐÃ SẴN SÀNG XUẤT BILL LÊN CLOUD.
                  </div>

                  <button 
                    onClick={handleLogoutDrive}
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Ngắt kết nối tài khoản Google Drive
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyManualToken} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Nhập Google User Access Token thủ công</label>
                    <input 
                      type="password"
                      placeholder="ya29.a0Acvdb..."
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      className="w-full text-xs font-mono border focus:border-indigo-500 p-2.5 rounded-lg bg-white outline-none"
                    />
                    <p className="text-[10px] text-slate-400">
                      * Trong môi trường thử nghiệm sandbox, bạn có thể dán trực tiếp Access Token lấy từ Google OAuth Playground (chọn scope drive.file).
                    </p>
                  </div>

                  <button 
                    type="submit"
                    id="btn-apply-token"
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Kích hoạt mã token & Lưu kết nối
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
        
        {/* Simple branding footer inside workspace frame */}
        <footer className="bg-white border-t border-slate-200 py-3 text-center text-[10px] text-slate-400 font-medium tracking-wide shrink-0">
          <p>© 2026 MEALPREP CRM • HỆ THỐNG QUẢN LÝ BÁN HÀNG THỰC ĐƠN YÊU THƯƠNG | TỰ ĐỘNG LƯU TRỮ TRÊN TRÌNH DUYỆT & GOOGLE DRIVE</p>
        </footer>
      </div>
    </div>
  );
}
