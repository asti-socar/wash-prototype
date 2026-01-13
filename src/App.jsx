import React, { useMemo, useState, useEffect } from "react";
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
  Bell,
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
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

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

/**
 * shadcn-ish minimal UI (Tailwind only)
 */
function Card({ className, children }) {
  return (
    <div className={cn("rounded-lg bg-white border border-[#DFE1E6] shadow-sm", className)}>
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
    "inline-flex items-center justify-center rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-[#0052CC] text-white hover:bg-[#0047B3] shadow-sm",
    secondary: "bg-white text-[#172B4D] border border-[#DFE1E6] hover:bg-[#F4F5F7] shadow-sm",
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
        "h-10 w-full rounded-lg border border-[#DFE1E6] bg-white px-3 text-sm text-[#172B4D] outline-none transition",
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
        "h-10 w-full rounded-lg border border-[#DFE1E6] bg-white px-3 text-sm text-[#172B4D] outline-none transition",
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
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="absolute right-0 top-0 h-full bg-white shadow-2xl flex flex-col"
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
          <Button variant="ghost" className="h-9 w-9 rounded-lg p-0" onClick={onClose}>
            <X className="h-5 w-5 text-[#6B778C]" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        <div className="flex h-[72px] items-center justify-end gap-2 border-t border-[#DFE1E6] px-6 bg-[#F4F5F7] shrink-0">
          {footer}
        </div>
      </div>
    </div>
  );
}

/**
 * Table (simple)
 */
