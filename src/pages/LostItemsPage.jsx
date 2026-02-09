import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, X, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  cn, toYmd, Card, CardHeader, CardTitle, CardContent,
  Button, Input, Select, Badge, Chip, FilterPanel,
  Drawer, Field, DataTable, usePagination,
} from '../components/ui';
import initialMockLostItems from '../mocks/lostItems.json';

// --- CONSTANTS ---
const STATUS_BY_CATEGORY = {
  '일반': ['배송지 미입력', '발송 대기', '발송 완료', '폐기 완료'],
  '귀중품': ['배송지 미입력', '경찰서 인계', '폐기 완료'],
};

const TERMINAL_STATUSES = ['발송 완료', '경찰서 인계', '폐기 완료'];

const statusBadgeMap = {
  '배송지 미입력': 'warn',
  '발송 대기': 'info',
  '발송 완료': 'ok',
  '폐기 완료': 'default',
  '경찰서 인계': 'default',
};

const itemClassificationOptions = ['일반', '귀중품'];
const allStatusOptions = ['배송지 미입력', '발송 대기', '발송 완료', '경찰서 인계', '폐기 완료'];

// --- Daum Postcode API ---
const loadDaumPostcode = () => new Promise((resolve, reject) => {
  if (window.daum?.Postcode) return resolve();
  const s = document.createElement('script');
  s.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
  s.onload = resolve;
  s.onerror = () => reject(new Error('Daum Postcode API 로드 실패'));
  document.head.appendChild(s);
});

