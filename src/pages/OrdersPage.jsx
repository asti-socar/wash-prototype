import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  X,
  Download,
  Trash2,
  Plus,
  CheckCircle,
  Image as ImageIcon,
  ExternalLink,
  Maximize2,
  Check,
  ClipboardList,
  PackageSearch,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  cn,
  toYmd,
  useIsMobile,
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
  FilterPanel,
  Drawer,
  usePagination,
  Pagination,
  DataTable,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui";

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

const MOCK_VEHICLES = [
  { plate: "12가3456", zoneName: "강남역 1번존", zoneId: "Z-1001", region1: "서울", region2: "강남", partner: "A파트너", activeOrderId: "O-90001", activeOrderStatus: "예약", lastWash: "2026-01-10", model: "아반떼 AD", isRechargeGuaranteed: false },
  { plate: "34나7890", zoneName: "잠실역 2번존", zoneId: "Z-1002", region1: "서울", region2: "송파", partner: "B파트너", activeOrderId: null, activeOrderStatus: null, lastWash: "2026-01-08", model: "K5", isRechargeGuaranteed: false },
  { plate: "56다1122", zoneName: "홍대입구 3번존", zoneId: "Z-1003", region1: "서울", region2: "마포", partner: "A파트너", activeOrderId: "O-90003", activeOrderStatus: "발행", lastWash: "2026-01-05", model: "쏘나타", isRechargeGuaranteed: false },
  { plate: "78라3344", zoneName: "판교 1번존", zoneId: "Z-2001", region1: "경기", region2: "성남", partner: "C파트너", activeOrderId: "O-90004", activeOrderStatus: "수행 중", lastWash: "2026-01-09", model: "아이오닉5", isRechargeGuaranteed: true },
  { plate: "90마5566", zoneName: "수원역 2번존", zoneId: "Z-2002", region1: "경기", region2: "수원", partner: "B파트너", activeOrderId: null, activeOrderStatus: null, lastWash: "2026-01-07", model: "스포티지", isRechargeGuaranteed: false },
  { plate: "11바7788", zoneName: "부산역 1번존", zoneId: "Z-3001", region1: "부산", region2: "동구", partner: "D파트너", activeOrderId: "O-90006", activeOrderStatus: "발행", lastWash: "2026-01-03", model: "그랜저", isRechargeGuaranteed: false },
  { plate: "22사9900", zoneName: "해운대 2번존", zoneId: "Z-3002", region1: "부산", region2: "해운대", partner: "D파트너", activeOrderId: "O-90007", activeOrderStatus: "예약", lastWash: "2026-01-11", model: "레이", isRechargeGuaranteed: false },
  { plate: "33아1212", zoneName: "대전역 1번존", zoneId: "Z-4001", region1: "대전", region2: "동구", partner: "C파트너", activeOrderId: null, activeOrderStatus: null, lastWash: "2026-01-06", model: "카니발", isRechargeGuaranteed: false },
  { plate: "44자3434", zoneName: "청주 2번존", zoneId: "Z-5002", region1: "충북", region2: "청주", partner: "B파트너", activeOrderId: "O-90009", activeOrderStatus: "발행", lastWash: "2026-01-02", model: "모닝", isRechargeGuaranteed: false },
  { plate: "55차5656", zoneName: "광주 1번존", zoneId: "Z-6001", region1: "광주", region2: "서구", partner: "A파트너", activeOrderId: "O-90010", activeOrderStatus: "예약", lastWash: "2026-01-09", model: "EV6", isRechargeGuaranteed: false },
  { plate: "66카7878", zoneName: "인천공항 1번존", zoneId: "Z-7001", region1: "인천", region2: "중구", partner: "C파트너", activeOrderId: null, activeOrderStatus: null, lastWash: "2026-01-08", model: "티볼리", isRechargeGuaranteed: false },
  { plate: "77타9090", zoneName: "제주공항 1번존", zoneId: "Z-8001", region1: "제주", region2: "제주시", partner: "D파트너", activeOrderId: "O-90012", activeOrderStatus: "발행", lastWash: "2026-01-01", model: "셀토스", isRechargeGuaranteed: false },
];

