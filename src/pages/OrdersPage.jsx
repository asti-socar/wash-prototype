import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  X,
  Download,
  Trash2,
  Plus,
  CheckCircle,
  Image as ImageIcon,
  ExternalLink,
  Maximize2,
  Check,
  ClipboardList,
  PackageSearch,
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

function toYmd(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

/**
 * Tabs Components
 */
function Tabs({ value, children }) {
  return <div className="w-full space-y-4">{children}</div>;
}

function TabsList({ children, className }) {
  return <div className={cn("flex border-b border-[#DFE1E6]", className)}>{children}</div>;
}

function TabsTrigger({ value, currentValue, onClick, children }) {
  const active = value === currentValue;
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        "relative px-4 py-2.5 text-sm font-medium transition-all",
        active ? "text-[#0052CC]" : "text-[#6B778C] hover:text-[#172B4D]"
      )}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#0052CC]" />
      )}
    </button>
  );
}

function TabsContent({ value, currentValue, children, className }) {
  if (value !== currentValue) return null;
  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-1 duration-200", className)}>{children}</div>
  );
}

const ORDER_GROUPS = ["긴급", "정규", "변경", "수시", "특별"];
const ORDER_TYPES = [
  "위생장애",
  "고객 피드백(ML)_긴급",
  "초장기 미세차",
  "주기세차",
  "고객 피드백(ML)",
  "반납 사진(ML)",
  "미션핸들",
  "특수세차",
  "협의세차",
  "재세차",
  "수시세차",
  "BMW",
  "랜지로버",
  "포르쉐",
  "캠핑카",
];
const WASH_TYPES = ["내외부", "내부", "외부", "특수", "협의", "라이트"];

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

