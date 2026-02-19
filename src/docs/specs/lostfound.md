# 분실물 관리

## 1. 개요
- **화면명**: 분실물 관리
- **목적**: 세차 과정에서 발견된 고객 분실물을 등록, 추적, 처리하며 옥스트라(Oxtra) 분실물 카드와 연동하여 안전하게 인계
- **주요 기능**: 분실물 목록 조회/필터링, 상세 조회 및 수정(Drawer), 발송 완료 처리, 보관 30일 경과 폐기 표시

## 2. 데이터

### 2.1 Mock 데이터
| 파일 | 건수 | 설명 |
| :--- | :---: | :--- |
| `lostItems.json` | 11건 | 분실물 접수 데이터 (일반/귀중품 혼합) |

### 2.2 데이터 구조
| 필드명 | 타입 | 설명 | 예시 |
| :--- | :---: | :--- | :--- |
| id | string | 분실물 고유 식별자 | "LI0001" |
| createdAt | string | 접수 일시 | "2026-02-05 10:30:00" |
| itemCategory | string | 분실물 구분 (`일반` / `귀중품`) | "일반" |
| status | string | 처리 상태 | "배송지 미입력" |
| itemDetails | string | 습득물 상세 정보 | "검은색 스마트폰" |
| itemPhotos | string[] | 습득물 사진 URL 목록 | [] |
| carId | string | 차량 ID | "CAR001" |
| carNumber | string | 차량 번호 | "12가3456" |
| zoneId | string | 존 ID | "ZONE01" |
| zoneName | string | 존 이름 | "강남존" |
| region1 | string | 지역1 (시/도) | "서울" |
| region2 | string | 지역2 (시군구) | "강남구" |
| partnerId | string | 파트너 ID | "P001" |
| partnerName | string | 파트너 이름 | "워시 파트너스" |
| relatedOrderId | string | 연계 오더 ID | "ORD456" |
| lostItemCardReceiptNumber | string | 옥스트라 카드 접수 번호 | "LCRN001" |
| deliveryAddress1 | string | 배송 주소 (도로명) | "" |
| deliveryAddress2 | string | 배송 상세 주소 | "" |
| recipientName | string | 수령인 이름 | "" |
| recipientPhone | string | 수령인 휴대폰 번호 | "" |

> `isDisposed` (boolean)는 Mock 데이터에 없으며, 런타임에서 동적으로 추가됨.

### 2.3 처리 상태 정의

| 상태명 | 해당 구분 | Badge tone | 설명 |
| :--- | :--- | :--- | :--- |
| 배송지 미입력 | 공통 | warn | 배송지 미입력 상태 |
| 발송 대기 | 일반 | info | 배송지 입력 완료, 발송 대기 |
| 발송 완료 | 일반 | ok | 배송 완료 (종결) |
| 경찰서 인계 | 귀중품 | default | 경찰서 인계 완료 (종결) |
| 폐기 완료 | 공통 | default | 보관 기간 만료 폐기 (종결) |

### 2.4 상태 전이

**자동 전이 (저장 시 주소가 입력되어 있으면):**
- 일반: `배송지 미입력` → `발송 대기`
- 귀중품: `배송지 미입력` → `경찰서 인계`

**액션 버튼:**
- [발송 완료]: `일반` + `발송 대기` 상태에서만 Footer에 표시. `confirm()` 확인 후 상태 변경.

**구분 변경 시**: 현재 상태가 새 구분의 유효 상태에 없으면 `배송지 미입력`으로 리셋

**종결 상태** (`발송 완료`, `경찰서 인계`, `폐기 완료`):
- Drawer Footer에서 [수정하기] 버튼 숨김 (편집 불가)

### 2.5 분실물 정보 생성 흐름

분실물은 두 가지 경로로 생성되며, 연계 오더 ID와 카드 접수 번호가 자동 설정됩니다.

**1) 옥스트라 분실물 카드 존재**: 옥스트라에 카드 등록 → 해당 차량 세차 오더에서 '분실물 카드' 정보 확인 가능 → 수행원 수거 완료 시 분실물 정보 생성

**2) 수행원 현장 발견**: 수행원이 세차 중 미신고 분실물 발견 → 에이전트에서 등록 시 분실물 정보 생성 + 옥스트라 카드 자동 생성 (동기화)

---

## 3. 화면 구성 및 기능

### 3.1 리스트

