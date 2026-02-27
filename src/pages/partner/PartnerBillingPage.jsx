import { useState, useMemo } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight, ExternalLink, Download } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Input, Select, Chip, FilterPanel,
  Drawer, Field, DataTable, usePagination,
} from '../../components/ui';
import billingData from '../../mocks/billing.json';

const WASH_TYPE_OPTIONS = ['내외부', '내부', '외부', '특수', '협의', '라이트', '기계세차'];

function toYmd(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

/* ── 수정 확인 모달 ── */
function SaveConfirmModal({ open, onClose, onConfirm, changes }) {
  if (!open || !changes?.length) return null;
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <Card className="relative z-[1101] w-full max-w-sm">
        <CardHeader><CardTitle>수정 확인</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {changes.map((c, i) => (
            <div key={i} className="text-sm">
              <span className="font-semibold text-[#172B4D]">{c.label}</span>
              <div className="mt-0.5 text-[#6B778C]">
                <span className="line-through">{c.from}</span>{' → '}<span className="text-[#172B4D] font-medium">{c.to}</span>
              </div>
            </div>
          ))}
        </CardContent>
        <div className="flex items-center justify-end gap-2 border-t border-[#DFE1E6] px-5 py-4 bg-[#F4F5F7] rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button onClick={onConfirm}>저장</Button>
        </div>
      </Card>
    </div>
  );
}

/* ── 삭제 확인 모달 ── */
function DeleteConfirmModal({ open, onClose, onConfirm, item }) {
  if (!open || !item) return null;
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <Card className="relative z-[1101] w-full max-w-sm">
        <CardHeader><CardTitle>청구 삭제 확인</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-[#172B4D]">
            해당 청구 건(<b>{item.id}</b>)을 삭제하시겠습니까?
          </p>
          <p className="text-xs text-[#6B778C] mt-2">삭제된 청구 건은 복구할 수 없습니다.</p>
        </CardContent>
        <div className="flex items-center justify-end gap-2 border-t border-[#DFE1E6] px-5 py-4 bg-[#F4F5F7] rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={onConfirm}>삭제</Button>
        </div>
      </Card>
    </div>
  );
}

