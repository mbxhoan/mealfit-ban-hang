"use client";

import React, { useState, useMemo } from "react";
import { Customer } from "../data/mealPrepData";
import {
  Users,
  Search,
  Plus,
  Trash2,
  Phone,
  MapPin,
  Mail,
  Sparkles,
  Award,
  Save,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { StatStrip, type Stat } from "@/components/ui/StatStrip";
import { useToast } from "@/components/ui/Toast";
import { useIsAdmin } from "@/contexts/AuthContext";
import { Drawer } from "@/components/ui/Drawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";

export default function CustomerManagement() {
  const { customers, saveCustomer, removeCustomer } = useData();
  const toast = useToast();
  const isAdmin = useIsAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatVND = (num: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);

  const stats: Stat[] = useMemo(() => {
    const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);
    const vip = customers.filter((c) => c.totalSpent > 3000000).length;
    const avg = customers.length ? Math.round(totalSpent / customers.length) : 0;
    return [
      { label: "Tổng khách hàng", value: customers.length, icon: <Users className="h-5 w-5" />, accent: "bg-brand-50 text-brand-600" },
      { label: "Khách VIP", value: vip, sub: "> 3.000.000đ", icon: <Award className="h-5 w-5" />, accent: "bg-amber-50 text-amber-600" },
      { label: "Tổng chi tiêu", value: formatVND(totalSpent), icon: <Wallet className="h-5 w-5" />, accent: "bg-indigo-50 text-indigo-600" },
      { label: "TB mỗi khách", value: formatVND(avg), icon: <TrendingUp className="h-5 w-5" />, accent: "bg-emerald-50 text-emerald-600" },
    ];
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        term === "" ||
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.address.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.notes && c.notes.toLowerCase().includes(term)),
    );
  }, [customers, searchTerm]);

  const openDrawer = () => {
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setNotes("");
    setErrors({});
    setDrawerOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!phone.trim()) e.phone = "Vui lòng nhập số điện thoại";
    else if (!/^[0-9+\s.-]{8,}$/.test(phone.trim())) e.phone = "Số điện thoại không hợp lệ";
    if (!address.trim()) e.address = "Vui lòng nhập địa chỉ giao hàng";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại thông tin bắt buộc.");
      return;
    }
    setSaving(true);
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || "khach.hang@gmail.com",
      address: address.trim(),
      notes: notes.trim(),
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    try {
      await saveCustomer(newCustomer);
      toast.success(`Đã tạo hồ sơ khách hàng "${newCustomer.name}".`);
      setDrawerOpen(false);
    } catch {
      toast.error("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    const id = confirmId;
    setConfirmId(null);
    try {
      await removeCustomer(id);
      toast.success("Đã xóa hồ sơ khách hàng.");
    } catch {
      toast.error("Xóa thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      <StatStrip stats={stats} />

      {/* Search + trigger */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Tìm khách hàng: tên, SĐT, địa chỉ, ghi chú…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-700 outline-none focus:border-brand-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>
        <Button icon={<Plus />} onClick={openDrawer} className="ml-auto sm:ml-0">
          Đăng ký khách hàng
        </Button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {filteredCustomers.map((customer) => {
          const isVip = customer.totalSpent > 3000000;
          return (
            <div
              key={customer.id}
              className="relative flex select-none flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setConfirmId(customer.id)}
                  className="absolute right-4 top-4 rounded-full p-1 text-slate-300 transition-colors hover:text-red-500"
                  title="Xóa khách hàng"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}

              <div className="space-y-3.5 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-extrabold uppercase text-brand-700">
                    {customer.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                      {customer.name}
                      {isVip && (
                        <span className="flex items-center gap-0.5 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-700">
                          <Award className="h-3 w-3 text-amber-500" /> VIP
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400">Khách hàng từ {customer.createdAt}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="font-mono font-semibold">{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate text-[11px]">{customer.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="text-[11px] leading-relaxed">{customer.address}</span>
                  </div>
                </div>

                <div className="rounded border-l-[3px] border-brand-500 bg-brand-50/50 p-2.5 text-[11px]">
                  <div className="mb-0.5 flex items-center gap-1 font-bold text-brand-700">
                    <Sparkles className="h-3.5 w-3.5 text-brand-600" /> Ghi chú khẩu vị / bếp:
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    {customer.notes || "Khách ăn uống bình thường, không yêu cầu đặc biệt."}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-50 pt-3.5 text-center">
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-[10px] font-semibold uppercase text-slate-400">Đơn đã đặt</div>
                  <div className="mt-1 font-extrabold text-slate-800">{customer.totalOrders} đơn</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-[10px] font-semibold uppercase text-slate-400">Tổng chi tiêu</div>
                  <div className="mt-1 font-extrabold text-brand-700">{formatVND(customer.totalSpent)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer form */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Đăng ký hồ sơ khách hàng"
        subtitle="Thông tin liên hệ & ghi chú khẩu vị"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Hủy
            </Button>
            <Button icon={<Save />} loading={saving} onClick={handleSave}>
              Tạo hồ sơ
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Họ tên khách hàng" required error={errors.name}>
            <input className={inputClass} placeholder="Nguyễn Thị B" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Số điện thoại" required error={errors.phone}>
              <input className={inputClass} placeholder="09..." value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field label="Email" hint="Tùy chọn">
              <input className={inputClass} type="email" placeholder="email@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
          </div>
          <Field label="Địa chỉ giao hàng" required error={errors.address}>
            <input className={inputClass} placeholder="Chung cư..., Quận..." value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
          <Field label="Ghi chú khẩu vị & mục tiêu" hint="VD: chỉ ăn ức gà không da, giao 11h">
            <textarea className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmId !== null}
        title="Xóa hồ sơ khách hàng?"
        message="Hồ sơ và lịch sử liên kết sẽ bị gỡ khỏi danh sách quản lý. Hành động không thể hoàn tác."
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />

      {filteredCustomers.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-400">
          <Users className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          Không tìm thấy khách hàng nào.
        </div>
      )}
    </div>
  );
}
