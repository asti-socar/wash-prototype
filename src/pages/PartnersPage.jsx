import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Trash2
} from 'lucide-react';

/**
 * Utility & UI Components (Local copies for standalone functionality)
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
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-10 px-3.5 text-sm" };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
function Input({ className, ...props }) {
  return <input className={cn("h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]", className)} {...props} />;
}
function Select({ className, children, ...props }) {
  return <select className={cn("h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]", className)} {...props}>{children}</select>;
}
function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-slate-100 text-slate-800",
    danger: "bg-rose-100 text-rose-800",
    warn: "bg-amber-100 text-amber-800",
    ok: "bg-emerald-100 text-emerald-800",
    info: "bg-blue-100 text-blue-800",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", tones[tone])}>{children}</span>;
}
function Field({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="w-36 shrink-0 text-xs font-semibold text-[#6B778C] pt-2.5">{label}</div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

// Drawer Component
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

// Pagination Hook & Component
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

// DataTable Component
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

// Tabs Components
function Tabs({ value, children }) { return <div className="w-full space-y-4">{children}</div>; }
function TabsList({ children }) { return <div className="flex border-b border-[#DFE1E6]">{children}</div>; }
function TabsTrigger({ value, currentValue, onClick, children }) {
  const active = value === currentValue;
  return (
    <button onClick={() => onClick(value)} className={cn("relative px-4 py-2.5 text-sm font-medium transition-all", active ? "text-[#0052CC]" : "text-[#6B778C] hover:text-[#172B4D]")}>
      {children}
      {active && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#0052CC]" />}
    </button>
  );
}
function TabsContent({ value, currentValue, children, className }) {
  if (value !== currentValue) return null;
  return <div className={cn("animate-in fade-in slide-in-from-bottom-1 duration-200", className)}>{children}</div>;
}

/**
 * Mock Data (V2)
 */
const MOCK_ALL_ZONES = Array.from({ length: 150 }, (_, i) => {
  const region1Options = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종"];
  const region1 = region1Options[i % region1Options.length];
  return {
    zoneId: `Z-${1000 + i}`,
    zoneName: ` ${i + 1}번존`,
    region1: region1,
    region2: `${region1.charAt(0)}${i % 5 + 1}구`,
  };
});

const MOCK_PARTNERS_V2 = [
  {
    partnerId: 'P-001',
    partnerName: '강남모빌리티',
    ceoName: '김대표',
    type: '법인',
    businessNumber: '123-45-67890',
    address: '서울시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    fax: '02-1234-5679',
    businessDescription: '세차 및 차량 관리 전문',
    email: 'contact@gangnammob.com',
    contractStartDate: '2025-01-01',
    contractEndDate: '2026-12-31',
    contractStatus: '운영중',
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2026-01-10',
    assignedZoneIds: MOCK_ALL_ZONES.slice(0, 60).map(z => z.zoneId), // 60 zones (>50)
    unitPrices: [{ id: 1, orderGroup: '정규', washType: '내외부', price: 15000 }, { id: 2, orderGroup: '수시', washType: '외부', price: 12000 }],
  },
  {
    partnerId: 'P-002',
    partnerName: '수원카케어',
    ceoName: '이사장',
    type: '개인',
    businessNumber: '987-65-43210',
    address: '경기도 수원시 팔달구 인계로 456',
    phone: '031-987-6543',
    fax: '031-987-6544',
    businessDescription: '수원 지역 전문 세차',
    email: 'master@suwoncare.com',
    contractStartDate: '2024-06-01',
    contractEndDate: '2025-05-31',
    contractStatus: '종료',
    isActive: false,
    createdAt: '2024-06-01',
    updatedAt: '2025-06-01',
    assignedZoneIds: MOCK_ALL_ZONES.slice(60, 120).map(z => z.zoneId), // 60 zones (>50)
    unitPrices: [{ id: 1, orderGroup: '정규', washType: '내외부', price: 16000 }],
  },
];