// 분실물 Mock 데이터 (오더 ID별) - 전체 오더의 50%에 분실물 할당
const generateMockLostItems = () => {
  const items = {};
  const categories = ["전자기기", "지갑", "의류", "일반", "귀중품"];
  const statuses = ["접수", "보관중", "발송 완료"];
  const details = [
    "검은색 스마트폰", "갈색 가죽 지갑", "회색 후드티", "검정 선글라스", "에어팟",
    "블루투스 이어폰", "손목시계", "우산", "노트북", "충전기"
  ];

  // 짝수 번호 오더에 분실물 할당 (전체의 50%)
  for (let i = 2; i <= 100; i += 2) {
    const orderId = `O-900${String(i).padStart(2, '0')}`;
    const itemCount = Math.random() > 0.7 ? 2 : 1; // 30% 확률로 2개, 70% 확률로 1개
    items[orderId] = [];

    for (let j = 0; j < itemCount; j++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const detail = details[Math.floor(Math.random() * details.length)];
      const date = new Date(2026, 0, Math.floor(Math.random() * 28) + 1);

      items[orderId].push({
        id: `LI${String(i * 10 + j).padStart(4, '0')}`,
        createdAt: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        itemCategory: category,
        status: status,
        itemDetails: detail
      });
    }
  }

  return items;
};

const MOCK_LOST_ITEMS = generateMockLostItems();

// 탁송 상태 매핑
const DELIVERY_STATUS_MAP = {
  WAITING: "매칭 전",
  ASSIGN: "매칭 완료",
  RUN: "운행 중",
  END: "운행 종료",
  FORCE_END: "강제 반납",
  CANCEL: "예약 취소",
  ETC: "알 수 없음"
};

// 핸들러 예약 상태 매핑
const HANDLER_STATUS_MAP = {
  CONFIRMED: "예약 완료",
  IN_PROGRESS: "수행 중",
  COMPLETED: "완료"
};

// 핸들러 파트너 예약 Mock 데이터 생성 함수
const generateMockHandlerInfo = (orders) => {
  const handlerInfo = {};

  // 핸들러 파트너 오더만 필터링
  const handlerOrders = orders.filter(order => order.partnerType === '핸들러');

  handlerOrders.forEach((order, index) => {
    const reservationIdNum = 1001 + index;

    // 오더 상태에 따른 핸들러 예약 상태 매핑
    let handlerStatus;
    switch(order.status) {
      case '예약':
        handlerStatus = 'CONFIRMED';
        break;
      case '수행 중':
        handlerStatus = 'IN_PROGRESS';
        break;
      case '완료':
        handlerStatus = 'COMPLETED';
        break;
      default:
        handlerStatus = 'CONFIRMED';
    }

    handlerInfo[order.orderId] = {
      reservationId: `MH-${reservationIdNum}`,
      status: handlerStatus
    };
  });

  return handlerInfo;
};

// 입고 파트너 탁송 Mock 데이터 생성 함수
const generateMockDeliveryInfo = (orders) => {
  const deliveryInfo = {};

  // 입고 파트너 오더만 필터링
  const pickupOrders = orders.filter(order => order.partnerType === '입고');

  pickupOrders.forEach((order, index) => {
    const reservationIdNum = 2001 + index;

    // 상태에 따른 입고 탁송 상태 매핑
    let pickupStatus;
    switch(order.status) {
      case '발행':
        pickupStatus = 'WAITING';
        break;
      case '예약':
        // 예약: ASSIGN 또는 RUN (50:50 분배)
        pickupStatus = Math.random() > 0.5 ? 'ASSIGN' : 'RUN';
        break;
      case '수행 중':
        pickupStatus = 'END';
        break;
      case '완료':
        pickupStatus = 'END';
        break;
      case '취소':
        // 취소: CANCEL 또는 END (50:50 분배)
        pickupStatus = Math.random() > 0.5 ? 'CANCEL' : 'END';
        break;
      default:
        pickupStatus = 'ETC';
    }

    deliveryInfo[order.orderId] = {
      pickupReservationId: `DR-${reservationIdNum}`,
      pickupStatus: pickupStatus
    };

    // 완료 상태인 경우에만 출고 정보 추가
    if (order.status === '완료') {
      deliveryInfo[order.orderId].deliveryReservationId = `DR-${reservationIdNum + 50}`;
      deliveryInfo[order.orderId].deliveryStatus = 'END';
    }
  });

  return deliveryInfo;
};

