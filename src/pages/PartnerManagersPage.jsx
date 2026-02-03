import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Trash2, Plus, RefreshCw, Edit
} from 'lucide-react';

/**
 * Utility & UI Components
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
function CardDescription({ className, children }) {
  return <div className={cn("mt-1 text-xs text-[#6B778C]", className)}>{children}</div>;
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

export default function PartnerManagersPage() {
  const [managers, setManagers] = useState([
    { id: 'PM-001', partner: '강남모빌리티', role: '세차 담당', name: '김담당', phone: '010-1234-5678', email: 'kim@gangnammob.com' },
    { id: 'PM-002', partner: '수원카케어', role: '행정 담당', name: '이담당', phone: '010-9876-5432', email: 'lee@suwoncare.com' },
    { id: 'PM-003', partner: '강남모빌리티', role: '세차 담당', name: '박수행', phone: '010-1111-2222', email: 'park@gangnammob.com' },
    { id: 'PM-004', partner: '부산클린', role: '기타', name: '최매니저', phone: '010-3333-4444', email: 'choi@busanclean.com' },
  ]);

  const [editingManager, setEditingManager] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [fPartner, setFPartner] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const partners = useMemo(() => Array.from(new Set(managers.map(m => m.partner))), [managers]);

  const filteredData = useMemo(() => {
    return managers.filter(m => {
      const matchPartner = !fPartner || m.partner === fPartner;
      return matchPartner;
    });
  }, [managers, fPartner]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleOpenDrawer = (manager = null) => {
    setEditingManager(manager);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingManager(null);
  };

  const handleSave = (managerData) => {
    if (editingManager && editingManager.id) {
      // Update
      setManagers(prev => prev.map(m => m.id === managerData.id ? managerData : m));
    } else {
      // Create
      const newManager = { ...managerData, id: `PM-${Date.now()}` };
      setManagers(prev => [newManager, ...prev]);
    }
    handleCloseDrawer();
  };

  const handleDelete = (managerId) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setManagers(prev => prev.filter(m => m.id !== managerId));
      handleCloseDrawer();
    }
  };

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  const columns = [
    { key: 'id', header: '담당자 ID', align: 'center' },
    { key: 'partner', header: '파트너 명' },
    { key: 'role', header: '직무' },
    { key: 'name', header: '이름' },
    { key: 'phone', header: '휴대전화' },
    { key: 'email', header: '이메일' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-base font-bold text-[#172B4D]">파트너 담당자 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">파트너 담당자 정보를 등록하고 수정, 삭제할 수 있습니다.</div>
        </div>
        <Button onClick={() => handleOpenDrawer()}>
          <Plus className="mr-2 h-4 w-4" /> 담당자 등록
        </Button>
      </div>

      <Card>
        <CardContent className="flex items-center gap-2">
          <div className="w-full md:w-64">
            <Select value={fPartner} onChange={e => setFPartner(e.target.value)}>
              <option value="">소속 파트너사 전체</option>
              {partners.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>


      <DataTable columns={columns} rows={currentData} rowKey={r => r.id} onRowClick={handleOpenDrawer} sortConfig={sortConfig} onSort={handleSort} />
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

      <ManagerFormDrawer
        isOpen={isDrawerOpen}
        manager={editingManager}
        onClose={handleCloseDrawer}
        onSave={handleSave}
        onDelete={handleDelete}
        allPartners={partners}
      />
    </div>
  );
}

function ManagerFormDrawer({ isOpen, manager, onClose, onSave, onDelete, allPartners }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (manager) {
      setFormData(manager);
    } else {
      // Reset for new entry
      setFormData({ partner: '', role: '세차 담당', name: '', email: '', phone: '' });
    }
  }, [manager, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.partner || !formData.name || !formData.email) {
      alert("파트너, 이름, 이메일은 필수 항목입니다.");
      return;
    }
    onSave(formData);
  };

  const isEditing = !!manager?.id;

  const handleDeleteClick = () => {
    if (isEditing) {
      onDelete(manager.id);
    }
  };

  return (
    <Drawer
      open={isOpen}
      title={isEditing ? "담당자 수정" : "담당자 등록"}
      onClose={onClose}
      footer={
        <>
          {isEditing && (
            <Button variant="danger" onClick={handleDeleteClick} className="mr-auto">
              <Trash2 className="mr-2 h-4 w-4" /> 삭제
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "수정하기" : "등록하기"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>파트너 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B778C]">파트너 <span className="text-rose-500 ml-1">*</span></label>
              <Select name="partner" value={formData.partner || ''} onChange={handleInputChange}>
                <option value="" disabled>파트너사를 선택하세요</option>
                {allPartners.map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B778C]">직무</label>
              <Select name="role" value={formData.role || '세차 담당'} onChange={handleInputChange}>
                <option value="세차 담당">세차 담당</option>
                <option value="행정 담당">행정 담당</option>
                <option value="기타">기타</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>계정 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B778C]">이름 <span className="text-rose-500 ml-1">*</span></label>
              <Input name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="이름 입력" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B778C]">이메일 <span className="text-rose-500 ml-1">*</span></label>
              <Input name="email" type="email" value={formData.email || ''} onChange={handleInputChange} placeholder="이메일 입력" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B778C]">휴대전화</label>
              <Input name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="휴대전화 입력" />
            </div>
          </CardContent>
        </Card>
      </div>
    </Drawer>
  );
}