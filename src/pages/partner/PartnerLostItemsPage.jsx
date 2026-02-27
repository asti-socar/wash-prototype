import { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plus } from 'lucide-react';
import {
  toYmd, Card, CardHeader, CardTitle, CardContent,
  Button, Input, Select, Badge, Chip, FilterPanel,
  Drawer, Field, DataTable, usePagination, PillTabs,
} from '../../components/ui';
import allLostItems from '../../mocks/lostItems.json';
import allVehicles from '../../mocks/orders-vehicles.json';

// --- CONSTANTS ---
const TERMINAL_STATUSES = ['발송 완료', '경찰서 인계', '폐기 완료'];

const statusBadgeMap = {
  '배송지 미입력': 'warn',
  '발송 대기': 'info',
  '발송 완료': 'ok',
  '폐기 완료': 'default',
  '경찰서 인계': 'default',
};

const allStatusOptions = ['배송지 미입력', '발송 대기', '발송 완료', '경찰서 인계', '폐기 완료'];


// --- MAIN COMPONENT ---
export default function PartnerLostItemsPage({ currentPartner, setActiveKey }) {
  const [items, setItems] = useState(() =>
    allLostItems.filter(i => i.partnerName === currentPartner.partnerName).map(i => ({ ...i }))
  );

  // Filter states
  const [searchField, setSearchField] = useState('carNumber');
  const [searchText, setSearchText] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [periodFrom, setPeriodFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 2); return toYmd(d);
  });
  const [periodTo, setPeriodTo] = useState(() => toYmd(new Date()));

  // Sort
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  // Drawer
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Draft states for inline Input editing
  const [drafts, setDrafts] = useState({});
  const setDraft = (key, val) => setDrafts(p => ({ ...p, [key]: val }));

  // Drawer tab
  const [drawerTab, setDrawerTab] = useState('detail');

  // Save confirmation popup
  const [isSaveConfirming, setIsSaveConfirming] = useState(false);
  const [pendingChanges, setPendingChanges] = useState([]);

  // Address states
  const [draftAddr1, setDraftAddr1] = useState('');
  const [draftAddr2, setDraftAddr2] = useState('');

  // Registration modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regForm, setRegForm] = useState({ orderId: '', status: '배송지 미입력', itemDetails: '' });
  const setRegField = (key, val) => setRegForm(p => ({ ...p, [key]: val }));
  const [orderSearchText, setOrderSearchText] = useState('');
  const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);

  // Partner vehicles (orders) for registration
  const partnerOrders = useMemo(() =>
    allVehicles.filter(v => v.onsitePartner === currentPartner.partnerName && v.activeOrderId),
    [currentPartner.partnerName]
  );

  const filteredOrders = useMemo(() => {
    if (!orderSearchText) return partnerOrders;
    return partnerOrders.filter(v => v.activeOrderId.toLowerCase().includes(orderSearchText.toLowerCase()));
  }, [partnerOrders, orderSearchText]);

  const selectedOrderVehicle = useMemo(() => {
    if (!regForm.orderId) return null;
    return partnerOrders.find(v => v.activeOrderId === regForm.orderId) || null;
  }, [partnerOrders, regForm.orderId]);

  // Filter
  const filteredData = useMemo(() => {
    return items.filter(item => {
      if (searchText && !item[searchField]?.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (fStatus && item.status !== fStatus) return false;
      const d = item.createdAt?.slice(0, 10);
      if (periodFrom && d < periodFrom) return false;
      if (periodTo && d > periodTo) return false;
      return true;
    });
  }, [items, searchField, searchText, fStatus, periodFrom, periodTo]);

  // Sort
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

  // Pagination
  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  // Sync selectedItem when items change
  useEffect(() => {
    if (selectedItem) {
      const updated = items.find(i => i.id === selectedItem.id);
      if (updated) setSelectedItem(updated);
    }
  }, [items]);

  const showDrawer = (item) => {
    setSelectedItem(item);
    setDrafts({});
    setDraftAddr1(item.deliveryAddress1 || '');
    setDraftAddr2(item.deliveryAddress2 || '');
    setIsEditMode(false);
    setDrawerTab('detail');
    setDrawerVisible(true);
  };

  const showDrawerInEditMode = (item) => {
    setSelectedItem(item);
    setDrafts({
      status: item.status,
      itemDetails: item.itemDetails || '',
      recipientName: item.recipientName || '',
      recipientPhone: item.recipientPhone || '',
      isDisposed: item.isDisposed || false,
    });
    setDraftAddr1(item.deliveryAddress1 || '');
    setDraftAddr2(item.deliveryAddress2 || '');
    setIsEditMode(true);
    setDrawerTab('detail');
    setDrawerVisible(true);
  };

  const closeDrawer = useCallback(() => {
    setDrawerVisible(false);
    setIsEditMode(false);
    setTimeout(() => {
      setSelectedItem(null);
      setDrafts({});
    }, 300);
  }, []);

  const enterEditMode = () => {
    if (!selectedItem) return;
    setDrafts({
      status: selectedItem.status,
      itemDetails: selectedItem.itemDetails || '',
      recipientName: selectedItem.recipientName || '',
      recipientPhone: selectedItem.recipientPhone || '',
      isDisposed: selectedItem.isDisposed || false,
    });
    setDraftAddr1(selectedItem.deliveryAddress1 || '');
    setDraftAddr2(selectedItem.deliveryAddress2 || '');
    setDrawerTab('detail');
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setDrafts({});
    setDraftAddr1(selectedItem?.deliveryAddress1 || '');
    setDraftAddr2(selectedItem?.deliveryAddress2 || '');
    setIsEditMode(false);
  };

  const buildUpdates = () => {
    if (!selectedItem) return {};
    const updates = {};

    if (drafts.status && drafts.status !== selectedItem.status) {
      updates.status = drafts.status;
    }
    if (drafts.itemDetails !== undefined) updates.itemDetails = drafts.itemDetails;
    if (drafts.recipientName !== undefined) updates.recipientName = drafts.recipientName;
    if (drafts.recipientPhone !== undefined) updates.recipientPhone = drafts.recipientPhone;
    if (drafts.isDisposed !== undefined) updates.isDisposed = drafts.isDisposed;
    updates.deliveryAddress1 = draftAddr1;
    updates.deliveryAddress2 = draftAddr2;

    return updates;
  };

  const buildChangeList = (updates) => {
    if (!selectedItem) return [];
    const changes = [];
    const labelMap = {
      status: '처리 상태',
      itemDetails: '상세 정보',
      recipientName: '수령인 이름',
      recipientPhone: '휴대폰 번호',
      isDisposed: '보관 30일 경과 폐기',
      deliveryAddress1: '배송 주소',
      deliveryAddress2: '배송 상세 주소',
    };
    for (const [key, newVal] of Object.entries(updates)) {
      const oldVal = selectedItem[key];
      if (key === 'isDisposed') {
        if (!!newVal !== !!oldVal) {
          changes.push({ label: labelMap[key], from: oldVal ? 'Y' : 'N', to: newVal ? 'Y' : 'N' });
        }
      } else if (String(newVal ?? '') !== String(oldVal ?? '')) {
        changes.push({ label: labelMap[key] || key, from: oldVal || '-', to: newVal || '-' });
      }
    }
    return changes;
  };

  const handleSaveAll = () => {
    if (!selectedItem) return;
    const updates = buildUpdates();
    const changes = buildChangeList(updates);
    if (changes.length === 0) {
      setIsEditMode(false);
      setDrafts({});
      return;
    }
    setPendingChanges(changes);
    setIsSaveConfirming(true);
  };

  const confirmSave = () => {
    if (!selectedItem) return;
    const updates = buildUpdates();

    // 상태 변경 시 이력 추가
    if (updates.status && updates.status !== selectedItem.status) {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const changedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const historyEntry = {
        fromStatus: selectedItem.status,
        toStatus: updates.status,
        changedBy: 'partner@gangnam.kr',
        changedAt,
      };
      updates.statusHistory = [...(selectedItem.statusHistory || []), historyEntry];
    }

    updateItemField(selectedItem.id, updates);
    setIsEditMode(false);
    setDrafts({});
    setIsSaveConfirming(false);
    setPendingChanges([]);
  };

  const updateItemField = (id, updates) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // 발송 완료 button handler
  const handleShipComplete = () => {
    if (!selectedItem || selectedItem.status !== '발송 대기') return;
    if (!confirm('발송 완료 처리하시겠습니까?')) return;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const changedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const historyEntry = {
      fromStatus: '발송 대기',
      toStatus: '발송 완료',
      changedBy: 'partner@gangnam.kr',
      changedAt,
    };
    updateItemField(selectedItem.id, {
      status: '발송 완료',
      statusHistory: [...(selectedItem.statusHistory || []), historyEntry],
    });
  };


  // Registration
  const openRegisterModal = () => {
    setRegForm({ orderId: '', status: '배송지 미입력', itemDetails: '' });
    setOrderSearchText('');
    setIsOrderDropdownOpen(false);
    setIsRegisterOpen(true);
  };

  const handleRegister = () => {
    if (!regForm.orderId || !regForm.itemDetails.trim()) return;

    const vehicle = partnerOrders.find(v => v.activeOrderId === regForm.orderId);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const createdAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // Generate next ID
    const maxNum = items.reduce((max, it) => {
      const num = parseInt(it.id.replace('LI', ''), 10);
      return num > max ? num : max;
    }, 0);
    const newId = `LI${String(maxNum + 1).padStart(4, '0')}`;

    const newItem = {
      id: newId,
      createdAt,
      status: regForm.status,
      itemDetails: regForm.itemDetails.trim(),
      itemPhotos: [],
      carId: '',
      carNumber: vehicle?.plate || '',
      zoneId: vehicle?.zoneId || '',
      zoneName: vehicle?.zoneName || '',
      region1: vehicle?.region1 || '',
      region2: vehicle?.region2 || '',
      partnerId: currentPartner.partnerId,
      partnerName: currentPartner.partnerName,
      relatedOrderId: regForm.orderId,
      lostItemCardReceiptNumber: '',
      deliveryAddress1: '',
      deliveryAddress2: '',
      recipientName: '',
      recipientPhone: '',
      statusHistory: [
        { fromStatus: null, toStatus: regForm.status, changedBy: 'partner@gangnam.kr', changedAt: createdAt },
      ],
    };

    setItems(prev => [newItem, ...prev]);
    setIsRegisterOpen(false);
  };

  const handleResetFilters = () => {
    setSearchField('carNumber');
    setSearchText('');
    setFStatus('');
    const d = new Date(); d.setMonth(d.getMonth() - 2);
    setPeriodFrom(toYmd(d));
    setPeriodTo(toYmd(new Date()));
  };

  const searchFieldLabel = searchField === 'carNumber' ? '차량 번호' : '분실물 카드';

  const columns = [
    { key: 'id', header: '분실물 ID' },
    { key: 'carNumber', header: '차량 번호' },
    { key: 'zoneName', header: '존 이름' },
    {
      key: 'relatedOrderId', header: '오더 ID',
      render: (row) => setActiveKey ? (
        <a onClick={(e) => { e.stopPropagation(); setActiveKey('partner-orders'); }} className="text-blue-500 hover:underline cursor-pointer">
          {row.relatedOrderId || '-'}
        </a>
      ) : (row.relatedOrderId || '-'),
    },
    { key: 'createdAt', header: '접수 일시' },
    { key: 'lostItemCardReceiptNumber', header: '분실물 카드 번호' },
    {
      key: 'status', header: '처리 상태',
      render: (row) => <Badge tone={statusBadgeMap[row.status]}>{row.status}</Badge>,
    },
    {
      key: '_edit', header: '',
      render: (row) => !TERMINAL_STATUSES.includes(row.status) ? (
        <button
          onClick={(e) => { e.stopPropagation(); showDrawerInEditMode(row); }}
          className="p-1 rounded hover:bg-slate-100"
          title="수정"
        >
          <Pencil className="h-4 w-4 text-[#6B778C]" />
        </button>
      ) : null,
    },
  ];

  const renderDetailTab = () => {
    if (!selectedItem) return null;
    const data = selectedItem;
    return (
      <div className="space-y-6">
        {/* 분실물 정보 */}
        <Card>
          <CardHeader><CardTitle>분실물 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="분실물 ID" value={data.id} />
            <Field label="접수 일시" value={data.createdAt} />

            <Field label="처리 상태" value={
              isEditMode ? (
                <div className="space-y-2">
                  <Select
                    value={drafts.status || data.status}
                    onChange={(e) => setDraft('status', e.target.value)}
                  >
                    {allStatusOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={drafts.isDisposed || false}
                      onChange={(e) => setDraft('isDisposed', e.target.checked)}
                      className="h-4 w-4 rounded border-[#E2E8F0]"
                    />
                    <span className="text-sm text-[#172B4D]">보관 30일 경과 폐기</span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge tone={statusBadgeMap[data.status]}>{data.status}</Badge>
                  {data.isDisposed && <Badge tone="danger">폐기완료</Badge>}
                </div>
              )
            } />

            <Field label="상세 정보" value={
              isEditMode ? (
                <textarea
                  className="w-full rounded-lg border border-[#E2E8F0] p-2 text-sm"
                  rows={3}
                  value={drafts.itemDetails !== undefined ? drafts.itemDetails : data.itemDetails}
                  onChange={(e) => setDraft('itemDetails', e.target.value)}
                />
              ) : (
                <div className="text-sm whitespace-pre-wrap">{data.itemDetails || '-'}</div>
              )
            } />

            <Field label="습득물 사진" value={
              <div className="flex flex-wrap gap-2">
                {data.itemPhotos?.length > 0 ? data.itemPhotos.map((photo, index) => (
                  <img key={index} src={photo} alt={`p-${index}`} className="w-20 h-20 object-cover rounded" />
                )) : <span className="text-sm text-[#6B778C]">-</span>}
              </div>
            } />
          </CardContent>
        </Card>

        {/* 차량 정보 */}
        <Card>
          <CardHeader><CardTitle>차량 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="차량 번호" value={data.carNumber} />
            <Field label="존 이름" value={data.zoneName} />
            <Field label="지역1" value={data.region1} />
            <Field label="지역2" value={data.region2} />
            <Field label="존 ID" value={data.zoneId} />
          </CardContent>
        </Card>

        {/* 세차 오더 정보 */}
        <Card>
          <CardHeader><CardTitle>세차 오더 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="연계 오더 ID" value={data.relatedOrderId || '-'} />
          </CardContent>
        </Card>

        {/* 분실물 카드 정보 */}
        <Card>
          <CardHeader><CardTitle>분실물 카드 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="카드 접수 번호" value={data.lostItemCardReceiptNumber || '-'} />

            <Field label="분실물 상세 정보" value={
              <div className="text-sm whitespace-pre-wrap">{data.itemDetails || '-'}</div>
            } />

            <Field label="배송 주소" value={
              <div>
                <div className="text-sm">{data.deliveryAddress1 || '-'}</div>
                {data.deliveryAddress2 && <div className="text-sm text-[#6B778C]">{data.deliveryAddress2}</div>}
              </div>
            } />

            <Field label="수령인 이름" value={data.recipientName || '-'} />

            <Field label="휴대폰 번호" value={data.recipientPhone || '-'} />
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderStatusHistoryTab = () => {
    if (!selectedItem) return null;
    const history = selectedItem.statusHistory || [];

    if (history.length === 0) {
      return (
        <div className="py-12 text-center text-sm text-[#6B778C]">변경 이력이 없습니다.</div>
      );
    }

    return (
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA]">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6B778C]">변경 일시</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6B778C]">이전 상태</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6B778C]">변경 상태</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#6B778C]">변경 계정</th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().map((h, i) => (
                <tr key={i} className="border-b border-[#F0F0F0] last:border-b-0">
                  <td className="px-4 py-2.5 text-[#172B4D]">{h.changedAt}</td>
                  <td className="px-4 py-2.5">
                    {h.fromStatus ? <Badge tone={statusBadgeMap[h.fromStatus]}>{h.fromStatus}</Badge> : <span className="text-[#6B778C]">-</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={statusBadgeMap[h.toStatus]}>{h.toStatus}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-[#6B778C]">{h.changedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    );
  };

  const renderDrawerContent = () => {
    if (!selectedItem) return null;

    return (
      <div className="space-y-4">
        <PillTabs
          value={drawerTab}
          onChange={setDrawerTab}
          items={[
            { value: 'detail', label: '상세 정보' },
            { value: 'statusHistory', label: '처리상태 변경이력' },
          ]}
        />
        {drawerTab === 'detail' && renderDetailTab()}
        {drawerTab === 'statusHistory' && renderStatusHistoryTab()}
      </div>
    );
  };

  // Drawer footer with action buttons
  const renderDrawerFooter = () => {
    if (!selectedItem) return null;
    const data = selectedItem;
    const isTerminal = TERMINAL_STATUSES.includes(data.status);

    if (isEditMode) {
      return (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleCancelEdit}>취소</Button>
          <Button onClick={handleSaveAll}>저장하기</Button>
        </div>
      );
    }

    const showShipComplete = data.status === '발송 대기';

    return (
      <div className="flex justify-between">
        <div className="flex gap-2">
          {showShipComplete && (
            <Button onClick={handleShipComplete}>발송 완료</Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={closeDrawer}>닫기</Button>
          {!isTerminal && <Button onClick={enterEditMode}>수정하기</Button>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">분실물 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">{currentPartner.partnerName}에서 접수된 분실물을 조회하고 관리합니다.</div>
        </div>
        <Button onClick={openRegisterModal} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" />분실물 등록
        </Button>
      </div>

      <FilterPanel
        chips={<>
          {searchText ? <Chip onRemove={() => setSearchText('')}>{searchFieldLabel}: {searchText}</Chip> : null}
          {fStatus ? <Chip onRemove={() => setFStatus('')}>상태: {fStatus}</Chip> : null}
          {(periodFrom || periodTo) ? <Chip onRemove={() => { setPeriodFrom(''); setPeriodTo(''); }}>접수일: {periodFrom || '-'} ~ {periodTo || '-'}</Chip> : null}
        </>}
        onReset={handleResetFilters}
      >
        <div className="md:col-span-1">
          <label htmlFor="searchField" className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색 항목</label>
          <Select id="searchField" value={searchField} onChange={(e) => setSearchField(e.target.value)}>
            <option value="carNumber">차량 번호</option>
            <option value="lostItemCardReceiptNumber">분실물 카드</option>
          </Select>
        </div>
        <div className="md:col-span-3">
          <label htmlFor="searchText" className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색어</label>
          <Input id="searchText" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="검색어 입력" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fStatus" className="block text-xs font-semibold text-[#6B778C] mb-1.5">처리 상태</label>
          <Select id="fStatus" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="">전체</option>
            {allStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">접수 일시</label>
          <div className="flex items-center gap-2">
            <Input id="periodFrom" type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
            <span className="text-sm text-[#6B778C] shrink-0">~</span>
            <Input id="periodTo" type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
          </div>
        </div>
      </FilterPanel>

      <div className="flex items-center justify-between">
        <div className="text-sm text-[#6B778C]">
          필터된 결과 <span className="font-semibold text-[#172B4D]">{filteredData.length}</span>건 / 전체 <span className="font-semibold text-[#172B4D]">{items.length}</span>건
        </div>
      </div>

      <Card>
        <DataTable
          columns={columns}
          rows={currentData}
          rowKey={(r) => r.id}
          onRowClick={showDrawer}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      </Card>

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

      <Drawer
        title="분실물 상세 정보"
        subtitle="분실물 상세 및 처리 상태 관리"
        open={drawerVisible}
        onClose={closeDrawer}
        footer={renderDrawerFooter()}
      >
        {renderDrawerContent()}
      </Drawer>

      {isSaveConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 text-base font-bold text-[#172B4D]">수정 내용 확인</div>
            <div className="space-y-2 rounded-lg bg-[#F4F5F7] p-4 text-sm">
              {pendingChanges.map((c, i) => (
                <div key={i} className="flex justify-between gap-4">
                  <span className="text-[#6B778C] shrink-0">{c.label}</span>
                  <span className="text-right">
                    <span className="text-[#6B778C] line-through">{c.from}</span>
                    <span className="mx-1 text-[#6B778C]">&rarr;</span>
                    <span className="font-medium text-[#172B4D]">{c.to}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-[#6B778C]">위 내용으로 수정하시겠습니까?</div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsSaveConfirming(false)}>취소</Button>
              <Button onClick={confirmSave}>저장</Button>
            </div>
          </div>
        </div>
      )}

      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 text-base font-bold text-[#172B4D]">분실물 등록</div>
            <div className="space-y-4">
              {/* 세차 오더 번호 검색 */}
              <div>
                <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">세차 오더 번호 <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Input
                    value={regForm.orderId ? regForm.orderId : orderSearchText}
                    onChange={(e) => {
                      setOrderSearchText(e.target.value);
                      if (regForm.orderId) setRegField('orderId', '');
                      setIsOrderDropdownOpen(true);
                    }}
                    onFocus={() => setIsOrderDropdownOpen(true)}
                    placeholder="오더 번호를 검색하세요 (예: O-90001)"
                  />
                  {regForm.orderId && (
                    <button
                      onClick={() => { setRegField('orderId', ''); setOrderSearchText(''); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B778C] hover:text-[#172B4D] text-sm"
                    >✕</button>
                  )}
                  {isOrderDropdownOpen && !regForm.orderId && (
                    <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white shadow-lg">
                      {filteredOrders.length > 0 ? filteredOrders.map(v => (
                        <button
                          key={v.activeOrderId}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[#F4F5F7] border-b border-[#F0F0F0] last:border-b-0"
                          onClick={() => {
                            setRegField('orderId', v.activeOrderId);
                            setOrderSearchText('');
                            setIsOrderDropdownOpen(false);
                          }}
                        >
                          <span className="font-medium text-[#172B4D]">{v.activeOrderId}</span>
                          <span className="ml-2 text-[#6B778C]">{v.plate} · {v.zoneName}</span>
                        </button>
                      )) : (
                        <div className="px-3 py-2 text-sm text-[#6B778C]">일치하는 오더가 없습니다.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 선택된 오더 정보 표시 */}
              {selectedOrderVehicle && (
                <div className="rounded-lg bg-[#F4F5F7] p-3 text-sm space-y-1">
                  <div className="flex gap-4">
                    <span className="text-[#6B778C] w-20 shrink-0">차량 번호</span>
                    <span className="text-[#172B4D]">{selectedOrderVehicle.plate}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-[#6B778C] w-20 shrink-0">존 이름</span>
                    <span className="text-[#172B4D]">{selectedOrderVehicle.zoneName}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-[#6B778C] w-20 shrink-0">지역</span>
                    <span className="text-[#172B4D]">{selectedOrderVehicle.region1} {selectedOrderVehicle.region2}</span>
                  </div>
                </div>
              )}

              {/* 처리 상태 */}
              <div>
                <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">처리 상태 <span className="text-rose-500">*</span></label>
                <Select value={regForm.status} onChange={(e) => setRegField('status', e.target.value)}>
                  {['배송지 미입력', '경찰서 인계'].map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>

              {/* 상세 정보 */}
              <div>
                <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">상세 정보 <span className="text-rose-500">*</span></label>
                <textarea
                  className="w-full rounded-lg border border-[#E2E8F0] p-2 text-sm"
                  rows={3}
                  value={regForm.itemDetails}
                  onChange={(e) => setRegField('itemDetails', e.target.value)}
                  placeholder="분실물의 종류, 색상, 특징 등을 입력하세요"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsRegisterOpen(false)}>취소</Button>
              <Button onClick={handleRegister} disabled={!regForm.orderId || !regForm.itemDetails.trim()}>등록</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
