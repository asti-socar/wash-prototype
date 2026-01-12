import React, { useMemo, useState } from "react";
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
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
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
    <div className={cn("rounded-2xl bg-white shadow-sm ring-1 ring-slate-200", className)}>
      {children}
    </div>
  );
}
function CardHeader({ className, children }) {
  return <div className={cn("p-4 pb-2", className)}>{children}</div>;
}
function CardTitle({ className, children }) {
  return <div className={cn("text-sm font-semibold text-slate-900", className)}>{children}</div>;
}
function CardDescription({ className, children }) {
  return <div className={cn("mt-1 text-xs text-slate-600", className)}>{children}</div>;
}
function CardContent({ className, children }) {
  return <div className={cn("p-4 pt-2", className)}>{children}</div>;
}
function Button({ className, variant = "default", size = "md", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
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
        "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none",
        "focus:ring-2 focus:ring-slate-300",
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
        "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none",
        "focus:ring-2 focus:ring-slate-300",
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
    <div className="inline-flex rounded-2xl bg-slate-100 p-1 ring-1 ring-slate-200">
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={cn(
              "h-9 rounded-xl px-3 text-sm transition",
              active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
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
    default: "bg-slate-100 text-slate-700 ring-slate-200",
    danger: "bg-rose-50 text-rose-700 ring-rose-200",
    warn: "bg-amber-50 text-amber-800 ring-amber-200",
    ok: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1", tones[tone])}>
      {children}
    </span>
  );
}
function Chip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 ring-1 ring-slate-200">
      {children}
      {onRemove ? (
        <button className="rounded-full p-0.5 hover:bg-slate-200" onClick={onRemove} aria-label="remove">
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">{title}</div>
            <div className="truncate text-xs text-slate-500">우측 Drawer 상세</div>
          </div>
          <Button variant="ghost" className="h-10 w-10 rounded-2xl p-0" onClick={onClose}>
            <X className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
        <div className="h-[calc(100%-64px-72px)] overflow-y-auto p-4">{children}</div>
        <div className="flex h-[72px] items-center justify-end gap-2 border-t border-slate-200 px-4">
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
    <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
      <table className="min-w-full bg-white text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="whitespace-nowrap px-3 py-2 text-xs font-semibold text-slate-600">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-10 text-center text-sm text-slate-500">
                결과가 없습니다.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr
                key={rowKey(r)}
                className={cn(
                  "border-t border-slate-100",
                  onRowClick ? "cursor-pointer hover:bg-slate-50" : ""
                )}
                onClick={() => onRowClick?.(r)}
              >
                {columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-3 py-2 text-sm text-slate-800">
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
      { key: "agreements", label: "합의 요청 관리", icon: Handshake },
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
  agreements: "합의 요청 관리",
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <Sidebar activeKey={activeKey} onSelect={onNavSelect} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header title={pageTitle} />

          <main className="min-w-0 flex-1 p-4 md:p-6">
            {activeKey === "dashboard" && <Dashboard onClickKpi={goOrdersWithStatus} />}

            {activeKey === "vehicles" && <VehiclesPage />}

            {activeKey === "orders" && (
              <OrdersPage
                quickStatus={orderQuickFilter?.status ?? null}
                onClearQuickStatus={() => setOrderQuickFilter(null)}
              />
            )}

            {activeKey !== "dashboard" && activeKey !== "vehicles" && activeKey !== "orders" && (
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
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white md:block">
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <span className="text-sm font-semibold">W</span>
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">세차 인터널 어드민</div>
          <div className="truncate text-xs text-slate-500">Ops Console Prototype</div>
        </div>
      </div>

      <nav className="h-[calc(100vh-64px)] overflow-y-auto px-2 pb-4">
        {NAV.map((g) => (
          <div key={g.group} className="mt-3">
            <div className="px-2 pb-2 pt-2 text-xs font-semibold text-slate-500">{g.group}</div>
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
        "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm transition",
        active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-white" : "text-slate-500")} />
      <span className="truncate">{label}</span>
    </button>
  );
}

function Header({ title }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur md:px-6">
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-semibold">{title}</div>
        <div className="truncate text-xs text-slate-500">운영 현황 모니터링 및 정책 제어</div>
      </div>

      <div className="hidden w-80 items-center gap-2 md:flex">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="전역 검색(프로토타입)" className="pl-9" />
        </div>
      </div>

      <Button variant="ghost" className="h-10 w-10 rounded-2xl p-0">
        <Bell className="h-5 w-5 text-slate-600" />
      </Button>

      <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
        <div className="h-7 w-7 rounded-2xl bg-white ring-1 ring-slate-200" />
        <div className="hidden md:block">
          <div className="text-xs font-semibold leading-4">Ops Admin</div>
          <div className="text-[11px] text-slate-500 leading-4">Internal</div>
        </div>
      </div>
    </header>
  );
}

/**
 * Pages
 */
function Dashboard({ onClickKpi }) {
  const [period, setPeriod] = useState("day");

  const kpis = useMemo(() => {
    const total = 248;
    const reserved = 164;
    const completed = 58;
    const unassigned = 21;
    const agreementPending = 5;
    return { total, reserved, completed, unassigned, agreementPending };
  }, []);

  const trendData = useMemo(() => {
    if (period === "month") {
      return [
        { label: "8월", issued: 4200, reservedRate: 0.71, completedRate: 0.62 },
        { label: "9월", issued: 4580, reservedRate: 0.73, completedRate: 0.64 },
        { label: "10월", issued: 4860, reservedRate: 0.74, completedRate: 0.65 },
        { label: "11월", issued: 4720, reservedRate: 0.72, completedRate: 0.63 },
        { label: "12월", issued: 5100, reservedRate: 0.75, completedRate: 0.66 },
      ];
    }
    if (period === "week") {
      return [
        { label: "W-4", issued: 980, reservedRate: 0.70, completedRate: 0.61 },
        { label: "W-3", issued: 1040, reservedRate: 0.72, completedRate: 0.62 },
        { label: "W-2", issued: 1100, reservedRate: 0.73, completedRate: 0.64 },
        { label: "W-1", issued: 1075, reservedRate: 0.71, completedRate: 0.63 },
        { label: "W", issued: 1160, reservedRate: 0.74, completedRate: 0.65 },
      ];
    }
    return [
      { label: "D-6", issued: 210, reservedRate: 0.68, completedRate: 0.57 },
      { label: "D-5", issued: 232, reservedRate: 0.70, completedRate: 0.59 },
      { label: "D-4", issued: 245, reservedRate: 0.72, completedRate: 0.61 },
      { label: "D-3", issued: 238, reservedRate: 0.71, completedRate: 0.60 },
      { label: "D-2", issued: 251, reservedRate: 0.73, completedRate: 0.62 },
      { label: "D-1", issued: 240, reservedRate: 0.72, completedRate: 0.63 },
      { label: "Today", issued: 248, reservedRate: 0.74, completedRate: 0.64 },
    ];
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-semibold">오늘 운영 KPI</div>
          <div className="mt-1 text-xs text-slate-600">
            합의대기 <b>{kpis.agreementPending}</b>건은 KPI 카드 외 항목으로 별도 표기합니다.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="warn">실시간</Badge>
          <span className="text-xs text-slate-600">데이터는 프로토타입 더미 값입니다</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <KpiCard
          title="당일 오더 총건수"
          value={kpis.total}
          hint="카드 클릭 시 오더 관리로 이동(필터 적용)"
          onClick={() => onClickKpi("전체")}
        />
        <KpiCard title="예약" value={kpis.reserved} hint="진행상태=예약" onClick={() => onClickKpi("예약")} />
        <KpiCard title="완료" value={kpis.completed} hint="진행상태=완료" onClick={() => onClickKpi("완료")} />
        <KpiCard title="미배정" value={kpis.unassigned} hint="진행상태=미배정" onClick={() => onClickKpi("미배정")} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>트렌드</CardTitle>
            <CardDescription>전체 발행량 대비 예약률, 완료율 멀티 라인 차트</CardDescription>
          </div>
          <PillTabs
            value={period}
            onChange={setPeriod}
            items={[
              { value: "day", label: "일" },
              { value: "week", label: "주" },
              { value: "month", label: "월" },
            ]}
          />
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tickMargin={8} />
                <YAxis yAxisId="left" tickMargin={8} width={45} domain={[0, (max) => Math.ceil((max ?? 0) * 1.2)]} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickMargin={8}
                  width={45}
                  domain={[0, 1]}
                  tickFormatter={(v) => `${Math.round(v * 100)}%`}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "예약률" || name === "완료율") return [formatPercent(value), name];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="issued" name="발행량" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="reservedRate" name="예약률" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="completedRate" name="완료율" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>실시간 Slack 알림</CardTitle>
          <CardDescription>긴급 오더 및 세차 유형 변경 요청 발생 시 Slack 알림(어드민 UI 외 구성)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-700">
            현재는 UI에서 상태만 표시합니다. 실제 연동은 Webhook, 이벤트 라우팅, 알림 템플릿 표준화가 필요합니다.
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="ok">ON</Badge>
            <Button variant="secondary">설정 보기(프로토타입)</Button>
          </div>
        </CardContent>
      </Card>
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
            <span className="text-[11px] text-slate-500">바로가기</span>
          </CardTitle>
          <CardDescription>{hint}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold tracking-tight">{value}</div>
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
    return [
      { plate: "12가3456", zoneName: "강남역 1번존", zoneId: "Z-1001", region1: "서울", region2: "강남", partner: "A협력사", status: "예약", lastWash: "2026-01-10", elapsedDays: 2, model: "아반떼 AD", fuel: "가솔린" },
      { plate: "34나7890", zoneName: "잠실역 2번존", zoneId: "Z-1002", region1: "서울", region2: "송파", partner: "B협력사", status: "완료", lastWash: "2026-01-08", elapsedDays: 4, model: "K5", fuel: "가솔린" },
      { plate: "56다1122", zoneName: "홍대입구 3번존", zoneId: "Z-1003", region1: "서울", region2: "마포", partner: "A협력사", status: "미배정", lastWash: "2026-01-05", elapsedDays: 7, model: "쏘나타", fuel: "하이브리드" },
      { plate: "78라3344", zoneName: "판교 1번존", zoneId: "Z-2001", region1: "경기", region2: "성남", partner: "C협력사", status: "예약", lastWash: "2026-01-09", elapsedDays: 3, model: "아이오닉5", fuel: "EV" },
      { plate: "90마5566", zoneName: "수원역 2번존", zoneId: "Z-2002", region1: "경기", region2: "수원", partner: "B협력사", status: "완료", lastWash: "2026-01-07", elapsedDays: 5, model: "스포티지", fuel: "디젤" },
      { plate: "11바7788", zoneName: "부산역 1번존", zoneId: "Z-3001", region1: "부산", region2: "동구", partner: "D협력사", status: "미배정", lastWash: "2026-01-03", elapsedDays: 9, model: "그랜저", fuel: "가솔린" },
      { plate: "22사9900", zoneName: "해운대 2번존", zoneId: "Z-3002", region1: "부산", region2: "해운대", partner: "D협력사", status: "예약", lastWash: "2026-01-11", elapsedDays: 1, model: "레이", fuel: "가솔린" },
      { plate: "33아1212", zoneName: "대전역 1번존", zoneId: "Z-4001", region1: "대전", region2: "동구", partner: "C협력사", status: "완료", lastWash: "2026-01-06", elapsedDays: 6, model: "카니발", fuel: "디젤" },
      { plate: "44자3434", zoneName: "청주 2번존", zoneId: "Z-5002", region1: "충북", region2: "청주", partner: "B협력사", status: "미배정", lastWash: "2026-01-02", elapsedDays: 10, model: "모닝", fuel: "가솔린" },
      { plate: "55차5656", zoneName: "광주 1번존", zoneId: "Z-6001", region1: "광주", region2: "서구", partner: "A협력사", status: "예약", lastWash: "2026-01-09", elapsedDays: 3, model: "EV6", fuel: "EV" },
      { plate: "66카7878", zoneName: "인천공항 1번존", zoneId: "Z-7001", region1: "인천", region2: "중구", partner: "C협력사", status: "완료", lastWash: "2026-01-08", elapsedDays: 4, model: "티볼리", fuel: "가솔린" },
      { plate: "77타9090", zoneName: "제주공항 1번존", zoneId: "Z-8001", region1: "제주", region2: "제주시", partner: "D협력사", status: "미배정", lastWash: "2026-01-01", elapsedDays: 11, model: "셀토스", fuel: "가솔린" },
    ];
  }, []);

  const [q, setQ] = useState("");
  const [fRegion1, setFRegion1] = useState("");
  const [fRegion2, setFRegion2] = useState("");
  const [fPartner, setFPartner] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [selected, setSelected] = useState(null);

  const regions1 = useMemo(() => Array.from(new Set(data.map((d) => d.region1))), [data]);
  const regions2 = useMemo(() => Array.from(new Set(data.filter((d) => (fRegion1 ? d.region1 === fRegion1 : true)).map((d) => d.region2))), [data, fRegion1]);
  const partners = useMemo(() => Array.from(new Set(data.map((d) => d.partner))), [data]);
  const statuses = ["예약", "완료", "미배정"];

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
      const hitS = !fStatus || d.status === fStatus;

      return hitQ && hitR1 && hitR2 && hitP && hitS;
    });
  }, [data, q, fRegion1, fRegion2, fPartner, fStatus]);

  const columns = [
    { key: "plate", header: "차량번호" },
    { key: "zoneName", header: "존이름" },
    { key: "zoneId", header: "존 ID" },
    { key: "region1", header: "지역1" },
    { key: "region2", header: "지역2" },
    { key: "partner", header: "협력사" },
    {
      key: "status",
      header: "진행상태",
      render: (r) => <Badge tone={r.status === "미배정" ? "danger" : r.status === "예약" ? "warn" : "ok"}>{r.status}</Badge>,
    },
    { key: "lastWash", header: "마지막 세차일" },
    { key: "elapsedDays", header: "세차 경과일" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-semibold">차량 관리</div>
          <div className="mt-1 text-sm text-slate-600">수행률 낮은 차량, 존별 현황 모니터링(프로토타입)</div>
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
          <CardDescription>검색: 차량번호, 존이름, 존 ID / 필터: 지역1, 지역2, 협력사, 진행상태</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
            <div className="md:col-span-2">
              <Select value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
                <option value="">진행상태 전체</option>
                {statuses.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>

            <div className="md:col-span-12 flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap gap-2">
                {q ? <Chip onRemove={() => setQ("")}>검색: {q}</Chip> : null}
                {fRegion1 ? <Chip onRemove={() => { setFRegion1(""); setFRegion2(""); }}>지역1: {fRegion1}</Chip> : null}
                {fRegion2 ? <Chip onRemove={() => setFRegion2("")}>지역2: {fRegion2}</Chip> : null}
                {fPartner ? <Chip onRemove={() => setFPartner("")}>협력사: {fPartner}</Chip> : null}
                {fStatus ? <Chip onRemove={() => setFStatus("")}>상태: {fStatus}</Chip> : null}
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setQ(""); setFRegion1(""); setFRegion2(""); setFPartner(""); setFStatus("");
                }}
              >
                필터 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">검색 결과: <b>{filtered.length}</b>건</div>
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
              <CardContent className="space-y-2 text-sm text-slate-800">
                <Field label="차량번호" value={selected.plate} />
                <Field label="차종" value={selected.model} />
                <Field label="연료유형" value={selected.fuel} />
                <Field label="존" value={`${selected.zoneName} (${selected.zoneId})`} />
                <Field label="지역" value={`${selected.region1} / ${selected.region2}`} />
                <Field label="협력사" value={selected.partner} />
                <Field label="진행상태(Active 오더 기준)" value={selected.status} />
                <Field label="마지막 세차일" value={selected.lastWash} />
                <Field label="세차 경과일" value={`${selected.elapsedDays}일`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>세차 이력(더미)</CardTitle>
                <CardDescription>실데이터 연동 전 UI 형태만 제공</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-700">
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

  const data = useMemo(() => {
    return [
      { orderId: "O-90001", washType: "내부", orderGroup: "주기세차", orderType: "자동", carId: "C-1001", model: "아반떼 AD", plate: "12가3456", zone: "강남역 1번존", zoneId: "Z-1001", region1: "서울", region2: "강남", partner: "A협력사", status: "예약", elapsedDays: 2, worker: "수행원 김00", comment: "오염도 3, 내부 우선" , createdAt: toYmd(today)},
      { orderId: "O-90002", washType: "내외부", orderGroup: "현장세차", orderType: "수동", carId: "C-1002", model: "K5", plate: "34나7890", zone: "잠실역 2번존", zoneId: "Z-1002", region1: "서울", region2: "송파", partner: "B협력사", status: "완료", elapsedDays: 4, worker: "수행원 이00", comment: "합의건, 추가요금 협의" , createdAt: toYmd(today)},
      { orderId: "O-90003", washType: "외부", orderGroup: "주기세차", orderType: "자동", carId: "C-1003", model: "쏘나타", plate: "56다1122", zone: "홍대입구 3번존", zoneId: "Z-1003", region1: "서울", region2: "마포", partner: "A협력사", status: "미배정", elapsedDays: 7, worker: "-", comment: "미배정 상태, 수행원 부족" , createdAt: toYmd(today)},
      { orderId: "O-90004", washType: "내부", orderGroup: "현장세차", orderType: "자동", carId: "C-2001", model: "아이오닉5", plate: "78라3344", zone: "판교 1번존", zoneId: "Z-2001", region1: "경기", region2: "성남", partner: "C협력사", status: "예약", elapsedDays: 3, worker: "수행원 박00", comment: "EV, 실내 매트 확인" , createdAt: toYmd(today)},
      { orderId: "O-90005", washType: "내외부", orderGroup: "주기세차", orderType: "자동", carId: "C-2002", model: "스포티지", plate: "90마5566", zone: "수원역 2번존", zoneId: "Z-2002", region1: "경기", region2: "수원", partner: "B협력사", status: "완료", elapsedDays: 5, worker: "수행원 최00", comment: "점검 체크리스트 완료" , createdAt: toYmd(today)},
      { orderId: "O-90006", washType: "외부", orderGroup: "주기세차", orderType: "자동", carId: "C-3001", model: "그랜저", plate: "11바7788", zone: "부산역 1번존", zoneId: "Z-3001", region1: "부산", region2: "동구", partner: "D협력사", status: "미배정", elapsedDays: 9, worker: "-", comment: "장기 미배정 리스크" , createdAt: toYmd(today)},
      { orderId: "O-90007", washType: "내부", orderGroup: "현장세차", orderType: "수동", carId: "C-3002", model: "레이", plate: "22사9900", zone: "해운대 2번존", zoneId: "Z-3002", region1: "부산", region2: "해운대", partner: "D협력사", status: "예약", elapsedDays: 1, worker: "수행원 정00", comment: "오염도 2" , createdAt: toYmd(today)},
      { orderId: "O-90008", washType: "내외부", orderGroup: "주기세차", orderType: "자동", carId: "C-4001", model: "카니발", plate: "33아1212", zone: "대전역 1번존", zoneId: "Z-4001", region1: "대전", region2: "동구", partner: "C협력사", status: "완료", elapsedDays: 6, worker: "수행원 한00", comment: "분실물 없음" , createdAt: toYmd(today)},
      { orderId: "O-90009", washType: "외부", orderGroup: "주기세차", orderType: "자동", carId: "C-5002", model: "모닝", plate: "44자3434", zone: "청주 2번존", zoneId: "Z-5002", region1: "충북", region2: "청주", partner: "B협력사", status: "미배정", elapsedDays: 10, worker: "-", comment: "존 인력 수급 이슈" , createdAt: toYmd(today)},
      { orderId: "O-90010", washType: "내부", orderGroup: "현장세차", orderType: "수동", carId: "C-6001", model: "EV6", plate: "55차5656", zone: "광주 1번존", zoneId: "Z-6001", region1: "광주", region2: "서구", partner: "A협력사", status: "예약", elapsedDays: 3, worker: "수행원 오00", comment: "내부 먼지 제거 요청" , createdAt: toYmd(today)},
      { orderId: "O-90011", washType: "내외부", orderGroup: "주기세차", orderType: "자동", carId: "C-7001", model: "티볼리", plate: "66카7878", zone: "인천공항 1번존", zoneId: "Z-7001", region1: "인천", region2: "중구", partner: "C협력사", status: "완료", elapsedDays: 4, worker: "수행원 유00", comment: "사진 업로드 완료" , createdAt: toYmd(today)},
      { orderId: "O-90012", washType: "외부", orderGroup: "주기세차", orderType: "자동", carId: "C-8001", model: "셀토스", plate: "77타9090", zone: "제주공항 1번존", zoneId: "Z-8001", region1: "제주", region2: "제주시", partner: "D협력사", status: "미배정", elapsedDays: 11, worker: "-", comment: "장기 미배정, 알림 필요" , createdAt: toYmd(today)},
    ];
  }, []);

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

  const regions1 = useMemo(() => Array.from(new Set(data.map((d) => d.region1))), [data]);
  const regions2 = useMemo(
    () => Array.from(new Set(data.filter((d) => (fRegion1 ? d.region1 === fRegion1 : true)).map((d) => d.region2))),
    [data, fRegion1]
  );
  const partners = useMemo(() => Array.from(new Set(data.map((d) => d.partner))), [data]);
  const statuses = ["예약", "완료", "미배정"];
  const orderGroups = useMemo(() => Array.from(new Set(data.map((d) => d.orderGroup))), [data]);
  const orderTypes = useMemo(() => Array.from(new Set(data.map((d) => d.orderType))), [data]);
  const washTypes = useMemo(() => Array.from(new Set(data.map((d) => d.washType))), [data]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return data.filter((d) => {
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
  }, [data, q, periodFrom, periodTo, fRegion1, fRegion2, fOrderGroup, fOrderType, fWashType, fPartner, fStatus]);

  const columns = [
    { key: "orderId", header: "오더 ID" },
    {
      key: "washType",
      header: "세차타입",
      render: (r) => <span className="text-slate-800">{r.washType}</span>,
    },
    { key: "orderGroup", header: "오더구분" },
    { key: "orderType", header: "오더유형" },
    { key: "carId", header: "Car ID" },
    { key: "model", header: "차종" },
    { key: "plate", header: "차번호" },
    { key: "zone", header: "존" },
    { key: "elapsedDays", header: "세차경과일" },
    { key: "partner", header: "협력사명" },
    {
      key: "status",
      header: "진행상태",
      render: (r) => <Badge tone={r.status === "미배정" ? "danger" : r.status === "예약" ? "warn" : "ok"}>{r.status}</Badge>,
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
          <div className="text-base font-semibold">오더 관리</div>
          <div className="mt-1 text-sm text-slate-600">상단 필터 및 데이터 그리드, 행 클릭 Drawer 상세(프로토타입)</div>
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
          <CardDescription>
            검색: 차량번호, 오더ID, 존ID, 존이름, 수행원, 코멘트 요약 / 필터: 기간, 지역1/2, 오더구분/유형, 세차타입, 협력사명, 진행상태
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
        <div className="text-sm text-slate-600">검색 결과: <b>{filtered.length}</b>건</div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.orderId}
        onRowClick={(r) => setSelected(r)}
      />

      <Drawer
        open={!!selected}
        title={selected ? `오더 상세 - ${selected.orderId}` : "오더 상세"}
        onClose={() => { setSelected(null); setDeleteModalOpen(false); setDeleteReason(""); }}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>닫기</Button>
            <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              오더 삭제
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>오더 요약</CardTitle>
                <CardDescription>오더구분, 오더유형, 세차타입, 메모, 생성 경로(프로토타입)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-800">
                <Field label="오더 ID" value={selected.orderId} />
                <Field label="차량" value={`${selected.plate} (${selected.model}, ${selected.carId})`} />
                <Field label="존" value={`${selected.zone} (${selected.zoneId})`} />
                <Field label="지역" value={`${selected.region1} / ${selected.region2}`} />
                <Field label="협력사" value={selected.partner} />
                <Field label="오더구분" value={selected.orderGroup} />
                <Field label="오더유형" value={selected.orderType} />
                <Field label="세차타입" value={selected.washType} />
                <Field label="진행상태" value={selected.status} />
                <Field label="세차 경과일" value={`${selected.elapsedDays}일`} />
                <Field label="수행원" value={selected.worker} />
                <Field label="메모" value={selected.comment} />
                <Field label="오더 생성 경로" value={selected.orderType === "수동" ? "어드민 수동 발행" : "정책 기반 자동 발행"} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>수행/예약 이력(더미)</CardTitle>
                <CardDescription>실데이터 연동 전 UI 형태만 제공</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>예약 생성: 2026-01-12 10:10, 수행원 배정</li>
                  <li>세차 유형 변경 요청: 내부 - 내외부</li>
                  <li>완료 처리: 2026-01-12 12:40</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>사진/점검/분실물/미션/금액(프로토타입)</CardTitle>
                <CardDescription>상세 탭 구성 후보 영역. 지금은 Placeholder로 유지</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">
                수행 전후 사진, 점검 체크리스트, 분실물 신고/처리, 미션, 금액(청구 연계), 연계오더(Parent) 영역을 탭/섹션으로 확장 가능합니다.
              </CardContent>
            </Card>

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
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="w-36 shrink-0 text-xs font-semibold text-slate-500">{label}</div>
      <div className="min-w-0 flex-1 text-sm text-slate-900">{value}</div>
    </div>
  );
}

function PlaceholderPage({ title, description, right }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-semibold">{title}</div>
          <div className="mt-1 text-sm text-slate-600">{description}</div>
        </div>
        {right}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>프로토타입 안내</CardTitle>
          <CardDescription>리스트, 그리드, Drawer는 차량/오더 화면에 먼저 적용했습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>정책 관리: 리스트에서 다중 선택 또는 필터된 데이터 일괄 수정, Drawer 기반 편집</li>
            <li>권한: 역할별 RBAC 전제, 화면/액션 단위 가드레일 정의 필요</li>
            <li>감사로그: 삭제/수정/발행 등 주요 액션은 사유와 함께 기록 필요</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