#### 3.1.1 검색 및 필터 (FilterPanel)
| 구분 | 필드 | col-span | 설명 |
| :--- | :--- | :---: | :--- |
| 검색 | 검색 항목 (Select) | 2 | `차량 번호` / `분실물 카드` 선택 |
| 검색 | 검색어 (Input) | 2 | 선택 항목 기준 텍스트 검색 (부분 일치, 대소문자 무시) |
| 필터 | 파트너 이름 (Select) | 2 | 기본값: 전체. Mock 데이터의 고유 파트너 목록 |
| 필터 | 처리 상태 (Select) | 2 | 기본값: 전체 (5개 상태 옵션) |
| 기간 | 접수일 시작 (Input date) | 2 | 기본값: 현재 기준 2개월 전 |
| 기간 | 접수일 종료 (Input date) | 2 | 기본값: 현재 날짜 |

- **Chip**: 검색어, 파트너, 상태, 시작일, 종료일 각각 활성화 시 Chip 표시 (개별 제거 가능)
- **설정 초기화**: 모든 필터를 기본값으로 복원

#### 3.1.2 컬럼
| 헤더명 | key | 정렬 | 비고 |
| :--- | :--- | :---: | :--- |
| 분실물 ID | id | | |
| 파트너 이름 | partnerName | | |
| 차량 번호 | carNumber | | |
| 존 이름 | zoneName | | |
| 오더 ID | relatedOrderId | | 클릭 시 오더 화면으로 이동 (링크 스타일) |
| 접수 일시 | createdAt | | |
| 분실물 카드 번호 | lostItemCardReceiptNumber | | |
| 처리 상태 | status | | Badge (tone: statusBadgeMap) |

- **기본 정렬**: 분실물 ID 내림차순 (`sortConfig: { key: 'id', direction: 'desc' }`)

#### 3.1.3 페이지네이션
- **페이지 크기**: 40건
- `usePagination(sortedData, 40)` 사용
- 커스텀 페이지네이션 UI: `1 - 40 / 전체건수` 형식 + 좌우 화살표 버튼

---

### 3.2 상세 (Drawer)

- **타이틀**: "분실물 상세 정보" / 부제: "분실물 상세 및 처리 상태 관리"
- **읽기/수정 모드**: 기본 읽기 모드로 열림. [수정하기] 클릭 시 편집 모드 전환.

#### 3.2.1 읽기 모드 → 수정 모드 전환
- **[수정하기]** 클릭 → `enterEditMode()`: 현재 데이터를 drafts로 복사하여 편집 모드 진입
- **[저장하기]** 클릭 → `handleSaveAll()`: 모든 변경사항 일괄 저장 후 읽기 모드 복귀
- **[취소]** 클릭 → `handleCancelEdit()`: 변경사항 파기, drafts 초기화 후 읽기 모드 복귀
- 종결 상태(`발송 완료`, `경찰서 인계`, `폐기 완료`)인 경우 [수정하기] 버튼 숨김

#### 3.2.2 Footer
**읽기 모드:**
- 좌측: [발송 완료] (primary, `일반` + `발송 대기` 상태일 때만 표시)
- 우측: [닫기] (secondary) + [수정하기] (primary, 종결 상태가 아닐 때만 표시)

**수정 모드:**
- 우측: [취소] (secondary) + [저장하기] (primary)

#### 3.2.3 카드 1: 분실물 정보
| 필드 | 읽기 모드 | 수정 모드 | 비고 |
| :--- | :--- | :--- | :--- |
| 분실물 ID | 텍스트 | 텍스트 (읽기 전용) | |
| 접수 일시 | 텍스트 | 텍스트 (읽기 전용) | |
| 분실물 구분 | 텍스트 | Select (`일반`/`귀중품`) | 변경 시 저장할 때 상태 검증 |
| 처리 상태 | Badge | Badge + "보관 30일 경과 폐기" 체크박스 | 읽기 모드에서 `isDisposed=true`이면 Badge 옆에 `<Badge tone="danger">폐기완료</Badge>` 표시 |
| 상세 정보 | 텍스트 (pre-wrap) | Textarea (3행) | |
| 습득물 사진 | 사진 목록 | 사진 목록 | 항상 조회 전용 (추가/삭제 불가) |

#### 3.2.4 카드 2: 차량 정보
차량 번호, 존 이름, 지역1, 지역2, 존 ID (모두 읽기 전용, 수정 모드에서도 변경 불가)

#### 3.2.5 카드 3: 세차 오더 정보
파트너 이름, 연계 오더 ID (모두 읽기 전용, 수정 모드에서도 변경 불가)

