import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, MapPin,
  Upload, Download, AlertCircle, CheckCircle2, FileSpreadsheet
} from 'lucide-react';
import { cn, Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Badge, Chip, FilterPanel, Drawer, Field, usePagination, Pagination, DataTable } from '../../components/ui';
import zoneAssignmentsData from '../../mocks/zoneAssignments.json';

// ============== MOCK PARTNERS ==============
const MOCK_PARTNERS = [
  { partnerId: 'P-001', partnerName: 'A파트너' },
  { partnerId: 'P-002', partnerName: 'B파트너' },
  { partnerId: 'P-003', partnerName: 'C파트너' },
  { partnerId: 'P-004', partnerName: 'D파트너' },
];

const partnerMap = new Map(MOCK_PARTNERS.map(p => [p.partnerId, p.partnerName]));

// ============== MOCK WORKERS (수행원 조회 참고) ==============
const MOCK_WORKERS = [
  { id: 'W-001', name: '최수행', partnerId: 'P-001', penalty: 0, zoneIds: ['Z-1001', 'Z-1003', 'Z-1048'] },
  { id: 'W-002', name: '강수행', partnerId: 'P-002', penalty: 2, zoneIds: ['Z-1006', 'Z-1007', 'Z-1050'] },
  { id: 'W-003', name: '한수행', partnerId: 'P-003', penalty: 0, zoneIds: ['Z-1008', 'Z-1032', 'Z-1044'] },
  { id: 'W-004', name: '오수행', partnerId: 'P-004', penalty: 1, zoneIds: ['Z-1035', 'Z-1037', 'Z-1046'] },
  { id: 'W-005', name: '박수행', partnerId: 'P-001', penalty: 0, zoneIds: ['Z-1012', 'Z-1040'] },
  { id: 'W-006', name: '이수행', partnerId: 'P-002', penalty: 3, zoneIds: ['Z-1014', 'Z-1042', 'Z-1050'] },
  { id: 'W-007', name: '김수행', partnerId: 'P-003', penalty: 0, zoneIds: ['Z-1010', 'Z-1034', 'Z-1044'] },
  { id: 'W-008', name: '정수행', partnerId: 'P-001', penalty: 1, zoneIds: ['Z-1019', 'Z-1048'] },
  { id: 'W-009', name: '조수행', partnerId: 'P-004', penalty: 0, zoneIds: ['Z-1021', 'Z-1035', 'Z-1046'] },
  { id: 'W-010', name: '윤수행', partnerId: 'P-002', penalty: 2, zoneIds: ['Z-1029', 'Z-1042'] },
];

