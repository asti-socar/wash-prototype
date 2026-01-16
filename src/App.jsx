import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard,
  Settings,
  MapPinned,
  Car,
  ClipboardList,
  Handshake,
  Receipt,
  PackageSearch,
  Megaphone,
  Building2,
  Users,
  UserCog,
  Search,
  X,
  Download,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Edit,
  Check,
  Clock,
  Image as ImageIcon,
  ExternalLink,
  Maximize2,
  Camera,
  ListChecks,
  ArrowRight,
  History,
  Menu,
  Folder,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  FileSpreadsheet,
} from "lucide-react";

import { BROWN_HISTORY, ASTI_HISTORY } from "./constants/updateHistory";
import Dashboard from "./pages/Dashboard";
import OrdersPage from "./pages/OrdersPage";
import MissionsPage from "./pages/MissionsPage";
import CarsPage from "./pages/CarsPage";
import PartnersPage from './pages/PartnersPage';
import PartnerManagersPage from './pages/PartnerManagersPage';
import WorkersPage from './pages/WorkersPage';

/**
 * util
 */
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatPercent(v) {
  if (typeof v !== "number") return "-";
  return `${Math.round(v * 100)}%`;
}

function toYmd(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Custom hook to detect mobile screen size
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's 'md' breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
function PillTabs({ value, onChange, items }) {
  return (
    <div className="inline-flex rounded-lg bg-[#F4F5F7] p-1 border border-[#DFE1E6]">
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={cn(
              "h-8 rounded-md px-3 text-sm transition font-medium",
              active ? "bg-white text-[#0052CC] shadow-sm" : "text-[#6B778C] hover:text-[#172B4D]"
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
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

  // 3. 바디 스크롤 방지 로직 보완: Drawer가 활성화된 상태에서 배경(Body) 스크롤 방지
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  // Resizing logic
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
      {/* Drawer Backdrop (DIM) */}
      <div
        className="fixed inset-0 bg-black/30 z-40" // z-index 40: 메인 콘텐츠보다 높지만 Drawer 컴포넌트보다는 낮게
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer Panel */}
      <div
        className="fixed top-0 right-0 h-full bg-white shadow-2xl flex flex-col z-50" // z-index 50: Drawer 컴포넌트
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
 * Accordion (for Sidebar)
 */
function Accordion({ type, children, ...props }) {
  return <div {...props}>{children}</div>;
}

function AccordionItem({ value, children }) {
  // In a real implementation, we'd use context to manage state.
  // For this prototype, we pass props down.
  return <div className="border-b border-transparent">{children}</div>;
}

function AccordionTrigger({ children, isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-[#B3BAC5] transition-all hover:bg-[#0052CC] hover:text-white hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {children}
      </div>
      <ChevronRight
        className={cn(
          "h-4 w-4 shrink-0 text-[#8993A4] transition-transform duration-200 group-hover:text-white",
          isOpen && "rotate-90"
        )}
      />
    </button>
  );
}

function AccordionContent({ children, isOpen }) {
  return (
    <div className={cn("overflow-hidden text-sm transition-all", isOpen ? "max-h-96" : "max-h-0")}>
      <div className="pt-1 pb-2 pl-6">{children}</div>
    </div>
  );
}

/**
 * Pagination Components & Hooks
 */
function usePagination(data, itemsPerPage = 40) {
  const [currentPage, setCurrentPage] = useState(1);

  // 데이터(필터 결과 등)가 변경되면 1페이지로 초기화
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

  // 간단한 페이지 번호 리스트 (데이터가 많아지면 windowing 필요)
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
function Tabs({ value, onValueChange, children }) {
  // Clone children to pass props if needed, or just rely on children using the value
  // For simplicity in this file, we'll assume children are TabsList and TabsContent
  // and we manage state in the parent or pass props explicitly.
  // But to make it cleaner like a library:
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

/**
 * Constants & Enums
 */

/**
 * Navigation model (IA)
 */
const NAV = [
  {
    group: "제품 기획 관리",
    items: [{ key: "update-history", label: "업데이트 이력", icon: History }],
  },
  {
    group: "인터널 어드민 기능",
    items: [{ key: "dashboard", label: "대시보드(HOME)", icon: LayoutDashboard }],
  },
  {
    group: "오더 정책 관리",
    type: 'group',
    key: 'order-policy',
    label: '오더 정책 관리',
    icon: Settings,
    items: [
      { key: "ai-policy", label: "AI 모델 정책 관리", icon: Settings, parentKey: 'order-policy' },
      { key: "zone-policy", label: "존 정책 관리", icon: MapPinned, parentKey: 'order-policy' },
      { key: "region-policy", label: "지역 정책 관리", icon: MapPinned, parentKey: 'order-policy' },
    ],
  },
  {
    group: "업무 관리",
    type: 'group',
    key: 'work-management',
    label: '업무 관리',
    icon: ClipboardList,
    items: [
      { key: "vehicles", label: "차량 관리", icon: Car, parentKey: 'work-management' },
      { key: "orders", label: "오더 관리", icon: ClipboardList, parentKey: 'work-management' },
      { key: "missions", label: "미션 관리", icon: ClipboardList, parentKey: 'work-management' },
      { key: "settlement", label: "합의 요청 관리", icon: Handshake, parentKey: 'work-management' },
      { key: "billing", label: "청구 관리", icon: Receipt, parentKey: 'work-management' },
      { key: "lostfound", label: "분실물 관리", icon: PackageSearch, parentKey: 'work-management' },
      { key: "notices", label: "공지 관리(CMS)", icon: Megaphone, parentKey: 'work-management' },
    ],
  },
  {
    group: "정보 관리",
    type: 'group',
    key: 'info-management',
    label: '정보 관리',
    icon: Folder,
    items: [
      { key: "partners", label: "파트너 관리", icon: Building2, parentKey: 'info-management' },
      { key: "partner-managers", label: "파트너 담당자 관리", icon: Users, parentKey: 'info-management' },
      { key: "workers", label: "수행원 조회", icon: UserCog, parentKey: 'info-management' },
    ]
  },
];

const PAGE_TITLES = {
  "update-history": "업데이트 이력",
  dashboard: "관제 대시보드",
  "ai-policy": "AI 모델 정책 관리",
  "zone-policy": "존 정책 관리",
  "region-policy": "지역 정책 관리",
  vehicles: "차량 관리",
  missions: "미션 관리",
  orders: "오더 관리",
  settlement: "합의 요청 관리",
  billing: "청구 관리",
  lostfound: "분실물 관리",
  notices: "공지 관리(CMS)",
  partners: "파트너 관리",
  "partner-managers": "파트너 담당자 관리",
  workers: "수행원 조회",
};

/**
 * App
 */
export default function App() {
  const [activeKey, setActiveKey] = useState("dashboard");
  const isMobile = useIsMobile(); // 1. useIsMobile 훅 사용
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(() => NAV.find(g => g.items?.some(it => it.key === activeKey))?.key || "");

  // 버전 업데이트 감지 로직
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const lastCheckTimeRef = useRef(0);

  const checkVersion = useCallback(async () => {
    const now = new Date();
    // KST 기준 시간 계산 (UTC+9)
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    const day = kstDate.getUTCDay(); // 0: 일, 1: 월 ... 6: 토
    const hour = kstDate.getUTCHours(); // 0~23

    // 1. 업무시간 제한 (월~금, 09:00 ~ 18:00)
    const isBusinessHours = day >= 1 && day <= 5 && hour >= 9 && hour < 18;
    if (!isBusinessHours) return;

    // 2. 중복 요청 방지 (Throttle: 10분)
    const THROTTLE_MS = 10 * 60 * 1000;
    if (now.getTime() - lastCheckTimeRef.current < THROTTLE_MS) return;

    try {
      lastCheckTimeRef.current = now.getTime(); // 요청 시점 기록
      // 캐시 방지를 위해 timestamp 추가
      const res = await fetch(`/version.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      // 현재 버전 = 브라운 최신 ID + 아스티 최신 ID (합산)
      const currentVersion = (BROWN_HISTORY[0]?.id || 0) + (ASTI_HISTORY[0]?.id || 0);
      
      if (data.latestId > currentVersion) {
        setUpdateAvailable(true);
      }
    } catch (error) {
      console.error("Version check failed:", error);
    }
  }, []);

  useEffect(() => {
    checkVersion(); // 1) 마운트 시

    const interval = setInterval(checkVersion, 10 * 60 * 1000); // 2) 10분 주기 타이머

    const onFocus = () => checkVersion(); // 3) 창 포커스 시
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [checkVersion]);

  // 3. 바디 스크롤 방지 로직 보완: 모바일 사이드바 활성화 시 배경(Body) 스크롤 방지
  useEffect(() => {
    if (isMobileMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen, isMobile]);


  // 대시보드 KPI 카드 클릭 시 "오더 관리"로 이동하면서 필터를 “적용한 것처럼” 표시하는 상태
  const [orderQuickFilter, setOrderQuickFilter] = useState(null); // { status: '예약' | ... }
  const [initialOrderId, setInitialOrderId] = useState(null);

  // Lifted State: Missions (전역 관리)
  const [missions, setMissions] = useState([
    // 1. Pending (policy compliant)
    { id: "M-1001", plate: "12가3456", content: "스티커 부착", status: "pending", createdAt: "2026-01-10", amount: 0, requiresPhoto: true, zoneName: null, assignedAt: null, completedAt: null, linkedOrderId: null },
    // 2. Completed
    { id: "M-1002", plate: "34나7890", content: "내부 청소 집중", status: "completed", linkedOrderId: "O-90002", zoneName: "잠실역 2번존", createdAt: "2026-01-08", assignedAt: "2026-01-09 10:00", completedAt: "2026-01-09 14:00", amount: 5000, requiresPhoto: true },
    // 3. Completed
    { id: "M-1003", plate: "78라3344", content: "블랙박스 점검", status: "completed", linkedOrderId: "O-90004", zoneName: "판교 1번존", createdAt: "2026-01-07", assignedAt: "2026-01-08 11:00", completedAt: "2026-01-08 15:00", amount: 3000, requiresPhoto: false },
    // 4. Pending
    { id: "M-1004", plate: "56다1122", content: "광고물 제거", status: "pending", createdAt: "2026-01-11", amount: 2000, requiresPhoto: true, zoneName: null, assignedAt: null, completedAt: null, linkedOrderId: null },
    // 5. Pending
    { id: "M-1005", plate: "90마5566", content: "타이어 공기압 체크", status: "pending", createdAt: "2026-01-12", amount: 0, requiresPhoto: false, zoneName: null, assignedAt: null, completedAt: null, linkedOrderId: null },
    // 6. Completed
    { id: "M-1006", plate: "11바7788", content: "엔진룸 클리닝", status: "completed", linkedOrderId: "O-90006", zoneName: "부산역 1번존", createdAt: "2026-01-05", assignedAt: "2026-01-06 09:00", completedAt: "2026-01-06 13:00", amount: 15000, requiresPhoto: true },
    // 7. Pending
    { id: "M-1007", plate: "22사9900", content: "유리 발수 코팅", status: "pending", createdAt: "2026-01-13", amount: 8000, requiresPhoto: true, zoneName: null, assignedAt: null, completedAt: null, linkedOrderId: null },
    // 8. Completed
    { id: "M-1008", plate: "33아1212", content: "실내 탈취", status: "completed", linkedOrderId: "O-90008", zoneName: "대전역 1번존", createdAt: "2026-01-09", assignedAt: "2026-01-10 12:00", completedAt: "2026-01-10 16:00", amount: 5000, requiresPhoto: false },
    // 9. Pending
    { id: "M-1009", plate: "44자3434", content: "와이퍼 교체", status: "pending", createdAt: "2026-01-14", amount: 1000, requiresPhoto: false, zoneName: null, assignedAt: null, completedAt: null, linkedOrderId: null },
    // 10. Completed
    { id: "M-1010", plate: "55차5656", content: "가죽 시트 케어", status: "completed", linkedOrderId: "O-90010", zoneName: "광주 1번존", createdAt: "2026-01-10", assignedAt: "2026-01-11 13:00", completedAt: "2026-01-11 17:00", amount: 12000, requiresPhoto: true },
  ]);

  // Lifted State: Orders (전역 관리)
  const [orders, setOrders] = useState(() => [
    { orderId: "O-90001", washType: "내부", orderGroup: "정규", orderType: "주기세차", carId: "C-1001", model: "아반떼 AD", plate: "12가3456", zone: "강남역 1번존", zoneId: "Z-1001", region1: "서울", region2: "강남", partner: "A파트너명", partnerType: "현장", status: "예약", elapsedDays: 2, worker: "수행원 김00", comment: "오염도 3, 내부 우선" , createdAt: toYmd(new Date())},
    { orderId: "O-90002", washType: "내외부", orderGroup: "수시", orderType: "수시세차", carId: "C-1002", model: "K5", plate: "34나7890", zone: "잠실역 2번존", zoneId: "Z-1002", region1: "서울", region2: "송파", partner: "B파트너명", partnerType: "현장", status: "완료", elapsedDays: 4, worker: "수행원 이00", comment: "합의건, 추가요금 협의" , createdAt: toYmd(new Date()), completedAt: `${toYmd(new Date())} 14:50`},
    { orderId: "O-90003", washType: "외부", orderGroup: "정규", orderType: "주기세차", carId: "C-1003", model: "쏘나타", plate: "56다1122", zone: "홍대입구 3번존", zoneId: "Z-1003", region1: "서울", region2: "마포", partner: "A파트너명", partnerType: "현장", status: "미배정", elapsedDays: 7, worker: "-", comment: "미배정 상태, 수행원 부족" , createdAt: toYmd(new Date())},
    { orderId: "O-90004", washType: "내부", orderGroup: "특별", orderType: "특수세차", carId: "C-2001", model: "아이오닉5", plate: "78라3344", zone: "판교 1번존", zoneId: "Z-2001", region1: "경기", region2: "성남", partner: "C파트너명", partnerType: "입고", status: "입고 중", elapsedDays: 3, worker: "수행원 박00", comment: "EV, 실내 매트 확인" , createdAt: toYmd(new Date())},
    { orderId: "O-90005", washType: "내외부", orderGroup: "정규", orderType: "주기세차", carId: "C-2002", model: "스포티지", plate: "90마5566", zone: "수원역 2번존", zoneId: "Z-2002", region1: "경기", region2: "수원", partner: "B파트너명", partnerType: "현장", status: "완료", elapsedDays: 5, worker: "수행원 최00", comment: "점검 체크리스트 완료" , createdAt: toYmd(new Date()), completedAt: `${toYmd(new Date())} 16:30`},
    { orderId: "O-90006", washType: "외부", orderGroup: "정규", orderType: "주기세차", carId: "C-3001", model: "그랜저", plate: "11바7788", zone: "부산역 1번존", zoneId: "Z-3001", region1: "부산", region2: "동구", partner: "D파트너명", partnerType: "현장", status: "미배정", elapsedDays: 9, worker: "-", comment: "장기 미배정 리스크" , createdAt: toYmd(new Date())},
    { orderId: "O-90007", washType: "내부", orderGroup: "수시", orderType: "수시세차", carId: "C-3002", model: "레이", plate: "22사9900", zone: "해운대 2번존", zoneId: "Z-3002", region1: "부산", region2: "해운대", partner: "D파트너명", partnerType: "현장", status: "예약", elapsedDays: 1, worker: "수행원 정00", comment: "오염도 2" , createdAt: toYmd(new Date())},
    { orderId: "O-90008", washType: "내외부", orderGroup: "정규", orderType: "주기세차", carId: "C-4001", model: "카니발", plate: "33아1212", zone: "대전역 1번존", zoneId: "Z-4001", region1: "대전", region2: "동구", partner: "C파트너명", partnerType: "입고", status: "출고 중", elapsedDays: 6, worker: "수행원 한00", comment: "분실물 없음" , createdAt: toYmd(new Date()), completedAt: `${toYmd(new Date())} 18:40`},
    { orderId: "O-90009", washType: "외부", orderGroup: "정규", orderType: "주기세차", carId: "C-5002", model: "모닝", plate: "44자3434", zone: "청주 2번존", zoneId: "Z-5002", region1: "충북", region2: "청주", partner: "B파트너명", partnerType: "현장", status: "미배정", elapsedDays: 10, worker: "-", comment: "존 인력 수급 이슈" , createdAt: toYmd(new Date())},
    { orderId: "O-90010", washType: "내부", orderGroup: "긴급", orderType: "위생장애", carId: "C-6001", model: "EV6", plate: "55차5656", zone: "광주 1번존", zoneId: "Z-6001", region1: "광주", region2: "서구", partner: "A파트너명", partnerType: "현장", status: "예약", elapsedDays: 3, worker: "수행원 오00", comment: "내부 먼지 제거 요청" , createdAt: toYmd(new Date())},
    { orderId: "O-90011", washType: "내외부", orderGroup: "정규", orderType: "주기세차", carId: "C-7001", model: "티볼리", plate: "66카7878", zone: "인천공항 1번존", zoneId: "Z-7001", region1: "인천", region2: "중구", partner: "C파트너명", partnerType: "입고", status: "완료", elapsedDays: 4, worker: "수행원 유00", comment: "사진 업로드 완료" , createdAt: toYmd(new Date()), completedAt: `${toYmd(new Date())} 14:50`},
    { orderId: "O-90012", washType: "외부", orderGroup: "정규", orderType: "주기세차", carId: "C-8001", model: "셀토스", plate: "77타9090", zone: "제주공항 1번존", zoneId: "Z-8001", region1: "제주", region2: "제주시", partner: "D파트너명", partnerType: "현장", status: "미배정", elapsedDays: 11, worker: "-", comment: "장기 미배정, 알림 필요" , createdAt: toYmd(new Date())},
  ]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page");
    const orderId = params.get("orderId");

    if (page) {
      setActiveKey(page);
    }
    if (orderId) {
      setInitialOrderId(orderId);
    }
  }, []);

  const pageTitle = PAGE_TITLES[activeKey] ?? "Admin";

  const goOrdersWithStatus = (status) => {
    setOrderQuickFilter({ status });
    setActiveKey("orders");
  };

  const onNavSelect = (key) => {
    if (key === "notices") {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write("CMS Link 필요");
      }
      return;
    }
    setActiveKey(key);
    const parentGroup = NAV.find(g => g.items?.some(it => it.key === key));
    if (parentGroup && parentGroup.type === 'group') {
      setOpenAccordion(parentGroup.key);
    }
    // 차량/오더에서 다른 화면으로 이동해도 quickFilter는 유지(프로토타입). 필요 시 여기서 clear 정책 정의 가능.
  };

  const renderPage = () => {
    switch (activeKey) {
      case "dashboard":
        return <Dashboard />;
      case "update-history":
        return <UpdateHistoryPage />;
      case "vehicles":
        return <CarsPage />;
      case "missions":
        return <MissionsPage missions={missions} setMissions={setMissions} orders={orders} />;
      case "orders":
        return (
          <OrdersPage
            quickStatus={orderQuickFilter?.status ?? null}
            onClearQuickStatus={() => setOrderQuickFilter(null)}
            initialOrderId={initialOrderId}
            orders={orders}
            setOrders={setOrders}
            missions={missions}
            setMissions={setMissions}
          />
        );
      case "settlement":
        return <AgreementsPage />;
      case "billing":
        return <BillingPage />;
      case "lostfound":
        return <LostFoundPage />;
      case "notices":
        return <NoticesPage />;
      case "partners":
        return <PartnersPage />;
      case "partner-managers":
        return <PartnerManagersPage />;
      case "workers":
        return <WorkersPage />;
      default:
        return <PlaceholderPage title={pageTitle} description="MVP 범위에서는 리스트 조회, 상단 검색/필터, 우측 Drawer 기반 상세 및 정책 수정 흐름으로 정리하는 것이 효율적입니다." />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#172B4D]">
      {/* 1. 모바일 사이드바 Backdrop 로직 수정 */}
      {/* 2. 조건부 렌더링: 사이드바 배경 DIM(Overlay) 요소는 반드시 isSidebarOpen && isMobile 조건이 모두 참일 때만 화면에 그려지도록 수정 */}
      {/* 2. Z-Index 및 스택 순서 정돈: DIM 우선순위: 사이드바용 DIM 요소의 z-index를 점검하여, 메인 콘텐츠보다는 높지만 Drawer 컴포넌트보다는 낮게 설정 (예: 콘텐츠 0 < DIM 40 < Drawer 50) */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity" // z-index 40
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Panel */}
      {isMobile && (
        <div
          className={cn("fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-[#0F172A] text-white shadow-xl transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full")} // z-index 50
        >
          <SidebarContent activeKey={activeKey} onSelect={(key) => { onNavSelect(key); setIsMobileMenuOpen(false); }} openAccordion={openAccordion} setOpenAccordion={setOpenAccordion} />
        </div>
      )}
      <div className="flex">
        <Sidebar activeKey={activeKey} onSelect={onNavSelect} openAccordion={openAccordion} setOpenAccordion={setOpenAccordion} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header title={pageTitle} activeKey={activeKey} onMenuClick={() => setIsMobileMenuOpen(true)} />

          <main className="min-w-0 flex-1 p-6 md:p-8">
            {renderPage()}
          </main>
        </div>
      </div>

      {/* 버전 업데이트 알림 Toast */}
      {updateAvailable && (
        <div className="fixed bottom-6 right-6 z-50 flex w-96 flex-col gap-3 rounded-xl bg-[#172B4D] p-4 text-white shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0052CC] text-white">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">새로운 업데이트가 있습니다</div>
              <div className="mt-1 text-xs text-gray-300 leading-relaxed">
                최신 기능과 정책이 반영된 버전이 배포되었습니다.<br/>
                안정적인 서비스 이용을 위해 업데이트해주세요.
              </div>
            </div>
            <button onClick={() => setUpdateAvailable(false)} className="text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" className="h-8 bg-white/10 text-white border-none hover:bg-white/20" onClick={() => setUpdateAvailable(false)}>나중에</Button>
            <Button size="sm" className="h-8 bg-[#0052CC] text-white hover:bg-[#0047B3] border-none" onClick={() => window.location.reload(true)}>
              업데이트 적용
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Layout components
 */
function Sidebar({ activeKey, onSelect, openAccordion, setOpenAccordion }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-[#0F172A] text-white md:flex">
      <SidebarContent activeKey={activeKey} onSelect={onSelect} openAccordion={openAccordion} setOpenAccordion={setOpenAccordion} />
    </aside>
  );
}

function SidebarContent({ activeKey, onSelect, openAccordion, setOpenAccordion }) {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-3 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0052CC] text-white shadow-sm">
          <span className="text-sm font-bold">W</span>
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-white">세차 어드민</div>
          <div className="truncate text-xs text-[#B3BAC5]">Ops Console Prototype</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-10 no-scrollbar">
        <style>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        {NAV.map((g) => (
          g.type === 'group' ? (
            <Accordion key={g.key} type="single" collapsible>
              <AccordionItem value={g.key}>
                <AccordionTrigger
                  isOpen={openAccordion === g.key}
                  onClick={() => setOpenAccordion(openAccordion === g.key ? "" : g.key)}
                >
                  <g.icon className="h-4 w-4 shrink-0 text-[#8993A4] group-hover:text-white" />
                  <span className="truncate">{g.label}</span>
                </AccordionTrigger>
                <AccordionContent isOpen={openAccordion === g.key}>
                  <div className="space-y-1">
                    {g.items.map((it) => (
                      <SidebarItem key={it.key} active={it.key === activeKey} icon={it.icon} label={it.label} onClick={() => onSelect(it.key)} isSubItem />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <div key={g.group} className="mt-3">
              <div className="px-4 pb-2 pt-4 text-xs font-bold text-[#8993A4] uppercase tracking-wider">{g.group}</div>
              <div className="space-y-1">
                {g.items.map((it) => (
                  <SidebarItem
                    key={it.key}
                    active={it.key === activeKey}
                    icon={it.icon}
                    label={it.label}
                    onClick={() => onSelect(it.key)}
                  />
                ))}
              </div>
            </div>
          )
        ))}
      </nav>
    </>
  );
}

function SidebarItem({ active, icon: Icon, label, onClick, isSubItem = false }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-4 text-sm transition-all font-medium",
        isSubItem ? "py-2" : "py-2.5",
        active ? "bg-[#0052CC] text-white shadow-md" : "text-[#B3BAC5] hover:bg-slate-700/50 hover:text-white"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-[#8993A4] group-hover:text-white")} />
      <span className="truncate">{label}</span>
    </button>
  );
}

/**
 * Simple Markdown Renderer (No external lib)
 */
function SimpleMarkdownRenderer({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let tableBuffer = [];

  const parseInline = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-[#172B4D]">{part.slice(2, -2)}</strong>;
      }
      return part.split('<br>').map((subPart, subIndex) => (
        <React.Fragment key={`${index}-${subIndex}`}>
          {subIndex > 0 && <br />}
          {subPart}
        </React.Fragment>
      ));
    });
  };

  const flushTable = () => {
    if (tableBuffer.length === 0) return;

    const headerRow = tableBuffer[0];
    const parseRow = (row) => row.split('|').slice(1, -1).map(c => c.trim());
    
    let headers = [];
    let bodyRows = [];

    if (tableBuffer.length > 1 && tableBuffer[1].includes('---')) {
      headers = parseRow(headerRow);
      bodyRows = tableBuffer.slice(2).map(parseRow);
    } else {
      headers = parseRow(headerRow);
      bodyRows = tableBuffer.slice(1).map(parseRow);
    }

    elements.push(
      <div key={`table-${elements.length}`} className="overflow-x-auto my-4 rounded-lg border border-[#DFE1E6]">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#EBECF0]">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 font-bold text-[#172B4D] border-b border-[#DFE1E6] whitespace-nowrap">
                  {parseInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE1E6]">
            {bodyRows.map((row, rI) => (
              <tr key={rI} className="hover:bg-[#F4F5F7]">
                {row.map((cell, cI) => (
                  <td key={cI} className="px-4 py-3 text-[#172B4D] align-top">
                    {parseInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (line.startsWith('|') && line.endsWith('|')) {
      tableBuffer.push(line);
      continue;
    } else {
      flushTable();
    }

    if (!line) continue;

    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-2xl font-bold mt-8 mb-4 text-[#172B4D]">{parseInline(line.slice(2))}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-lg font-bold mt-6 mb-3 text-[#172B4D] border-b border-[#DFE1E6] pb-2">{parseInline(line.slice(3))}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-base font-bold mt-4 mb-2 text-[#172B4D]">{parseInline(line.slice(4))}</h3>);
    } else if (line.startsWith('#### ')) {
      elements.push(<h4 key={i} className="text-sm font-bold mt-3 mb-1 text-[#172B4D]">{parseInline(line.slice(5))}</h4>);
    } else if (line.startsWith('- ')) {
      const leadingSpaces = rawLine.match(/^ */)[0].length;
      const indentLevel = Math.floor(leadingSpaces / 2);

      let indentClass = "pl-1";
      if (indentLevel === 1) indentClass = "pl-6";
      if (indentLevel >= 2) indentClass = "pl-11";

      let bullet = <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#6B778C] mt-[0.6rem]" />;
      if (indentLevel === 1) {
        bullet = <span className="shrink-0 w-1.5 h-1.5 rounded-full border border-[#6B778C] bg-white mt-[0.6rem]" />;
      } else if (indentLevel >= 2) {
        bullet = <span className="shrink-0 w-1.5 h-1.5 bg-[#6B778C] mt-[0.6rem] rounded-sm" />;
      }

      elements.push(
        <div key={i} className={`flex items-start gap-2.5 mb-1 ${indentClass}`}>
          {bullet}
          <span className="text-sm text-[#172B4D] leading-relaxed">{parseInline(line.slice(2))}</span>
        </div>
      );
    } else {
      elements.push(<p key={i} className="text-sm text-[#172B4D] mb-2 leading-relaxed">{parseInline(line)}</p>);
    }
  }
  flushTable();

  return <div className="pb-10">{elements}</div>;
}

function PageHeaderWithSpec({ title, pageKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    if (isOpen && pageKey) {
      try {
        // Eager loading for better reliability in Vercel/Local
        const modules = import.meta.glob("./docs/specs/*.md", { query: "?raw", import: "default", eager: true });
        
        // Robust matching logic
        const foundKey = Object.keys(modules).find((key) => 
          key.toLowerCase().includes(pageKey.toLowerCase())
        );

        if (foundKey) {
          setMarkdown(modules[foundKey]);
        } else {
          console.warn(`[PageHeaderWithSpec] Spec matching failed for key: "${pageKey}"`);
          console.log("Available modules:", Object.keys(modules));
          setMarkdown(`# ${title}\n\n기능 명세 파일이 없습니다.\n\n\`src/docs/specs/${pageKey}.md\` 파일을 생성해주세요.`);
        }
      } catch (error) {
        console.error("Error loading spec:", error);
        setMarkdown("기능 명세를 불러오는 중 오류가 발생했습니다.");
      }
    }
  }, [isOpen, pageKey, title]);

  return (
    <div className="flex items-center gap-3">
      <div className="truncate text-base md:text-lg font-bold text-[#172B4D]">{title}</div>
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs font-normal text-[#6B778C] border-[#DFE1E6] hover:text-[#0052CC] hover:border-[#0052CC]"
        onClick={() => setIsOpen(true)}
      >
        <FileText className="mr-1.5 h-3.5 w-3.5" />
        기능명세 확인
      </Button>

      <Drawer
        open={isOpen}
        title={`${title} 기능 명세`}
        onClose={() => setIsOpen(false)}
        footer={<Button variant="secondary" onClick={() => setIsOpen(false)}>닫기</Button>}
      >
        <div className="text-[#172B4D]">
          <SimpleMarkdownRenderer content={markdown} />
        </div>
      </Drawer>
    </div>
  );
}

function Header({ title, activeKey, onMenuClick }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 md:h-16 items-center gap-4 border-b border-[#E2E8F0] bg-white px-4 md:px-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <Button variant="ghost" size="sm" className="md:hidden -ml-2" onClick={onMenuClick}>
        <Menu className="h-5 w-5 text-[#6B778C]" />
      </Button>
      <div className="min-w-0 flex-1">
        <PageHeaderWithSpec title={title} pageKey={activeKey} />
      </div>

      <div className="flex items-center gap-3 pl-4 border-l border-[#DFE1E6]">
        <div className="flex flex-col items-end hidden md:block">
          <div className="text-sm font-bold leading-tight text-[#172B4D]">Ops Admin</div>
          <div className="text-xs text-[#6B778C] leading-tight">Internal Manager</div>
        </div>
        <div className="h-9 w-9 rounded-full bg-[#DFE1E6] ring-2 ring-white shadow-sm" />
      </div>
    </header>
  );
}

/**
 * Pages
 */

/**
 * 합의 요청 관리
 */
function AgreementsPage() {
  const [items, setItems] = useState([
    { id: "A-1001", orderId: "O-90002", plate: "34나7890", model: "K5", zoneName: "잠실역 2번존", partner: "B파트너명", requestedAt: "2026-01-12 10:30", status: "요청", cost: 15000, reason: "오염도 심각으로 인한 추가 요금", comment: "사진 확인 부탁드립니다.", washItems: ["내부세차", "특수오염제거"] },
    { id: "A-1002", orderId: "O-90005", plate: "90마5566", model: "스포티지", zoneName: "수원역 2번존", partner: "B파트너명", requestedAt: "2026-01-11 14:20", status: "수락", cost: 10000, reason: "카시트 분리 세척", comment: "승인 완료", washItems: ["카시트세척"] },
    { id: "A-1003", orderId: "O-90010", plate: "55차5656", model: "EV6", zoneName: "광주 1번존", partner: "A파트너명", requestedAt: "2026-01-10 09:15", status: "거절", cost: 20000, reason: "광택 작업 요청", comment: "정책상 불가", washItems: ["광택"] },
  ]);

  const [selected, setSelected] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const columns = [
    { key: "orderId", header: "오더 ID" },
    { key: "plate", header: "차량번호" },
    { key: "model", header: "차종" },
    { key: "zoneName", header: "존이름" },
    { key: "partner", header: "파트너명" },
    { key: "requestedAt", header: "요청 시간" },
    {
      key: "status",
      header: "상태",
      render: (r) => {
        const tone = r.status === "요청" ? "warn" : r.status === "수락" ? "ok" : r.status === "거절" ? "danger" : "default";
        return <Badge tone={tone}>{r.status}</Badge>;
      },
    },
  ];

  const handleUpdateStatus = (newStatus, reason = "") => {
    if (!selected) return;
    setItems((prev) =>
      prev.map((it) => (it.id === selected.id ? { ...it, status: newStatus, comment: reason || it.comment } : it))
    );
    setSelected(null);
    setIsRejecting(false);
    setRejectReason("");
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return items;
    return [...items].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">합의 요청 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">현장 추가 요금 및 특수 세차 합의 요청 건 처리</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-[#6B778C]">전체 건수 <b className="text-[#172B4D]">{totalItems.toLocaleString()}</b>건</div>
        <div className="text-xs text-[#6B778C]">현재 페이지 ({currentPage}/{totalPages})</div>
      </div>

      <DataTable columns={columns} rows={currentData} rowKey={(r) => r.id} onRowClick={setSelected} sortConfig={sortConfig} onSort={handleSort} />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <Drawer
        open={!!selected}
        title={selected ? `합의 요청 상세 - ${selected.id}` : ""}
        onClose={() => { setSelected(null); setIsRejecting(false); }}
        footer={
          selected?.status === "요청" ? (
            <>
              <Button variant="secondary" onClick={() => setIsRejecting(true)}>반려</Button>
              <Button onClick={() => handleUpdateStatus("수락")}>승인</Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setSelected(null)}>닫기</Button>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>요청 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[#172B4D]">
                <Field label="오더 ID" value={selected.orderId} />
                <Field label="차량번호" value={`${selected.plate} (${selected.model})`} />
                <Field label="파트너명" value={selected.partner} />
                <Field label="요청 사유" value={selected.reason} />
                <Field label="세차 항목" value={selected.washItems.join(", ")} />
                <div className="flex items-center justify-between gap-3">
                  <div className="w-36 shrink-0 text-xs font-semibold text-[#6B778C]">청구 금액</div>
                  <Input
                    type="number"
                    className="h-8 w-32 text-right"
                    defaultValue={selected.cost}
                    disabled={selected.status !== "요청"}
                  />
                </div>
                <Field label="코멘트" value={selected.comment} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>현장 사진</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-32 w-full items-center justify-center rounded-lg bg-[#F4F5F7] text-[#6B778C]">
                  <span className="text-xs">이미지 미리보기 (Placeholder)</span>
                </div>
              </CardContent>
            </Card>

            {isRejecting && (
              <Card className="ring-rose-200">
                <CardHeader>
                  <CardTitle className="text-rose-700">반려 사유 입력</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="반려 사유를 입력하세요"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsRejecting(false)}>취소</Button>
                    <Button variant="danger" onClick={() => handleUpdateStatus("거절", rejectReason)}>반려 확정</Button>
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

/**
 * 청구 관리
 */
function BillingPage() {
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

/**
 * 분실물 관리
 */
function LostFoundPage() {
  const [items, setItems] = useState([
    { id: "L-1001", orderId: "O-90008", plate: "33아1212", item: "지갑", status: "보관중", foundAt: "2026-01-12", location: "대전역 1번존 보관함" },
    { id: "L-1002", orderId: "O-90002", plate: "34나7890", item: "무선 이어폰", status: "찾는 중", foundAt: "2026-01-11", location: "-" },
  ]);
  const [selected, setSelected] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const columns = [
    { key: "id", header: "분실물 ID" },
    { key: "item", header: "습득물" },
    { key: "plate", header: "차량번호" },
    {
      key: "status",
      header: "상태",
      render: (r) => {
        const tone = r.status === "보관중" ? "ok" : r.status === "찾는 중" ? "warn" : "default";
        return <Badge tone={tone}>{r.status}</Badge>;
      },
    },
    { key: "foundAt", header: "습득일" },
  ];

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return items;
    return [...items].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">분실물 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">세차 중 습득된 분실물 등록 및 처리 현황</div>
        </div>
        <Button onClick={() => setIsRegistering(true)}>
          <Plus className="mr-2 h-4 w-4" /> 분실물 등록
        </Button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-[#6B778C]">전체 건수 <b className="text-[#172B4D]">{totalItems.toLocaleString()}</b>건</div>
        <div className="text-xs text-[#6B778C]">현재 페이지 ({currentPage}/{totalPages})</div>
      </div>

      <DataTable columns={columns} rows={currentData} rowKey={(r) => r.id} onRowClick={setSelected} sortConfig={sortConfig} onSort={handleSort} />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <Drawer
        open={!!selected || isRegistering}
        title={isRegistering ? "분실물 등록" : "분실물 상세"}
        onClose={() => { setSelected(null); setIsRegistering(false); }}
        footer={
          isRegistering ? (
            <Button onClick={() => { alert("등록되었습니다(프로토타입)"); setIsRegistering(false); }}>등록</Button>
          ) : (
            <Button onClick={() => { alert("수정되었습니다(프로토타입)"); setSelected(null); }}>저장</Button>
          )
        }
      >
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">습득물 명</label>
                <Input defaultValue={selected?.item} placeholder="예: 지갑, 차키 등" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">차량번호</label>
                <Input defaultValue={selected?.plate} placeholder="12가3456" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">처리 상태</label>
                <Select defaultValue={selected?.status || "찾는 중"}>
                  <option>찾는 중</option>
                  <option>보관중</option>
                  <option>경찰서 인계</option>
                  <option>택배 발송</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">보관 장소</label>
                <Input defaultValue={selected?.location} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>사진</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 w-full items-center justify-center rounded-lg bg-[#F4F5F7] text-[#6B778C]">
                <span className="text-xs">사진 업로드 / 미리보기</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </Drawer>
    </div>
  );
}

/**
 * 공지 관리 (External CMS)
 */
function NoticesPage() {
  const notices = [
    { id: 1, title: "[필독] 1월 세차 정책 변경 안내", targetPartner: "전체", targetRegion: "전체", createdAt: "2026-01-02", author: "운영팀" },
    { id: 2, title: "설 연휴 기간 운영 가이드", targetPartner: "A파트너명", targetRegion: "서울", createdAt: "2026-01-10", author: "운영팀" },
    { id: 3, title: "시스템 점검 안내", targetPartner: "전체", targetRegion: "전체", createdAt: "2026-01-12", author: "개발팀" },
  ];

  const [filter, setFilter] = useState("전체");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const filtered = notices.filter((n) => filter === "전체" || n.targetPartner === filter);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">공지 관리 (CMS 연동)</div>
          <div className="mt-1 text-sm text-[#6B778C]">외부 CMS 게시글 조회 (Read-only)</div>
        </div>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#172B4D]">파트너명</span>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="!w-40">
              <option value="전체">전체</option>
              <option value="A파트너명">A파트너명</option>
              <option value="B파트너명">B파트너명</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-[#6B778C]">전체 건수 <b className="text-[#172B4D]">{totalItems.toLocaleString()}</b>건</div>
        <div className="text-xs text-[#6B778C]">현재 페이지 ({currentPage}/{totalPages})</div>
      </div>

      <DataTable
        columns={[
          { key: "id", header: "No" },
          { key: "title", header: "제목", render: (r) => <span className="font-medium text-[#172B4D]">{r.title}</span> },
          { key: "targetPartner", header: "파트너명" },
          { key: "targetRegion", header: "대상 지역" },
          { key: "author", header: "작성자" },
          { key: "createdAt", header: "작성일" },
        ]}
        rows={currentData}
        rowKey={(r) => r.id}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

function UpdateHistoryPage() {
  const [activeTab, setActiveTab] = useState("brown");
  const [showPolicyOnly, setShowPolicyOnly] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const historyData = activeTab === "brown" ? BROWN_HISTORY : ASTI_HISTORY;
  
  const filteredHistory = useMemo(() => {
    let data = [...historyData].sort((a, b) => b.id - a.id);
    if (showPolicyOnly) {
      data = data.filter((item) => item.isPolicyChange);
    }
    return data;
  }, [historyData, showPolicyOnly]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredHistory;
    return [...filteredHistory].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredHistory, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">업데이트 이력 (협업 모드)</div>
          <div className="mt-1 text-sm text-[#6B778C]">브라운/아스티 작업 내역 이원화 관리</div>
        </div>
      </div>

      <Tabs value={activeTab}>
        <TabsList>
          <TabsTrigger value="brown" currentValue={activeTab} onClick={setActiveTab}>브라운 (Brown)</TabsTrigger>
          <TabsTrigger value="asti" currentValue={activeTab} onClick={setActiveTab}>아스티 (Asti)</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2 py-2">
        <input 
          type="checkbox" 
          id="policyFilter" 
          className="h-4 w-4 rounded border-gray-300 text-[#0052CC] focus:ring-[#0052CC]"
          checked={showPolicyOnly}
          onChange={(e) => setShowPolicyOnly(e.target.checked)}
        />
        <label htmlFor="policyFilter" className="text-sm text-[#172B4D] cursor-pointer select-none">
          제품 정책 변경 건만 보기
        </label>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-[#6B778C]">전체 건수 <b className="text-[#172B4D]">{totalItems.toLocaleString()}</b>건</div>
        <div className="text-xs text-[#6B778C]">현재 페이지 ({currentPage}/{totalPages})</div>
      </div>

      <Card>
        <DataTable
          columns={[
            { key: "id", header: "ID" },
            { key: "date", header: "일시", render: (r) => <span className="font-medium text-[#172B4D]">{r.date}</span> },
            { key: "content", header: "변경내용" },
            {
              key: "isPolicyChange",
              header: "제품 정책 변경",
              render: (r) => r.isPolicyChange ? <span className="font-bold text-[#0052CC]">해당</span> : null
            },
            {
              key: "links",
              header: "링크",
              render: (r) => (
                <div className="flex gap-2">
                  {r.links && r.links.map((link, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-[#0052CC]"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/?page=${link.page}`, "_blank");
                      }}
                    >
                      {link.label} <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  ))}
                </div>
              ),
            },
          ]}
          rows={currentData}
          rowKey={(r) => r.id}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>
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

function PlaceholderPage({ title, description, right }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">{title}</div>
          <div className="mt-1 text-sm text-[#6B778C]">{description}</div>
        </div>
        {right}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>프로토타입 안내</CardTitle>
          <CardDescription>리스트, 그리드, Drawer는 차량/오더 화면에 먼저 적용했습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-[#172B4D]">
            <li>정책 관리: 리스트에서 다중 선택 또는 필터된 데이터 일괄 수정, Drawer 기반 편집</li>
            <li>권한: 역할별 RBAC 전제, 화면/액션 단위 가드레일 정의 필요</li>
            <li>감사로그: 삭제/수정/발행 등 주요 액션은 사유와 함께 기록 필요</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
