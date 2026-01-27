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

import Dashboard from "./pages/Dashboard";
import OrdersPage from "./pages/OrdersPage";
import MissionsPage from "./pages/MissionsPage";
import CarsPage from "./pages/CarsPage";
import PartnersPage from './pages/PartnersPage';
import PartnerManagersPage from './pages/PartnerManagersPage';
import WorkersPage from './pages/WorkersPage';
import BillingPage from './pages/BillingPage';
import SettlementPage from './pages/SettlementPage';
import LostItemsPage from './pages/LostItemsPage';
import UpdateHistoryPage from './pages/UpdateHistoryPage';
import AIPolicyPage from './pages/AIPolicyPage';
import ZonePolicyPage from './pages/ZonePolicyPage';
import RegionPolicyPage from './pages/RegionPolicyPage';
import OrderTypePolicyPage from './pages/OrderTypePolicyPage';
import ChecklistPage from './pages/ChecklistPage';

import missionPoliciesData from "./mocks/missionPolicies.json";
import policyVehiclesData from "./mocks/policyVehicles.json";
import ordersData from "./mocks/orders.json";

import FeedbackLayer from './FeedbackLayer';

import {
  cn,
  toYmd,
  useIsMobile,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  Chip,
  Drawer,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  usePagination,
  Pagination,
  DataTable,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Field,
} from "./components/ui";

/**
 * util
 */


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
      { key: "order-type-policy", label: "오더유형 정책", icon: Settings, parentKey: 'order-policy' },
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
      { key: "missions", label: "미션 정책 관리", icon: ClipboardList, parentKey: 'work-management' },
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
  {
    group: "파트너 에이전트 (임시)",
    items: [{ key: "checklist-mockup", label: "오더별 수행 목업", icon: ListChecks }],
  },
];

const PAGE_TITLES = {
  "update-history": "업데이트 이력",
  dashboard: "관제 대시보드",
  "ai-policy": "AI 모델 정책 관리",
  "zone-policy": "존 정책 관리",
  "order-type-policy": "오더유형 정책 관리",
  "region-policy": "지역 정책 관리",
  vehicles: "차량 관리",
  missions: "미션 정책 관리",
  orders: "오더 관리",
  settlement: "합의 요청 관리",
  billing: "청구 관리",
  lostfound: "분실물 관리",
  notices: "공지 관리(CMS)",
  partners: "파트너 관리",
  "partner-managers": "파트너 담당자 관리",
  workers: "수행원 조회",
  "checklist-mockup": "오더별 수행 목업",
};

/**
 * App
 */
export default function App() {
  const pageKeyFromUrl = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("page");
  }, []);
  
  return <AdminApp />;
}

function AdminApp() {
  const [activeKey, setActiveKey] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page");
    if (page && Object.keys(PAGE_TITLES).includes(page)) {
      return page;
    }
    return "update-history";
  });

  const [isHideComments, setIsHideComments] = useState(false);
  const [isFeedbackMode, setIsFeedbackMode] = useState(false);
  const isMobile = useIsMobile(); // 1. useIsMobile 훅 사용
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(() => NAV.find(g => g.items?.some(it => it.key === activeKey))?.key || "");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          setIsDrawerOpen(document.body.classList.contains('drawer-open'));
        }
      }
    });
    observer.observe(document.body, { attributes: true });
    return () => observer.disconnect();
  }, []);

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

  // Lifted State: Missions (전역 관리) - 정책 기반
  const [missionPolicies, setMissionPolicies] = useState(missionPoliciesData);
  const [policyVehicles, setPolicyVehicles] = useState(policyVehiclesData);

  // Lifted State: Orders (전역 관리)
  const [orders, setOrders] = useState(ordersData);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");

    if (orderId) {
      setInitialOrderId(orderId);
    }
  }, []);

  // URL 쿼리 스트링과 activeKey 상태 양방향 동기화
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('page') !== activeKey) {
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('page', activeKey);
      window.history.pushState({ path: newUrl.toString() }, '', newUrl.toString());
    }
  }, [activeKey]);

  const pageTitle = PAGE_TITLES[activeKey] ?? "Admin";

  const goOrdersWithStatus = (status) => {
    setOrderQuickFilter({ status });
    setActiveKey("orders");
  };

  const onNavSelect = (key) => {
    if (key === "notices") {
      window.open("", "_blank")?.document.write("CMS Link 필요");
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
        return <MissionsPage
          missionPolicies={missionPolicies}
          setMissionPolicies={setMissionPolicies}
          policyVehicles={policyVehicles}
          setPolicyVehicles={setPolicyVehicles}
          orders={orders}
        />;
      case "orders":
        return (
          <OrdersPage
            quickStatus={orderQuickFilter?.status ?? null}
            onClearQuickStatus={() => setOrderQuickFilter(null)}
            initialOrderId={initialOrderId}
            orders={orders}
            setOrders={setOrders}
          />
        );
      case "settlement":
        return <SettlementPage />;
      case "billing":
        return <BillingPage />;
      case "lostfound":
        return <LostItemsPage />;
      case "notices":
        return <PlaceholderPage title="공지 관리(CMS)" description="외부 시스템으로 이동 중입니다. 새 탭이 열리지 않으면 팝업 차단을 확인해주세요." />;
      case "partners":
        return <PartnersPage />;
      case "partner-managers":
        return <PartnerManagersPage />;
      case "workers":
        return <WorkersPage />;
      case "ai-policy":
        return <AIPolicyPage />;
      case "zone-policy":
        return <ZonePolicyPage />;
      case "region-policy":
        return <RegionPolicyPage />;
      case "order-type-policy":
        return <OrderTypePolicyPage />;
      case "checklist-mockup":
        return <ChecklistPage />;
      default:
        return <PlaceholderPage title={pageTitle} description="MVP 범위에서는 리스트 조회, 상단 검색/필터, 우측 Drawer 기반 상세 및 정책 수정 흐름으로 정리하는 것이 효율적입니다." />;
    }
  };

  return (
    <>
      <div className="relative min-h-screen bg-[#F8FAFC] text-[#172B4D]">
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
      <FeedbackLayer isModeActive={isFeedbackMode} pageId={activeKey} isHideComments={isDrawerOpen || isHideComments} />
      </div>

      <div className={cn(
        "fixed bottom-5 z-[10000] flex items-center gap-2 transition-all duration-300",
        isDrawerOpen && !isMobile ? "left-5" : "right-5",
        isDrawerOpen && isMobile ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        <button
          onClick={() => setIsHideComments(prev => !prev)}
          className={`flex h-12 w-auto items-center justify-center rounded-full px-5 font-bold text-white shadow-lg transition-colors duration-200
            ${isHideComments ? 'bg-gray-500 hover:bg-gray-600' : 'bg-slate-700 hover:bg-slate-800'}
          `}
        >
          QnA 숨기기 {isHideComments ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => setIsFeedbackMode(prev => !prev)}
          className={`flex h-12 w-auto items-center justify-center rounded-full px-5 font-bold text-white shadow-lg transition-colors duration-200
            ${isFeedbackMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-800'}
          `}
        >
          QnA 입력모드 {isFeedbackMode ? 'ON' : 'OFF'}
        </button>
      </div>
    </>
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
          <div className="truncate text-sm font-bold text-white">세차 인터널 어드민</div>
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
    <header className="sticky top-0 z-[100] flex h-14 md:h-16 items-center gap-4 border-b border-[#E2E8F0] bg-white px-4 md:px-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
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