export default function PartnerBillingPage({ currentPartner }) {
  /* ── 필터 상태 ── */
  const today = new Date();
  const defaultFrom = toYmd(new Date(today.getFullYear(), today.getMonth(), 1));
  const defaultTo = toYmd(new Date(today.getFullYear(), today.getMonth() + 1, 0));
  const [searchOrderId, setSearchOrderId] = useState('');
  const [periodFrom, setPeriodFrom] = useState(defaultFrom);
  const [periodTo, setPeriodTo] = useState(defaultTo);

  const resetFilters = () => { setSearchOrderId(''); setPeriodFrom(defaultFrom); setPeriodTo(defaultTo); };

  /* ── 데이터 ── */
  const [localData, setLocalData] = useState(() =>
    billingData.filter(b => b.partner === currentPartner.partnerName).map(d => ({ ...d }))
  );

  const filteredData = useMemo(() => {
    return localData.filter(item => {
      if (searchOrderId && !item.orderId.toLowerCase().includes(searchOrderId.toLowerCase())) return false;
      const d = item.billedAt.slice(0, 10);
      if (periodFrom && d < periodFrom) return false;
      if (periodTo && d > periodTo) return false;
      return true;
    });
  }, [localData, searchOrderId, periodFrom, periodTo]);

  /* ── 정렬 ── */
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  /* ── 페이지네이션 ── */
  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  /* ── Drawer ── */
  const [selected, setSelected] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [drafts, setDrafts] = useState({ amount: 0, washType: '' });

  const openDrawerView = (item) => { setSelected(item); setIsEditMode(false); };
  const openDrawerEdit = (item) => {
    setSelected(item);
    setIsEditMode(true);
    setDrafts({ amount: item.amount, washType: item.washType });
  };
  const enterEditMode = () => {
    if (!selected) return;
    setIsEditMode(true);
    setDrafts({ amount: selected.amount, washType: selected.washType });
  };
  const cancelEdit = () => { setIsEditMode(false); };
  const closeDrawer = () => { setSelected(null); setIsEditMode(false); };

  /* ── 수정 확인 모달 ── */
  const [isSaveConfirming, setIsSaveConfirming] = useState(false);
  const [pendingChanges, setPendingChanges] = useState([]);

  const handleSave = () => {
    if (!selected) return;
    const changes = [];
    if (drafts.amount !== selected.amount) {
      changes.push({ label: '청구 금액', from: `${selected.amount.toLocaleString()}원`, to: `${Number(drafts.amount).toLocaleString()}원` });
    }
    if (drafts.washType !== selected.washType) {
      changes.push({ label: '세차 유형', from: selected.washType, to: drafts.washType });
    }
    if (changes.length === 0) { setIsEditMode(false); return; }
    setPendingChanges(changes);
    setIsSaveConfirming(true);
  };
  const confirmSave = () => {
    const updated = { ...selected, amount: Number(drafts.amount), washType: drafts.washType };
    setLocalData(prev => prev.map(d => d.id === selected.id ? updated : d));
    setSelected(updated);
    setIsEditMode(false);
    setIsSaveConfirming(false);
    setPendingChanges([]);
  };

  /* ── 삭제 확인 모달 ── */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setLocalData(prev => prev.filter(d => d.id !== deleteTarget.id));
    if (selected?.id === deleteTarget.id) closeDrawer();
    setDeleteTarget(null);
  };

  /* ── 엑셀 다운로드 ── */
  const handleExcelDownload = () => {
    const header = ['청구 ID', '오더 ID', '오더 구분', '세차 유형', '금액', '청구 일시', '차량 번호', '차량 모델'];
    const rows = sortedData.map(r => [r.id, r.orderId, r.orderGroup, r.washType, r.amount, r.billedAt, r.plate, r.model]);
    const bom = '\uFEFF';
    const csv = bom + [header, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `청구내역_${currentPartner.partnerName}_${toYmd(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── 테이블 컬럼 ── */
  const columns = [
    { key: 'id', header: '청구 ID', sortable: true },
    { key: 'orderId', header: '오더 ID', sortable: true },
    { key: 'orderGroup', header: '오더 구분' },
    { key: 'washType', header: '세차 유형' },
    { key: 'amount', header: '금액', sortable: true, render: r => `${r.amount.toLocaleString()}원` },
    { key: 'billedAt', header: '청구 일시', sortable: true },
    { key: '_actions', header: '', render: r => (
      <div className="flex items-center gap-1">
        <button onClick={e => { e.stopPropagation(); openDrawerEdit(r); }} className="p-1 rounded hover:bg-slate-100" title="수정">
          <Pencil className="h-4 w-4 text-[#6B778C]" />
        </button>
        <button onClick={e => { e.stopPropagation(); setDeleteTarget(r); }} className="p-1 rounded hover:bg-red-50" title="삭제">
          <Trash2 className="h-4 w-4 text-[#6B778C]" />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      {/* ── 헤더 ── */}
      <div>
        <div className="text-base font-bold text-[#172B4D]">청구 관리</div>
        <div className="mt-1 text-sm text-[#6B778C]">{currentPartner.partnerName}의 청구 내역을 조회하고 관리합니다.</div>
      </div>

      {/* ── 필터 ── */}
      <FilterPanel
        chips={<>
          {searchOrderId && <Chip onRemove={() => setSearchOrderId('')}>오더 ID: {searchOrderId}</Chip>}
          {(periodFrom || periodTo) && <Chip onRemove={() => { setPeriodFrom(''); setPeriodTo(''); }}>기간: {periodFrom || '-'} ~ {periodTo || '-'}</Chip>}
        </>}
        onReset={resetFilters}
      >
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">오더 ID</label>
          <Input type="text" placeholder="오더 ID 검색" value={searchOrderId} onChange={e => setSearchOrderId(e.target.value)} />
        </div>
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">청구 일시</label>
          <div className="flex items-center gap-2">
            <Input type="date" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} />
            <span className="text-sm text-[#6B778C] shrink-0">~</span>
            <Input type="date" value={periodTo} onChange={e => setPeriodTo(e.target.value)} />
          </div>
        </div>
      </FilterPanel>

      {/* ── 건수 + 엑셀 다운로드 ── */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-[#6B778C]">
          필터된 결과 <b>{filteredData.length}</b>건 / 전체 <b>{localData.length}</b>건
        </div>
        <Button variant="outline" size="sm" onClick={handleExcelDownload}>
          <Download className="mr-1.5 h-3.5 w-3.5 text-green-600" />
          엑셀 다운로드
        </Button>
      </div>

      {/* ── 테이블 ── */}
      <DataTable
        columns={columns}
        rows={currentData}
        rowKey={r => r.id}
        onRowClick={openDrawerView}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

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
        title={selected ? `청구 ${isEditMode ? '수정' : '상세'} - ${selected.id}` : ''}
        onClose={closeDrawer}
        footer={
          selected && (
            isEditMode ? (
              <>
                <Button variant="secondary" onClick={cancelEdit}>취소</Button>
                <Button onClick={handleSave}>저장</Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={closeDrawer}>닫기</Button>
                <div className="flex-1" />
                <Button onClick={enterEditMode}>수정</Button>
                <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => setDeleteTarget(selected)}>삭제</Button>
              </>
            )
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>청구 정보</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-[#172B4D]">
                <Field label="청구 ID" value={selected.id} />
                <Field label="오더 ID" value={
                  <a href={`/?app=partner&page=partner-orders&orderId=${selected.orderId}`} target="_blank" rel="noopener noreferrer" className="text-[#0052CC] hover:underline inline-flex items-center gap-1">
                    {selected.orderId} <ExternalLink className="h-3 w-3" />
                  </a>
                } />
                {isEditMode ? (
                  <>
                    <Field label="청구 금액" value={
                      <Input type="number" value={drafts.amount} onChange={e => setDrafts(prev => ({ ...prev, amount: e.target.value }))} className="w-40" />
                    } />
                    <Field label="세차 유형" value={
                      <Select value={drafts.washType} onChange={e => setDrafts(prev => ({ ...prev, washType: e.target.value }))}>
                        {WASH_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </Select>
                    } />
                  </>
                ) : (
                  <>
                    <Field label="청구 금액" value={`${selected.amount.toLocaleString()}원`} />
                    <Field label="세차 유형" value={selected.washType} />
                  </>
                )}
                <Field label="청구 일시" value={selected.billedAt} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>오더 정보</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-[#172B4D]">
                <Field label="오더 구분" value={selected.orderGroup} />
                <Field label="차량 번호" value={selected.plate} />
                <Field label="차량 모델" value={selected.model} />
              </CardContent>
            </Card>
          </div>
        )}
      </Drawer>

      {/* ── 수정 확인 모달 ── */}
      <SaveConfirmModal
        open={isSaveConfirming}
        onClose={() => setIsSaveConfirming(false)}
        onConfirm={confirmSave}
        changes={pendingChanges}
      />

      {/* ── 삭제 확인 모달 ── */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        item={deleteTarget}
      />
    </div>
  );
}
