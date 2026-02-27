# 분실물 관리 (파트너 어드민)

## 1. 개요
- **화면명**: 분실물 관리
- **목적**: 자사 수행원이 접수한 분실물 내역을 조회하고 처리 상태를 관리
- **주요 기능**: 분실물 등록, 분실물 목록 조회/필터링, 상세 조회 및 수정(Drawer), 발송 완료 처리, 처리상태 변경이력 조회
- **데이터 범위**: `currentPartner.partnerName`과 일치하는 분실물만 표시

## 2. 인터널 어드민 대비 차이점

| 항목 | 인터널 어드민 | 파트너 어드민 |
| :--- | :--- | :--- |
| 데이터 범위 | 전체 분실물 | 자사 파트너 분실물만 |
| 파트너 이름 필터 | 있음 | **제거** |
| 파트너 이름 컬럼 | 있음 | **제거** |
| Drawer 세차 오더 정보 | 파트너 이름 + 연계 오더 ID | 연계 오더 ID만 |
| 오더 ID 링크 | `orders` 페이지로 이동 | `partner-orders` 페이지로 이동 |
| 상태 변경 이력 계정 | `admin@socar.kr` | `partner@gangnam.kr` |
| 페이지 부제 | "분실물 접수 현황 및 처리 상태 관리" | "{파트너이름}에서 접수된 분실물을 조회하고 관리합니다." |
| 분실물 등록 | 없음 | **등록 모달 제공** (헤더 [분실물 등록] 버튼) |

## 3. 데이터

### 3.1 Mock 데이터
- **소스**: `lostItems.json` (인터널과 동일)
- **필터링**: `allLostItems.filter(i => i.partnerName === currentPartner.partnerName)`
- **강남모빌리티 기준**: 16건 중 10건 해당
- **등록용 오더 데이터**: `orders-vehicles.json`에서 `onsitePartner === currentPartner.partnerName` + `activeOrderId`가 있는 항목

### 3.2 데이터 구조
인터널 어드민과 동일. `src/docs/specs/internal/lostfound.md` 참조.

### 3.3 상수
```
allStatusOptions: 배송지 미입력, 발송 대기, 발송 완료, 경찰서 인계, 폐기 완료

TERMINAL_STATUSES: 발송 완료, 경찰서 인계, 폐기 완료

statusBadgeMap
  배송지 미입력: warn, 발송 대기: info, 발송 완료: ok, 폐기 완료: default, 경찰서 인계: default
```

## 4. 화면 구성 및 기능

### 4.1 헤더
- **제목**: "분실물 관리"
- **부제**: "{currentPartner.partnerName}에서 접수된 분실물을 조회하고 관리합니다."
- **[분실물 등록] 버튼**: 우측 배치, Plus 아이콘 포함, 클릭 시 등록 모달 오픈

### 4.2 리스트

#### 4.2.1 검색 및 필터 (FilterPanel)
| 구분 | 필드 | col-span | 설명 |
| :--- | :--- | :---: | :--- |
| 검색 | 검색 항목 (Select) | 1 | `차량 번호` / `분실물 카드` 선택 |
| 검색 | 검색어 (Input) | 3 | 선택 항목 기준 텍스트 검색 |
| 필터 | 처리 상태 (Select) | 2 | 기본값: 전체 (5개 상태 옵션) |
| 기간 | 접수 일시 (Input date × 2) | 4 | 기본값: 2개월 전 ~ 현재 |

> 인터널 대비 **파트너 이름 필터 제거**

- **Chip**: 검색어, 상태, 접수일 각각 활성화 시 Chip 표시
- **설정 초기화**: 모든 필터를 기본값으로 복원
- **건수 표시**: 필터 패널 아래에 "필터된 결과 N건 / 전체 N건" 표시

#### 4.2.2 컬럼
| 헤더명 | key | 비고 |
| :--- | :--- | :--- |
| 분실물 ID | id | |
| 차량 번호 | carNumber | |
| 존 이름 | zoneName | |
| 오더 ID | relatedOrderId | 클릭 시 `partner-orders` 페이지로 이동 |
| 접수 일시 | createdAt | |
| 분실물 카드 번호 | lostItemCardReceiptNumber | |
| 처리 상태 | status | Badge (tone: statusBadgeMap) |
| (수정 아이콘) | _edit | 종결 상태가 아닌 행에만 Pencil 아이콘 표시, 클릭 시 수정 모드로 Drawer 오픈 |

