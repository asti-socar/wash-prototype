// src/lib/checklistData.js

// Based on "3. 세차 전 사진 촬영"
const preWashPhotos = {
  '내외부': ["정면", "운전석 방향 측면", "후면", "조수석 방향 측면", "1열", "2열", "3열 (승합/RV 차종인 경우)"],
  '외부': ["정면", "운전석 방향 측면", "후면", "조수석 방향 측면"],
  '내부': ["1열", "2열", "3열 (승합/RV 차종인 경우)"],
  '라이트': [], // 없음
};

// Based on "4. 세차 후 사진 촬영"
const postWashPhotos = {
    '내외부': {
        exterior: ["워셔액", "전면", "조수석 도어", "조수석 사이드미러", "조수석 앞타이어 트레드", "조수석 뒷도어", "조수석 뒷타이어 트레드", "후면", "트렁크 내부", "운전석 뒷도어", "운전석 뒷타이어 트레드", "운전석 도어", "운전석 사이드 미러", "운전석 앞타이어 트레드"],
        interior: ["조수석 내부", "조수석 발매트", "조수석 뒷좌석 내부", "조수석 뒷좌석 발매트", "조수석 시트 하단", "운전석 뒷좌석 내부", "운전석 뒷좌석 발매트", "운전석 시트 하단", "운전석 내부", "운전석 발매트", "센터페시아", "컵홀더"],
    },
    '외부': {
        exterior: ["워셔액", "전면", "조수석 도어", "조수석 사이드미러", "조수석 앞타이어 트레드", "조수석 뒷도어", "조수석 뒷타이어 트레드", "후면", "운전석 뒷도어", "운전석 뒷타이어 트레드", "운전석 도어", "운전석 사이드 미러", "운전석 앞타이어 트레드"],
        interior: [],
    },
    '내부': {
        exterior: ["조수석 앞타이어 트레드", "조수석 뒷타이어 트레드", "트렁크 내부", "운전석 뒷타이어 트레드", "운전석 앞타이어 트레드"],
        interior: ["조수석 내부", "조수석 발매트", "조수석 뒷좌석 내부", "조수석 뒷좌석 발매트", "조수석 시트 하단", "운전석 뒷좌석 내부", "운전석 뒷좌석 발매트", "운전석 시트 하단", "운전석 내부", "운전석 발매트", "센터페시아", "컵홀더"],
    },
    '라이트': {
        exterior: ["정면", "후면"],
        interior: ["1열", "2열", "3열 (승합/RV 차종인 경우)"],
    },
    // 특수, 협의는 명세에 없어 내외부 기준으로 처리
    '특수': '내외부',
    '협의': '내외부',
};

