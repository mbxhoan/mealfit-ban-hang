export type VietQrTemplate = 'compact2' | 'compact' | 'qr_only' | 'print';

export interface VietQrAccount {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  acqId?: string;
  template?: VietQrTemplate;
}

const DEFAULT_TEMPLATE: VietQrTemplate = 'compact2';
const QR_TEMPLATES: VietQrTemplate[] = ['compact2', 'compact', 'qr_only', 'print'];

const pick = (settings: Record<string, string>, ...keys: string[]) => {
  for (const key of keys) {
    const value = settings[key]?.trim();
    if (value) return value;
  }
  return '';
};

export function normalizeVietQrAccount(settings: Record<string, string>): VietQrAccount | null {
  const bankName = pick(settings, 'payment_bank_name');
  const bankCode = pick(settings, 'payment_bank_code');
  const accountNumber = pick(settings, 'payment_account_number');
  const accountName = pick(settings, 'payment_account_name');
  const acqId = pick(settings, 'payment_acq_id');
  const template = pick(settings, 'payment_qr_template');

  if (!bankCode || !accountNumber || !accountName) return null;
  return {
    bankName: bankName || bankCode,
    bankCode: bankCode.toUpperCase(),
    accountNumber,
    accountName,
    acqId: acqId || undefined,
    template: QR_TEMPLATES.includes(template as VietQrTemplate) ? (template as VietQrTemplate) : DEFAULT_TEMPLATE,
  };
}

export function buildVietQrImageUrl(
  account: VietQrAccount,
  amount?: number,
  addInfo?: string,
  template: VietQrTemplate = account.template ?? DEFAULT_TEMPLATE,
): string {
  const params = new URLSearchParams();
  if (amount != null && amount > 0) params.set('amount', String(Math.round(amount)));
  if (addInfo) params.set('addInfo', addInfo);
  if (account.accountName) params.set('accountName', account.accountName);
  return `https://img.vietqr.io/image/${encodeURIComponent(account.bankCode)}-${encodeURIComponent(account.accountNumber)}-${template}.png?${params.toString()}`;
}

export function formatPaymentAccountLabel(account: VietQrAccount): string {
  return `${account.bankName} · ${account.accountNumber}`;
}

export function getPaymentNote(orderNumber: string): string {
  return orderNumber.trim();
}