> 인터널 대비 **파트너 이름 컬럼 제거**

- **기본 정렬**: 분실물 ID 내림차순
- **행 클릭**: 읽기 모드로 Drawer 오픈

#### 4.2.3 페이지네이션
- 페이지 크기: 40건, `usePagination(sortedData, 40)`
- 좌우 화살표(ChevronLeft/ChevronRight) + "시작 - 끝 / 전체" 텍스트

### 4.3 분실물 등록 (모달)

- **진입**: 헤더 [분실물 등록] 버튼 클릭
- **오더 데이터**: `orders-vehicles.json`에서 `onsitePartner === currentPartner.partnerName` + `activeOrderId`가 있는 항목만 사용

#### 4.3.1 입력 필드
| 필드 | 타입 | 필수 | 설명 |
| :--- | :--- | :---: | :--- |
| 세차 오더 번호 | Input (검색 + 드롭다운) | Y | 텍스트 입력 시 오더 ID 필터링, 드롭다운에서 선택. 각 항목에 오더 ID + 차량번호 + 존이름 표시. 선택 후 ✕ 버튼으로 해제 가능 |
| 처리 상태 | Select | Y | `배송지 미입력` / `경찰서 인계` 2개 옵션 (기본값: 배송지 미입력) |
| 상세 정보 | Textarea (3행) | Y | 분실물 종류, 색상, 특징 등. placeholder: "분실물의 종류, 색상, 특징 등을 입력하세요" |

#### 4.3.2 오더 선택 시 자동 표시
오더 선택 후 회색 배경 패널에 차량/존 정보 표시:
- 차량 번호 (`plate`)
- 존 이름 (`zoneName`)
- 지역 (`region1 region2`)

#### 4.3.3 등록 시 자동 설정 값
| 필드 | 값 |
| :--- | :--- |
| 분실물 ID | `LI` + (기존 최대 번호 + 1, 4자리 zero-padding) |
| 접수 일시 | 현재 시각 (`YYYY-MM-DD HH:mm:ss`) |
| 차량 번호 | 선택된 오더의 `plate` |
| 존/지역 정보 | 선택된 오더의 `zoneId`, `zoneName`, `region1`, `region2` |
| 연계 오더 ID | 선택한 오더 ID |
| 파트너 정보 | `currentPartner.partnerId`, `currentPartner.partnerName` |
| statusHistory | 초기 이력 1건 (`fromStatus: null → toStatus: {선택한 상태}`, `changedBy: partner@gangnam.kr`) |

#### 4.3.4 Footer
- [취소]: 모달 닫기
- [등록]: 오더 미선택 또는 상세 정보 미입력 시 비활성화(disabled), 등록 완료 시 items 배열 맨 앞에 추가 후 모달 닫기

### 4.4 상세 (Drawer)

- **타이틀**: "분실물 상세 정보" / 부제: "분실물 상세 및 처리 상태 관리"
- **탭 구성**: PillTabs로 2개 탭
  - `상세 정보` (기본 탭): 4개 카드
  - `처리상태 변경이력`: 변경 이력 테이블

#### 4.4.1 카드 1: 분실물 정보
| 필드 | 읽기 모드 | 수정 모드 |
| :--- | :--- | :--- |
| 분실물 ID | 텍스트 | 읽기 전용 |
| 접수 일시 | 텍스트 | 읽기 전용 |
| 처리 상태 | Badge | Select (전체 상태 목록, `allStatusOptions`) + 폐기 체크박스 |
| 상세 정보 | 텍스트 | Textarea (3행) |
| 습득물 사진 | 이미지 목록 | 읽기 전용 |

> 수정 모드 처리 상태: 전체 상태 목록(`allStatusOptions`) 적용 + "보관 30일 경과 폐기" 체크박스
> 읽기 모드 처리 상태: Badge 표시, `isDisposed` 시 "폐기완료" danger Badge 추가 표시

#### 4.4.2 카드 2: 차량 정보
| 필드 | 비고 |
| :--- | :--- |
| 차량 번호 | 읽기 전용 |
| 존 이름 | 읽기 전용 |
| 지역1 | 읽기 전용 |
| 지역2 | 읽기 전용 |
| 존 ID | 읽기 전용 |