function DataTable({ columns, rows, onRowClick, rowKey }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#DFE1E6]">
      <table className="min-w-full bg-white text-left text-sm">
        <thead className="bg-[#F4F5F7]">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="whitespace-nowrap px-4 py-3 text-xs font-bold text-[#172B4D]">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DFE1E6]">
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
                  onRowClick ? "cursor-pointer hover:bg-[#E6F0FF]" : ""
                )}
                onClick={() => onRowClick?.(r)}
              >
                {columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-4 py-3 text-sm text-[#172B4D]">
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
const WASH_TYPES = ["내외부", "특수", "라이트", "내부", "외부", "물세차", "협의"];

/**
 * Navigation model (IA)
 */
const NAV = [
  {
    group: "관제",
    items: [{ key: "dashboard", label: "대시보드(HOME)", icon: LayoutDashboard }],
  },
  {
    group: "오더 정책 관리",
    items: [
      { key: "ai-policy", label: "AI 모델 정책 관리", icon: Settings },
      { key: "zone-policy", label: "존 정책 관리", icon: MapPinned },
      { key: "region-policy", label: "지역 정책 관리", icon: MapPinned },
    ],
  },
  {
    group: "업무 관리",
    items: [
      { key: "vehicles", label: "차량 관리", icon: Car },
      { key: "orders", label: "오더 관리", icon: ClipboardList },
      { key: "settlement", label: "합의 요청 관리", icon: Handshake },
      { key: "billing", label: "청구 관리", icon: Receipt },
      { key: "lostfound", label: "분실물 관리", icon: PackageSearch },
      { key: "notices", label: "공지 관리(CMS)", icon: Megaphone },
    ],
  },
  {
    group: "정보 관리",
    items: [
      { key: "partners", label: "파트너 관리", icon: Building2 },
      { key: "partner-managers", label: "파트너 담당자 조회", icon: Users },
      { key: "workers", label: "수행원 조회", icon: UserCog },
    ],
  },
];

const PAGE_TITLES = {
  dashboard: "관제 대시보드",
  "ai-policy": "AI 모델 정책 관리",
  "zone-policy": "존 정책 관리",
  "region-policy": "지역 정책 관리",
  vehicles: "차량 관리",
  orders: "오더 관리",
  settlement: "합의 요청 관리",
  billing: "청구 관리",
  lostfound: "분실물 관리",
  notices: "공지 관리(CMS)",
  partners: "파트너 관리",
  "partner-managers": "파트너 담당자 조회",
  workers: "수행원 조회",
};

/**
 * App
 */
export default function App() {
  const [activeKey, setActiveKey] = useState("dashboard");

  // 대시보드 KPI 카드 클릭 시 "오더 관리"로 이동하면서 필터를 “적용한 것처럼” 표시하는 상태
  const [orderQuickFilter, setOrderQuickFilter] = useState(null); // { status: '예약' | ... }

  const pageTitle = PAGE_TITLES[activeKey] ?? "Admin";

  const goOrdersWithStatus = (status) => {
    setOrderQuickFilter({ status });
    setActiveKey("orders");
  };

  const onNavSelect = (key) => {
    setActiveKey(key);
    // 차량/오더에서 다른 화면으로 이동해도 quickFilter는 유지(프로토타입). 필요 시 여기서 clear 정책 정의 가능.
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#172B4D]">
      <div className="flex">
        <Sidebar activeKey={activeKey} onSelect={onNavSelect} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header title={pageTitle} activeKey={activeKey} />

          <main className="min-w-0 flex-1 p-6 md:p-8">
            {activeKey === "dashboard" && <Dashboard onClickKpi={goOrdersWithStatus} />}

            {activeKey === "vehicles" && <VehiclesPage />}

            {activeKey === "orders" && (
              <OrdersPage
                quickStatus={orderQuickFilter?.status ?? null}
                onClearQuickStatus={() => setOrderQuickFilter(null)}
              />
            )}

            {activeKey === "settlement" && <AgreementsPage />}
            {activeKey === "billing" && <BillingPage />}
            {activeKey === "lostfound" && <LostFoundPage />}
            {activeKey === "notices" && <NoticesPage />}

            {activeKey !== "dashboard" &&
              activeKey !== "vehicles" &&
              activeKey !== "orders" &&
              activeKey !== "settlement" &&
              activeKey !== "billing" &&
              activeKey !== "lostfound" &&
              activeKey !== "notices" && (
                <PlaceholderPage
                  title={pageTitle}
                  description="MVP 범위에서는 리스트 조회, 상단 검색/필터, 우측 Drawer 기반 상세 및 정책 수정 흐름으로 정리하는 것이 효율적입니다."
                />
              )}
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * Layout components
 */
function Sidebar({ activeKey, onSelect }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-[#091E42] text-white md:block">
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0052CC] text-white shadow-sm">
          <span className="text-sm font-bold">W</span>
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-white">세차 어드민</div>
          <div className="truncate text-xs text-[#B3BAC5]">Ops Console Prototype</div>
        </div>
      </div>

      <nav className="h-[calc(100vh-64px)] overflow-y-auto px-2 pb-4">
        {NAV.map((g) => (
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
        ))}
      </nav>
    </aside>
  );
}

function SidebarItem({ active, icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all font-medium",
        active ? "bg-[#0052CC] text-white shadow-md" : "text-[#B3BAC5] hover:bg-[#0052CC] hover:text-white hover:shadow-md"
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
      <div className="truncate text-lg font-bold text-[#172B4D]">{title}</div>
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

function Header({ title, activeKey }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[#DFE1E6] bg-white px-6 md:px-8 shadow-sm">
      <div className="min-w-0 flex-1">
        <PageHeaderWithSpec title={title} pageKey={activeKey} />
      </div>

      <Button variant="ghost" className="h-10 w-10 rounded-full p-0 hover:bg-[#F4F5F7]">
        <Bell className="h-5 w-5 text-[#6B778C]" />
      </Button>

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
function Dashboard({ onClickKpi }) {
  // Mock Data for Charts
  const dailyData = [
    { day: "월", orders: 320 },
    { day: "화", orders: 350 },
    { day: "수", orders: 300 },
    { day: "목", orders: 380 },
    { day: "금", orders: 420 },
    { day: "토", orders: 450 },
    { day: "일", orders: 400 },
  ];

  const partnerData = [
    { name: "A협력사", rate: 95 },
    { name: "B협력사", rate: 88 },
    { name: "C협력사", rate: 92 },
    { name: "D협력사", rate: 85 },
  ];

  const hourlyData = [
    { time: "00", value: 10 }, { time: "04", value: 5 },
    { time: "08", value: 20 }, { time: "12", value: 50 },
    { time: "16", value: 40 }, { time: "20", value: 80 },
    { time: "24", value: 30 },
  ];

  const issueData = [
    { name: "완료", value: 85 },
    { name: "미처리", value: 15 },
  ];
  const COLORS = ["#0052CC", "#DFE1E6"];

  // KPI Data
  const performanceFlow = [
    { label: "발행", value: 248, color: "text-[#172B4D]" },
    { label: "예약 완료", value: 164, color: "text-[#0052CC]" },
    { label: "수행 완료", value: 58, color: "text-[#0052CC]" },
    { label: "취소", value: 5, color: "text-rose-600" },
  ];

  const emergencyMetrics = [
    { label: "위생 장애 인입", value: "12건" },
    { label: "긴급 오더 발행", value: "12건" },
    { label: "적시 수행", value: "10건" },
    { label: "평균 리드타임", value: "45분" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Car Wash Performance Status */}
        <Card>
          <CardHeader>
            <CardTitle>세차 수행 현황 (Today)</CardTitle>
            <CardDescription>실시간 오더 라이프사이클</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {performanceFlow.map((item, idx) => (
                <React.Fragment key={item.label}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-[#6B778C]">{item.label}</span>
                    <span className={cn("text-2xl font-bold", item.color)}>{item.value}</span>
                  </div>
                  {idx < performanceFlow.length - 1 && (
                    <div className="h-px w-8 bg-[#DFE1E6] md:w-16" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Wash Status */}
        <Card>
          <CardHeader>
            <CardTitle>긴급 세차 처리 현황 (최근 1주일)</CardTitle>
            <CardDescription>위생 이슈 대응 지표</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              {emergencyMetrics.map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[#6B778C]">{item.label}</span>
                  <span className="text-xl font-bold text-[#172B4D]">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-[#172B4D]">요약 그래프</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Daily Orders */}
          <Card>
            <CardHeader><CardTitle>일자별 오더</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE1E6" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <Tooltip cursor={{ fill: "#F4F5F7" }} />
                  <Bar dataKey="orders" fill="#0052CC" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Partner Performance */}
          <Card>
            <CardHeader><CardTitle>파트너별 수행률</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={partnerData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#DFE1E6" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <Tooltip cursor={{ fill: "#F4F5F7" }} />
                  <Bar dataKey="rate" fill="#0052CC" radius={[0, 4, 4, 0]} barSize={20} label={{ position: "right", fill: "#172B4D", fontSize: 12 }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hourly Concentration */}
          <Card>
            <CardHeader><CardTitle>시간대별 세차 집중도</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0052CC" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0052CC" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE1E6" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#0052CC" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Issue Resolution Rate */}
          <Card>
            <CardHeader><CardTitle>장애 처리율</CardTitle></CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {issueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-[#172B4D]">
                    85%
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, hint, onClick }) {
  return (
    <button onClick={onClick} className="text-left">
      <Card className="transition hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <span className="text-[11px] text-[#6B778C] font-normal">바로가기</span>
          </CardTitle>
          <CardDescription>{hint}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-[#172B4D]">{value}</div>
        </CardContent>
      </Card>
    </button>
  );
}

/**
 * 차량 관리 (리스트 + 필터 + Drawer)
 */
function VehiclesPage() {
  const data = useMemo(() => {
    // 12건 더미 데이터
    // activeOrderId가 있으면 현재 진행중인 오더가 있다는 의미
    return [
      { plate: "12가3456", zoneName: "강남역 1번존", zoneId: "Z-1001", region1: "서울", region2: "강남", partner: "A협력사", activeOrderId: "O-90001", lastWash: "2026-01-10", model: "아반떼 AD", fuel: "가솔린" },
      { plate: "34나7890", zoneName: "잠실역 2번존", zoneId: "Z-1002", region1: "서울", region2: "송파", partner: "B협력사", activeOrderId: null, lastWash: "2026-01-08", model: "K5", fuel: "가솔린" },
      { plate: "56다1122", zoneName: "홍대입구 3번존", zoneId: "Z-1003", region1: "서울", region2: "마포", partner: "A협력사", activeOrderId: "O-90003", lastWash: "2026-01-05", model: "쏘나타", fuel: "하이브리드" },
      { plate: "78라3344", zoneName: "판교 1번존", zoneId: "Z-2001", region1: "경기", region2: "성남", partner: "C협력사", activeOrderId: "O-90004", lastWash: "2026-01-09", model: "아이오닉5", fuel: "EV" },
      { plate: "90마5566", zoneName: "수원역 2번존", zoneId: "Z-2002", region1: "경기", region2: "수원", partner: "B협력사", activeOrderId: null, lastWash: "2026-01-07", model: "스포티지", fuel: "디젤" },
      { plate: "11바7788", zoneName: "부산역 1번존", zoneId: "Z-3001", region1: "부산", region2: "동구", partner: "D협력사", activeOrderId: "O-90006", lastWash: "2026-01-03", model: "그랜저", fuel: "가솔린" },
      { plate: "22사9900", zoneName: "해운대 2번존", zoneId: "Z-3002", region1: "부산", region2: "해운대", partner: "D협력사", activeOrderId: "O-90007", lastWash: "2026-01-11", model: "레이", fuel: "가솔린" },
      { plate: "33아1212", zoneName: "대전역 1번존", zoneId: "Z-4001", region1: "대전", region2: "동구", partner: "C협력사", activeOrderId: null, lastWash: "2026-01-06", model: "카니발", fuel: "디젤" },
      { plate: "44자3434", zoneName: "청주 2번존", zoneId: "Z-5002", region1: "충북", region2: "청주", partner: "B협력사", activeOrderId: "O-90009", lastWash: "2026-01-02", model: "모닝", fuel: "가솔린" },
      { plate: "55차5656", zoneName: "광주 1번존", zoneId: "Z-6001", region1: "광주", region2: "서구", partner: "A협력사", activeOrderId: "O-90010", lastWash: "2026-01-09", model: "EV6", fuel: "EV" },
      { plate: "66카7878", zoneName: "인천공항 1번존", zoneId: "Z-7001", region1: "인천", region2: "중구", partner: "C협력사", activeOrderId: null, lastWash: "2026-01-08", model: "티볼리", fuel: "가솔린" },
      { plate: "77타9090", zoneName: "제주공항 1번존", zoneId: "Z-8001", region1: "제주", region2: "제주시", partner: "D협력사", activeOrderId: "O-90012", lastWash: "2026-01-01", model: "셀토스", fuel: "가솔린" },
    ];
  }, []);

  const [q, setQ] = useState("");
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
      const hitQ =
        !qq ||
        d.plate.toLowerCase().includes(qq) ||
        d.zoneName.toLowerCase().includes(qq) ||
        d.zoneId.toLowerCase().includes(qq);

      const hitR1 = !fRegion1 || d.region1 === fRegion1;
      const hitR2 = !fRegion2 || d.region2 === fRegion2;
      const hitP = !fPartner || d.partner === fPartner;

      return hitQ && hitR1 && hitR2 && hitP;
    });
  }, [data, q, fRegion1, fRegion2, fPartner]);

  const columns = [
    { key: "plate", header: "차량번호" },
    { key: "zoneName", header: "존이름" },
    { key: "zoneId", header: "존 ID" },
    { key: "region1", header: "지역1" },
    { key: "region2", header: "지역2" },
    { key: "partner", header: "협력사" },
    {
      key: "activeOrderId",
      header: "진행중 오더",
      render: (r) => r.activeOrderId ? (
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-[#0052CC]">
          {r.activeOrderId} <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
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
          <div className="mt-1 text-sm text-[#6B778C]">수행률 낮은 차량, 존별 현황 모니터링(프로토타입)</div>
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
          <CardDescription>검색: 차량번호, 존이름, 존 ID / 필터: 지역1, 지역2, 협력사</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="차량번호/존이름/존ID 검색" className="pl-9" />
              </div>
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
              <Select value={fPartner} onChange={(e) => setFPartner(e.target.value)}>
                <option value="">협력사 전체</option>
                {partners.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>

            <div className="md:col-span-12 flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap gap-2">
                {q ? <Chip onRemove={() => setQ("")}>검색: {q}</Chip> : null}
                {fRegion1 ? <Chip onRemove={() => { setFRegion1(""); setFRegion2(""); }}>지역1: {fRegion1}</Chip> : null}
                {fRegion2 ? <Chip onRemove={() => setFRegion2("")}>지역2: {fRegion2}</Chip> : null}
                {fPartner ? <Chip onRemove={() => setFPartner("")}>협력사: {fPartner}</Chip> : null}
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

      <div className="flex items-center justify-between">
        <div className="text-sm text-[#6B778C]">검색 결과: <b className="text-[#172B4D]">{filtered.length}</b>건</div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => `${r.zoneId}-${r.plate}`}
        onRowClick={(r) => setSelected(r)}
      />

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
                <CardDescription>리스트 필드 + 차종, 연료유형(프로토타입)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[#172B4D]">
                <Field label="차량번호" value={selected.plate} />
                <Field label="차종" value={selected.model} />
                <Field label="연료유형" value={selected.fuel} />
                <Field label="존" value={`${selected.zoneName} (${selected.zoneId})`} />
                <Field label="지역" value={`${selected.region1} / ${selected.region2}`} />
                <Field label="협력사" value={selected.partner} />
                <Field label="진행중 오더" value={selected.activeOrderId || "없음"} />
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
                  <li>2026-01-10, 라이트 세차, 완료</li>
                  <li>2025-12-28, 주기 세차, 완료</li>
                  <li>2025-12-15, 라이트 세차, 완료</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

/**
 * 오더 관리 (리스트 + 필터 + Drawer + Quick Filter)
 */
function OrdersPage({ quickStatus, onClearQuickStatus }) {
  const today = new Date();

  // 미션 관리 상태 (Car ID 대신 편의상 plate를 키로 사용)
  const [missions, setMissions] = useState([
    { id: "M-1001", plate: "12가3456", content: "스티커 부착", status: "pending" },
    { id: "M-1002", plate: "34나7890", content: "내부 청소 집중", status: "completed" },
  ]);

  // 오더 데이터 상태 관리
  const [orders, setOrders] = useState(() => [
      { orderId: "O-90001", washType: "내부", orderGroup: "정규", orderType: "주기세차", carId: "C-1001", model: "아반떼 AD", plate: "12가3456", zone: "강남역 1번존", zoneId: "Z-1001", region1: "서울", region2: "강남", partner: "A협력사", partnerType: "현장", status: "예약", elapsedDays: 2, worker: "수행원 김00", comment: "오염도 3, 내부 우선" , createdAt: toYmd(today)},
      { orderId: "O-90002", washType: "내외부", orderGroup: "수시", orderType: "수시세차", carId: "C-1002", model: "K5", plate: "34나7890", zone: "잠실역 2번존", zoneId: "Z-1002", region1: "서울", region2: "송파", partner: "B협력사", partnerType: "현장", status: "완료", elapsedDays: 4, worker: "수행원 이00", comment: "합의건, 추가요금 협의" , createdAt: toYmd(today)},
      { orderId: "O-90003", washType: "외부", orderGroup: "정규", orderType: "주기세차", carId: "C-1003", model: "쏘나타", plate: "56다1122", zone: "홍대입구 3번존", zoneId: "Z-1003", region1: "서울", region2: "마포", partner: "A협력사", partnerType: "현장", status: "미배정", elapsedDays: 7, worker: "-", comment: "미배정 상태, 수행원 부족" , createdAt: toYmd(today)},
      { orderId: "O-90004", washType: "내부", orderGroup: "특별", orderType: "특수세차", carId: "C-2001", model: "아이오닉5", plate: "78라3344", zone: "판교 1번존", zoneId: "Z-2001", region1: "경기", region2: "성남", partner: "C협력사", partnerType: "입고", status: "입고 중", elapsedDays: 3, worker: "수행원 박00", comment: "EV, 실내 매트 확인" , createdAt: toYmd(today)},
      { orderId: "O-90005", washType: "내외부", orderGroup: "정규", orderType: "주기세차", carId: "C-2002", model: "스포티지", plate: "90마5566", zone: "수원역 2번존", zoneId: "Z-2002", region1: "경기", region2: "수원", partner: "B협력사", partnerType: "현장", status: "완료", elapsedDays: 5, worker: "수행원 최00", comment: "점검 체크리스트 완료" , createdAt: toYmd(today)},
      { orderId: "O-90006", washType: "외부", orderGroup: "정규", orderType: "주기세차", carId: "C-3001", model: "그랜저", plate: "11바7788", zone: "부산역 1번존", zoneId: "Z-3001", region1: "부산", region2: "동구", partner: "D협력사", partnerType: "현장", status: "미배정", elapsedDays: 9, worker: "-", comment: "장기 미배정 리스크" , createdAt: toYmd(today)},
      { orderId: "O-90007", washType: "내부", orderGroup: "수시", orderType: "수시세차", carId: "C-3002", model: "레이", plate: "22사9900", zone: "해운대 2번존", zoneId: "Z-3002", region1: "부산", region2: "해운대", partner: "D협력사", partnerType: "현장", status: "예약", elapsedDays: 1, worker: "수행원 정00", comment: "오염도 2" , createdAt: toYmd(today)},
      { orderId: "O-90008", washType: "내외부", orderGroup: "정규", orderType: "주기세차", carId: "C-4001", model: "카니발", plate: "33아1212", zone: "대전역 1번존", zoneId: "Z-4001", region1: "대전", region2: "동구", partner: "C협력사", partnerType: "입고", status: "출고 중", elapsedDays: 6, worker: "수행원 한00", comment: "분실물 없음" , createdAt: toYmd(today)},
      { orderId: "O-90009", washType: "외부", orderGroup: "정규", orderType: "주기세차", carId: "C-5002", model: "모닝", plate: "44자3434", zone: "청주 2번존", zoneId: "Z-5002", region1: "충북", region2: "청주", partner: "B협력사", partnerType: "현장", status: "미배정", elapsedDays: 10, worker: "-", comment: "존 인력 수급 이슈" , createdAt: toYmd(today)},
      { orderId: "O-90010", washType: "내부", orderGroup: "긴급", orderType: "위생장애", carId: "C-6001", model: "EV6", plate: "55차5656", zone: "광주 1번존", zoneId: "Z-6001", region1: "광주", region2: "서구", partner: "A협력사", partnerType: "현장", status: "예약", elapsedDays: 3, worker: "수행원 오00", comment: "내부 먼지 제거 요청" , createdAt: toYmd(today)},
      { orderId: "O-90011", washType: "내외부", orderGroup: "정규", orderType: "주기세차", carId: "C-7001", model: "티볼리", plate: "66카7878", zone: "인천공항 1번존", zoneId: "Z-7001", region1: "인천", region2: "중구", partner: "C협력사", partnerType: "입고", status: "완료", elapsedDays: 4, worker: "수행원 유00", comment: "사진 업로드 완료" , createdAt: toYmd(today)},
      { orderId: "O-90012", washType: "외부", orderGroup: "정규", orderType: "주기세차", carId: "C-8001", model: "셀토스", plate: "77타9090", zone: "제주공항 1번존", zoneId: "Z-8001", region1: "제주", region2: "제주시", partner: "D협력사", partnerType: "현장", status: "미배정", elapsedDays: 11, worker: "-", comment: "장기 미배정, 알림 필요" , createdAt: toYmd(today)},
    ]);

  const [q, setQ] = useState("");
  const [periodFrom, setPeriodFrom] = useState(toYmd(new Date(today.getTime() - 7 * 86400000)));
  const [periodTo, setPeriodTo] = useState(toYmd(today));
  const [fRegion1, setFRegion1] = useState("");
  const [fRegion2, setFRegion2] = useState("");
  const [fOrderGroup, setFOrderGroup] = useState("");
  const [fOrderType, setFOrderType] = useState("");
  const [fWashType, setFWashType] = useState("");
  const [fPartner, setFPartner] = useState("");
  const [fStatus, setFStatus] = useState(quickStatus && quickStatus !== "전체" ? quickStatus : "");

  const [selected, setSelected] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [drawerTab, setDrawerTab] = useState("info");
  const [previewImage, setPreviewImage] = useState(null);
  
  // 신규 기능용 상태
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMissionOpen, setIsMissionOpen] = useState(false);
  
  // 오더 발행 폼 상태
  const [newOrderForm, setNewOrderForm] = useState({ plate: "", zone: "", washType: "외부", model: "" });
  // 미션 등록 폼 상태
  const [newMissionForm, setNewMissionForm] = useState({ plate: "", content: "" });

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
    if (!newOrderForm.plate || !newOrderForm.zone) return alert("차량번호와 존 정보는 필수입니다.");

    // 해당 차량의 Pending 미션 조회
    const pendingMissions = missions.filter(m => m.plate === newOrderForm.plate && m.status === "pending");

    const newOrder = {
      orderId: `O-${Date.now()}`,
      washType: newOrderForm.washType,
      orderGroup: "수시",
      orderType: "수시세차",
      carId: `C-${Math.floor(Math.random() * 10000)}`,
      model: newOrderForm.model || "미상",
      plate: newOrderForm.plate,
      zone: newOrderForm.zone,
      zoneId: "Z-Temp",
      region1: "서울", // 더미
      region2: "기타", // 더미
      partner: "A협력사", // 더미
      partnerType: "현장", // 기본값
      status: "예약",
      elapsedDays: 0,
      worker: "-",
      comment: "수동 발행 오더",
      createdAt: toYmd(new Date()),
      attachedMissions: pendingMissions, // 미션 스냅샷 포함
    };

    setOrders([newOrder, ...orders]);
    setIsCreateOpen(false);
    setNewOrderForm({ plate: "", zone: "", washType: "외부", model: "" });
    alert(`오더가 발행되었습니다. (포함된 미션: ${pendingMissions.length}건)`);
  };

  // 미션 등록 핸들러
  const handleRegisterMission = () => {
    if (!newMissionForm.plate || !newMissionForm.content) return alert("차량번호와 미션 내용은 필수입니다.");
    const newMission = {
      id: `M-${Date.now()}`,
      plate: newMissionForm.plate,
      content: newMissionForm.content,
      status: "pending",
    };
    setMissions([...missions, newMission]);
    setNewMissionForm({ plate: "", content: "" });
    alert("미션이 등록되었습니다.");
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return orders.filter((d) => {
      const hitQ =
        !qq ||
        d.plate.toLowerCase().includes(qq) ||
        d.orderId.toLowerCase().includes(qq) ||
        d.zoneId.toLowerCase().includes(qq) ||
        d.zone.toLowerCase().includes(qq) ||
        d.worker.toLowerCase().includes(qq) ||
        d.comment.toLowerCase().includes(qq);

      const hitPeriod = (!periodFrom || d.createdAt >= periodFrom) && (!periodTo || d.createdAt <= periodTo);
      const hitR1 = !fRegion1 || d.region1 === fRegion1;
      const hitR2 = !fRegion2 || d.region2 === fRegion2;
      const hitOG = !fOrderGroup || d.orderGroup === fOrderGroup;
      const hitOT = !fOrderType || d.orderType === fOrderType;
      const hitWT = !fWashType || d.washType === fWashType;
      const hitP = !fPartner || d.partner === fPartner;
      const hitS = !fStatus || d.status === fStatus;

      return hitQ && hitPeriod && hitR1 && hitR2 && hitOG && hitOT && hitWT && hitP && hitS;
    });
  }, [orders, q, periodFrom, periodTo, fRegion1, fRegion2, fOrderGroup, fOrderType, fWashType, fPartner, fStatus]);

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
    {
      key: "washType",
      header: "세차타입",
      render: (r) => <span className="text-[#172B4D]">{r.washType}</span>,
    },
    { key: "orderGroup", header: "오더구분" },
    { key: "orderType", header: "오더유형" },
    { key: "carId", header: "Car ID" },
    { key: "model", header: "차종" },
    { key: "plate", header: "차번호" },
    { key: "zone", header: "존" },
    { key: "elapsedDays", header: "세차경과일" },
    { key: "partner", header: "협력사명" },
    { key: "partnerType", header: "파트너유형" },
    {
      key: "status",
      header: "진행상태",
      render: (r) => <Badge tone={getStatusBadgeTone(r.status)}>{r.status}</Badge>,
    },
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
      {fWashType ? <Chip onRemove={() => setFWashType("")}>세차타입: {fWashType}</Chip> : null}
      {fPartner ? <Chip onRemove={() => setFPartner("")}>협력사: {fPartner}</Chip> : null}
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
          <Button onClick={() => setIsMissionOpen(true)} variant="outline">
            <ClipboardList className="mr-2 h-4 w-4" /> 미션 등록
          </Button>
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
            검색: 차량번호, 오더ID, 존ID, 존이름, 수행원, 코멘트 요약 / 필터: 기간, 지역1/2, 오더구분/유형, 세차타입, 협력사명, 진행상태
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="검색(차량번호/오더ID/존/수행원/코멘트)" className="pl-9" />
              </div>
            </div>

            <div className="md:col-span-2">
              <Input type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
            </div>
            <div className="md:col-span-2">
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
                <option value="">세차타입 전체</option>
                {washTypes.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={fPartner} onChange={(e) => setFPartner(e.target.value)}>
                <option value="">협력사 전체</option>
                {partners.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={fStatus} onChange={(e) => { setFStatus(e.target.value); onClearQuickStatus(); }}>
                <option value="">진행상태 전체</option>
                {statuses.map((v) => <option key={v} value={v}>{v}</option>)}
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

      <div className="flex items-center justify-between">
        <div className="text-sm text-[#6B778C]">검색 결과: <b className="text-[#172B4D]">{filtered.length}</b>건</div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.orderId}
        onRowClick={(r) => setSelected(r)}
      />

      {/* 오더 상세 Drawer */}
      <Drawer
        open={!!selected}
        title={selected ? `오더 상세 - ${selected.orderId}` : "오더 상세"}
        onClose={() => { setSelected(null); setDeleteModalOpen(false); setDeleteReason(""); setDrawerTab("info"); }}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>닫기</Button>
            {selected?.status !== "완료" && drawerTab === "info" && (
              <Button
                onClick={() => {
                  // 오더 완료 처리 로직
                  const updatedOrders = orders.map(o => o.orderId === selected.orderId ? { ...o, status: "완료" } : o);
                  setOrders(updatedOrders);
                  
                  // 미션 완료 처리 로직 (Global State Update)
                  if (selected.attachedMissions?.length > 0) {
                    const missionIds = selected.attachedMissions.map(m => m.id);
                    setMissions(prev => prev.map(m => missionIds.includes(m.id) ? { ...m, status: "completed" } : m));
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
                    <div className="text-xs text-[#6B778C]">차량 정보</div>
                    <div className="font-medium">{selected.plate} ({selected.model})</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">쏘카존</div>
                    <div className="font-medium">{selected.zone}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">오더 유형</div>
                    <div>{selected.orderType}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">세차 타입</div>
                    <div>{selected.washType}</div>
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
                  <div className="flex items-center justify-between border-t border-[#DFE1E6] pt-3">
                    <span className="text-sm text-[#6B778C]">연계 오더 (Parent)</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-[#0052CC]">
                      O-89999 <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
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
        onClose={() => setIsCreateOpen(false)}
        footer={
          <Button onClick={handleCreateOrder} className="w-full">발행하기</Button>
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
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">차종</label>
                <Input value={newOrderForm.model} onChange={e => setNewOrderForm({...newOrderForm, model: e.target.value})} placeholder="예: 아반떼" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">존 이름 *</label>
                <Input value={newOrderForm.zone} onChange={e => setNewOrderForm({...newOrderForm, zone: e.target.value})} placeholder="예: 강남역 1번존" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">세차 타입</label>
                <Select value={newOrderForm.washType} onChange={e => setNewOrderForm({...newOrderForm, washType: e.target.value})}>
                  <option value="외부">외부</option>
                  <option value="내부">내부</option>
                  <option value="내외부">내외부</option>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </Drawer>

      {/* 미션 등록 Drawer */}
      <Drawer
        open={isMissionOpen}
        title="미션 관리"
        onClose={() => setIsMissionOpen(false)}
        footer={
          <Button onClick={handleRegisterMission} className="w-full">미션 등록</Button>
        }
      >
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>신규 미션 등록</CardTitle>
              <CardDescription>등록된 미션은 다음 오더 생성 시 1회 자동 반영됩니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">대상 차량번호 *</label>
                <Input value={newMissionForm.plate} onChange={e => setNewMissionForm({...newMissionForm, plate: e.target.value})} placeholder="예: 12가3456" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">미션 내용 *</label>
                <Input value={newMissionForm.content} onChange={e => setNewMissionForm({...newMissionForm, content: e.target.value})} placeholder="예: 스티커 부착, 내부 집중 청소" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>전체 미션 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {missions.map(m => (
                  <li key={m.id} className="flex justify-between border-b border-[#DFE1E6] pb-2 last:border-0">
                    <div>
                      <div className="font-medium text-[#172B4D]">{m.plate}</div>
                      <div className="text-[#6B778C]">{m.content}</div>
                    </div>
                    <Badge tone={m.status === 'pending' ? 'warn' : 'ok'}>{m.status}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </Drawer>
    </div>
  );
}

/**
 * 합의 요청 관리
 */
function AgreementsPage() {
  const [items, setItems] = useState([
    { id: "A-1001", orderId: "O-90002", plate: "34나7890", model: "K5", zoneName: "잠실역 2번존", partner: "B협력사", requestedAt: "2026-01-12 10:30", status: "요청", cost: 15000, reason: "오염도 심각으로 인한 추가 요금", comment: "사진 확인 부탁드립니다.", washItems: ["내부세차", "특수오염제거"] },
    { id: "A-1002", orderId: "O-90005", plate: "90마5566", model: "스포티지", zoneName: "수원역 2번존", partner: "B협력사", requestedAt: "2026-01-11 14:20", status: "수락", cost: 10000, reason: "카시트 분리 세척", comment: "승인 완료", washItems: ["카시트세척"] },
    { id: "A-1003", orderId: "O-90010", plate: "55차5656", model: "EV6", zoneName: "광주 1번존", partner: "A협력사", requestedAt: "2026-01-10 09:15", status: "거절", cost: 20000, reason: "광택 작업 요청", comment: "정책상 불가", washItems: ["광택"] },
  ]);

  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const columns = [
    { key: "orderId", header: "오더 ID" },
    { key: "plate", header: "차량번호" },
    { key: "model", header: "차종" },
    { key: "zoneName", header: "쏘카존" },
    { key: "partner", header: "파트너사" },
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">합의 요청 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">현장 추가 요금 및 특수 세차 합의 요청 건 처리</div>
        </div>
      </div>

      <DataTable columns={columns} rows={items} rowKey={(r) => r.id} onRowClick={setSelected} />

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
                <Field label="차량" value={`${selected.plate} (${selected.model})`} />
                <Field label="파트너사" value={selected.partner} />
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
  const [view, setView] = useState("list"); // list | policy
  const [period, setPeriod] = useState(toYmd(new Date()));

  const billingData = [
    { id: "B-1001", orderId: "O-90002", partner: "B협력사", amount: 25000, status: "청구완료", date: "2026-01-12" },
    { id: "B-1002", orderId: "O-90005", partner: "B협력사", amount: 18000, status: "대기", date: "2026-01-12" },
    { id: "B-1003", orderId: "O-90011", partner: "C협력사", amount: 22000, status: "청구완료", date: "2026-01-11" },
  ];

  const policyData = [
    { id: "P-1", partner: "A협력사", baseAmount: 15000, missionAmount: 3000 },
    { id: "P-2", partner: "B협력사", baseAmount: 16000, missionAmount: 2500 },
    { id: "P-3", partner: "C협력사", baseAmount: 15500, missionAmount: 3000 },
  ];

  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">청구 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">파트너사별 청구 내역 및 단가 정책 관리</div>
        </div>
        <div className="flex gap-2">
          <Button variant={view === "list" ? "default" : "secondary"} onClick={() => setView("list")}>
            <Receipt className="mr-2 h-4 w-4" /> 청구 내역
          </Button>
          <Button variant={view === "policy" ? "default" : "secondary"} onClick={() => setView("policy")}>
            <Settings className="mr-2 h-4 w-4" /> 단가 정책
          </Button>
        </div>
      </div>

      {view === "list" ? (
        <>
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#172B4D]">기간 조회</span>
                <Input type="date" value={period} onChange={(e) => setPeriod(e.target.value)} className="w-40" />
              </div>
            </CardContent>
          </Card>
          <DataTable
            columns={[
              { key: "id", header: "청구 ID" },
              { key: "orderId", header: "오더 ID" },
              { key: "partner", header: "파트너사" },
              { key: "amount", header: "금액", render: (r) => `${r.amount.toLocaleString()}원` },
              { key: "status", header: "상태", render: (r) => <Badge tone={r.status === "청구완료" ? "ok" : "default"}>{r.status}</Badge> },
              { key: "date", header: "청구일" },
            ]}
            rows={billingData}
            rowKey={(r) => r.id}
            onRowClick={setSelected}
          />
        </>
      ) : (
        <DataTable
          columns={[
            { key: "partner", header: "파트너사" },
            { key: "baseAmount", header: "기본 단가", render: (r) => `${r.baseAmount.toLocaleString()}원` },
            { key: "missionAmount", header: "미션 단가", render: (r) => `${r.missionAmount.toLocaleString()}원` },
            {
              key: "action",
              header: "관리",
              render: () => <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>,
            },
          ]}
          rows={policyData}
          rowKey={(r) => r.id}
        />
      )}

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
              <Field label="파트너사" value={selected.partner} />
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

      <DataTable columns={columns} rows={items} rowKey={(r) => r.id} onRowClick={setSelected} />

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
    { id: 2, title: "설 연휴 기간 운영 가이드", targetPartner: "A협력사", targetRegion: "서울", createdAt: "2026-01-10", author: "운영팀" },
    { id: 3, title: "시스템 점검 안내", targetPartner: "전체", targetRegion: "전체", createdAt: "2026-01-12", author: "개발팀" },
  ];

  const [filter, setFilter] = useState("전체");

  const filtered = notices.filter((n) => filter === "전체" || n.targetPartner === filter);

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
            <span className="text-sm font-medium text-[#172B4D]">대상 파트너</span>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">
              <option value="전체">전체</option>
              <option value="A협력사">A협력사</option>
              <option value="B협력사">B협력사</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={[
          { key: "id", header: "No" },
          { key: "title", header: "제목", render: (r) => <span className="font-medium text-[#172B4D]">{r.title}</span> },
          { key: "targetPartner", header: "대상 파트너" },
          { key: "targetRegion", header: "대상 지역" },
          { key: "author", header: "작성자" },
          { key: "createdAt", header: "작성일" },
        ]}
        rows={filtered}
        rowKey={(r) => r.id}
      />
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