const CANCEL_TYPES = ["변경취소", "미예약취소", "노쇼취소", "수행원취소", "우천취소"];

function OrdersPage({ quickFilter, onClearQuickFilter, initialOrderId, orders, setOrders, missions, setMissions }) {
  const today = new Date();

  const [q, setQ] = useState("");
  const [searchField, setSearchField] = useState("plate");
  const [sortConfig, setSortConfig] = useState({ key: 'orderId', direction: 'desc' });
  const [periodFrom, setPeriodFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return toYmd(d);
  });
  const [periodTo, setPeriodTo] = useState(toYmd(today));
  const [fRegion1, setFRegion1] = useState("");
  const [fRegion2, setFRegion2] = useState("");
  const [fOrderGroup, setFOrderGroup] = useState("");
  const [fOrderType, setFOrderType] = useState("");
  const [fWashType, setFWashType] = useState("");
  const [fPartner, setFPartner] = useState("");
  const [fPartnerType, setFPartnerType] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fCancelType, setFCancelType] = useState("");

  // quickFilter로부터 초기값 설정
  useEffect(() => {
    if (quickFilter) {
      if (quickFilter.status) setFStatus(quickFilter.status);
      if (quickFilter.orderType) setFOrderType(quickFilter.orderType);
      if (quickFilter.cancelType) setFCancelType(quickFilter.cancelType);
    }
  }, [quickFilter]);

  const [selected, setSelected] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [drawerTab, setDrawerTab] = useState("info");
  const [previewImage, setPreviewImage] = useState(null);
  
  // 신규 기능용 상태
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // 오더 발행 폼 상태
  const [newOrderForm, setNewOrderForm] = useState({ plate: "", orderGroup: "수시", orderType: "수시세차", washType: "외부" });

  const [foundVehicle, setFoundVehicle] = useState(null);

  const formatCreatedAt = (order) => {
    if (!order.createdAt) return "-";
    if (order.createdAt.length > 10) return order.createdAt; // Already has time
    const lastDigit = parseInt(order.orderId.slice(-1), 10) || 0;
    const hour = (8 + lastDigit) % 24;
    const minute = (lastDigit * 5) % 6 * 10;
    return `${order.createdAt} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  /**
   * 세차 유형에 따라 표시할 사진 목록을 반환하는 헬퍼 함수.
   * @param {object} order - 현재 선택된 오더 객체.
   * @returns {{pre: array, post: array}} - 세차 전/후 사진 목록.
   */
  const getPhotosByWashType = (order) => {
    if (!order) return { pre: [], post: [] };
    // D유형(라이트)은 세차 전 사진을 표시하지 않음.
    const pre = order.inspectionType === 'D' ? [] : order.preWashPhotos || [];
    const post = order.postWashPhotos || [];
    return { pre, post };
  };

  /**
   * 점검 유형(inspectionType)에 따라 표시할 점검 항목 목록과 레이블을 반환하는 헬퍼 함수.
   * @param {string} type - 점검 유형 (A, B, C, D).
   * @returns {Array<object>} - 점검 항목의 키, 레이블, 커스텀 렌더러 등이 포함된 객체 배열.
   */
  const getInspectionItemsByType = (type) => {
    // 모든 유형에 대한 점검 항목 정의
    const allItems = {
      // 5.1 공통 점검 항목
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
      
      // 5.2 A유형
      emergencyAction: { label: '긴급 조치 내용' },
      seatRemoval: { label: '시트 탈거' },
      partReplacementCost: { label: '부품교체 금액' },
      airFreshener: { label: '방향제' },
      wiper: { label: '와이퍼' },
      seatFolding: { label: '시트/폴딩' },
      warningLight: { label: '차량 경고등', renderer: 'MultiBadge' },
      exteriorDamage: { label: '외관 파손', renderer: 'MultiBadge' },
      
      // 5.5 D유형
      exteriorCheckPart: { label: '외관 점검 부위' },
      exteriorIssueType: { label: '외관 이상 유형' },
      preWashExteriorContamination: { label: '(세차 전) 외관 오염도' },
      tireCondition: { label: '타이어 상태', renderer: 'TireGrid' },
      preWashInteriorContamination: { label: '(세차 전) 내부 오염 위치', renderer: 'MultiBadge' },
      batteryCondition: { label: '배터리 상태', renderer: 'Dropdown' },
      wiperWasher: { label: '와이퍼/워셔액', renderer: 'Dropdown' },
      followUpAction: { label: '후속 조치', renderer: 'Dropdown' },
    };

    // 각 점검 유형별로 표시할 항목 키 목록 정의
    const typeKeys = {
      A: ['mileage', 'tireTread', 'windowStatus', 'batteryVoltage', 'safetyTriangle', 'fireExtinguisher', 'washerFluidTank', 'floorMat', 'tirePuncture', 'engineStart', 'hood', 'tireWear', 'emergencyAction', 'seatRemoval', 'partReplacementCost', 'airFreshener', 'wiper', 'seatFolding', 'warningLight', 'exteriorDamage'],
      B: ['mileage', 'tireTread', 'windowStatus', 'batteryVoltage', 'safetyTriangle', 'fireExtinguisher', 'washerFluidTank', 'floorMat', 'tirePuncture', 'engineStart', 'hood', 'tireWear', 'emergencyAction', 'airFreshener', 'wiper', 'seatFolding', 'warningLight', 'exteriorDamage'],
      C: ['mileage', 'tireTread', 'windowStatus', 'batteryVoltage', 'safetyTriangle', 'fireExtinguisher', 'washerFluidTank', 'floorMat', 'tirePuncture', 'engineStart', 'hood', 'tireWear', 'airFreshener', 'wiper', 'seatFolding', 'warningLight', 'exteriorDamage'],
      D: ['exteriorCheckPart', 'exteriorIssueType', 'preWashExteriorContamination', 'tireCondition', 'preWashInteriorContamination', 'batteryCondition', 'wiperWasher', 'followUpAction'],
    };

    const keys = typeKeys[type] || [];
    // 키 목록을 기반으로 전체 항목 정의에서 해당 항목들을 찾아 반환
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


  useEffect(() => {
    if (newOrderForm.plate.trim()) {
      const vehicle = MOCK_VEHICLES.find(v => v.plate === newOrderForm.plate.trim());
      setFoundVehicle(vehicle || null);
    } else {
      setFoundVehicle(null);
    }
  }, [newOrderForm.plate]);

  useEffect(() => {
    if (initialOrderId) {
      const target = orders.find((o) => o.orderId === initialOrderId);
      if (target) {
        setSelected(target);
      }
    }
  }, [initialOrderId, orders]);

  // 핸들러 오더 선택 시 "mission" 탭이면 "info"로 초기화 (미션/분실물 탭이 없으므로)
  useEffect(() => {
    if (selected?.partnerType === '핸들러' && drawerTab === 'mission') {
      setDrawerTab('info');
    }
  }, [selected, drawerTab]);

  const regions1 = useMemo(() => Array.from(new Set(orders.map((d) => d.region1))), [orders]);
  const regions2 = useMemo(
    () => Array.from(new Set(orders.filter((d) => (fRegion1 ? d.region1 === fRegion1 : true)).map((d) => d.region2))),
    [orders, fRegion1]
  );
  const partners = useMemo(() => Array.from(new Set(orders.map((d) => d.partner))), [orders]);

  // 입고 파트너 탁송 정보 동적 생성
  const MOCK_DELIVERY_INFO = useMemo(() => generateMockDeliveryInfo(orders), [orders]);

  // 핸들러 파트너 예약 정보 동적 생성
  const MOCK_HANDLER_INFO = useMemo(() => generateMockHandlerInfo(orders), [orders]);

  const statuses = ["발행", "예약", "수행 중", "완료", "취소"];
  const orderGroups = ORDER_GROUPS;
  const orderTypes = ORDER_TYPES;
  const washTypes = WASH_TYPES;

  // 오더 발행 핸들러
  const handleCreateOrder = () => {
    if (!foundVehicle) {
      alert("등록되지 않은 차량 번호입니다. 차량 관리에서 먼저 확인해주세요.");
      return;
    }

    const pendingMissions = missions.filter(m => m.plate === foundVehicle.plate && m.status === "pending");

    const newOrder = {
      orderId: `O-${Date.now()}`,
      washType: newOrderForm.washType,
      orderGroup: newOrderForm.orderGroup,
      orderType: newOrderForm.orderType,
      carId: `C-${Math.floor(Math.random() * 10000)}`,
      model: foundVehicle.model,
      plate: foundVehicle.plate,
      zone: foundVehicle.zoneName,
      zoneId: foundVehicle.zoneId,
      region1: foundVehicle.region1,
      region2: foundVehicle.region2,
      partner: foundVehicle.partner,
      partnerType: "현장", // 기본값
      status: "예약",
      elapsedDays: 0,
      worker: "-",
      comment: "수동 발행 오더",
      createdAt: toYmd(new Date()),
      attachedMissions: pendingMissions, // 미션 스냅샷 포함
    };

    setOrders([newOrder, ...orders]);
    
    // 미션 상태 업데이트 (오더 연결)
    if (pendingMissions.length > 0) {
      const missionIds = pendingMissions.map(m => m.id);
      setMissions(prev => prev.map(m => missionIds.includes(m.id) ? { ...m, linkedOrderId: newOrder.orderId, assignedAt: toYmd(new Date()) + " " + new Date().toLocaleTimeString() } : m));
    }

    setIsCreateOpen(false);
    setNewOrderForm({ plate: "", orderGroup: "수시", orderType: "수시세차", washType: "외부" });
    setFoundVehicle(null);
    alert(`오더가 발행되었습니다. (포함된 미션: ${pendingMissions.length}건)`);
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return orders.filter((d) => {
      const targetVal = String(d[searchField] || "").toLowerCase();
      const hitQ = !qq || targetVal.includes(qq);

      const hitPeriod = (!periodFrom || d.createdAt >= periodFrom) && (!periodTo || d.createdAt <= periodTo);
      const hitR1 = !fRegion1 || d.region1 === fRegion1;
      const hitR2 = !fRegion2 || d.region2 === fRegion2;
      const hitOG = !fOrderGroup || d.orderGroup === fOrderGroup;
      const hitOT = !fOrderType || d.orderType === fOrderType;
      const hitWT = !fWashType || d.washType === fWashType;
      const hitP = !fPartner || d.partner === fPartner;
      const hitPT = !fPartnerType || d.partnerType === fPartnerType;
      const hitS = !fStatus || d.status === fStatus;
      const hitCT = !fCancelType || d.cancelType === fCancelType;

      return hitQ && hitPeriod && hitR1 && hitR2 && hitOG && hitOT && hitWT && hitP && hitPT && hitS && hitCT;
    });
  }, [orders, q, searchField, periodFrom, periodTo, fRegion1, fRegion2, fOrderGroup, fOrderType, fWashType, fPartner, fPartnerType, fStatus, fCancelType]);

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

  // 상태 배지 색상 로직
  const getStatusBadgeTone = (status) => {
    if (status === "완료") return "ok";
    if (status === "취소") return "default";
    if (["발행", "예약"].includes(status)) return "warn";
    if (status === "수행 중") return "info";
    return "default";
  };

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
    { key: "partner", header: "파트너 이름" },
    { key: "partnerType", header: "파트너 유형" },
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
      key: "createdAt",
      header: "발행 일시",
      render: (r) => {
        if (!r.createdAt) return "-";
        if (r.createdAt.length > 10) return r.createdAt; // Already has time
        const lastDigit = parseInt(r.orderId.slice(-1), 10) || 0;
        const hour = (8 + lastDigit) % 24;
        const minute = (lastDigit * 5) % 6 * 10;
        return `${r.createdAt} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      }
    },
  ];

  const chips = (
    <div className="flex flex-wrap gap-2">
      {quickFilter ? (
        <Chip variant="info" onRemove={() => { onClearQuickFilter?.(); setFStatus(""); setFOrderType(""); setFCancelType(""); }}>
          Quick Filter: {quickFilter.status ? `상태=${quickFilter.status}` : ""}{quickFilter.orderType ? ` 유형=${quickFilter.orderType}` : ""}{quickFilter.cancelType ? ` 취소=${quickFilter.cancelType}` : ""}
        </Chip>
      ) : null}
      {q ? <Chip onRemove={() => setQ("")}>검색: {q}</Chip> : null}
      {periodFrom || periodTo ? <Chip onRemove={() => { setPeriodFrom(""); setPeriodTo(""); }}>기간: {periodFrom || "-"} ~ {periodTo || "-"}</Chip> : null}
      {fRegion1 ? <Chip onRemove={() => { setFRegion1(""); setFRegion2(""); }}>지역1: {fRegion1}</Chip> : null}
      {fRegion2 ? <Chip onRemove={() => setFRegion2("")}>지역2: {fRegion2}</Chip> : null}
      {fOrderGroup ? <Chip onRemove={() => setFOrderGroup("")}>오더 구분: {fOrderGroup}</Chip> : null}
      {fOrderType && !quickFilter?.orderType ? <Chip onRemove={() => setFOrderType("")}>발행 유형: {fOrderType}</Chip> : null}
      {fWashType ? <Chip onRemove={() => setFWashType("")}>세차 유형: {fWashType}</Chip> : null}
      {fPartner ? <Chip onRemove={() => setFPartner("")}>파트너 이름: {fPartner}</Chip> : null}
      {fPartnerType ? <Chip onRemove={() => setFPartnerType("")}>파트너 유형: {fPartnerType}</Chip> : null}
      {fStatus && !quickFilter?.status ? <Chip onRemove={() => { setFStatus(""); setFCancelType(""); }}>상태: {fStatus}</Chip> : null}
      {fCancelType && !quickFilter?.cancelType ? <Chip onRemove={() => setFCancelType("")}>취소 유형: {fCancelType}</Chip> : null}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">오더 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">상단 필터 및 데이터 그리드, 행 클릭 Drawer 상세(프로토타입)</div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> 오더 발행
          </Button>
          <Button variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            목록 다운로드
          </Button>
        </div>
      </div>

      <FilterPanel
        chips={chips}
        onReset={() => {
          setQ("");
          setPeriodFrom(() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return toYmd(d); });
          setPeriodTo(toYmd(today));
          setFRegion1(""); setFRegion2("");
          setFOrderGroup(""); setFOrderType(""); setFWashType("");
          setFPartner(""); setFPartnerType("");
          setFStatus(""); setFCancelType("");
          onClearQuickFilter?.();
        }}
      >
        <div className="md:col-span-2">
          <label htmlFor="searchField" className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색항목</label>
          <Select id="searchField" value={searchField} onChange={e => setSearchField(e.target.value)}>
            <option value="plate">차량 번호</option>
            <option value="carId">차량 ID</option>
            <option value="orderId">오더 ID</option>
            <option value="zone">존 이름</option>
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="searchQuery" className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색어</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
            <Input id="searchQuery" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`${searchField === 'plate' ? '차량 번호' : searchField === 'carId' ? '차량 ID' : searchField === 'orderId' ? '오더 ID' : '존 이름'} 검색`} className="pl-9" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="periodFrom" className="block text-xs font-semibold text-[#6B778C] mb-1.5">발행일 시작</label>
          <Input id="periodFrom" type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="periodTo" className="block text-xs font-semibold text-[#6B778C] mb-1.5">발행일 종료</label>
          <Input id="periodTo" type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fRegion1" className="block text-xs font-semibold text-[#6B778C] mb-1.5">지역1</label>
          <Select id="fRegion1" value={fRegion1} onChange={(e) => { setFRegion1(e.target.value); setFRegion2(""); }}>
            <option value="">전체</option>
            {regions1.map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fRegion2" className={cn("block text-xs font-semibold mb-1.5", fRegion1 ? "text-[#6B778C]" : "text-[#C1C7CD]")}>지역2</label>
          <Select id="fRegion2" value={fRegion2} onChange={(e) => setFRegion2(e.target.value)} disabled={!fRegion1} className={!fRegion1 ? "bg-[#F4F5F7]! text-[#C1C7CD] cursor-not-allowed" : ""}>
            <option value="">전체</option>
            {regions2.map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fOrderGroup" className="block text-xs font-semibold text-[#6B778C] mb-1.5">오더 구분</label>
          <Select id="fOrderGroup" value={fOrderGroup} onChange={(e) => setFOrderGroup(e.target.value)}>
            <option value="">전체</option>
            {orderGroups.map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fOrderType" className="block text-xs font-semibold text-[#6B778C] mb-1.5">발행 유형</label>
          <Select id="fOrderType" value={fOrderType} onChange={(e) => setFOrderType(e.target.value)}>
            <option value="">전체</option>
            {orderTypes.map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fWashType" className="block text-xs font-semibold text-[#6B778C] mb-1.5">세차 유형</label>
          <Select id="fWashType" value={fWashType} onChange={(e) => setFWashType(e.target.value)}>
            <option value="">전체</option>
            {washTypes.map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fPartner" className="block text-xs font-semibold text-[#6B778C] mb-1.5">파트너 이름</label>
          <Select id="fPartner" value={fPartner} onChange={(e) => setFPartner(e.target.value)}>
            <option value="">전체</option>
            {partners.map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fPartnerType" className="block text-xs font-semibold text-[#6B778C] mb-1.5">파트너 유형</label>
          <Select id="fPartnerType" value={fPartnerType} onChange={(e) => setFPartnerType(e.target.value)}>
            <option value="">전체</option>
            <option value="현장">현장</option>
            <option value="입고">입고</option>
            <option value="핸들러">핸들러</option>
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fStatus" className="block text-xs font-semibold text-[#6B778C] mb-1.5">진행 상태</label>
          <Select id="fStatus" value={fStatus} onChange={(e) => { setFStatus(e.target.value); if (e.target.value !== "취소") setFCancelType(""); onClearQuickFilter?.(); }}>
            <option value="">전체</option>
            {statuses.map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>
        </div>
        {fStatus === "취소" && (
          <div className="md:col-span-2">
            <label htmlFor="fCancelType" className="block text-xs font-semibold text-[#6B778C] mb-1.5">취소 유형</label>
            <Select id="fCancelType" value={fCancelType} onChange={(e) => { setFCancelType(e.target.value); onClearQuickFilter?.(); }}>
              <option value="">전체</option>
              {CANCEL_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
            </Select>
          </div>
        )}
      </FilterPanel>

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

      {/* 오더 상세 Drawer */}
      <Drawer
        open={!!selected}
        title={selected ? `오더 상세 - ${selected.orderId}` : "오더 상세"}
        onClose={() => { setSelected(null); setDeleteModalOpen(false); setDeleteReason(""); setDrawerTab("info"); }}
        footer={
          <div className="flex w-full flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelected(null)} className="w-full sm:w-auto">닫기</Button>
            {selected?.status !== "완료" && selected?.status !== "취소" && drawerTab === "info" && (
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  // 오더 완료 처리 로직
                  const updatedOrders = orders.map(o => o.orderId === selected.orderId ? { ...o, status: "완료", completedAt: new Date().toISOString().substring(0, 16).replace('T', ' ') } : o);
                  setOrders(updatedOrders);
                  
                  // 미션 완료 처리 로직 (Global State Update)
                  if (selected.attachedMissions?.length > 0) {
                    const missionIds = selected.attachedMissions.map(m => m.id); // 스냅샷 기준 ID
                    setMissions(prev => prev.map(m => missionIds.includes(m.id) ? { ...m, status: "completed", completedAt: toYmd(new Date()) + " " + new Date().toLocaleTimeString() } : m));
                  }
                  
                  setSelected(null);
                  alert("오더 수행 완료 처리되었습니다. 관련 미션도 완료 상태로 변경됩니다.");
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> 수행 완료
              </Button>
            )}
            {selected?.status !== "취소" && (
              <Button variant="secondary" onClick={() => setDeleteModalOpen(true)} className="w-full sm:w-auto">
                <X className="mr-2 h-4 w-4" />
                오더 취소
              </Button>
            )}
          </div>
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
              {/* 1. 기본 정보 섹션 */}
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
                    <div className="text-xs text-[#6B778C]">파트너 유형</div>
                    <div>{selected.partnerType}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">수행원</div>
                    <div>{selected.partnerType === '핸들러' ? '-' : selected.worker}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#6B778C]">진행 상태</div>
                    <Badge tone={getStatusBadgeTone(selected.status)}>{selected.status}</Badge>
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

              {/* 2. 탁송 정보 (입고 파트너 전용) */}
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

              {/* 2-2. 미션핸들 예약 정보 (핸들러 파트너 전용) */}
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

              {/* 3. 금액 및 연계 정보 (핸들러 파트너는 금액 정보 없음) */}
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
                         )
                      })}
                    </CardContent>
                  </Card>

                  <PhotoGrid title="기타 사진" photos={selected.additionalPhotos} />
                </>
              )}
            </TabsContent>

            <TabsContent value="mission" currentValue={drawerTab} className="space-y-4 pt-4">
              {/* 5. 분실물 및 미션 관리 */}
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
                            <button
                              onClick={() => window.open(`/lostitems?id=${item.id}`, '_blank')}
                              className="text-sm font-bold text-[#0052CC] hover:underline flex items-center gap-1"
                            >
                              {item.id}
                              <ExternalLink className="h-3 w-3" />
                            </button>
                            <Badge tone={item.status === "발송 완료" ? "ok" : item.status === "접수" ? "warn" : "default"}>
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

            {deleteModalOpen ? (
              <Card className="ring-rose-200">
                <CardHeader>
                  <CardTitle className="text-[#6B778C]">오더 취소</CardTitle>
                  <CardDescription>취소 사유 기록(프로토타입). 실제로는 권한 및 감사 로그가 필요합니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="취소 사유를 입력하세요"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => { setDeleteModalOpen(false); setDeleteReason(""); }}>
                      닫기
                    </Button>
                    <Button
                      variant="primary"
                      disabled={!deleteReason.trim()}
                      onClick={() => {
                        // 실제 취소는 미구현. 프로토타입용 alert 처리.
                        alert(`(프로토타입) 취소 처리: ${selected.orderId}\n사유: ${deleteReason}`);
                        setOrders(orders.map(o => o.orderId === selected.orderId ? { ...o, status: "취소" } : o));
                        setDeleteModalOpen(false);
                        setDeleteReason("");
                        setSelected(null);
                      }}
                    >
                      취소 확정
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
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

      {/* 오더 발행 Drawer */}
      <Drawer
        open={isCreateOpen}
        title="오더 수동 발행"
        onClose={() => {
          setIsCreateOpen(false);
          setNewOrderForm({ plate: "", orderGroup: "수시", orderType: "수시세차", washType: "외부" });
          setFoundVehicle(null);
        }}
        footer={
          <Button onClick={handleCreateOrder} className="w-full" disabled={!foundVehicle}>발행하기</Button>
        }
      >
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>발행 정보 입력</CardTitle>
              <CardDescription>차량 번호 입력 시 대기 중인 미션이 있으면 자동 포함됩니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">차량 번호 *</label>
                <Input value={newOrderForm.plate} onChange={e => setNewOrderForm({...newOrderForm, plate: e.target.value})} placeholder="예: 12가3456" />
              </div>
              
              {foundVehicle ? (
                <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4 animate-in fade-in-50">
                  <div className="text-xs font-bold text-blue-800">조회된 차량 정보</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <div className="text-xs text-blue-700">차종</div>
                      <div className="font-medium text-blue-900">{foundVehicle.model}</div>
                    </div>
                    <div>
                      <div className="text-xs text-blue-700">존 이름</div>
                      <div className="font-medium text-blue-900">{foundVehicle.zoneName}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-blue-700">담당 파트너</div>
                      <div className="font-medium text-blue-900">{foundVehicle.partner}</div>
                    </div>
                  </div>
                </div>
              ) : newOrderForm.plate.trim() ? (
                 <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-center text-xs font-medium text-rose-700 animate-in fade-in-50">
                   일치하는 차량 정보가 없습니다.
                 </div>
              ) : null}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">오더 구분</label>
                <Select value={newOrderForm.orderGroup} onChange={e => setNewOrderForm({...newOrderForm, orderGroup: e.target.value})}>
                  {orderGroups.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">발행 유형</label>
                <Select value={newOrderForm.orderType} onChange={e => setNewOrderForm({...newOrderForm, orderType: e.target.value})}>
                  {orderTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B778C]">세차 유형</label>
                <Select value={newOrderForm.washType} onChange={e => setNewOrderForm({...newOrderForm, washType: e.target.value})}>
                  {washTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </Drawer>
    </div>
  );
}

export default OrdersPage;