import React, { useState, useMemo, useEffect } from 'react';
import {
  X, ArrowUpDown, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { cn, Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Badge, Chip, FilterPanel, Drawer, Field, usePagination, DataTable } from '../../components/ui';
import settlementData from '../../mocks/settlement.json';

export default function SettlementPage() {
  const toYmd = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const defaultFrom = toYmd(oneMonthAgo);
  const defaultTo = toYmd(today);

  const [items, setItems] = useState(() => settlementData.map(d => ({ ...d })));

  const [selected, setSelected] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'orderId', direction: 'desc' });
  const [statusFilter, setStatusFilter] = useState("전체");
  const [approvalTypeFilter, setApprovalTypeFilter] = useState("전체");
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [fPartner, setFPartner] = useState("전체");
  const [fRequestType, setFRequestType] = useState("전체");
  const [periodFrom, setPeriodFrom] = useState(defaultFrom);
  const [periodTo, setPeriodTo] = useState(defaultTo);

  const resetFilters = () => {
    setFPartner("전체");
    setFRequestType("전체");
    setPeriodFrom(defaultFrom);
    setPeriodTo(defaultTo);
    setApprovalTypeFilter("전체");
    setStatusFilter("전체");
  };

  // 처리 주체 판별 (영문 닉네임 = 인터널, 한글 이름 = 파트너)
  const getProcessorType = (processor) => {
    if (!processor) return null;
    const isKorean = /[가-힣]/.test(processor);
    return isKorean ? "파트너" : "인터널";
  };

  const columns = [
    { key: "orderId", header: "오더 ID" },
    { key: "plate", header: "차량 번호" },
    { key: "model", header: "차종" },
    { key: "zoneName", header: "존 이름" },
    { key: "partner", header: "파트너 이름" },
    { key: "requestType", header: "요청 유형" },
    { key: "requestedAt", header: "요청 일시" },
    { key: "approvalType", header: "합의 유형" },
    {
      key: "status",
      header: "상태",
      render: (r) => {
        const tone = r.status === "요청" ? "warn" : r.status === "승인" ? "ok" : r.status === "반려" ? "danger" : "default";
        return <Badge tone={tone}>{r.status}</Badge>;
      },
    },
    { key: "processorType", header: "처리 주체", render: (r) => {
      const type = getProcessorType(r.processor);
      return type ? <Badge tone={type === "인터널" ? "ok" : "default"}>{type}</Badge> : <span className="text-[#94A3B8]">-</span>;
    }},
    { key: "processedAt", header: "처리 일시", render: (r) => r.processedAt || <span className="text-[#94A3B8]">-</span> },
  ];

  const handleUpdateStatus = (newStatus, rejectCommentText = "") => {
    if (!selected) return;
    const now = new Date();
    const processedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    // 프로토타입에서는 내부 관리자(brown)로 고정
    const adminName = "brown";
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== selected.id) return it;
        const updates = { ...it, status: newStatus, processedAt, rejectComment: newStatus === "반려" ? rejectCommentText : it.rejectComment };
        if (it.approvalType === "2단계 승인") {
          updates.secondaryProcessor = adminName;
          updates.processor = adminName;
        } else {
          updates.processor = adminName;
        }
        return updates;
      })
    );
    setSelected(null);
    setIsRejecting(false);
    setRejectReason("");
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = items;
    if (fPartner !== "전체") {
      filtered = filtered.filter(item => item.partner === fPartner);
    }
    if (fRequestType !== "전체") {
      filtered = filtered.filter(item => item.requestType === fRequestType);
    }
    if (periodFrom) {
      filtered = filtered.filter(item => item.requestedAt.slice(0, 10) >= periodFrom);
    }
    if (periodTo) {
      filtered = filtered.filter(item => item.requestedAt.slice(0, 10) <= periodTo);
    }
    if (approvalTypeFilter !== "전체") {
      filtered = filtered.filter(item => item.approvalType === approvalTypeFilter);
    }
    if (statusFilter !== "전체") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    if (!sortConfig.key) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortConfig, statusFilter, approvalTypeFilter, fPartner, fRequestType, periodFrom, periodTo]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(filteredAndSortedData, 40);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">합의 요청 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">현장 추가 요금 및 특수 세차 합의 요청 건 처리</div>
        </div>
      </div>

      <FilterPanel
        chips={<>
          {fPartner !== "전체" && <Chip onRemove={() => setFPartner("전체")}>파트너: {fPartner}</Chip>}
          {fRequestType !== "전체" && <Chip onRemove={() => setFRequestType("전체")}>요청 유형: {fRequestType}</Chip>}
          {(periodFrom || periodTo) && <Chip onRemove={() => { setPeriodFrom(defaultFrom); setPeriodTo(defaultTo); }}>요청 일: {periodFrom || "-"} ~ {periodTo || "-"}</Chip>}
          {approvalTypeFilter !== "전체" && <Chip onRemove={() => setApprovalTypeFilter("전체")}>합의 유형: {approvalTypeFilter}</Chip>}
          {statusFilter !== "전체" && <Chip onRemove={() => setStatusFilter("전체")}>상태: {statusFilter}</Chip>}
        </>}
        onReset={resetFilters}
      >
        <div className="md:col-span-2">
          <label htmlFor="fPartner" className="block text-xs font-semibold text-[#6B778C] mb-1.5">파트너 이름</label>
          <Select id="fPartner" value={fPartner} onChange={e => setFPartner(e.target.value)}>
            <option value="전체">전체</option>
            {[...new Set(items.map(i => i.partner))].sort().map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fRequestType" className="block text-xs font-semibold text-[#6B778C] mb-1.5">요청 유형</label>
          <Select id="fRequestType" value={fRequestType} onChange={e => setFRequestType(e.target.value)}>
            <option value="전체">전체</option>
            {[...new Set(items.map(i => i.requestType))].sort().map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="periodFrom" className="block text-xs font-semibold text-[#6B778C] mb-1.5">요청 일 시작</label>
          <Input id="periodFrom" type="date" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="periodTo" className="block text-xs font-semibold text-[#6B778C] mb-1.5">요청 일 종료</label>
          <Input id="periodTo" type="date" value={periodTo} onChange={e => setPeriodTo(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="approvalTypeFilter" className="block text-xs font-semibold text-[#6B778C] mb-1.5">합의 유형</label>
          <Select id="approvalTypeFilter" value={approvalTypeFilter} onChange={e => setApprovalTypeFilter(e.target.value)}>
            <option value="전체">전체</option>
            <option value="1단계 승인">1단계 승인</option>
            <option value="2단계 승인">2단계 승인</option>
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="statusFilter" className="block text-xs font-semibold text-[#6B778C] mb-1.5">상태</label>
          <Select id="statusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="전체">전체</option>
            <option value="요청">요청</option>
            <option value="승인">승인</option>
            <option value="반려">반려</option>
          </Select>
        </div>
      </FilterPanel>

      <DataTable columns={columns} rows={currentData} rowKey={(r) => r.id} onRowClick={setSelected} sortConfig={sortConfig} onSort={handleSort} />
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

      <Drawer
        open={!!selected}
        title={selected ? `합의 요청 상세 - ${selected.id}` : ""}
        onClose={() => { setSelected(null); setIsRejecting(false); }}
        footer={
          selected?.status === "요청" ? (
            <>
              <Button variant="secondary" onClick={() => setIsRejecting(true)}>반려</Button>
              <Button onClick={() => handleUpdateStatus("승인")}>승인</Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setSelected(null)}>닫기</Button>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>요청 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[#172B4D]">
                <Field label="오더 ID" value={selected.orderId} />
                <Field label="차량 번호" value={selected.plate} />
                <Field label="차종" value={selected.model} />
                <Field label="존 이름" value={selected.zoneName} />
                <Field label="파트너 이름" value={selected.partner} />
                <Field label="요청 유형" value={selected.requestType} />
                <Field label="요청 일시" value={selected.requestedAt} />
                <Field label="합의 유형" value={<Badge tone={selected.approvalType === "1단계 승인" ? "ok" : "warn"}>{selected.approvalType}</Badge>} />
                <Field label="상태" value={<Badge tone={selected.status === "요청" ? "warn" : selected.status === "승인" ? "ok" : selected.status === "반려" ? "danger" : "default"}>{selected.status}</Badge>} />
                {selected.approvalType === "2단계 승인" ? (
                  <>
                    <Field label="1차 처리자" value={selected.primaryProcessor || <span className="text-[#94A3B8]">-</span>} />
                    <Field label="2차 처리자" value={selected.secondaryProcessor || <span className="text-[#94A3B8]">-</span>} />
                  </>
                ) : (
                  <>
                    <Field label="처리 주체" value={getProcessorType(selected.processor) ? <Badge tone={getProcessorType(selected.processor) === "인터널" ? "ok" : "default"}>{getProcessorType(selected.processor)}</Badge> : <span className="text-[#94A3B8]">-</span>} />
                    <Field label="처리자" value={selected.processor || <span className="text-[#94A3B8]">-</span>} />
                  </>
                )}
                <Field label="처리 일시" value={selected.processedAt || <span className="text-[#94A3B8]">-</span>} />
                <div className="border-t border-[#E2E8F0] my-3" />
                <div className="flex items-center justify-between gap-3">
                  <div className="w-36 shrink-0 text-xs font-semibold text-[#6B778C]">청구 금액</div>
                  <Input
                    type="number"
                    className="h-8 w-32 text-right"
                    defaultValue={selected.cost}
                    disabled={selected.status !== "요청"}
                  />
                </div>
                <Field label="요청 코멘트" value={selected.requestComment || '-'} />
                {selected.status === '반려' && (
                  <Field label="반려 코멘트" value={<span className="text-rose-600">{selected.rejectComment || '-'}</span>} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>현장 사진</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-32 w-full items-center justify-center rounded-lg bg-[#F4F5F7] text-[#6B778C]">
                  <span className="text-xs">이미지 미리보기 (Placeholder)</span>
                </div>
              </CardContent>
            </Card>

            {isRejecting && (
              <Card className="ring-rose-200">
                <CardHeader>
                  <CardTitle className="text-rose-700">반려 사유 입력</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="반려 사유를 입력하세요"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsRejecting(false)}>취소</Button>
                    <Button variant="danger" onClick={() => handleUpdateStatus("반려", rejectReason)}>반려 확정</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
