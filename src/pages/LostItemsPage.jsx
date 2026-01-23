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

const Button = ({ children, onClick, variant = 'default', className = '' }) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: '1px solid transparent',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginRight: '0.5rem',
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
  return <button style={{ ...baseStyle, ...styles[variant] }} onClick={onClick} className={className}>{children}</button>;
};

const Input = ({ value, onChange, placeholder, icon }) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
    {icon && <div style={{ position: 'absolute', left: '0.75rem', color: styleVariables.mutedTextColor }}>{icon}</div>}
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: `0.5rem ${icon ? '2.25rem' : '0.75rem'}`,
        borderRadius: '0.375rem',
        border: `1px solid ${styleVariables.borderColor}`,
        fontSize: '0.875rem',
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


// --- INITIAL MOCK DATA ---
const initialMockLostItems = [
    // ... (data is the same)
      {
    id: 'LI0001',
    createdAt: '2024-07-21 10:30:00',
    itemCategory: '전자기기',
    status: '접수',
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
    deliveryAddress: '',
    customerReportedItemDetails: '고객이 분실물 신고함'
  },
  {
    id: 'LI0002',
    createdAt: '2024-07-20 15:00:00',
    itemCategory: '지갑',
    status: '보관중',
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
    deliveryAddress: '',
    customerReportedItemDetails: ''
  },
];

const statusOptions = ['접수', '보관중', '경찰서 인계', '배송 요청', '배송 완료'];
const itemClassificationOptions = ['일반', '귀중품'];

const statusBadgeMap = {
  '접수': 'processing', '보관중': 'warning', '경찰서 인계': 'error', '배송 요청': 'processing', '배송 완료': 'success',
};

const valuableCategories = ['전자기기', '지갑'];
const isValuable = (category) => valuableCategories.includes(category);