// Based on "5. 점검 항목 명세"
const checklistItems = {
    common: [
        { id: 'mileage', label: '적산거리 (km)', type: 'number', placeholder: '예: 54321' },
        { id: 'tireTread', label: '타이어트레드 (X.X 형식)', type: 'tires-text', locations: ['전좌', '전우', '후좌', '후우'] },
        { id: 'windowStatus', label: '유리창', type: 'toggle', options: ['정상', '이상'] },
        { id: 'batteryVoltage', label: '배터리전압', type: 'toggle', options: ['녹색', '노랑', '빨강'] },
        { id: 'safetyTriangle', label: '안전삼각대', type: 'toggle', options: ['정상', '분실'] },
        { id: 'fireExtinguisher', label: '차량용 소화기', type: 'toggle', options: ['정상', '분실'] },
        { id: 'washerFluidTank', label: '워셔액통', type: 'toggle', options: ['정상', '파손'] },
        { id: 'floorMat', label: '발판매트', type: 'toggle', options: ['정상', '분실'] },
        { id: 'tirePuncture', label: '타이어파스/펑크', type: 'toggle', options: ['정상', '전좌', '전우', '후좌', '후우'] },
        { id: 'engineStart', label: '시동불가', type: 'toggle', options: ['정상', '이상'] },
        { id: 'hood', label: '본넷', type: 'toggle', options: ['정상', '고장', '파손'] },
        { id: 'tireWear', label: '타이어마모', type: 'toggle', options: ['정상', '전좌', '전우', '후좌', '후우'] },
    ],
    A: [
        { id: 'emergencyAction', label: '긴급 조치 내용', type: 'textarea' },
        { id: 'seatRemoval', label: '시트 탈거', type: 'number' },
        { id: 'partReplacementCost', label: '부품교체 금액', type: 'number' },
        { id: 'airFreshener', label: '방향제', type: 'toggle', options: ['정상', '분실'] },
        { id: 'wiper', label: '와이퍼', type: 'toggle', options: ['정상', '이상'] },
        { id: 'seatFolding', label: '시트/폴딩', type: 'toggle', options: ['정상', '이상'] },
        { id: 'warningLight', label: '차량 경고등', type: 'multiselect', options: ['공기압', '엔진경고', '라이트'] },
        { id: 'exteriorDamage', label: '외관 파손', type: 'multiselect', options: ['이상없음', '정면', '운전석측면', '조수석측면', '후면', '유리', '기타'] },
    ],
    B: [
        { id: 'emergencyAction', label: '긴급 조치 내용', type: 'textarea' },
        { id: 'airFreshener', label: '방향제', type: 'toggle', options: ['정상', '분실'] },
        { id: 'wiper', label: '와이퍼', type: 'toggle', options: ['정상', '이상'] },
        { id: 'seatFolding', label: '시트/폴딩', type: 'toggle', options: ['정상', '이상'] },
        { id: 'warningLight', label: '차량 경고등', type: 'multiselect', options: ['공기압', '엔진경고', '라이트'] },
        { id: 'exteriorDamage', label: '외관 파손', type: 'multiselect', options: ['이상없음', '정면', '운전석측면', '조수석측면', '후면', '유리', '기타'] },
    ],
    C: [
        { id: 'emergencyAction', label: '긴급 조치 내용', type: 'textarea' },
        { id: 'airFreshener', label: '방향제', type: 'toggle', options: ['정상', '분실'] },
        { id: 'wiper', label: '와이퍼', type: 'toggle', options: ['정상', '이상'] },
        { id: 'seatFolding', label: '시트/폴딩', type: 'toggle', options: ['정상', '이상'] },
        { id: 'warningLight', label: '차량 경고등', type: 'multiselect', options: ['공기압', '엔진경고', '라이트'] },
        { id: 'exteriorDamage', label: '외관 파손', type: 'multiselect', options: ['이상없음', '정면', '운전석측면', '조수석측면', '후면', '유리', '기타'] },
    ],
    D: [
        { id: 'airFreshener', label: '방향제', type: 'toggle', options: ['정상', '분실'] },
        { id: 'wiper', label: '와이퍼', type: 'toggle', options: ['정상', '이상'] },
        { id: 'seatFolding', label: '시트/폴딩', type: 'toggle', options: ['정상', '이상'] },
        { id: 'warningLight', label: '차량 경고등', type: 'multiselect', options: ['공기압', '엔진경고', '라이트'] },
        { id: 'exteriorDamage', label: '외관 파손', type: 'multiselect', options: ['이상없음', '정면', '운전석측면', '조수석측면', '후면', '유리', '기타'] },
    ],
    E: [
        { id: 'exteriorCheckArea', label: '외관 점검 부위선택', type: 'toggle', options: ['이상없음', '정면', '운전석 측면', '조수석 측면', '후면', '유리&기타'] },
        { id: 'exteriorDamageType', label: '(선택부위) 외관 이상 유형', type: 'dropdown', options: ['이상없음', '경미(운행 가능)', '파손(운행 불가)'] },
        { id: 'exteriorContamination', label: '(세차 전) 외관 오염도', type: 'toggle', options: ['상', '중', '하'] },
        { id: 'tireCondition', label: '타이어 상태', type: 'tires-toggle', locations: ['전좌', '전우', '후좌', '후우'], options: ['정상', '경미', '파손'] },
        { id: 'interiorContamination', label: '(세차 전) 내부 오염 위치', type: 'multiselect', options: ['깨끗함', '운전석', '조수석', '뒷좌석', '트렁크', '컵홀더', '기타'] },
        { id: 'batteryCondition', label: '배터리 상태', type: 'dropdown', options: ['이상없음', '시동 불가(방전)', '전압 낮음(교체 필요)'] },
        { id: 'wiperWasher', label: '와이퍼/워셔액', type: 'dropdown', options: ['이상없음', '와이퍼 불량', '워셔액 보충', '워셔액통 파손'] },
        { id: 'followUpAction', label: '후속 조치', type: 'dropdown', options: ['완료', '외부세차 필요', '내부세차 필요', '내외부 세차 필요', '입고'] },
    ]
};