// ============== MAIN PAGE COMPONENT ==============
export default function ZoneAssignmentPage() {
  const [zones, setZones] = useState(zoneAssignmentsData);
  const [selectedZone, setSelectedZone] = useState(null);
  const [bulkAssignmentOpen, setBulkAssignmentOpen] = useState(false);

  // Filters
  const [searchField, setSearchField] = useState("zoneId");
  const [searchQuery, setSearchQuery] = useState("");
  const [region1Filter, setRegion1Filter] = useState("");
  const [region2Filter, setRegion2Filter] = useState("");
  const [fPartner, setFPartner] = useState("");

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

  // Get unique assigned partner names for filter
  const partnerOptions = useMemo(() => {
    const names = [...new Set(zones.filter(z => z.assignedPartnerId).map(z => partnerMap.get(z.assignedPartnerId)).filter(Boolean))];
    return names.sort();
  }, [zones]);

  // Reset region2 when region1 changes
  useEffect(() => {
    setRegion2Filter("");
  }, [region1Filter]);

  const filteredData = useMemo(() => {
    return zones.filter(z => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const targetVal = String(z[searchField] || "").toLowerCase();
        if (!targetVal.includes(q)) return false;
      }
      // Region1 filter
      if (region1Filter && z.region1 !== region1Filter) return false;
      // Region2 filter
      if (region2Filter && z.region2 !== region2Filter) return false;
      // Partner filter
      if (fPartner === "미배정" && z.assignedPartnerId) return false;
      if (fPartner && fPartner !== "미배정") {
        const assignedName = z.assignedPartnerId ? partnerMap.get(z.assignedPartnerId) : null;
        if (assignedName !== fPartner) return false;
      }
      return true;
    });
  }, [zones, searchField, searchQuery, region1Filter, region2Filter, fPartner]);

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

  const handlePartnerChange = (zoneId, partnerId) => {
    const newPartnerId = partnerId || null;
    setZones(prev => prev.map(z => z.zoneId === zoneId ? { ...z, assignedPartnerId: newPartnerId } : z));
    setSelectedZone(prev => prev && prev.zoneId === zoneId ? { ...prev, assignedPartnerId: newPartnerId } : prev);
  };

  const handleBulkAssignment = (assignments) => {
    setZones(prev => {
      const updated = [...prev];
      assignments.forEach(({ zoneId, partnerId }) => {
        const idx = updated.findIndex(z => z.zoneId === zoneId);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], assignedPartnerId: partnerId || null };
        }
      });
      return updated;
    });
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
    { key: 'vehicleCount', header: '차량 대수', align: 'center', sortable: true, render: r => `${r.vehicleCount}대` },
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
        <div className="flex items-center gap-4">
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
          <Button onClick={() => setBulkAssignmentOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            대량 존 배정
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterPanel
        chips={<>
          {searchQuery ? <Chip onRemove={() => setSearchQuery("")}>{searchField === "zoneId" ? "존 ID" : "존 이름"}: {searchQuery}</Chip> : null}
          {region1Filter ? <Chip onRemove={() => { setRegion1Filter(""); setRegion2Filter(""); }}>지역1: {region1Filter}</Chip> : null}
          {region2Filter ? <Chip onRemove={() => setRegion2Filter("")}>지역2: {region2Filter}</Chip> : null}
          {fPartner ? <Chip onRemove={() => setFPartner("")}>배정 파트너: {fPartner}</Chip> : null}
        </>}
        onReset={() => { setSearchField("zoneId"); setSearchQuery(""); setRegion1Filter(""); setRegion2Filter(""); setFPartner(""); }}
      >
        <div className="md:col-span-2">
          <label htmlFor="searchField" className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색항목</label>
          <Select id="searchField" value={searchField} onChange={e => setSearchField(e.target.value)}>
            <option value="zoneId">존 ID</option>
            <option value="zoneName">존 이름</option>
          </Select>
        </div>
        <div className="md:col-span-4">
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
          <label htmlFor="fPartner" className="block text-xs font-semibold text-[#6B778C] mb-1.5">배정 파트너</label>
          <Select id="fPartner" value={fPartner} onChange={(e) => setFPartner(e.target.value)}>
            <option value="">전체</option>
            <option value="미배정">미배정</option>
            {partnerOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
        </div>
      </FilterPanel>

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
          onPartnerChange={handlePartnerChange}
        />
      )}

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

