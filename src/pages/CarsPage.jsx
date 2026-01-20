import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  X,
  Download,
  ExternalLink,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

/**
 * util
 */
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * shadcn-ish minimal UI (Tailwind only)
 */
function Card({ className, children }) {
  return (
    <div className={cn("rounded-xl bg-white border border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.02)]", className)}>
      {children}
    </div>
  );
}
function CardHeader({ className, children }) {
  return <div className={cn("p-5 pb-3", className)}>{children}</div>;
}
function CardTitle({ className, children }) {
  return <div className={cn("text-sm font-bold text-[#172B4D]", className)}>{children}</div>;
}
function CardDescription({ className, children }) {
  return <div className={cn("mt-1 text-xs text-[#6B778C]", className)}>{children}</div>;
}
function CardContent({ className, children }) {
  return <div className={cn("p-5 pt-2", className)}>{children}</div>;
}
function Button({ className, variant = "default", size = "md", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants = {
    default: "bg-[#0052CC] text-white hover:bg-[#0047B3] shadow-sm",
    secondary: "bg-white text-[#172B4D] border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-sm text-[#334155]",
    ghost: "bg-transparent text-[#172B4D] hover:bg-[#F4F5F7]",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    outline: "bg-white border border-[#DFE1E6] text-[#172B4D] hover:bg-[#F4F5F7]",
  };
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-3.5 text-sm",
    lg: "h-11 px-4 text-sm",
  };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8]",
        "focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]",
        className
      )}
      {...props}
    />
  );
}
function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition",
        "focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-slate-100 text-slate-800",
    danger: "bg-rose-100 text-rose-800",
    warn: "bg-amber-100 text-amber-800",
    ok: "bg-emerald-100 text-emerald-800",
    info: "bg-blue-100 text-blue-800",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", tones[tone])}>
      {children}
    </span>
  );
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

/**
 * Drawer
 */
