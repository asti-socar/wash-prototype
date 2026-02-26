import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, MapPin, Pencil, X,
} from 'lucide-react';
import { cn, Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Badge, Chip, FilterPanel, Drawer, Field, usePagination, Pagination, DataTable } from '../../components/ui';
import zoneAssignmentsData from '../../mocks/zoneAssignments.json';

// ============== MOCK WORKERS (파트너 소속 수행원) ==============
const ALL_MOCK_WORKERS = [
  { id: 'W-001', name: '최수행', partnerId: 'P-001', penalty: 1, zoneIds: ['Z-1001', 'Z-1002', 'Z-1003', 'Z-1004', 'Z-1005', 'Z-1008', 'Z-1009', 'Z-1012', 'Z-1020'] },
  { id: 'W-002', name: '강수행', partnerId: 'P-001', penalty: 0, zoneIds: ['Z-1001', 'Z-1004', 'Z-1005', 'Z-1008', 'Z-1009', 'Z-1012', 'Z-1013', 'Z-1018', 'Z-1019', 'Z-1020'] },
  { id: 'W-003', name: '한수행', partnerId: 'P-001', penalty: 0, zoneIds: ['Z-1024', 'Z-1025', 'Z-1026', 'Z-1031', 'Z-1032', 'Z-1033', 'Z-1040'] },
  { id: 'W-004', name: '오수행', partnerId: 'P-001', penalty: 2, zoneIds: ['Z-1024', 'Z-1031', 'Z-1033', 'Z-1034', 'Z-1038', 'Z-1039', 'Z-1040', 'Z-1041', 'Z-1045', 'Z-1048'] },
  { id: 'W-005', name: '박수행', partnerId: 'P-001', penalty: 1, zoneIds: ['Z-1026', 'Z-1032', 'Z-1044', 'Z-1045', 'Z-1048', 'Z-1049'] },
  { id: 'W-006', name: '이수행', partnerId: 'P-003', penalty: 5, zoneIds: ['Z-1006', 'Z-1007', 'Z-1010', 'Z-1011', 'Z-1014', 'Z-1015'] },
  { id: 'W-007', name: '김수행', partnerId: 'P-003', penalty: 0, zoneIds: ['Z-1016', 'Z-1017', 'Z-1021', 'Z-1022', 'Z-1023'] },
  { id: 'W-008', name: '정수행', partnerId: 'P-003', penalty: 1, zoneIds: ['Z-1027', 'Z-1028', 'Z-1029', 'Z-1030', 'Z-1035', 'Z-1036'] },
  { id: 'W-009', name: '조수행', partnerId: 'P-003', penalty: 0, zoneIds: ['Z-1037', 'Z-1042', 'Z-1043', 'Z-1046', 'Z-1047', 'Z-1050'] },
];

// ============== Save Confirm Modal ==============
function SaveConfirmModal({ open, onClose, onConfirm, title, changes }) {
  if (!open || !changes) return null;
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <Card className="relative z-[1101] w-full max-w-sm">
        <CardHeader><CardTitle>수정 내용 확인</CardTitle>
          {title && <p className="text-sm text-[#6B778C] mt-1">{title}</p>}
        </CardHeader>
        <CardContent className="space-y-2">
          {changes.added.length > 0 && (
            <div className="rounded-lg bg-emerald-50 p-3">
              <div className="text-xs font-semibold text-emerald-700 mb-1">추가된 수행원</div>
              <div className="text-sm text-emerald-800">{changes.added.join(', ')}</div>
            </div>
          )}
          {changes.removed.length > 0 && (
            <div className="rounded-lg bg-rose-50 p-3">
              <div className="text-xs font-semibold text-rose-700 mb-1">제거된 수행원</div>
              <div className="text-sm text-rose-800">{changes.removed.join(', ')}</div>
            </div>
          )}
        </CardContent>
        <div className="flex items-center justify-end gap-2 border-t border-[#DFE1E6] px-5 py-4 bg-[#F4F5F7] rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button onClick={onConfirm}>확인</Button>
        </div>
      </Card>
    </div>
  );
}