function OrdersPage({ quickStatus, onClearQuickStatus, initialOrderId, orders, setOrders, missions, setMissions }) {
  const today = new Date();

  const [q, setQ] = useState("");
  const [searchField, setSearchField] = useState("plate");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [periodFrom, setPeriodFrom] = useState(toYmd(new Date(today.getTime() - 7 * 86400000)));
  const [periodTo, setPeriodTo] = useState(toYmd(today));
  const [fRegion1, setFRegion1] = useState("");
  const [fRegion2, setFRegion2] = useState("");
  const [fOrderGroup, setFOrderGroup] = useState("");
  const [fOrderType, setFOrderType] = useState("");
  const [fWashType, setFWashType] = useState("");
  const [fPartner, setFPartner] = useState("");
  const [fPartnerType, setFPartnerType] = useState("");
  const [fStatus, setFStatus] = useState(quickStatus && quickStatus !== "전체" ? quickStatus : "");

  const [selected, setSelected] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [drawerTab, setDrawerTab] = useState("info");
  const [previewImage, setPreviewImage] = useState(null);
  
  // 신규 기능용 상태
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // 오더 발행 폼 상태
  const [newOrderForm, setNewOrderForm] = useState({ plate: "", orderGroup: "수시", orderType: "수시세차", washType: "외부" });

  const [foundVehicle, setFoundVehicle] = useState(null);

  useEffect(() => {
    if (newOrderForm.plate.trim()) {
      const vehicle = MOCK_VEHICLES.find(v => v.plate === newOrderForm.plate.trim());
      setFoundVehicle(vehicle || null);
    } else {
      setFoundVehicle(null);
    }
  }, [newOrderForm.plate]);

  useEffect(() => {
    if (initialOrderId) {
      const target = orders.find((o) => o.orderId === initialOrderId);
      if (target) {
        setSelected(target);
      }
    }
  }, [initialOrderId, orders]);

  const regions1 = useMemo(() => Array.from(new Set(orders.map((d) => d.region1))), [orders]);
  const regions2 = useMemo(
    () => Array.from(new Set(orders.filter((d) => (fRegion1 ? d.region1 === fRegion1 : true)).map((d) => d.region2))),
    [orders, fRegion1]
  );
  const partners = useMemo(() => Array.from(new Set(orders.map((d) => d.partner))), [orders]);
  const statuses = ["미배정", "파트너 배정", "예약", "입고 중", "수행 중", "세차 완료", "출고 중", "완료", "취소"];
  const orderGroups = ORDER_GROUPS;
  const orderTypes = ORDER_TYPES;
  const washTypes = WASH_TYPES;

  // 오더 발행 핸들러
  const handleCreateOrder = () => {
    if (!foundVehicle) {
      alert("등록되지 않은 차량번호입니다. 차량 관리에서 먼저 확인해주세요.");
      return;
    }

    const pendingMissions = missions.filter(m => m.plate === foundVehicle.plate && m.status === "pending");

    const newOrder = {
      orderId: `O-${Date.now()}`,
      washType: newOrderForm.washType,
      orderGroup: newOrderForm.orderGroup,
      orderType: newOrderForm.orderType,
      carId: `C-${Math.floor(Math.random() * 10000)}`,
      model: foundVehicle.model,
      plate: foundVehicle.plate,
      zone: foundVehicle.zoneName,
      zoneId: foundVehicle.zoneId,
      region1: foundVehicle.region1,
      region2: foundVehicle.region2,
      partner: foundVehicle.partner,
      partnerType: "현장", // 기본값
      status: "예약",
      elapsedDays: 0,
      worker: "-",
      comment: "수동 발행 오더",
      createdAt: toYmd(new Date()),
      attachedMissions: pendingMissions, // 미션 스냅샷 포함
    };

    setOrders([newOrder, ...orders]);
    
    // 미션 상태 업데이트 (오더 연결)
    if (pendingMissions.length > 0) {
      const missionIds = pendingMissions.map(m => m.id);
      setMissions(prev => prev.map(m => missionIds.includes(m.id) ? { ...m, linkedOrderId: newOrder.orderId, assignedAt: toYmd(new Date()) + " " + new Date().toLocaleTimeString() } : m));
    }

    setIsCreateOpen(false);
    setNewOrderForm({ plate: "", orderGroup: "수시", orderType: "수시세차", washType: "외부" });
    setFoundVehicle(null);
    alert(`오더가 발행되었습니다. (포함된 미션: ${pendingMissions.length}건)`);
  };

  // 파트너 유형에 따른 진행상태 옵션 동적화
  const currentStatuses = useMemo(() => {
    if (fPartnerType === "현장") {
      return ["미배정", "예약", "수행 중", "완료", "취소"];
    }
    // 입고 또는 전체일 경우 전체 상태 노출
    return ["미배정", "파트너 배정", "예약", "입고 중", "수행 중", "세차 완료", "출고 중", "완료", "취소"];
  }, [fPartnerType]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return orders.filter((d) => {
      const targetVal = String(d[searchField] || "").toLowerCase();
      const hitQ = !qq || targetVal.includes(qq);

      const hitPeriod = (!periodFrom || d.createdAt >= periodFrom) && (!periodTo || d.createdAt <= periodTo);
      const hitR1 = !fRegion1 || d.region1 === fRegion1;
      const hitR2 = !fRegion2 || d.region2 === fRegion2;
      const hitOG = !fOrderGroup || d.orderGroup === fOrderGroup;
      const hitOT = !fOrderType || d.orderType === fOrderType;
      const hitWT = !fWashType || d.washType === fWashType;
      const hitP = !fPartner || d.partner === fPartner;
      const hitPT = !fPartnerType || d.partnerType === fPartnerType;
      const hitS = !fStatus || d.status === fStatus;

      return hitQ && hitPeriod && hitR1 && hitR2 && hitOG && hitOT && hitWT && hitP && hitPT && hitS;
    });
  }, [orders, q, searchField, periodFrom, periodTo, fRegion1, fRegion2, fOrderGroup, fOrderType, fWashType, fPartner, fPartnerType, fStatus]);

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

  // 상태 배지 색상 로직
  const getStatusBadgeTone = (status) => {
    if (status === "완료") return "ok";
    if (status === "취소") return "default";
    if (status === "미배정") return "danger";
    if (["예약", "파트너 배정"].includes(status)) return "warn";
    if (["입고 중", "수행 중", "세차 완료", "출고 중"].includes(status)) return "info";
    return "default";
  };

  const columns = [
    { key: "orderId", header: "오더 ID" },
    { key: "orderGroup", header: "오더구분" },
    { key: "orderType", header: "오더유형" },
    {
      key: "washType",
      header: "세차유형",
      render: (r) => <span className="text-[#172B4D]">{r.washType}</span>,
    },
    { key: "carId", header: "차량 ID" },
    { key: "model", header: "차종" },
    { key: "plate", header: "차량번호" },
    { key: "region1", header: "지역1" },
    { key: "region2", header: "지역2" },
    { key: "zone", header: "존이름" },
    { key: "partner", header: "파트너명" },
    { key: "partnerType", header: "파트너유형" },
    {
      key: "status",
      header: "진행상태",
      render: (r) => <Badge tone={getStatusBadgeTone(r.status)}>{r.status}</Badge>,
    },
    { key: "worker", header: "수행원" },
    { key: "createdAt", header: "발행일시" },
    { key: "completedAt", header: "수행일시", render: (r) => r.completedAt || "-" },
  ];

  const chips = (
    <div className="flex flex-wrap gap-2">
      {quickStatus && quickStatus !== "전체" ? (
        <Chip onRemove={() => { onClearQuickStatus(); setFStatus(""); }}>
          Quick Filter: 상태={quickStatus}
        </Chip>
      ) : null}
      {q ? <Chip onRemove={() => setQ("")}>검색: {q}</Chip> : null}
      {periodFrom || periodTo ? <Chip onRemove={() => { setPeriodFrom(""); setPeriodTo(""); }}>기간: {periodFrom || "-"} ~ {periodTo || "-"}</Chip> : null}
      {fRegion1 ? <Chip onRemove={() => { setFRegion1(""); setFRegion2(""); }}>지역1: {fRegion1}</Chip> : null}
      {fRegion2 ? <Chip onRemove={() => setFRegion2("")}>지역2: {fRegion2}</Chip> : null}
      {fOrderGroup ? <Chip onRemove={() => setFOrderGroup("")}>오더구분: {fOrderGroup}</Chip> : null}
      {fOrderType ? <Chip onRemove={() => setFOrderType("")}>오더유형: {fOrderType}</Chip> : null}
      {fWashType ? <Chip onRemove={() => setFWashType("")}>세차유형: {fWashType}</Chip> : null}
      {fPartner ? <Chip onRemove={() => setFPartner("")}>파트너명: {fPartner}</Chip> : null}
      {fPartnerType ? <Chip onRemove={() => setFPartnerType("")}>파트너유형: {fPartnerType}</Chip> : null}
      {fStatus ? <Chip onRemove={() => { setFStatus(""); onClearQuickStatus(); }}>상태: {fStatus}</Chip> : null}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">오더 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">상단 필터 및 데이터 그리드, 행 클릭 Drawer 상세(프로토타입)</div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> 오더 발행
          </Button>
          <Button variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            목록 다운로드
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
          <CardDescription>
            검색: 차량번호, 오더 ID, 존 ID, 존이름, 수행원, 코멘트 요약 / 필터: 기간, 지역1/2, 오더구분/유형, 세차유형, 파트너명, 진행상태
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="flex items-center gap-2">
                <Select className="!w-40 shrink-0" value={searchField} onChange={e => setSearchField(e.target.value)}>
                  <option value="plate">차량번호</option>
                  <option value="orderId">오더 ID</option>
                  <option value="zone">존이름</option>
                  <option value="worker">수행원</option>
                </Select>
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
                  <Input 
                    value={q} 
                    onChange={(e) => setQ(e.target.value)} 
                    placeholder={`${
                      searchField === 'plate' ? '차량번호' : searchField === 'orderId' ? '오더 ID' : searchField === 'zone' ? '존이름' : '수행원'
                    } 검색`} 
                    className="pl-9" 
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex items-center gap-2">
              <label htmlFor="periodFrom" className="text-sm font-medium text-[#475569] shrink-0">발행일시</label>
              <Input id="periodFrom" type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
              <span className="text-[#6B778C]">~</span>
              <Input type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <Select value={fRegion1} onChange={(e) => { setFRegion1(e.target.value); setFRegion2(""); }}>
                <option value="">지역1 전체</option>
                {regions1.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={fRegion2} onChange={(e) => setFRegion2(e.target.value)}>
                <option value="">지역2 전체</option>
                {regions2.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>

            <div className="md:col-span-2">
              <Select value={fOrderGroup} onChange={(e) => setFOrderGroup(e.target.value)}>
                <option value="">오더구분 전체</option>
                {orderGroups.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={fOrderType} onChange={(e) => setFOrderType(e.target.value)}>
                <option value="">오더유형 전체</option>
                {orderTypes.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={fWashType} onChange={(e) => setFWashType(e.target.value)}>
                <option value="">세차유형 전체</option>
                {washTypes.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={fPartner} onChange={(e) => setFPartner(e.target.value)}>
                <option value="">파트너명 전체</option>
                {partners.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={fPartnerType} onChange={(e) => {
                const newType = e.target.value;
                setFPartnerType(newType);
                
                // 파트너 유형 변경 시, 현재 선택된 상태값이 유효하지 않으면 초기화
                let validStatuses = [];
                if (newType === "현장") {
                  validStatuses = ["미배정", "예약", "수행 중", "완료", "취소"];
                } else {
                  validStatuses = ["미배정", "파트너 배정", "예약", "입고 중", "수행 중", "세차 완료", "출고 중", "완료", "취소"];
                }
                
                if (fStatus && !validStatuses.includes(fStatus)) {
                  setFStatus("");
                  onClearQuickStatus();
                }
              }}>
                <option value="">파트너유형 전체</option>
                <option value="현장">현장</option>
                <option value="입고">입고</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={fStatus} onChange={(e) => { setFStatus(e.target.value); onClearQuickStatus(); }}>
                <option value="">진행상태 전체</option>
                {currentStatuses.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>

            <div className="md:col-span-12 flex flex-wrap items-center justify-between gap-2 pt-1">
              {chips}
              <Button
                variant="secondary"
                onClick={() => {
                  setQ("");
                  setPeriodFrom(toYmd(new Date(today.getTime() - 7 * 86400000)));
                  setPeriodTo(toYmd(today));
                  setFRegion1(""); setFRegion2("");
                  setFOrderGroup(""); setFOrderType(""); setFWashType("");
                  setFPartner("");
                  setFPartnerType("");
                  setFStatus("");
                  onClearQuickStatus();
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
        rowKey={(r) => r.orderId}
        onRowClick={(r) => setSelected(r)}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* 오더 상세 Drawer */}
      <Drawer
        open={!!selected}
        title={selected ? `오더 상세 - ${selected.orderId}` : "오더 상세"}
        onClose={() => { setSelected(null); setDeleteModalOpen(false); setDeleteReason(""); setDrawerTab("info"); }}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>닫기</Button>
            {selected?.status !== "완료" && selected?.status !== "취소" && drawerTab === "info" && (
              <Button
                onClick={() => {
                  // 오더 완료 처리 로직
                  const updatedOrders = orders.map(o => o.orderId === selected.orderId ? { ...o, status: "완료", completedAt: new Date().toISOString().substring(0, 16).replace('T', ' ') } : o);
                  setOrders(updatedOrders);
                  
                  // 미션 완료 처리 로직 (Global State Update)
                  if (selected.attachedMissions?.length > 0) {
                    const missionIds = selected.attachedMissions.map(m => m.id); // 스냅샷 기준 ID
                    setMissions(prev => prev.map(m => missionIds.includes(m.id) ? { ...m, status: "completed", completedAt: toYmd(new Date()) + " " + new Date().toLocaleTimeString() } : m));
                  }
                  
                  setSelected(null);
                  alert("오더 수행 완료 처리되었습니다. 관련 미션도 완료 상태로 변경됩니다.");
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> 수행 완료
              </Button>
            )}
            <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              오더 삭제
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <Tabs value={drawerTab}>
            <TabsList>
              <TabsTrigger value="info" currentValue={drawerTab} onClick={setDrawerTab}>상세정보</TabsTrigger>
              <TabsTrigger value="history" currentValue={drawerTab} onClick={setDrawerTab}>사진 및 이력</TabsTrigger>
              <TabsTrigger value="mission" currentValue={drawerTab} onClick={setDrawerTab}>미션 및 분실물</TabsTrigger>
            </TabsList>

            <TabsContent value="info" currentValue={drawerTab} className="space-y-4 pt-4">
              {/* 1. 기본 정보 섹션 */}
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>오더 및 차량 주요 정보</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm text-[#172B4D]">
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="font-bold text-[#0052CC]">{selected.orderId}</span>
                    <Badge tone={selected.orderGroup === "긴급" ? "danger" : "default"}>
                      {selected.orderGroup}
                    </Badge>
                  </div>
                  
                  <div className="col-span-2 border-t border-[#DFE1E6] my-1"></div>

                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">차량번호 / 차종</div>
                    <div className="font-medium">{selected.plate} ({selected.model})</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">존이름</div>
                    <div className="font-medium">{selected.zone}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">오더 유형</div>
                    <div>{selected.orderType}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">세차유형</div>
                    <div className="font-medium">{selected.washType}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">파트너 유형</div>
                    <div>{selected.partnerType}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">수행원</div>
                    <div>{selected.worker}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">진행 상태</div>
                    <Badge tone={getStatusBadgeTone(selected.status)}>{selected.status}</Badge>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="text-xs text-[#6B778C]">메모</div>
                    <div className="bg-[#F4F5F7] p-2 rounded-lg text-xs">{selected.comment}</div>
                  </div>
                </CardContent>
              </Card>

              {/* 6. 금액 및 연계 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle>금액 및 연계 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6B778C]">최종 청구 금액</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#172B4D]">25,000원</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        청구 내역 <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {selected.partnerType === '입고' && (
                    <div className="flex items-center justify-between border-t border-[#DFE1E6] pt-3">
                      <span className="text-sm text-[#6B778C]">연계 오더 (Parent)</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-[#0052CC]">
                        O-89999 <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" currentValue={drawerTab} className="space-y-4 pt-4">
              {/* 2. 수행 및 예약 이력 (Timeline) */}
              <Card>
                <CardHeader><CardTitle>진행 이력</CardTitle></CardHeader>
                <CardContent>
                  <div className="relative space-y-4 pl-2 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-[#DFE1E6]">
                    {(selected.partnerType === "입고" 
                      ? [
                          { time: "2026-01-12 10:00", label: "미배정", active: true },
                          { time: "2026-01-12 10:05", label: "파트너 배정", active: true },
                          { time: "2026-01-12 10:10", label: "예약", active: true },
                          { time: "2026-01-12 10:30", label: "입고 중", active: true },
                          { time: "2026-01-12 11:00", label: "수행 중", active: selected.status === "완료" },
                          { time: "2026-01-12 11:45", label: "출고 중", active: selected.status === "완료" },
                          { time: "2026-01-12 12:00", label: "완료", active: selected.status === "완료" },
                        ]
                      : [
                          { time: "2026-01-12 10:00", label: "미배정", active: true },
                          { time: "2026-01-12 10:10", label: "예약", active: true },
                          { time: "2026-01-12 11:00", label: "수행 중", active: selected.status === "완료" },
                          { time: "2026-01-12 11:45", label: "완료", active: selected.status === "완료" },
                        ]).map((item, idx) => (
                      <div key={idx} className="relative flex items-start gap-3">
                        <div className={cn("z-10 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ring-4 ring-white", item.active ? "bg-[#0052CC]" : "bg-[#DFE1E6]")} />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-[#172B4D]">{item.label}</span>
                          <span className="text-[10px] text-[#6B778C]">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 3. 수행 전후 사진 */}
              <Card>
                <CardHeader><CardTitle>수행 사진</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {["수행 전", "수행 후"].map((label) => (
                    <div key={label}>
                      <div className="mb-2 text-xs font-semibold text-[#6B778C]">{label}</div>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2].map((i) => (
                          <button key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-[#F4F5F7] border border-[#DFE1E6]" onClick={() => setPreviewImage(`https://via.placeholder.com/600?text=${label}+${i}`)}>
                            <div className="flex h-full w-full items-center justify-center text-[#B3BAC5]">
                              <ImageIcon className="h-6 w-6" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <Maximize2 className="h-5 w-5 text-white" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 4. 점검 내역 */}
              <Card>
                <CardHeader><CardTitle>점검 리스트</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: "외관 세정 상태", status: "pass" },
                    { label: "휠/타이어 세정", status: "pass" },
                    { label: "실내 매트 청결", status: "pass" },
                    { label: "쓰레기 수거", status: "pass" },
                  ].map((check, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-[#DFE1E6] p-3">
                      <span className="text-sm text-[#172B4D]">{check.label}</span>
                      <div className="flex items-center gap-1 text-[#0052CC]">
                        <Check className="h-4 w-4" />
                        <span className="text-xs font-bold">Pass</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mission" currentValue={drawerTab} className="space-y-4 pt-4">
              {/* 5. 분실물 및 미션 관리 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" /> 미션
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selected.attachedMissions && selected.attachedMissions.length > 0 ? (
                    <div className="space-y-2">
                      {selected.attachedMissions.map(m => (
                        <div key={m.id} className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 p-3">
                          <span className="text-sm font-medium text-amber-900">{m.content}</span>
                          <Badge tone={m.status === 'completed' ? 'ok' : 'warn'}>{m.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-[#6B778C]">등록된 미션이 없습니다.</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PackageSearch className="h-4 w-4" /> 분실물
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Mock Data for Lost Items */}
                  <div className="flex items-start gap-3 rounded-lg border border-[#DFE1E6] p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4F5F7]">
                      <PackageSearch className="h-5 w-5 text-[#6B778C]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-[#172B4D]">지갑 (검정색)</div>
                        <Badge tone="ok">보관중</Badge>
                      </div>
                      <div className="mt-1 text-xs text-[#6B778C]">조수석 바닥 발견 (2026-01-12)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

            {deleteModalOpen ? (
              <Card className="ring-rose-200">
                <CardHeader>
                  <CardTitle className="text-rose-700">오더 삭제</CardTitle>
                  <CardDescription>삭제 사유 기록(프로토타입). 실제로는 권한 및 감사 로그가 필요합니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="삭제 사유를 입력하세요"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => { setDeleteModalOpen(false); setDeleteReason(""); }}>
                      취소
                    </Button>
                    <Button
                      variant="danger"
                      disabled={!deleteReason.trim()}
                      onClick={() => {
                        // 실제 삭제는 미구현. 프로토타입용 alert 처리.
                        alert(`(프로토타입) 삭제 처리: ${selected.orderId}\n사유: ${deleteReason}`);
                        setDeleteModalOpen(false);
                        setDeleteReason("");
                        setSelected(null);
                      }}
                    >
                      삭제 확정
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}
      </Drawer>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-h-full max-w-full overflow-hidden rounded-lg bg-white">
            <button className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70" onClick={() => setPreviewImage(null)}>
              <X className="h-5 w-5" />
            </button>
            <img src={previewImage} alt="Preview" className="max-h-[80vh] w-auto object-contain" />
          </div>
        </div>
      )}

      {/* 오더 발행 Drawer */}
      <Drawer
        open={isCreateOpen}
        title="오더 수동 발행"
        onClose={() => {
          setIsCreateOpen(false);
          setNewOrderForm({ plate: "", orderGroup: "수시", orderType: "수시세차", washType: "외부" });
          setFoundVehicle(null);
        }}
        footer={
          <Button onClick={handleCreateOrder} className="w-full" disabled={!foundVehicle}>발행하기</Button>
        }
      >
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>발행 정보 입력</CardTitle>
              <CardDescription>차량 번호 입력 시 대기 중인 미션이 있으면 자동 포함됩니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">차량번호 *</label>
                <Input value={newOrderForm.plate} onChange={e => setNewOrderForm({...newOrderForm, plate: e.target.value})} placeholder="예: 12가3456" />
              </div>
              
              {foundVehicle ? (
                <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4 animate-in fade-in-50">
                  <div className="text-xs font-bold text-blue-800">조회된 차량 정보</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <div className="text-xs text-blue-700">차종</div>
                      <div className="font-medium text-blue-900">{foundVehicle.model}</div>
                    </div>
                    <div>
                      <div className="text-xs text-blue-700">존이름</div>
                      <div className="font-medium text-blue-900">{foundVehicle.zoneName}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-blue-700">담당 파트너</div>
                      <div className="font-medium text-blue-900">{foundVehicle.partner}</div>
                    </div>
                  </div>
                </div>
              ) : newOrderForm.plate.trim() ? (
                 <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-center text-xs font-medium text-rose-700 animate-in fade-in-50">
                   일치하는 차량 정보가 없습니다.
                 </div>
              ) : null}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">오더구분</label>
                <Select value={newOrderForm.orderGroup} onChange={e => setNewOrderForm({...newOrderForm, orderGroup: e.target.value})}>
                  {orderGroups.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">오더유형</label>
                <Select value={newOrderForm.orderType} onChange={e => setNewOrderForm({...newOrderForm, orderType: e.target.value})}>
                  {orderTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">세차유형</label>
                <Select value={newOrderForm.washType} onChange={e => setNewOrderForm({...newOrderForm, washType: e.target.value})}>
                  {washTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </Drawer>
    </div>
  );
}

export default OrdersPage;