function Drawer({ open, title, onClose, children, footer }) {
  const [width, setWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = window.innerWidth * 0.3;
      const maxWidth = window.innerWidth * 0.9;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
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
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed top-0 right-0 h-full bg-white shadow-2xl flex flex-col z-50"
        style={{ width, maxWidth: "100vw" }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#0052CC] transition-colors z-50"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        />
        <div className="flex h-16 items-center justify-between border-b border-[#DFE1E6] px-6 shrink-0">
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-[#0052CC]">{title}</div>
            <div className="truncate text-xs text-[#6B778C]">우측 Drawer 상세</div>
          </div>
          <button
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        <div className="flex h-[72px] items-center justify-end gap-2 border-t border-[#DFE1E6] px-6 bg-[#F4F5F7] shrink-0">
          {footer}
        </div>
      </div>
    </>
  );
}

/**
 * Pagination Components & Hooks
 */
function usePagination(data, itemsPerPage = 40) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  return { currentPage, setCurrentPage, totalPages, currentData, totalItems };
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 0) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <Button variant="ghost" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pages.map(p => (
        <Button
          key={p}
          variant={p === currentPage ? "default" : "ghost"}
          size="sm"
          className={cn("w-8 h-8 p-0", p === currentPage ? "" : "font-normal text-[#6B778C]")}
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}

      <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

/**
 * Table (simple)
 */
function DataTable({ columns, rows, onRowClick, rowKey, sortConfig, onSort }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
      <table className="min-w-full bg-white text-left text-sm">
        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <tr>
            {columns.map((c) => (
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
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[#6B778C]">
                결과가 없습니다.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr
                key={rowKey(r)}
                className={cn(
                  onRowClick ? "cursor-pointer hover:bg-[#F1F5F9]" : "hover:bg-[#F8FAFC]"
                )}
                onClick={() => onRowClick?.(r)}
              >
                {columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-4 py-3.5 text-sm text-[#1E293B]">
                    {typeof c.render === "function" ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
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

// Mock Data for Vehicles (Shared)
const MOCK_VEHICLES = [
  { plate: "12가3456", zoneName: "강남역 1번존", zoneId: "Z-1001", region1: "서울", region2: "강남", partner: "A파트너명", activeOrderId: "O-90001", activeOrderStatus: "예약", lastWash: "2026-01-10", model: "아반떼 AD", isRechargeGuaranteed: false },
  { plate: "34나7890", zoneName: "잠실역 2번존", zoneId: "Z-1002", region1: "서울", region2: "송파", partner: "B파트너명", activeOrderId: null, activeOrderStatus: null, lastWash: "2026-01-08", model: "K5", isRechargeGuaranteed: false },
  { plate: "56다1122", zoneName: "홍대입구 3번존", zoneId: "Z-1003", region1: "서울", region2: "마포", partner: "A파트너명", activeOrderId: "O-90003", activeOrderStatus: "미배정", lastWash: "2026-01-05", model: "쏘나타", isRechargeGuaranteed: false },
  { plate: "78라3344", zoneName: "판교 1번존", zoneId: "Z-2001", region1: "경기", region2: "성남", partner: "C파트너명", activeOrderId: "O-90004", activeOrderStatus: "입고 중", lastWash: "2026-01-09", model: "아이오닉5", isRechargeGuaranteed: true },
  { plate: "90마5566", zoneName: "수원역 2번존", zoneId: "Z-2002", region1: "경기", region2: "수원", partner: "B파트너명", activeOrderId: null, activeOrderStatus: null, lastWash: "2026-01-07", model: "스포티지", isRechargeGuaranteed: false },
  { plate: "11바7788", zoneName: "부산역 1번존", zoneId: "Z-3001", region1: "부산", region2: "동구", partner: "D파트너명", activeOrderId: "O-90006", activeOrderStatus: "미배정", lastWash: "2026-01-03", model: "그랜저", isRechargeGuaranteed: false },
  { plate: "22사9900", zoneName: "해운대 2번존", zoneId: "Z-3002", region1: "부산", region2: "해운대", partner: "D파트너명", activeOrderId: "O-90007", activeOrderStatus: "예약", lastWash: "2026-01-11", model: "레이", isRechargeGuaranteed: false },
  { plate: "33아1212", zoneName: "대전역 1번존", zoneId: "Z-4001", region1: "대전", region2: "동구", partner: "C파트너명", activeOrderId: null, activeOrderStatus: null, lastWash: "2026-01-06", model: "카니발", isRechargeGuaranteed: false },
  { plate: "44자3434", zoneName: "청주 2번존", zoneId: "Z-5002", region1: "충북", region2: "청주", partner: "B파트너명", activeOrderId: "O-90009", activeOrderStatus: "미배정", lastWash: "2026-01-02", model: "모닝", isRechargeGuaranteed: false },
  { plate: "55차5656", zoneName: "광주 1번존", zoneId: "Z-6001", region1: "광주", region2: "서구", partner: "A파트너명", activeOrderId: "O-90010", activeOrderStatus: "예약", lastWash: "2026-01-09", model: "EV6", isRechargeGuaranteed: false },
  { plate: "66카7878", zoneName: "인천공항 1번존", zoneId: "Z-7001", region1: "인천", region2: "중구", partner: "C파트너명", activeOrderId: null, activeOrderStatus: null, lastWash: "2026-01-08", model: "티볼리", isRechargeGuaranteed: false },
  { plate: "77타9090", zoneName: "제주공항 1번존", zoneId: "Z-8001", region1: "제주", region2: "제주시", partner: "D파트너명", activeOrderId: "O-90012", activeOrderStatus: "미배정", lastWash: "2026-01-01", model: "셀토스", isRechargeGuaranteed: false },
];

function CarsPage() {
  const data = MOCK_VEHICLES;

  const [q, setQ] = useState("");
  const [searchField, setSearchField] = useState("plate");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [fRegion1, setFRegion1] = useState("");
  const [fRegion2, setFRegion2] = useState("");
  const [fPartner, setFPartner] = useState("");
  const [selected, setSelected] = useState(null);

  // 날짜 계산 유틸
  const getElapsedDays = (dateStr) => {
    if (!dateStr) return "-";
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const regions1 = useMemo(() => Array.from(new Set(data.map((d) => d.region1))), [data]);
  const regions2 = useMemo(() => Array.from(new Set(data.filter((d) => (fRegion1 ? d.region1 === fRegion1 : true)).map((d) => d.region2))), [data, fRegion1]);
  const partners = useMemo(() => Array.from(new Set(data.map((d) => d.partner))), [data]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return data.filter((d) => {
      const targetVal = String(d[searchField] || "").toLowerCase();
      const hitQ = !qq || targetVal.includes(qq);

      const hitR1 = !fRegion1 || d.region1 === fRegion1;
      const hitR2 = !fRegion2 || d.region2 === fRegion2;
      const hitP = !fPartner || d.partner === fPartner;

      return hitQ && hitR1 && hitR2 && hitP;
    });
  }, [data, q, searchField, fRegion1, fRegion2, fPartner]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  const columns = [
    { key: "plate", header: "차량번호" },
    { key: "zoneName", header: "존이름" },
    { key: "zoneId", header: "존 ID" },
    { key: "region1", header: "지역1" },
    { key: "region2", header: "지역2" },
    { key: "partner", header: "파트너명" },
    {
      key: "activeOrderId",
      header: "진행중 오더",
      render: (r) => r.activeOrderId ? (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 px-1 text-xs text-[#0052CC]" onClick={(e) => { e.stopPropagation(); window.open(`/?page=orders&orderId=${r.activeOrderId}`, "_blank"); }}>{r.activeOrderId}</Button>
          <span className="text-xs text-[#6B778C]">({r.activeOrderStatus})</span>
        </div>
      ) : (
        <span className="text-[#B3BAC5] text-xs">-</span>
      ),
    },
    { key: "lastWash", header: "마지막 세차일" },
    { key: "elapsedDays", header: "세차 경과일", render: (r) => <span className="font-medium">{getElapsedDays(r.lastWash)}일</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">차량 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">수행률 낮은 차량, 존이름별 현황 모니터링(프로토타입)</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            목록 다운로드
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
            <div className="md:col-span-2">
              <label htmlFor="searchField" className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색항목</label>
              <Select id="searchField" value={searchField} onChange={e => setSearchField(e.target.value)}>
                <option value="plate">차량번호</option>
                <option value="zoneName">존이름</option>
                <option value="zoneId">존 ID</option>
              </Select>
            </div>
            <div className="md:col-span-3">
              <label htmlFor="searchQuery" className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색어</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
                <Input 
                  id="searchQuery"
                  value={q} 
                  onChange={(e) => setQ(e.target.value)} 
                  placeholder={`${
                    searchField === 'plate' ? '차량번호' : searchField === 'zoneName' ? '존이름' : '존 ID'
                  } 검색`} 
                  className="pl-9" 
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="fRegion1" className="block text-xs font-semibold text-[#6B778C] mb-1.5">지역1</label>
              <Select id="fRegion1" value={fRegion1} onChange={(e) => { setFRegion1(e.target.value); setFRegion2(""); }}>
                <option value="">전체</option>
                {regions1.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="fRegion2" className="block text-xs font-semibold text-[#6B778C] mb-1.5">지역2</label>
              <Select id="fRegion2" value={fRegion2} onChange={(e) => setFRegion2(e.target.value)}>
                <option value="">전체</option>
                {regions2.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="fPartner" className="block text-xs font-semibold text-[#6B778C] mb-1.5">파트너명</label>
              <Select id="fPartner" value={fPartner} onChange={(e) => setFPartner(e.target.value)}>
                <option value="">전체</option>
                {partners.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>

            <div className="md:col-span-12 flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap gap-2">
                {q ? <Chip onRemove={() => setQ("")}>검색: {q}</Chip> : null}
                {fRegion1 ? <Chip onRemove={() => { setFRegion1(""); setFRegion2(""); }}>지역1: {fRegion1}</Chip> : null}
                {fRegion2 ? <Chip onRemove={() => setFRegion2("")}>지역2: {fRegion2}</Chip> : null}
                {fPartner ? <Chip onRemove={() => setFPartner("")}>파트너명: {fPartner}</Chip> : null}
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setQ(""); setFRegion1(""); setFRegion2(""); setFPartner("");
                }}
              >
                필터 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-[#6B778C]">전체 건수 <b className="text-[#172B4D]">{totalItems.toLocaleString()}</b>건</div>
        <div className="text-xs text-[#6B778C]">현재 페이지 ({currentPage}/{totalPages})</div>
      </div>

      <DataTable
        columns={columns}
        rows={currentData}
        rowKey={(r) => `${r.zoneId}-${r.plate}`}
        onRowClick={(r) => setSelected(r)}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <Drawer
        open={!!selected}
        title={selected ? `차량 상세 - ${selected.plate}` : "차량 상세"}
        onClose={() => setSelected(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>닫기</Button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <CardDescription>리스트 필드 + 차종</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[#172B4D]">
                <Field label="차량번호" value={selected.plate} />
                <Field label="차종" value={selected.model} />
                <Field label="존이름" value={`${selected.zoneName} (${selected.zoneId})`} />
                <Field label="지역1" value={selected.region1} />
                <Field label="지역2" value={selected.region2} />
                <Field label="파트너명" value={selected.partner} />
                <Field label="진행중 오더" value={selected.activeOrderId ? `${selected.activeOrderId} (${selected.activeOrderStatus})` : "없음"} />
                <Field label="마지막 세차일" value={selected.lastWash} />
                <Field label="세차 경과일" value={`${getElapsedDays(selected.lastWash)}일`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>세차 이력(더미)</CardTitle>
                <CardDescription>실데이터 연동 전 UI 형태만 제공</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#172B4D]">
                  {[
                    { date: "2026-01-10", type: "라이트 세차", status: "완료", orderId: "O-90001" },
                    { date: "2026-01-08", type: "수시 세차", status: "완료", orderId: "O-90002" },
                    { date: "2026-01-05", type: "주기 세차", status: "미배정", orderId: "O-90003" },
                  ].map((h, i) => (
                    <li
                      key={i}
                      className="flex cursor-pointer items-center justify-between rounded p-2 transition-colors hover:bg-[#F4F5F7]"
                      onClick={() => window.open(`/?page=orders&orderId=${h.orderId}`, "_blank")}
                    >
                      <span>{h.date}, {h.type}</span>
                      <div className="flex items-center gap-2">
                        <Badge tone="ok">{h.status}</Badge>
                        <ExternalLink className="h-3 w-3 text-[#6B778C]" />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

export default CarsPage;