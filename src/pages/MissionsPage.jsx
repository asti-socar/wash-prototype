import React, { useMemo, useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  X,
  ArrowUpDown,
  ExternalLink,
  ImageIcon,
  Maximize2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

/**
 * util
 */
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function toYmd(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  return isMobile;
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
  const isMobile = useIsMobile();
  const [width, setWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [open]);

  useEffect(() => {
    if (isMobile) return;
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
  }, [isResizing, isMobile]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="fixed top-0 right-0 z-50 h-full w-full bg-white shadow-2xl flex flex-col sm:w-auto" style={!isMobile ? { width } : {}}>
        {!isMobile && (
          <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#0052CC] transition-colors z-50" onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }} />
        )}
        <div className="flex h-16 items-center justify-between border-b border-[#DFE1E6] px-4 sm:px-6 shrink-0">
          <div className="min-w-0 flex-1 pr-4">
            <div className="truncate text-sm font-bold text-[#0052CC]">{title}</div>
            <div className="truncate text-xs text-[#6B778C]">우측 Drawer 상세</div>
          </div>
          <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100" onClick={onClose}><X className="h-6 w-6" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
        <div className="shrink-0 border-t border-[#DFE1E6] bg-gray-50 p-4 sm:px-6 sm:py-4">{footer}</div>
      </div>
    </div>
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

function MissionsPage({ missions, setMissions, orders }) {
  const today = new Date();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newMissionForm, setNewMissionForm] = useState({ plates: "", content: "", amount: 0, requiresPhoto: true });

  // 필터 상태
  const [q, setQ] = useState("");
  const [searchField, setSearchField] = useState("plate");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [fStatus, setFStatus] = useState("");
  const [fModel, setFModel] = useState("");
  const [fRegion1, setFRegion1] = useState("");
  const [fRegion2, setFRegion2] = useState("");
  const [periodFrom, setPeriodFrom] = useState(toYmd(new Date(today.getTime() - 30 * 86400000)));
  const [periodTo, setPeriodTo] = useState(toYmd(today));

  // 상세 Drawer 상태
  const [selected, setSelected] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkDeleteReason, setBulkDeleteReason] = useState("");

  // 차량 정보 연동
  const enrichedMissions = useMemo(() => {
    return missions.map(m => {
      const vehicle = MOCK_VEHICLES.find(v => v.plate === m.plate);
      return {
        ...m,
        model: vehicle?.model || "-",
        region1: vehicle?.region1 || "-",
        region2: vehicle?.region2 || "-",
      };
    });
  }, [missions]);

  // 필터링 로직
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return enrichedMissions.filter(m => {
      const targetVal = String(m[searchField] || "").toLowerCase();
      const hitQ = !qq || targetVal.includes(qq);
      const hitS = !fStatus || (fStatus === "대기" ? m.status === "pending" : m.status === "completed");
      const hitM = !fModel || m.model === fModel;
      const hitR1 = !fRegion1 || m.region1 === fRegion1;
      const hitR2 = !fRegion2 || m.region2 === fRegion2;
      const hitP = (!periodFrom || m.createdAt >= periodFrom) && (!periodTo || m.createdAt <= periodTo);
      return hitQ && hitS && hitM && hitR1 && hitR2 && hitP;
    });
  }, [enrichedMissions, q, searchField, fStatus, fModel, fRegion1, fRegion2, periodFrom, periodTo]);

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
    if (key === 'selection') return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // 필터 옵션 추출
  const models = useMemo(() => Array.from(new Set(enrichedMissions.map(m => m.model))), [enrichedMissions]);
  const regions1 = useMemo(() => Array.from(new Set(enrichedMissions.map(m => m.region1))), [enrichedMissions]);
  const regions2 = useMemo(() => Array.from(new Set(enrichedMissions.filter(m => !fRegion1 || m.region1 === fRegion1).map(m => m.region2))), [enrichedMissions, fRegion1]);

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  const chips = (
    <div className="flex flex-wrap gap-2">
      {q ? <Chip onRemove={() => setQ("")}>검색: {q}</Chip> : null}
      {periodFrom || periodTo ? <Chip onRemove={() => { setPeriodFrom(""); setPeriodTo(""); }}>기간: {periodFrom || "-"} ~ {periodTo || "-"}</Chip> : null}
      {fStatus ? <Chip onRemove={() => setFStatus("")}>상태: {fStatus}</Chip> : null}
      {fModel ? <Chip onRemove={() => setFModel("")}>차종: {fModel}</Chip> : null}
      {fRegion1 ? <Chip onRemove={() => { setFRegion1(""); setFRegion2(""); }}>지역1: {fRegion1}</Chip> : null}
      {fRegion2 ? <Chip onRemove={() => setFRegion2("")}>지역2: {fRegion2}</Chip> : null}
    </div>
  );

  // 체크박스 핸들러
  const toggleSelectAll = () => {
    const currentIds = currentData.map(r => r.id);
    const allSelected = currentIds.length > 0 && currentIds.every(id => selectedIds.has(id));
    
    const newSelected = new Set(selectedIds);
    if (allSelected) {
      currentIds.forEach(id => newSelected.delete(id));
    } else {
      currentIds.forEach(id => newSelected.add(id));
    }
    setSelectedIds(newSelected);
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = () => {
    setMissions(prev => prev.filter(m => !selectedIds.has(m.id)));
    setSelectedIds(new Set());
    setBulkDeleteModalOpen(false);
    setBulkDeleteReason("");
    alert(`${selectedIds.size}건의 미션이 삭제되었습니다.\n사유: ${bulkDeleteReason}`);
  };

  // 미션 등록
  const handleRegisterMission = () => {
    if (!newMissionForm.plates || !newMissionForm.content) return alert("차량번호와 미션 내용은 필수입니다.");

    // 차량번호 파싱 (개행 또는 콤마로 분리)
    const plates = newMissionForm.plates.split(/[\n,]+/).map(p => p.trim()).filter(p => p);

    if (plates.length === 0) return alert("유효한 차량번호가 없습니다.");
    if (plates.length > 1000) return alert(`최대 1,000건까지 등록 가능합니다. (현재 ${plates.length}건)`);

    const newMissions = plates.map((plate, idx) => {
      const vehicle = MOCK_VEHICLES.find(v => v.plate === plate);
      return {
        id: `M-${Date.now()}-${idx}`,
        plate: plate,
        content: newMissionForm.content,
        amount: Number(newMissionForm.amount) || 0,
        zoneName: vehicle?.zoneName || "-", // 차량 정보에서 자동 조회, 없으면 '-'
        status: "pending",
        createdAt: toYmd(new Date()),
        requiresPhoto: newMissionForm.requiresPhoto,
        assignedAt: null,
        completedAt: null,
      };
    });

    setMissions([...newMissions, ...missions]);
    setNewMissionForm({ plates: "", content: "", amount: 0, requiresPhoto: true });
    setIsRegisterOpen(false);
    alert("미션이 등록되었습니다.");
  };

  // 미션 삭제
  const handleDeleteMission = () => {
    if (!selected) return;
    setMissions(prev => prev.filter(m => m.id !== selected.id));
    alert(`미션이 삭제되었습니다.\n사유: ${deleteReason}`);
    setSelected(null);
    setIsDeleting(false);
    setDeleteReason("");
  };

  // 연결된 오더 정보 조회 (for Drawer)
  const linkedOrder = selected?.linkedOrderId ? orders.find(o => o.orderId === selected.linkedOrderId) : null;

  const columns = [
    {
      key: "selection",
      header: (
        <input
          type="checkbox"
          checked={currentData.length > 0 && currentData.every((r) => selectedIds.has(r.id))}
          onChange={toggleSelectAll}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-gray-300 text-[#0052CC] focus:ring-[#0052CC]"
        />
      ),
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()} className="flex items-center">
          <input
            type="checkbox"
            checked={selectedIds.has(r.id)}
            onChange={() => toggleSelect(r.id)}
            className="h-4 w-4 rounded border-gray-300 text-[#0052CC] focus:ring-[#0052CC]"
          />
        </div>
      ),
    },
    { key: "id", header: "미션 ID" },
    { key: "plate", header: "차량번호" },
    { key: "model", header: "차종", render: (r) => r.status === 'pending' ? <span className="text-slate-400">-</span> : r.model },
    { key: "region1", header: "지역1", render: (r) => r.status === 'pending' ? <span className="text-slate-400">-</span> : r.region1 },
    { key: "region2", header: "지역2", render: (r) => r.status === 'pending' ? <span className="text-slate-400">-</span> : r.region2 },
    { key: "zoneName", header: "존이름", render: (r) => r.status === 'pending' ? <span className="text-slate-400">-</span> : r.zoneName },
    { key: "content", header: "미션 내용" },
    { key: "amount", header: "금액", render: (r) => `${(r.amount || 0).toLocaleString()}원` },
    { 
      key: "status", 
      header: "상태", 
      render: (r) => {
        const tone = r.status === 'completed' ? 'ok' : 'warn';
        const label = r.status === 'completed' ? '수행완료' : '대기';
        return <Badge tone={tone}>{label}</Badge>;
      }
    },
    { 
      key: "linkedOrderId", 
      header: "연결된 오더",
      render: (r) => r.status === 'pending' ? <span className="text-slate-400">-</span> : r.linkedOrderId ? (
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-[#0052CC]" onClick={() => window.open(`/?page=orders&orderId=${r.linkedOrderId}`, "_blank")}>
          {r.linkedOrderId} <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      ) : <span className="text-[#B3BAC5] text-xs">-</span>
    },
    { key: "createdAt", header: "등록일", render: (r) => r.status === 'pending' ? <span className="text-slate-400">-</span> : r.createdAt },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">미션 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">차량별 특수 과업 사전 등록 및 오더 연동 현황</div>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button variant="danger" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> 선택 삭제 ({selectedIds.size})
            </Button>
          )}
          <Button onClick={() => setIsRegisterOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> 미션 등록
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
                <option value="id">미션 ID</option>
                <option value="zoneName">존이름</option>
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
                    searchField === 'plate' ? '차량번호' : searchField === 'id' ? '미션 ID' : '존이름'
                  } 검색`}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="periodFrom" className="block text-xs font-semibold text-[#6B778C] mb-1.5">등록일 시작</label>
              <Input id="periodFrom" type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="periodTo" className="block text-xs font-semibold text-[#6B778C] mb-1.5">등록일 종료</label>
              <Input id="periodTo" type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="fStatus" className="block text-xs font-semibold text-[#6B778C] mb-1.5">진행상태</label>
              <Select id="fStatus" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
                <option value="">전체</option>
                <option value="대기">대기</option>
                <option value="수행완료">수행완료</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="fModel" className="block text-xs font-semibold text-[#6B778C] mb-1.5">차종</label>
              <Select id="fModel" value={fModel} onChange={(e) => setFModel(e.target.value)}>
                <option value="">전체</option>
                {models.map(v => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="fRegion1" className="block text-xs font-semibold text-[#6B778C] mb-1.5">지역1</label>
              <Select id="fRegion1" value={fRegion1} onChange={(e) => { setFRegion1(e.target.value); setFRegion2(""); }}>
                <option value="">전체</option>
                {regions1.map(v => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="fRegion2" className="block text-xs font-semibold text-[#6B778C] mb-1.5">지역2</label>
              <Select id="fRegion2" value={fRegion2} onChange={(e) => setFRegion2(e.target.value)}>
                <option value="">전체</option>
                {regions2.map(v => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div className="md:col-span-12 flex flex-wrap items-center justify-between gap-2 pt-1">
              {chips}
              <Button
                variant="secondary"
                onClick={() => { 
                  setQ(""); 
                  setFStatus(""); 
                  setFModel(""); 
                  setFRegion1(""); 
                  setFRegion2(""); 
                  setPeriodFrom(toYmd(new Date(today.getTime() - 30 * 86400000))); 
                  setPeriodTo(toYmd(today)); 
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

      <Card>
        <DataTable
          columns={columns}
          rows={currentData}
          rowKey={(r) => r.id}
          onRowClick={setSelected}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>

      {/* 일괄 삭제 모달 */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-[400px] shadow-xl ring-rose-200">
            <CardHeader>
              <CardTitle className="text-rose-700">미션 일괄 삭제</CardTitle>
              <CardDescription>선택한 {selectedIds.size}건의 미션을 삭제하시겠습니까?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">삭제 사유 *</label>
                <Input
                  value={bulkDeleteReason}
                  onChange={(e) => setBulkDeleteReason(e.target.value)}
                  placeholder="삭제 사유를 입력하세요"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => { setBulkDeleteModalOpen(false); setBulkDeleteReason(""); }}>취소</Button>
                <Button variant="danger" disabled={!bulkDeleteReason.trim()} onClick={confirmBulkDelete}>삭제 확정</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Drawer
        open={isRegisterOpen}
        title="신규 미션 등록"
        onClose={() => setIsRegisterOpen(false)}
        footer={
          <Button onClick={handleRegisterMission} className="w-full">등록하기</Button>
        }
      >
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>미션 정보 입력</CardTitle>
              <CardDescription>등록된 미션은 해당 차량의 다음 오더 생성 시 자동으로 할당됩니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-[#6B778C]">대상 차량번호 (일괄 입력) *</label>
                  <span className="text-xs text-[#6B778C]">{newMissionForm.plates ? newMissionForm.plates.split(/[\n,]+/).filter(p=>p.trim()).length : 0} / 1000</span>
                </div>
                <textarea 
                  className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] min-h-[120px]"
                  value={newMissionForm.plates} 
                  onChange={e => setNewMissionForm({...newMissionForm, plates: e.target.value})} 
                  placeholder="차량번호를 입력하세요. (엔터 또는 콤마로 구분)" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">미션 내용 *</label>
                <Input value={newMissionForm.content} onChange={e => setNewMissionForm({...newMissionForm, content: e.target.value})} placeholder="예: 스티커 부착, 내부 집중 청소" />
                
                <div className="pt-2 space-y-1">
                  <label className="text-xs font-semibold text-[#6B778C]">미션 금액</label>
                  <Input 
                    type="number" 
                    min="0"
                    value={newMissionForm.amount} 
                    onChange={e => setNewMissionForm({...newMissionForm, amount: e.target.value})} 
                    placeholder="0" 
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" id="reqPhoto" className="h-4 w-4 rounded border-gray-300 text-[#0052CC] focus:ring-[#0052CC]"
                    checked={newMissionForm.requiresPhoto} onChange={e => setNewMissionForm({...newMissionForm, requiresPhoto: e.target.checked})} 
                  />
                  <label htmlFor="reqPhoto" className="text-sm text-[#172B4D]">수행 시 증빙 사진 필수</label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Drawer>

      {/* 미션 상세 Drawer */}
      <Drawer
        open={!!selected}
        title={selected ? `미션 상세 - ${selected.id}` : "미션 상세"}
        onClose={() => { setSelected(null); setIsDeleting(false); setDeleteReason(""); }}
        footer={
          <div className="flex w-full flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelected(null)} className="w-full sm:w-auto">닫기</Button>
            <Button variant="danger" onClick={() => setIsDeleting(true)} disabled={selected?.status === 'completed'} className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" /> 미션 삭제
            </Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[#172B4D]">
                <Field label="미션 ID" value={selected.id} />
                <Field label="차량번호" value={selected.plate} />
                <Field label="차종" value={selected.model} />
                <Field label="지역1" value={selected.region1} />
                <Field label="지역2" value={selected.region2} />
                <Field label="존이름" value={selected.zoneName} />
                <Field label="미션 내용" value={selected.content} />
                <Field label="금액" value={`${(selected.amount || 0).toLocaleString()}원`} />
                <Field label="증빙 사진 필수" value={selected.requiresPhoto ? <Badge tone="warn">필수</Badge> : "-"} />
                <Field label="상태" value={<Badge tone={selected.status === 'completed' ? 'ok' : 'warn'}>{selected.status === 'completed' ? '수행완료' : '대기'}</Badge>} />
                <Field label="등록일" value={selected.createdAt} />
              </CardContent>
            </Card>

            {/* Photo Section */}
            {selected.requiresPhoto && selected.status === 'completed' && (
              <Card>
                <CardHeader>
                  <CardTitle>사진 정보</CardTitle>
                  <CardDescription>미션 수행 증빙 사진</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <button key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-[#F4F5F7] border border-[#DFE1E6]">
                        <div className="flex h-full w-full items-center justify-center text-[#B3BAC5]">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <Maximize2 className="h-5 w-5 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {selected.status === 'completed' && (
              <Card>
                <CardHeader>
                  <CardTitle>오더 연동 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-[#172B4D]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-36 shrink-0 text-xs font-semibold text-[#6B778C]">연결된 오더</div>
                    <div className="min-w-0 flex-1 text-sm text-[#172B4D]">
                      {selected.linkedOrderId ? (
                        <button 
                          className="text-[#0052CC] hover:underline flex items-center" 
                          onClick={() => window.open(`/?page=orders&orderId=${selected.linkedOrderId}`, '_blank')}
                        >
                          {selected.linkedOrderId} <ExternalLink className="ml-1 h-3 w-3" />
                        </button>
                      ) : "-"}
                    </div>
                  </div>
                  <Field label="담당 수행원" value={linkedOrder?.worker || "-"} />
                  <Field label="오더 상태" value={linkedOrder ? <Badge tone="info">{linkedOrder.status}</Badge> : "-"} />
                </CardContent>
              </Card>
            )}

            {isDeleting && (
              <Card className="ring-rose-200">
                <CardHeader>
                  <CardTitle className="text-rose-700">미션 삭제</CardTitle>
                  <CardDescription>삭제 시 복구할 수 없습니다. 사유를 입력해주세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="삭제 사유 입력"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => { setIsDeleting(false); setDeleteReason(""); }}>취소</Button>
                    <Button variant="danger" disabled={!deleteReason.trim()} onClick={handleDeleteMission}>삭제 확정</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default MissionsPage;