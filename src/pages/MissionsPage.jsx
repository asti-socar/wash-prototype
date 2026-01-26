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
  Drawer,
  usePagination,
  DataTable,
} from "../components/ui";


const MissionsPage = ({ missionPolicies, setMissionPolicies, policyVehicles, setPolicyVehicles, orders }) => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newPolicyForm, setNewPolicyForm] = useState({ title: "", content: "", amount: 0, requiresPhoto: true, status: "활성" });
  
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [bulkPlates, setBulkPlates] = useState("");
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");

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
      const hitStatus = !fStatus || p.status === fStatus;
      return hitPeriod && hitStatus;
    });
  }, [enrichedPolicies, periodFrom, periodTo, fStatus]);
  
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

  const handleResetFilters = () => {
    setPeriodFrom("");
    setPeriodTo("");
    setFStatus("");
  };

  const handleRegisterPolicy = () => {
    if (!newPolicyForm.title) return alert("미션 제목은 필수입니다.");
    
    const newPolicy = {
      id: `MP-${Date.now()}`,
      ...newPolicyForm,
      amount: Number(newPolicyForm.amount) || 0,
      createdAt: toYmd(new Date()),
    };
    
    setMissionPolicies([newPolicy, ...missionPolicies]);
    setNewPolicyForm({ title: "", content: "", amount: 0, requiresPhoto: true, status: "활성" });
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
    { key: "title", header: "미션 제목", render: r => r.title || r.content },
    { key: "amount", header: "금액", render: r => `${r.amount.toLocaleString()}원` },
    { key: "targetVehicleCount", header: "대상 차량수", render: r => `${r.targetVehicleCount}대` },
    { key: "completedVehicleCount", header: "수행 완료수", render: r => `${r.completedVehicleCount}대` },
    { key: "progress", header: "진행률(%)", render: r => `${Math.round(r.progress * 100)}%` },
    { key: "status", header: "상태", render: r => <Badge tone={r.status === '활성' ? 'ok' : 'default'}>{r.status}</Badge> },
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

  const filteredAssignedVehicles = useMemo(() => {
    if (!vehicleSearchQuery.trim()) {
      return assignedVehiclesForSelectedPolicy;
    }
    const searchPlates = new Set(vehicleSearchQuery.split(/[\n,]+/).map(p => p.trim()).filter(Boolean));
    if (searchPlates.size === 0) {
      return assignedVehiclesForSelectedPolicy;
    }
    return assignedVehiclesForSelectedPolicy.filter(vehicle => searchPlates.has(vehicle.plate));
  }, [assignedVehiclesForSelectedPolicy, vehicleSearchQuery]);

  // Effect to update selected policy data when the main list changes
  useEffect(() => {
    if (selectedPolicy) {
      const updatedPolicyData = enrichedPolicies.find(p => p.id === selectedPolicy.id);
      if (updatedPolicyData) {
        setSelectedPolicy(updatedPolicyData);
      } else {
        setSelectedPolicy(null);
      }
    }
  }, [enrichedPolicies, selectedPolicy?.id]);
  
  // Effect to clear vehicle search when drawer closes
  useEffect(() => {
    if (!selectedPolicy) {
      setVehicleSearchQuery("");
    }
  }, [selectedPolicy]);

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
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
            <div className="md:col-span-2">
              <label htmlFor="periodFrom" className="block text-xs font-semibold text-[#6B778C] mb-1.5">등록일 시작</label>
              <Input id="periodFrom" type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="periodTo" className="block text-xs font-semibold text-[#6B778C] mb-1.5">등록일 종료</label>
              <Input id="periodTo" type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="fStatus" className="block text-xs font-semibold text-[#6B778C] mb-1.5">상태</label>
              <Select id="fStatus" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
                <option value="">전체</option>
                <option value="활성">활성</option>
                <option value="비활성">비활성</option>
              </Select>
            </div>
          </div>
          <div className="md:col-span-12 flex flex-wrap items-center justify-between gap-2 pt-4">
            <div className="flex flex-wrap gap-2">
              {periodFrom ? <Chip onRemove={() => setPeriodFrom("")}>시작일: {periodFrom}</Chip> : null}
              {periodTo ? <Chip onRemove={() => setPeriodTo("")}>종료일: {periodTo}</Chip> : null}
              {fStatus ? <Chip onRemove={() => setFStatus("")}>상태: {fStatus}</Chip> : null}
            </div>
            <Button
              variant="secondary"
              onClick={handleResetFilters}
            >
              필터 초기화
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <DataTable columns={policyColumns} rows={currentData} rowKey={(r) => r.id} onRowClick={setSelectedPolicy} sortConfig={sortConfig} onSort={handleSort} />
      </Card>
      <div className="flex items-center pt-2">
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

      {/* Register Policy Drawer */}
      <Drawer open={isRegisterOpen} title="신규 미션 정책 등록" subtitle="신규 미션 정책의 상세 정보를 입력합니다." onClose={() => setIsRegisterOpen(false)} footer={<Button onClick={handleRegisterPolicy} className="w-full">등록하기</Button>}>
        <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#6B778C]">미션 제목 *</label>
                <span className="text-xs text-[#6B778C]">{newPolicyForm.title.length} / 20</span>
              </div>
              <Input value={newPolicyForm.title} onChange={e => setNewPolicyForm({...newPolicyForm, title: e.target.value})} placeholder="예: 스티커 부착" maxLength={20} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#6B778C]">미션 내용</label>
                <span className="text-xs text-[#6B778C]">{newPolicyForm.content.length} / 500</span>
              </div>
              <textarea className="w-full rounded-lg border border-[#E2E8F0] p-2 text-sm min-h-[100px]" value={newPolicyForm.content} onChange={e => setNewPolicyForm({...newPolicyForm, content: e.target.value})} placeholder="미션에 대한 상세 내용을 입력하세요." maxLength={500}></textarea>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B778C]">미션 금액</label>
              <Input type="number" min="0" value={newPolicyForm.amount} onChange={e => setNewPolicyForm({...newPolicyForm, amount: e.target.value})} placeholder="0" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B778C]">상태</label>
              <Select value={newPolicyForm.status} onChange={e => setNewPolicyForm({...newPolicyForm, status: e.target.value})}>
                <option value="활성">활성</option>
                <option value="비활성">비활성</option>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="reqPhoto" className="h-4 w-4 rounded border-gray-300 text-[#0052CC] focus:ring-[#0052CC]" checked={newPolicyForm.requiresPhoto} onChange={e => setNewPolicyForm({...newPolicyForm, requiresPhoto: e.target.checked})} />
              <label htmlFor="reqPhoto" className="text-sm text-[#172B4D]">수행 시 증빙 사진 필수</label>
            </div>
        </div>
      </Drawer>

      {/* Policy Detail Drawer */}
      <Drawer open={!!selectedPolicy} title="미션 정책 상세" subtitle="미션 정책 상세 및 차량 관리" onClose={() => setSelectedPolicy(null)} footer={
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
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-[#6B778C]">미션 제목 *</label>
                      <span className="text-xs text-[#6B778C]">{selectedPolicy.title?.length || 0} / 20</span>
                    </div>
                    <Input value={selectedPolicy.title || ''} onChange={e => setSelectedPolicy({...selectedPolicy, title: e.target.value})} maxLength={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-[#6B778C]">미션 내용</label>
                      <span className="text-xs text-[#6B778C]">{selectedPolicy.content?.length || 0} / 500</span>
                    </div>
                    <textarea className="w-full rounded-lg border border-[#E2E8F0] p-2 text-sm min-h-[100px]" value={selectedPolicy.content || ''} onChange={e => setSelectedPolicy({...selectedPolicy, content: e.target.value})} maxLength={500}></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#6B778C]">미션 금액</label>
                      <Input type="number" min="0" value={selectedPolicy.amount} onChange={e => setSelectedPolicy({...selectedPolicy, amount: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#6B778C]">상태</label>
                      <Select value={selectedPolicy.status} onChange={e => setSelectedPolicy({...selectedPolicy, status: e.target.value})}>
                        <option value="활성">활성</option>
                        <option value="비활성">비활성</option>
                      </Select>
                    </div>
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
                <div className="mt-6 border-t pt-4">
                    <div className="space-y-2 mb-4">
                      <label className="text-xs font-semibold text-[#6B778C]">할당 차량 검색</label>
                      <textarea 
                          className="w-full rounded-lg border border-[#E2E8F0] p-2 text-sm min-h-[60px]"
                          value={vehicleSearchQuery}
                          onChange={e => setVehicleSearchQuery(e.target.value)}
                          placeholder="차량번호를 콤마 또는 엔터로 구분하여 검색..."
                      />
                    </div>
                    <div className="text-sm text-[#6B778C] mb-2">할당된 차량 목록 ({filteredAssignedVehicles.length} / {assignedVehiclesForSelectedPolicy.length}대)</div>
                    <DataTable columns={vehicleColumns} rows={filteredAssignedVehicles} rowKey={r => r.id} />
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
