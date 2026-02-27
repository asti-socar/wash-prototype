import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Plus, Search, Pencil } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  Field,
  Chip,
  Drawer,
  usePagination,
  DataTable,
  FilterPanel,
} from '../../components/ui';

// 강남모빌리티 소속 수행원 목업 데이터
const INITIAL_WORKERS = [
  {
    id: 'W-001', name: '최수행', phone: '010-1234-5678', status: '활성', penalty: 1,
    penaltyHistory: [
      { orderId: 'O-90028', reason: '미예약', date: '2026-01-28' },
    ],
    zones: [
      { zoneName: '강남역 1번존', zoneId: 'Z-1001', region1: '서울', region2: '강남' },
      { zoneName: '역삼역 1번존', zoneId: 'Z-1003', region1: '서울', region2: '강남' },
    ],
  },
  {
    id: 'W-002', name: '강수행', phone: '010-2345-6789', status: '활성', penalty: 0,
    penaltyHistory: [],
    zones: [
      { zoneName: '잠실역 2번존', zoneId: 'Z-1002', region1: '서울', region2: '송파' },
      { zoneName: '잠실새내역 1번존', zoneId: 'Z-1006', region1: '서울', region2: '송파' },
      { zoneName: '석촌역 1번존', zoneId: 'Z-1007', region1: '서울', region2: '송파' },
    ],
  },
  {
    id: 'W-003', name: '한수행', phone: '010-3456-7890', status: '활성', penalty: 0,
    penaltyHistory: [],
    zones: [
      { zoneName: '판교 1번존', zoneId: 'Z-2001', region1: '경기', region2: '성남' },
    ],
  },
  {
    id: 'W-004', name: '오수행', phone: '010-4567-8901', status: '활성', penalty: 2,
    penaltyHistory: [
      { orderId: 'O-90038', reason: '미예약', date: '2026-02-03' },
      { orderId: 'O-90033', reason: '노쇼', date: '2026-02-01' },
    ],
    zones: [
      { zoneName: '건대입구 1번존', zoneId: 'Z-1004', region1: '서울', region2: '광진' },
      { zoneName: '성수역 1번존', zoneId: 'Z-1008', region1: '서울', region2: '성동' },
      { zoneName: '왕십리역 1번존', zoneId: 'Z-1009', region1: '서울', region2: '성동' },
      { zoneName: '어린이대공원 1번존', zoneId: 'Z-1010', region1: '서울', region2: '광진' },
    ],
  },
  {
    id: 'W-005', name: '박수행', phone: '010-5678-9012', status: '활성', penalty: 1,
    penaltyHistory: [
      { orderId: 'O-90028', reason: '미예약', date: '2026-01-28' },
    ],
    zones: [],
  },
  {
    id: 'W-008', name: '정수행', phone: '010-8901-2345', status: '비활성', penalty: 1,
    penaltyHistory: [
      { orderId: 'O-90028', reason: '미예약', date: '2026-01-28' },
    ],
    zones: [
      { zoneName: '서면역 1번존', zoneId: 'Z-3001', region1: '부산', region2: '부산진' },
    ],
  },
];

// ============== 수행원 등록 Drawer ==============
function WorkerCreateDrawer({ open, onClose, onSave, nextId }) {
  const [form, setForm] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    setForm({ name: '', phone: '' });
    setErrors({});
    onClose();
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = '이름을 입력해주세요.';
    if (!form.phone.trim()) errs.phone = '연락처를 입력해주세요.';
    else if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(form.phone.replace(/-/g, '').replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3') ? form.phone : form.phone)) {
      // 간단한 전화번호 형식 체크
      if (!/^\d{10,11}$/.test(form.phone.replace(/-/g, ''))) errs.phone = '올바른 연락처 형식이 아닙니다.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const phoneDigits = form.phone.replace(/-/g, '');
    const formatted = phoneDigits.length === 11
      ? `${phoneDigits.slice(0,3)}-${phoneDigits.slice(3,7)}-${phoneDigits.slice(7)}`
      : `${phoneDigits.slice(0,3)}-${phoneDigits.slice(3,6)}-${phoneDigits.slice(6)}`;
    onSave({
      id: nextId,
      name: form.name.trim(),
      phone: formatted,
      status: '활성',
      penalty: 0,
      penaltyHistory: [],
      zones: [],
    });
    handleClose();
  };

  return (
    <Drawer
      open={open}
      title="수행원 등록"
      onClose={handleClose}
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>취소</Button>
          <Button onClick={handleSave}>등록</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>수행원 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">수행원 ID</label>
              <Input value={nextId} disabled />
              <p className="text-[10px] text-[#6B778C] mt-1">자동 부여됩니다.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">이름 <span className="text-rose-500">*</span></label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="이름을 입력하세요" />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">연락처 <span className="text-rose-500">*</span></label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="010-0000-0000" />
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </Drawer>
  );
}

