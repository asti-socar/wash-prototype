import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, ArrowUpDown, Trash2, MapPin, ExternalLink } from 'lucide-react';

// --- Custom Component Definitions ---

const styleVariables = {
  borderColor: '#e5e7eb',
  primaryColor: '#3b82f6',
  textColor: '#111827',
  mutedTextColor: '#6b7280',
  bgColor: '#fff',
  hoverBgColor: '#f9fafb',
  dangerColor: '#ef4444',
};

const Card = ({ children }) => <div style={{ border: `1px solid ${styleVariables.borderColor}`, borderRadius: '0.5rem', backgroundColor: styleVariables.bgColor, marginBottom: '1rem' }}>{children}</div>;
const CardHeader = ({ children }) => <div style={{ padding: '1rem', borderBottom: `1px solid ${styleVariables.borderColor}` }}>{children}</div>;
const CardTitle = ({ children }) => <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: styleVariables.textColor }}>{children}</h2>;
const CardContent = ({ children }) => <div style={{ padding: '1rem' }}>{children}</div>;

const Button = ({ children, onClick, variant = 'default', className = '', disabled = false, style: extraStyle }) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: '1px solid transparent',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s',
    marginRight: '0.5rem',
    opacity: disabled ? 0.5 : 1,
  };
  const styles = {
    default: {
      backgroundColor: styleVariables.bgColor,
      borderColor: styleVariables.borderColor,
      color: styleVariables.textColor,
    },
    primary: {
      backgroundColor: styleVariables.primaryColor,
      color: '#fff',
    },
    danger: {
      backgroundColor: styleVariables.dangerColor,
      color: '#fff',
    }
  };
  return <button style={{ ...baseStyle, ...styles[variant], ...extraStyle }} onClick={disabled ? undefined : onClick} disabled={disabled} className={className}>{children}</button>;
};

const Input = ({ value, onChange, placeholder, icon, readOnly = false }) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
    {icon && <div style={{ position: 'absolute', left: '0.75rem', color: styleVariables.mutedTextColor }}>{icon}</div>}
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{
        width: '100%',
        padding: `0.5rem ${icon ? '2.25rem' : '0.75rem'}`,
        borderRadius: '0.375rem',
        border: `1px solid ${styleVariables.borderColor}`,
        fontSize: '0.875rem',
        backgroundColor: readOnly ? '#f3f4f6' : '#fff',
      }}
    />
  </div>
);

const Textarea = ({ value, onChange, rows = 3 }) => (
    <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            border: `1px solid ${styleVariables.borderColor}`,
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
            fontFamily: 'inherit'
        }}
    />
);


const Select = ({ value, onChange, children, placeholder, allowClear }) => (
  <select
    value={value || ''}
    onChange={onChange}
    style={{
      padding: '0.5rem',
      borderRadius: '0.375rem',
      border: `1px solid ${styleVariables.borderColor}`,
      fontSize: '0.875rem',
      marginRight: '0.5rem',
      minWidth: '150px'
    }}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {children}
  </select>
);
Select.Option = ({ value, children }) => <option value={value}>{children}</option>;

