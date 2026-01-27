import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Edit, X
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
function Select({ className, children, ...props }) {
  return <select className={cn("h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]", className)} {...props}>{children}</select>;
}
function Textarea({ className, ...props }) {
  return <textarea className={cn("w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]", className)} rows={4} {...props} />;
}
function Badge({ children, tone = "default", className }) {
  const tones = {
    default: "bg-slate-100 text-slate-800",
    // policy source
    zone: "bg-blue-100 text-blue-800",
    region2: "bg-slate-200 text-slate-700",
    region1: "bg-slate-100 text-slate-600",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", tones[tone], className)}>{children}</span>;
}

function usePagination(data, itemsPerPage = 15) {
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
const REGION1_POLICIES = {
  '서울': { cycleWashDays: 14, isLightWash: true },
  '경기': { cycleWashDays: 15, isLightWash: true },
  '부산': { cycleWashDays: 10, isLightWash: false },
  '기타': { cycleWashDays: 20, isLightWash: false },
};

const REGION2_POLICIES = {
  '강남구': { cycleWashDays: 10, isLightWash: true },
  '종로구': { isLightWash: false },
  '해운대구': {},
};

const RAW_ZONES = [
    { zoneId: 'Z-1001', zoneName: '강남역 1번존', zoneType: '현장세차존', region1: '서울', region2: '강남구', operationTime: '24시간', parkingType: '건물안', fullAddress: '서울특별시 강남구 강남대로 396', zoneNotes: '지하 3층 B구역 주차장 이용', policy: { cycleWashDays: 7 } },
    { zoneId: 'Z-1002', zoneName: '역삼역 2번존', zoneType: '현장세차존', region1: '서울', region2: '강남구', operationTime: '09:00~22:00', parkingType: '기계식', fullAddress: '서울특별시 강남구 테헤란로 152', zoneNotes: '기계식 주차장. SUV 입차 불가.', policy: { isLightWash: false } },
    { zoneId: 'Z-1003', zoneName: '판교역 3번존', zoneType: '주기세차존', region1: '경기', region2: '성남시', operationTime: '24시간', parkingType: '건물안', fullAddress: '경기도 성남시 분당구 판교역로 166', zoneNotes: '', policy: {} },
    { zoneId: 'Z-1004', zoneName: '해운대 1번존', zoneType: '현장세차존', region1: '부산', region2: '해운대구', operationTime: '10:00~20:00', parkingType: '노상', fullAddress: '부산광역시 해운대구 해운대해변로 266', zoneNotes: '해변가 공영주차장, 주말 혼잡', policy: { cycleWashDays: 5 } },
    { zoneId: 'Z-1005', zoneName: '수원시청역', zoneType: '현장세차 불가존', region1: '경기', region2: '수원시', operationTime: '24시간', parkingType: '건물외', fullAddress: '경기도 수원시 팔달구 효원로 241', zoneNotes: '주차장 협소, 세차 불가', policy: { cycleWashDays: 999 } },
    { zoneId: 'Z-1006', zoneName: '광화문 D타워', zoneType: '주기세차존', region1: '서울', region2: '종로구', operationTime: '08:00~23:00', parkingType: '건물안', fullAddress: '서울특별시 종로구 종로3길 17', zoneNotes: '방문객 주차 할인권 필요', policy: {} },
    { zoneId: 'Z-1007', zoneName: '대전 시청', zoneType: '현장세차존', region1: '대전', region2: '서구', operationTime: '24시간', parkingType: '건물외', fullAddress: '대전광역시 서구 둔산로 100', zoneNotes: '', policy: {} },
    { zoneId: 'Z-1008', zoneName: '동성로', zoneType: '현장세차 불가존', region1: '대구', region2: '중구', operationTime: '24시간', parkingType: '노상', fullAddress: '대구광역시 중구 동성로2길 81', zoneNotes: '유동인구 많아 세차 불가', policy: { cycleWashDays: 999 } },
    { zoneId: 'Z-1009', zoneName: '상무지구', zoneType: '현장세차존', region1: '광주', region2: '서구', operationTime: '24시간', parkingType: '건물안', fullAddress: '광주광역시 서구 상무중앙로 7', zoneNotes: '', policy: { cycleWashDays: 8, isLightWash: false } },
    { zoneId: 'Z-1010', zoneName: '인천공항 T1', zoneType: '주기세차존', region1: '인천', region2: '중구', operationTime: '24시간', parkingType: '건물안', fullAddress: '인천광역시 중구 공항로 272', zoneNotes: '장기주차장 P1 구역에서만 서비스 가능', policy: {} },
    { zoneId: 'Z-1011', zoneName: '서울역', zoneType: '현장세차존', region1: '서울', region2: '용산구', operationTime: '06:00~24:00', parkingType: '건물안', fullAddress: '서울특별시 용산구 한강대로 405', zoneNotes: '롯데마트 주차장 이용, 주말 혼잡도 높음', policy: {} },
];

function generateMockData() {
  const policyFields = ['cycleWashDays', 'isLightWash'];
  return RAW_ZONES.map(zone => {
    const r1Policy = REGION1_POLICIES[zone.region1] || REGION1_POLICIES['기타'];
    const r2Policy = REGION2_POLICIES[zone.region2] || {};
    
    const finalPolicy = {
      cycleWashDays: {},
      isLightWash: {},
    };

    policyFields.forEach(field => {
      if (zone.policy[field] !== undefined) {
        finalPolicy[field] = { value: zone.policy[field], source: 'Zone' };
      } else if (r2Policy[field] !== undefined) {
        finalPolicy[field] = { value: r2Policy[field], source: 'Region2' };
      } else {
        finalPolicy[field] = { value: r1Policy[field], source: 'Region1' };
      }
    });

    const hasZonePolicy = Object.values(finalPolicy).some(p => p.source === 'Zone');

    return { ...zone, ...finalPolicy, hasZonePolicy };
  });
}

const MOCK_ZONE_POLICIES = generateMockData();

const REGION_OPTIONS = {
    '서울': ['강남구', '종로구', '용산구'],
    '경기': ['성남시', '수원시'],
    '부산': ['해운대구'],
    '대전': ['서구'],
    '대구': ['중구'],
    '광주': ['서구'],
    '인천': ['중구'],
};

const ZONE_TYPE_OPTIONS = ['현장세차존', '주기세차존', '현장세차 불가존'];
const PARKING_TYPE_OPTIONS = ['노상', '건물외', '건물안', '기계식'];

// ============== MAIN PAGE COMPONENT ==============
export default function ZonePolicyPage() {
  const [policies, setPolicies] = useState(MOCK_ZONE_POLICIES);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  
  // Filters
  const [q, setQ] = useState("");
  const [searchField, setSearchField] = useState('zoneId');
  const [zoneTypeFilter, setZoneTypeFilter] = useState('');
  const [fRegion1, setFRegion1] = useState("");
  const [fRegion2, setFRegion2] = useState("");

  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'zoneId', direction: 'asc' });

  const filteredData = useMemo(() => {
    const searchTerms = q.trim().toLowerCase().split(/[\s,]+/).filter(Boolean);
    return policies.filter(p => {
      const matchQ = searchTerms.length === 0 || searchTerms.some(term => 
        String(p[searchField]).toLowerCase().includes(term)
      );
      const matchRegion1 = !fRegion1 || p.region1 === fRegion1;
      const matchRegion2 = !fRegion2 || p.region2 === fRegion2;
      const matchZoneType = !zoneTypeFilter || p.zoneType === zoneTypeFilter;
      return matchQ && matchRegion1 && matchRegion2 && matchZoneType;
    });
  }, [policies, q, searchField, fRegion1, fRegion2, zoneTypeFilter]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key]?.value ?? a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key]?.value ?? b[sortConfig.key] ?? "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);
  
  const region1Options = useMemo(() => [...new Set(RAW_ZONES.map(p => p.region1))], []);
  const region2Options = useMemo(() => fRegion1 ? REGION_OPTIONS[fRegion1] || [] : [], [fRegion1]);

  useEffect(() => {
    setFRegion2(""); // Reset region2 filter when region1 changes
  }, [fRegion1]);

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const resetFilters = () => {
    setQ("");
    setFRegion1("");
    setFRegion2("");
    setSearchField('zoneId');
    setZoneTypeFilter('');
  };
  
  const handleSave = (policyToSave) => {
    setPolicies(prev => prev.map(p => p.zoneId === policyToSave.zoneId ? policyToSave : p));
    setSelectedPolicy(null);
  };
  
  const handleBulkSave = (bulkData) => {
    const filteredIds = new Set(filteredData.map(p => p.zoneId));
    
    setPolicies(currentPolicies => currentPolicies.map(p => {
        if (!filteredIds.has(p.zoneId)) {
            return p;
        }

        const updatedPolicy = { ...p };
        
        if (bulkData.cycleWashDays !== null) {
            updatedPolicy.cycleWashDays = { value: bulkData.cycleWashDays, source: 'Zone' };
        }
        if (bulkData.isLightWash !== null) {
            updatedPolicy.isLightWash = { value: bulkData.isLightWash, source: 'Zone' };
        }
        
        return updatedPolicy;
    }));

    setIsBulkEditModalOpen(false);
  };

  const columns = [
    { key: 'zoneId', header: 'Zone ID' },
    { key: 'zoneName', header: '존 이름' },
    { key: 'zoneType', header: '존 유형' },
    { key: 'cycleWashDays', header: '주기세차(일)', render: r => r.cycleWashDays.value },
    { key: 'isLightWash', header: '라이트세차', render: r => r.isLightWash.value ? 'Y' : 'N' },
    { key: 'hasZonePolicy', header: '개별 정책', render: r => r.hasZonePolicy ? 'O' : 'X' },
  ];

  const isFiltered = filteredData.length > 0 && policies.length > filteredData.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">존 정책 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">존별 세차 정책(주기/라이트) 및 운영 유형을 관리합니다.</div>
        </div>
        <Button onClick={() => setIsBulkEditModalOpen(true)} disabled={!isFiltered}>
            <Edit className="mr-2 h-4 w-4" /> 필터된 데이터 일괄 수정
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Group */}
            <div className="flex gap-1 w-full sm:w-auto sm:flex-1 sm:min-w-[320px]">
              <Select value={searchField} onChange={e => setSearchField(e.target.value)} className="!w-32 shrink-0">
                  <option value="zoneId">Zone ID</option>
                  <option value="zoneName">존 이름</option>
              </Select>
              <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
                  <Input value={q} onChange={e => setQ(e.target.value)} placeholder="검색어 입력 (콤마/공백으로 구분)" className="pl-9" />
              </div>
            </div>

            {/* Other Filters */}
            <Select value={zoneTypeFilter} onChange={e => setZoneTypeFilter(e.target.value)} className="w-full sm:w-40">
              <option value="">존 유형 전체</option>
              {ZONE_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </Select>
            <Select value={fRegion1} onChange={e => setFRegion1(e.target.value)} className="w-full sm:w-40">
              <option value="">Region 1 전체</option>
              {region1Options.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
            <Select value={fRegion2} onChange={e => setFRegion2(e.target.value)} disabled={!fRegion1} className="w-full sm:w-40">
              <option value="">Region 2 전체</option>
              {region2Options.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
            
            {/* Reset Button */}
            <div className="w-full sm:w-auto">
              <Button variant="secondary" onClick={resetFilters} className="w-full sm:w-auto">필터 초기화</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-[#6B778C]">
          {isFiltered ? `필터된 결과 ${filteredData.length.toLocaleString()}건 / ` : ''}
          전체 <b className="text-[#172B4D]">{policies.length.toLocaleString()}</b>건
        </div>
      </div>
      <DataTable 
        columns={columns} 
        rows={currentData} 
        rowKey={r => r.zoneId} 
        onRowClick={setSelectedPolicy} 
        sortConfig={sortConfig} 
        onSort={handleSort} 
      />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      
      {selectedPolicy && (
        <ZonePolicyDrawer
          policy={selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
          onSave={handleSave}
        />
      )}
      <BulkEditModal 
        open={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        onSave={handleBulkSave}
        filteredCount={filteredData.length}
      />
    </div>
  );
}

function ZonePolicyDrawer({ policy, onClose, onSave }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(JSON.parse(JSON.stringify(policy)));

    useEffect(() => {
        setFormData(JSON.parse(JSON.stringify(policy)));
        setIsEditing(false);
    }, [policy]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        const policyFields = ['cycleWashDays', 'isLightWash'];

        if (policyFields.includes(name)) {
          let processedValue = value;
           if (name === 'isLightWash') {
              processedValue = value === 'true';
          } else if (type === 'number') {
              processedValue = value === '' ? '' : Number(value);
          }
          setFormData(prev => ({
            ...prev,
            [name]: { ...prev[name], value: processedValue }
          }));
        } else {
           setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = () => {
        const newFormData = { ...formData };
        const policyFields = ['cycleWashDays', 'isLightWash'];
        let hasZonePolicy = false;

        policyFields.forEach(field => {
          if (newFormData[field].value !== policy[field].value) {
            newFormData[field].source = 'Zone';
          }
          if (newFormData[field].source === 'Zone') {
            hasZonePolicy = true;
          }
        });
        newFormData.hasZonePolicy = hasZonePolicy;

        onSave(newFormData);
        alert("존 정보가 성공적으로 업데이트되었습니다.");
        setIsEditing(false);
    }
    
    const handleCancel = () => {
        setFormData(JSON.parse(JSON.stringify(policy)));
        setIsEditing(false);
    }
    
    const renderPolicyField = (field, unit = '') => (
      <div className="flex items-center justify-between">
        <span>{String(formData[field].value)}{unit}</span>
        <Badge tone={formData[field].source.toLowerCase()} className="text-xs">{formData[field].source}</Badge>
      </div>
    );

    return (
        <Drawer 
            open={!!policy} 
            title={`정책 상세: ${policy.zoneName}`} 
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
              <CardHeader><CardTitle>기본 정보</CardTitle></CardHeader>
              <CardContent>
                <Field label="Zone ID">{formData.zoneId}</Field>
                <Field label="존 이름" isEditing={isEditing}>
                  {isEditing ? (<Input name="zoneName" value={formData.zoneName} onChange={handleInputChange} />) : formData.zoneName}
                </Field>
                <Field label="Region">{formData.region1} &gt; {formData.region2}</Field>
                <Field label="존 유형" isEditing={isEditing}>
                  {isEditing ? (
                      <Select name="zoneType" value={formData.zoneType} onChange={handleInputChange}>
                          {ZONE_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </Select>
                  ) : formData.zoneType}
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>운영 및 위치 정보</CardTitle></CardHeader>
              <CardContent>
                  <Field label="운영시간" isEditing={isEditing}>
                    {isEditing ? (<Input name="operationTime" value={formData.operationTime} onChange={handleInputChange} />) : formData.operationTime}
                  </Field>
                  <Field label="주차유형" isEditing={isEditing}>
                    {isEditing ? (
                      <Select name="parkingType" value={formData.parkingType} onChange={handleInputChange}>
                        {PARKING_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </Select>
                    ) : formData.parkingType}
                  </Field>
                  <Field label="상세 주소" isEditing={isEditing}>
                     {isEditing ? (<Input name="fullAddress" value={formData.fullAddress} onChange={handleInputChange} />) : formData.fullAddress}
                  </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>정책 정보</CardTitle></CardHeader>
              <CardContent>
                  <Field label="주기세차 경과일" isEditing={isEditing}>
                       {isEditing ? (
                          <Input type="number" name="cycleWashDays" value={formData.cycleWashDays.value} onChange={handleInputChange} />
                      ) : renderPolicyField('cycleWashDays', '일')}
                  </Field>
                  <Field label="라이트세차" isEditing={isEditing}>
                       {isEditing ? (
                          <Select name="isLightWash" value={String(formData.isLightWash.value)} onChange={handleInputChange}>
                              <option value="true">Y</option>
                              <option value="false">N</option>
                          </Select>
                      ) : renderPolicyField('isLightWash')}
                  </Field>
              </CardContent>
            </Card>

             <Card>
              <CardHeader><CardTitle>존 특이사항</CardTitle></CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea name="zoneNotes" value={formData.zoneNotes} onChange={handleInputChange} placeholder="존 관련 특이사항을 입력하세요."/>
                ) : (
                  <div className="text-sm whitespace-pre-wrap min-h-[4rem]">
                    {formData.zoneNotes || <span className="text-gray-400">특이사항 없음</span>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Drawer>
    );
}

function BulkEditModal({ open, onClose, onSave, filteredCount }) {
  const [cycleWashDays, setCycleWashDays] = useState("");
  const [isLightWash, setIsLightWash] = useState("");

  useEffect(() => {
    if (open) {
      setCycleWashDays("");
      setIsLightWash("");
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    onSave({
        cycleWashDays: cycleWashDays === '' ? null : Number(cycleWashDays),
        isLightWash: isLightWash === '' ? null : isLightWash === 'true',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <Card className="z-10 w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>필터된 데이터 일괄 수정 ({filteredCount}건)</CardTitle>
            <button onClick={onClose}><X className="h-5 w-5 text-gray-500" /></button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
                수정을 원하는 항목만 입력하거나 선택하세요. 빈 값으로 두면 해당 항목은 변경되지 않습니다.
            </p>
            <Field label="주기세차 (경과일)">
                <Input 
                    type="number" 
                    value={cycleWashDays}
                    onChange={e => setCycleWashDays(e.target.value)}
                    placeholder="숫자 입력"
                />
            </Field>
            <Field label="라이트세차 (발행유무)">
                <Select value={isLightWash} onChange={e => setIsLightWash(e.target.value)}>
                    <option value="">선택 안함</option>
                    <option value="true">Y (발행)</option>
                    <option value="false">N (미발행)</option>
                </Select>
            </Field>
        </CardContent>
        <div className="flex h-[72px] items-center justify-end gap-2 border-t border-[#DFE1E6] px-5 bg-[#F4F5F7] rounded-b-xl">
            <Button variant="secondary" onClick={onClose}>취소</Button>
            <Button onClick={handleSave}>저장</Button>
        </div>
      </Card>
    </div>
  );
}