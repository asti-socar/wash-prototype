import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Input, Select, Badge, Chip, FilterPanel,
  Drawer, Field, usePagination, DataTable,
} from '../../components/ui';
import settlementData from '../../mocks/settlement.json';

function toYmd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function nowTimestamp() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')} ${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
}

const STATUS_TONE = { "요청": "warn", "승인": "ok", "반려": "danger", "인터널 허가요청": "info" };

export default function PartnerSettlementPage({ currentPartner }) {
  /* ── 필터 상태 ── */
  const today = new Date();
  const oneMonthAgo = new Date(today); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const defaultFrom = toYmd(oneMonthAgo);
  const defaultTo = toYmd(today);

  const [fSearch, setFSearch] = useState("");
  const [fRequestType, setFRequestType] = useState("전체");
  const [periodFrom, setPeriodFrom] = useState(defaultFrom);
  const [periodTo, setPeriodTo] = useState(defaultTo);
  const [approvalTypeFilter, setApprovalTypeFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");

  const resetFilters = () => {
    setFSearch("");
    setFRequestType("전체");
    setPeriodFrom(defaultFrom);
    setPeriodTo(defaultTo);
    setApprovalTypeFilter("전체");
    setStatusFilter("전체");
  };

  /* ── 데이터 ── */
  const [items, setItems] = useState(() =>
    settlementData.filter(d => d.partner === currentPartner.partnerName).map(d => ({ ...d }))
  );

  /* ── 처리 주체 판별 ── */
  const getProcessorType = (processor) => {
    if (!processor) return null;
    if (processor === "시스템") return "시스템";
    return /[가-힣]/.test(processor) ? "파트너" : "인터널";
  };

  /* ── 필터 + 정렬 ── */
  const [sortConfig, setSortConfig] = useState({ key: 'orderId', direction: 'desc' });
  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = items;
    if (fSearch.trim()) {
      const q = fSearch.trim().toLowerCase();
      filtered = filtered.filter(i => i.orderId.toLowerCase().includes(q) || i.plate.toLowerCase().includes(q));
    }
    if (fRequestType !== "전체") filtered = filtered.filter(i => i.requestType === fRequestType);
    if (periodFrom) filtered = filtered.filter(i => i.requestedAt.slice(0, 10) >= periodFrom);
    if (periodTo) filtered = filtered.filter(i => i.requestedAt.slice(0, 10) <= periodTo);
    if (approvalTypeFilter !== "전체") filtered = filtered.filter(i => i.approvalType === approvalTypeFilter);
    if (statusFilter !== "전체") filtered = filtered.filter(i => i.status === statusFilter);
    if (!sortConfig.key) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, fSearch, fRequestType, periodFrom, periodTo, approvalTypeFilter, statusFilter, sortConfig]);

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(filteredAndSortedData, 40);

  /* ── Drawer ── */
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRejectConfirming, setIsRejectConfirming] = useState(false);

  const closeDrawer = () => { setSelected(null); setIsRejecting(false); setIsRejectConfirming(false); setRejectReason(''); };

  /* ── 승인/반려 처리 ── */
  const handleUpdateStatus = (newStatus, rejectCommentText = '') => {
    if (!selected) return;
    const partnerAccount = 'partner@gangnam.kr';
    let updatedItem = null;

    setItems(prev => prev.map(it => {
      if (it.id !== selected.id) return it;

      if (newStatus === '반려') {
        const updates = { ...it, status: '반려', processor: partnerAccount, processedAt: nowTimestamp(), rejectComment: rejectCommentText };
        updatedItem = updates;
        return updates;
      }

      // 승인
      if (it.approvalType === '2단계 승인') {
        // 파트너 1차 승인 → 인터널 허가요청 상태
        const updates = { ...it, status: '인터널 허가요청' };
        updatedItem = updates;
        return updates;
      } else {
        // 1단계: 바로 승인 완료
        const updates = { ...it, status: '승인', processor: partnerAccount, processedAt: nowTimestamp() };
        updatedItem = updates;
        return updates;
      }
    }));

    if (newStatus === '반려' && updatedItem) {
      setSelected(updatedItem);
    } else {
      setSelected(null);
    }
    setIsRejecting(false);
    setIsRejectConfirming(false);
    setRejectReason('');
  };

  /* ── 테이블 컬럼 ── */
  const columns = [
    { key: 'orderId', header: '오더 ID' },
    { key: 'plate', header: '차량 번호' },
    { key: 'model', header: '차종' },
    { key: 'zoneName', header: '존 이름' },
    { key: 'requestType', header: '요청 유형' },
    { key: 'washBefore', header: '변경 전', render: r => r.washBefore === '-' ? <span className="text-[#94A3B8]">-</span> : r.washBefore },
    { key: 'washAfter', header: '변경 후', render: r => r.washAfter === '-' ? <span className="text-[#94A3B8]">-</span> : r.washAfter },
    { key: 'approvalType', header: '합의 유형' },
    {
      key: 'status', header: '상태',
      render: r => <Badge tone={STATUS_TONE[r.status] || 'default'}>{r.status}</Badge>,
    },
    {
      key: 'processorType', header: '처리 주체',
      render: r => {
        const type = getProcessorType(r.processor);
        return type || <span className="text-[#94A3B8]">-</span>;
      },
    },
    { key: 'requestedAt', header: '요청 일시' },
    { key: 'processedAt', header: '처리 일시', render: r => r.processedAt || <span className="text-[#94A3B8]">-</span> },
  ];

  /* ── Footer 조건 ── */
  const drawerFooter = selected?.status === '요청' ? (
    <>
      <Button variant="secondary" onClick={() => setIsRejecting(true)}>반려</Button>
      <Button onClick={() => {
        const msg = selected.approvalType === '2단계 승인'
          ? '1차 승인 후 인터널 관리자에게 허가 요청이 전달됩니다. 승인하시겠습니까?'
          : '승인 후 청구금액 수정이 불가능합니다. 승인하시겠습니까?';
        if (!window.confirm(msg)) return;
        handleUpdateStatus('승인');
      }}>승인</Button>
    </>
  ) : (
    <Button variant="secondary" onClick={closeDrawer}>닫기</Button>
  );

  return (
    <div className="space-y-4">
      {/* ── 헤더 ── */}
      <div>
        <div className="text-base font-bold text-[#172B4D]">합의 요청 관리</div>
        <div className="mt-1 text-sm text-[#6B778C]">{currentPartner.partnerName}의 합의 요청 현황을 조회하고 처리합니다.</div>
      </div>

      {/* ── 필터 ── */}
      <FilterPanel
        chips={<>
          {fSearch.trim() && <Chip onRemove={() => setFSearch("")}>검색: {fSearch}</Chip>}
          {fRequestType !== "전체" && <Chip onRemove={() => setFRequestType("전체")}>요청 유형: {fRequestType}</Chip>}
          {(periodFrom || periodTo) && <Chip onRemove={() => { setPeriodFrom(defaultFrom); setPeriodTo(defaultTo); }}>요청 일시: {periodFrom || '-'} ~ {periodTo || '-'}</Chip>}
          {approvalTypeFilter !== "전체" && <Chip onRemove={() => setApprovalTypeFilter("전체")}>합의 유형: {approvalTypeFilter}</Chip>}
          {statusFilter !== "전체" && <Chip onRemove={() => setStatusFilter("전체")}>상태: {statusFilter}</Chip>}
        </>}
        onReset={resetFilters}
      >
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">오더 ID / 차량 번호</label>
          <Input type="text" placeholder="오더 ID 또는 차량 번호 검색" value={fSearch} onChange={e => setFSearch(e.target.value)} />
        </div>
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">요청 일시</label>
          <div className="flex items-center gap-2">
            <Input type="date" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} />
            <span className="text-sm text-[#6B778C] shrink-0">~</span>
            <Input type="date" value={periodTo} onChange={e => setPeriodTo(e.target.value)} />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">요청 유형</label>
          <Select value={fRequestType} onChange={e => setFRequestType(e.target.value)}>
            <option value="전체">전체</option>
            <option value="현장 변경">현장 변경</option>
            <option value="전환">전환</option>
            <option value="입고 변경">입고 변경</option>
            <option value="추가 미션">추가 미션</option>
          </Select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">합의 유형</label>
          <Select value={approvalTypeFilter} onChange={e => setApprovalTypeFilter(e.target.value)}>
            <option value="전체">전체</option>
            <option value="자동 승인">자동 승인</option>
            <option value="1단계 승인">1단계 승인</option>
            <option value="2단계 승인">2단계 승인</option>
          </Select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">상태</label>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="전체">전체</option>
            <option value="요청">요청</option>
            <option value="승인">승인</option>
            <option value="반려">반려</option>
            <option value="인터널 허가요청">인터널 허가요청</option>
          </Select>
        </div>
      </FilterPanel>

      {/* ── 테이블 ── */}
      <DataTable columns={columns} rows={currentData} rowKey={r => r.id} onRowClick={setSelected} sortConfig={sortConfig} onSort={handleSort} />

      {/* ── 페이지네이션 ── */}
      <div className="flex items-center justify-end pt-2">
        <div className="flex items-center gap-2 text-sm text-[#6B778C]">
          <span>
            {totalItems > 0
              ? `${(currentPage - 1) * 40 + 1} - ${Math.min(currentPage * 40, totalItems)} / ${totalItems.toLocaleString()}`
              : '0 - 0 / 0'}
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

      {/* ── Drawer ── */}
      <Drawer
        open={!!selected}
        title={selected ? `합의 요청 상세 - ${selected.id}` : ''}
        onClose={closeDrawer}
        footer={drawerFooter}
      >
        {selected && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>요청 정보</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-[#172B4D]">
                <Field label="오더 ID" value={selected.orderId} />
                <Field label="차량 번호" value={selected.plate} />
                <Field label="차종" value={selected.model} />
                <Field label="존 이름" value={selected.zoneName} />
                <Field label="요청 유형" value={selected.requestType} />
                <Field label="변경 전" value={selected.washBefore === '-' ? <span className="text-[#94A3B8]">-</span> : selected.washBefore} />
                <Field label="변경 후" value={selected.washAfter === '-' ? <span className="text-[#94A3B8]">-</span> : selected.washAfter} />
                <Field label="요청 일시" value={selected.requestedAt} />
                <Field label="합의 유형" value={selected.approvalType} />
                <Field label="상태" value={<Badge tone={STATUS_TONE[selected.status] || 'default'}>{selected.status}</Badge>} />
                {selected.approvalType === '자동 승인' ? (
                  <>
                    <Field label="처리 주체" value="시스템" />
                    <Field label="처리 일시" value={selected.processedAt || <span className="text-[#94A3B8]">-</span>} />
                  </>
                ) : selected.approvalType === '2단계 승인' ? (
                  <>
                    <Field label="1차 처리자" value={selected.primaryProcessor || <span className="text-[#94A3B8]">-</span>} />
                    <Field label="2차 처리자" value={selected.secondaryProcessor || <span className="text-[#94A3B8]">-</span>} />
                    <Field label="처리 일시" value={selected.processedAt || <span className="text-[#94A3B8]">-</span>} />
                  </>
                ) : (
                  <>
                    <Field label="처리 주체" value={getProcessorType(selected.processor) || <span className="text-[#94A3B8]">-</span>} />
                    <Field label="처리자" value={selected.processor || <span className="text-[#94A3B8]">-</span>} />
                    <Field label="처리 일시" value={selected.processedAt || <span className="text-[#94A3B8]">-</span>} />
                  </>
                )}
                <div className="border-t border-[#E2E8F0] my-3" />
                <div className="flex items-center justify-between gap-3">
                  <div className="w-36 shrink-0 text-xs font-semibold text-[#6B778C]">청구 금액</div>
                  <Input type="number" className="h-8 w-32 text-right" defaultValue={selected.cost} disabled={selected.status !== '요청'} />
                </div>
                <Field label="요청 코멘트" value={selected.requestComment || '-'} />
                {selected.status === '반려' && (
                  <Field label="반려 코멘트" value={<span className="text-rose-600">{selected.rejectComment || '-'}</span>} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>현장 사진</CardTitle></CardHeader>
              <CardContent>
                <div className="flex h-32 w-full items-center justify-center rounded-lg bg-[#F4F5F7] text-[#6B778C]">
                  <span className="text-xs">이미지 미리보기 (Placeholder)</span>
                </div>
              </CardContent>
            </Card>

            {/* ── 반려 사유 입력 모달 ── */}
            {isRejecting && !isRejectConfirming && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                  <div className="mb-4 text-base font-bold text-[#172B4D]">반려 사유 입력</div>
                  <Input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="반려 사유를 입력하세요 (필수)" autoFocus />
                  {!rejectReason.trim() && (
                    <div className="mt-1.5 text-xs text-rose-500">반려 사유는 필수 입력입니다.</div>
                  )}
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => { setIsRejecting(false); setRejectReason(''); }}>취소</Button>
                    <Button className="bg-rose-600 hover:bg-rose-700" disabled={!rejectReason.trim()} onClick={() => setIsRejectConfirming(true)}>반려 확정</Button>
                  </div>
                </div>
              </div>
            )}

            {/* ── 반려 최종 확인 모달 ── */}
            {isRejectConfirming && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                  <div className="mb-4 text-base font-bold text-[#172B4D]">반려 최종 확인</div>
                  <div className="space-y-2.5 rounded-lg bg-[#F4F5F7] p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#6B778C]">요청 유형</span>
                      <span className="font-medium text-[#172B4D]">{selected?.requestType}</span>
                    </div>
                    {selected?.washBefore !== '-' && (
                      <div className="flex justify-between">
                        <span className="text-[#6B778C]">변경</span>
                        <span className="font-medium text-[#172B4D]">{selected?.washBefore} → {selected?.washAfter}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#6B778C]">청구 금액</span>
                      <span className="font-medium text-[#172B4D]">{Number(selected?.cost).toLocaleString()}원</span>
                    </div>
                    <div className="border-t border-[#DFE1E6] my-1" />
                    <div>
                      <span className="text-[#6B778C]">반려 사유</span>
                      <div className="mt-1 font-medium text-rose-600">{rejectReason}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-[#6B778C]">위 내용으로 반려 처리합니다. 계속하시겠습니까?</div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsRejectConfirming(false)}>이전</Button>
                    <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => handleUpdateStatus('반려', rejectReason)}>반려 처리</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
