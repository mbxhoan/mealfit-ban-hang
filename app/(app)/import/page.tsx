'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Save, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useData } from '@/contexts/DataContext';
import { useIsAdmin } from '@/contexts/AuthContext';
import {
  IMPORT_COLUMNS,
  TEMPLATE_HEADER,
  TEMPLATE_EXAMPLE_ROWS,
  validateRows,
  rowsToMeals,
  type RowError,
  type ParsedRow,
} from '@/lib/import-products';

export default function ImportPage() {
  const router = useRouter();
  const toast = useToast();
  const isAdmin = useIsAdmin();
  const { setMeals } = useData();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState<RowError[]>([]);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [touched, setTouched] = useState(false);

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm font-semibold text-amber-700">
        Chỉ tài khoản quản trị (admin) mới được nhập dữ liệu.
      </div>
    );
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADER, ...TEMPLATE_EXAMPLE_ROWS]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bang_gia');
    XLSX.writeFile(wb, 'mealfit_template.xlsx');
    toast.info('Đã tải file mẫu mealfit_template.xlsx');
  };

  const onFile = async (file: File) => {
    setParsing(true);
    setFileName(file.name);
    setTouched(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      const { parsed: ok, errors: errs } = validateRows(rows);
      setParsed(ok);
      setErrors(errs);
      if (errs.length === 0) toast.success(`File hợp lệ: ${ok.length} dòng sẵn sàng nạp.`);
      else toast.error(`Phát hiện ${errs.length} lỗi — vui lòng sửa trước khi nạp.`);
    } catch {
      toast.error('Không đọc được file. Hãy dùng đúng định dạng .xlsx/.csv.');
      setParsed([]);
      setErrors([]);
    } finally {
      setParsing(false);
    }
  };

  const doImport = () => {
    if (errors.length > 0 || parsed.length === 0) return;
    setImporting(true);
    const meals = rowsToMeals(parsed);
    setMeals((prev) => {
      const map = new Map(prev.map((m) => [m.id, m]));
      meals.forEach((m) => map.set(m.id, m)); // upsert by id
      return Array.from(map.values());
    });
    setTimeout(() => {
      setImporting(false);
      toast.success(`Đã nạp ${meals.length} món vào thực đơn.`);
      router.push('/products');
    }, 500);
  };

  const clean = touched && errors.length === 0 && parsed.length > 0;

  return (
    <div className="space-y-5">
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" icon={<Download />} onClick={downloadTemplate}>
          Tải file mẫu
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
        <Button icon={<Upload />} loading={parsing} onClick={() => fileRef.current?.click()}>
          Chọn file Excel
        </Button>
        {fileName && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <FileSpreadsheet className="h-4 w-4 text-brand-600" /> {fileName}
          </span>
        )}
      </div>

      {/* Column guide */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2 text-slate-700">
          <Info className="h-4 w-4 text-brand-600" />
          <h3>Hướng dẫn cột dữ liệu</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {IMPORT_COLUMNS.map((c) => (
            <div key={c.key} className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs font-bold text-slate-700">{c.key}</p>
              <p className="text-[11px] text-slate-500">{c.rule}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Status */}
      {touched && (
        <section
          className={`flex items-center gap-2.5 rounded-xl border p-4 text-sm font-semibold ${
            clean
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {clean ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          {clean
            ? `Dữ liệu sạch — ${parsed.length} dòng hợp lệ, sẵn sàng nạp vào hệ thống.`
            : `Còn ${errors.length} lỗi. Việc nạp dữ liệu bị chặn cho tới khi sửa hết lỗi.`}
        </section>
      )}

      {/* Error table */}
      {errors.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700">
            Bảng lỗi ({errors.length})
          </div>
          <div className="mf-scroll max-h-80 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-bold">Dòng</th>
                  <th className="px-4 py-2 font-bold">Cột</th>
                  <th className="px-4 py-2 font-bold">Giá trị</th>
                  <th className="px-4 py-2 font-bold">Lỗi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {errors.map((e, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-mono text-slate-600">{e.row}</td>
                    <td className="px-4 py-2 font-semibold text-slate-700">{e.col}</td>
                    <td className="px-4 py-2 font-mono text-slate-500">{e.value || '—'}</td>
                    <td className="px-4 py-2 font-semibold text-red-600">{e.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Import action — blocked until clean */}
      <div className="flex justify-end">
        <Button icon={<Save />} loading={importing} disabled={!clean} onClick={doImport}>
          Nạp {parsed.length > 0 ? `${parsed.length} dòng` : 'dữ liệu'} vào hệ thống
        </Button>
      </div>
    </div>
  );
}