#### 3.2.6 카드 4: 분실물 카드 정보 (옥스트라 연동)
| 필드 | 읽기 모드 | 수정 모드 | 비고 |
| :--- | :--- | :--- | :--- |
| 카드 접수 번호 | 텍스트 | 텍스트 (읽기 전용) | 없으면 `-` |
| 분실물 상세 정보 | 텍스트 (읽기 전용) | 텍스트 (읽기 전용) | 옥스트라 카드 연동 상세 정보. 항상 조회만 가능 |
| 배송 주소 / 경찰서 주소 | 텍스트 (읽기 전용) | 텍스트 (읽기 전용) | 귀중품일 때 레이블 "경찰서 주소". 항상 조회만 가능 |
| 수령인 이름 | 텍스트 (읽기 전용) | 텍스트 (읽기 전용) | 항상 조회만 가능 |
| 휴대폰 번호 | 텍스트 (읽기 전용) | 텍스트 (읽기 전용) | 항상 조회만 가능 |

> 분실물 카드 정보는 옥스트라의 분실물 카드 정보를 연동하여 조회하는 역할이며, 모든 필드는 수정 모드에서도 항상 읽기 전용입니다.

---

## 4. 데이터 처리 흐름

### 4.1 필터링·정렬·페이지네이션 순서
```
items (전체 11건)
  → searchField + searchText 적용 (부분 일치, 대소문자 무시)
  → fPartner 적용 (파트너 이름 필터)
  → fStatus 적용 (처리 상태 필터)
  → periodFrom / periodTo 적용 (접수일 기간 필터)
  → filteredData
  → sortConfig 적용 (기본: id 내림차순)
  → sortedData
  → usePagination (40건 단위)
  → currentData (화면 표시)
```

### 4.2 수정 데이터 흐름
```
[수정하기] 클릭 → enterEditMode()
  → selectedItem 데이터를 drafts로 복사 (itemCategory, itemDetails, recipientName, recipientPhone, isDisposed)
  → 주소 drafts 별도 초기화 (draftAddr1, draftAddr2)
  → isEditMode = true → 수정 가능 필드가 Input/Select/Textarea로 전환

[저장하기] 클릭 → handleSaveAll()
  → 구분 변경 확인: 새 구분의 유효 상태에 없으면 status → '배송지 미입력'
  → 필드 업데이트: itemDetails, recipientName, recipientPhone, isDisposed
  → 주소 업데이트: deliveryAddress1, deliveryAddress2
  → 자동 상태 전이: status='배송지 미입력' + 주소 입력됨 → 일반은 '발송 대기', 귀중품은 '경찰서 인계'
  → updateItemField(id, updates) → items 상태 업데이트
  → isEditMode = false → 읽기 모드 복귀

[취소] 클릭 → handleCancelEdit()
  → drafts 초기화, 주소 drafts를 selectedItem 값으로 복원
  → isEditMode = false → 읽기 모드 복귀
```

---

## 5. UI 컴포넌트 의존성
| 컴포넌트 | 용도 |
| :--- | :--- |
| Card / CardHeader / CardTitle / CardContent | Drawer 내 카드 영역 |
| Button | Footer 버튼 (발송 완료, 닫기, 수정하기, 취소, 저장하기) |
| Input | 검색어, 기간 필터, Daum 우편번호 주소 |
| Select | 검색 항목, 파트너/상태 필터, 분실물 구분 |
| Badge | 처리 상태 표시, 폐기완료 칩 (tone: danger) |
| Chip | FilterPanel 활성 필터 표시 |
| FilterPanel | 조회 조건 설정 패널 |
| Drawer / Field | 상세 정보 오버레이 |
| DataTable | 목록 테이블 렌더링 |
| usePagination | 40건 단위 페이지네이션 |

## 6. Badge 색상 규칙
| 값 | tone | 색상 |
| :--- | :--- | :--- |
| 배송지 미입력 | warn | 황색 (amber) |
| 발송 대기 | info | 청색 (blue) |
| 발송 완료 | ok | 녹색 (emerald) |
| 경찰서 인계 | default | 회색 (slate) |
| 폐기 완료 | default | 회색 (slate) |
| 폐기완료 (isDisposed 칩) | danger | 적색 (rose) |

### 6.1 상태 관리
```
items: 전체 분실물 데이터 배열
searchField / searchText: 검색 항목 및 검색어
fPartner / fStatus: 파트너/상태 필터
periodFrom / periodTo: 접수일 기간 필터
sortConfig: { key, direction } — 현재 정렬 상태
drawerVisible / selectedItem: Drawer 표시 여부 및 선택 항목
isEditMode: 읽기/수정 모드 여부
drafts: { itemCategory, itemDetails, recipientName, recipientPhone, isDisposed } — 수정 중 임시 데이터
draftAddr1 / draftAddr2: 주소 수정 임시 데이터
addressInputMode: 주소 입력 방식 ('postcode')
```
