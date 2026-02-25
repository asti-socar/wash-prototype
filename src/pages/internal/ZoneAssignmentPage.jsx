import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, MapPin, Pencil, Trash2,
  Upload, Download, AlertCircle, CheckCircle2, FileSpreadsheet
} from 'lucide-react';
import { cn, Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Badge, Chip, FilterPanel, Drawer, Field, usePagination, Pagination, DataTable } from '../../components/ui';
import zoneAssignmentsData from '../../mocks/zoneAssignments.json';

// ============== MOCK PARTNERS ==============
const ONSITE_PARTNERS = [
  { partnerId: 'P-001', partnerName: '강남모빌리티' },
  { partnerId: 'P-003', partnerName: '미션핸들코리아' },
];

const INSHOP_PARTNERS = [
  { partnerId: 'P-002', partnerName: '수원카케어' },
];

const ALL_PARTNERS = [...ONSITE_PARTNERS, ...INSHOP_PARTNERS];
const partnerMap = new Map(ALL_PARTNERS.map(p => [p.partnerId, p.partnerName]));
const onsitePartnerIdSet = new Set(ONSITE_PARTNERS.map(p => p.partnerId));
const inshopPartnerIdSet = new Set(INSHOP_PARTNERS.map(p => p.partnerId));

// ============== MOCK WORKERS (수행원 조회 참고) ==============
// 현장 파트너 P-001(강남모빌리티) 소속 수행원 — P-001 배정 존 전체 커버
const MOCK_WORKERS = [
  { id: 'W-001', name: '최수행', partnerId: 'P-001', penalty: 1, zoneIds: ['Z-1001', 'Z-1002', 'Z-1003', 'Z-1004', 'Z-1005', 'Z-1008'] },
  { id: 'W-002', name: '강수행', partnerId: 'P-001', penalty: 0, zoneIds: ['Z-1009', 'Z-1012', 'Z-1013', 'Z-1018', 'Z-1019', 'Z-1020'] },
  { id: 'W-003', name: '한수행', partnerId: 'P-001', penalty: 0, zoneIds: ['Z-1024', 'Z-1025', 'Z-1026', 'Z-1031', 'Z-1032'] },
  { id: 'W-004', name: '오수행', partnerId: 'P-001', penalty: 2, zoneIds: ['Z-1033', 'Z-1034', 'Z-1038', 'Z-1039', 'Z-1040', 'Z-1041'] },
  { id: 'W-005', name: '박수행', partnerId: 'P-001', penalty: 1, zoneIds: ['Z-1044', 'Z-1045', 'Z-1048', 'Z-1049'] },
  // 현장 파트너 P-003(미션핸들코리아) 소속 수행원 — P-003 배정 존 전체 커버
  { id: 'W-006', name: '이수행', partnerId: 'P-003', penalty: 5, zoneIds: ['Z-1006', 'Z-1007', 'Z-1010', 'Z-1011', 'Z-1014', 'Z-1015'] },
  { id: 'W-007', name: '김수행', partnerId: 'P-003', penalty: 0, zoneIds: ['Z-1016', 'Z-1017', 'Z-1021', 'Z-1022', 'Z-1023'] },
  { id: 'W-008', name: '정수행', partnerId: 'P-003', penalty: 1, zoneIds: ['Z-1027', 'Z-1028', 'Z-1029', 'Z-1030', 'Z-1035', 'Z-1036'] },
  { id: 'W-009', name: '조수행', partnerId: 'P-003', penalty: 0, zoneIds: ['Z-1037', 'Z-1042', 'Z-1043', 'Z-1046', 'Z-1047', 'Z-1050'] },
  // 입고 파트너 P-002(수원카케어) 소속 수행원 — 전체 존 커버
  { id: 'W-010', name: '윤수행', partnerId: 'P-002', penalty: 2, zoneIds: ['Z-1001', 'Z-1002', 'Z-1003', 'Z-1004', 'Z-1005', 'Z-1006', 'Z-1007', 'Z-1008', 'Z-1009', 'Z-1010'] },
  { id: 'W-011', name: '송수행', partnerId: 'P-002', penalty: 0, zoneIds: ['Z-1011', 'Z-1012', 'Z-1013', 'Z-1014', 'Z-1015', 'Z-1016', 'Z-1017', 'Z-1018', 'Z-1019', 'Z-1020'] },
  { id: 'W-012', name: '임수행', partnerId: 'P-002', penalty: 1, zoneIds: ['Z-1021', 'Z-1022', 'Z-1023', 'Z-1024', 'Z-1025', 'Z-1026', 'Z-1027', 'Z-1028', 'Z-1029', 'Z-1030'] },
  { id: 'W-013', name: '양수행', partnerId: 'P-002', penalty: 0, zoneIds: ['Z-1031', 'Z-1032', 'Z-1033', 'Z-1034', 'Z-1035', 'Z-1036', 'Z-1037', 'Z-1038', 'Z-1039', 'Z-1040'] },
  { id: 'W-014', name: '배수행', partnerId: 'P-002', penalty: 3, zoneIds: ['Z-1041', 'Z-1042', 'Z-1043', 'Z-1044', 'Z-1045', 'Z-1046', 'Z-1047', 'Z-1048', 'Z-1049', 'Z-1050'] },
];