// --- MAIN COMPONENT ---
export default function LostItemsPage({ setActiveKey }) {
  const [items, setItems] = useState(initialMockLostItems);

  // Filter states
  const [searchField, setSearchField] = useState('carNumber');
  const [searchText, setSearchText] = useState('');
  const [fPartner, setFPartner] = useState('');
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

  // Draft states for inline Input editing
  const [drafts, setDrafts] = useState({});
  const setDraft = (key, val) => setDrafts(p => ({ ...p, [key]: val }));

  // Address states
  const [draftAddr1, setDraftAddr1] = useState('');
  const [draftAddr2, setDraftAddr2] = useState('');
  const [addressInputMode, setAddressInputMode] = useState('postcode');

  // Partner names for filter
  const partnerNames = useMemo(() => [...new Set(items.map(i => i.partnerName).filter(Boolean))], [items]);

  // Filter
  const filteredData = useMemo(() => {
    return items.filter(item => {
      if (searchText && !item[searchField]?.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (fPartner && item.partnerName !== fPartner) return false;
      if (fStatus && item.status !== fStatus) return false;
      const d = item.createdAt?.slice(0, 10);
      if (periodFrom && d < periodFrom) return false;
      if (periodTo && d > periodTo) return false;
      return true;
    });
  }, [items, searchField, searchText, fPartner, fStatus, periodFrom, periodTo]);

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
    setAddressInputMode('postcode');
    setDrawerVisible(true);
  };

  const closeDrawer = useCallback(() => {
    setDrawerVisible(false);
    setTimeout(() => {
      setSelectedItem(null);
      setDrafts({});
    }, 300);
  }, []);

  const updateItemField = (id, updates) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // Select confirm: 분실물 구분
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    if (newCategory === selectedItem.itemCategory) return;

    const validStatuses = STATUS_BY_CATEGORY[newCategory];
    const currentStatus = selectedItem.status;
    let statusReset = {};

    if (!validStatuses.includes(currentStatus)) {
      if (!confirm(`분실물 구분을 '${newCategory}'(으)로 변경하시겠습니까?\n현재 처리 상태 '${currentStatus}'는 '${newCategory}' 구분에서 유효하지 않아 '배송지 미입력'으로 초기화됩니다.`)) return;
      statusReset = { status: '배송지 미입력' };
    } else {
      if (!confirm(`분실물 구분을 '${newCategory}'(으)로 변경하시겠습니까?`)) return;
    }

    updateItemField(selectedItem.id, { itemCategory: newCategory, ...statusReset });
  };

  // Input individual save
  const handleSaveField = (key) => {
    if (drafts[key] === undefined || drafts[key] === selectedItem[key]) return;
    updateItemField(selectedItem.id, { [key]: drafts[key] });
    setDrafts(p => { const n = { ...p }; delete n[key]; return n; });
  };

  // Address save — auto status transition
  const handleSaveAddress = () => {
    const updates = { deliveryAddress1: draftAddr1, deliveryAddress2: draftAddr2 };
    if (selectedItem.status === '배송지 미입력' && draftAddr1.trim()) {
      if (selectedItem.itemCategory === '일반') {
        updates.status = '발송 대기';
      } else if (selectedItem.itemCategory === '귀중품') {
        updates.status = '경찰서 인계';
      }
    }
    updateItemField(selectedItem.id, updates);
  };

  // 발송 완료 button handler
  const handleShipComplete = () => {
    if (!selectedItem || selectedItem.status !== '발송 대기') return;
    if (!confirm('발송 완료 처리하시겠습니까?')) return;
    updateItemField(selectedItem.id, { status: '발송 완료' });
  };

  // 폐기 완료 button handler
  const handleDispose = () => {
    if (!selectedItem || TERMINAL_STATUSES.includes(selectedItem.status)) return;
    if (!confirm('폐기 완료 처리하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
    updateItemField(selectedItem.id, { status: '폐기 완료' });
  };

  // Daum postcode search
  const handleSearchAddress = async () => {
    try {
      await loadDaumPostcode();
      new window.daum.Postcode({
        oncomplete: (data) => {
          setDraftAddr1(data.roadAddress || data.jibunAddress);
        }
      }).open();
    } catch (err) {
      alert(err.message);
    }
  };

  // Photo handlers
  const handleAddPhoto = () => {
    const newPhoto = prompt("추가할 사진 URL을 입력하세요:", "https://via.placeholder.com/150");
    if (newPhoto) {
      updateItemField(selectedItem.id, { itemPhotos: [...selectedItem.itemPhotos, newPhoto] });
    }
  };
  const handleRemovePhoto = (index) => {
    updateItemField(selectedItem.id, { itemPhotos: selectedItem.itemPhotos.filter((_, i) => i !== index) });
  };

  const handleResetFilters = () => {
    setSearchField('carNumber');
    setSearchText('');
    setFPartner('');
    setFStatus('');
    const d = new Date(); d.setMonth(d.getMonth() - 2);
    setPeriodFrom(toYmd(d));
    setPeriodTo(toYmd(new Date()));
  };

  const searchFieldLabel = searchField === 'carNumber' ? '차량 번호' : '분실물 카드';

  const columns = [
    { key: 'id', header: '분실물 ID' },
    { key: 'partnerName', header: '파트너 이름' },
    { key: 'carNumber', header: '차량 번호' },
    { key: 'zoneName', header: '존 이름' },
    {
      key: 'relatedOrderId', header: '오더 ID',
      render: (row) => (
        <a onClick={(e) => { e.stopPropagation(); setActiveKey('orders'); }} className="text-blue-500 hover:underline cursor-pointer">
          {row.relatedOrderId || '-'}
        </a>
      ),
    },
    { key: 'createdAt', header: '접수 일시' },
    { key: 'lostItemCardReceiptNumber', header: '분실물 카드 번호' },
    {
      key: 'status', header: '처리 상태',
      render: (row) => <Badge tone={statusBadgeMap[row.status]}>{row.status}</Badge>,
    },
  ];

  const renderDrawerContent = () => {
    if (!selectedItem) return null;
    const data = selectedItem;
    const isTerminal = TERMINAL_STATUSES.includes(data.status);
    const isAddressChanged = draftAddr1 !== (data.deliveryAddress1 || '') || draftAddr2 !== (data.deliveryAddress2 || '');
    const isValuable = data.itemCategory === '귀중품';
    const addressLabel = isValuable ? '경찰서 주소' : '배송 주소';

    return (
      <div className="space-y-6">
        {/* 분실물 정보 */}
        <Card>
          <CardHeader><CardTitle>분실물 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="분실물 ID" value={data.id} />
            <Field label="접수 일시" value={data.createdAt} />

            <Field label="분실물 구분" value={
              isTerminal ? data.itemCategory : (
                <Select value={data.itemCategory} onChange={handleCategoryChange}>
                  {itemClassificationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </Select>
              )
            } />

            <Field label="처리 상태" value={
              <Badge tone={statusBadgeMap[data.status]}>{data.status}</Badge>
            } />

            <Field label={addressLabel} value={
              isTerminal ? (
                <div>
                  <div className="text-sm">{data.deliveryAddress1 || '-'}</div>
                  {data.deliveryAddress2 && <div className="text-sm text-[#6B778C]">{data.deliveryAddress2}</div>}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1 text-sm cursor-pointer">
                      <input type="radio" name="addressMode" value="postcode" checked={addressInputMode === 'postcode'} onChange={() => setAddressInputMode('postcode')} />
                      우편번호 검색
                    </label>
                    <label className="flex items-center gap-1 text-sm cursor-pointer">
                      <input type="radio" name="addressMode" value="manual" checked={addressInputMode === 'manual'} onChange={() => setAddressInputMode('manual')} />
                      직접 입력
                    </label>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-12 shrink-0 text-xs text-[#6B778C]">주소1</span>
                      <div className="flex-1">
                        <Input
                          value={draftAddr1}
                          onChange={(e) => setDraftAddr1(e.target.value)}
                          placeholder="주소를 입력하세요"
                          readOnly={addressInputMode === 'postcode'}
                        />
                      </div>
                      {addressInputMode === 'postcode' && (
                        <Button onClick={handleSearchAddress} className="shrink-0">
                          <MapPin className="mr-1 h-4 w-4" /> 주소 검색
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 shrink-0 text-xs text-[#6B778C]">주소2</span>
                      <div className="flex-1">
                        <Input value={draftAddr2} onChange={(e) => setDraftAddr2(e.target.value)} placeholder="상세 주소를 입력하세요" />
                      </div>
                      <Button
                        variant={isAddressChanged ? undefined : 'secondary'}
                        onClick={handleSaveAddress}
                        disabled={!isAddressChanged}
                        className="shrink-0"
                      >저장</Button>
                    </div>
                  </div>
                  {data.status === '배송지 미입력' && (
                    <p className="text-xs text-[#6B778C]">
                      {isValuable
                        ? '* 주소 저장 시 경찰서 인계 상태로 자동 전환됩니다.'
                        : '* 주소 저장 시 발송 대기 상태로 자동 전환됩니다.'}
                    </p>
                  )}
                </div>
              )
            } />

            {/* 수령인 정보 */}
            <Field label="수령인 이름" value={
              isTerminal ? (data.recipientName || '-') : (
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      value={drafts.recipientName !== undefined ? drafts.recipientName : (data.recipientName || '')}
                      onChange={(e) => setDraft('recipientName', e.target.value)}
                      placeholder="수령인 이름"
                    />
                  </div>
                  <Button
                    variant={(drafts.recipientName !== undefined && drafts.recipientName !== (data.recipientName || '')) ? undefined : 'secondary'}
                    onClick={() => handleSaveField('recipientName')}
                    disabled={drafts.recipientName === undefined || drafts.recipientName === (data.recipientName || '')}
                  >저장</Button>
                </div>
              )
            } />

            <Field label="휴대폰 번호" value={
              isTerminal ? (data.recipientPhone || '-') : (
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      value={drafts.recipientPhone !== undefined ? drafts.recipientPhone : (data.recipientPhone || '')}
                      onChange={(e) => setDraft('recipientPhone', e.target.value)}
                      placeholder="010-0000-0000"
                    />
                  </div>
                  <Button
                    variant={(drafts.recipientPhone !== undefined && drafts.recipientPhone !== (data.recipientPhone || '')) ? undefined : 'secondary'}
                    onClick={() => handleSaveField('recipientPhone')}
                    disabled={drafts.recipientPhone === undefined || drafts.recipientPhone === (data.recipientPhone || '')}
                  >저장</Button>
                </div>
              )
            } />

            <Field label="상세 정보" value={
              <div className="space-y-2">
                <textarea
                  className="w-full rounded-lg border border-[#E2E8F0] p-2 text-sm"
                  rows={3}
                  value={drafts.itemDetails !== undefined ? drafts.itemDetails : data.itemDetails}
                  onChange={(e) => setDraft('itemDetails', e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    variant={(drafts.itemDetails !== undefined && drafts.itemDetails !== data.itemDetails) ? undefined : 'secondary'}
                    onClick={() => handleSaveField('itemDetails')}
                    disabled={drafts.itemDetails === undefined || drafts.itemDetails === data.itemDetails}
                  >저장</Button>
                </div>
              </div>
            } />

            <Field label="습득물 사진" value={
              <div>
                <div className="flex flex-wrap gap-2">
                  {data.itemPhotos?.map((photo, index) => (
                    <div key={index} className="relative">
                      <img src={photo} alt={`p-${index}`} className="w-20 h-20 object-cover rounded" />
                      <button
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white border-none rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                        onClick={() => handleRemovePhoto(index)}
                      ><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
                <Button onClick={handleAddPhoto} className="mt-2">
                  <Plus className="mr-1 h-4 w-4" /> 사진 추가
                </Button>
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
            <Field label="파트너 이름" value={data.partnerName} />
            <Field label="연계 오더 ID" value={data.relatedOrderId || '-'} />
          </CardContent>
        </Card>

        {/* 분실물 카드 정보 */}
        <Card>
          <CardHeader><CardTitle>분실물 카드 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="카드 접수 번호" value={data.lostItemCardReceiptNumber || '-'} />
          </CardContent>
        </Card>
      </div>
    );
  };

  // Drawer footer with action buttons
  const renderDrawerFooter = () => {
    if (!selectedItem) return null;
    const data = selectedItem;
    const isTerminal = TERMINAL_STATUSES.includes(data.status);
    const showShipComplete = data.itemCategory === '일반' && data.status === '발송 대기';
    const showDispose = !isTerminal;

    return (
      <div className="flex justify-between">
        <div className="flex gap-2">
          {showShipComplete && (
            <Button onClick={handleShipComplete}>발송 완료</Button>
          )}
          {showDispose && (
            <Button variant="danger" onClick={handleDispose}>폐기 완료</Button>
          )}
        </div>
        <Button variant="secondary" onClick={closeDrawer}>닫기</Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">분실물 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">분실물 접수 현황 및 처리 상태 관리</div>
        </div>
      </div>

      <FilterPanel
        chips={<>
          {searchText ? <Chip onRemove={() => setSearchText('')}>{searchFieldLabel}: {searchText}</Chip> : null}
          {fPartner ? <Chip onRemove={() => setFPartner('')}>파트너: {fPartner}</Chip> : null}
          {fStatus ? <Chip onRemove={() => setFStatus('')}>상태: {fStatus}</Chip> : null}
          {periodFrom ? <Chip onRemove={() => setPeriodFrom('')}>시작일: {periodFrom}</Chip> : null}
          {periodTo ? <Chip onRemove={() => setPeriodTo('')}>종료일: {periodTo}</Chip> : null}
        </>}
        onReset={handleResetFilters}
      >
        <div className="md:col-span-2">
          <label htmlFor="searchField" className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색 항목</label>
          <Select id="searchField" value={searchField} onChange={(e) => setSearchField(e.target.value)}>
            <option value="carNumber">차량 번호</option>
            <option value="lostItemCardReceiptNumber">분실물 카드</option>
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="searchText" className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색어</label>
          <Input id="searchText" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="검색어 입력" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fPartner" className="block text-xs font-semibold text-[#6B778C] mb-1.5">파트너 이름</label>
          <Select id="fPartner" value={fPartner} onChange={(e) => setFPartner(e.target.value)}>
            <option value="">전체</option>
            {partnerNames.map(n => <option key={n} value={n}>{n}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fStatus" className="block text-xs font-semibold text-[#6B778C] mb-1.5">처리 상태</label>
          <Select id="fStatus" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="">전체</option>
            {allStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="periodFrom" className="block text-xs font-semibold text-[#6B778C] mb-1.5">접수일 시작</label>
          <Input id="periodFrom" type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="periodTo" className="block text-xs font-semibold text-[#6B778C] mb-1.5">접수일 종료</label>
          <Input id="periodTo" type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
        </div>
      </FilterPanel>

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
    </div>
  );
}
