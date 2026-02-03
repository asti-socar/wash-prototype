import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, X, MapPin
} from 'lucide-react';
import zoneAssignmentsData from '../mocks/zoneAssignments.json';

// ============== UTILITY & UI COMPONENTS ==============
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
function Select({ className, children, ...props }) {
  return <select className={cn("h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]", className)} {...props}>{children}</select>;
}
function Badge({ children, tone = "default", className }) {
  const tones = {
    default: "bg-slate-100 text-slate-800",
    warn: "bg-amber-100 text-amber-800",
    ok: "bg-emerald-100 text-emerald-800",
    info: "bg-blue-100 text-blue-800",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", tones[tone], className)}>{children}</span>;
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
              <th key={c.key} className={cn("whitespace-nowrap px-4 py-3.5 text-[13px] font-semibold text-[#475569] cursor-pointer hover:bg-slate-100", c.align === 'center' && 'text-center')} onClick={() => c.sortable !== false && onSort && onSort(c.key)}>
                <div className={cn("flex items-center gap-1", c.align === 'center' && 'justify-center')}>
                  {c.header}
                  {c.sortable !== false && sortConfig?.key === c.key && (
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

function Drawer({ open, title, onClose, children, footer }) {
  const [width, setWidth] = useState(500);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [open]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 400 && newWidth <= 900) setWidth(newWidth);
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

function Field({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="w-28 shrink-0 text-xs font-semibold text-[#6B778C]">{label}</div>
      <div className="min-w-0 flex-1 text-sm text-[#172B4D]">{value}</div>
    </div>
  );
}

// ============== MOCK PARTNERS ==============
const MOCK_PARTNERS = [
  { partnerId: 'P-001', partnerName: 'A파트너' },
  { partnerId: 'P-002', partnerName: 'B파트너' },
  { partnerId: 'P-003', partnerName: 'C파트너' },
  { partnerId: 'P-004', partnerName: 'D파트너' },
  { partnerId: 'P-005', partnerName: 'E파트너' },
  { partnerId: 'P-006', partnerName: 'F파트너' },
  { partnerId: 'P-007', partnerName: 'G파트너' },
  { partnerId: 'P-008', partnerName: 'H파트너' },
  { partnerId: 'P-009', partnerName: 'I파트너' },
  { partnerId: 'P-010', partnerName: 'J파트너' },
  { partnerId: 'P-011', partnerName: 'K파트너' },
  { partnerId: 'P-012', partnerName: 'L파트너' },
  { partnerId: 'P-013', partnerName: 'M파트너' },
  { partnerId: 'P-014', partnerName: 'N파트너' },
];

const partnerMap = new Map(MOCK_PARTNERS.map(p => [p.partnerId, p.partnerName]));

// ============== MAIN PAGE COMPONENT ==============
export default function ZoneAssignmentPage() {
  const [zones, setZones] = useState(zoneAssignmentsData);
  const [selectedZone, setSelectedZone] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [region1Filter, setRegion1Filter] = useState("");
  const [region2Filter, setRegion2Filter] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("");

  const [sortConfig, setSortConfig] = useState({ key: 'zoneId', direction: 'desc' });

  // Get unique region1 values
  const region1Options = useMemo(() => {
    const unique = [...new Set(zones.map(z => z.region1))];
    return unique.sort();
  }, [zones]);

  // Get region2 values based on selected region1
  const region2Options = useMemo(() => {
    const filtered = region1Filter ? zones.filter(z => z.region1 === region1Filter) : zones;
    const unique = [...new Set(filtered.map(z => z.region2))];
    return unique.sort();
  }, [zones, region1Filter]);

  // Reset region2 when region1 changes
  useEffect(() => {
    setRegion2Filter("");
  }, [region1Filter]);

  const filteredData = useMemo(() => {
    return zones.filter(z => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchSearch = z.zoneId.toLowerCase().includes(q) || z.zoneName.toLowerCase().includes(q);
        if (!matchSearch) return false;
      }
      // Region1 filter
      if (region1Filter && z.region1 !== region1Filter) return false;
      // Region2 filter
      if (region2Filter && z.region2 !== region2Filter) return false;
      // Assignment filter
      if (assignmentFilter === "배정" && !z.assignedPartnerId) return false;
      if (assignmentFilter === "미배정" && z.assignedPartnerId) return false;
      return true;
    });
  }, [zones, searchQuery, region1Filter, region2Filter, assignmentFilter]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle partner name sorting
      if (sortConfig.key === 'assignedPartnerId') {
        aVal = aVal ? partnerMap.get(aVal) || '' : 'zzz'; // Put unassigned at end
        bVal = bVal ? partnerMap.get(bVal) || '' : 'zzz';
      }

      aVal = aVal || "";
      bVal = bVal || "";

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSaveAssignment = (zoneId, partnerId) => {
    setZones(prev => prev.map(z => z.zoneId === zoneId ? { ...z, assignedPartnerId: partnerId || null } : z));
    setSelectedZone(null);
  };

  // Stats
  const stats = useMemo(() => {
    const total = zones.length;
    const assigned = zones.filter(z => z.assignedPartnerId).length;
    const unassigned = total - assigned;
    return { total, assigned, unassigned };
  }, [zones]);

  const columns = [
    { key: 'zoneId', header: '존 ID' },
    { key: 'region1', header: '지역1' },
    { key: 'region2', header: '지역2' },
    { key: 'zoneName', header: '존 이름' },
    { key: 'zoneType', header: '존 유형' },
    { key: 'vehicleCount', header: '차량 대수', align: 'center', render: r => `${r.vehicleCount}대` },
    { key: 'assignedPartnerId', header: '배정 파트너', render: r =>
      r.assignedPartnerId
        ? <span className="text-[#172B4D]">{partnerMap.get(r.assignedPartnerId)}</span>
        : <Badge tone="warn">미배정</Badge>
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">존 배정 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">존별 파트너 배정 현황을 관리합니다.</div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[#6B778C]">전체</span>
            <span className="font-semibold text-[#172B4D]">{stats.total}개</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#6B778C]">배정</span>
            <span className="font-semibold text-emerald-600">{stats.assigned}개</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#6B778C]">미배정</span>
            <span className="font-semibold text-amber-600">{stats.unassigned}개</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#6B778C]">지역1</span>
          <select
            value={region1Filter}
            onChange={(e) => setRegion1Filter(e.target.value)}
            className="h-9 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
          >
            <option value="">전체</option>
            {region1Options.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", region1Filter ? "text-[#6B778C]" : "text-[#94A3B8]")}>지역2</span>
          <select
            value={region2Filter}
            onChange={(e) => setRegion2Filter(e.target.value)}
            disabled={!region1Filter}
            className={cn(
              "h-9 rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]",
              region1Filter ? "bg-white text-[#172B4D]" : "bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed"
            )}
          >
            <option value="">전체</option>
            {region2Options.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#6B778C]">배정 상태</span>
          <select
            value={assignmentFilter}
            onChange={(e) => setAssignmentFilter(e.target.value)}
            className="h-9 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
          >
            <option value="">전체</option>
            <option value="배정">배정</option>
            <option value="미배정">미배정</option>
          </select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="존 ID 또는 이름 검색..."
              className="h-9 w-64 rounded-lg border border-[#E2E8F0] bg-white pl-9 pr-3 text-sm text-[#172B4D] outline-none placeholder:text-[#94A3B8] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
            />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={currentData}
        rowKey={(r) => r.zoneId}
        onRowClick={setSelectedZone}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <div className="flex items-center gap-2 text-sm text-[#6B778C]">
          <span>
            {totalItems > 0
              ? `${(currentPage - 1) * 40 + 1} - ${Math.min(currentPage * 40, totalItems)}`
              : "0"} / {totalItems}건
          </span>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Detail Drawer */}
      {selectedZone && (
        <ZoneDetailDrawer
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
          onSave={handleSaveAssignment}
        />
      )}
    </div>
  );
}

function ZoneDetailDrawer({ zone, onClose, onSave }) {
  const [selectedPartnerId, setSelectedPartnerId] = useState(zone.assignedPartnerId || "");

  const handleSave = () => {
    onSave(zone.zoneId, selectedPartnerId || null);
  };

  const hasChanges = selectedPartnerId !== (zone.assignedPartnerId || "");

  return (
    <Drawer
      open={!!zone}
      title={`존 배정 상세 - ${zone.zoneId}`}
      onClose={onClose}
      footer={
        <div className="flex w-full flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">닫기</Button>
          <Button onClick={handleSave} disabled={!hasChanges} className="w-full sm:w-auto">저장</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Zone Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              존 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Field label="존 ID" value={zone.zoneId} />
            <Field label="존 이름" value={zone.zoneName} />
            <Field label="지역" value={`${zone.region1} / ${zone.region2}`} />
            <Field label="전체 주소" value={zone.fullAddress} />
            <Field label="존 유형" value={zone.zoneType} />
          </CardContent>
        </Card>

        {/* Vehicle Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>차량 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <Field label="차량 대수" value={`${zone.vehicleCount}대`} />
          </CardContent>
        </Card>

        {/* Partner Assignment Section */}
        <Card>
          <CardHeader>
            <CardTitle>파트너 배정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field
              label="현재 배정"
              value={
                zone.assignedPartnerId
                  ? <span className="font-medium">{partnerMap.get(zone.assignedPartnerId)}</span>
                  : <Badge tone="warn">미배정</Badge>
              }
            />
            <div className="flex items-start justify-between gap-3 py-2">
              <div className="w-28 shrink-0 text-xs font-semibold text-[#6B778C]">파트너 변경</div>
              <div className="min-w-0 flex-1">
                <Select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                >
                  <option value="">미배정</option>
                  {MOCK_PARTNERS.map(p => (
                    <option key={p.partnerId} value={p.partnerId}>{p.partnerName}</option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Drawer>
  );
}
