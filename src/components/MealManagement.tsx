import React, { useState, useMemo } from "react";
import { MealItem, INITIAL_MEAL_ITEMS, PricingOption } from "../data/mealPrepData";
import { 
  Grid, 
  Search, 
  Plus, 
  Trash2, 
  X, 
  Calculator, 
  Percent, 
  DollarSign, 
  Tag, 
  TrendingUp, 
  PlusCircle,
  TrendingDown
} from "lucide-react";

interface MealManagementProps {
  meals: MealItem[];
  setMeals: React.Dispatch<React.SetStateAction<MealItem[]>>;
}

export default function MealManagement({ meals, setMeals }: MealManagementProps) {
  const [searchTerm, setSearchTerm] = useState<string>("_default_no_search");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New meal form fields
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [category, setCategory] = useState<string>("Ức gà");
  const [customCategory, setCustomCategory] = useState<string>("");
  
  // Packings/weights checklist for new meals
  const [has100g, setHas100g] = useState<boolean>(true);
  const [p100, setP100] = useState<number>(25000);
  const [c100, setC100] = useState<number>(16000);

  const [has150g, setHas150g] = useState<boolean>(true);
  const [p150, setP150] = useState<number>(36000);
  const [c150, setC150] = useState<number>(24000);

  const [has200g, setHas200g] = useState<boolean>(true);
  const [p200, setP200] = useState<number>(48000);
  const [c200, setC200] = useState<number>(32000);

  const [isCombo, setIsCombo] = useState<boolean>(false);
  const [pCombo, setPCombo] = useState<number>(219000);
  const [cCombo, setCCombo] = useState<number>(172000);

  // Safe Search Term
  const computedSearchTerm = useMemo(() => {
    return searchTerm === "_default_no_search" ? "" : searchTerm;
  }, [searchTerm]);

  // Format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  // Extract all categories currently present
  const categories = useMemo(() => {
    const set = new Set(meals.map(m => m.category));
    return ["Tất cả", ...Array.from(set)];
  }, [meals]);

  // Filter meals
  const filteredMeals = useMemo(() => {
    return meals.filter(m => {
      const matchCat = selectedCategory === "Tất cả" || m.category === selectedCategory;
      const term = computedSearchTerm.toLowerCase();
      const matchSearch = computedSearchTerm === "" || 
        m.name.toLowerCase().includes(term) ||
        m.code.toLowerCase().includes(term) ||
        m.category.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [meals, selectedCategory, computedSearchTerm]);

  // Submit and save new meal
  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      alert("Vui lòng nhập tên và mã của suất ăn!");
      return;
    }

    const finalCategory = category === "OTHER" ? customCategory : category;
    if (!finalCategory) {
      alert("Vui lòng ghi nhận tên nhóm món ăn!");
      return;
    }

    const options: PricingOption[] = [];

    if (isCombo) {
      const profit = pCombo - cCombo;
      const margin = pCombo > 0 ? Math.round((profit / pCombo) * 100) : 0;
      options.push({ weight: "Combo", price: pCombo, cost: cCombo, profit, margin });
    } else {
      if (has100g) {
        const profit = p100 - c100;
        const margin = p100 > 0 ? Math.round((profit / p100) * 100) : 0;
        options.push({ weight: "100g", price: p100, cost: c100, profit, margin });
      }
      if (has150g) {
        const profit = p150 - c150;
        const margin = p150 > 0 ? Math.round((profit / p150) * 100) : 0;
        options.push({ weight: "150g", price: p150, cost: c150, profit, margin });
      }
      if (has200g) {
        const profit = p200 - c200;
        const margin = p200 > 0 ? Math.round((profit / p200) * 100) : 0;
        options.push({ weight: "200g", price: p200, cost: c200, profit, margin });
      }
    }

    if (options.length === 0) {
      alert("Suất cơm phải có ít nhất 1 loại trọng lượng bán hàng!");
      return;
    }

    const newItem: MealItem = {
      id: `meal-${Date.now()}`,
      name,
      code,
      category: finalCategory,
      options
    };

    setMeals(prev => [newItem, ...prev]);

    // reset forms
    setShowAddModal(false);
    setName("");
    setCode("");
    setCategory("Ức gà");
    setCustomCategory("");
    setHas100g(true);
    setHas150g(true);
    setHas200g(true);
    setIsCombo(false);
  };

  const handleDeleteMeal = (id: string) => {
    const confirmation = window.confirm("Xác nhận gỡ món này khỏi danh mục bán hàng hoạt động của bếp?");
    if (confirmation) {
      setMeals(meals.filter(m => m.id !== id));
    }
  };

  const handleResetFromSheet = () => {
    const confirmReset = window.confirm(
      `Xác nhận ghi đè toàn bộ danh mục hiện tại để nạp lại đầy đủ ${INITIAL_MEAL_ITEMS.length} món ăn & gói combo từ Sheet mới nhất?`
    );
    if (confirmReset) {
      setMeals(INITIAL_MEAL_ITEMS);
      alert("Đã khôi phục và cập nhật đầy đủ toàn bộ 75 suất ăn & gói combo chuẩn từ Sheet thành công!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Informative Synchronize banner from Sheet */}
      <div className="bg-gradient-to-r from-emerald-50 to-indigo-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs sm:text-sm">
            <Calculator className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
            ĐỒNG BỘ DỮ LIỆU THỰC ĐƠN & COMBO GỐC TỪ SHEET ({INITIAL_MEAL_ITEMS.length} SUẤT)
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
            Hệ thống đã nạp đầy đủ đơn giá, giá vốn nguyên liệu (Cost), lợi nhuận và CODE riêng từng món từ Google Sheet mới nhất của bếp. 
            Nếu bạn đang thiếu món hoặc muốn cập nhật nhanh, hãy nhấn vào phím bên phải để đồng bộ tức thì.
          </p>
        </div>
        <button
          onClick={handleResetFromSheet}
          className="shrink-0 bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Đồng bộ lại từ Sheet ⚡
        </button>
      </div>

      {/* Top filter and actions panels */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input 
            type="text" 
            placeholder="Tìm món: Tên, mã sản phẩm CODE..." 
            value={computedSearchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs border border-slate-200 focus:border-indigo-500 rounded-lg pl-9 pr-4 py-2 bg-slate-50 text-slate-700 outline-none"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        {/* Categories selector & Add product */}
        <div className="w-full sm:w-auto flex flex-wrap gap-2 justify-end">
          <div className="flex flex-wrap gap-1">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${
                  selectedCategory === cat 
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" 
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button 
            id="btn-trigger-add-meal"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            Thêm món ăn mới
          </button>
        </div>
      </div>

      {/* Grid of Food Cards with packing/prices list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMeals.map(meal => (
          <div key={meal.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            {/* Upper label info */}
            <div className="p-4 border-b border-slate-50 relative">
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100/70 p-1 px-2.5 rounded-full">
                {meal.category}
              </span>
              <button 
                type="button" 
                onClick={() => handleDeleteMeal(meal.id)}
                className="absolute right-3 top-3 text-slate-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                title="Xóa món ăn"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <h4 id={`meal-card-${meal.code}`} className="font-bold text-slate-800 text-sm tracking-tight mt-3 text-left">
                {meal.name}
              </h4>
              <p className="text-[10px] text-indigo-600 font-mono font-bold mt-1 text-left">CODE: {meal.code}</p>
            </div>

            {/* Packing / Cost / Profit rates catalog */}
            <div className="p-4 bg-slate-50/50 space-y-3">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Bảng giá dán nhãn</h5>
              
              <div className="space-y-2">
                {meal.options.map((opt, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 p-2.5 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-700 text-xs">Khối lượng: {opt.weight}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Giá gốc nguyên liệu: {formatVND(opt.cost)}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-indigo-700">{formatVND(opt.price)}</div>
                      <div className="flex gap-1.5 items-center justify-end text-[10px] font-semibold">
                        <span className="text-emerald-600">Lợi ích: +{formatVND(opt.profit).replace("₫", "")}</span>
                        <span className="text-rose-500 bg-rose-50 px-1 py-0.2 rounded font-bold">{opt.margin}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom info footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100/50 text-center flex items-center justify-center text-[11px] text-emerald-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              Tỷ suất lợi nhuận trung bình: ~{Math.round(meal.options.reduce((sum, o) => sum + o.margin, 0) / meal.options.length)}%
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD MEAL WITH MULTIPLE PACKS */}
      {showAddModal && (
        <div id="add-meal-backdrop" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white border rounded-2xl w-full max-w-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-indigo-50/50">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-700" />
                <h3 className="font-bold text-slate-800 text-sm">Thêm món ăn MealPrep mới</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMeal} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-600">
              {/* Core Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tên Suất ăn *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ức gà sốt tiêu xanh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none font-semibold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mã sản phẩm CODE *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="MF-CG-TX"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none font-bold text-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nhóm danh mục</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none font-semibold text-slate-700"
                  >
                    <option value="Ức gà">Ức gà</option>
                    <option value="Đùi gà">Đùi gà</option>
                    <option value="Cốt lết">Cốt lết</option>
                    <option value="Nạc heo">Nạc heo</option>
                    <option value="Thăn bò">Thăn bò</option>
                    <option value="Tôm">Tôm</option>
                    <option value="Cá hồi">Cá hồi</option>
                    <option value="Cá tầm">Cá tầm</option>
                    <option value="Cá bóp">Cá bóp</option>
                    <option value="Combo">Trọn gói Combo</option>
                    <option value="OTHER">Nhóm khác (Điền tay)...</option>
                  </select>
                </div>

                {category === "OTHER" && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ghi rõ nhóm món mới *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Nước ép / Salad..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Packings selection check & price ratios inputs */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="checkbox"
                    id="checkbox-is-combo"
                    checked={isCombo}
                    onChange={(e) => setIsCombo(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="checkbox-is-combo" className="font-bold text-slate-700">Dòng sản phẩm combo trọn gói</label>
                </div>

                {isCombo ? (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-amber-900 mb-1">Giá bán Combo (VND)</label>
                      <input 
                        type="number"
                        value={pCombo}
                        onChange={(e) => setPCombo(Number(e.target.value))}
                        className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-amber-900 mb-1">Giá vốn Cost (VND)</label>
                      <input 
                        type="number"
                        value={cCombo}
                        onChange={(e) => setCCombo(Number(e.target.value))}
                        className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white font-bold"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="font-bold text-slate-700 text-xs">Cấu hình các mức trọng lượng đóng hộp:</p>
                    
                    {/* Size 100g */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 w-24">
                        <input 
                          type="checkbox"
                          checked={has100g}
                          onChange={(e) => setHas100g(e.target.checked)}
                          className="w-3.5 h-3.5"
                        />
                        <span className="font-bold text-slate-700">Hộp 100g</span>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                        <div>
                          <label className="block text-[9px] text-slate-400">Giá bán (VND)</label>
                          <input 
                            type="number" 
                            disabled={!has100g}
                            value={p100}
                            onChange={(e) => setP100(Number(e.target.value))}
                            className="w-full border p-1 rounded-md text-center font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400">Giá vốn (VND)</label>
                          <input 
                            type="number" 
                            disabled={!has100g}
                            value={c100}
                            onChange={(e) => setC100(Number(e.target.value))}
                            className="w-full border p-1 rounded-md text-center"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Size 150g */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 w-24">
                        <input 
                          type="checkbox"
                          checked={has150g}
                          onChange={(e) => setHas150g(e.target.checked)}
                          className="w-3.5 h-3.5"
                        />
                        <span className="font-bold text-slate-700">Hộp 150g</span>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                        <div>
                          <label className="block text-[9px] text-slate-400">Giá bán (VND)</label>
                          <input 
                            type="number" 
                            disabled={!has150g}
                            value={p150}
                            onChange={(e) => setP150(Number(e.target.value))}
                            className="w-full border p-1 rounded-md text-center font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400">Giá vốn (VND)</label>
                          <input 
                            type="number" 
                            disabled={!has150g}
                            value={c150}
                            onChange={(e) => setC150(Number(e.target.value))}
                            className="w-full border p-1 rounded-md text-center"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Size 200g */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 w-24">
                        <input 
                          type="checkbox"
                          checked={has200g}
                          onChange={(e) => setHas200g(e.target.checked)}
                          className="w-3.5 h-3.5"
                        />
                        <span className="font-bold text-slate-700">Hộp 200g</span>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                        <div>
                          <label className="block text-[9px] text-slate-400">Giá bán (VND)</label>
                          <input 
                            type="number" 
                            disabled={!has200g}
                            value={p200}
                            onChange={(e) => setP200(Number(e.target.value))}
                            className="w-full border p-1 rounded-md text-center font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400">Giá vốn (VND)</label>
                          <input 
                            type="number" 
                            disabled={!has200g}
                            value={c200}
                            onChange={(e) => setC200(Number(e.target.value))}
                            className="w-full border p-1 rounded-md text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                  id="btn-sub-save-meal"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-sm transition-transform cursor-pointer"
                >
                  Xây dựng món ăn & Bảng giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
