import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  MapPinned,
  Handshake,
  Receipt,
  PackageSearch,
  Megaphone,
  Users,
  UserCog,
  Menu,
  Folder,
  ArrowRight,
  PanelLeft,
  FileText,
} from "lucide-react";

import {
  cn,
  useIsMobile,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Drawer,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./components/ui";

import FeedbackLayer from "./FeedbackLayer";

import PartnerDashboard from "./pages/partner/PartnerDashboard";
import PartnerOrdersPage from "./pages/partner/PartnerOrdersPage";
import PartnerZoneManagementPage from "./pages/partner/PartnerZoneManagementPage";
import PartnerSettlementPage from "./pages/partner/PartnerSettlementPage";
import PartnerBillingPage from "./pages/partner/PartnerBillingPage";
import PartnerLostItemsPage from "./pages/partner/PartnerLostItemsPage";
import PartnerNoticesPage from "./pages/partner/PartnerNoticesPage";

// ============== Navigation ==============
const PARTNER_NAV = [
  {
    group: "메인",
    items: [
      { key: "partner-dashboard", label: "대시보드(HOME)", icon: LayoutDashboard },
    ],
  },
  {
    group: "업무 관리",
    type: "group",
    key: "partner-work",
    label: "업무 관리",
    icon: ClipboardList,
    items: [
      { key: "partner-orders", label: "오더 조회", icon: ClipboardList, parentKey: "partner-work" },
      { key: "partner-zones", label: "존 관리", icon: MapPinned, parentKey: "partner-work" },
      { key: "partner-settlement", label: "합의 요청 관리", icon: Handshake, parentKey: "partner-work" },
      { key: "partner-billing", label: "청구 관리", icon: Receipt, parentKey: "partner-work" },
      { key: "partner-lostfound", label: "분실물 관리", icon: PackageSearch, parentKey: "partner-work" },
      { key: "partner-notices", label: "공지사항", icon: Megaphone, parentKey: "partner-work" },
    ],
  },
  {
    group: "정보 관리",
    type: "group",
    key: "partner-info",
    label: "정보 관리",
    icon: Folder,
    items: [
      { key: "partner-managers", label: "파트너 담당자 관리", icon: Users, parentKey: "partner-info" },
      { key: "partner-workers", label: "수행원 관리", icon: UserCog, parentKey: "partner-info" },
    ],
  },
];

const PARTNER_PAGE_TITLES = {
  "partner-dashboard": "대시보드",
  "partner-orders": "오더 조회",
  "partner-zones": "존 관리",
  "partner-settlement": "합의 요청 관리",
  "partner-billing": "청구 관리",
  "partner-lostfound": "분실물 관리",
  "partner-notices": "공지사항",
  "partner-managers": "파트너 담당자 관리",
  "partner-workers": "수행원 관리",
};

// ============== Main Component ==============
export default function PartnerApp({ onSwitchAdmin }) {
  const [activeKey, setActiveKey] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page");
    if (page && Object.keys(PARTNER_PAGE_TITLES).includes(page)) return page;
    return "partner-dashboard";
  });

  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(() =>
    PARTNER_NAV.find((g) => g.items?.some((it) => it.key === activeKey))?.key || ""
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHideComments, setIsHideComments] = useState(false);
  const [isFeedbackMode, setIsFeedbackMode] = useState(false);

  // Mock partner context
  const [currentPartner] = useState({
    partnerId: "P-001",
    partnerName: "A파트너",
  });

  // Drawer open detection
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDrawerOpen(document.body.classList.contains("drawer-open"));
    });
    observer.observe(document.body, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Mobile body scroll prevention
  useEffect(() => {
    if (isMobileMenuOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isMobileMenuOpen, isMobile]);

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("page") !== activeKey || params.get("admin") !== "partner") {
      const newUrl = new URL(window.location);
      newUrl.searchParams.set("admin", "partner");
      newUrl.searchParams.set("page", activeKey);
      window.history.pushState({ path: newUrl.toString() }, "", newUrl.toString());
    }
  }, [activeKey]);

  const pageTitle = PARTNER_PAGE_TITLES[activeKey] ?? "파트너 어드민";

  const onNavSelect = (key) => {
    setActiveKey(key);
    const parentGroup = PARTNER_NAV.find((g) => g.items?.some((it) => it.key === key));
    if (parentGroup && parentGroup.type === "group") {
      setOpenAccordion(parentGroup.key);
    }
  };

  const renderPage = () => {
    switch (activeKey) {
      case "partner-dashboard":
        return <PartnerDashboard currentPartner={currentPartner} />;
      case "partner-orders":
        return <PartnerOrdersPage currentPartner={currentPartner} />;
      case "partner-zones":
        return <PartnerZoneManagementPage currentPartner={currentPartner} />;
      case "partner-settlement":
        return <PartnerSettlementPage currentPartner={currentPartner} />;
      case "partner-billing":
        return <PartnerBillingPage currentPartner={currentPartner} />;
      case "partner-lostfound":
        return <PartnerLostItemsPage currentPartner={currentPartner} />;
      case "partner-notices":
        return <PartnerNoticesPage currentPartner={currentPartner} />;
      case "partner-managers":
        return <PlaceholderPage title="파트너 담당자 관리" description={`${currentPartner.partnerName}의 담당자 정보를 관리합니다.`} />;
      case "partner-workers":
        return <PlaceholderPage title="수행원 관리" description={`${currentPartner.partnerName} 소속 수행원을 관리합니다.`} />;
      default:
        return <PlaceholderPage title="파트너 어드민" description="준비 중인 화면입니다." />;
    }
  };

  return (
    <>
      <div className="relative min-h-screen bg-[#F8FAFC] text-[#172B4D]">
        {/* Mobile Backdrop */}
        {isMobile && isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true" />
        )}

        {/* Mobile Sidebar */}
        {isMobile && (
          <div className={cn(
            "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-[#064E3B] text-white shadow-xl transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <PartnerSidebarContent
              activeKey={activeKey}
              onSelect={(key) => { onNavSelect(key); setIsMobileMenuOpen(false); }}
              openAccordion={openAccordion}
              setOpenAccordion={setOpenAccordion}
              onSwitchAdmin={onSwitchAdmin}
            />
          </div>
        )}

        <div className="flex">
          {/* Desktop Sidebar */}
          <aside className={cn(
            "sticky top-0 hidden h-screen shrink-0 flex-col bg-[#064E3B] text-white md:flex transition-[width] duration-300 ease-in-out",
            isSidebarCollapsed ? "w-16" : "w-64"
          )}>
            <PartnerSidebarContent
              activeKey={activeKey}
              onSelect={onNavSelect}
              openAccordion={openAccordion}
              setOpenAccordion={setOpenAccordion}
              collapsed={isSidebarCollapsed}
              onToggle={() => setIsSidebarCollapsed((c) => !c)}
              onSwitchAdmin={onSwitchAdmin}
            />
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            {/* Header */}
            <header className="sticky top-0 z-[100] flex h-14 md:h-16 items-center gap-4 border-b border-[#E2E8F0] bg-white px-4 md:px-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <Button variant="ghost" size="sm" className="md:hidden -ml-2" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-5 w-5 text-[#6B778C]" />
              </Button>
              <div className="min-w-0 flex-1">
                <PartnerPageHeaderWithSpec title={pageTitle} pageKey={activeKey} />
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-[#DFE1E6]">
                <div className="flex flex-col items-end hidden md:block">
                  <div className="text-sm font-bold leading-tight text-[#172B4D]">{currentPartner.partnerName}</div>
                  <div className="text-xs text-[#6B778C] leading-tight">Partner Manager</div>
                </div>
                <div className="h-9 w-9 rounded-full bg-emerald-200 ring-2 ring-white shadow-sm" />
              </div>
            </header>

            <main className="min-w-0 flex-1 p-6 md:p-8">
              {renderPage()}
            </main>
          </div>
        </div>

        <FeedbackLayer isModeActive={isFeedbackMode} pageId={activeKey} isHideComments={isDrawerOpen || isHideComments} />
      </div>

      <div className={cn(
        "fixed bottom-5 left-5 z-[10000] flex items-center gap-2 transition-all duration-300",
        isDrawerOpen && isMobile ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        <button
          onClick={() => setIsHideComments((prev) => !prev)}
          className={`flex h-12 w-auto items-center justify-center rounded-full px-5 font-bold text-white shadow-lg transition-colors duration-200
            ${isHideComments ? "bg-gray-500/70 hover:bg-gray-600/80" : "bg-slate-700/70 hover:bg-slate-800/80"}`}
        >
          QnA 숨기기 {isHideComments ? "ON" : "OFF"}
        </button>
        <button
          onClick={() => setIsFeedbackMode((prev) => !prev)}
          className={`flex h-12 w-auto items-center justify-center rounded-full px-5 font-bold text-white shadow-lg transition-colors duration-200
            ${isFeedbackMode ? "bg-emerald-600/70 hover:bg-emerald-700/80" : "bg-slate-700/70 hover:bg-slate-800/80"}`}
        >
          QnA 입력모드 {isFeedbackMode ? "ON" : "OFF"}
        </button>
      </div>
    </>
  );
}

// ============== Sidebar Components ==============
function PartnerSidebarContent({ activeKey, onSelect, openAccordion, setOpenAccordion, collapsed, onToggle, onSwitchAdmin }) {
  return (
    <>
      <div className={cn("flex h-16 shrink-0 items-center gap-3", collapsed ? "justify-center px-2" : "px-6")}>
        {onToggle && (
          <button onClick={onToggle} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-emerald-300 hover:bg-emerald-800/50 hover:text-white transition-colors">
            {collapsed ? <PanelLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-white">파트너 어드민</div>
            <div className="truncate text-xs text-emerald-300">Partner Console Prototype</div>
          </div>
        )}
      </div>

      <nav className={cn("flex-1 overflow-y-auto pb-10 no-scrollbar", collapsed ? "px-1" : "px-2")}>
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        {PARTNER_NAV.map((g) =>
          g.type === "group" ? (
            collapsed ? (
              <div key={g.key} className="mt-3 space-y-1">
                {g.items.map((it) => (
                  <PartnerSidebarItem key={it.key} active={it.key === activeKey} icon={it.icon} label={it.label} onClick={() => onSelect(it.key)} collapsed={collapsed} />
                ))}
              </div>
            ) : (
              <Accordion key={g.key} type="single" collapsible>
                <AccordionItem value={g.key}>
                  <AccordionTrigger
                    isOpen={openAccordion === g.key}
                    onClick={() => setOpenAccordion(openAccordion === g.key ? "" : g.key)}
                  >
                    <g.icon className="h-4 w-4 shrink-0 text-emerald-400 group-hover:text-white" />
                    <span className="truncate">{g.label}</span>
                  </AccordionTrigger>
                  <AccordionContent isOpen={openAccordion === g.key}>
                    <div className="space-y-1">
                      {g.items.map((it) => (
                        <PartnerSidebarItem key={it.key} active={it.key === activeKey} icon={it.icon} label={it.label} onClick={() => onSelect(it.key)} isSubItem collapsed={collapsed} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )
          ) : (
            <div key={g.group} className="mt-3">
              {!collapsed && <div className="px-4 pb-2 pt-4 text-xs font-bold text-emerald-400 uppercase tracking-wider">{g.group}</div>}
              {collapsed && <div className="my-2 mx-2 border-t border-emerald-700" />}
              <div className="space-y-1">
                {g.items.map((it) => (
                  <PartnerSidebarItem key={it.key} active={it.key === activeKey} icon={it.icon} label={it.label} onClick={() => onSelect(it.key)} collapsed={collapsed} />
                ))}
              </div>
            </div>
          )
        )}

        {onSwitchAdmin && (
          <div className={cn("mt-4 border-t border-emerald-700 pt-4", collapsed ? "px-1" : "px-2")}>
            <button
              onClick={onSwitchAdmin}
              title={collapsed ? "어드민 전환" : undefined}
              className={cn(
                "group flex w-full items-center rounded-lg text-sm font-medium text-emerald-300 hover:bg-emerald-800/50 hover:text-white transition-all",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-4 py-2.5"
              )}
            >
              <ArrowRight className="h-4 w-4 shrink-0 text-emerald-400 group-hover:text-white" />
              {!collapsed && <span className="truncate">어드민 전환</span>}
            </button>
          </div>
        )}
      </nav>
    </>
  );
}

function PartnerSidebarItem({ active, icon: Icon, label, onClick, isSubItem = false, collapsed = false }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        "group flex w-full items-center rounded-lg text-sm transition-all font-medium",
        collapsed ? "justify-center px-0 py-2.5" : cn("gap-3 px-4", isSubItem ? "py-2" : "py-2.5"),
        active ? "bg-[#10B981] text-white shadow-md" : "text-emerald-200 hover:bg-emerald-800/50 hover:text-white"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-emerald-400 group-hover:text-white")} />
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}

// ============== Spec Viewer ==============
function PartnerPageHeaderWithSpec({ title, pageKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    if (isOpen && pageKey) {
      try {
        const modules = import.meta.glob("./docs/specs/partner/*.md", { query: "?raw", import: "default", eager: true });
        const foundKey = Object.keys(modules).find((key) =>
          key.toLowerCase().includes(pageKey.toLowerCase())
        );
        if (foundKey) {
          setMarkdown(modules[foundKey]);
        } else {
          setMarkdown(`# ${title}\n\n기능 명세 파일이 없습니다.\n\n\`src/docs/specs/partner/${pageKey}.md\` 파일을 생성해주세요.`);
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
        className="h-7 px-2 text-xs font-normal text-[#6B778C] border-[#DFE1E6] hover:text-[#10B981] hover:border-[#10B981]"
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
                <th key={i} className="px-4 py-3 font-bold text-[#172B4D] border-b border-[#DFE1E6] whitespace-nowrap">{parseInline(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE1E6]">
            {bodyRows.map((row, rI) => (
              <tr key={rI} className="hover:bg-[#F4F5F7]">
                {row.map((cell, cI) => (
                  <td key={cI} className="px-4 py-3 text-[#172B4D] align-top">{parseInline(cell)}</td>
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
    if (line.startsWith('|') && line.endsWith('|')) { tableBuffer.push(line); continue; } else { flushTable(); }
    if (!line) continue;
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-2xl font-bold mt-8 mb-4 text-[#0747A6]">{parseInline(line.slice(2))}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-xl font-bold mt-6 mb-3 text-[#0747A6] border-b border-[#DFE1E6] pb-2">{parseInline(line.slice(3))}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-lg font-bold mt-4 mb-2 text-[#0747A6]">{parseInline(line.slice(4))}</h3>);
    } else if (line.startsWith('#### ')) {
      elements.push(<h4 key={i} className="text-base font-bold mt-3 mb-1 text-[#0747A6]">{parseInline(line.slice(5))}</h4>);
    } else if (line.startsWith('##### ')) {
      elements.push(<h5 key={i} className="text-sm font-bold mt-3 mb-1 text-[#0747A6]">{parseInline(line.slice(6))}</h5>);
    } else if (line.startsWith('- ')) {
      const leadingSpaces = rawLine.match(/^ */)[0].length;
      const indentLevel = Math.floor(leadingSpaces / 2);
      let indentClass = "pl-1";
      if (indentLevel === 1) indentClass = "pl-6";
      if (indentLevel >= 2) indentClass = "pl-11";
      let bullet = <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#6B778C] mt-[0.6rem]" />;
      if (indentLevel === 1) bullet = <span className="shrink-0 w-1.5 h-1.5 rounded-full border border-[#6B778C] bg-white mt-[0.6rem]" />;
      else if (indentLevel >= 2) bullet = <span className="shrink-0 w-1.5 h-1.5 bg-[#6B778C] mt-[0.6rem] rounded-sm" />;
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

// ============== Placeholder ==============
function PlaceholderPage({ title, description }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-base font-bold text-[#172B4D]">{title}</div>
        <div className="mt-1 text-sm text-[#6B778C]">{description}</div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>준비 중</CardTitle>
          <CardDescription>이 화면은 아직 구현되지 않았습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#6B778C]">
            파트너 어드민의 상세 기능은 순차적으로 정의 및 구현될 예정입니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
