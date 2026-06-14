"use client";

import React, { useState, useMemo } from "react";
import { MealItem, PricingOption } from "../data/mealPrepData";
import { Search, Plus, Trash2, TrendingUp, Save, Tag, Package, Layers, Percent } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { StatStrip, type Stat } from "@/components/ui/StatStrip";
import { useToast } from "@/components/ui/Toast";
import { useIsAdmin } from "@/contexts/AuthContext";
import { Drawer } from "@/components/ui/Drawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";

const CATEGORY_OPTIONS = [
  "Ức gà", "Đùi gà", "Cốt lết", "Nạc heo", "Thăn bò",
  "Tôm", "Cá hồi", "Cá tầm", "Cá bóp", "Combo", "OTHER",
];

export default function MealManagement() {
  const { meals, saveMeal, removeMeal } = useData();
  const toast = useToast();
  const isAdmin = useIsAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<MealItem | null>(null);

  // Form
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("Ức gà");
  const [customCategory, setCustomCategory] = useState("");
  const [isCombo, setIsCombo] = useState(false);
  const [has100g, setHas100g] = useState(true); const [p100, setP100] = useState(25000); const [c100, setC100] = useState(16000);
  const [has150g, setHas150g] = useState(true); const [p150, setP150] = useState(36000); const [c150, setC150] = useState(24000);
  const [has200g, setHas200g] = useState(true); const [p200, setP200] = useState(48000); const [c200, setC200] = useState(32000);
  const [pCombo, setPCombo] = useState(219000); const [cCombo, setCCombo] = useState(172000);

  const formatVND = (num: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);

  const categories = useMemo(() => ["Tất cả", ...Array.from(new Set(meals.map((m) => m.category)))], [meals]);

  const stats: Stat[] = useMemo(() => {
    const combos = meals.filter((m) => m.category === "Combo").length;
    const dishes = meals.length - combos;
    const allMargins = meals.flatMap((m) => m.options.map((o) => o.margin));
    const avgMargin = allMargins.length ? Math.round(allMargins.reduce((s, x) => s + x, 0) / allMargins.length) : 0;
    return [
      { label: "Tổng món/combo", value: meals.length, icon: <Tag className="h-5 w-5" />, accent: "bg-brand-50 text-brand-600" },
      { label: "Món lẻ", value: dishes, sub: `${categories.length - 1} nhóm`, icon: <Package className="h-5 w-5" />, accent: "bg-indigo-50 text-indigo-600" },
      { label: "Combo", value: combos, icon: <Layers className="h-5 w-5" />, accent: "bg-amber-50 text-amber-600" },
      { label: "Lợi nhuận TB", value: `${avgMargin}%`, icon: <Percent className="h-5 w-5" />, accent: "bg-emerald-50 text-emerald-600" },
    ];
  }, [meals, categories]);

  const filteredMeals = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return meals.filter((m) => {
      const matchCat = selectedCategory === "Tất cả" || m.category === selectedCategory;
      const matchSearch =
        term === "" || m.name.toLowerCase().includes(term) || m.code.toLowerCase().includes(term) || m.category.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [meals, selectedCategory, searchTerm]);

  const openDrawer = () => {
    setName(""); setCode(""); setCategory("Ức gà"); setCustomCategory("");
    setIsCombo(false); setHas100g(true); setHas150g(true); setHas200g(true);
    setDrawerOpen(true);
  };

  const buildOption = (weight: string, price: number, cost: number): PricingOption => {
    const profit = price - cost;
    return { weight, price, cost, profit, margin: price > 0 ? Math.round((profit / price) * 100) : 0 };
  };

  const handleSave = async () => {
    const finalCategory = isCombo ? "Combo" : category === "OTHER" ? customCategory.trim() : category;
    if (!name.trim() || !code.trim()) return toast.error("Vui lòng nhập tên và mã CODE của món.");
    if (!finalCategory) return toast.error("Vui lòng ghi rõ tên nhóm món.");

    const options: PricingOption[] = [];
    if (isCombo) {
      if (pCombo <= 0) return toast.error("Giá bán combo phải > 0.");
      options.push(buildOption("Combo", pCombo, cCombo));
    } else {
      if (has100g) options.push(buildOption("100g", p100, c100));
      if (has150g) options.push(buildOption("150g", p150, c150));
      if (has200g) options.push(buildOption("200g", p200, c200));
    }
    if (options.length === 0) return toast.error("Phải có ít nhất 1 mức trọng lượng bán hàng.");
    if (options.some((o) => o.price < o.cost)) return toast.error("Giá bán không được nhỏ hơn giá vốn.");

    setSaving(true);
    const item: MealItem = { id: `meal-${Date.now()}`, name: name.trim(), code: code.trim(), category: finalCategory, options };
    try {
      await saveMeal(item);
      toast.success(`Đã thêm món "${item.name}".`);
      setDrawerOpen(false);
    } catch {
      toast.error("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    const item = confirm;
    setConfirm(null);
    try {
      await removeMeal(item);
      toast.success(`Đã gỡ "${item.name}" khỏi danh mục.`);
    } catch {
      toast.error("Xóa thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      <StatStrip stats={stats} />

      {/* Filter + actions */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Tìm món: tên, mã CODE…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-700 outline-none focus:border-brand-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>
        <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                  selectedCategory === cat
                    ? "border-brand-200 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {isAdmin && (
            <Button icon={<Plus />} onClick={openDrawer} className="ml-auto sm:ml-0">
              Thêm món
            </Button>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredMeals.map((meal) => (
          <div key={meal.id} className="flex flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="relative border-b border-slate-50 p-4">
              <span className="rounded-full bg-slate-100/70 p-1 px-2.5 text-[10px] font-bold uppercase text-slate-400">{meal.category}</span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setConfirm(meal)}
                  className="absolute right-3 top-3 rounded-full p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Xóa món ăn"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <h4 className="mt-3 text-left text-sm font-bold tracking-tight text-slate-800">{meal.name}</h4>
              <p className="mt-1 text-left font-mono text-[10px] font-bold text-brand-600">CODE: {meal.code}</p>
            </div>

            <div className="space-y-3 bg-slate-50/50 p-4">
              <h5 className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Bảng giá</h5>
              <div className="space-y-2">
                {meal.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2.5 text-xs">
                    <div>
                      <div className="text-xs font-bold text-slate-700">Khối lượng: {opt.weight}</div>
                      <div className="text-[10px] font-medium text-slate-400">Giá vốn: {formatVND(opt.cost)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-brand-700">{formatVND(opt.price)}</div>
                      <div className="flex items-center justify-end gap-1.5 text-[10px] font-semibold">
                        <span className="text-emerald-600">+{formatVND(opt.profit).replace("₫", "")}</span>
                        <span className="rounded bg-rose-50 px-1 font-bold text-rose-500">{opt.margin}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center border-t border-slate-100/50 bg-slate-50 p-3 text-center text-[11px] font-bold text-emerald-600">
              <TrendingUp className="mr-1 h-3.5 w-3.5" />
              Lợi nhuận TB: ~{Math.round(meal.options.reduce((s, o) => s + o.margin, 0) / meal.options.length)}%
            </div>
          </div>
        ))}
      </div>

      {filteredMeals.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-400">
          <Tag className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          Không tìm thấy món nào.
        </div>
      )}

      {/* Drawer form */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Thêm món ăn mới"
        subtitle="Cấu hình giá theo từng mức trọng lượng"
        widthClass="max-w-lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Button icon={<Save />} loading={saving} onClick={handleSave}>Lưu món ăn</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Tên suất ăn" required>
              <input className={inputClass} placeholder="Ức gà sốt tiêu xanh" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Mã CODE" required>
              <input className={`${inputClass} font-mono`} placeholder="MF-CG-TX" value={code} onChange={(e) => setCode(e.target.value)} />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <input type="checkbox" checked={isCombo} onChange={(e) => setIsCombo(e.target.checked)} className="h-4 w-4 rounded" />
            Dòng sản phẩm combo trọn gói
          </label>

          {isCombo ? (
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <Field label="Giá bán combo (đ)" required>
                <input type="number" className={inputClass} value={pCombo} onChange={(e) => setPCombo(Number(e.target.value))} />
              </Field>
              <Field label="Giá vốn (đ)" required>
                <input type="number" className={inputClass} value={cCombo} onChange={(e) => setCCombo(Number(e.target.value))} />
              </Field>
            </div>
          ) : (
            <>
              <Field label="Nhóm danh mục">
                <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c === "OTHER" ? "Nhóm khác (điền tay)…" : c}</option>
                  ))}
                </select>
              </Field>
              {category === "OTHER" && (
                <Field label="Tên nhóm mới" required>
                  <input className={inputClass} placeholder="Salad / Nước ép…" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />
                </Field>
              )}

              <p className="text-xs font-bold text-slate-700">Cấu hình các mức trọng lượng:</p>
              {([
                ["Hộp 100g", has100g, setHas100g, p100, setP100, c100, setC100],
                ["Hộp 150g", has150g, setHas150g, p150, setP150, c150, setC150],
                ["Hộp 200g", has200g, setHas200g, p200, setP200, c200, setC200],
              ] as const).map(([label, on, setOn, price, setPrice, cost, setCost], i) => (
                <div key={i} className="flex flex-col items-start gap-3 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center">
                  <label className="flex w-24 items-center gap-2 text-xs font-bold text-slate-700">
                    <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="h-3.5 w-3.5" />
                    {label}
                  </label>
                  <div className="grid w-full flex-1 grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[9px] text-slate-400">Giá bán (đ)</span>
                      <input type="number" disabled={!on} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full rounded-md border border-slate-200 p-1 text-center font-bold disabled:opacity-50" />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400">Giá vốn (đ)</span>
                      <input type="number" disabled={!on} value={cost} onChange={(e) => setCost(Number(e.target.value))} className="w-full rounded-md border border-slate-200 p-1 text-center disabled:opacity-50" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirm !== null}
        title="Gỡ món khỏi danh mục?"
        message={`"${confirm?.name ?? ""}" sẽ bị xóa khỏi thực đơn bán hàng. Hành động không thể hoàn tác.`}
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
