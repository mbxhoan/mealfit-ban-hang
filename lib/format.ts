// Number / currency formatting helpers. Vietnamese grouping: 1000000 -> "1.000.000".

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(value || 0));
}

/** Format a VND amount, e.g. 25000 -> "25.000đ". */
export function formatVND(value: number): string {
  return `${formatNumber(value)}đ`;
}

/** Format a ratio/percentage, e.g. 33.56 -> "33,6%". */
export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value || 0)}%`;
}
