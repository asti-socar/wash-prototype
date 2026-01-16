import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileSpreadsheet, X, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';

/**
 * Utility & UI Components
 */
function cn(...classes) { return classes.filter(Boolean).join(" "); }
function toYmd(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function Card({ className, children }) {
  return <div className={cn("rounded-xl bg-white border border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.02)]", className)}>{children}</div>;
}
function CardContent({ className, children }) {
  return <div className={cn("p-5 pt-2", className)}>{children}</div>;
}
function CardHeader({ className, children }) {
  return <div className={cn("p-5 pb-3", className)}>{children}</div>;
}
function CardTitle({ className, children }) {
  return <div className={cn("text-sm font-bold text-[#172B4D]", className)}>{children}</div>;
}
function Button({ className, variant = "default", size = "md", ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants = {
    default: "bg-[#0052CC] text-white hover:bg-[#0047B3] shadow-sm",
    secondary: "bg-white text-[#172B4D] border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-sm text-[#334155]",
    ghost: "bg-transparent text-[#172B4D] hover:bg-[#F4F5F7]",
    outline: "bg-white border border-[#DFE1E6] text-[#172B4D] hover:bg-[#F4F5F7]",
  };
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-10 px-3.5 text-sm" };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
function Input({ className, ...props }) {
  return <input className={cn("h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]", className)} {...props} />;
}
function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-slate-100 text-slate-800",
    ok: "bg-emerald-100 text-emerald-800",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", tones[tone])}>{children}</span>;
}
function Field({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="w-36 shrink-0 text-xs font-semibold text-[#6B778C]">{label}</div>
      <div className="min-w-0 flex-1 text-sm text-[#172B4D]">{value}</div>
    </div>
  );
}

function Drawer({ open, title, onClose, children, footer }) {
  const [width, setWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [open]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 400 && newWidth <= 1200) setWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
    };
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    };
  }, [isResizing]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full bg-white shadow-2xl flex flex-col" style={{ width }}>
        <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#0052CC] transition-colors z-50" onMouseDown={() => setIsResizing(true)} />
        <div className="flex h-16 items-center justify-between border-b border-[#DFE1E6] px-6 shrink-0">
          <div className="text-lg font-bold text-[#172B4D]">{title}</div>
          <button onClick={onClose}><X className="h-6 w-6 text-gray-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        <div className="flex h-[72px] items-center justify-end gap-2 border-t border-[#DFE1E6] px-6 bg-[#F4F5F7] shrink-0">{footer}</div>
      </div>
    </div>
  );
}

function usePagination(data, itemsPerPage = 40) {
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => setCurrentPage(1), [data]);
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const currentData = useMemo(() => data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [data, currentPage, itemsPerPage]);
  return { currentPage, setCurrentPage, totalPages, currentData, totalItems };
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 0) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <Button variant="ghost" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
      {pages.map(p => (
        <Button key={p} variant={p === currentPage ? "default" : "ghost"} size="sm" className={cn("w-8 h-8 p-0", p !== currentPage && "font-normal text-[#6B778C]")} onClick={() => onPageChange(p)}>{p}</Button>
      ))}
      <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
    </div>
  );
}

function DataTable({ columns, rows, onRowClick, rowKey, sortConfig, onSort }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
      <table className="min-w-full bg-white text-left text-sm">
        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <tr>
            {columns.map(c => (
              <th key={c.key} className="whitespace-nowrap px-4 py-3.5 text-[13px] font-semibold text-[#475569] cursor-pointer hover:bg-slate-100" onClick={() => onSort && onSort(c.key)}>
                <div className="flex items-center gap-1">
                  {c.header}
                  {sortConfig?.key === c.key && (
                    <ArrowUpDown className={cn("h-3 w-3", sortConfig.direction === 'asc' ? "text-[#0052CC]" : "text-[#0052CC] rotate-180")} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {rows.length === 0 ? <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[#6B778C]">결과가 없습니다.</td></tr> : rows.map(r => (
            <tr key={rowKey(r)} className={cn(onRowClick ? "cursor-pointer hover:bg-[#F1F5F9]" : "hover:bg-[#F8FAFC]")} onClick={() => onRowClick?.(r)}>
              {columns.map(c => <td key={c.key} className="whitespace-nowrap px-4 py-3.5 text-sm text-[#1E293B]">{typeof c.render === "function" ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BillingPage() {
  const [period, setPeriod] = useState(toYmd(new Date()));

  const billingData = [
    { id: "B-1001", orderId: "O-90002", partner: "B파트너명", amount: 25000, status: "청구완료", date: "2026-01-12" },
    { id: "B-1002", orderId: "O-90005", partner: "B파트너명", amount: 18000, status: "대기", date: "2026-01-12" },
    { id: "B-1003", orderId: "O-90011", partner: "C파트너명", amount: 22000, status: "청구완료", date: "2026-01-11" },
  ];

  const [selected, setSelected] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const { currentData: billingList, currentPage: billingPage, totalPages: billingTotalPages, setCurrentPage: setBillingPage, totalItems: billingTotal } = usePagination(getSortedData(billingData), 40);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">청구 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">파트너사별 청구 내역 조회</div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => console.log("SAP 엑셀 추출 중...")}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
          SAP 양식 엑셀 다운로드
        </Button>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#172B4D]">기간 조회</span>
            <Input type="date" value={period} onChange={(e) => setPeriod(e.target.value)} className="!w-40" />
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-[#6B778C]">전체 건수 <b className="text-[#172B4D]">{billingTotal.toLocaleString()}</b>건</div>
        <div className="text-xs text-[#6B778C]">현재 페이지 ({billingPage}/{billingTotalPages})</div>
      </div>
      <DataTable
        columns={[
          { key: "id", header: "청구 ID" },
          { key: "orderId", header: "오더 ID" },
          { key: "partner", header: "파트너명" },
          { key: "amount", header: "금액", render: (r) => `${r.amount.toLocaleString()}원` },
          { key: "status", header: "상태", render: (r) => <Badge tone={r.status === "청구완료" ? "ok" : "default"}>{r.status}</Badge> },
          { key: "date", header: "청구일" },
        ]}
        rows={billingList}
        rowKey={(r) => r.id}
        onRowClick={setSelected}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
      <Pagination currentPage={billingPage} totalPages={billingTotalPages} onPageChange={setBillingPage} />

      <Drawer
        open={!!selected}
        title="청구 상세"
        onClose={() => setSelected(null)}
        footer={<Button variant="secondary" onClick={() => setSelected(null)}>닫기</Button>}
      >
        {selected && (
          <Card>
            <CardHeader>
              <CardTitle>청구 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[#172B4D]">
              <Field label="청구 ID" value={selected.id} />
              <Field label="오더 ID" value={selected.orderId} />
              <Field label="파트너명" value={selected.partner} />
              <Field label="청구 금액" value={`${selected.amount.toLocaleString()}원`} />
              <Field label="상태" value={selected.status} />
              <Field label="청구일" value={selected.date} />
            </CardContent>
          </Card>
        )}
      </Drawer>
    </div>
  );
}