#### 4.4.3 카드 3: 세차 오더 정보
| 필드 | 비고 |
| :--- | :--- |
| 연계 오더 ID | 읽기 전용 |

> 인터널 대비 **파트너 이름 필드 제거**

#### 4.4.4 카드 4: 분실물 카드 정보
| 필드 | 비고 |
| :--- | :--- |
| 카드 접수 번호 | 읽기 전용 |
| 분실물 상세 정보 | 읽기 전용 (pre-wrap) |
| 배송 주소 | 주소 + 상세 주소(회색) |
| 수령인 이름 | 읽기 전용 |
| 휴대폰 번호 | 읽기 전용 |

#### 4.4.5 탭 2: 처리상태 변경이력
| 컬럼 | 설명 |
| :--- | :--- |
| 변경 일시 | `changedAt` |
| 이전 상태 | `fromStatus` (Badge, null이면 "-" 텍스트) |
| 변경 상태 | `toStatus` (Badge) |
| 변경 계정 | `changedBy` |

- **정렬**: 최신순 (reverse)
- **빈 상태**: "변경 이력이 없습니다." 메시지

#### 4.4.6 Footer
- **읽기 모드**:
  - 좌측: [발송 완료] — 조건: `status === '발송 대기'`, confirm 다이얼로그 후 상태 변경 + 이력 추가
  - 우측: [닫기] + [수정하기] (종결 상태가 아닐 때만)
- **수정 모드**:
  - 우측: [취소] + [저장하기]

### 4.5 수정 확인 모달

- **진입**: Drawer 수정 모드에서 [저장하기] 클릭 시, 변경 사항이 있으면 표시
- **내용**: 변경된 필드별 이전 값(취소선) → 새 값 표시
- **Footer**: [취소] + [저장]
- **저장 시 동작**: 항목 업데이트, 상태 변경 시 `statusHistory`에 이력 추가 (`changedBy: partner@gangnam.kr`)
- **변경 사항 없을 때**: 모달 없이 수정 모드 종료

## 5. UI 컴포넌트 의존성

| 컴포넌트 | 용도 |
| :--- | :--- |
| Card / CardHeader / CardTitle / CardContent | Drawer 내 카드 영역 |
| Button | Footer 버튼, 헤더 등록 버튼 |
| Input | 검색어, 기간 필터, 오더 검색 |
| Select | 검색 항목, 상태 필터, 처리 상태 |
| Badge | 처리 상태 표시 (리스트, Drawer, 이력 탭) |
| Chip | FilterPanel 활성 필터 표시 |
| FilterPanel | 조회 조건 설정 패널 |
| Drawer / Field | 상세 정보 오버레이 |
| PillTabs | Drawer 내 탭 전환 |
| DataTable | 목록 테이블 렌더링 |
| usePagination | 40건 단위 페이지네이션 |
| Plus / Pencil / ChevronLeft / ChevronRight | Lucide 아이콘 |

## 6. 상태 관리
```
items: 파트너 분실물 데이터 배열 (초기화 시 partnerName 필터 적용)
searchField / searchText: 검색 항목 및 검색어
fStatus: 처리 상태 필터
periodFrom / periodTo: 접수일 기간 필터
sortConfig: { key, direction }
drawerVisible / selectedItem: Drawer 표시 여부 및 선택 항목
drawerTab: Drawer 내 활성 탭 ('detail' | 'statusHistory')
isEditMode: 읽기/수정 모드 여부
drafts: 수정 중 임시 데이터 (status, itemDetails, recipientName, recipientPhone, isDisposed)
draftAddr1 / draftAddr2: 주소 수정 임시 데이터
isSaveConfirming / pendingChanges: 수정 확인 모달 상태
isRegisterOpen: 등록 모달 표시 여부
regForm: { orderId, status, itemDetails } 등록 폼 데이터
orderSearchText: 오더 검색 입력 텍스트
isOrderDropdownOpen: 오더 검색 드롭다운 표시 여부
partnerOrders: 자사 파트너 오더 목록 (orders-vehicles.json 기반, activeOrderId 있는 항목만, useMemo)
filteredOrders: 검색 텍스트로 필터링된 오더 목록 (useMemo)
selectedOrderVehicle: 선택된 오더의 차량 정보 (useMemo)
```