const LostItemsPage = ({ setActiveKey }) => {
  const [items, setItems] = useState(initialMockLostItems);
  const [filteredData, setFilteredData] = useState(items);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);

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
    setFormData(JSON.parse(JSON.stringify(item))); // Deep copy
    setDrawerVisible(true);
  };

  const closeDrawer = useCallback(() => {
    setDrawerVisible(false);
    setIsEditing(false);
    setTimeout(() => { // allow for animation
        setSelectedItem(null);
        setFormData(null);
    }, 300);
  }, []);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  const handleSave = () => {
    const newItems = items.map(item => (item.id === formData.id ? formData : item));
    setItems(newItems);
    setSelectedItem(formData);
    alert("옥스트라 시스템과 정보가 동기화되었습니다");
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("정말로 이 항목을 삭제하시겠습니까?")) {
        const newItems = items.filter(item => item.id !== selectedItem.id);
        setItems(newItems);
        closeDrawer();
    }
  };

  const handleFormChange = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
  const handleItemClassificationChange = (e) => {
    const newItemCategory = e.target.value === '귀중품' ? '전자기기' : '기타';
    handleFormChange('itemCategory', newItemCategory);
  };
  const handleAddPhoto = () => {
    const newPhoto = prompt("추가할 사진 URL을 입력하세요:", "https://via.placeholder.com/150");
    if (newPhoto) handleFormChange('itemPhotos', [...formData.itemPhotos, newPhoto]);
  };
  const handleRemovePhoto = (index) => handleFormChange('itemPhotos', formData.itemPhotos.filter((_, i) => i !== index));

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
    const data = isEditing ? formData : selectedItem;
    if (!data) return null;

    const renderFieldView = (label, content) => <Field label={label}>{content || '-'}</Field>;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Card>
          <CardHeader><CardTitle>분실물 정보</CardTitle></CardHeader>
          <CardContent>
            {isEditing ? (
              <>
                <Field label="분실물 ID">{data.id}</Field>
                <Field label="접수 일시">{data.createdAt}</Field>
                <Field label="분실물 구분"><Select value={isValuable(data.itemCategory) ? '귀중품' : '일반'} onChange={handleItemClassificationChange}>{itemClassificationOptions.map(opt => <Select.Option key={opt} value={opt}>{opt}</Select.Option>)}</Select></Field>
                <Field label="처리상태"><Select value={data.status} onChange={(e) => handleFormChange('status', e.target.value)}>{statusOptions.map(opt => <Select.Option key={opt} value={opt}>{opt}</Select.Option>)}</Select></Field>
                <Field label="상세 정보" isBlock><Textarea rows={3} value={data.itemDetails} onChange={(e) => handleFormChange('itemDetails', e.target.value)} /></Field>
                <Field label="사진" isBlock>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {data.itemPhotos?.map((photo, index) => (
                            <div key={index} style={{ position: 'relative' }}>
                                <img src={photo} alt={`p-${index}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '0.25rem' }} />
                                <button style={{position:'absolute',top:'-5px',right:'-5px',background:'red',color:'white',border:'none',borderRadius:'50%',width:20,height:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={() => handleRemovePhoto(index)}><X size={14}/></button>
                            </div>
                        ))}
                    </div>
                    <Button onClick={handleAddPhoto}><Plus size={16} style={{marginRight: '0.25rem'}} /> 사진 추가</Button>
                </Field>
              </>
            ) : (
              <>
                {renderFieldView("분실물 ID", data.id)}
                {renderFieldView("접수 일시", data.createdAt)}
                {renderFieldView("분실물 구분", isValuable(data.itemCategory) ? '귀중품' : '일반')}
                {renderFieldView("처리상태", <Badge status={statusBadgeMap[data.status]} text={data.status} />)}
                {renderFieldView("상세 정보", data.itemDetails)}
                {renderFieldView("사진", data.itemPhotos?.length > 0 ? data.itemPhotos.map((p, i) => <img key={i} src={p} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '0.25rem', marginRight: '0.5rem' }}/>) : '사진 없음')}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>차량 정보</CardTitle></CardHeader>
            <CardContent>
                {renderFieldView("차량 번호", data.carNumber)}
                {renderFieldView("존 이름", data.zoneName)}
                {renderFieldView("지역", `${data.region1} ${data.region2}`)}
                {renderFieldView("존 ID", data.zoneId)}
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>세차 오더 정보</CardTitle></CardHeader>
            <CardContent>
                {renderFieldView("파트너사", data.partnerName)}
                <Field label="연계 오더 ID">
                    {isEditing ? (
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                            <Input value={data.relatedOrderId} onChange={(e) => handleFormChange('relatedOrderId', e.target.value)} />
                            <Button onClick={() => alert("연계 가능한 오더 리스트를 조회합니다. (프로토타입)")}><Search size={16}/></Button>
                        </div>
                    ) : (
                        <a onClick={() => setActiveKey('orders')} style={{display: 'flex', alignItems: 'center', gap: '0.25rem', color: styleVariables.primaryColor}}>{data.relatedOrderId || '-'} <ExternalLink size={16}/></a>
                    )}
                </Field>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>분실물 카드 정보</CardTitle></CardHeader>
            <CardContent>
                {renderFieldView("카드 접수 번호", data.lostItemCardReceiptNumber)}
                <Field label="배송 주소">
                    {isEditing ? (
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                            <Input value={data.deliveryAddress} onChange={(e) => handleFormChange('deliveryAddress', e.target.value)} />
                            <Button onClick={() => alert("주소 검색 창이 열립니다. (프로토타입)")}><MapPin size={16}/></Button>
                        </div>
                    ) : (data.deliveryAddress || '-')}
                </Field>
                {renderFieldView("고객 신고 물품", data.customerReportedItemDetails)}
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader><CardTitle>분실물 관리</CardTitle></CardHeader>
        <CardContent>
            <div style={{ marginBottom: '1rem', display: 'flex' }}>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="처리상태 선택" allowClear>
                    {statusOptions.map(option => <Select.Option key={option} value={option}>{option}</Select.Option>)}
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
        title={isEditing ? "분실물 정보 수정" : "분실물 상세 정보"}
        open={drawerVisible}
        onClose={closeDrawer}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              {!isEditing && (
                 <Button variant="danger" onClick={handleDelete}><Trash2 size={16} style={{marginRight: '0.25rem'}}/> 삭제</Button>
              )}
            </div>
            <div style={{display: 'flex'}}>
              {isEditing ? (
                <>
                  <Button variant="default" onClick={handleCancel}>취소</Button>
                  <Button variant="primary" onClick={handleSave}>저장</Button>
                </>
              ) : (
                <>
                  <Button variant="default" onClick={closeDrawer}>닫기</Button>
                  <Button variant="primary" onClick={handleEdit}>수정</Button>
                </>
              )}
            </div>
          </div>
        }
      >
        {renderDrawerContent()}
      </Drawer>
    </>
  );
};

export default LostItemsPage;