/**
 * Main Page Component
 */
export default function PartnersPage() {
  const [partners, setPartners] = useState(MOCK_PARTNERS_V2);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return partners;
    return [...partners].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [partners, sortConfig]);

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getStatusTone = (status) => {
    if (status === '운영중') return 'info';
    if (status === '종료') return 'danger';
    return 'default';
  };

  const columns = [
    { key: 'partnerName', header: '파트너 명' },
    { key: 'ceoName', header: '대표자' },
    { key: 'contractStatus', header: '계약 상태', align: 'center', render: r => <Badge tone={getStatusTone(r.contractStatus)}>{r.contractStatus}</Badge> },
    { key: 'phone', header: '휴대전화' },
    { key: 'assignedZoneIds', header: '배정 존 개수', align: 'center', render: r => `${r.assignedZoneIds.length}개` },
  ];

  const handleSave = (partnerToSave) => {
    setPartners(prev => prev.map(p => p.partnerId === partnerToSave.partnerId ? partnerToSave : p));
    setSelectedPartner(null);
  };

  const handleCreate = () => {
    const newPartner = {
      partnerId: `P-${Date.now()}`,
      partnerName: '',
      ceoName: '',
      contractStatus: '운영중',
      assignedZoneIds: [],
      createdAt: new Date().toISOString().split('T')[0],
      unitPrices: [],
    };
    setSelectedPartner(newPartner);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">파트너 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">계약된 파트너사의 상태와 담당 구역을 설정하고 관리합니다.</div>
        </div>
        <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" /> 신규 파트너 등록</Button>
      </div>


      <DataTable columns={columns} rows={currentData} rowKey={r => r.partnerId} onRowClick={setSelectedPartner} sortConfig={sortConfig} onSort={handleSort} />
      <div className="flex items-center justify-end pt-2">
        <div className="flex items-center gap-2 text-sm text-[#6B778C]">
          <span>
            {totalItems > 0
              ? `${(currentPage - 1) * 40 + 1} - ${Math.min(
                  currentPage * 40,
                  totalItems
                )} / ${totalItems.toLocaleString()}`
              : "0 - 0 / 0"}
          </span>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 h-auto"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 h-auto"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {selectedPartner && (
        <PartnerDetailDrawer
          partner={selectedPartner}
          onClose={() => setSelectedPartner(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function PartnerDetailDrawer({ partner, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState("info");
  const [formData, setFormData] = useState({ ...partner });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isEditing = !!partner?.partnerId && !!partner.partnerName;

  return (
    <Drawer open={!!partner} title={partner.partnerName ? `파트너 상세 - ${partner.partnerName}` : "신규 파트너 등록"} onClose={onClose}
      footer={
        <div className="flex w-full flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">닫기</Button>
          <Button onClick={() => onSave(formData)} className="w-full sm:w-auto">{isEditing ? '수정하기' : '등록하기'}</Button>
        </div>
      }
    >
      <Tabs value={activeTab}>
        <TabsList>
          <TabsTrigger value="info" currentValue={activeTab} onClick={setActiveTab}>기본 정보</TabsTrigger>
          <TabsTrigger value="prices" currentValue={activeTab} onClick={setActiveTab}>단가 정책 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="info" currentValue={activeTab} className="pt-4">
          <div className="space-y-2">
            <Field label={<>파트너 명<span className="text-rose-500 ml-1">*</span></>}><Input name="partnerName" value={formData.partnerName || ''} onChange={handleInputChange} placeholder="파트너 명 입력" /></Field>
            <Field label={<>대표자<span className="text-rose-500 ml-1">*</span></>}><Input name="ceoName" value={formData.ceoName || ''} onChange={handleInputChange} placeholder="대표자 이름 입력" /></Field>
            <Field label="사업자번호"><Input name="businessNumber" value={formData.businessNumber || ''} onChange={handleInputChange} placeholder="사업자번호 입력" /></Field>
            <Field label="주소"><Input name="address" value={formData.address || ''} onChange={handleInputChange} placeholder="주소 입력" /></Field>
            <Field label="휴대전화"><Input name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="휴대전화 입력" /></Field>
            <Field label="이메일"><Input name="email" value={formData.email || ''} onChange={handleInputChange} placeholder="이메일 입력" /></Field>
            <Field label="계약 시작일"><Input type="date" name="contractStartDate" value={formData.contractStartDate || ''} onChange={handleInputChange} /></Field>
            <Field label="계약 종료일"><Input type="date" name="contractEndDate" value={formData.contractEndDate || ''} onChange={handleInputChange} /></Field>
            <Field label="계약 상태">
              <Select name="contractStatus" value={formData.contractStatus || '운영중'} onChange={handleInputChange}>
                <option value="운영중">운영중</option>
                <option value="종료">종료</option>
              </Select>
            </Field>
          </div>
        </TabsContent>

        <TabsContent value="prices" currentValue={activeTab} className="pt-4">
          <PricePolicyTab formData={formData} setFormData={setFormData} />
        </TabsContent>
      </Tabs>
    </Drawer>
  );
}

function PricePolicyTab({ formData, setFormData }) {
  const [newPrice, setNewPrice] = useState({ orderGroup: '정규', washType: '내외부', price: 0 });

  const handleAdd = () => {
    if (newPrice.price <= 0) return alert("금액을 입력해주세요.");
    const nextId = (formData.unitPrices?.length || 0) > 0 
      ? Math.max(...formData.unitPrices.map(p => p.id)) + 1 
      : 1;
    const newItem = { ...newPrice, id: nextId };
    setFormData(prev => ({
      ...prev,
      unitPrices: [...(prev.unitPrices || []), newItem]
    }));
    setNewPrice({ orderGroup: '정규', washType: '내외부', price: 0 });
  };

  const handleRemove = (id) => {
    setFormData(prev => ({
      ...prev,
      unitPrices: prev.unitPrices.filter(p => p.id !== id)
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>단가 정책 목록</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-4 py-2 font-semibold text-[#475569]">오더 구분</th>
                  <th className="px-4 py-2 font-semibold text-[#475569]">세차 유형</th>
                  <th className="px-4 py-2 font-semibold text-[#475569]">단가</th>
                  <th className="px-4 py-2 font-semibold text-[#475569]">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {formData.unitPrices?.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-2">{p.orderGroup}</td>
                    <td className="px-4 py-2">{p.washType}</td>
                    <td className="px-4 py-2">{p.price.toLocaleString()}원</td>
                    <td className="px-4 py-2"><button onClick={() => handleRemove(p.id)} className="text-rose-600 hover:underline"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
                {(!formData.unitPrices || formData.unitPrices.length === 0) && <tr><td colSpan={4} className="px-4 py-4 text-center text-[#6B778C]">등록된 정책이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>정책 추가</CardTitle></CardHeader>
        <CardContent className="flex gap-2 items-end">
          <div className="flex-1 space-y-1"><label className="text-xs font-semibold text-[#6B778C]">오더 구분</label><Select value={newPrice.orderGroup} onChange={e => setNewPrice({...newPrice, orderGroup: e.target.value})}><option>정규</option><option>수시</option><option>긴급</option></Select></div>
          <div className="flex-1 space-y-1"><label className="text-xs font-semibold text-[#6B778C]">세차 유형</label><Select value={newPrice.washType} onChange={e => setNewPrice({...newPrice, washType: e.target.value})}><option>내외부</option><option>내부</option><option>외부</option><option>특수</option></Select></div>
          <div className="flex-1 space-y-1"><label className="text-xs font-semibold text-[#6B778C]">단가</label><Input type="number" value={newPrice.price} onChange={e => setNewPrice({...newPrice, price: Number(e.target.value)})} /></div>
          <Button onClick={handleAdd}><Plus className="h-4 w-4" /></Button>
        </CardContent>
      </Card>
    </div>
  );
}