const getWashType = (washType) => {
    if (postWashPhotos[washType] === '내외부') {
        return '내외부';
    }
    return washType;
}

export const getPreWashPhotos = (order) => {
    const washType = getWashType(order.washType);
    const photos = preWashPhotos[washType] || [];
    
    // 3열은 승합/RV만
    if (order.vehicleType !== '승합/RV') {
        return photos.filter(p => !p.includes('3열'));
    }
    return photos;
};

export const getPostWashPhotos = (order) => {
    const washType = getWashType(order.washType);
    const photos = postWashPhotos[washType] || { exterior: [], interior: [] };

    // 3열은 승합/RV만
    if (order.vehicleType !== '승합/RV') {
        const filteredInterior = photos.interior.filter(p => !p.includes('3열'));
        return { ...photos, interior: filteredInterior };
    }
    return photos;
};

export const getChecklistItems = (inspectionType) => {
    if (inspectionType === 'E') {
        return checklistItems.E;
    }
    const common = checklistItems.common;
    const specific = checklistItems[inspectionType] || [];
    return [...common, ...specific];
};

// Based on "2.1 점검 유형 분류표"
// Sorted by inspectionType
export const mockOrderTypes = [
    { key: 'A_긴급_특수', inspectionType: "A", orderType: "긴급", washType: "특수", partnerType: "입고" },
    { key: 'A_변경_특수', inspectionType: "A", orderType: "변경", washType: "특수", partnerType: "입고" },
    { key: 'A_변경_협의', inspectionType: "A", orderType: "변경", washType: "협의", partnerType: "입고" },
    { key: 'A_수시_특수', inspectionType: "A", orderType: "수시", washType: "특수", partnerType: "입고" },
    { key: 'B_긴급_내외부', inspectionType: "B", orderType: "긴급", washType: "내외부", partnerType: "입고" },
    { key: 'B_정규_내외부', inspectionType: "B", orderType: "정규", washType: "내외부", partnerType: "입고" },
    { key: 'B_수시_내외부', inspectionType: "B", orderType: "수시", washType: "내외부", partnerType: "입고" },
    { key: 'B_수시_내부', inspectionType: "B", orderType: "수시", washType: "내부", partnerType: "입고" },
    { key: 'B_수시_외부', inspectionType: "B", orderType: "수시", washType: "외부", partnerType: "입고" },
    { key: 'C_긴급_내외부', inspectionType: "C", orderType: "긴급", washType: "내외부", partnerType: "현장" },
    { key: 'D_정규_내외부', inspectionType: "D", orderType: "정규", washType: "내외부", partnerType: "현장" },
    { key: 'D_정규_내부', inspectionType: "D", orderType: "정규", washType: "내부", partnerType: "현장" },
    { key: 'D_정규_외부', inspectionType: "D", orderType: "정규", washType: "외부", partnerType: "현장" },
    { key: 'D_수시_내외부', inspectionType: "D", orderType: "수시", washType: "내외부", partnerType: "현장" },
    { key: 'D_수시_내부', inspectionType: "D", orderType: "수시", washType: "내부", partnerType: "현장" },
    { key: 'D_수시_외부', inspectionType: "D", orderType: "수시", washType: "외부", partnerType: "현장" },
    { key: 'D_수시_특수', inspectionType: "D", orderType: "수시", washType: "특수", partnerType: "현장" },
    { key: 'D_특별_내외부', inspectionType: "D", orderType: "특별", washType: "내외부", partnerType: "현장" },
    { key: 'E_정규_라이트', inspectionType: "E", orderType: "정규", washType: "라이트", partnerType: "현장" },
].map(order => ({
    ...order,
    // Add vehicle info for photo logic
    vehicle: order.washType === '라이트' ? "카니발 KA4" : "쏘렌토 MQ4",
    licensePlate: "12가 3456",
    location: "테스트존",
    vehicleType: order.washType.includes('3열') || order.washType === '라이트' ? "승합/RV" : "일반",
}));
