import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown
} from 'lucide-react';

/**
 * Utility & UI Components
 */
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className, children }) {
  return <div className={cn("rounded-xl bg-white border border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.02)]", className)}>{children}</div>;
}
function CardHeader({ className, children }) {
  return <div className={cn("p-5 pb-3", className)}>{children}</div>;
}
function CardTitle({ className, children }) {
  return <div className={cn("text-sm font-bold text-[#172B4D]", className)}>{children}</div>;
}
function CardContent({ className, children }) {
  return <div className={cn("p-5 pt-2", className)}>{children}</div>;
}
function Button({ className, variant = "default", size = "md", ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants = {
    default: "bg-[#0052CC] text-white hover:bg-[#0047B3] shadow-sm",
    secondary: "bg-white text-[#172B4D] border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-sm text-[#334155]",
    ghost: "bg-transparent text-[#172B4D] hover:bg-[#F4F5F7]",
  };
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-10 px-3.5 text-sm" };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
function Select({ className, children, ...props }) {
  return <select className={cn("h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]", className)} {...props}>{children}</select>;
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
              <th key={c.key} className={cn("whitespace-nowrap px-4 py-3.5 text-[13px] font-semibold text-[#475569] cursor-pointer hover:bg-slate-100", c.align === 'center' && 'text-center')} onClick={() => onSort && onSort(c.key)}>
                <div className={cn("flex items-center gap-1", c.align === 'center' && 'justify-center')}>
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
              {columns.map(c => <td key={c.key} className={cn("whitespace-nowrap px-4 py-3.5 text-sm text-[#1E293B]", c.align === 'center' && 'text-center')}>{typeof c.render === "function" ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState([
    { id: 'W-001', name: '최수행', partner: 'A파트너명', zoneName: '강남역 1번존', zoneId: 'Z-1001', region1: '서울', region2: '강남', score: 95 },
    { id: 'W-002', name: '강수행', partner: 'B파트너명', zoneName: '잠실역 2번존', zoneId: 'Z-1002', region1: '서울', region2: '송파', score: 88 },
    { id: 'W-003', name: '한수행', partner: 'C파트너명', zoneName: '판교 1번존', zoneId: 'Z-2001', region1: '경기', region2: '성남', score: 92 },
    { id: 'W-004', name: '오수행', partner: 'D파트너명', zoneName: '해운대 2번존', zoneId: 'Z-3002', region1: '부산', region2: '해운대', score: 98 },
  ]);

  const [selected, setSelected] = useState(null);
  const [fRegion1, setFRegion1] = useState("");
  const [fRegion2, setFRegion2] = useState("");
  const [fPartner, setFPartner] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const regions1 = useMemo(() => Array.from(new Set(workers.map(w => w.region1))), [workers]);
  const regions2 = useMemo(() => Array.from(new Set(workers.filter(w => fRegion1 ? w.region1 === fRegion1 : true).map(w => w.region2))), [workers, fRegion1]);
  const partners = useMemo(() => Array.from(new Set(workers.map(w => w.partner))), [workers]);

  const filteredData = useMemo(() => {
    return workers.filter(w => {
      const matchRegion1 = !fRegion1 || w.region1 === fRegion1;
      const matchRegion2 = !fRegion2 || w.region2 === fRegion2;
      const matchPartner = !fPartner || w.partner === fPartner;
      return matchRegion1 && matchRegion2 && matchPartner;
    });
  }, [workers, fRegion1, fRegion2, fPartner]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  const columns = [
    { key: 'name', header: '이름' },
    { key: 'partner', header: '소속 파트너사' },
    { key: 'region1', header: '지역1' },
    { key: 'region2', header: '지역2' },
    { key: 'zoneName', header: '배정된 쏘카존' },
    { key: 'score', header: '수행 점수', align: 'center' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="text-base font-bold text-[#172B4D]">수행원 조회 (View Only)</div>
        <div className="mt-1 text-sm text-[#6B778C]">현장 수행원의 배치 현황을 모니터링하고 품질 이슈 발생 시 피드백 근거로 활용합니다.</div>
      </div>

      <Card>
        <CardHeader><CardTitle>필터</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-4">
            <Select value={fPartner} onChange={e => setFPartner(e.target.value)}>
              <option value="">소속 파트너사 전체</option>
              {partners.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
          <div className="md:col-span-3">
            <Select value={fRegion1} onChange={e => { setFRegion1(e.target.value); setFRegion2(""); }}>
              <option value="">지역1 전체</option>
              {regions1.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <div className="md:col-span-3">
            <Select value={fRegion2} onChange={e => setFRegion2(e.target.value)}>
              <option value="">지역2 전체</option>
              {regions2.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button variant="secondary" onClick={() => { setFPartner(""); setFRegion1(""); setFRegion2(""); }}>초기화</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-[#6B778C]">전체 건수 <b className="text-[#172B4D]">{totalItems.toLocaleString()}</b>건</div>
        <div className="text-xs text-[#6B778C]">현재 페이지 ({currentPage}/{totalPages})</div>
      </div>
      <DataTable columns={columns} rows={currentData} rowKey={r => r.id} onRowClick={setSelected} sortConfig={sortConfig} onSort={handleSort} />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <Drawer open={!!selected} title="수행원 상세 (View Only)" onClose={() => setSelected(null)} footer={<Button variant="secondary" onClick={() => setSelected(null)}>닫기</Button>}>
        {selected && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>기본 정보</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Field label="이름" value={selected.name} />
                <Field label="소속 파트너사" value={selected.partner} />
                <Field label="수행 점수" value={`${selected.score}점`} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>배정된 쏘카존</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-[#172B4D]">{selected.zoneName} ({selected.zoneId})</div>
              </CardContent>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}