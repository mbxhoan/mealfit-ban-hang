import React, { useState, useMemo } from "react";
import { Customer } from "../data/mealPrepData";
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  X, 
  Sliders, 
  Phone, 
  MapPin, 
  Mail, 
  Sparkles,
  Award,
  BookOpen
} from "lucide-react";

interface CustomerManagementProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export default function CustomerManagement({ customers, setCustomers }: CustomerManagementProps) {
  const [searchTerm, setSearchTerm] = useState<string>("_default_no_search");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New customer registration form fields
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Safe Search Term
  const computedSearchTerm = useMemo(() => {
    return searchTerm === "_default_no_search" ? "" : searchTerm;
  }, [searchTerm]);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  const filteredCustomers = useMemo(() => {
    const term = computedSearchTerm.toLowerCase();
    return customers.filter(c => {
      return computedSearchTerm === "" || 
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.address.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.notes && c.notes.toLowerCase().includes(term));
    });
  }, [customers, computedSearchTerm]);

  // Handle registering customer
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert("Vui lòng nhập họ tên, điện thoại và địa chỉ giao hàng!");
      return;
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name,
      phone,
      email: email || "khach.hang@gmail.com",
      address,
      notes,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().split("T")[0]
    };

    setCustomers(prev => [...prev, newCustomer]);

    // reset and close
    setShowAddModal(false);
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setNotes("");
  };

  const handleDeleteCustomer = (id: string) => {
    const confirmation = window.confirm("Xác nhận ngừng quản lý hồ sơ khách hàng này?");
    if (confirmation) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and triggers row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
        {/* Search tool */}
        <div className="relative w-full sm:w-80">
          <input 
            type="text" 
            placeholder="Tìm khách hàng: Tên, điện thoại, địa chỉ, sở thích ăn uống..." 
            value={computedSearchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs border border-slate-200 focus:border-indigo-500 rounded-lg pl-9 pr-4 py-2 bg-slate-50 text-slate-700 outline-none"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        {/* Action Button */}
        <button 
          id="btn-trigger-add-customer"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm cursor-pointer ml-auto sm:ml-0"
        >
          <Plus className="w-4 h-4" />
          Đăng ký hồ sơ khách hàng
        </button>
      </div>

      {/* Grid of registered customer details cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCustomers.map(customer => {
          // Tier labelling based on total spent
          const isVip = customer.totalSpent > 3000000;
          
          return (
            <div key={customer.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-5 relative select-none">
              <button 
                type="button" 
                onClick={() => handleDeleteCustomer(customer.id)}
                className="absolute right-4 top-4 text-slate-300 hover:text-red-500 p-1 rounded-full transition-colors"
                title="Xóa khách hàng"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="space-y-3.5 text-left">
                {/* Header identity */}
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 font-extrabold text-indigo-700 flex items-center justify-center text-sm uppercase">
                    {customer.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                      {customer.name}
                      {isVip && (
                        <span className="flex items-center gap-0.5 bg-amber-50 text-amber-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border border-amber-200">
                          <Award className="w-3 h-3 text-amber-500" />
                          HỘI VIÊN THÂN THIẾT (VIP)
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Khách hàng từ {customer.createdAt}</div>
                  </div>
                </div>

                {/* Contact info list */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold font-mono">{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-relaxed">{customer.address}</span>
                  </div>
                </div>

                {/* Health preferences & Dietary guidelines notes */}
                <div className="bg-emerald-50/50 border-l-3 border-emerald-500 rounded p-2.5 text-[11px]">
                  <div className="font-bold text-emerald-800 mb-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Chế độ dinh dưỡng đặc biệt / Ghi chú bếp:
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {customer.notes || "Khách ăn uống bình thường, không có yêu cầu dị ứng hay kiêng cữ đặc biệt."}
                  </p>
                </div>
              </div>

              {/* Purchase statistics tracking */}
              <div className="border-t border-slate-50 pt-3.5 mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Đơn đã đặt</div>
                  <div className="font-extrabold text-slate-800 mt-1">{customer.totalOrders} đơn</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Tổng chi tiêu</div>
                  <div className="font-extrabold text-indigo-700 mt-1">{formatVND(customer.totalSpent)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: REGISTER NEW CUSTOMET INFO */}
      {showAddModal && (
        <div id="add-customer-backdrop" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white border rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-indigo-50/50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-700" />
                <h3 className="font-bold text-slate-800 text-sm">Đăng ký Hồ sơ Khách hàng mới</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-600">
              <div className="space-y-4 text-left">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Họ tên khách hàng *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nguyễn Thị B"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2.5 rounded-lg bg-white outline-none font-semibold text-slate-700 focus:border-indigo-500"
                  />
                </div>

                {/* Phone & email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Số điện thoại liên lạc *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="09..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs border border-slate-200 p-2.5 rounded-lg bg-white outline-none font-bold text-slate-700 font-mono focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email (Tùy chọn)</label>
                    <input 
                      type="email"
                      placeholder="email@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs border border-slate-200 p-2.5 rounded-lg bg-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Địa chỉ giao nhận cơm thường trú *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Chung cư Vinhomes Central Park, Bình Thạnh"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2.5 rounded-lg bg-white outline-none focus:border-indigo-500 text-slate-700"
                  />
                </div>

                {/* Health & kitchen notes */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ghi chú khẩu vị & mục tiêu (Tăng cơ / Giảm mỡ / Dị ứng nguyên liệu)</label>
                  <textarea 
                    rows={3}
                    placeholder="Ví dụ: Hội viên Gym gắt gao. Chỉ ăn ức gà không da, không hành tỏi, không thêm bột ngọt. Giao mốc 11h trưa."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2.5 rounded-lg bg-white outline-none focus:border-indigo-500 text-slate-700 leading-relaxed"
                  />
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button 
                  type="submit" 
                  id="btn-sub-save-customer"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-sm transition-transform cursor-pointer"
                >
                  Tạo hồ sơ dinh dưỡng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
