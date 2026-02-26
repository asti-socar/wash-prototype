import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  cn,
  toYmd,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  Chip,
  FilterPanel,
  Drawer,
  usePagination,
  DataTable,
} from "../../components/ui";
import MISSION_POLICIES from "../../mocks/missionPolicies.json";
import POLICY_VEHICLES from "../../mocks/policyVehicles.json";

const PartnerMissionsPage = ({ currentPartner }) => {
  const [qTitle, setQTitle] = useState("");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });

  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");

  // 정적 데이터 (읽기 전용)
  const [policies] = useState(() => MISSION_POLICIES.map(p => ({ ...p })));
  const [vehicles] = useState(() => POLICY_VEHICLES.map(v => ({ ...v })));

  const enrichedPolicies = useMemo(() => {
    return policies.map(policy => {
      const assignedVehicles = vehicles.filter(v => v.policyId === policy.id);
      const completedCount = assignedVehicles.filter(v => v.status === "completed").length;
      const totalCount = assignedVehicles.length;
      const progress = totalCount > 0 ? completedCount / totalCount : 0;
      return {
        ...policy,
        targetVehicleCount: totalCount,
        completedVehicleCount: completedCount,
        progress,
      };
    });
  }, [policies, vehicles]);

  const filteredPolicies = useMemo(() => {
    const qq = qTitle.trim().toLowerCase();
    return enrichedPolicies.filter(p => {
      const hitTitle = !qq || (p.title || "").toLowerCase().includes(qq);
      const hitPeriod = (!periodFrom || p.createdAt >= periodFrom) && (!periodTo || p.createdAt <= periodTo);
      const hitStatus = !fStatus || p.status === fStatus;
      return hitTitle && hitPeriod && hitStatus;
    });
  }, [enrichedPolicies, qTitle, periodFrom, periodTo, fStatus]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredPolicies;
    return [...filteredPolicies].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredPolicies, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));
  };

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  const handleResetFilters = () => {
    setQTitle("");
    setPeriodFrom("");
    setPeriodTo("");
    setFStatus("");
  };

  const policyColumns = [
    { key: "id", header: "ID" },
    { key: "title", header: "미션 제목", render: r => r.title || r.content },
    { key: "amount", header: "금액", render: r => `${r.amount.toLocaleString()}원` },
    { key: "targetVehicleCount", header: "대상 차량수", render: r => `${r.targetVehicleCount}대` },
    { key: "completedVehicleCount", header: "수행 완료수", render: r => `${r.completedVehicleCount}대` },
    { key: "progress", header: "진행률(%)", render: r => `${Math.round(r.progress * 100)}%` },
    { key: "status", header: "상태", render: r => <Badge tone={r.status === "활성" ? "ok" : "default"}>{r.status}</Badge> },
    { key: "createdAt", header: "등록일시" },
  ];

  // 상세 Drawer용 차량 목록
  const assignedVehiclesForSelectedPolicy = useMemo(() => {
    return selectedPolicy ? vehicles.filter(v => v.policyId === selectedPolicy.id) : [];
  }, [selectedPolicy, vehicles]);

  const filteredAssignedVehicles = useMemo(() => {
    if (!vehicleSearchQuery.trim()) return assignedVehiclesForSelectedPolicy;
    const searchPlates = new Set(vehicleSearchQuery.split(/[\n,]+/).map(p => p.trim()).filter(Boolean));
    if (searchPlates.size === 0) return assignedVehiclesForSelectedPolicy;
    return assignedVehiclesForSelectedPolicy.filter(vehicle => searchPlates.has(vehicle.plate));
  }, [assignedVehiclesForSelectedPolicy, vehicleSearchQuery]);

  const vehicleColumns = [
    { key: "plate", header: "차량 번호" },
    { key: "status", header: "수행 상태", render: r => <Badge tone={r.status === "completed" ? "ok" : "warn"}>{r.status === "completed" ? "완료" : "대기"}</Badge> },
    { key: "linkedOrderId", header: "연결된 오더", render: r => r.linkedOrderId ? <span className="text-[#0052CC]">{r.linkedOrderId} <ExternalLink className="inline h-3 w-3" /></span> : "-" },
    { key: "completedAt", header: "완료일", render: r => r.completedAt ? toYmd(r.completedAt) : "-" },
  ];

  const { currentData: paginatedVehicles, currentPage: vehiclePage, totalPages: vehicleTotalPages, setCurrentPage: setVehiclePage, totalItems: vehicleTotal } = usePagination(filteredAssignedVehicles, 100);

  // selectedPolicy 동기화
  useEffect(() => {
    if (selectedPolicy) {
      const updated = enrichedPolicies.find(p => p.id === selectedPolicy.id);
      if (updated) setSelectedPolicy(updated);
    }
  }, [enrichedPolicies, selectedPolicy?.id]);

  useEffect(() => {
    if (!selectedPolicy) setVehicleSearchQuery("");
  }, [selectedPolicy]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">미션 조회</div>
          <div className="mt-1 text-sm text-[#6B778C]">{currentPartner.partnerName}에 배정된 미션 정책 및 차량을 조회합니다.</div>
        </div>
      </div>

      <FilterPanel
        chips={<>
          {qTitle ? <Chip onRemove={() => setQTitle("")}>미션 제목: {qTitle}</Chip> : null}
          {periodFrom || periodTo ? <Chip onRemove={() => { setPeriodFrom(""); setPeriodTo(""); }}>등록 일시: {periodFrom || "-"} ~ {periodTo || "-"}</Chip> : null}
          {fStatus ? <Chip onRemove={() => setFStatus("")}>상태: {fStatus}</Chip> : null}
        </>}
        onReset={handleResetFilters}
      >
        <div className="md:col-span-3">
          <label htmlFor="qTitle" className="block text-xs font-semibold text-[#6B778C] mb-1.5">미션 제목</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
            <Input id="qTitle" value={qTitle} onChange={(e) => setQTitle(e.target.value)} placeholder="미션 제목 검색" className="pl-9" />
          </div>
        </div>
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">등록 일시</label>
          <div className="flex items-center gap-2">
            <Input type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
            <span className="text-sm text-[#6B778C] shrink-0">~</span>
            <Input type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
          </div>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fStatus" className="block text-xs font-semibold text-[#6B778C] mb-1.5">상태</label>
          <Select id="fStatus" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="">전체</option>
            <option value="활성">활성</option>
            <option value="비활성">비활성</option>
          </Select>
        </div>
      </FilterPanel>

      <Card>
        <DataTable columns={policyColumns} rows={currentData} rowKey={(r) => r.id} onRowClick={setSelectedPolicy} sortConfig={sortConfig} onSort={handleSort} />
      </Card>
      <div className="flex items-center justify-end pt-2">
        <div className="flex items-center gap-2 text-sm text-[#6B778C]">
          <span>
            {totalItems > 0
              ? `${(currentPage - 1) * 40 + 1} - ${Math.min(currentPage * 40, totalItems)} / ${totalItems.toLocaleString()}`
              : "0 - 0 / 0"}
          </span>
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="p-1 h-auto">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-1 h-auto">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 미션 정책 상세 Drawer (읽기 전용) */}
      <Drawer
        open={!!selectedPolicy}
        title="미션 정책 상세"
        subtitle="미션 정책 정보 및 할당 차량 조회"
        onClose={() => setSelectedPolicy(null)}
        footer={<Button variant="secondary" onClick={() => setSelectedPolicy(null)} className="w-full sm:w-auto">닫기</Button>}
      >
        {selectedPolicy && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>정책 정보</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6B778C]">미션 제목</label>
                  <div className="rounded-lg bg-[#F4F5F7] px-3 py-2 text-sm text-[#172B4D]">{selectedPolicy.title || "-"}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6B778C]">미션 내용</label>
                  <div className="rounded-lg bg-[#F4F5F7] px-3 py-2 text-sm text-[#172B4D] min-h-[60px] whitespace-pre-wrap">{selectedPolicy.content || "-"}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#6B778C]">미션 금액</label>
                    <div className="rounded-lg bg-[#F4F5F7] px-3 py-2 text-sm text-[#172B4D]">{selectedPolicy.amount?.toLocaleString()}원</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#6B778C]">상태</label>
                    <div><Badge tone={selectedPolicy.status === "활성" ? "ok" : "default"}>{selectedPolicy.status}</Badge></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6B778C]">등록일시</label>
                  <div className="text-sm text-[#172B4D]">{selectedPolicy.createdAt}</div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" className="h-4 w-4 cursor-not-allowed" checked={selectedPolicy.requiresPhoto} disabled />
                  <span className="text-sm text-[#6B778C]">수행 시 증빙 사진 필수</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>할당 차량 조회</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <label className="text-xs font-semibold text-[#6B778C]">차량 번호 검색</label>
                  <textarea
                    className="w-full rounded-lg border border-[#E2E8F0] p-2 text-sm min-h-[60px]"
                    value={vehicleSearchQuery}
                    onChange={e => setVehicleSearchQuery(e.target.value)}
                    placeholder="차량 번호를 콤마 또는 엔터로 구분하여 검색..."
                  />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-[#6B778C]">
                    <span>할당된 차량 목록 ({selectedPolicy.completedVehicleCount} / {selectedPolicy.targetVehicleCount}대)</span>
                    <Badge tone={selectedPolicy.progress >= 1 ? "ok" : selectedPolicy.progress > 0 ? "warn" : "default"}>{Math.round(selectedPolicy.progress * 100)}%</Badge>
                  </div>
                </div>
                <DataTable columns={vehicleColumns} rows={paginatedVehicles} rowKey={r => r.id} />
                {vehicleTotalPages > 1 && (
                  <div className="flex items-center justify-end pt-2">
                    <div className="flex items-center gap-2 text-sm text-[#6B778C]">
                      <span>
                        {vehicleTotal > 0
                          ? `${(vehiclePage - 1) * 100 + 1} - ${Math.min(vehiclePage * 100, vehicleTotal)} / ${vehicleTotal.toLocaleString()}`
                          : "0 - 0 / 0"}
                      </span>
                      <div className="flex items-center">
                        <Button variant="ghost" size="sm" onClick={() => setVehiclePage(vehiclePage - 1)} disabled={vehiclePage === 1} className="p-1 h-auto">
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setVehiclePage(vehiclePage + 1)} disabled={vehiclePage === vehicleTotalPages} className="p-1 h-auto">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PartnerMissionsPage;