function ZASaveConfirmModal({ open, onClose, onConfirm, title, changes }) {
  if (!open || !changes) return null;
  const entries = Object.entries(changes);
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <Card className="relative z-[1101] w-full max-w-sm">
        <CardHeader><CardTitle>수정 내용 확인</CardTitle>
          {title && <p className="text-sm text-[#6B778C] mt-1">{title}</p>}
        </CardHeader>
        <CardContent className="space-y-2">
          {entries.map(([field, { from, to }]) => (
            <div key={field} className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs font-semibold text-[#6B778C] mb-1">{field}</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#6B778C]">{from || '없음'}</span>
                <span className="text-[#6B778C]">→</span>
                <span className="font-semibold text-[#0052CC]">{to || '없음'}</span>
              </div>
            </div>
          ))}
        </CardContent>
        <div className="flex items-center justify-end gap-2 border-t border-[#DFE1E6] px-5 py-4 bg-[#F4F5F7] rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button onClick={onConfirm}>확인</Button>
        </div>
      </Card>
    </div>
  );
}

function ZADeleteConfirmModal({ open, onClose, onConfirm, zone }) {
  const [deleteType, setDeleteType] = useState('all');
  if (!open || !zone) return null;

  const hasOnsite = !!zone.assignedOnsitePartnerId;
  const hasInshop = !!zone.assignedInshopPartnerId;
  const hasBoth = hasOnsite && hasInshop;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <Card className="relative z-[1101] w-full max-w-sm">
        <CardHeader><CardTitle>배정 해제 확인</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[#172B4D]">
            <b>{zone.zoneName}</b>({zone.zoneId})의 파트너 배정을 해제하시겠습니까?
          </p>
          {hasBoth && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#6B778C]">해제 범위</label>
              <div className="space-y-1.5">
                {[
                  { value: 'all', label: '전체 해제', desc: '현장 + 입고 파트너 모두 해제' },
                  { value: 'onsite', label: '현장 파트너만 해제', desc: partnerMap.get(zone.assignedOnsitePartnerId) },
                  { value: 'inshop', label: '입고 파트너만 해제', desc: partnerMap.get(zone.assignedInshopPartnerId) },
                ].map(opt => (
                  <label key={opt.value} className={cn("flex items-start gap-2 rounded-lg border p-2.5 cursor-pointer transition-colors", deleteType === opt.value ? "border-[#0052CC] bg-blue-50" : "border-[#E2E8F0] hover:bg-slate-50")}>
                    <input type="radio" name="deleteType" value={opt.value} checked={deleteType === opt.value} onChange={() => setDeleteType(opt.value)} className="mt-0.5 accent-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-[#172B4D]">{opt.label}</div>
                      <div className="text-xs text-[#6B778C]">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
          {!hasBoth && (
            <p className="text-xs text-[#6B778C]">
              {hasOnsite ? `현장 파트너 (${partnerMap.get(zone.assignedOnsitePartnerId)})` : `입고 파트너 (${partnerMap.get(zone.assignedInshopPartnerId)})`} 배정이 해제됩니다.
            </p>
          )}
        </CardContent>
        <div className="flex items-center justify-end gap-2 border-t border-[#DFE1E6] px-5 py-4 bg-[#F4F5F7] rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => onConfirm(hasBoth ? deleteType : (hasOnsite ? 'onsite' : 'inshop'))}>해제</Button>
        </div>
      </Card>
    </div>
  );
}

// ============== MAIN PAGE COMPONENT ==============
export default function ZoneAssignmentPage() {
  const [zones, setZones] = useState(zoneAssignmentsData);
  const [workers, setWorkers] = useState(() => MOCK_WORKERS.map(w => ({ ...w })));
  const [selectedZone, setSelectedZone] = useState(null);
  const [drawerMode, setDrawerMode] = useState('view');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkAssignmentOpen, setBulkAssignmentOpen] = useState(false);

  // Filters
  const [searchField, setSearchField] = useState("zoneId");
  const [searchQuery, setSearchQuery] = useState("");
  const [region1Filter, setRegion1Filter] = useState("");
  const [region2Filter, setRegion2Filter] = useState("");
  const [fOnsitePartner, setFOnsitePartner] = useState("");
  const [fInshopPartner, setFInshopPartner] = useState("");

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
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const targetVal = String(z[searchField] || "").toLowerCase();
        if (!targetVal.includes(q)) return false;
      }
      if (region1Filter && z.region1 !== region1Filter) return false;
      if (region2Filter && z.region2 !== region2Filter) return false;
      // 현장 파트너 필터
      if (fOnsitePartner === "미배정" && z.assignedOnsitePartnerId) return false;
      if (fOnsitePartner && fOnsitePartner !== "미배정") {
        const name = z.assignedOnsitePartnerId ? partnerMap.get(z.assignedOnsitePartnerId) : null;
        if (name !== fOnsitePartner) return false;
      }
      // 입고 파트너 필터
      if (fInshopPartner === "미배정" && z.assignedInshopPartnerId) return false;
      if (fInshopPartner && fInshopPartner !== "미배정") {
        const name = z.assignedInshopPartnerId ? partnerMap.get(z.assignedInshopPartnerId) : null;
        if (name !== fInshopPartner) return false;
      }
      return true;
    });
  }, [zones, searchField, searchQuery, region1Filter, region2Filter, fOnsitePartner, fInshopPartner]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'assignedOnsitePartnerId' || sortConfig.key === 'assignedInshopPartnerId') {
        aVal = aVal ? partnerMap.get(aVal) || '' : 'zzz';
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

  const handlePartnerChange = (zoneId, { onsitePartnerId, inshopPartnerId }) => {
    const curZone = zones.find(z => z.zoneId === zoneId);
    const oldOnsite = curZone?.assignedOnsitePartnerId;
    const oldInshop = curZone?.assignedInshopPartnerId;

    // 파트너 변경 시 이전 파트너 소속 수행원에서 해당 존 제거
    setWorkers(prev => prev.map(w => {
      const removeZone = (oldOnsite && w.partnerId === oldOnsite && onsitePartnerId !== oldOnsite)
        || (oldInshop && w.partnerId === oldInshop && inshopPartnerId !== oldInshop);
      if (!removeZone) return w;
      return { ...w, zoneIds: w.zoneIds.filter(id => id !== zoneId) };
    }));

    setZones(prev => prev.map(z => z.zoneId === zoneId ? { ...z, assignedOnsitePartnerId: onsitePartnerId, assignedInshopPartnerId: inshopPartnerId } : z));
    setSelectedZone(null);
  };

  const handleDeleteAssignment = (type) => {
    if (!deleteTarget) return;
    const zid = deleteTarget.zoneId;
    const oldOnsite = deleteTarget.assignedOnsitePartnerId;
    const oldInshop = deleteTarget.assignedInshopPartnerId;

    // 해제된 파트너 소속 수행원에서 해당 존 제거
    setWorkers(prev => prev.map(w => {
      const removeZone = (type === 'all' || type === 'onsite') && oldOnsite && w.partnerId === oldOnsite
        || (type === 'all' || type === 'inshop') && oldInshop && w.partnerId === oldInshop;
      if (!removeZone) return w;
      return { ...w, zoneIds: w.zoneIds.filter(id => id !== zid) };
    }));

    setZones(prev => prev.map(z => {
      if (z.zoneId !== zid) return z;
      if (type === 'all') return { ...z, assignedOnsitePartnerId: null, assignedInshopPartnerId: null };
      if (type === 'onsite') return { ...z, assignedOnsitePartnerId: null };
      if (type === 'inshop') return { ...z, assignedInshopPartnerId: null };
      return z;
    }));
    setDeleteTarget(null);
  };

  const handleBulkAssignment = (assignments) => {
    setZones(prev => {
      const updated = [...prev];
      assignments.forEach(({ zoneId, onsitePartnerId, inshopPartnerId }) => {
        const idx = updated.findIndex(z => z.zoneId === zoneId);
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            assignedOnsitePartnerId: onsitePartnerId !== undefined ? (onsitePartnerId || null) : updated[idx].assignedOnsitePartnerId,
            assignedInshopPartnerId: inshopPartnerId !== undefined ? (inshopPartnerId || null) : updated[idx].assignedInshopPartnerId,
          };
        }
      });
      return updated;
    });
  };

  const columns = [
    { key: 'zoneId', header: '존 ID' },
    { key: 'region1', header: '지역1' },
    { key: 'region2', header: '지역2' },
    { key: 'zoneName', header: '존 이름' },
    { key: 'zoneType', header: '존 유형' },
    { key: 'vehicleCount', header: '차량 대수', align: 'center', sortable: true, render: r => `${r.vehicleCount}대` },
    { key: 'assignedOnsitePartnerId', header: '현장 파트너', render: r =>
      r.assignedOnsitePartnerId
        ? <span className="text-[#172B4D]">{partnerMap.get(r.assignedOnsitePartnerId)}</span>
        : <Badge tone="warn">미배정</Badge>
    },
    { key: 'assignedInshopPartnerId', header: '입고 파트너', render: r =>
      r.assignedInshopPartnerId
        ? <span className="text-[#172B4D]">{partnerMap.get(r.assignedInshopPartnerId)}</span>
        : <Badge tone="warn">미배정</Badge>
    },
    { key: '_actions', header: '', width: 80, render: r => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); setSelectedZone(r); setDrawerMode('edit'); }} className="p-1 rounded hover:bg-slate-100" title="수정"><Pencil className="h-4 w-4 text-[#6B778C]" /></button>
        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }} className="p-1 rounded hover:bg-red-50" title="배정 해제"><Trash2 className="h-4 w-4 text-[#6B778C]" /></button>
      </div>
    )},
  ];

  const resetFilters = () => {
    setSearchField("zoneId");
    setSearchQuery("");
    setRegion1Filter("");
    setRegion2Filter("");
    setFOnsitePartner("");
    setFInshopPartner("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">존 배정 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">존별 파트너 배정 현황을 관리합니다.</div>
        </div>
        <Button onClick={() => setBulkAssignmentOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          대량 존 배정
        </Button>
      </div>

      {/* Filters */}
      <FilterPanel
        chips={<>
          {searchQuery ? <Chip onRemove={() => setSearchQuery("")}>{searchField === "zoneId" ? "존 ID" : "존 이름"}: {searchQuery}</Chip> : null}
          {region1Filter ? <Chip onRemove={() => { setRegion1Filter(""); setRegion2Filter(""); }}>지역1: {region1Filter}</Chip> : null}
          {region2Filter ? <Chip onRemove={() => setRegion2Filter("")}>지역2: {region2Filter}</Chip> : null}
          {fOnsitePartner ? <Chip onRemove={() => setFOnsitePartner("")}>현장 파트너: {fOnsitePartner}</Chip> : null}
          {fInshopPartner ? <Chip onRemove={() => setFInshopPartner("")}>입고 파트너: {fInshopPartner}</Chip> : null}
        </>}
        onReset={resetFilters}
      >
        <div className="md:col-span-2">
          <label htmlFor="searchField" className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색항목</label>
          <Select id="searchField" value={searchField} onChange={e => setSearchField(e.target.value)}>
            <option value="zoneId">존 ID</option>
            <option value="zoneName">존 이름</option>
          </Select>
        </div>
        <div className="md:col-span-3">
          <label htmlFor="searchQuery" className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색어</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
            <Input id="searchQuery" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={searchField === "zoneId" ? "존 ID 검색..." : "존 이름 검색..."} className="pl-9" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="region1Filter" className="block text-xs font-semibold text-[#6B778C] mb-1.5">지역1</label>
          <Select id="region1Filter" value={region1Filter} onChange={(e) => setRegion1Filter(e.target.value)}>
            <option value="">전체</option>
            {region1Options.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="region2Filter" className={cn("block text-xs font-semibold mb-1.5", region1Filter ? "text-[#6B778C]" : "text-[#C1C7CD]")}>지역2</label>
          <Select id="region2Filter" value={region2Filter} onChange={(e) => setRegion2Filter(e.target.value)} disabled={!region1Filter} className={!region1Filter ? "bg-[#F4F5F7]! text-[#C1C7CD] cursor-not-allowed" : ""}>
            <option value="">전체</option>
            {region2Options.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fOnsitePartner" className="block text-xs font-semibold text-[#6B778C] mb-1.5">현장 파트너</label>
          <Select id="fOnsitePartner" value={fOnsitePartner} onChange={(e) => setFOnsitePartner(e.target.value)}>
            <option value="">전체</option>
            <option value="미배정">미배정</option>
            {ONSITE_PARTNERS.map(p => <option key={p.partnerId} value={p.partnerName}>{p.partnerName}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fInshopPartner" className="block text-xs font-semibold text-[#6B778C] mb-1.5">입고 파트너</label>
          <Select id="fInshopPartner" value={fInshopPartner} onChange={(e) => setFInshopPartner(e.target.value)}>
            <option value="">전체</option>
            <option value="미배정">미배정</option>
            {INSHOP_PARTNERS.map(p => <option key={p.partnerId} value={p.partnerName}>{p.partnerName}</option>)}
          </Select>
        </div>
      </FilterPanel>

      <div className="text-sm text-[#6B778C]">
        필터된 결과 <span className="font-semibold text-[#172B4D]">{filteredData.length}</span>건 / 전체 <span className="font-semibold text-[#172B4D]">{zones.length}</span>건
      </div>

      <DataTable
        columns={columns}
        rows={currentData}
        rowKey={(r) => r.zoneId}
        onRowClick={(r) => { setSelectedZone(r); setDrawerMode('view'); }}
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
          onPartnerChange={handlePartnerChange}
          onDelete={(z) => { setSelectedZone(null); setDeleteTarget(z); }}
          mode={drawerMode}
          workers={workers}
        />
      )}
      <ZADeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteAssignment}
        zone={deleteTarget}
      />

      {/* Bulk Assignment Drawer */}
      {bulkAssignmentOpen && (
        <BulkAssignmentDrawer
          zones={zones}
          onClose={() => setBulkAssignmentOpen(false)}
          onApply={handleBulkAssignment}
        />
      )}
    </div>
  );
}

function ZoneDetailDrawer({ zone, onClose, onPartnerChange, onDelete, mode, workers }) {
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [editOnsitePartnerId, setEditOnsitePartnerId] = useState(zone.assignedOnsitePartnerId || '');
  const [editInshopPartnerId, setEditInshopPartnerId] = useState(zone.assignedInshopPartnerId || '');
  const [saveConfirm, setSaveConfirm] = useState(null);

  useEffect(() => {
    setIsEditing(mode === 'edit');
    setEditOnsitePartnerId(zone.assignedOnsitePartnerId || '');
    setEditInshopPartnerId(zone.assignedInshopPartnerId || '');
    setSaveConfirm(null);
  }, [zone, mode]);

  const onsiteWorkers = useMemo(() => {
    if (!zone.assignedOnsitePartnerId) return [];
    return workers.filter(w => w.partnerId === zone.assignedOnsitePartnerId && w.zoneIds.includes(zone.zoneId));
  }, [workers, zone.assignedOnsitePartnerId, zone.zoneId]);

  const inshopWorkers = useMemo(() => {
    if (!zone.assignedInshopPartnerId) return [];
    return workers.filter(w => w.partnerId === zone.assignedInshopPartnerId && w.zoneIds.includes(zone.zoneId));
  }, [workers, zone.assignedInshopPartnerId, zone.zoneId]);

  const handleSave = () => {
    const newOnsite = editOnsitePartnerId || null;
    const newInshop = editInshopPartnerId || null;
    const curOnsite = zone.assignedOnsitePartnerId || null;
    const curInshop = zone.assignedInshopPartnerId || null;

    if (newOnsite === curOnsite && newInshop === curInshop) {
      setIsEditing(false);
      return;
    }

    const changes = {};
    if (newOnsite !== curOnsite) {
      changes['현장 파트너'] = {
        from: curOnsite ? partnerMap.get(curOnsite) : '미배정',
        to: newOnsite ? partnerMap.get(newOnsite) : '미배정',
      };
    }
    if (newInshop !== curInshop) {
      changes['입고 파트너'] = {
        from: curInshop ? partnerMap.get(curInshop) : '미배정',
        to: newInshop ? partnerMap.get(newInshop) : '미배정',
      };
    }

    setSaveConfirm({ changes, onsitePartnerId: newOnsite, inshopPartnerId: newInshop });
  };

  const confirmSave = () => {
    if (!saveConfirm) return;
    onPartnerChange(zone.zoneId, { onsitePartnerId: saveConfirm.onsitePartnerId, inshopPartnerId: saveConfirm.inshopPartnerId });
    setSaveConfirm(null);
  };

  const handleCancel = () => {
    setEditOnsitePartnerId(zone.assignedOnsitePartnerId || '');
    setEditInshopPartnerId(zone.assignedInshopPartnerId || '');
    setIsEditing(false);
  };

  const WorkerTable = ({ workers, emptyMessage }) => {
    if (workers.length === 0) return <div className="text-sm text-[#94A3B8] py-2">{emptyMessage}</div>;
    return (
      <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">수행원 ID</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">이름</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">벌점</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {workers.map(w => (
              <tr key={w.id} className="hover:bg-[#F8FAFC]">
                <td className="px-4 py-2.5 text-[#172B4D]">{w.id}</td>
                <td className="px-4 py-2.5 text-[#172B4D]">{w.name}</td>
                <td className="px-4 py-2.5">
                  {w.penalty === 0
                    ? <span className="text-[#94A3B8]">0</span>
                    : <Badge tone="danger">{w.penalty}</Badge>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <Drawer
        open={!!zone}
        title={`존 배정 ${isEditing ? '수정' : '상세'} - ${zone.zoneId}`}
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
              <div className="flex-1" />
              <Button onClick={() => setIsEditing(true)}>수정</Button>
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => onDelete(zone)}>삭제</Button>
            </>
          )
        }
      >
        <div className="space-y-4">
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

          <Card>
            <CardHeader><CardTitle>차량 정보</CardTitle></CardHeader>
            <CardContent>
              <Field label="차량 대수" value={`${zone.vehicleCount}대`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>배정된 파트너</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Field label="현장 파트너" value={isEditing ? (
                  <Select value={editOnsitePartnerId} onChange={(e) => setEditOnsitePartnerId(e.target.value)}>
                    <option value="">미배정</option>
                    {ONSITE_PARTNERS.map(p => (
                      <option key={p.partnerId} value={p.partnerId}>{p.partnerName}</option>
                    ))}
                  </Select>
                ) : (
                  zone.assignedOnsitePartnerId
                    ? partnerMap.get(zone.assignedOnsitePartnerId)
                    : <Badge tone="warn">미배정</Badge>
                )} />
              <Field label="입고 파트너" value={isEditing ? (
                  <Select value={editInshopPartnerId} onChange={(e) => setEditInshopPartnerId(e.target.value)}>
                    <option value="">미배정</option>
                    {INSHOP_PARTNERS.map(p => (
                      <option key={p.partnerId} value={p.partnerId}>{p.partnerName}</option>
                    ))}
                  </Select>
                ) : (
                  zone.assignedInshopPartnerId
                    ? partnerMap.get(zone.assignedInshopPartnerId)
                    : <Badge tone="warn">미배정</Badge>
                )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>현장세차 수행원</CardTitle></CardHeader>
            <CardContent>
              {!zone.assignedOnsitePartnerId ? (
                <div className="text-sm text-[#94A3B8] py-2">현장 파트너가 배정되지 않은 존입니다.</div>
              ) : (
                <WorkerTable workers={onsiteWorkers} emptyMessage="배정된 수행원이 없습니다." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>입고세차 수행원</CardTitle></CardHeader>
            <CardContent>
              {!zone.assignedInshopPartnerId ? (
                <div className="text-sm text-[#94A3B8] py-2">입고 파트너가 배정되지 않은 존입니다.</div>
              ) : (
                <WorkerTable workers={inshopWorkers} emptyMessage="배정된 수행원이 없습니다." />
              )}
            </CardContent>
          </Card>
        </div>
      </Drawer>
      <ZASaveConfirmModal
        open={!!saveConfirm}
        onClose={() => setSaveConfirm(null)}
        onConfirm={confirmSave}
        title={`${zone.zoneId} - ${zone.zoneName}`}
        changes={saveConfirm?.changes}
      />
    </>
  );
}

// ============== BULK ASSIGNMENT DRAWER ==============
function BulkAssignmentDrawer({ zones, onClose, onApply }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parseResult, setParseResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const zoneIdSet = useMemo(() => new Set(zones.map(z => z.zoneId)), [zones]);

  // CSV 양식 다운로드
  const handleDownloadTemplate = () => {
    const headers = "zoneId,onsitePartnerId,inshopPartnerId";
    const sampleRows = [
      "Z-1001,P-001,P-003",
      "Z-1002,P-002,P-003",
      "Z-1003,,P-003",
    ];
    const csvContent = [headers, ...sampleRows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "zone_assignment_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // CSV 파싱
  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return { success: [], errors: [{ row: 0, message: "데이터가 없습니다." }] };

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const zoneIdIdx = headers.indexOf("zoneid");
    const onsiteIdx = headers.indexOf("onsitepartnerid");
    const inshopIdx = headers.indexOf("inshoppartnerid");

    if (zoneIdIdx === -1) {
      return { success: [], errors: [{ row: 1, message: "필수 컬럼(zoneId)이 없습니다." }] };
    }
    if (onsiteIdx === -1 && inshopIdx === -1) {
      return { success: [], errors: [{ row: 1, message: "파트너 컬럼(onsitePartnerId, inshopPartnerId) 중 하나 이상이 필요합니다." }] };
    }

    const success = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim());
      const zoneId = cols[zoneIdIdx];
      const onsitePartnerId = onsiteIdx !== -1 ? (cols[onsiteIdx] || null) : undefined;
      const inshopPartnerId = inshopIdx !== -1 ? (cols[inshopIdx] || null) : undefined;
      const rowNum = i + 1;

      if (!zoneId && !onsitePartnerId && !inshopPartnerId) continue;

      if (!zoneId) {
        errors.push({ row: rowNum, zoneId: "(없음)", message: "존 ID가 비어있습니다." });
        continue;
      }

      if (!zoneIdSet.has(zoneId)) {
        errors.push({ row: rowNum, zoneId, message: "존재하지 않는 존 ID입니다." });
        continue;
      }

      if (onsitePartnerId && !onsitePartnerIdSet.has(onsitePartnerId)) {
        errors.push({ row: rowNum, zoneId, message: `현장 파트너 ID(${onsitePartnerId})가 유효하지 않습니다.` });
        continue;
      }

      if (inshopPartnerId && !inshopPartnerIdSet.has(inshopPartnerId)) {
        errors.push({ row: rowNum, zoneId, message: `입고 파트너 ID(${inshopPartnerId})가 유효하지 않습니다.` });
        continue;
      }

      success.push({ zoneId, onsitePartnerId, inshopPartnerId });
    }

    return { success, errors };
  };

  // 파일 처리
  const handleFile = (file) => {
    if (!file) return;

    const validTypes = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    const isValidFile = file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || validTypes.includes(file.type);

    if (!isValidFile) {
      alert("CSV 또는 엑셀 파일만 업로드 가능합니다.");
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);
    setParseResult(null);
    setIsApplied(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const result = parseCSV(text);
      setParseResult(result);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      alert("파일을 읽는 중 오류가 발생했습니다.");
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); };
  const handleFileInput = (e) => handleFile(e.target.files[0]);

  const handleApply = () => {
    if (!parseResult || parseResult.success.length === 0) return;
    if (!window.confirm(`${parseResult.success.length}건의 배정을 적용하시겠습니까?`)) return;
    onApply(parseResult.success);
    setIsApplied(true);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setParseResult(null);
    setIsApplied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Drawer
      open={true}
      title="대량 존 배정"
      onClose={onClose}
      footer={
        <div className="flex w-full flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">닫기</Button>
          {parseResult && parseResult.success.length > 0 && !isApplied && (
            <Button onClick={handleApply} className="w-full sm:w-auto">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {parseResult.success.length}건 배정 적용
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* 안내 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              대량 배정 안내
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[#6B778C]">
            <p>CSV 또는 엑셀 파일을 업로드하여 다수의 존에 파트너를 일괄 배정할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>파일 형식: CSV (쉼표 구분) 또는 Excel (.xlsx)</li>
              <li>필수 컬럼: zoneId, onsitePartnerId, inshopPartnerId</li>
              <li>현장 파트너: {ONSITE_PARTNERS.map(p => `${p.partnerId}(${p.partnerName})`).join(', ')}</li>
              <li>입고 파트너: {INSHOP_PARTNERS.map(p => `${p.partnerId}(${p.partnerName})`).join(', ')}</li>
              <li>파트너 ID를 비워두면 미배정 처리됩니다.</li>
            </ul>
            <Button variant="secondary" size="sm" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              양식 다운로드
            </Button>
          </CardContent>
        </Card>

        {/* 파일 업로드 영역 */}
        <Card>
          <CardHeader><CardTitle>파일 업로드</CardTitle></CardHeader>
          <CardContent>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragging ? "border-[#0052CC] bg-blue-50" : "border-[#E2E8F0] hover:border-[#94A3B8]",
                uploadedFile && "border-emerald-400 bg-emerald-50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileInput} />
              {uploadedFile ? (
                <div className="space-y-2">
                  <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500" />
                  <p className="font-medium text-[#172B4D]">{uploadedFile.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); handleReset(); }} className="text-sm text-[#0052CC] hover:underline">다른 파일 선택</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 mx-auto text-[#94A3B8]" />
                  <p className="text-[#6B778C]">클릭하거나 파일을 드롭하여 업로드하세요.</p>
                  <p className="text-xs text-[#94A3B8]">CSV, Excel 파일 지원</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isProcessing && (
          <Card><CardContent className="py-8 text-center text-[#6B778C]">파일을 분석 중입니다...</CardContent></Card>
        )}

        {isApplied && (
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center gap-3 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
                <div>
                  <p className="font-semibold">배정이 완료되었습니다.</p>
                  <p className="text-sm text-[#6B778C]">{parseResult.success.length}건의 존 배정이 적용되었습니다.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 파싱 결과 - 성공 */}
        {parseResult && !isApplied && parseResult.success.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                배정 가능 ({parseResult.success.length}건)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-[#E2E8F0]">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F8FAFC] sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-[#475569]">존 ID</th>
                      <th className="px-3 py-2 text-left font-semibold text-[#475569]">현장 파트너</th>
                      <th className="px-3 py-2 text-left font-semibold text-[#475569]">입고 파트너</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {parseResult.success.slice(0, 50).map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">{item.zoneId}</td>
                        <td className="px-3 py-2">{item.onsitePartnerId ? partnerMap.get(item.onsitePartnerId) || item.onsitePartnerId : <span className="text-[#94A3B8]">미배정</span>}</td>
                        <td className="px-3 py-2">{item.inshopPartnerId ? partnerMap.get(item.inshopPartnerId) || item.inshopPartnerId : <span className="text-[#94A3B8]">미배정</span>}</td>
                      </tr>
                    ))}
                    {parseResult.success.length > 50 && (
                      <tr><td colSpan={3} className="px-3 py-2 text-center text-[#6B778C]">외 {parseResult.success.length - 50}건...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 파싱 결과 - 실패 */}
        {parseResult && parseResult.errors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="h-4 w-4" />
                배정 실패 ({parseResult.errors.length}건)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-rose-200 bg-rose-50">
                <table className="min-w-full text-sm">
                  <thead className="bg-rose-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-rose-700">행</th>
                      <th className="px-3 py-2 text-left font-semibold text-rose-700">존 ID</th>
                      <th className="px-3 py-2 text-left font-semibold text-rose-700">오류 내용</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-200">
                    {parseResult.errors.map((err, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-rose-600">{err.row}</td>
                        <td className="px-3 py-2">{err.zoneId || "-"}</td>
                        <td className="px-3 py-2 text-rose-600">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {parseResult && parseResult.success.length === 0 && parseResult.errors.length === 0 && (
          <Card><CardContent className="py-6 text-center text-[#6B778C]">처리할 데이터가 없습니다.</CardContent></Card>
        )}
      </div>
    </Drawer>
  );
}