// ============== MAIN PAGE COMPONENT ==============
export default function PartnerZoneManagementPage({ currentPartner }) {
  const [workers, setWorkers] = useState(() =>
    ALL_MOCK_WORKERS.filter(w => w.partnerId === currentPartner.partnerId).map(w => ({ ...w }))
  );

  const [selectedZone, setSelectedZone] = useState(null);
  const [drawerMode, setDrawerMode] = useState('view');

  // Filters
  const [searchField, setSearchField] = useState("zoneId");
  const [searchQuery, setSearchQuery] = useState("");
  const [region1Filter, setRegion1Filter] = useState("");
  const [region2Filter, setRegion2Filter] = useState("");
  const [workerNameFilter, setWorkerNameFilter] = useState("");

  const [sortConfig, setSortConfig] = useState({ key: 'zoneId', direction: 'desc' });

  // 자사에 배정된 존만 표시 (현장 파트너 기준)
  const partnerZones = useMemo(() => {
    return zoneAssignmentsData.filter(z => z.assignedOnsitePartnerId === currentPartner.partnerId);
  }, [currentPartner.partnerId]);

  const region1Options = useMemo(() => {
    const unique = [...new Set(partnerZones.map(z => z.region1))];
    return unique.sort();
  }, [partnerZones]);

  const region2Options = useMemo(() => {
    const filtered = region1Filter ? partnerZones.filter(z => z.region1 === region1Filter) : partnerZones;
    const unique = [...new Set(filtered.map(z => z.region2))];
    return unique.sort();
  }, [partnerZones, region1Filter]);

  useEffect(() => {
    setRegion2Filter("");
  }, [region1Filter]);

  // Helper: 존에 배정된 수행원 목록
  const getWorkersForZone = (zoneId) => {
    return workers.filter(w => w.zoneIds.includes(zoneId));
  };

  const filteredData = useMemo(() => {
    return partnerZones.filter(z => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const targetVal = String(z[searchField] || "").toLowerCase();
        if (!targetVal.includes(q)) return false;
      }
      if (region1Filter && z.region1 !== region1Filter) return false;
      if (region2Filter && z.region2 !== region2Filter) return false;
      if (workerNameFilter) {
        const q = workerNameFilter.trim().toLowerCase();
        const zoneWorkers = workers.filter(w => w.zoneIds.includes(z.zoneId));
        if (!zoneWorkers.some(w => w.name.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [partnerZones, searchField, searchQuery, region1Filter, region2Filter, workerNameFilter, workers]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key] || "";
      let bVal = b[sortConfig.key] || "";
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

  const handleWorkerChange = (zoneId, workerIds) => {
    setWorkers(prev => prev.map(w => {
      if (workerIds.includes(w.id)) {
        if (!w.zoneIds.includes(zoneId)) {
          return { ...w, zoneIds: [...w.zoneIds, zoneId] };
        }
        return w;
      } else {
        if (w.zoneIds.includes(zoneId)) {
          return { ...w, zoneIds: w.zoneIds.filter(id => id !== zoneId) };
        }
        return w;
      }
    }));
    setSelectedZone(null);
  };

  const columns = [
    { key: 'zoneId', header: '존 ID' },
    { key: 'region1', header: '지역1' },
    { key: 'region2', header: '지역2' },
    { key: 'zoneName', header: '존 이름' },
    { key: 'vehicleCount', header: '차량 대수', align: 'center', render: r => `${r.vehicleCount}대` },
    { key: '_workers', header: '배정 수행원', render: r => {
      const zoneWorkers = getWorkersForZone(r.zoneId);
      if (zoneWorkers.length === 0) return <Badge tone="warn">미배정</Badge>;
      return <span className="text-[#172B4D]">{zoneWorkers.map(w => w.name).join(', ')}</span>;
    }},
    { key: '_actions', header: '', width: 50, render: r => (
      <button onClick={(e) => { e.stopPropagation(); setSelectedZone(r); setDrawerMode('edit'); }} className="p-1 rounded hover:bg-slate-100" title="수정">
        <Pencil className="h-4 w-4 text-[#6B778C]" />
      </button>
    )},
  ];

  const resetFilters = () => {
    setSearchField("zoneId");
    setSearchQuery("");
    setRegion1Filter("");
    setRegion2Filter("");
    setWorkerNameFilter("");
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-base font-bold text-[#172B4D]">수행원 배정</div>
        <div className="mt-1 text-sm text-[#6B778C]">{currentPartner.partnerName}가 담당하는 존별 수행원 배정을 관리합니다.</div>
      </div>

      <FilterPanel
        chips={<>
          {searchQuery ? <Chip onRemove={() => setSearchQuery("")}>{searchField === "zoneId" ? "존 ID" : "존 이름"}: {searchQuery}</Chip> : null}
          {region1Filter ? <Chip onRemove={() => { setRegion1Filter(""); setRegion2Filter(""); }}>지역1: {region1Filter}</Chip> : null}
          {region2Filter ? <Chip onRemove={() => setRegion2Filter("")}>지역2: {region2Filter}</Chip> : null}
          {workerNameFilter ? <Chip onRemove={() => setWorkerNameFilter("")}>수행원: {workerNameFilter}</Chip> : null}
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
        <div className="md:col-span-3">
          <label htmlFor="workerNameFilter" className="block text-xs font-semibold text-[#6B778C] mb-1.5">수행원 이름</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
            <Input id="workerNameFilter" type="text" value={workerNameFilter} onChange={(e) => setWorkerNameFilter(e.target.value)} placeholder="수행원 이름 검색..." className="pl-9" />
          </div>
        </div>
      </FilterPanel>

      <div className="text-sm text-[#6B778C]">
        필터된 결과 <span className="font-semibold text-[#172B4D]">{filteredData.length}</span>건 / 전체 <span className="font-semibold text-[#172B4D]">{partnerZones.length}</span>건
      </div>

      <DataTable
        columns={columns}
        rows={currentData}
        rowKey={(r) => r.zoneId}
        onRowClick={(r) => { setSelectedZone(r); setDrawerMode('view'); }}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

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
          onWorkerChange={handleWorkerChange}
          mode={drawerMode}
          workers={workers}
        />
      )}
    </div>
  );
}

// ============== Zone Detail Drawer ==============
function ZoneDetailDrawer({ zone, onClose, onWorkerChange, mode, workers }) {
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [selectedWorkerIds, setSelectedWorkerIds] = useState(() =>
    workers.filter(w => w.zoneIds.includes(zone.zoneId)).map(w => w.id)
  );
  const [saveConfirm, setSaveConfirm] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [workerSearch, setWorkerSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setIsEditing(mode === 'edit');
    setSelectedWorkerIds(workers.filter(w => w.zoneIds.includes(zone.zoneId)).map(w => w.id));
    setSaveConfirm(null);
    setValidationError("");
    setWorkerSearch("");
    setIsDropdownOpen(false);
  }, [zone, mode, workers]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentWorkers = useMemo(() => {
    return workers.filter(w => w.zoneIds.includes(zone.zoneId));
  }, [workers, zone.zoneId]);

  // 선택된 수행원 객체 목록
  const selectedWorkers = useMemo(() => {
    return selectedWorkerIds.map(id => workers.find(w => w.id === id)).filter(Boolean);
  }, [selectedWorkerIds, workers]);

  // 검색 결과 (미선택 수행원 중 이름 매칭)
  const searchResults = useMemo(() => {
    const q = workerSearch.trim().toLowerCase();
    return workers.filter(w =>
      !selectedWorkerIds.includes(w.id) && (
        !q || w.name.toLowerCase().includes(q) || w.id.toLowerCase().includes(q)
      )
    );
  }, [workers, selectedWorkerIds, workerSearch]);

  const handleAddWorker = (workerId) => {
    setSelectedWorkerIds(prev => [...prev, workerId]);
    setWorkerSearch("");
    setIsDropdownOpen(false);
    setValidationError("");
  };

  const handleRemoveWorker = (workerId) => {
    if (selectedWorkerIds.length <= 1) {
      setValidationError("최소 1명 이상의 수행원이 배정되어야 합니다.");
      return;
    }
    setSelectedWorkerIds(prev => prev.filter(id => id !== workerId));
    setValidationError("");
  };

  const handleSave = () => {
    if (selectedWorkerIds.length === 0) {
      setValidationError("최소 1명 이상의 수행원이 배정되어야 합니다.");
      return;
    }

    const originalIds = currentWorkers.map(w => w.id);
    const added = selectedWorkerIds.filter(id => !originalIds.includes(id));
    const removed = originalIds.filter(id => !selectedWorkerIds.includes(id));

    if (added.length === 0 && removed.length === 0) {
      setIsEditing(false);
      return;
    }

    setSaveConfirm({
      added: added.map(id => workers.find(w => w.id === id)?.name || id),
      removed: removed.map(id => workers.find(w => w.id === id)?.name || id),
      workerIds: selectedWorkerIds,
    });
  };

  const confirmSave = () => {
    if (!saveConfirm) return;
    onWorkerChange(zone.zoneId, saveConfirm.workerIds);
    setSaveConfirm(null);
  };

  const handleCancel = () => {
    setSelectedWorkerIds(currentWorkers.map(w => w.id));
    setIsEditing(false);
    setValidationError("");
    setWorkerSearch("");
    setIsDropdownOpen(false);
  };

  return (
    <>
      <Drawer
        open={!!zone}
        title={`수행원 배정 ${isEditing ? '수정' : '상세'} - ${zone.zoneId}`}
        subtitle={zone.zoneName}
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
              <Field label="운영 시간" value={zone.operationTime} />
              <Field label="주차 유형" value={zone.parkingType} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>차량 정보</CardTitle></CardHeader>
            <CardContent>
              <Field label="차량 대수" value={`${zone.vehicleCount}대`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>배정 수행원</CardTitle>
                {!isEditing && (
                  <Badge tone={currentWorkers.length > 0 ? "ok" : "warn"}>
                    {currentWorkers.length}명
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  {validationError && (
                    <div className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{validationError}</div>
                  )}
                  {/* 배정된 수행원 태그 */}
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkers.map(w => (
                      <span key={w.id} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-[#0052CC]/30 pl-3 pr-1.5 py-1 text-sm text-[#0052CC]">
                        {w.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveWorker(w.id)}
                          className="flex items-center justify-center h-5 w-5 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  {/* 수행원 검색 */}
                  <div className="relative" ref={dropdownRef}>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
                      <input
                        ref={searchRef}
                        type="text"
                        value={workerSearch}
                        onChange={(e) => { setWorkerSearch(e.target.value); setIsDropdownOpen(true); }}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder="수행원 이름 또는 ID로 검색..."
                        className="w-full rounded-lg border border-[#E2E8F0] py-2 pl-9 pr-3 text-sm focus:border-[#0052CC] focus:outline-none focus:ring-1 focus:ring-[#0052CC]"
                      />
                    </div>
                    {isDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white shadow-lg max-h-48 overflow-y-auto">
                        {searchResults.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-[#94A3B8]">
                            {workerSearch ? "검색 결과가 없습니다." : "추가할 수행원이 없습니다."}
                          </div>
                        ) : (
                          searchResults.map(w => (
                            <button
                              key={w.id}
                              type="button"
                              onClick={() => handleAddWorker(w.id)}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F4F5F7] transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-[#172B4D]">{w.name}</span>
                                  <span className="text-xs text-[#6B778C]">{w.id}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-[#6B778C]">담당 존 {w.zoneIds.length}개</span>
                                  {w.penalty > 0 && <Badge tone="danger">벌점 {w.penalty}</Badge>}
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                currentWorkers.length === 0 ? (
                  <div className="text-sm text-[#94A3B8] py-2">배정된 수행원이 없습니다.</div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
                    <table className="min-w-full text-sm">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">수행원 ID</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">이름</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">담당 존</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">벌점</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {currentWorkers.map(w => (
                          <tr key={w.id} className="hover:bg-[#F8FAFC]">
                            <td className="px-4 py-2.5 text-[#172B4D]">{w.id}</td>
                            <td className="px-4 py-2.5 text-[#172B4D]">{w.name}</td>
                            <td className="px-4 py-2.5 text-[#6B778C]">{w.zoneIds.length}개</td>
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
                )
              )}
            </CardContent>
          </Card>
        </div>
      </Drawer>
      <SaveConfirmModal
        open={!!saveConfirm}
        onClose={() => setSaveConfirm(null)}
        onConfirm={confirmSave}
        title={`${zone.zoneId} - ${zone.zoneName}`}
        changes={saveConfirm}
      />
    </>
  );
}
