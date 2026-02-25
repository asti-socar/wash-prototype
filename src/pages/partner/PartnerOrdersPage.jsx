import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Download,
  ExternalLink,
  Maximize2,
  ClipboardList,
  PackageSearch,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  RotateCcw,
} from "lucide-react";
import {
  cn,
  toYmd,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  Chip,
  Drawer,
  usePagination,
  DataTable,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui";
import ALL_ORDERS from "../../mocks/orders.json";
import MOCK_LOST_ITEMS from "../../mocks/orders-lostItems.json";
import MOCK_LEAD_TIME_DATA from "../../mocks/orders-leadTime.json";
import MOCK_DELIVERY_INFO_DATA from "../../mocks/orders-deliveryInfo.json";
import MOCK_HANDLER_INFO_DATA from "../../mocks/orders-handlerInfo.json";

const ORDER_GROUPS = ["긴급", "정규", "변경", "수시", "특별"];
const ORDER_TYPES = [
  "위생장애",
  "고객 피드백(ML)_긴급",
  "초장기 미세차",
  "주기세차",
  "고객 피드백(ML)",
  "반납 사진(ML)",
  "미션핸들",
  "특수세차",
  "협의세차",
  "재세차",
  "수시세차",
  "BMW",
  "랜지로버",
  "포르쉐",
  "캠핑카",
];
const WASH_TYPES = ["내외부", "내부", "외부", "특수", "협의", "라이트", "기계세차"];

const DELIVERY_STATUS_MAP = {
  WAITING: "매칭 전",
  ASSIGN: "매칭 완료",
  RUN: "운행 중",
  END: "운행 종료",
  FORCE_END: "강제 반납",
  CANCEL: "예약 취소",
  ETC: "알 수 없음",
};

const HANDLER_STATUS_MAP = {
  CONFIRMED: "예약 완료",
  IN_PROGRESS: "수행 중",
  COMPLETED: "완료",
};

const formatLeadTimeHours = (h) => {
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  const rem = h % 24;
  return `${h}h (${days}일 ${rem}시간)`;
};

const CANCEL_TYPES = ["시스템(변경 취소)", "시스템(미예약 취소)", "시스템(노쇼 취소)", "시스템(예약 불가)", "시스템(우천 취소)", "수행원(차량 없음)", "수행원(주차장 문제)", "수행원(기타)", "수행원(개인 사유)"];

// 파트너 이름, 파트너 유형 제외
const SECONDARY_FILTER_DEFS = [
  { key: 'model', label: '차종' },
  { key: 'zone', label: '존 이름' },
  { key: 'orderGroup', label: '오더 구분' },
  { key: 'orderType', label: '발행 유형' },
  { key: 'region1', label: '지역1' },
  { key: 'region2', label: '지역2' },
  { key: 'cancelType', label: '취소 유형' },
  { key: 'delayed', label: '지연 여부' },
];

/** 검색 가능한 셀렉트 */
function SearchableSelect({ value, onChange, options, placeholder = "검색" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B778C]" />
        <input
          className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white pl-8 pr-8 text-sm text-[#172B4D] outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
          value={value || search}
          onChange={(e) => {
            if (value) { onChange(""); setSearch(e.target.value); }
            else { setSearch(e.target.value); }
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={value ? value : placeholder}
        />
        {value && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-[#DFE1E6]"
            onClick={() => { onChange(""); setSearch(""); }}
          >
            <X className="h-3.5 w-3.5 text-[#6B778C]" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-[#DFE1E6] bg-white shadow-lg py-1">
          <button
            className="w-full text-left px-3 py-1.5 text-sm text-[#6B778C] hover:bg-[#F4F5F7]"
            onClick={() => { onChange(""); setSearch(""); setOpen(false); }}
          >
            전체
          </button>
          {filtered.map((opt) => (
            <button
              key={opt}
              className={cn(
                "w-full text-left px-3 py-1.5 text-sm hover:bg-[#F4F5F7]",
                opt === value ? "bg-[#E9F2FF] text-[#0052CC] font-medium" : "text-[#172B4D]"
              )}
              onClick={() => { onChange(opt); setSearch(""); setOpen(false); }}
            >
              {opt}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-[#6B778C]">결과 없음</div>
          )}
        </div>
      )}
    </div>
  );
}

function PartnerOrdersPage({ currentPartner, initialFilter }) {
  const today = new Date();

  // 파트너 데이터만 필터
  const partnerOrders = useMemo(
    () => ALL_ORDERS.filter((o) => o.partner === currentPartner.partnerName),
    [currentPartner.partnerName]
  );

  const [q, setQ] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [periodFrom, setPeriodFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return toYmd(d);
  });
  const [periodTo, setPeriodTo] = useState(toYmd(today));
  const [fWashType, setFWashType] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fModel, setFModel] = useState("");
  const [fZone, setFZone] = useState("");
  const [fOrderGroup, setFOrderGroup] = useState("");
  const [fOrderType, setFOrderType] = useState("");
  const [fRegion1, setFRegion1] = useState("");
  const [fRegion2, setFRegion2] = useState("");
  const [fCancelType, setFCancelType] = useState("");
  const [fDelayed, setFDelayed] = useState("");
  const [activeSecondaryFilters, setActiveSecondaryFilters] = useState(new Set());
  const [showSecondaryFilters, setShowSecondaryFilters] = useState(true);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // initialFilter (대시보드 → 오더 조회 연동)
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.status) {
        setFStatus(initialFilter.status);
        if (initialFilter.status === "취소") {
          setActiveSecondaryFilters(prev => new Set([...prev, 'cancelType']));
        }
        if (initialFilter.status === "완료") {
          setActiveSecondaryFilters(prev => new Set([...prev, 'delayed']));
        }
      }
      if (initialFilter.orderType) {
        setFOrderType(initialFilter.orderType);
        setActiveSecondaryFilters(prev => new Set([...prev, 'orderType']));
      }
      if (initialFilter.cancelType) {
        setFCancelType(initialFilter.cancelType);
        setActiveSecondaryFilters(prev => new Set([...prev, 'cancelType']));
      }
      if (initialFilter.delayed) {
        setFDelayed(initialFilter.delayed);
        setActiveSecondaryFilters(prev => new Set([...prev, 'delayed']));
      }
    }
  }, [initialFilter]);

  const [selected, setSelected] = useState(null);
  const [drawerTab, setDrawerTab] = useState("info");
  const [previewImage, setPreviewImage] = useState(null);

  const formatCreatedAt = (order) => {
    if (!order.createdAt) return "-";
    if (order.createdAt.length > 10) return order.createdAt;
    const lastDigit = parseInt(order.orderId.slice(-1), 10) || 0;
    const hour = (8 + lastDigit) % 24;
    const minute = (lastDigit * 5) % 6 * 10;
    return `${order.createdAt} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  const getPhotosByWashType = (order) => {
    if (!order) return { pre: [], post: [] };
    const pre = order.inspectionType === 'D' ? [] : order.preWashPhotos || [];
    const post = order.postWashPhotos || [];
    return { pre, post };
  };

  const getInspectionItemsByType = (type) => {
    const allItems = {
      mileage: { label: '적산거리 (km)' },
      tireTread: { label: '타이어트레드', renderer: 'TireGrid' },
      windowStatus: { label: '유리창' },
      batteryVoltage: { label: '배터리전압' },
      safetyTriangle: { label: '안전삼각대' },
      fireExtinguisher: { label: '차량용 소화기' },
      washerFluidTank: { label: '워셔액통' },
      floorMat: { label: '발판매트' },
      tirePuncture: { label: '타이어파스/펑크' },
      engineStart: { label: '시동불가' },
      hood: { label: '본넷' },
      tireWear: { label: '타이어마모' },
      emergencyAction: { label: '긴급 조치 내용' },
      seatRemoval: { label: '시트 탈거' },
      partReplacementCost: { label: '부품교체 금액' },
      airFreshener: { label: '방향제' },
      wiper: { label: '와이퍼' },
      seatFolding: { label: '시트/폴딩' },
      warningLight: { label: '차량 경고등', renderer: 'MultiBadge' },
      exteriorDamage: { label: '외관 파손', renderer: 'MultiBadge' },
      exteriorCheckPart: { label: '외관 점검 부위' },
      exteriorIssueType: { label: '외관 이상 유형' },
      preWashExteriorContamination: { label: '(세차 전) 외관 오염도' },
      tireCondition: { label: '타이어 상태', renderer: 'TireGrid' },
      preWashInteriorContamination: { label: '(세차 전) 내부 오염 위치', renderer: 'MultiBadge' },
      batteryCondition: { label: '배터리 상태', renderer: 'Dropdown' },
      wiperWasher: { label: '와이퍼/워셔액', renderer: 'Dropdown' },
      followUpAction: { label: '후속 조치', renderer: 'Dropdown' },
    };

    const typeKeys = {
      A: ['mileage', 'tireTread', 'windowStatus', 'batteryVoltage', 'safetyTriangle', 'fireExtinguisher', 'washerFluidTank', 'floorMat', 'tirePuncture', 'engineStart', 'hood', 'tireWear', 'emergencyAction', 'seatRemoval', 'partReplacementCost', 'airFreshener', 'wiper', 'seatFolding', 'warningLight', 'exteriorDamage'],
      B: ['mileage', 'tireTread', 'windowStatus', 'batteryVoltage', 'safetyTriangle', 'fireExtinguisher', 'washerFluidTank', 'floorMat', 'tirePuncture', 'engineStart', 'hood', 'tireWear', 'emergencyAction', 'airFreshener', 'wiper', 'seatFolding', 'warningLight', 'exteriorDamage'],
      C: ['mileage', 'tireTread', 'windowStatus', 'batteryVoltage', 'safetyTriangle', 'fireExtinguisher', 'washerFluidTank', 'floorMat', 'tirePuncture', 'engineStart', 'hood', 'tireWear', 'airFreshener', 'wiper', 'seatFolding', 'warningLight', 'exteriorDamage'],
      D: ['exteriorCheckPart', 'exteriorIssueType', 'preWashExteriorContamination', 'tireCondition', 'preWashInteriorContamination', 'batteryCondition', 'wiperWasher', 'followUpAction'],
    };

    const keys = typeKeys[type] || [];
    return keys.map(key => ({ key, ...allItems[key] }));
  };

  const renderInspectionValue = (item, value) => {
    if (value === undefined || value === null) return <span className="text-gray-400">N/A</span>;
    switch (item.renderer) {
      case 'TireGrid':
        return (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div><span className="text-[#6B778C]">FL:</span> {value.frontLeft}</div>
            <div><span className="text-[#6B778C]">FR:</span> {value.frontRight}</div>
            <div><span className="text-[#6B778C]">RL:</span> {value.rearLeft}</div>
            <div><span className="text-[#6B778C]">RR:</span> {value.rearRight}</div>
          </div>
        );
      case 'MultiBadge':
        return (
          <div className="flex flex-wrap gap-1">
            {(Array.isArray(value) ? value : [value]).map((v, i) => <Badge key={i}>{v}</Badge>)}
          </div>
        );
      case 'Dropdown':
        const tone = (value === '이상없음' || value === '완료') ? 'ok' : 'warn';
        return <Badge tone={tone}>{value}</Badge>;
      default:
        return String(value);
    }
  };

  const PhotoGrid = ({ title, photos }) => {
    if (!photos || photos.length === 0) return null;
    return (
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {photos.map((photo, i) => (
              <button key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-[#F4F5F7] border border-[#DFE1E6]" onClick={() => setPreviewImage(photo.url)}>
                <img src={photo.url} alt={photo.name} className="h-full w-full object-cover"/>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Maximize2 className="h-5 w-5 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 text-center">
                  <p className="text-white text-[10px] truncate">{photo.name}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // 핸들러 오더 선택 시 "mission" 탭이면 "info"로 초기화
  useEffect(() => {
    if (selected?.partnerType === '핸들러' && drawerTab === 'mission') {
      setDrawerTab('info');
    }
  }, [selected, drawerTab]);

  const regions1 = useMemo(() => Array.from(new Set(partnerOrders.map((d) => d.region1))), [partnerOrders]);
  const regions2 = useMemo(
    () => Array.from(new Set(partnerOrders.filter((d) => (fRegion1 ? d.region1 === fRegion1 : true)).map((d) => d.region2))),
    [partnerOrders, fRegion1]
  );
  const models = useMemo(() => Array.from(new Set(partnerOrders.map((d) => d.model))).sort(), [partnerOrders]);
  const zones = useMemo(() => Array.from(new Set(partnerOrders.map((d) => d.zone))).sort(), [partnerOrders]);

  // 필터 드롭다운 외부 클릭 닫기
  useEffect(() => {
    if (!filterDropdownOpen) return;
    const handleClick = (e) => {
      if (!e.target.closest('[data-filter-dropdown]')) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [filterDropdownOpen]);

  const MOCK_DELIVERY_INFO = MOCK_DELIVERY_INFO_DATA;
  const MOCK_HANDLER_INFO = MOCK_HANDLER_INFO_DATA;

  const statuses = ["발행", "예약", "수행 중", "완료", "취소"];
  const orderGroups = ORDER_GROUPS;
  const orderTypes = ORDER_TYPES;
  const washTypes = WASH_TYPES;

  const clearSecondaryFilterValue = (key) => {
    switch (key) {
      case 'model': setFModel(""); break;
      case 'zone': setFZone(""); break;
      case 'orderGroup': setFOrderGroup(""); break;
      case 'orderType': setFOrderType(""); break;
      case 'region1': setFRegion1(""); setFRegion2(""); break;
      case 'region2': setFRegion2(""); break;
      case 'cancelType': setFCancelType(""); break;
      case 'delayed': setFDelayed(""); break;
    }
  };

  const renderSecondaryFilter = (filterKey) => {
    switch (filterKey) {
      case 'model':
        return <SearchableSelect value={fModel} onChange={setFModel} options={models} placeholder="차종 검색" />;
      case 'zone':
        return <SearchableSelect value={fZone} onChange={setFZone} options={zones} placeholder="존 이름 검색" />;
      case 'orderGroup':
        return (
          <Select value={fOrderGroup} onChange={e => setFOrderGroup(e.target.value)}>
            <option value="">전체</option>
            {orderGroups.map(v => <option key={v} value={v}>{v}</option>)}
          </Select>
        );
      case 'orderType':
        return (
          <Select value={fOrderType} onChange={e => setFOrderType(e.target.value)}>
            <option value="">전체</option>
            {orderTypes.map(v => <option key={v} value={v}>{v}</option>)}
          </Select>
        );
      case 'region1':
        return (
          <Select value={fRegion1} onChange={e => { setFRegion1(e.target.value); setFRegion2(""); }}>
            <option value="">전체</option>
            {regions1.map(v => <option key={v} value={v}>{v}</option>)}
          </Select>
        );
      case 'region2':
        return (
          <Select value={fRegion2} onChange={e => setFRegion2(e.target.value)} disabled={!fRegion1} className={!fRegion1 ? "bg-[#F4F5F7]! text-[#C1C7CD] cursor-not-allowed" : ""}>
            <option value="">전체</option>
            {regions2.map(v => <option key={v} value={v}>{v}</option>)}
          </Select>
        );
      case 'cancelType':
        return (
          <Select value={fCancelType} onChange={e => setFCancelType(e.target.value)} disabled={fStatus !== "취소"} className={fStatus !== "취소" ? "bg-[#F4F5F7]! text-[#C1C7CD] cursor-not-allowed" : ""}>
            <option value="">전체</option>
            {CANCEL_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
          </Select>
        );
      case 'delayed':
        return (
          <Select value={fDelayed} onChange={e => setFDelayed(e.target.value)} disabled={fStatus !== "완료"} className={fStatus !== "완료" ? "bg-[#F4F5F7]! text-[#C1C7CD] cursor-not-allowed" : ""}>
            <option value="">전체</option>
            <option value="지연">지연</option>
            <option value="정상">정상</option>
          </Select>
        );
      default:
        return null;
    }
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return partnerOrders.filter((d) => {
      const hitQ = !qq || String(d.plate || "").toLowerCase().includes(qq);
      const hitPeriod = (!periodFrom || d.createdAt >= periodFrom) && (!periodTo || d.createdAt <= periodTo);
      const hitWT = !fWashType || d.washType === fWashType;
      const hitS = !fStatus || d.status === fStatus;
      const hitModel = !fModel || d.model === fModel;
      const hitZone = !fZone || d.zone === fZone;
      const hitR1 = !fRegion1 || d.region1 === fRegion1;
      const hitR2 = !fRegion2 || d.region2 === fRegion2;
      const hitOG = !fOrderGroup || d.orderGroup === fOrderGroup;
      const hitOT = !fOrderType || d.orderType === fOrderType;
      const hitCT = !fCancelType || d.cancelType === fCancelType;
      const hitDelay = !fDelayed || (fDelayed === "지연" ? MOCK_LEAD_TIME_DATA[d.orderId]?.isDelayed === true : MOCK_LEAD_TIME_DATA[d.orderId]?.isDelayed === false);

      return hitQ && hitPeriod && hitWT && hitS && hitModel && hitZone && hitR1 && hitR2 && hitOG && hitOT && hitCT && hitDelay;
    });
  }, [partnerOrders, q, periodFrom, periodTo, fWashType, fStatus, fModel, fZone, fRegion1, fRegion2, fOrderGroup, fOrderType, fCancelType, fDelayed]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  const getStatusBadgeTone = (status) => {
    if (status === "완료") return "ok";
    if (status === "취소") return "default";
    if (["발행", "예약"].includes(status)) return "warn";
    if (status === "수행 중") return "info";
    return "default";
  };

  // 파트너 이름, 파트너 유형 컬럼 제외
  const columns = [
    { key: "orderId", header: "오더 ID" },
    { key: "orderGroup", header: "오더 구분" },
    { key: "orderType", header: "발행 유형" },
    {
      key: "washType",
      header: "세차 유형",
      render: (r) => <span className="text-[#172B4D]">{r.washType}</span>,
    },
    { key: "carId", header: "차량 ID" },
    { key: "plate", header: "차량 번호" },
    { key: "model", header: "차종" },
    { key: "region1", header: "지역1" },
    { key: "region2", header: "지역2" },
    { key: "zone", header: "존 이름" },
    {
      key: "status",
      header: "진행 상태",
      render: (r) => <Badge tone={getStatusBadgeTone(r.status)}>{r.status}</Badge>,
    },
    {
      key: "cancelType",
      header: "취소 유형",
      render: (r) => {
        if (r.status !== "취소" || !r.cancelType) return "-";
        return <Badge tone="default">{r.cancelType}</Badge>;
      },
    },
    {
      key: "isDelayed",
      header: "지연 여부",
      render: (r) => {
        if (r.status !== "완료") return "-";
        const info = MOCK_LEAD_TIME_DATA[r.orderId];
        if (!info) return "-";
        return info.isDelayed
          ? <Badge tone="danger">지연</Badge>
          : <Badge tone="ok">정상</Badge>;
      },
    },
    {
      key: "createdAt",
      header: "발행 일시",
      render: (r) => {
        if (!r.createdAt) return "-";
        if (r.createdAt.length > 10) return r.createdAt;
        const lastDigit = parseInt(r.orderId.slice(-1), 10) || 0;
        const hour = (8 + lastDigit) % 24;
        const minute = (lastDigit * 5) % 6 * 10;
        return `${r.createdAt} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      }
    },
  ];

  // 적용 필터 칩 (파트너 관련 제외)
  const appliedChips = (() => {
    const chips = [];
    if (initialFilter) {
      chips.push({ key: 'initialFilter', label: '대시보드 필터', value: [initialFilter.status ? `상태=${initialFilter.status}` : '', initialFilter.orderType ? `유형=${initialFilter.orderType}` : '', initialFilter.cancelType ? `취소=${initialFilter.cancelType}` : '', initialFilter.delayed ? `지연=${initialFilter.delayed}` : ''].filter(Boolean).join(' '), onRemove: () => { setFStatus(""); setFOrderType(""); setFCancelType(""); setFDelayed(""); setActiveSecondaryFilters(prev => { const next = new Set(prev); next.delete('orderType'); next.delete('cancelType'); next.delete('delayed'); return next; }); } });
    }
    if (q) chips.push({ key: 'q', label: '차량 번호', value: q, onRemove: () => setQ("") });
    if (fWashType) chips.push({ key: 'washType', label: '세차 유형', value: fWashType, onRemove: () => setFWashType("") });
    if (fStatus && !initialFilter?.status) chips.push({ key: 'status', label: '진행 상태', value: fStatus, onRemove: () => { setFStatus(""); setFCancelType(""); setFDelayed(""); setActiveSecondaryFilters(prev => { const next = new Set(prev); next.delete('cancelType'); next.delete('delayed'); return next; }); } });
    if (periodFrom || periodTo) chips.push({ key: 'period', label: '발행 일시', value: `${periodFrom || "-"} ~ ${periodTo || "-"}`, onRemove: () => { setPeriodFrom(""); setPeriodTo(""); } });
    if (fModel) chips.push({ key: 'model', label: '차종', value: fModel, onRemove: () => setFModel("") });
    if (fZone) chips.push({ key: 'zone', label: '존 이름', value: fZone, onRemove: () => setFZone("") });
    if (fOrderGroup) chips.push({ key: 'orderGroup', label: '오더 구분', value: fOrderGroup, onRemove: () => setFOrderGroup("") });
    if (fOrderType && !initialFilter?.orderType) chips.push({ key: 'orderType', label: '발행 유형', value: fOrderType, onRemove: () => setFOrderType("") });
    if (fRegion1) chips.push({ key: 'region1', label: '지역1', value: fRegion1, onRemove: () => { setFRegion1(""); setFRegion2(""); } });
    if (fRegion2) chips.push({ key: 'region2', label: '지역2', value: fRegion2, onRemove: () => setFRegion2("") });
    if (fCancelType && !initialFilter?.cancelType) chips.push({ key: 'cancelType', label: '취소 유형', value: fCancelType, onRemove: () => setFCancelType("") });
    if (fDelayed && !initialFilter?.delayed) chips.push({ key: 'delayed', label: '지연 여부', value: fDelayed, onRemove: () => setFDelayed("") });
    return chips;
  })();

  const handleResetAll = () => {
    setQ("");
    setPeriodFrom(() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return toYmd(d); });
    setPeriodTo(toYmd(today));
    setFWashType(""); setFStatus("");
    setFModel(""); setFZone("");
    setFRegion1(""); setFRegion2("");
    setFOrderGroup(""); setFOrderType("");
    setFCancelType(""); setFDelayed("");
    setActiveSecondaryFilters(new Set());
    setShowSecondaryFilters(true);
  };

  const handleClearAllChips = () => {
    setQ("");
    setFWashType(""); setFStatus("");
    setFModel(""); setFZone("");
    setFRegion1(""); setFRegion2("");
    setFOrderGroup(""); setFOrderType("");
    setFCancelType(""); setFDelayed("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">오더 조회</div>
          <div className="mt-1 text-sm text-[#6B778C]">{currentPartner.partnerName}에 배정된 오더를 조회합니다.</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            목록 다운로드
          </Button>
        </div>
      </div>

      {/* 필터 영역 */}
      <Card>
        <CardHeader>
          <CardTitle>조회 조건 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[180px] flex-1 max-w-[220px]">
              <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">차량 번호</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
                <Input value={q} onChange={e => setQ(e.target.value)} placeholder="차량 번호 검색" className="pl-9" />
              </div>
            </div>
            <div className="w-[140px]">
              <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">세차 유형</label>
              <Select value={fWashType} onChange={e => setFWashType(e.target.value)}>
                <option value="">전체</option>
                {washTypes.map(v => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div className="w-[140px]">
              <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">진행 상태</label>
              <Select value={fStatus} onChange={e => {
                const val = e.target.value;
                setFStatus(val);
                if (val === "취소") {
                  setActiveSecondaryFilters(prev => { const next = new Set(prev); next.add('cancelType'); return next; });
                  setShowSecondaryFilters(true);
                } else {
                  setFCancelType("");
                  setActiveSecondaryFilters(prev => { const next = new Set(prev); next.delete('cancelType'); return next; });
                }
                if (val === "완료") {
                  setActiveSecondaryFilters(prev => { const next = new Set(prev); next.add('delayed'); return next; });
                  setShowSecondaryFilters(true);
                } else {
                  setFDelayed("");
                  setActiveSecondaryFilters(prev => { const next = new Set(prev); next.delete('delayed'); return next; });
                }
              }}>
                <option value="">전체</option>
                {statuses.map(v => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <div className="w-[140px]">
                <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">발행 일시</label>
                <Input type="date" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} />
              </div>
              <span className="pb-2 text-sm text-[#6B778C]">~</span>
              <div className="w-[140px]">
                <Input type="date" value={periodTo} onChange={e => setPeriodTo(e.target.value)} />
              </div>
            </div>
            <div className="relative" data-filter-dropdown>
              <Button variant="secondary" onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}>
                <Plus className="mr-1 h-4 w-4" /> 필터 추가
              </Button>
              {filterDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 z-10 w-48 rounded-lg border border-[#DFE1E6] bg-white shadow-lg py-1">
                  {SECONDARY_FILTER_DEFS
                    .filter(f => !activeSecondaryFilters.has(f.key))
                    .map(f => (
                      <button
                        key={f.key}
                        className="w-full text-left px-4 py-2 text-sm text-[#172B4D] hover:bg-[#F4F5F7]"
                        onClick={() => {
                          setActiveSecondaryFilters(prev => new Set([...prev, f.key]));
                          setShowSecondaryFilters(true);
                          setFilterDropdownOpen(false);
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  {SECONDARY_FILTER_DEFS.filter(f => !activeSecondaryFilters.has(f.key)).length === 0 && (
                    <div className="px-4 py-2 text-sm text-[#6B778C]">추가 가능한 필터 없음</div>
                  )}
                </div>
              )}
            </div>
            <Button variant="secondary" onClick={handleResetAll} title="설정 초기화">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* 상세 필터 영역 */}
          {activeSecondaryFilters.size > 0 && (
            <div className="space-y-3">
              <button
                className="flex items-center gap-1 text-sm font-medium text-[#6B778C] hover:text-[#172B4D] transition-colors"
                onClick={() => setShowSecondaryFilters(!showSecondaryFilters)}
              >
                <ChevronDown className={cn("h-4 w-4 transition-transform", !showSecondaryFilters && "-rotate-90")} />
                상세 필터 ({activeSecondaryFilters.size})
              </button>
              {showSecondaryFilters && (
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-12">
                  {[...activeSecondaryFilters].map(filterKey => {
                    const def = SECONDARY_FILTER_DEFS.find(f => f.key === filterKey);
                    if (!def) return null;
                    return (
                      <div key={filterKey} className="md:col-span-2 relative group">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-[#6B778C]">{def.label}</label>
                          <button
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#DFE1E6] transition-opacity"
                            onClick={() => {
                              setActiveSecondaryFilters(prev => { const next = new Set(prev); next.delete(filterKey); return next; });
                              clearSecondaryFilterValue(filterKey);
                            }}
                            title="필터 제거"
                          >
                            <X className="h-3 w-3 text-[#6B778C]" />
                          </button>
                        </div>
                        {renderSecondaryFilter(filterKey)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 적용 필터 칩 */}
          {appliedChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-[#DFE1E6] pt-3">
              {appliedChips.map(chip => (
                <Chip key={chip.key} onRemove={chip.onRemove}>{chip.label}: {chip.value}</Chip>
              ))}
              {appliedChips.length >= 2 && (
                <button className="text-xs text-[#6B778C] hover:text-[#172B4D] underline ml-1" onClick={handleClearAllChips}>
                  전체 해제
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center mb-2">
        <div className="text-sm text-[#6B778C]">
          {filtered.length !== partnerOrders.length ? `필터된 결과 ${filtered.length.toLocaleString()}건 / ` : ''}
          전체 <b className="text-[#172B4D]">{partnerOrders.length.toLocaleString()}</b>건
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={currentData}
        rowKey={(r) => r.orderId}
        onRowClick={(r) => setSelected(r)}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
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

      {/* 오더 상세 Drawer (읽기 전용 — 수행 완료/취소 버튼 없음) */}
      <Drawer
        open={!!selected}
        title={selected ? `오더 상세 - ${selected.orderId}` : "오더 상세"}
        onClose={() => { setSelected(null); setDrawerTab("info"); }}
        footer={
          <Button variant="secondary" onClick={() => setSelected(null)} className="w-full sm:w-auto">닫기</Button>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <Tabs value={drawerTab}>
            <TabsList>
              <TabsTrigger value="info" currentValue={drawerTab} onClick={setDrawerTab}>상세정보</TabsTrigger>
              <TabsTrigger value="history" currentValue={drawerTab} onClick={setDrawerTab}>사진 및 점검</TabsTrigger>
              {selected?.partnerType !== '핸들러' && (
                <TabsTrigger value="mission" currentValue={drawerTab} onClick={setDrawerTab}>미션 및 분실물</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="info" currentValue={drawerTab} className="space-y-4 pt-4">
              {/* 기본 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>오더 및 차량 주요 정보</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm text-[#172B4D]">
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="font-bold text-[#0052CC]">{selected.orderId}</span>
                    <Badge tone={selected.orderGroup === "긴급" ? "danger" : "default"}>
                      {selected.orderGroup}
                    </Badge>
                    <Badge tone="info">{selected.inspectionType}유형</Badge>
                  </div>

                  <div className="col-span-2 border-t border-[#DFE1E6] my-1"></div>

                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">차량 ID</div>
                    <div className="font-medium">{selected.carId}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">차량 번호 / 차종</div>
                    <div className="font-medium">{selected.plate} ({selected.model})</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">존 이름</div>
                    <div className="font-medium">{selected.zone}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">지역</div>
                    <div className="font-medium">{selected.region1} / {selected.region2}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">발행 유형</div>
                    <div>{selected.orderType}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">세차 유형</div>
                    <div className="font-medium">{selected.washType}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">수행원</div>
                    <div>{selected.partnerType === '핸들러' ? '-' : selected.worker}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">진행 상태</div>
                    <Badge tone={getStatusBadgeTone(selected.status)}>{selected.status}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">취소 유형</div>
                    <div>{selected.status === "취소" && selected.cancelType ? <Badge tone="default">{selected.cancelType}</Badge> : <span className="text-[#94A3B8]">-</span>}</div>
                  </div>
                  <div className="col-span-2 border-t border-[#DFE1E6] my-1"></div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">발행 일시</div>
                    <div className="font-medium">{formatCreatedAt(selected)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">수행 일시</div>
                    <div className="font-medium">{(['수행 중', '완료'].includes(selected.status) && selected.completedAt) ? selected.completedAt : "-"}</div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="text-xs text-[#6B778C]">메모</div>
                    <div className="bg-[#F4F5F7] p-2 rounded-lg text-xs">{selected.comment}</div>
                  </div>
                </CardContent>
              </Card>

              {/* 오더 체인 & 리드타임 (완료 오더만) */}
              {selected.status === '완료' && (() => {
                const lt = MOCK_LEAD_TIME_DATA[selected.orderId];
                if (!lt) return null;
                const hasChain = lt.referenceChain.length > 0;
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle>오더 체인 & 리드타임</CardTitle>
                      <CardDescription>
                        {hasChain
                          ? `${lt.referenceChain.length}회 취소 → 재발행 후 완료`
                          : '최초 발행 → 직접 완료'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {hasChain ? (
                        <div className="relative space-y-0 pl-2 mb-4">
                          <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-[#DFE1E6]" />
                          {lt.referenceChain.map((ref, idx) => {
                            const durH = ref.canceledAt && ref.issuedAt
                              ? Math.round((new Date(ref.canceledAt.replace(' ', 'T') + ':00+09:00') - new Date(ref.issuedAt.replace(' ', 'T') + ':00+09:00')) / 3600000)
                              : null;
                            return (
                              <div key={idx} className="relative pb-4">
                                <div className="flex items-start gap-3">
                                  <div className={cn("z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-4 ring-white", ref.responsibility === "면책" ? "bg-blue-400" : "bg-rose-400")}>
                                    <span className="text-[8px] font-bold text-white">{idx + 1}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs font-semibold text-[#172B4D]">{ref.orderId}</span>
                                      <Badge tone={ref.responsibility === "면책" ? "info" : "danger"}>{ref.cancelType}</Badge>
                                      <span className={cn("text-[10px] font-semibold", ref.responsibility === "면책" ? "text-blue-600" : "text-rose-600")}>{ref.responsibility}</span>
                                    </div>
                                    <div className="mt-1 text-[10px] text-[#6B778C] space-y-0.5">
                                      <div>발행: {ref.issuedAt || '-'}</div>
                                      <div>취소: {ref.canceledAt || '-'}{durH !== null ? ` (${durH}h)` : ''}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div className="relative">
                            <div className="flex items-start gap-3">
                              <div className="z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-4 ring-white bg-[#36B37E]">
                                <span className="text-[9px] font-bold text-white">✓</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-semibold text-[#172B4D]">{selected.orderId}</span>
                                  <Badge tone="ok">완료</Badge>
                                  <span className="text-[10px] text-[#6B778C]">현재 오더</span>
                                </div>
                                <div className="mt-1 text-[10px] text-[#6B778C] space-y-0.5">
                                  <div>재발행: {lt.referenceChain[lt.referenceChain.length - 1]?.reissuedAt || selected.createdAt}</div>
                                  <div>완료: {selected.completedAt || '-'}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 mb-4 pl-2">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#36B37E]">
                            <span className="text-[9px] font-bold text-white">✓</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-[#172B4D]">{selected.orderId}</span>
                              <Badge tone="ok">완료</Badge>
                            </div>
                            <div className="mt-1 text-[10px] text-[#6B778C]">직접 완료 (참조 오더 없음)</div>
                          </div>
                        </div>
                      )}
                      <div className={cn("rounded-lg p-3 text-xs", lt.isDelayed ? "bg-rose-50 border border-rose-200" : "bg-[#F4F5F7] border border-[#DFE1E6]")}>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          <div>
                            <span className="text-[#6B778C]">리드타임</span>
                            <div className="font-semibold text-[#172B4D]">{formatLeadTimeHours(lt.leadTimeHours)}</div>
                          </div>
                          <div>
                            <span className="text-[#6B778C]">면책 시간</span>
                            <div className="font-semibold text-blue-600">{lt.exemptionHours > 0 ? formatLeadTimeHours(lt.exemptionHours) : '-'}</div>
                          </div>
                          <div>
                            <span className="text-[#6B778C]">귀책 소요시간</span>
                            <div className="font-semibold text-[#172B4D]">{formatLeadTimeHours(lt.accountabilityHours)}</div>
                          </div>
                          <div>
                            <span className="text-[#6B778C]">판정</span>
                            <div><Badge tone={lt.isDelayed ? "danger" : "ok"}>{lt.isDelayed ? "지연 (72h 초과)" : "정상"}</Badge></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* 탁송 정보 (입고 파트너 전용) */}
              {selected.partnerType === '입고' && MOCK_DELIVERY_INFO[selected.orderId] && (
                <Card>
                  <CardHeader>
                    <CardTitle>탁송 정보</CardTitle>
                    <CardDescription>입고/출고 차량 이동 상태</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="text-[#6B778C]">입고 예약 ID</div>
                        <div className="font-medium text-[#172B4D]">{MOCK_DELIVERY_INFO[selected.orderId].pickupReservationId}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[#6B778C]">입고 탁송 상태</div>
                        <div>
                          <Badge tone={MOCK_DELIVERY_INFO[selected.orderId].pickupStatus === "END" ? "ok" : "info"}>
                            {DELIVERY_STATUS_MAP[MOCK_DELIVERY_INFO[selected.orderId].pickupStatus]}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[#6B778C]">출고 예약 ID</div>
                        <div className="font-medium text-[#172B4D]">
                          {selected.status === '완료' && MOCK_DELIVERY_INFO[selected.orderId].deliveryReservationId
                            ? MOCK_DELIVERY_INFO[selected.orderId].deliveryReservationId
                            : '-'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[#6B778C]">출고 탁송 상태</div>
                        <div>
                          {selected.status === '완료' && MOCK_DELIVERY_INFO[selected.orderId].deliveryStatus ? (
                            <Badge tone={MOCK_DELIVERY_INFO[selected.orderId].deliveryStatus === "END" ? "ok" : "warn"}>
                              {DELIVERY_STATUS_MAP[MOCK_DELIVERY_INFO[selected.orderId].deliveryStatus]}
                            </Badge>
                          ) : (
                            <span className="text-[#6B778C]">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 미션핸들 예약 정보 (핸들러 파트너 전용) */}
              {selected.partnerType === '핸들러' && MOCK_HANDLER_INFO[selected.orderId] && (
                <Card>
                  <CardHeader>
                    <CardTitle>미션핸들 예약 정보</CardTitle>
                    <CardDescription>기계세차 예약 상태</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="text-[#6B778C]">미션핸들 예약 ID</div>
                        <div className="font-medium text-[#172B4D]">{MOCK_HANDLER_INFO[selected.orderId].reservationId}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[#6B778C]">예약 상태</div>
                        <div>
                          <Badge tone={MOCK_HANDLER_INFO[selected.orderId].status === "COMPLETED" ? "ok" : "info"}>
                            {HANDLER_STATUS_MAP[MOCK_HANDLER_INFO[selected.orderId].status]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 금액 및 연계 정보 (핸들러 파트너는 금액 정보 없음) */}
              {selected.partnerType !== '핸들러' && (
                <Card>
                  <CardHeader>
                    <CardTitle>금액 및 연계 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B778C]">최종 청구 금액</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[#172B4D]">25,000원</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          청구 내역 <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {selected.partnerType === '입고' && (
                      <div className="flex items-center justify-between border-t border-[#DFE1E6] pt-3">
                        <span className="text-sm text-[#6B778C]">연계 오더 (Parent)</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-[#0052CC]">
                          O-89999 <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" currentValue={drawerTab} className="space-y-4 pt-4">
              {/* 핸들러 파트너 전용 사진 및 점검 */}
              {selected.partnerType === '핸들러' ? (
                <>
                  <Card>
                    <CardHeader><CardTitle>진행 이력</CardTitle></CardHeader>
                    <CardContent>
                      <div className="relative space-y-4 pl-2 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-[#DFE1E6]">
                        {[
                          { label: "발행", time: selected.issuedAt },
                          { label: "예약", time: selected.reservedAt },
                          { label: "수행 중", time: selected.startedAt },
                          { label: "완료", time: selected.completedAt }
                        ].map((item, idx) => (
                          <div key={idx} className="relative flex items-start gap-3">
                            <div className={cn("z-10 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ring-4 ring-white", selected.status === item.label ? "bg-[#0052CC]" : item.time ? "bg-[#36B37E]" : "bg-[#DFE1E6]")} />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-[#172B4D]">{item.label}</span>
                              <span className="text-[10px] text-[#6B778C]">{item.time || '-'}</span>
                            </div>
                          </div>
                        ))}
                        {selected.status === '취소' && (
                          <div className="relative flex items-start gap-3">
                            <div className="z-10 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ring-4 ring-white bg-[#DE350B]" />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-[#172B4D]">취소</span>
                              <span className="text-[10px] text-[#6B778C]">{selected.canceledAt || '-'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>세차 전 사진</CardTitle><CardDescription>핸들러 서비스 응답 이미지 (1~5장)</CardDescription></CardHeader>
                    <CardContent>
                      {selected.handlerPreWashPhotos && selected.handlerPreWashPhotos.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selected.handlerPreWashPhotos.map((photo, i) => (
                            <button key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg bg-[#F4F5F7] border border-[#DFE1E6]" onClick={() => setPreviewImage(photo.url)}>
                              <img src={photo.url} alt={`세차 전 ${i + 1}`} className="h-full w-full object-cover"/>
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                <Maximize2 className="h-4 w-4 text-white" />
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-[#6B778C]">사진 없음</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>세차 후 사진</CardTitle><CardDescription>핸들러 서비스 응답 이미지 (7~10장)</CardDescription></CardHeader>
                    <CardContent>
                      {selected.handlerPostWashPhotos && selected.handlerPostWashPhotos.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selected.handlerPostWashPhotos.map((photo, i) => (
                            <button key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg bg-[#F4F5F7] border border-[#DFE1E6]" onClick={() => setPreviewImage(photo.url)}>
                              <img src={photo.url} alt={`세차 후 ${i + 1}`} className="h-full w-full object-cover"/>
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                <Maximize2 className="h-4 w-4 text-white" />
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-[#6B778C]">사진 없음</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>세차 후기</CardTitle><CardDescription>핸들러 서비스 응답 텍스트 (1~100자)</CardDescription></CardHeader>
                    <CardContent>
                      <div className="bg-[#F4F5F7] p-3 rounded-lg text-sm text-[#172B4D]">
                        {selected.handlerReview || <span className="text-[#6B778C]">후기 없음</span>}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {/* 일반 파트너 (현장/입고) 사진 및 점검 */}
                  <Card>
                    <CardHeader><CardTitle>진행 이력</CardTitle></CardHeader>
                    <CardContent>
                      <div className="relative space-y-4 pl-2 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-[#DFE1E6]">
                        {[
                          { time: "2026-01-12 10:00", label: "발행" },
                          { time: "2026-01-12 10:10", label: "예약" },
                          { time: "2026-01-12 11:00", label: "수행 중" },
                          { time: "2026-01-12 11:45", label: "완료" }
                        ].map((item, idx) => (
                          <div key={idx} className="relative flex items-start gap-3">
                            <div className={cn("z-10 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ring-4 ring-white", selected.status === item.label ? "bg-[#0052CC]" : "bg-[#DFE1E6]")} />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-[#172B4D]">{item.label}</span>
                              <span className="text-[10px] text-[#6B778C]">{item.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <PhotoGrid title="세차 전 사진" photos={selected.preWashPhotos} />
                  <PhotoGrid title="세차 후 사진" photos={selected.postWashPhotos} />

                  <Card>
                    <CardHeader><CardTitle>점검 리스트</CardTitle></CardHeader>
                    <CardContent className="divide-y divide-[#E2E8F0] -mt-2">
                      {getInspectionItemsByType(selected.inspectionType).map((item) => {
                        const result = selected.inspectionResults?.[item.key];
                        if (!result) return null;

                        return (
                          <div key={item.key} className="grid grid-cols-3 gap-4 py-3 text-sm">
                            <div className="font-semibold text-[#6B778C] col-span-1">{item.label}</div>
                            <div className="col-span-2 space-y-2">
                              <div className="flex items-center gap-2 text-[#172B4D]">
                                {renderInspectionValue(item, result.value)}
                                {result.status === '이상' && <Badge tone="danger">이상</Badge>}
                              </div>
                              {result.photoUrls && result.photoUrls.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {result.photoUrls.map((photo, i) => (
                                    <button key={i} className="group relative h-16 w-16 overflow-hidden rounded-lg bg-[#F4F5F7] border border-[#DFE1E6]" onClick={() => setPreviewImage(photo.url)}>
                                      <img src={photo.url} alt={photo.name} className="h-full w-full object-cover"/>
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Maximize2 className="h-4 w-4 text-white" />
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  <PhotoGrid title="기타 사진" photos={selected.additionalPhotos} />
                </>
              )}
            </TabsContent>

            <TabsContent value="mission" currentValue={drawerTab} className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" /> 미션
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selected.attachedMissions && selected.attachedMissions.length > 0 ? (
                    <div className="space-y-2">
                      {selected.attachedMissions.map(m => (
                        <div key={m.id} className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 p-3">
                          <span className="text-sm font-medium text-amber-900">{m.content}</span>
                          <Badge tone={m.status === 'completed' ? 'ok' : 'warn'}>{m.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-[#6B778C]">등록된 미션이 없습니다.</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PackageSearch className="h-4 w-4" /> 분실물
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {MOCK_LOST_ITEMS[selected.orderId] && MOCK_LOST_ITEMS[selected.orderId].length > 0 ? (
                    <div className="space-y-3">
                      {MOCK_LOST_ITEMS[selected.orderId].map((item) => (
                        <div key={item.id} className="rounded-lg border border-[#DFE1E6] p-3">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-bold text-[#0052CC]">{item.id}</span>
                            <Badge tone={item.status === "발송 완료" ? "ok" : item.status === "배송지 미입력" ? "warn" : item.status === "발송 대기" ? "info" : "default"}>
                              {item.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[#6B778C]">접수일시: </span>
                              <span className="text-[#172B4D]">{item.createdAt}</span>
                            </div>
                            <div>
                              <span className="text-[#6B778C]">분실물 구분: </span>
                              <span className="text-[#172B4D]">{item.itemCategory}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[#6B778C]">상세 정보: </span>
                              <span className="text-[#172B4D]">{item.itemDetails}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-sm text-[#6B778C] py-4">
                      연결된 분실물이 없습니다.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </div>
        ) : null}
      </Drawer>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-h-full max-w-full overflow-hidden rounded-lg bg-white">
            <button className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70" onClick={() => setPreviewImage(null)}>
              <X className="h-5 w-5" />
            </button>
            <img src={previewImage} alt="Preview" className="max-h-[80vh] w-auto object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

export default PartnerOrdersPage;
