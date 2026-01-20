import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Plus, X, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, UploadCloud, Trash2
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_ORDERS = [
  { orderId: "O-90008", partnerName: "강남모빌리티", vehicleNumber: "33아1212" },
  { orderId: "O-90002", partnerName: "수원카케어", vehicleNumber: "34나7890" },
  { orderId: "O-90100", partnerName: "분당클린", vehicleNumber: "55오5678" },
];

const MOCK_INITIAL_LOST_ITEMS = [
  { 
    id: "L-1001", 
    orderId: "O-90008",
    partnerName: "강남모빌리티",
    vehicleNumber: "33아1212",
    status: "보관중", 
    foundAt: "2026-01-20 13:40",
    description: "검정색 남성 반지갑",
    recipientName: "",
    recipientAddress: "",
    recipientAddressDetail: "",
    photos: []
  },
  { 
    id: "L-1002", 
    orderId: "O-90002",
    partnerName: "수원카케어",
    vehicleNumber: "34나7890",
    status: "경찰서 인계", 
    foundAt: "2026-01-19 10:15",
    description: "에어팟 프로 2세대",
    recipientName: "서초경찰서",
    recipientAddress: "서울특별시 서초구 반포대로 179",
    recipientAddressDetail: "분실물 담당",
    photos: []
  },
];


