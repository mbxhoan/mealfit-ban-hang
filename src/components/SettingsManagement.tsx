"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/components/ui/Toast";
import { useIsAdmin } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { CreditCard, Link2, MessageCircle, Settings2, BadgeCheck, QrCode } from "lucide-react";
import { buildVietQrImageUrl, formatPaymentAccountLabel, getPaymentNote, normalizeVietQrAccount, type VietQrTemplate } from "@/lib/vietqr";

const QR_TEMPLATE_OPTIONS: VietQrTemplate[] = ["compact2", "compact", "qr_only", "print"];

const SAMPLE_AMOUNT = 267900;

export default function SettingsManagement() {
  const { settings, saveSettings } = useData();
  const toast = useToast();
  const isAdmin = useIsAdmin();

  const [facebookUrl, setFacebookUrl] = useState("");
  const [zaloUrl, setZaloUrl] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [acqId, setAcqId] = useState("");
  const [qrTemplate, setQrTemplate] = useState<VietQrTemplate>("compact2");
  const [contactSaving, setContactSaving] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);

  useEffect(() => {
    setFacebookUrl(settings.facebook_url ?? "");
    setZaloUrl(settings.zalo_url ?? "");
    setBankName(settings.payment_bank_name ?? "");
    setBankCode(settings.payment_bank_code ?? "");
    setAccountNumber(settings.payment_account_number ?? "");
    setAccountName(settings.payment_account_name ?? "");
    setAcqId(settings.payment_acq_id ?? "");
    setQrTemplate((settings.payment_qr_template as VietQrTemplate) || "compact2");
  }, [settings]);

  const previewAccount = useMemo(
    () =>
      normalizeVietQrAccount({
        payment_bank_name: bankName,
        payment_bank_code: bankCode,
        payment_account_number: accountNumber,
        payment_account_name: accountName,
        payment_acq_id: acqId,
        payment_qr_template: qrTemplate,
      }),
    [accountName, accountNumber, acqId, bankCode, bankName, qrTemplate],
  );

  const previewQrUrl = previewAccount
    ? buildVietQrImageUrl(previewAccount, SAMPLE_AMOUNT, getPaymentNote("DH0255"), qrTemplate)
    : "";

  const handleSaveContact = async () => {
    setContactSaving(true);
    try {
      await saveSettings({ facebook_url: facebookUrl.trim(), zalo_url: zaloUrl.trim() });
      toast.success("Đã lưu liên hệ trang chủ.");
    } catch {
      toast.error("Lưu liên hệ thất bại. Vui lòng thử lại.");
    } finally {
      setContactSaving(false);
    }
  };

  const handleSavePayment = async () => {
    setPaymentSaving(true);
    try {
      await saveSettings({
        payment_bank_name: bankName.trim(),
        payment_bank_code: bankCode.trim().toUpperCase(),
        payment_account_number: accountNumber.trim(),
        payment_account_name: accountName.trim(),
        payment_acq_id: acqId.trim(),
        payment_qr_template: qrTemplate,
      });
      toast.success("Đã lưu tài khoản nhận tiền mặc định.");
    } catch {
      toast.error("Lưu tài khoản thất bại. Vui lòng thử lại.");
    } finally {
      setPaymentSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-700">
              <Settings2 className="h-3.5 w-3.5" />
              Cài đặt hệ thống
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Cài đặt</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Quản lý link liên hệ công khai và tài khoản nhận tiền mặc định để bill / đơn hàng tự tạo VietQR khi in cho khách.
            </p>
          </div>
          {!isAdmin && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Bạn đang ở chế độ xem. Chỉ admin mới có thể chỉnh sửa cài đặt.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-brand-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Liên hệ trang chủ</h3>
              <p className="text-sm text-slate-500">Hiện trên nút nổi Facebook / Zalo của trang công khai.</p>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Link Facebook" hint="Ví dụ: https://facebook.com/mealfitvn">
              <input
                className={inputClass}
                placeholder="https://facebook.com/mealfitvn"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                disabled={!isAdmin}
              />
            </Field>
            <Field label="Link Zalo" hint="Ví dụ: https://zalo.me/0901234567">
              <input
                className={inputClass}
                placeholder="https://zalo.me/0901234567"
                value={zaloUrl}
                onChange={(e) => setZaloUrl(e.target.value)}
                disabled={!isAdmin}
              />
            </Field>
          </div>

          <div className="mt-5 flex justify-end">
            <Button icon={<Link2 />} loading={contactSaving} onClick={handleSaveContact} disabled={!isAdmin}>
              Lưu liên hệ
            </Button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-brand-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Tài khoản nhận tiền</h3>
              <p className="text-sm text-slate-500">Dùng để tạo QR thanh toán tự động trên bill và đơn hàng.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Tên ngân hàng">
              <input
                className={inputClass}
                placeholder="Vietcombank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                disabled={!isAdmin}
              />
            </Field>
            <Field label="Mã ngân hàng (bank code)">
              <input
                className={inputClass}
                placeholder="VCB / VIB / TCB..."
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value.toUpperCase())}
                disabled={!isAdmin}
              />
            </Field>
            <Field label="Số tài khoản">
              <input
                className={inputClass}
                placeholder="0071003366447"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                disabled={!isAdmin}
              />
            </Field>
            <Field label="Tên chủ tài khoản">
              <input
                className={inputClass}
                placeholder="MAI THI THU HANG"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                disabled={!isAdmin}
              />
            </Field>
            <Field label="Mã QR / ACQ ID" hint="Tùy chọn, dùng để hiển thị mã nhãn thanh toán nếu cần.">
              <input
                className={inputClass}
                placeholder="970436"
                value={acqId}
                onChange={(e) => setAcqId(e.target.value)}
                disabled={!isAdmin}
              />
            </Field>
            <Field label="Mẫu QR">
              <select
                className={inputClass}
                value={qrTemplate}
                onChange={(e) => setQrTemplate(e.target.value as VietQrTemplate)}
                disabled={!isAdmin}
              >
                {QR_TEMPLATE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-5 flex justify-end">
            <Button icon={<BadgeCheck />} loading={paymentSaving} onClick={handleSavePayment} disabled={!isAdmin}>
              Lưu tài khoản mặc định
            </Button>
          </div>
        </section>
      </div>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-brand-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Xem trước VietQR</h3>
              <p className="text-sm text-slate-500">Khi điền đủ thông tin, bill sẽ tự dựng QR theo tài khoản này.</p>
            </div>
          </div>

          {previewAccount ? (
            <div className="mt-4 rounded-[28px] border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 text-center">
              <div className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-400">VietQR</div>
              <div className="mt-1 text-lg font-black text-slate-900">{previewAccount.bankName}</div>
              <div className="text-sm font-semibold text-slate-600">{formatPaymentAccountLabel(previewAccount)}</div>
              <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-3">
                <img
                  src={previewQrUrl}
                  alt="VietQR preview"
                  className="mx-auto w-full max-w-[340px] rounded-2xl border border-slate-200 object-contain"
                />
              </div>
              <div className="mt-4 space-y-1 text-sm font-semibold text-slate-600">
                <div>Số tiền mẫu: 267.900đ</div>
                <div>Nội dung CK: {getPaymentNote("DH0255")}</div>
                <div>Tên chủ TK: {previewAccount.accountName}</div>
                {previewAccount.acqId && <div>Mã QR thanh toán: {previewAccount.acqId}</div>}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              Nhập tên ngân hàng, mã ngân hàng, số tài khoản và tên chủ tài khoản để xem trước QR thanh toán.
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-brand-600" />
            <h3 className="text-lg font-bold text-slate-900">Quy ước lưu</h3>
          </div>
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>
              Dữ liệu được lưu trong bảng <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700">mealfit_settings</code>.
            </p>
            <p>
              Khi in bill hoặc xuất HTML cho đơn hàng, hệ thống sẽ dùng tài khoản nhận tiền mặc định để tạo QR VietQR theo tổng thanh toán của đơn.
            </p>
            <p>
              Nếu bạn chỉ cập nhật liên hệ, các giá trị VietQR cũ sẽ giữ nguyên và ngược lại.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
