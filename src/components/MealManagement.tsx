"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { MealItem, PricingOption } from "../data/mealPrepData";
import { Search, Plus, Trash2, TrendingUp, Save, Tag, Package, Layers, Percent, ImagePlus, X, Pencil, Facebook, MessageCircle } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { CATEGORY_EMOJI, CATEGORY_NUTRITION_DEFAULTS } from "@/lib/menu";
import { StatStrip, type Stat } from "@/components/ui/StatStrip";
import { useToast } from "@/components/ui/Toast";
import { useIsAdmin } from "@/contexts/AuthContext";
import { Drawer } from "@/components/ui/Drawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

/** Downscale + compress an image file to a small JPEG data URL (keeps localStorage/DB light). */
async function fileToDataUrl(file: File, max = 480): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas context");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.82);
}

const CATEGORY_OPTIONS = [
  "Ức gà", "Đùi gà", "Cốt lết", "Nạc heo", "Thăn bò",
  "Tôm", "Cá hồi", "Cá tầm", "Cá bóp", "Combo", "OTHER",
];

export default function MealManagement() {
  const { meals, saveMeal, removeMeal, categories, saveCategory, settings, saveSettings } = useData();
  const toast = useToast();
  const isAdmin = useIsAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<MealItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imgBusy, setImgBusy] = useState(false);

  // Per-category photo + macros (per 100g), shared by every dish in the category.
  const catFileRef = useRef<HTMLInputElement>(null);
  const [catImageUrl, setCatImageUrl] = useState("");
  const [catImgBusy, setCatImgBusy] = useState(false);
  const [catKcal, setCatKcal] = useState(0);
  const [catProtein, setCatProtein] = useState(0);
  const [catCarb, setCatCarb] = useState(0);
  const [catFat, setCatFat] = useState(0);

  // Home-page contact links (Facebook / Zalo) editor.
  const [fbUrl, setFbUrl] = useState("");
  const [zaloUrl, setZaloUrl] = useState("");
  const [contactSaving, setContactSaving] = useState(false);
  const catImageOf = (name: string) => categories.find((c) => c.name === name)?.imageUrl;

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

  const categoryTabs = useMemo(() => ["Tất cả", ...Array.from(new Set(meals.map((m) => m.category)))], [meals]);

  const stats: Stat[] = useMemo(() => {
    const combos = meals.filter((m) => m.category === "Combo").length;
    const dishes = meals.length - combos;
    const allMargins = meals.flatMap((m) => m.options.map((o) => o.margin));
    const avgMargin = allMargins.length ? Math.round(allMargins.reduce((s, x) => s + x, 0) / allMargins.length) : 0;
    return [
      { label: "Tổng món/combo", value: meals.length, icon: <Tag className="h-5 w-5" />, accent: "bg-brand-50 text-brand-600" },
      { label: "Món lẻ", value: dishes, sub: `${categoryTabs.length - 1} nhóm`, icon: <Package className="h-5 w-5" />, accent: "bg-indigo-50 text-indigo-600" },
      { label: "Combo", value: combos, icon: <Layers className="h-5 w-5" />, accent: "bg-amber-50 text-amber-600" },
      { label: "Lợi nhuận TB", value: `${avgMargin}%`, icon: <Percent className="h-5 w-5" />, accent: "bg-emerald-50 text-emerald-600" },
    ];
  }, [meals, categoryTabs]);

  const filteredMeals = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return meals.filter((m) => {
      const matchCat = selectedCategory === "Tất cả" || m.category === selectedCategory;
      const matchSearch =
        term === "" || m.name.toLowerCase().includes(term) || m.code.toLowerCase().includes(term) || m.category.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [meals, selectedCategory, searchTerm]);

  // Keep the contact-link inputs in sync with loaded settings.
  useEffect(() => {
    setFbUrl(settings.facebook_url ?? "");
    setZaloUrl(settings.zalo_url ?? "");
  }, [settings]);

  // Load the selected category's shared photo + macros (admin value, else built-in default).
  useEffect(() => {
    if (!drawerOpen || isCombo) return;
    const name = category === "OTHER" ? customCategory.trim() : category;
    const existing = categories.find((c) => c.name === name);
    const def = CATEGORY_NUTRITION_DEFAULTS[name];
    setCatImageUrl(existing?.imageUrl ?? "");
    setCatKcal(existing?.kcal ?? def?.kcal ?? 0);
    setCatProtein(existing?.protein ?? def?.protein ?? 0);
    setCatCarb(existing?.carb ?? def?.carb ?? 0);
    setCatFat(existing?.fat ?? def?.fat ?? 0);
  }, [drawerOpen, isCombo, category, customCategory, categories]);

  const openCreate = () => {
    setEditingId(null);
    setName(""); setCode(""); setCategory("Ức gà"); setCustomCategory("");
    setIsCombo(false); setImageUrl("");
    setHas100g(true); setP100(25000); setC100(16000);
    setHas150g(true); setP150(36000); setC150(24000);
    setHas200g(true); setP200(48000); setC200(32000);
    setPCombo(219000); setCCombo(172000);
    setDrawerOpen(true);
  };

  const openEdit = (meal: MealItem) => {
    setEditingId(meal.id);
    setName(meal.name); setCode(meal.code); setImageUrl(meal.imageUrl ?? "");
    const combo = meal.category === "Combo";
    setIsCombo(combo);
    if (combo) {
      const o = meal.options[0];
      setPCombo(o?.price ?? 0); setCCombo(o?.cost ?? 0);
    } else {
      const known = CATEGORY_OPTIONS.includes(meal.category);
      setCategory(known ? meal.category : "OTHER");
      setCustomCategory(known ? "" : meal.category);
      const find = (wgt: string) => meal.options.find((o) => o.weight === wgt);
      const o1 = find("100g"); setHas100g(!!o1); if (o1) { setP100(o1.price); setC100(o1.cost); }
      const o15 = find("150g"); setHas150g(!!o15); if (o15) { setP150(o15.price); setC150(o15.cost); }
      const o2 = find("200g"); setHas200g(!!o2); if (o2) { setP200(o2.price); setC200(o2.cost); }
    }
    setDrawerOpen(true);
  };

  const pickImage = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Vui lòng chọn tệp ảnh.");
    setImgBusy(true);
    try {
      setImageUrl(await fileToDataUrl(file));
    } catch {
      toast.error("Không đọc được ảnh. Thử ảnh khác.");
    } finally {
      setImgBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const pickCatImage = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Vui lòng chọn tệp ảnh.");
    setCatImgBusy(true);
    try {
      setCatImageUrl(await fileToDataUrl(file));
    } catch {
      toast.error("Không đọc được ảnh. Thử ảnh khác.");
    } finally {
      setCatImgBusy(false);
      if (catFileRef.current) catFileRef.current.value = "";
    }
  };

  const handleSaveContact = async () => {
    setContactSaving(true);
    try {
      await saveSettings({ facebook_url: fbUrl.trim(), zalo_url: zaloUrl.trim() });
      toast.success("Đã lưu liên hệ trang chủ.");
    } catch {
      toast.error("Lưu liên hệ thất bại. Vui lòng thử lại.");
    } finally {
      setContactSaving(false);
    }
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
    const item: MealItem = {
      id: editingId ?? `meal-${Date.now()}`,
      name: name.trim(),
      code: code.trim(),
      category: finalCategory,
      options,
      imageUrl: imageUrl || undefined,
    };
    try {
      await saveMeal(item);
      // Persist the shared category photo + macros (dishes without their own photo use this).
      if (!isCombo) {
        await saveCategory({
          name: finalCategory,
          imageUrl: catImageUrl || undefined,
          kcal: catKcal || undefined,
          protein: catProtein || undefined,
          carb: catCarb || undefined,
          fat: catFat || undefined,
        });
      }
      toast.success(editingId ? `Đã cập nhật "${item.name}".` : `Đã thêm món "${item.name}".`);
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

      {/* Home-page contact links (Facebook / Zalo) — drives the floating buttons on "/" */}
      {isAdmin && (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-800">Liên hệ trang chủ</h3>
            <span className="text-[11px] text-slate-400">Hiện trên nút nổi Facebook / Zalo của trang công khai</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Link Facebook">
              <input
                className={inputClass}
                placeholder="https://facebook.com/mealfitvn"
                value={fbUrl}
                onChange={(e) => setFbUrl(e.target.value)}
              />
            </Field>
            <Field label="Link Zalo">
              <input
                className={inputClass}
                placeholder="https://zalo.me/0901234567"
                value={zaloUrl}
                onChange={(e) => setZaloUrl(e.target.value)}
              />
            </Field>
          </div>
          <div className="mt-3 flex justify-end">
            <Button icon={<Save />} loading={contactSaving} onClick={handleSaveContact}>
              Lưu liên hệ
            </Button>
          </div>
        </div>
      )}

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
            {categoryTabs.map((cat) => (
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
            <Button icon={<Plus />} onClick={openCreate} className="ml-auto sm:ml-0">
              Thêm món
            </Button>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredMeals.map((meal) => (
          <div key={meal.id} className="flex flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
            {/* Media strip: photo if set, else category emoji */}
            <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 to-slate-50">
              {meal.imageUrl || catImageOf(meal.category) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meal.imageUrl || catImageOf(meal.category)} alt={meal.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-5xl opacity-80">{CATEGORY_EMOJI[meal.category] ?? "🍽️"}</span>
              )}
              <span className="absolute left-2.5 top-2.5 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-500 backdrop-blur">{meal.category}</span>
              {isAdmin && (
                <div className="absolute right-2.5 top-2.5 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(meal)}
                    className="rounded-full bg-white/85 p-1.5 text-slate-500 backdrop-blur transition-colors hover:bg-brand-50 hover:text-brand-600"
                    title="Sửa / thêm ảnh"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm(meal)}
                    className="rounded-full bg-white/85 p-1.5 text-slate-400 backdrop-blur transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Xóa món ăn"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="border-b border-slate-50 p-4">
              <h4 className="text-left text-sm font-bold tracking-tight text-slate-800">{meal.name}</h4>
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
        title={editingId ? "Sửa món ăn" : "Thêm món ăn mới"}
        subtitle="Ảnh, giá theo trọng lượng — ảnh sẽ hiển thị trên trang chủ"
        widthClass="max-w-lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Hủy</Button>
            <Button icon={<Save />} loading={saving} onClick={handleSave}>{editingId ? "Cập nhật" : "Lưu món ăn"}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Product photo */}
          <Field label="Ảnh món ăn (tùy chọn)">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="Xem trước" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl opacity-70">{isCombo ? "🥗" : CATEGORY_EMOJI[category] ?? "🍽️"}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => pickImage(e.target.files?.[0])}
                />
                <Button variant="secondary" icon={<ImagePlus />} loading={imgBusy} onClick={() => fileRef.current?.click()}>
                  {imageUrl ? "Đổi ảnh" : "Tải ảnh lên"}
                </Button>
                {imageUrl && (
                  <button type="button" onClick={() => setImageUrl("")} className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:underline">
                    <X className="h-3.5 w-3.5" /> Gỡ ảnh
                  </button>
                )}
                <p className="text-[10px] text-slate-400">Tự nén còn ~480px. Món chưa có ảnh sẽ hiển thị icon.</p>
              </div>
            </div>
          </Field>

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
                <SearchableSelect
                  value={category}
                  onChange={setCategory}
                  ariaLabel="Nhóm danh mục"
                  options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c === "OTHER" ? "Nhóm khác (điền tay)…" : c }))}
                  className={`${inputClass} flex items-center justify-between gap-2 text-left`}
                />
              </Field>
              {category === "OTHER" && (
                <Field label="Tên nhóm mới" required>
                  <input className={inputClass} placeholder="Salad / Nước ép…" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />
                </Field>
              )}

              {/* Shared category photo + macros — applied to every dish in this category */}
              <div className="space-y-4 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
                <p className="text-xs font-bold text-brand-700">
                  Danh mục: {category === "OTHER" ? customCategory.trim() || "(nhóm mới)" : category}
                  <span className="ml-1 font-medium text-slate-400">— dùng chung cho mọi món cùng nhóm</span>
                </p>
                <Field label="Ảnh danh mục (món chưa có ảnh riêng sẽ dùng ảnh này)">
                  <div className="flex items-center gap-3">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {catImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={catImageUrl} alt="Ảnh danh mục" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-3xl opacity-70">{CATEGORY_EMOJI[category] ?? "🍽️"}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={catFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => pickCatImage(e.target.files?.[0])}
                      />
                      <Button variant="secondary" icon={<ImagePlus />} loading={catImgBusy} onClick={() => catFileRef.current?.click()}>
                        {catImageUrl ? "Đổi ảnh danh mục" : "Tải ảnh danh mục"}
                      </Button>
                      {catImageUrl && (
                        <button type="button" onClick={() => setCatImageUrl("")} className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:underline">
                          <X className="h-3.5 w-3.5" /> Gỡ ảnh danh mục
                        </button>
                      )}
                    </div>
                  </div>
                </Field>
                <div>
                  <p className="mb-2 text-[11px] font-bold text-slate-500">Dinh dưỡng / 100g (hiển thị trên trang chủ)</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {([
                      ["Calo (kcal)", catKcal, setCatKcal],
                      ["Đạm (g)", catProtein, setCatProtein],
                      ["Carb (g)", catCarb, setCatCarb],
                      ["Béo (g)", catFat, setCatFat],
                    ] as const).map(([label, val, setVal]) => (
                      <div key={label}>
                        <span className="block text-[9px] text-slate-400">{label}</span>
                        <input
                          type="number"
                          min={0}
                          step="0.1"
                          value={val}
                          onChange={(e) => setVal(Number(e.target.value))}
                          className="w-full rounded-md border border-slate-200 p-1 text-center text-xs font-bold"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

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