/**
 * Utility & UI Components (Copied from CarsPage.jsx for consistency)
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

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-[#6B778C]">{label}</label>
      {children}
    </div>
  );
}

function Drawer({ open, title, onClose, children, footer }) {
  const [width, setWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [open]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 400 && newWidth <= 1200) setWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
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
  if (totalPages <= 1) return null;
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
          {rows.length === 0 ? <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[#6B778C]">결과가 없습니다.</td></tr> : rows.map(r => (
            <tr key={rowKey(r)} className={cn(onRowClick ? "cursor-pointer hover:bg-[#F1F5F9]" : "hover:bg-[#F8FAFC]")} onClick={() => onRowClick?.(r)}>
              {columns.map(c => <td key={c.key} className="whitespace-nowrap px-4 py-3.5 text-sm text-[#1E293B]">{typeof c.render === "function" ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Main Page & Components ---

export default function LostItemsPage() {
  const [items, setItems] = useState(MOCK_INITIAL_LOST_ITEMS);
  const [selected, setSelected] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'foundAt', direction: 'desc' });
  
  const [q, setQ] = useState("");
  const [searchField, setSearchField] = useState("orderId");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredAndSortedData = useMemo(() => {
    const qq = q.trim().toLowerCase();
    
    const filtered = items.filter((item) => {
      const targetVal = String(item[searchField] || "").toLowerCase();
      const hitQ = !qq || targetVal.includes(qq);
      const hitStatus = !filterStatus || item.status === filterStatus;
      return hitQ && hitStatus;
    });

    if (!sortConfig.key) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, q, searchField, filterStatus, sortConfig]);

  const columns = [
    { key: "id", header: "분실물 ID" },
    { key: "orderId", header: "오더 ID" },
    { key: "partnerName", header: "파트너명" },
    { key: "vehicleNumber", header: "차량번호" },
    {
      key: "status",
      header: "분실물 상태",
      render: (r) => {
        const tone = r.status === "보관중" ? "ok" : r.status.includes("인계") || r.status.includes("발송") ? "info" : "warn";
        return <Badge tone={tone}>{r.status}</Badge>;
      },
    },
    { key: "foundAt", header: "등록일시" },
  ];

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  const handleOpenRegister = () => {
    setSelected(null);
    setIsRegistering(true);
  }

  const handleSave = (itemToSave) => {
    if(isRegistering) {
      const now = new Date();
      const pad = (num) => num.toString().padStart(2, '0');
      const newTimestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

      const newItem = {
        ...itemToSave,
        id: `L-${Date.now()}`,
        foundAt: newTimestamp,
      };
      setItems(prev => [newItem, ...prev]);
    } else {
      setItems(prev => prev.map(item => item.id === itemToSave.id ? itemToSave : item));
    }
    closeDrawer();
    alert("저장되었습니다. (프로토타입)");
  };

  const closeDrawer = () => {
    setSelected(null);
    setIsRegistering(false);
  }

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(filteredAndSortedData, 40);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">분실물 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">세차 중 습득된 분실물 등록 및 처리 현황</div>
        </div>
        <Button onClick={handleOpenRegister}>
          <Plus className="mr-2 h-4 w-4" /> 분실물 등록
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색항목</label>
              <Select value={searchField} onChange={e => setSearchField(e.target.value)}>
                <option value="orderId">오더 ID</option>
                <option value="partnerName">파트너명</option>
                <option value="vehicleNumber">차량번호</option>
              </Select>
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색어</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
                <Input 
                  value={q} 
                  onChange={(e) => setQ(e.target.value)} 
                  placeholder={`${ {orderId: '오더 ID', partnerName: '파트너명', vehicleNumber: '차량번호'}[searchField] } 검색`} 
                  className="pl-9" 
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">분실물 상태</label>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">전체</option>
                <option value="보관중">보관중</option>
                <option value="경찰서 인계">경찰서 인계</option>
                <option value="택배 발송">택배 발송</option>
              </Select>
            </div>

            <div className="md:col-span-12 flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap gap-2">
                {q ? <Chip onRemove={() => setQ("")}>검색: {q}</Chip> : null}
                {filterStatus ? <Chip onRemove={() => setFilterStatus("")}>상태: {filterStatus}</Chip> : null}
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setQ(""); setFilterStatus(""); setSearchField("orderId");
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

      <DataTable columns={columns} rows={currentData} rowKey={(r) => r.id} onRowClick={setSelected} sortConfig={sortConfig} onSort={handleSort} />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {(selected || isRegistering) && (
        <LostItemDetailDrawer
          item={selected}
          isRegistering={isRegistering}
          onClose={closeDrawer}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function LostItemDetailDrawer({ item, isRegistering, onClose, onSave }) {
  const [formData, setFormData] = useState(item || { status: '보관중', photos: [] });
  const [orderIdSearch, setOrderIdSearch] = useState(item?.orderId || '');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOrderSearch = () => {
    if (!orderIdSearch) return alert("오더 ID를 입력해주세요.");
    const foundOrder = MOCK_ORDERS.find(o => o.orderId === orderIdSearch);
    if (foundOrder) {
      setFormData(prev => ({
        ...prev,
        orderId: foundOrder.orderId,
        partnerName: foundOrder.partnerName,
        vehicleNumber: foundOrder.vehicleNumber,
      }));
      alert("오더 정보가 조회되었습니다.");
    } else {
      alert("해당 ID의 오더를 찾을 수 없습니다.");
    }
  };

  const [imageFiles, setImageFiles] = useState([]);
  const handlePhotoChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (imageFiles.length + files.length > 10) {
        return alert("사진은 최대 10장까지 등록할 수 있습니다.");
      }
      setImageFiles(prev => [...prev, ...files]);
    }
  };
  const removePhoto = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const showDeliveryFields = formData.status === '경찰서 인계' || formData.status === '택배 발송';
  const deliveryFieldLabel = formData.status === '경찰서 인계' ? '경찰서' : '배송지';
  const recipientFieldLabel = formData.status === '경찰서 인계' ? '경찰서명' : '받는 사람';

  const title = isRegistering ? "분실물 등록" : `분실물 상세 (${item?.id})`;

  return (
    <Drawer open={true} title={title} onClose={onClose}
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button onClick={() => onSave(formData)}>{isRegistering ? '등록하기' : '수정하기'}</Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>오더 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="오더 ID">
              <div className="flex gap-2">
                <Input value={orderIdSearch} onChange={e => setOrderIdSearch(e.target.value)} placeholder="오더 ID로 검색" disabled={!isRegistering} />
                {isRegistering && <Button variant="secondary" onClick={handleOrderSearch}><Search className="h-4 w-4 mr-1" /> 조회</Button>}
              </div>
            </Field>
            <Field label="파트너명"><Input value={formData.partnerName || ''} readOnly className="bg-slate-50" /></Field>
            <Field label="차량번호"><Input value={formData.vehicleNumber || ''} readOnly className="bg-slate-50" /></Field>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>분실물 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="처리 상태">
              <Select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="보관중">보관중</option>
                <option value="경찰서 인계">경찰서 인계</option>
                <option value="택배 발송">택배 발송</option>
              </Select>
            </Field>
            <Field label="습득물 설명">
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="w-full min-h-[80px] rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
                placeholder="습득한 물품의 특징을 자세하게 입력해주세요. (예: 검정색 샤넬 반지갑, 내용물 포함)"
              />
            </Field>
          </CardContent>
        </Card>

        {showDeliveryFields && (
          <Card>
            <CardHeader><CardTitle>{deliveryFieldLabel} 정보</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label={recipientFieldLabel}>
                <Input name="recipientName" value={formData.recipientName || ''} onChange={handleInputChange} />
              </Field>
              <Field label={`${deliveryFieldLabel} 주소`}>
                <div className="flex gap-2">
                  <Input name="recipientAddress" value={formData.recipientAddress || ''} onChange={handleInputChange} placeholder="주소 검색" />
                  <Button variant="secondary">검색</Button>
                </div>
              </Field>
              <Field label="상세 주소">
                <Input name="recipientAddressDetail" value={formData.recipientAddressDetail || ''} onChange={handleInputChange} placeholder="상세 주소 입력" />
              </Field>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>사진 (최대 10장)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                  <UploadCloud className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-600">클릭 또는 드래그하여 파일 업로드</span>
                  <input type="file" name="file_upload" className="hidden" multiple accept="image/*" onChange={handlePhotoChange} />
              </label>
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative aspect-square">
                      <img src={URL.createObjectURL(file)} alt={`preview ${index}`} className="w-full h-full object-cover rounded-md" />
                      <Button variant="danger" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => removePhoto(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Drawer>
  );
}