const Badge = ({ text, status }) => {
  const colors = {
    processing: { bg: '#e0f2fe', text: '#0ea5e9' },
    warning: { bg: '#fef3c7', text: '#f59e0b' },
    error: { bg: '#fee2e2', text: '#ef4444' },
    success: { bg: '#dcfce7', text: '#22c55e' },
  };
  const style = colors[status] || { bg: '#f3f4f6', text: '#6b7280' };
  return <span style={{ backgroundColor: style.bg, color: style.text, padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>{text}</span>
};

const Drawer = ({ title, open, onClose, children, footer }) => {
  const [width, setWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('drawer-open');
    } else {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('drawer-open');
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('drawer-open');
    };
  }, [open]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = window.innerWidth * 0.3;
      const maxWidth = window.innerWidth * 0.9;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
    };
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    };
  }, [isResizing]);

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
      <div onClick={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}></div>
       <div style={{ position: 'fixed', top: 0, right: 0, height: '100%', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', zIndex: 1000, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width, maxWidth: '100vw' }}>
        <div
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', cursor: 'col-resize', zIndex: 1001 }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        />
        <div style={{ padding: '1rem', borderBottom: `1px solid ${styleVariables.borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}><X size={20} /></button>
        </div>
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>{children}</div>
        <div style={{ padding: '1rem', borderTop: `1px solid ${styleVariables.borderColor}`, backgroundColor: styleVariables.bgColor }}>{footer}</div>
      </div>
    </div>
  );
};

const DataTable = ({ columns, dataSource, onRowClick }) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ padding: '0.75rem 1rem', borderBottom: `2px solid ${styleVariables.borderColor}`, textAlign: 'left', fontWeight: 600, color: styleVariables.mutedTextColor, fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {col.title}
                  <ArrowUpDown size={14} style={{ marginLeft: '0.5rem', color: styleVariables.mutedTextColor }}/>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.map(row => (
            <tr key={row.id} onClick={() => onRowClick(row)} style={{ cursor: 'pointer', borderBottom: `1px solid ${styleVariables.borderColor}` }} className="hover:bg-gray-50">
              {columns.map(col => (
                <td key={col.key} style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                  {col.render ? col.render(row[col.dataIndex], row) : (row[col.dataIndex] || '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Field = ({ label, children, isBlock = false }) => (
    <div style={{ display: isBlock ? 'block' : 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'start', padding: '1rem 0', borderBottom: `1px solid ${styleVariables.borderColor}` }}>
        <p style={{ margin: 0, fontWeight: 500, color: styleVariables.mutedTextColor }}>{label}</p>
        <div>{children}</div>
    </div>
);


// --- CONSTANTS ---
const STATUS_BY_CATEGORY = {
  '일반': ['배송지 미입력', '발송 대기', '발송 완료', '폐기 완료'],
  '귀중품': ['배송지 미입력', '경찰서 인계', '폐기 완료'],
};

const TERMINAL_STATUSES = ['발송 완료', '경찰서 인계', '폐기 완료'];

const statusBadgeMap = {
  '배송지 미입력': 'warning',
  '발송 대기': 'processing',
  '발송 완료': 'success',
  '폐기 완료': 'default',
  '경찰서 인계': 'default',
};

const itemClassificationOptions = ['일반', '귀중품'];
const allStatusOptions = ['배송지 미입력', '발송 대기', '발송 완료', '경찰서 인계', '폐기 완료'];

// --- MOCK DATA ---
const initialMockLostItems = [
  {
    id: 'LI0001',
    createdAt: '2024-07-21 10:30:00',
    itemCategory: '일반',
    status: '배송지 미입력',
    itemDetails: '검은색 스마트폰, 최신 모델',
    itemPhotos: ['https://placehold.co/20x20?text=Hello\nWorld'],
    carId: 'CAR001',
    carNumber: '12가3456',
    zoneId: 'ZONE01',
    zoneName: '강남존',
    region1: '서울',
    region2: '강남구',
    partnerId: 'P001',
    partnerName: '워시 파트너스',
    relatedOrderId: 'ORD456',
    lostItemCardReceiptNumber: 'LCRN001',
    deliveryAddress1: '',
    deliveryAddress2: '',
  },
  {
    id: 'LI0002',
    createdAt: '2024-07-20 15:00:00',
    itemCategory: '귀중품',
    status: '배송지 미입력',
    itemDetails: '갈색 가죽 지갑, 신분증 포함',
    itemPhotos: [],
    carId: 'CAR002',
    carNumber: '34나5678',
    zoneId: 'ZONE02',
    zoneName: '홍대존',
    region1: '서울',
    region2: '마포구',
    partnerId: 'P002',
    partnerName: '클린카',
    relatedOrderId: 'ORD457',
    lostItemCardReceiptNumber: '',
    deliveryAddress1: '',
    deliveryAddress2: '',
  },
  {
    id: 'LI0003',
    createdAt: '2024-07-19 09:15:00',
    itemCategory: '일반',
    status: '발송 대기',
    itemDetails: '검은색 우산',
    itemPhotos: [],
    carId: 'CAR003',
    carNumber: '56다7890',
    zoneId: 'ZONE03',
    zoneName: '판교존',
    region1: '경기',
    region2: '성남시',
    partnerId: 'P001',
    partnerName: '워시 파트너스',
    relatedOrderId: 'ORD458',
    lostItemCardReceiptNumber: 'LCRN003',
    deliveryAddress1: '서울 강남구 테헤란로 123',
    deliveryAddress2: '4층 401호',
  },
  {
    id: 'LI0004',
    createdAt: '2024-07-18 14:20:00',
    itemCategory: '귀중품',
    status: '경찰서 인계',
    itemDetails: '노트북 가방 (노트북 포함)',
    itemPhotos: ['https://placehold.co/20x20?text=Bag'],
    carId: 'CAR004',
    carNumber: '78라1234',
    zoneId: 'ZONE04',
    zoneName: '역삼존',
    region1: '서울',
    region2: '강남구',
    partnerId: 'P002',
    partnerName: '클린카',
    relatedOrderId: 'ORD459',
    lostItemCardReceiptNumber: 'LCRN004',
    deliveryAddress1: '',
    deliveryAddress2: '',
  },
  {
    id: 'LI0005',
    createdAt: '2024-07-17 11:45:00',
    itemCategory: '일반',
    status: '발송 완료',
    itemDetails: '파란색 텀블러',
    itemPhotos: [],
    carId: 'CAR005',
    carNumber: '90마5678',
    zoneId: 'ZONE01',
    zoneName: '강남존',
    region1: '서울',
    region2: '강남구',
    partnerId: 'P001',
    partnerName: '워시 파트너스',
    relatedOrderId: 'ORD460',
    lostItemCardReceiptNumber: 'LCRN005',
    deliveryAddress1: '서울 마포구 월드컵북로 21',
    deliveryAddress2: '2층',
  },
  {
    id: 'LI0006',
    createdAt: '2024-07-16 16:30:00',
    itemCategory: '귀중품',
    status: '폐기 완료',
    itemDetails: '고급 선글라스 케이스',
    itemPhotos: [],
    carId: 'CAR006',
    carNumber: '12바9012',
    zoneId: 'ZONE02',
    zoneName: '홍대존',
    region1: '서울',
    region2: '마포구',
    partnerId: 'P002',
    partnerName: '클린카',
    relatedOrderId: '',
    lostItemCardReceiptNumber: 'LCRN006',
    deliveryAddress1: '',
    deliveryAddress2: '',
  },
];

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
const LostItemsPage = ({ setActiveKey }) => {
  const [items, setItems] = useState(initialMockLostItems);
  const [filteredData, setFilteredData] = useState(items);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchText, setSearchText] = useState('');

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Draft states for inline Input editing
  const [drafts, setDrafts] = useState({});
  const setDraft = (key, val) => setDrafts(p => ({ ...p, [key]: val }));

  // Address states
  const [draftAddr1, setDraftAddr1] = useState('');
  const [draftAddr2, setDraftAddr2] = useState('');
  const [addressInputMode, setAddressInputMode] = useState('postcode');

  // Sync selectedItem when items change
  useEffect(() => {
    if (selectedItem) {
      const updated = items.find(i => i.id === selectedItem.id);
      if (updated) setSelectedItem(updated);
    }
  }, [items]);

  useEffect(() => {
    let data = items;
    if (statusFilter) {
      data = data.filter(item => item.status === statusFilter);
    }
    if (searchText) {
      data = data.filter(item => item.lostItemCardReceiptNumber.toLowerCase().includes(searchText.toLowerCase()));
    }
    setFilteredData(data);
  }, [statusFilter, searchText, items]);

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

  // Update fields in items
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

  // Select confirm: 처리 상태
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus === selectedItem.status) return;
    if (!confirm(`처리 상태를 '${newStatus}'(으)로 변경하시겠습니까?`)) return;
    updateItemField(selectedItem.id, { status: newStatus });
  };

  // Input individual save
  const handleSaveField = (key) => {
    if (drafts[key] === undefined || drafts[key] === selectedItem[key]) return;
    updateItemField(selectedItem.id, { [key]: drafts[key] });
    setDrafts(p => { const n = { ...p }; delete n[key]; return n; });
  };

  // Address save
  const handleSaveAddress = () => {
    const updates = { deliveryAddress1: draftAddr1, deliveryAddress2: draftAddr2 };
    // 일반 + 배송지 미입력 + 주소 입력 → 발송 대기 자동 전이
    if (selectedItem.itemCategory === '일반' && selectedItem.status === '배송지 미입력' && draftAddr1.trim()) {
      updates.status = '발송 대기';
    }
    updateItemField(selectedItem.id, updates);
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

  // Photo handlers (즉시 반영)
  const handleAddPhoto = () => {
    const newPhoto = prompt("추가할 사진 URL을 입력하세요:", "https://via.placeholder.com/150");
    if (newPhoto) {
      updateItemField(selectedItem.id, { itemPhotos: [...selectedItem.itemPhotos, newPhoto] });
    }
  };
  const handleRemovePhoto = (index) => {
    updateItemField(selectedItem.id, { itemPhotos: selectedItem.itemPhotos.filter((_, i) => i !== index) });
  };

  // Get status options for current item
  const getStatusOptions = (item) => {
    if (!item) return [];
    if (TERMINAL_STATUSES.includes(item.status)) return [item.status];
    return STATUS_BY_CATEGORY[item.itemCategory] || [];
  };

  const columns = [
    { title: '분실물 ID', dataIndex: 'id', key: 'id' },
    { title: '파트너사', dataIndex: 'partnerName', key: 'partnerName' },
    { title: '차량 번호', dataIndex: 'carNumber', key: 'carNumber' },
    { title: '존 이름', dataIndex: 'zoneName', key: 'zoneName' },
    {
      title: '오더 ID', dataIndex: 'relatedOrderId', key: 'relatedOrderId',
      render: (text) => <a onClick={(e) => { e.stopPropagation(); setActiveKey('orders'); }} className="text-blue-500 hover:underline">{text || '-'}</a>,
    },
    { title: '접수 일시', dataIndex: 'createdAt', key: 'createdAt' },
    { title: '분실물 카드 번호', dataIndex: 'lostItemCardReceiptNumber', key: 'lostItemCardReceiptNumber' },
    {
      title: '처리상태', dataIndex: 'status', key: 'status',
      render: (status) => <Badge status={statusBadgeMap[status]} text={status} />,
    },
  ];

  const renderDrawerContent = () => {
    if (!selectedItem) return null;
    const data = selectedItem;
    const isTerminal = TERMINAL_STATUSES.includes(data.status);
    const isAddressChanged = draftAddr1 !== (data.deliveryAddress1 || '') || draftAddr2 !== (data.deliveryAddress2 || '');

    const renderFieldView = (label, content) => <Field label={label}>{content || '-'}</Field>;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 분실물 정보 */}
        <Card>
          <CardHeader><CardTitle>분실물 정보</CardTitle></CardHeader>
          <CardContent>
            {renderFieldView("분실물 ID", data.id)}
            {renderFieldView("접수 일시", data.createdAt)}

            {/* 분실물 구분 — Select (종결 상태면 텍스트) */}
            <Field label="분실물 구분">
              {isTerminal ? (
                <span>{data.itemCategory}</span>
              ) : (
                <Select value={data.itemCategory} onChange={handleCategoryChange}>
                  {itemClassificationOptions.map(opt => <Select.Option key={opt} value={opt}>{opt}</Select.Option>)}
                </Select>
              )}
            </Field>

            {/* 처리 상태 — Select (종결 상태면 Badge) */}
            <Field label="처리상태">
              {isTerminal ? (
                <Badge status={statusBadgeMap[data.status]} text={data.status} />
              ) : (
                <Select value={data.status} onChange={handleStatusChange}>
                  {getStatusOptions(data).map(opt => <Select.Option key={opt} value={opt}>{opt}</Select.Option>)}
                </Select>
              )}
            </Field>

            {/* 배송 주소 */}
            <Field label="배송 주소" isBlock>
              {isTerminal ? (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem' }}>{data.deliveryAddress1 || '-'}</div>
                  {data.deliveryAddress2 && <div style={{ fontSize: '0.875rem', color: styleVariables.mutedTextColor }}>{data.deliveryAddress2}</div>}
                </div>
              ) : (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input type="radio" name="addressMode" value="postcode" checked={addressInputMode === 'postcode'} onChange={() => setAddressInputMode('postcode')} />
                      우편번호 검색
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input type="radio" name="addressMode" value="manual" checked={addressInputMode === 'manual'} onChange={() => setAddressInputMode('manual')} />
                      직접 입력
                    </label>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ width: '50px', fontSize: '0.8rem', color: styleVariables.mutedTextColor, flexShrink: 0 }}>주소1</span>
                      <div style={{ flex: 1 }}>
                        <Input
                          value={draftAddr1}
                          onChange={(e) => setDraftAddr1(e.target.value)}
                          placeholder="주소를 입력하세요"
                          readOnly={addressInputMode === 'postcode'}
                        />
                      </div>
                      {addressInputMode === 'postcode' && (
                        <Button onClick={handleSearchAddress} style={{ flexShrink: 0 }}><MapPin size={16} style={{ marginRight: '0.25rem' }} /> 주소 검색</Button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ width: '50px', fontSize: '0.8rem', color: styleVariables.mutedTextColor, flexShrink: 0 }}>주소2</span>
                      <div style={{ flex: 1 }}>
                        <Input value={draftAddr2} onChange={(e) => setDraftAddr2(e.target.value)} placeholder="상세 주소를 입력하세요" />
                      </div>
                      <Button variant={isAddressChanged ? 'primary' : 'default'} onClick={handleSaveAddress} disabled={!isAddressChanged} style={{ flexShrink: 0 }}>저장</Button>
                    </div>
                  </div>
                </div>
              )}
            </Field>

            {/* 상세 정보 — Textarea + 개별 저장 */}
            <Field label="상세 정보" isBlock>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Textarea
                  rows={3}
                  value={drafts.itemDetails !== undefined ? drafts.itemDetails : data.itemDetails}
                  onChange={(e) => setDraft('itemDetails', e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant={(drafts.itemDetails !== undefined && drafts.itemDetails !== data.itemDetails) ? 'primary' : 'default'}
                    onClick={() => handleSaveField('itemDetails')}
                    disabled={drafts.itemDetails === undefined || drafts.itemDetails === data.itemDetails}
                  >저장</Button>
                </div>
              </div>
            </Field>

            {/* 습득물 사진 — 즉시 추가/삭제 */}
            <Field label="습득물 사진" isBlock>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {data.itemPhotos?.map((photo, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img src={photo} alt={`p-${index}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '0.25rem' }} />
                    <button style={{position:'absolute',top:'-5px',right:'-5px',background:'red',color:'white',border:'none',borderRadius:'50%',width:20,height:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={() => handleRemovePhoto(index)}><X size={14}/></button>
                  </div>
                ))}
              </div>
              <Button onClick={handleAddPhoto} style={{ marginTop: '0.5rem' }}><Plus size={16} style={{marginRight: '0.25rem'}} /> 사진 추가</Button>
            </Field>
          </CardContent>
        </Card>

        {/* 차량 정보 */}
        <Card>
          <CardHeader><CardTitle>차량 정보</CardTitle></CardHeader>
          <CardContent>
            {renderFieldView("차량 번호", data.carNumber)}
            {renderFieldView("존 이름", data.zoneName)}
            {renderFieldView("지역1", data.region1)}
            {renderFieldView("지역2", data.region2)}
            {renderFieldView("존 ID", data.zoneId)}
          </CardContent>
        </Card>

        {/* 세차 오더 정보 */}
        <Card>
          <CardHeader><CardTitle>세차 오더 정보</CardTitle></CardHeader>
          <CardContent>
            {renderFieldView("파트너사", data.partnerName)}
            <Field label="연계 오더 ID">
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    value={drafts.relatedOrderId !== undefined ? drafts.relatedOrderId : data.relatedOrderId}
                    onChange={(e) => setDraft('relatedOrderId', e.target.value)}
                  />
                </div>
                <Button
                  variant={(drafts.relatedOrderId !== undefined && drafts.relatedOrderId !== data.relatedOrderId) ? 'primary' : 'default'}
                  onClick={() => handleSaveField('relatedOrderId')}
                  disabled={drafts.relatedOrderId === undefined || drafts.relatedOrderId === data.relatedOrderId}
                >저장</Button>
              </div>
            </Field>
          </CardContent>
        </Card>

        {/* 분실물 카드 정보 */}
        <Card>
          <CardHeader><CardTitle>분실물 카드 정보</CardTitle></CardHeader>
          <CardContent>
            {renderFieldView("카드 접수 번호", data.lostItemCardReceiptNumber)}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader><CardTitle>분실물 관리</CardTitle></CardHeader>
        <CardContent>
          <div style={{ marginBottom: '1rem', display: 'flex' }}>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="처리상태 선택" allowClear>
              {allStatusOptions.map(option => <Select.Option key={option} value={option}>{option}</Select.Option>)}
            </Select>
            <Input
              placeholder="장애카드접수번호 검색..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              icon={<Search size={16}/>}
            />
          </div>
          <DataTable dataSource={filteredData} columns={columns} onRowClick={showDrawer} />
        </CardContent>
      </Card>

      <Drawer
        title="분실물 상세 정보"
        open={drawerVisible}
        onClose={closeDrawer}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="default" onClick={closeDrawer}>닫기</Button>
          </div>
        }
      >
        {renderDrawerContent()}
      </Drawer>
    </>
  );
};

export default LostItemsPage;
