import React, { useMemo, useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  ArrowUpDown,
  ExternalLink,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  X,
} from "lucide-react";

// Helper components from the old file.
// In a real app, these would be in separate files.
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function toYmd(d) {
  if (!d) return "";
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

function Drawer({ open, title, onClose, children, footer }) {
  const isMobile = useIsMobile();
  const [width, setWidth] = useState(800);
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
    if (isMobile) return;
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 500 && newWidth <= 1200) setWidth(newWidth);
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
            <div className="truncate text-xs text-[#6B778C]">미션 정책 상세 및 차량 관리</div>
          </div>
          <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100" onClick={onClose}><X className="h-6 w-6" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
        <div className="shrink-0 border-t border-[#DFE1E6] bg-gray-50 p-4 sm:px-6 sm:py-4">{footer}</div>
      </div>
    </div>
  );
}

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
      <Button variant="ghost" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
      {pages.map(p => (
        <Button key={p} variant={p === currentPage ? "default" : "ghost"} size="sm" className={cn("w-8 h-8 p-0", p === currentPage ? "" : "font-normal text-[#6B778C]")} onClick={() => onPageChange(p)}>{p}</Button>
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
            {columns.map((c) => (
              <th key={c.key} className="whitespace-nowrap px-4 py-3.5 text-[13px] font-semibold text-[#475569] cursor-pointer hover:bg-slate-100" onClick={() => onSort && onSort(c.key)}>
                <div className="flex items-center gap-1">
                  {c.header}
                  {sortConfig?.key === c.key && (<ArrowUpDown className={cn("h-3 w-3", sortConfig.direction === 'asc' ? "text-[#0052CC]" : "text-[#0052CC] rotate-180")} />)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[#6B778C]">결과가 없습니다.</td></tr>
          ) : (
            rows.map((r) => (
              <tr key={rowKey(r)} className={cn(onRowClick ? "cursor-pointer hover:bg-[#F1F5F9]" : "hover:bg-[#F8FAFC]")} onClick={() => onRowClick?.(r)}>
                {columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-4 py-3.5 text-sm text-[#1E293B]">{typeof c.render === "function" ? c.render(r) : r[c.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const MissionsPage = ({ missionPolicies, setMissionPolicies, policyVehicles, setPolicyVehicles, orders }) => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newPolicyForm, setNewPolicyForm] = useState({ content: "", amount: 0, requiresPhoto: true });
  
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [bulkPlates, setBulkPlates] = useState("");

  const enrichedPolicies = useMemo(() => {
    return missionPolicies.map(policy => {
      const assignedVehicles = policyVehicles.filter(v => v.policyId === policy.id);
      const completedCount = assignedVehicles.filter(v => v.status === 'completed').length;
      const totalCount = assignedVehicles.length;
      const progress = totalCount > 0 ? completedCount / totalCount : 0;
      return {
        ...policy,
        targetVehicleCount: totalCount,
        completedVehicleCount: completedCount,
        progress,
      };
    });
  }, [missionPolicies, policyVehicles]);

  const filteredPolicies = useMemo(() => {
    return enrichedPolicies.filter(p => {
      const hitPeriod = (!periodFrom || p.createdAt >= periodFrom) && (!periodTo || p.createdAt <= periodTo);
      return hitPeriod;
    });
  }, [enrichedPolicies, periodFrom, periodTo]);
  
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredPolicies;
    return [...filteredPolicies].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredPolicies, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  const handleRegisterPolicy = () => {
    if (!newPolicyForm.content) return alert("미션 내용은 필수입니다.");
    
    const newPolicy = {
      id: `MP-${Date.now()}`,
      ...newPolicyForm,
      amount: Number(newPolicyForm.amount) || 0,
      createdAt: toYmd(new Date()),
    };
    
    setMissionPolicies([newPolicy, ...missionPolicies]);
    setNewPolicyForm({ content: "", amount: 0, requiresPhoto: true });
    setIsRegisterOpen(false);
    alert("새 미션 정책이 등록되었습니다.");
  };

  const handleUpdatePolicy = (updatedPolicy) => {
    setMissionPolicies(missionPolicies.map(p => p.id === updatedPolicy.id ? updatedPolicy : p));
    alert("정책이 수정되었습니다.");
  };

  const handleDeletePolicy = (policyId) => {
    if (!window.confirm("정말로 이 정책을 삭제하시겠습니까? 연관된 차량 할당 내역도 모두 삭제됩니다.")) return;
    setMissionPolicies(missionPolicies.filter(p => p.id !== policyId));
    setPolicyVehicles(policyVehicles.filter(v => v.policyId !== policyId));
    setSelectedPolicy(null);
    alert("정책이 삭제되었습니다.");
  };
  
  const handleAddVehicles = () => {
    if (!selectedPolicy || !bulkPlates.trim()) return;

    const plates = bulkPlates.split(/[\n,]+/).map(p => p.trim()).filter(Boolean);
    if (plates.length === 0) return;

    const newVehicleAssignments = plates.map(plate => ({
      id: `PV-${Date.now()}-${Math.random()}`,
      policyId: selectedPolicy.id,
      plate,
      status: 'pending',
      linkedOrderId: null,
      completedAt: null,
    }));

    setPolicyVehicles([...policyVehicles, ...newVehicleAssignments]);
    setBulkPlates("");
    alert(`${plates.length}대의 차량이 정책에 추가되었습니다.`);
  };

  const handleRemoveVehicle = (vehicleId) => {
    setPolicyVehicles(policyVehicles.filter(v => v.id !== vehicleId));
  };
  
  const policyColumns = [
    { key: "id", header: "ID" },
    { key: "content", header: "미션 내용" },
    { key: "amount", header: "금액", render: r => `${r.amount.toLocaleString()}원` },
    { key: "targetVehicleCount", header: "대상 차량수", render: r => `${r.targetVehicleCount}대` },
    { key: "completedVehicleCount", header: "수행 완료수", render: r => `${r.completedVehicleCount}대` },
    { key: "progress", header: "진행률(%)", render: r => `${Math.round(r.progress * 100)}%` },
    { key: "createdAt", header: "등록일시" },
  ];
  
  const vehicleColumns = [
    { key: "plate", header: "차량번호" },
    { key: "status", header: "수행 상태", render: r => <Badge tone={r.status === 'completed' ? 'ok' : 'warn'}>{r.status === 'completed' ? '완료' : '대기'}</Badge> },
    { key: "linkedOrderId", header: "연결된 오더", render: r => r.linkedOrderId ? <a href={`/?page=orders&orderId=${r.linkedOrderId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{r.linkedOrderId} <ExternalLink className="inline h-3 w-3" /></a> : "-" },
    { key: "completedAt", header: "완료일", render: r => r.completedAt ? toYmd(r.completedAt) : "-" },
    { key: "actions", header: "관리", render: r => r.status === 'pending' ? <Button variant="danger" size="sm" className="h-7 px-2" onClick={(e) => {e.stopPropagation(); handleRemoveVehicle(r.id);}}><Trash2 className="h-3 w-3" /></Button> : null },
  ];

  const assignedVehiclesForSelectedPolicy = useMemo(() => {
    return selectedPolicy ? policyVehicles.filter(v => v.policyId === selectedPolicy.id) : [];
  }, [selectedPolicy, policyVehicles]);


  // Effect to update selected policy data when the main list changes
  useEffect(() => {
    if (selectedPolicy) {
      const updatedPolicyData = enrichedPolicies.find(p => p.id === selectedPolicy.id);
      if (updatedPolicyData) {
        setSelectedPolicy(updatedPolicyData);
      } else {
        // If the policy was deleted, close the drawer
        setSelectedPolicy(null);
      }
    }
  }, [enrichedPolicies, selectedPolicy?.id]);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">미션 정책 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">정책 기반 미션 등록 및 대상 차량 관리</div>
        </div>
        <Button onClick={() => setIsRegisterOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 미션 정책 등록
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>검색 및 필터</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="md:col-span-2">
              <label htmlFor="periodFrom" className="block text-xs font-semibold text-[#6B778C] mb-1.5">등록일 시작</label>
              <Input id="periodFrom" type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="periodTo" className="block text-xs font-semibold text-[#6B778C] mb-1.5">등록일 종료</label>
              <Input id="periodTo" type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <DataTable columns={policyColumns} rows={currentData} rowKey={(r) => r.id} onRowClick={setSelectedPolicy} sortConfig={sortConfig} onSort={handleSort} />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>

      {/* Register Policy Drawer */}
      <Drawer open={isRegisterOpen} title="신규 미션 정책 등록" onClose={() => setIsRegisterOpen(false)} footer={<Button onClick={handleRegisterPolicy} className="w-full">등록하기</Button>}>
        <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B778C]">미션 내용 *</label>
              <Input value={newPolicyForm.content} onChange={e => setNewPolicyForm({...newPolicyForm, content: e.target.value})} placeholder="예: 스티커 부착" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B778C]">미션 금액</label>
              <Input type="number" min="0" value={newPolicyForm.amount} onChange={e => setNewPolicyForm({...newPolicyForm, amount: e.target.value})} placeholder="0" />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="reqPhoto" className="h-4 w-4 rounded border-gray-300 text-[#0052CC] focus:ring-[#0052CC]" checked={newPolicyForm.requiresPhoto} onChange={e => setNewPolicyForm({...newPolicyForm, requiresPhoto: e.target.checked})} />
              <label htmlFor="reqPhoto" className="text-sm text-[#172B4D]">수행 시 증빙 사진 필수</label>
            </div>
        </div>
      </Drawer>

      {/* Policy Detail Drawer */}
      <Drawer open={!!selectedPolicy} title={`정책 상세: ${selectedPolicy?.id}`} onClose={() => setSelectedPolicy(null)} footer={
          <div className="flex w-full justify-between gap-2">
            <Button variant="danger" onClick={() => handleDeletePolicy(selectedPolicy.id)}><Trash2 className="mr-2 h-4 w-4" /> 정책 삭제</Button>
            <Button variant="secondary" onClick={() => setSelectedPolicy(null)} className="w-full sm:w-auto">닫기</Button>
          </div>
      }>
        {selectedPolicy && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>정책 정보 수정</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#6B778C]">미션 내용 *</label>
                    <Input value={selectedPolicy.content} onChange={e => setSelectedPolicy({...selectedPolicy, content: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#6B778C]">미션 금액</label>
                    <Input type="number" min="0" value={selectedPolicy.amount} onChange={e => setSelectedPolicy({...selectedPolicy, amount: Number(e.target.value)})} />
                  </div>
                </div>
                 <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="reqPhotoEdit" className="h-4 w-4" checked={selectedPolicy.requiresPhoto} onChange={e => setSelectedPolicy({...selectedPolicy, requiresPhoto: e.target.checked})} />
                  <label htmlFor="reqPhotoEdit" className="text-sm text-[#172B4D]">수행 시 증빙 사진 필수</label>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleUpdatePolicy(selectedPolicy)}>정책 저장</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>대상 차량 관리</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#6B778C]">차량번호 대량 입력</label>
                  <textarea className="w-full rounded-lg border border-[#E2E8F0] p-2 text-sm min-h-[100px]" value={bulkPlates} onChange={e => setBulkPlates(e.target.value)} placeholder="차량번호를 콤마 또는 엔터로 구분하여 입력..."></textarea>
                  <Button onClick={handleAddVehicles}>차량 추가</Button>
                </div>
                <div className="mt-4">
                    <div className="text-sm text-[#6B778C] mb-2">할당된 차량 목록 ({assignedVehiclesForSelectedPolicy.length}대)</div>
                    <DataTable columns={vehicleColumns} rows={assignedVehiclesForSelectedPolicy} rowKey={r => r.id} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MissionsPage;
