import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Trash2, MapPin, Search, AlertTriangle
} from 'lucide-react';

/**
 * Utility & UI Components (Local copies for standalone functionality)
 */
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className, children }) {
  return <div className={cn("rounded-xl bg-white border border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.02)]", className)}>{children}</div>;
}
function CardHeader({ className, children }) {
  return <div className={cn("p-5 pb-3", className)}>{children}</div>;
}
function CardTitle({ className, children }) {
  return <div className={cn("text-sm font-bold text-[#172B4D]", className)}>{children}</div>;
}
function CardContent({ className, children }) {
  return <div className={cn("p-5 pt-2", className)}>{children}</div>;
}
function Button({ className, variant = "default", size = "md", ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants = {
    default: "bg-[#0052CC] text-white hover:bg-[#0047B3] shadow-sm",
    secondary: "bg-white text-[#172B4D] border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-sm text-[#334155]",
    ghost: "bg-transparent text-[#172B4D] hover:bg-[#F4F5F7]",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-10 px-3.5 text-sm" };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
function Input({ className, ...props }) {
  return <input className={cn("h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]", className)} {...props} />;
}
function Select({ className, children, ...props }) {
  return <select className={cn("h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]", className)} {...props}>{children}</select>;
}
function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-slate-100 text-slate-800",
    danger: "bg-rose-100 text-rose-800",
    warn: "bg-amber-100 text-amber-800",
    ok: "bg-emerald-100 text-emerald-800",
    info: "bg-blue-100 text-blue-800",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", tones[tone])}>{children}</span>;
}
function Field({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="w-36 shrink-0 text-xs font-semibold text-[#6B778C] pt-2.5">{label}</div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

// Drawer Component
function Drawer({ open, title, onClose, children, footer }) {
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
      if (newWidth >= 400 && newWidth <= 1200) setWidth(newWidth);
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
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full bg-white shadow-2xl flex flex-col" style={{ width }}>
        <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#0052CC] transition-colors z-50" onMouseDown={() => setIsResizing(true)} />
        <div className="flex h-16 items-center justify-between border-b border-[#DFE1E6] px-6 shrink-0">
          <div className="text-lg font-bold text-[#172B4D]">{title}</div>
          <button onClick={onClose}><X className="h-6 w-6 text-gray-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        <div className="flex h-[72px] items-center justify-end gap-2 border-t border-[#DFE1E6] px-6 bg-[#F4F5F7] shrink-0">{footer}</div>
      </div>
    </div>
  );
}

// Pagination Hook & Component
function usePagination(data, itemsPerPage = 40) {
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => setCurrentPage(1), [data]);
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const currentData = useMemo(() => data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [data, currentPage, itemsPerPage]);
  return { currentPage, setCurrentPage, totalPages, currentData, totalItems };
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 0) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <Button variant="ghost" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
      {pages.map(p => (
        <Button key={p} variant={p === currentPage ? "default" : "ghost"} size="sm" className={cn("w-8 h-8 p-0", p !== currentPage && "font-normal text-[#6B778C]")} onClick={() => onPageChange(p)}>{p}</Button>
      ))}
      <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
    </div>
  );
}

// DataTable Component
function DataTable({ columns, rows, onRowClick, rowKey, sortConfig, onSort }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
      <table className="min-w-full bg-white text-left text-sm">
        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <tr>
            {columns.map(c => (
              <th key={c.key} className={cn("whitespace-nowrap px-4 py-3.5 text-[13px] font-semibold text-[#475569]", c.sortable && "cursor-pointer hover:bg-slate-100", c.align === 'center' && 'text-center')} onClick={() => c.sortable && onSort && onSort(c.key)}>
                <div className={cn("flex items-center gap-1", c.align === 'center' && 'justify-center')}>
                  {c.header}
                  {c.sortable && (
                    <ArrowUpDown className={cn("h-3 w-3", sortConfig?.key === c.key ? "text-[#0052CC]" : "text-[#C1C7CD]")} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {rows.length === 0 ? <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[#6B778C]">결과가 없습니다.</td></tr> : rows.map(r => (
            <tr key={rowKey(r)} className={cn(onRowClick ? "cursor-pointer hover:bg-[#F1F5F9]" : "hover:bg-[#F8FAFC]")} onClick={() => onRowClick?.(r)}>
              {columns.map(c => <td key={c.key} className={cn("whitespace-nowrap px-4 py-3.5 text-sm text-[#1E293B]", c.align === 'center' && 'text-center')}>{typeof c.render === "function" ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Tabs Components
function Tabs({ value, children }) { return <div className="w-full space-y-4">{children}</div>; }
function TabsList({ children }) { return <div className="flex border-b border-[#DFE1E6]">{children}</div>; }
function TabsTrigger({ value, currentValue, onClick, children }) {
  const active = value === currentValue;
  return (
    <button onClick={() => onClick(value)} className={cn("relative px-4 py-2.5 text-sm font-medium transition-all", active ? "text-[#0052CC]" : "text-[#6B778C] hover:text-[#172B4D]")}>
      {children}
      {active && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#0052CC]" />}
    </button>
  );
}
function TabsContent({ value, currentValue, children, className }) {
  if (value !== currentValue) return null;
  return <div className={cn("animate-in fade-in slide-in-from-bottom-1 duration-200", className)}>{children}</div>;
}

/**
 * Mock Data (V2)
 */
const MOCK_ALL_ZONES = Array.from({ length: 150 }, (_, i) => {
  const region1Options = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종"];
  const region1 = region1Options[i % region1Options.length];
  return {
    zoneId: `Z-${1000 + i}`,
    zoneName: ` ${i + 1}번존`,
    region1: region1,
    region2: `${region1.charAt(0)}${i % 5 + 1}구`,
  };
});

// Daum Postcode API lazy loader
const loadDaumPostcode = () => new Promise((resolve, reject) => {
  if (window.daum?.Postcode) return resolve();
  const s = document.createElement('script');
  s.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
  s.onload = resolve;
  s.onerror = () => reject(new Error('Daum Postcode API 로드 실패'));
  document.head.appendChild(s);
});

// Naver Maps JavaScript API v3 lazy loader
const loadNaverMaps = () => new Promise((resolve, reject) => {
  if (window.naver?.maps) return resolve();
  const s = document.createElement('script');
  s.src = 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=NAVER_CLIENT_ID&submodules=geocoder';
  s.onload = () => {
    if (window.naver?.maps) resolve();
    else reject(new Error('Naver Maps API 로드 실패'));
  };
  s.onerror = () => reject(new Error('Naver Maps API 로드 실패'));
  document.head.appendChild(s);
});

function NaverMapSearch({ onSelect }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [apiLoaded, setApiLoaded] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadNaverMaps()
      .then(() => { if (!cancelled) setApiLoaded(true); })
      .catch(() => { if (!cancelled) setApiError(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!apiLoaded || !mapRef.current || mapInstance.current) return;
    const map = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(37.5665, 126.978),
      zoom: 15,
    });
    mapInstance.current = map;

    window.naver.maps.Event.addListener(map, 'click', (e) => {
      const latlng = e.coord;
      placeMarker(latlng);
      reverseGeocode(latlng);
    });
  }, [apiLoaded]);

  const placeMarker = (latlng) => {
    if (markerRef.current) markerRef.current.setPosition(latlng);
    else markerRef.current = new window.naver.maps.Marker({ position: latlng, map: mapInstance.current });
  };

  const reverseGeocode = (latlng) => {
    window.naver.maps.Service.reverseGeocode(
      { coords: latlng, orders: [window.naver.maps.Service.OrderType.ROAD_ADDR, window.naver.maps.Service.OrderType.ADDR].join(',') },
      (status, response) => {
        if (status !== window.naver.maps.Service.Status.OK) return;
        const items = response.v2?.results || [];
        const road = items.find(i => i.name === 'roadaddr');
        const addr = items.find(i => i.name === 'addr');
        const pick = road || addr;
        if (pick) {
          const full = [pick.region?.area1?.name, pick.region?.area2?.name, pick.region?.area3?.name, pick.land?.name, pick.land?.number1, pick.land?.number2 ? '-' + pick.land?.number2 : ''].filter(Boolean).join(' ');
          setSelectedAddress(full);
          onSelect(full);
        }
      }
    );
  };

  const handleSearch = () => {
    if (!query.trim() || !apiLoaded) return;
    window.naver.maps.Service.geocode({ query: query.trim() }, (status, response) => {
      if (status !== window.naver.maps.Service.Status.OK) return;
      const item = response.v2?.addresses?.[0];
      if (!item) return;
      const latlng = new window.naver.maps.LatLng(parseFloat(item.y), parseFloat(item.x));
      mapInstance.current.setCenter(latlng);
      placeMarker(latlng);
      const addr = item.roadAddress || item.jibunAddress || query.trim();
      setSelectedAddress(addr);
      onSelect(addr);
    });
  };

  if (apiError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        Naver Maps API를 불러올 수 없습니다. Client ID를 확인해주세요.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="주소를 검색하세요"
          className="flex-1"
        />
        <Button variant="secondary" onClick={handleSearch} className="shrink-0">
          <Search className="mr-1 h-4 w-4" /> 검색
        </Button>
      </div>
      <div ref={mapRef} className="h-64 w-full rounded-lg border border-[#E2E8F0] bg-[#F4F5F7]" />
      {selectedAddress && (
        <div className="text-xs text-[#6B778C]">선택된 주소: <span className="font-medium text-[#172B4D]">{selectedAddress}</span></div>
      )}
    </div>
  );
}

const MOCK_PARTNERS_V2 = [
  {
    partnerId: 'P-001',
    partnerName: '강남모빌리티',
    partnerCategory: '세차 파트너',
    partnerSubCategory: '현장 세차장',
    address: '서울시 강남구 테헤란로 123',
    addressDetail: '4층 401호',
    contactName: '김담당',
    contactPhone: '010-1234-5678',
    businessNumber: '123-45-67890',
    corpName: '(주)강남모빌리티',
    ceoName: '김대표',
    bizType: '서비스업',
    bizItem: '세차 및 차량 관리',
    bizAddress: '서울시 강남구 역삼동 123-45',
    bizAddressDetail: '강남빌딩 5층',
    isActive: true,
    createdAt: '2025-01-01',
    assignedZoneIds: MOCK_ALL_ZONES.slice(0, 60).map(z => z.zoneId),
    unitPrices: [
      { id: 1, orderGroup: '정규', washType: '내외부', price: 15000, effectiveDate: '2025-01-01' },
      { id: 2, orderGroup: '수시', washType: '외부', price: 12000, effectiveDate: '2025-03-15' },
      { id: 3, orderGroup: '긴급', washType: '내외부', price: 20000, effectiveDate: '2025-06-01' },
      { id: 4, orderGroup: '정규', washType: '내부', price: 10000, effectiveDate: '2025-09-01' },
      { id: 5, orderGroup: '변경', washType: '특수', price: 35000, effectiveDate: '2026-01-15' },
      { id: 6, orderGroup: '정규', washType: '내외부', price: 17000, effectiveDate: '2026-06-01' },
      { id: 7, orderGroup: '긴급', washType: '내외부', price: 23000, effectiveDate: '2026-06-01' },
      { id: 8, orderGroup: '수시', washType: '외부', price: 14000, effectiveDate: '2026-07-01' },
      { id: 9, orderGroup: '특별', washType: '협의', price: 50000, effectiveDate: '2026-09-01' },
    ],
  },
  {
    partnerId: 'P-002',
    partnerName: '수원카케어',
    partnerCategory: '세차 파트너',
    partnerSubCategory: '입고 세차장',
    address: '경기도 수원시 팔달구 인계로 456',
    addressDetail: '2층',
    contactName: '박매니저',
    contactPhone: '031-987-6543',
    businessNumber: '987-65-43210',
    corpName: '수원카케어',
    ceoName: '이사장',
    bizType: '서비스업',
    bizItem: '수원 지역 전문 세차',
    bizAddress: '경기도 수원시 팔달구 매산로 789',
    bizAddressDetail: '',
    isActive: true,
    createdAt: '2024-06-01',
    assignedZoneIds: MOCK_ALL_ZONES.slice(60, 120).map(z => z.zoneId),
    unitPrices: [
      { id: 1, orderGroup: '정규', washType: '내외부', price: 16000, effectiveDate: '2024-06-01' },
      { id: 2, orderGroup: '긴급', washType: '내외부', price: 22000, effectiveDate: '2025-01-01' },
      { id: 3, orderGroup: '수시', washType: '내부', price: 11000, effectiveDate: '2025-08-15' },
      { id: 4, orderGroup: '정규', washType: '내외부', price: 18000, effectiveDate: '2026-06-15' },
      { id: 5, orderGroup: '긴급', washType: '내외부', price: 25000, effectiveDate: '2026-08-01' },
    ],
  },
];

/**
 * Main Page Component
 */
export default function PartnersPage() {
  const [partners, setPartners] = useState(MOCK_PARTNERS_V2);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'partnerId', direction: 'desc' });

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return partners;
    return [...partners].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [partners, sortConfig]);

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const columns = [
    { key: 'partnerId', header: '파트너 ID' },
    { key: 'partnerCategory', header: '구분' },
    { key: 'partnerSubCategory', header: '하위 구분' },
    { key: 'partnerName', header: '파트너 이름' },
    { key: 'address', header: '주소', render: r => [r.address, r.addressDetail].filter(Boolean).join(' ') },
    { key: 'corpName', header: '법인명' },
  ];

  const handleSave = (partnerToSave) => {
    setPartners(prev => prev.map(p => p.partnerId === partnerToSave.partnerId ? partnerToSave : p));
    setSelectedPartner(null);
  };

  const handleDelete = (partnerId) => {
    if (!window.confirm('해당 파트너를 삭제하시겠습니까?')) return;
    setPartners(prev => prev.filter(p => p.partnerId !== partnerId));
    setSelectedPartner(null);
  };

  const handleCreate = () => {
    const newPartner = {
      partnerId: `P-${Date.now()}`,
      partnerName: '',
      partnerCategory: '세차 파트너',
      partnerSubCategory: '현장 세차장',
      address: '',
      addressDetail: '',
      contactName: '',
      contactPhone: '',
      businessNumber: '',
      corpName: '',
      ceoName: '',
      bizType: '',
      bizItem: '',
      bizAddress: '',
      bizAddressDetail: '',
      isActive: true,
      assignedZoneIds: [],
      createdAt: new Date().toISOString().split('T')[0],
      unitPrices: [],
    };
    setSelectedPartner(newPartner);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">파트너 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">세차 파트너사의 정보 및 단가 정책을 관리합니다.</div>
        </div>
        <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" /> 신규 파트너 등록</Button>
      </div>


      <DataTable columns={columns} rows={currentData} rowKey={r => r.partnerId} onRowClick={setSelectedPartner} sortConfig={sortConfig} onSort={handleSort} />
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

      {selectedPartner && (
        <PartnerDetailDrawer
          partner={selectedPartner}
          onClose={() => setSelectedPartner(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function AddressField({ label, address, addressDetail, addressKey, addressDetailKey, onFieldChange, required }) {
  const [mode, setMode] = useState('postcode');

  const handleSearchAddress = async () => {
    try {
      await loadDaumPostcode();
      new window.daum.Postcode({
        oncomplete: (data) => {
          onFieldChange(addressKey, data.roadAddress || data.jibunAddress);
        }
      }).open();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <Field label={required ? <>{label}<span className="text-rose-500 ml-1">*</span></> : label}>
        <div className="space-y-3">
          <div className="flex gap-4">
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input type="radio" name={`addrMode-${addressKey}`} value="postcode" checked={mode === 'postcode'} onChange={() => setMode('postcode')} />
              우편번호 검색
            </label>
            <label className="flex items-center gap-1 text-sm cursor-pointer">
              <input type="radio" name={`addrMode-${addressKey}`} value="map" checked={mode === 'map'} onChange={() => setMode('map')} />
              지도 검색
            </label>
          </div>
          {mode === 'postcode' && (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input value={address || ''} readOnly placeholder="주소 검색 결과가 표시됩니다" />
              </div>
              <Button variant="secondary" onClick={handleSearchAddress} className="shrink-0">
                <MapPin className="mr-1 h-4 w-4" /> 주소 검색
              </Button>
            </div>
          )}
          {mode === 'map' && (
            <>
              <NaverMapSearch onSelect={(addr) => onFieldChange(addressKey, addr)} />
              <Input value={address || ''} readOnly placeholder="지도에서 주소를 선택하세요" />
            </>
          )}
        </div>
      </Field>
      <Field label={required ? <>상세 주소<span className="text-rose-500 ml-1">*</span></> : "상세 주소"}>
        <Input
          value={addressDetail || ''}
          onChange={(e) => onFieldChange(addressDetailKey, e.target.value)}
          placeholder="상세 주소를 입력하세요"
        />
      </Field>
    </>
  );
}

function PartnerDetailDrawer({ partner, onClose, onSave, onDelete }) {
  const [activeTab, setActiveTab] = useState("info");
  const [formData, setFormData] = useState({ ...partner });
  const isExisting = !!partner?.partnerId && !!partner.partnerName;
  const [isEditMode, setIsEditMode] = useState(!isExisting);

  useEffect(() => {
    setFormData({ ...partner });
    setIsEditMode(!partner?.partnerId || !partner?.partnerName);
  }, [partner]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    setFormData({ ...partner });
    setIsEditMode(false);
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditMode(false);
  };

  const footer = (() => {
    if (activeTab === 'prices') {
      return (
        <div className="flex w-full flex-col-reverse sm:flex-row sm:justify-between">
          <div>{isExisting && <Button variant="danger" onClick={() => onDelete(partner.partnerId)}>삭제</Button>}</div>
          <Button variant="secondary" onClick={onClose}>닫기</Button>
        </div>
      );
    }
    if (!isExisting) {
      return (
        <div className="flex w-full flex-col-reverse sm:flex-row sm:justify-between">
          <div />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>닫기</Button>
            <Button onClick={handleSave}>등록하기</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex w-full flex-col-reverse sm:flex-row sm:justify-between">
        <div>{isEditMode && <Button variant="danger" onClick={() => onDelete(partner.partnerId)}>삭제</Button>}</div>
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button variant="secondary" onClick={handleCancel}>취소</Button>
              <Button onClick={handleSave}>저장하기</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={onClose}>닫기</Button>
              <Button onClick={() => setIsEditMode(true)}>수정하기</Button>
            </>
          )}
        </div>
      </div>
    );
  })();

  return (
    <Drawer open={!!partner} title={partner.partnerName ? `파트너 상세 - ${partner.partnerName}` : "신규 파트너 등록"} onClose={onClose}
      footer={footer}
    >
      <Tabs value={activeTab}>
        <TabsList>
          <TabsTrigger value="info" currentValue={activeTab} onClick={setActiveTab}>파트너 정보</TabsTrigger>
          <TabsTrigger value="prices" currentValue={activeTab} onClick={setActiveTab}>단가 정책 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="info" currentValue={activeTab} className="pt-4">
          <div className="space-y-6">
            {/* 카드 1: 기본 정보 */}
            <Card>
              <CardHeader><CardTitle>기본 정보</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Field label="파트너 구분">
                    <div className="text-sm pt-2.5">세차 파트너</div>
                  </Field>
                  <Field label={isEditMode ? <>파트너 하위 구분<span className="text-rose-500 ml-1">*</span></> : "파트너 하위 구분"}>
                    {isEditMode ? (
                      <Select name="partnerSubCategory" value={formData.partnerSubCategory || '현장 세차장'} onChange={handleInputChange}>
                        <option value="입고 세차장">입고 세차장</option>
                        <option value="현장 세차장">현장 세차장</option>
                      </Select>
                    ) : <div className="text-sm pt-2.5">{formData.partnerSubCategory || '-'}</div>}
                  </Field>
                  <Field label={isEditMode ? <>파트너 이름<span className="text-rose-500 ml-1">*</span></> : "파트너 이름"}>
                    {isEditMode ? (
                      <Input name="partnerName" value={formData.partnerName || ''} onChange={handleInputChange} placeholder="파트너 이름 입력" />
                    ) : <div className="text-sm pt-2.5">{formData.partnerName || '-'}</div>}
                  </Field>
                  {isEditMode ? (
                    <AddressField
                      label="주소"
                      address={formData.address}
                      addressDetail={formData.addressDetail}
                      addressKey="address"
                      addressDetailKey="addressDetail"
                      onFieldChange={handleFieldChange}
                      required
                    />
                  ) : (
                    <>
                      <Field label="주소"><div className="text-sm pt-2.5">{formData.address || '-'}</div></Field>
                      <Field label="상세 주소"><div className="text-sm pt-2.5">{formData.addressDetail || '-'}</div></Field>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 카드 2: 주 연락처 */}
            <Card>
              <CardHeader><CardTitle>주 연락처</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Field label={isEditMode ? <>이름<span className="text-rose-500 ml-1">*</span></> : "이름"}>
                    {isEditMode ? (
                      <Input name="contactName" value={formData.contactName || ''} onChange={handleInputChange} placeholder="담당자 이름 입력" />
                    ) : <div className="text-sm pt-2.5">{formData.contactName || '-'}</div>}
                  </Field>
                  <Field label={isEditMode ? <>전화번호<span className="text-rose-500 ml-1">*</span></> : "전화번호"}>
                    {isEditMode ? (
                      <Input name="contactPhone" value={formData.contactPhone || ''} onChange={handleInputChange} placeholder="전화번호 입력" />
                    ) : <div className="text-sm pt-2.5">{formData.contactPhone || '-'}</div>}
                  </Field>
                </div>
              </CardContent>
            </Card>

            {/* 카드 3: 사업자 정보 */}
            <Card>
              <CardHeader><CardTitle>사업자 정보</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Field label={isEditMode ? <>사업자등록번호<span className="text-rose-500 ml-1">*</span></> : "사업자등록번호"}>
                    {isEditMode ? (
                      <Input name="businessNumber" value={formData.businessNumber || ''} onChange={handleInputChange} placeholder="사업자등록번호 입력" />
                    ) : <div className="text-sm pt-2.5">{formData.businessNumber || '-'}</div>}
                  </Field>
                  <Field label={isEditMode ? <>법인명<span className="text-rose-500 ml-1">*</span></> : "법인명"}>
                    {isEditMode ? (
                      <Input name="corpName" value={formData.corpName || ''} onChange={handleInputChange} placeholder="법인명 입력" />
                    ) : <div className="text-sm pt-2.5">{formData.corpName || '-'}</div>}
                  </Field>
                  <Field label={isEditMode ? <>대표자<span className="text-rose-500 ml-1">*</span></> : "대표자"}>
                    {isEditMode ? (
                      <Input name="ceoName" value={formData.ceoName || ''} onChange={handleInputChange} placeholder="대표자 이름 입력" />
                    ) : <div className="text-sm pt-2.5">{formData.ceoName || '-'}</div>}
                  </Field>
                  <Field label={isEditMode ? <>업태<span className="text-rose-500 ml-1">*</span></> : "업태"}>
                    {isEditMode ? (
                      <Input name="bizType" value={formData.bizType || ''} onChange={handleInputChange} placeholder="업태 입력" />
                    ) : <div className="text-sm pt-2.5">{formData.bizType || '-'}</div>}
                  </Field>
                  <Field label={isEditMode ? <>업종<span className="text-rose-500 ml-1">*</span></> : "업종"}>
                    {isEditMode ? (
                      <Input name="bizItem" value={formData.bizItem || ''} onChange={handleInputChange} placeholder="업종 입력" />
                    ) : <div className="text-sm pt-2.5">{formData.bizItem || '-'}</div>}
                  </Field>
                  {isEditMode ? (
                    <AddressField
                      label="주소"
                      address={formData.bizAddress}
                      addressDetail={formData.bizAddressDetail}
                      addressKey="bizAddress"
                      addressDetailKey="bizAddressDetail"
                      onFieldChange={handleFieldChange}
                      required
                    />
                  ) : (
                    <>
                      <Field label="주소"><div className="text-sm pt-2.5">{formData.bizAddress || '-'}</div></Field>
                      <Field label="상세 주소"><div className="text-sm pt-2.5">{formData.bizAddressDetail || '-'}</div></Field>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prices" currentValue={activeTab} className="pt-4">
          <PricePolicyTab formData={formData} setFormData={setFormData} />
        </TabsContent>
      </Tabs>
    </Drawer>
  );
}

function PricePolicyTab({ formData, setFormData }) {
  const today = new Date().toISOString().split('T')[0];
  const [newPrice, setNewPrice] = useState({
    orderGroup: '긴급',
    washType: '내외부',
    price: 0,
    effectiveDate: today
  });

  // 정책을 적용 중 / 예정으로 분류
  const { activePolicies, scheduledPolicies } = useMemo(() => {
    const prices = formData.unitPrices || [];
    const active = prices.filter(p => p.effectiveDate <= today).sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
    const scheduled = prices.filter(p => p.effectiveDate > today).sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
    return { activePolicies: active, scheduledPolicies: scheduled };
  }, [formData.unitPrices, today]);

  // 예정 정책을 날짜별로 그룹화
  const scheduledGroups = useMemo(() => {
    const groups = {};
    scheduledPolicies.forEach(p => {
      if (!groups[p.effectiveDate]) groups[p.effectiveDate] = [];
      groups[p.effectiveDate].push(p);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [scheduledPolicies]);

  const handleAdd = () => {
    if (newPrice.price <= 0) return alert("금액을 입력해주세요.");
    if (!newPrice.effectiveDate) return alert("적용 시작일을 선택해주세요.");
    if (!window.confirm("정책을 추가할까요?")) return;
    const nextId = (formData.unitPrices?.length || 0) > 0
      ? Math.max(...formData.unitPrices.map(p => p.id)) + 1
      : 1;
    const newItem = { ...newPrice, id: nextId };
    setFormData(prev => ({
      ...prev,
      unitPrices: [...(prev.unitPrices || []), newItem]
    }));
    setNewPrice({ orderGroup: '긴급', washType: '내외부', price: 0, effectiveDate: today });
  };

  const handleRemove = (id) => {
    if (!window.confirm("정책을 삭제할까요?")) return;
    setFormData(prev => ({
      ...prev,
      unitPrices: prev.unitPrices.filter(p => p.id !== id)
    }));
  };

  const PolicyTable = ({ policies, emptyMessage }) => (
    <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <tr>
            <th className="px-4 py-2 font-semibold text-[#475569]">오더 구분</th>
            <th className="px-4 py-2 font-semibold text-[#475569]">세차 유형</th>
            <th className="px-4 py-2 font-semibold text-[#475569]">단가</th>
            <th className="px-4 py-2 font-semibold text-[#475569]">적용 시작일</th>
            <th className="px-4 py-2 font-semibold text-[#475569]">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {policies.map(p => (
            <tr key={p.id}>
              <td className="px-4 py-2">{p.orderGroup}</td>
              <td className="px-4 py-2">{p.washType}</td>
              <td className="px-4 py-2">{p.price.toLocaleString()}원</td>
              <td className="px-4 py-2">{p.effectiveDate}</td>
              <td className="px-4 py-2">
                <button onClick={() => handleRemove(p.id)} className="text-rose-600 hover:underline">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
          {policies.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-4 text-center text-[#6B778C]">{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 적용 중 단가 정책 */}
      <Card>
        <CardHeader>
          <CardTitle>적용 중 단가 정책</CardTitle>
        </CardHeader>
        <CardContent>
          <PolicyTable policies={activePolicies} emptyMessage="적용 중인 정책이 없습니다." />
        </CardContent>
      </Card>

      {/* 예정된 단가 정책 */}
      {scheduledPolicies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>예정된 단가 정책</CardTitle>
          </CardHeader>
          <CardContent>
            <PolicyTable policies={scheduledPolicies} emptyMessage="" />
          </CardContent>
        </Card>
      )}

      {/* 예정 정책이 없을 때 안내 */}
      {scheduledGroups.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>예정된 단가 정책</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-[#E2E8F0] px-4 py-4 text-center text-sm text-[#6B778C]">
              예정된 정책이 없습니다.
            </div>
          </CardContent>
        </Card>
      )}

      {/* 정책 추가 */}
      <Card>
        <CardHeader><CardTitle>정책 추가</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[100px] space-y-1">
            <label className="text-xs font-semibold text-[#6B778C]">오더 구분</label>
            <Select value={newPrice.orderGroup} onChange={e => setNewPrice({...newPrice, orderGroup: e.target.value})}>
              <option>긴급</option><option>정규</option><option>변경</option><option>수시</option><option>특별</option>
            </Select>
          </div>
          <div className="flex-1 min-w-[100px] space-y-1">
            <label className="text-xs font-semibold text-[#6B778C]">세차 유형</label>
            <Select value={newPrice.washType} onChange={e => setNewPrice({...newPrice, washType: e.target.value})}>
              <option>내외부</option><option>내부</option><option>외부</option><option>특수</option><option>협의</option><option>라이트</option><option>기계세차</option>
            </Select>
          </div>
          <div className="flex-1 min-w-[80px] space-y-1">
            <label className="text-xs font-semibold text-[#6B778C]">단가</label>
            <Input type="number" value={newPrice.price} onChange={e => setNewPrice({...newPrice, price: Number(e.target.value)})} placeholder="0" />
          </div>
          <div className="flex-1 min-w-[130px] space-y-1">
            <label className="text-xs font-semibold text-[#6B778C]">적용 시작일</label>
            <Input type="date" value={newPrice.effectiveDate} onChange={e => setNewPrice({...newPrice, effectiveDate: e.target.value})} />
          </div>
          <Button onClick={handleAdd}><Plus className="h-4 w-4" /></Button>
        </CardContent>
      </Card>
    </div>
  );
}