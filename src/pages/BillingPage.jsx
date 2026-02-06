import React, { useState, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet, X, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ExternalLink
} from 'lucide-react';
import billingData from '../mocks/billing.json';

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
function Chip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-[#F4F5F7] px-2 py-1 text-xs font-medium text-[#172B4D] border border-[#DFE1E6]">
      {children}
      {onRemove ? (
        <button className="rounded-full p-0.5 hover:bg-[#DFE1E6]" onClick={onRemove} aria-label="remove">
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </span>
  );
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
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('drawer-open');
    } else {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('drawer-open');
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('drawer-open');
    };
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
  const today = new Date();
  const defaultFrom = toYmd(new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()));
  const defaultTo = toYmd(today);
  const [searchOrderId, setSearchOrderId] = useState("");
  const [fPartner, setFPartner] = useState("전체");
  const [periodFrom, setPeriodFrom] = useState(defaultFrom);
  const [periodTo, setPeriodTo] = useState(defaultTo);
  const [fExcludeSettlement, setFExcludeSettlement] = useState("전체");

  const partnerOptions = useMemo(() => {
    const set = new Set(billingData.map(d => d.partner));
    return ["전체", ...Array.from(set).sort()];
  }, []);

  const isFilterChanged = searchOrderId !== "" || fPartner !== "전체" || periodFrom !== defaultFrom || periodTo !== defaultTo || fExcludeSettlement !== "전체";
  const resetFilters = () => { setSearchOrderId(""); setFPartner("전체"); setPeriodFrom(defaultFrom); setPeriodTo(defaultTo); setFExcludeSettlement("전체"); };

  const [localData, setLocalData] = useState(() => billingData.map(d => ({ ...d })));

  const filteredData = useMemo(() => {
    return localData.filter(item => {
      if (searchOrderId && !item.orderId.toLowerCase().includes(searchOrderId.toLowerCase())) return false;
      if (fPartner !== "전체" && item.partner !== fPartner) return false;
      const itemDate = item.billedAt.slice(0, 10);
      if (periodFrom && itemDate < periodFrom) return false;
      if (periodTo && itemDate > periodTo) return false;
      if (fExcludeSettlement !== "전체" && item.excludeSettlement !== fExcludeSettlement) return false;
      return true;
    });
  }, [localData, searchOrderId, fPartner, periodFrom, periodTo, fExcludeSettlement]);

  const [selected, setSelected] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

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

  const { currentData: billingList, currentPage: billingPage, totalPages: billingTotalPages, setCurrentPage: setBillingPage, totalItems: billingTotal } = usePagination(getSortedData(filteredData), 40);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">청구 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">파트너사별 청구 내역 조회</div>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            console.log("SAP 엑셀 추출 중...");
            window.open("https://docs.google.com/spreadsheets/d/16jMIaSzOMakrXEniyZShFOUdHeSTaslfGOG52ArzZ2w/edit?usp=sharing", "_blank");
          }}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
          SAP 양식 엑셀 다운로드
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
            <div className="md:col-span-2">
              <label htmlFor="searchOrderId" className="block text-xs font-semibold text-[#6B778C] mb-1.5">오더 ID</label>
              <Input id="searchOrderId" type="text" placeholder="오더 ID 검색" value={searchOrderId} onChange={(e) => setSearchOrderId(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="fPartner" className="block text-xs font-semibold text-[#6B778C] mb-1.5">파트너 이름</label>
              <select id="fPartner" value={fPartner} onChange={(e) => setFPartner(e.target.value)} className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]">
                {partnerOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="periodFrom" className="block text-xs font-semibold text-[#6B778C] mb-1.5">청구 일시 시작</label>
              <Input id="periodFrom" type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="periodTo" className="block text-xs font-semibold text-[#6B778C] mb-1.5">청구 일시 종료</label>
              <Input id="periodTo" type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="fExcludeSettlement" className="block text-xs font-semibold text-[#6B778C] mb-1.5">정산 제외</label>
              <select id="fExcludeSettlement" value={fExcludeSettlement} onChange={(e) => setFExcludeSettlement(e.target.value)} className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]">
                <option value="전체">전체</option>
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <Button variant="ghost" size="sm" className="text-[#6B778C] hover:text-[#172B4D]" onClick={resetFilters}>
                필터 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {searchOrderId && <Chip onRemove={() => setSearchOrderId("")}>오더 ID: {searchOrderId}</Chip>}
        {fPartner !== "전체" && <Chip onRemove={() => setFPartner("전체")}>파트너: {fPartner}</Chip>}
        {(periodFrom || periodTo) && <Chip onRemove={() => { setPeriodFrom(""); setPeriodTo(""); }}>기간: {periodFrom || "-"} ~ {periodTo || "-"}</Chip>}
        {fExcludeSettlement !== "전체" && <Chip onRemove={() => setFExcludeSettlement("전체")}>정산 제외: {fExcludeSettlement}</Chip>}
      </div>

      <DataTable
        columns={[
          { key: "id", header: "청구 ID" },
          { key: "orderId", header: "오더 ID" },
          { key: "orderGroup", header: "오더 구분" },
          { key: "washType", header: "세차 유형" },
          { key: "partnerType", header: "파트너 유형" },
          { key: "partner", header: "파트너 이름" },
          { key: "amount", header: "금액", render: (r) => `${r.amount.toLocaleString()}원` },
          { key: "billedAt", header: "청구 일시" },
          { key: "excludeSettlement", header: "정산 제외", render: (r) => r.excludeSettlement === "Y" ? <span className="font-semibold text-[#DE350B]">Y</span> : "N" },
        ]}
        rows={billingList}
        rowKey={(r) => r.id}
        onRowClick={setSelected}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
      <div className="flex items-center justify-end pt-2">
        <div className="flex items-center gap-2 text-sm text-[#6B778C]">
          <span>
            {billingTotal > 0
              ? `${(billingPage - 1) * 40 + 1} - ${Math.min(
                  billingPage * 40,
                  billingTotal
                )} / ${billingTotal.toLocaleString()}`
              : "0 - 0 / 0"}
          </span>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBillingPage(billingPage - 1)}
              disabled={billingPage === 1}
              className="p-1 h-auto"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBillingPage(billingPage + 1)}
              disabled={billingPage === billingTotalPages}
              className="p-1 h-auto"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Drawer
        open={!!selected}
        title={selected ? `청구 상세 - ${selected.id}` : ""}
        onClose={() => setSelected(null)}
        footer={
          <div className="flex w-full justify-between gap-2">
            <Button variant="outline" className="text-[#DE350B] border-[#DE350B] hover:bg-red-50" onClick={() => {
              if (!selected) return;
              const isExcluded = selected.excludeSettlement === "Y";
              const msg = isExcluded
                ? "해당 청구 건의 정산 제외를 해제하시겠습니까?"
                : "해당 청구 건을 정산에서 제외하시겠습니까?";
              if (!window.confirm(msg)) return;
              const next = isExcluded ? "N" : "Y";
              setLocalData(prev => prev.map(d => d.id === selected.id ? { ...d, excludeSettlement: next } : d));
              setSelected({ ...selected, excludeSettlement: next });
            }}>
              {selected?.excludeSettlement === "Y" ? "정산 제외 해제" : "정산 제외"}
            </Button>
            <Button variant="secondary" onClick={() => setSelected(null)}>닫기</Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>청구 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[#172B4D]">
                <Field label="청구 ID" value={selected.id} />
                <Field label="오더 ID" value={
                  <a href={`/?page=orders&orderId=${selected.orderId}`} target="_blank" rel="noopener noreferrer" className="text-[#0052CC] hover:underline inline-flex items-center gap-1">
                    {selected.orderId} <ExternalLink className="h-3 w-3" />
                  </a>
                } />
                <Field label="청구 금액" value={`${selected.amount.toLocaleString()}원`} />
                <Field label="청구 일시" value={selected.billedAt} />
                <Field label="정산 제외 여부" value={
                  selected.excludeSettlement === "Y"
                    ? <span className="font-bold text-[#DE350B]">Y</span>
                    : <span>N</span>
                } />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>오더 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[#172B4D]">
                <Field label="오더 구분" value={selected.orderGroup} />
                <Field label="세차 유형" value={selected.washType} />
                <Field label="파트너 유형" value={selected.partnerType} />
                <Field label="파트너 이름" value={selected.partner} />
              </CardContent>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}