function ZoneDetailDrawer({ zone, onClose, onPartnerChange }) {
  const zoneWorkers = useMemo(() => {
    if (!zone.assignedPartnerId) return [];
    return MOCK_WORKERS.filter(w => w.partnerId === zone.assignedPartnerId && w.zoneIds.includes(zone.zoneId));
  }, [zone.assignedPartnerId, zone.zoneId]);

  const handlePartnerSelect = (e) => {
    const newPartnerId = e.target.value || null;
    const currentPartnerId = zone.assignedPartnerId || null;
    if (newPartnerId === currentPartnerId) return;
    const newPartnerName = newPartnerId ? partnerMap.get(newPartnerId) : '미배정';
    const hasWorkers = zoneWorkers.length > 0;
    const message = hasWorkers
      ? `배정 파트너를 '${newPartnerName}'(으)로 변경하시겠습니까?\n\n배정된 수행원 정보가 초기화됩니다.`
      : `배정 파트너를 '${newPartnerName}'(으)로 변경하시겠습니까?`;
    if (window.confirm(message)) {
      onPartnerChange(zone.zoneId, newPartnerId);
    }
  };

  return (
    <Drawer
      open={!!zone}
      title={`존 배정 상세 - ${zone.zoneId}`}
      onClose={onClose}
      footer={<Button variant="secondary" onClick={onClose}>닫기</Button>}
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
          <CardContent>
            <div className="flex items-start justify-between gap-3">
              <div className="w-28 shrink-0 text-xs font-semibold text-[#6B778C] pt-2">배정 파트너</div>
              <div className="min-w-0 flex-1">
                <Select
                  value={zone.assignedPartnerId || ""}
                  onChange={handlePartnerSelect}
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

        {/* Workers Section */}
        <Card>
          <CardHeader>
            <CardTitle>배정된 수행원 정보</CardTitle>
          </CardHeader>
          <CardContent>
            {!zone.assignedPartnerId ? (
              <div className="text-sm text-[#94A3B8] py-2">파트너가 배정되지 않은 존입니다.</div>
            ) : zoneWorkers.length === 0 ? (
              <div className="text-sm text-[#94A3B8] py-2">배정된 수행원이 없습니다.</div>
            ) : (
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
                    {zoneWorkers.map(w => (
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
            )}
          </CardContent>
        </Card>
      </div>
    </Drawer>
  );
}

// ============== BULK ASSIGNMENT DRAWER ==============
function BulkAssignmentDrawer({ zones, onClose, onApply }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parseResult, setParseResult] = useState(null); // { success: [], errors: [] }
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const zoneIdSet = useMemo(() => new Set(zones.map(z => z.zoneId)), [zones]);
  const partnerIdSet = useMemo(() => new Set(MOCK_PARTNERS.map(p => p.partnerId)), []);

  // CSV 양식 다운로드
  const handleDownloadTemplate = () => {
    const headers = "zoneId,partnerId";
    const sampleRows = [
      "Z-1001,P-001",
      "Z-1002,P-002",
      "Z-1003,",
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
    const partnerIdIdx = headers.indexOf("partnerid");

    if (zoneIdIdx === -1 || partnerIdIdx === -1) {
      return { success: [], errors: [{ row: 1, message: "필수 컬럼(zoneId, partnerId)이 없습니다." }] };
    }

    const success = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim());
      const zoneId = cols[zoneIdIdx];
      const partnerId = cols[partnerIdIdx] || null;
      const rowNum = i + 1;

      // 빈 행 스킵
      if (!zoneId && !partnerId) continue;

      // 존 ID 검증
      if (!zoneId) {
        errors.push({ row: rowNum, zoneId: "(없음)", message: "존 ID가 비어있습니다." });
        continue;
      }

      if (!zoneIdSet.has(zoneId)) {
        errors.push({ row: rowNum, zoneId, message: `존재하지 않는 존 ID입니다.` });
        continue;
      }

      // 파트너 ID 검증 (빈 값은 미배정으로 허용)
      if (partnerId && !partnerIdSet.has(partnerId)) {
        errors.push({ row: rowNum, zoneId, partnerId, message: `존재하지 않는 파트너 ID입니다.` });
        continue;
      }

      success.push({ zoneId, partnerId });
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

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  // 배정 적용
  const handleApply = () => {
    if (!parseResult || parseResult.success.length === 0) return;
    if (!window.confirm(`${parseResult.success.length}건의 배정을 적용하시겠습니까?`)) return;

    onApply(parseResult.success);
    setIsApplied(true);
  };

  // 초기화
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
              <li>필수 컬럼: zoneId, partnerId</li>
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
          <CardHeader>
            <CardTitle>파일 업로드</CardTitle>
          </CardHeader>
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
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileInput}
              />
              {uploadedFile ? (
                <div className="space-y-2">
                  <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500" />
                  <p className="font-medium text-[#172B4D]">{uploadedFile.name}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                    className="text-sm text-[#0052CC] hover:underline"
                  >
                    다른 파일 선택
                  </button>
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

        {/* 처리 중 */}
        {isProcessing && (
          <Card>
            <CardContent className="py-8 text-center text-[#6B778C]">
              파일을 분석 중입니다...
            </CardContent>
          </Card>
        )}

        {/* 적용 완료 */}
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
                      <th className="px-3 py-2 text-left font-semibold text-[#475569]">파트너 ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {parseResult.success.slice(0, 50).map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">{item.zoneId}</td>
                        <td className="px-3 py-2">{item.partnerId || <span className="text-[#94A3B8]">미배정</span>}</td>
                      </tr>
                    ))}
                    {parseResult.success.length > 50 && (
                      <tr><td colSpan={2} className="px-3 py-2 text-center text-[#6B778C]">외 {parseResult.success.length - 50}건...</td></tr>
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

        {/* 성공 0건일 때 */}
        {parseResult && parseResult.success.length === 0 && parseResult.errors.length === 0 && (
          <Card>
            <CardContent className="py-6 text-center text-[#6B778C]">
              처리할 데이터가 없습니다.
            </CardContent>
          </Card>
        )}
      </div>
    </Drawer>
  );
}