// ============== Main Component ==============
export default function PartnerWorkersPage({ currentPartner }) {
  const [workers, setWorkers] = useState(() => INITIAL_WORKERS.map(w => ({ ...w })));
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', status: '' });
  const [editErrors, setEditErrors] = useState({});
  const [createOpen, setCreateOpen] = useState(false);

  // 필터
  const [searchField, setSearchField] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  // 다음 수행원 ID 계산
  const nextWorkerId = useMemo(() => {
    const maxNum = workers.reduce((max, w) => {
      const num = parseInt(w.id.replace('W-', ''), 10);
      return num > max ? num : max;
    }, 0);
    return `W-${String(maxNum + 1).padStart(3, '0')}`;
  }, [workers]);

  // 필터링
  const filteredData = useMemo(() => {
    return workers.filter(w => {
      if (fStatus && w.status !== fStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (searchField === 'name' && !w.name.toLowerCase().includes(q)) return false;
        if (searchField === 'id' && !w.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [workers, searchQuery, searchField, fStatus]);

  // 정렬
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal, bVal;
      if (sortConfig.key === 'zoneCount') {
        aVal = a.zones.length;
        bVal = b.zones.length;
      } else {
        aVal = a[sortConfig.key] ?? '';
        bVal = b[sortConfig.key] ?? '';
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  // 수행원 등록
  const handleCreate = useCallback((newWorker) => {
    setWorkers(prev => [newWorker, ...prev]);
  }, []);

  // 수행원 수정
  const handleEdit = useCallback(() => {
    setEditForm({ name: selected.name, phone: selected.phone || '', status: selected.status });
    setEditErrors({});
    setEditMode(true);
  }, [selected]);

  const handleEditCancel = useCallback(() => {
    setEditMode(false);
    setEditErrors({});
  }, []);

  const handleEditSave = useCallback(() => {
    const errs = {};
    if (!editForm.name.trim()) errs.name = '이름을 입력해주세요.';
    if (!editForm.phone.trim()) errs.phone = '연락처를 입력해주세요.';
    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const phoneDigits = editForm.phone.replace(/-/g, '');
    const formatted = phoneDigits.length === 11
      ? `${phoneDigits.slice(0,3)}-${phoneDigits.slice(3,7)}-${phoneDigits.slice(7)}`
      : `${phoneDigits.slice(0,3)}-${phoneDigits.slice(3,6)}-${phoneDigits.slice(6)}`;

    const updates = { name: editForm.name.trim(), phone: formatted, status: editForm.status };
    setWorkers(prev => prev.map(w => w.id === selected.id ? { ...w, ...updates } : w));
    setSelected(prev => ({ ...prev, ...updates }));
    setEditMode(false);
  }, [selected, editForm]);

  const handleRowClick = useCallback((row) => {
    setSelected(row);
    setEditMode(false);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setSelected(null);
    setEditMode(false);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchField('name');
    setSearchQuery('');
    setFStatus('');
  }, []);

  const columns = [
    { key: 'id', header: '수행원 ID' },
    { key: 'name', header: '이름' },
    { key: 'phone', header: '연락처', render: (r) => r.phone || '-' },
    { key: 'status', header: '상태', render: (r) => (
      <Badge tone={r.status === '활성' ? 'ok' : 'default'}>{r.status}</Badge>
    )},
    { key: 'zoneCount', header: '배정 존 개수', render: (r) => r.zones.length },
    { key: 'penalty', header: '벌점', sortable: true, render: (r) => {
      if (r.penalty === 0) return <span className="text-[#94A3B8]">0</span>;
      return <Badge tone="danger">{r.penalty}</Badge>;
    }},
    { key: '_actions', header: '', render: (r) => (
      <button
        className="p-1 rounded hover:bg-[#F4F5F7] text-[#6B778C] hover:text-[#172B4D]"
        onClick={(e) => { e.stopPropagation(); setSelected(r); setEditMode(true); setEditForm({ name: r.name, phone: r.phone || '', status: r.status }); setEditErrors({}); }}
        title="수정"
      >
        <Pencil className="h-4 w-4" />
      </button>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">수행원 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">{currentPartner.partnerName} 소속 수행원을 관리합니다.</div>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          수행원 등록
        </Button>
      </div>

      <FilterPanel
        chips={<>
          {searchQuery ? <Chip onRemove={() => setSearchQuery('')}>{searchField === 'name' ? '이름' : '수행원 ID'}: {searchQuery}</Chip> : null}
          {fStatus ? <Chip onRemove={() => setFStatus('')}>상태: {fStatus}</Chip> : null}
        </>}
        onReset={resetFilters}
      >
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색항목</label>
          <Select value={searchField} onChange={e => setSearchField(e.target.value)}>
            <option value="name">이름</option>
            <option value="id">수행원 ID</option>
          </Select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색어</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B778C]" />
            <Input className="pl-9" placeholder="검색어를 입력하세요" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">상태</label>
          <Select value={fStatus} onChange={e => setFStatus(e.target.value)}>
            <option value="">전체</option>
            <option value="활성">활성</option>
            <option value="비활성">비활성</option>
          </Select>
        </div>
      </FilterPanel>

      <div className="text-xs text-[#6B778C]">
        {filteredData.length !== workers.length ? `필터된 결과 ${filteredData.length}건 / ` : ''}
        전체 <b className="text-[#172B4D]">{workers.length}</b>건
      </div>

      <DataTable columns={columns} rows={currentData} rowKey={r => r.id} onRowClick={handleRowClick} sortConfig={sortConfig} onSort={handleSort} />
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

      {/* 상세/수정 Drawer */}
      <Drawer
        open={!!selected}
        title={editMode ? `수행원 수정 - ${selected?.id}` : `수행원 상세 - ${selected?.id}`}
        subtitle={selected?.name}
        onClose={handleDrawerClose}
        footer={
          editMode ? (
            <div className="flex w-full justify-end gap-2">
              <Button variant="secondary" onClick={handleEditCancel}>취소</Button>
              <Button onClick={handleEditSave}>저장</Button>
            </div>
          ) : (
            <div className="flex w-full justify-between">
              <Button variant="secondary" onClick={handleDrawerClose}>닫기</Button>
              <Button onClick={handleEdit}>수정</Button>
            </div>
          )
        }
      >
        {selected && !editMode && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>기본 정보</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Field label="수행원 ID" value={selected.id} />
                <Field label="이름" value={selected.name} />
                <Field label="연락처" value={selected.phone || '-'} />
                <Field label="상태" value={<Badge tone={selected.status === '활성' ? 'ok' : 'default'}>{selected.status}</Badge>} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>배정된 쏘카존</CardTitle></CardHeader>
              <CardContent>
                {selected.zones.length === 0 ? (
                  <div className="text-sm text-[#94A3B8] py-2">배정된 쏘카존이 없습니다.</div>
                ) : (
                  <div className="space-y-2">
                    {selected.zones.map((z, idx) => (
                      <div key={idx} className="rounded-lg bg-slate-50 p-3 text-sm text-[#172B4D] flex items-center justify-between">
                        <span>{z.zoneName} ({z.zoneId})</span>
                        <span className="text-xs text-[#6B778C]">{z.region1}/{z.region2}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>벌점 이력</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Field label="벌점" value={selected.penalty === 0 ? <span className="text-[#94A3B8]">0</span> : <Badge tone="danger">{selected.penalty}</Badge>} />
                {selected.penaltyHistory.length === 0 ? (
                  <div className="text-sm text-[#94A3B8] py-2">벌점 이력이 없습니다.</div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
                    <table className="min-w-full text-sm">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">오더 ID</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">사유</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">일자</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {selected.penaltyHistory.map((h, idx) => (
                          <tr key={idx} className="hover:bg-[#F8FAFC]">
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center gap-1 text-[#0052CC] font-medium">
                                {h.orderId}
                                <ExternalLink className="h-3 w-3" />
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <Badge tone={h.reason === '노쇼' ? 'danger' : 'warn'}>{h.reason}</Badge>
                            </td>
                            <td className="px-4 py-2.5 text-[#6B778C]">{h.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {selected && editMode && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>기본 정보</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">수행원 ID</label>
                  <Input value={selected.id} disabled />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">이름 <span className="text-rose-500">*</span></label>
                  <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                  {editErrors.name && <p className="text-xs text-rose-500 mt-1">{editErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">연락처 <span className="text-rose-500">*</span></label>
                  <Input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="010-0000-0000" />
                  {editErrors.phone && <p className="text-xs text-rose-500 mt-1">{editErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">상태</label>
                  <Select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="활성">활성</option>
                    <option value="비활성">비활성</option>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>배정된 쏘카존</CardTitle></CardHeader>
              <CardContent>
                {selected.zones.length === 0 ? (
                  <div className="text-sm text-[#94A3B8] py-2">배정된 쏘카존이 없습니다.</div>
                ) : (
                  <div className="space-y-2">
                    {selected.zones.map((z, idx) => (
                      <div key={idx} className="rounded-lg bg-slate-50 p-3 text-sm text-[#172B4D] flex items-center justify-between">
                        <span>{z.zoneName} ({z.zoneId})</span>
                        <span className="text-xs text-[#6B778C]">{z.region1}/{z.region2}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-[#6B778C] mt-2">쏘카존 배정은 "수행원 배정" 메뉴에서 관리합니다.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>벌점 이력</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Field label="벌점" value={selected.penalty === 0 ? <span className="text-[#94A3B8]">0</span> : <Badge tone="danger">{selected.penalty}</Badge>} />
                {selected.penaltyHistory.length === 0 ? (
                  <div className="text-sm text-[#94A3B8] py-2">벌점 이력이 없습니다.</div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
                    <table className="min-w-full text-sm">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">오더 ID</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">사유</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">일자</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {selected.penaltyHistory.map((h, idx) => (
                          <tr key={idx} className="hover:bg-[#F8FAFC]">
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center gap-1 text-[#0052CC] font-medium">
                                {h.orderId}
                                <ExternalLink className="h-3 w-3" />
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <Badge tone={h.reason === '노쇼' ? 'danger' : 'warn'}>{h.reason}</Badge>
                            </td>
                            <td className="px-4 py-2.5 text-[#6B778C]">{h.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </Drawer>

      {/* 수행원 등록 Drawer */}
      <WorkerCreateDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
        nextId={nextWorkerId}
      />
    </div>
  );
}
