import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, X
} from 'lucide-react';

// ============== UTILITY & UI COMPONENTS (from PartnersPage.jsx) ==============
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
  };
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-10 px-3.5 text-sm" };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
function Input({ className, ...props }) {
  return <input className={cn("h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]", className)} {...props} />;
}
function Textarea({ className, ...props }) {
    return <textarea className={cn("w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]", className)} rows={4} {...props} />;
}
function usePagination(data, itemsPerPage = 10) {
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
function Drawer({ open, title, onClose, children, footer }) {
    const [width, setWidth] = useState(500);
    const [isResizing, setIsResizing] = useState(false);
  
    useEffect(() => {
      const handleMouseMove = (e) => {
        if (!isResizing) return;
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 400 && newWidth <= 1000) setWidth(newWidth);
      };
      const handleMouseUp = () => setIsResizing(false);
  
      if (isResizing) {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "col-resize";
      }
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
      };
    }, [isResizing]);
  
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="absolute right-0 top-0 h-full bg-white shadow-2xl flex flex-col" style={{ width }}>
          <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#0052CC] transition-colors" onMouseDown={() => setIsResizing(true)} />
          <div className="flex h-16 items-center justify-between border-b border-[#DFE1E6] px-6 shrink-0">
            <div className="text-lg font-bold text-[#172B4D]">{title}</div>
            <button onClick={onClose}><X className="h-6 w-6 text-gray-500" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">{children}</div>
          {footer && <div className="flex h-[72px] items-center justify-end gap-2 border-t border-[#DFE1E6] px-6 bg-[#F4F5F7] shrink-0">{footer}</div>}
        </div>
      </div>
    );
  }
  
  function Field({ label, children, isEditing }) {
    return (
      <div className="flex items-start justify-between gap-3 mb-4 last:mb-0">
        <div className="w-28 shrink-0 text-xs font-semibold text-[#6B778C] pt-3">{label}</div>
        <div className="min-w-0 flex-1">{
          isEditing ? children : <div className="text-sm pt-2.5">{children}</div>
        }</div>
      </div>
    );
  }


// ============== MOCK DATA ==============
const MOCK_DATA = [
    { id: 'OT-001', name: '일반', description: '일반 오더 유형', createdAt: '2023-10-26', updatedAt: '2023-10-26' },
    { id: 'OT-002', name: '예약', description: '예약 오더 유형', createdAt: '2023-10-26', updatedAt: '2023-10-26' },
    { id: 'OT-003', name: '긴급', description: '긴급 오더 유형', createdAt: '2023-10-26', updatedAt: '2023-10-26' },
    { id: 'OT-004', name: '패키지', description: '패키지 오더 유형', createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: 'OT-005', name: '프로모션', description: '프로모션 오더 유형', createdAt: '2024-02-20', updatedAt: '2024-03-10' },
];

// ============== MAIN PAGE COMPONENT ==============
export default function OrderTypePolicyPage() {
    const [policies, setPolicies] = useState(MOCK_DATA);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [q, setQ] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    const filteredData = useMemo(() => {
        const searchTerms = q.trim().toLowerCase().split(/[\s,]+/).filter(Boolean);
        return policies.filter(p => {
          return searchTerms.length === 0 || searchTerms.some(term => 
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            p.id.toLowerCase().includes(term)
          );
        });
    }, [policies, q]);
    
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
          if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }, [filteredData, sortConfig]);

    const { currentData, currentPage, totalPages, setCurrentPage } = usePagination(sortedData);

    const handleSort = (key) => {
        setSortConfig(prev => ({
          key,
          direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleSave = (policyToSave) => {
        const newPolicy = {
            ...policyToSave,
            updatedAt: new Date().toISOString().split('T')[0],
        };
        setPolicies(prev => prev.map(p => p.id === newPolicy.id ? newPolicy : p));
        setSelectedPolicy(null);
    };

    const columns = [
        { key: 'id', header: '정책 ID' },
        { key: 'name', header: '정책 이름' },
        { key: 'description', header: '설명' },
        { key: 'createdAt', header: '생성일' },
        { key: 'updatedAt', header: '수정일' },
    ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">오더유형 정책 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">다양한 오더 유형의 정책을 관리합니다.</div>
        </div>
        <Button>
            새 정책 추가
        </Button>
      </div>

      <Card>
        <CardContent className="!pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
                <Input value={q} onChange={e => setQ(e.target.value)} placeholder="정책 ID, 이름, 설명으로 검색..." className="pl-9" />
            </div>
            <Button variant="secondary" onClick={() => setQ('')} className="w-full sm:w-auto">필터 초기화</Button>
          </div>
        </CardContent>
      </Card>
      
      <DataTable 
        columns={columns} 
        rows={currentData} 
        rowKey={r => r.id} 
        onRowClick={setSelectedPolicy} 
        sortConfig={sortConfig} 
        onSort={handleSort} 
      />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      
      {selectedPolicy && (
        <PolicyDrawer
          policy={selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function PolicyDrawer({ policy, onClose, onSave }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(JSON.parse(JSON.stringify(policy)));

    useEffect(() => {
        setFormData(JSON.parse(JSON.stringify(policy)));
        setIsEditing(false);
    }, [policy]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        alert("정책 정보가 성공적으로 업데이트되었습니다.");
        setIsEditing(false);
    }
    
    const handleCancel = () => {
        setFormData(JSON.parse(JSON.stringify(policy)));
        setIsEditing(false);
    }

    return (
        <Drawer 
            open={!!policy} 
            title={`정책 상세: ${policy.name}`} 
            onClose={onClose}
            footer={
                isEditing ? (
                    <>
                        <Button variant="secondary" onClick={handleCancel}>취소</Button>
                        <Button onClick={handleSave}>저장</Button>
                    </>
                ) : (
                    <>
                        <Button variant="secondary" onClick={onClose}>닫기</Button>
                        <Button onClick={() => setIsEditing(true)}>수정</Button>
                    </>
                )
            }
        >
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>정책 정보</CardTitle></CardHeader>
              <CardContent>
                <Field label="정책 ID">{formData.id}</Field>
                <Field label="정책 이름" isEditing={isEditing}>
                  {isEditing ? (<Input name="name" value={formData.name} onChange={handleInputChange} />) : formData.name}
                </Field>
                <Field label="설명" isEditing={isEditing}>
                  {isEditing ? (<Textarea name="description" value={formData.description} onChange={handleInputChange} />) : formData.description}
                </Field>
                <Field label="생성일">{formData.createdAt}</Field>
                <Field label="최종 수정일">{formData.updatedAt}</Field>
              </CardContent>
            </Card>
          </div>
        </Drawer>
    );
}
