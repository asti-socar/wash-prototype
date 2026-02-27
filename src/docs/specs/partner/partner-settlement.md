# 합의 요청 관리 (파트너 어드민)

## 1. 개요
- **화면명**: 합의 요청 관리
- **목적**: 자사 관련 합의 요청 내역을 조회하고 승인/반려 처리
- **주요 기능**: 합의 요청 목록 조회/필터링, 상세 조회(Drawer), 승인 처리(1단계/2단계), 반려 처리
- **데이터 범위**: `settlement.json`에서 `partner === currentPartner.partnerName`인 항목만 표시

## 2. 인터널 어드민 대비 차이점

| 항목 | 인터널 어드민 | 파트너 어드민 |
| :--- | :--- | :--- |
| 데이터 범위 | 전체 합의 요청 | 자사 파트너 합의 요청만 |
| 파트너 이름 필터 | 있음 | **제거** |
| 파트너 이름 컬럼 | 있음 | **제거** |
| Drawer 파트너 이름 필드 | 있음 | **제거** |
| 승인 시 처리자 | `"brown"` (인터널 관리자) | `"partner@gangnam.kr"` (파트너 계정) |
| 1단계 승인 | 승인 → 승인 완료 | 동일 |
| 2단계 승인 | 승인 → 승인 완료 (2차 처리자 설정) | 승인 → **인터널 허가요청** 상태 (1차만 완료) |
| 상태 옵션 | 요청 / 승인 / 반려 | 요청 / 승인 / 반려 / **인터널 허가요청** |
| 부제 | "현장 추가 요금 및 특수 세차 합의 요청 건 처리" | "{파트너이름}의 합의 요청 현황을 조회하고 처리합니다." |

## 3. 승인 프로세스

### 3.1 1단계 승인
- 파트너가 [승인] 클릭 → 확인 다이얼로그 ("승인 후 청구금액 수정이 불가능합니다. 승인하시겠습니까?")
- 승인 시: `status: "승인"`, `processor: "partner@gangnam.kr"`, `processedAt: 현재 시각`
- 최종 완료 상태

### 3.2 2단계 승인
- 파트너가 [승인] 클릭 → 확인 다이얼로그 ("1차 승인 후 인터널 관리자에게 허가 요청이 전달됩니다. 승인하시겠습니까?")
- 승인 시: `status: "인터널 허가요청"` (1차 승인 완료, 인터널 2차 승인 대기)
- `processedAt`, `secondaryProcessor`는 미설정 (인터널 승인 시 설정)
- "인터널 허가요청" 상태에서는 파트너 조작 불가 (읽기 전용)

### 3.3 반려
- 1단계/2단계 동일
- [반려] 클릭 → 반려 사유 입력 모달 → 반려 최종 확인 모달
- 반려 시: `status: "반려"`, `processor: "partner@gangnam.kr"`, `processedAt: 현재 시각`, `rejectComment: 입력값`

## 4. 데이터

### 4.1 Mock 데이터
- **소스**: `settlement.json` (인터널과 동일)
- **필터링**: `settlementData.filter(d => d.partner === currentPartner.partnerName)`
- **강남모빌리티 기준**: 16건 중 10건 해당

### 4.2 데이터 구조
인터널 어드민과 동일. `src/docs/specs/internal/settlement.md` 참조.

### 4.3 상수
```
STATUS_TONE: 요청(warn), 승인(ok), 반려(danger), 인터널 허가요청(info)
```

## 5. 화면 구성 및 기능

### 5.1 헤더
- **제목**: "합의 요청 관리"
- **부제**: "{currentPartner.partnerName}의 합의 요청 현황을 조회하고 처리합니다."

### 5.2 리스트

#### 5.2.1 검색 및 필터 (FilterPanel)
| 구분 | 필드 | col-span | 설명 |
| :--- | :--- | :---: | :--- |
| 필터 | 요청 유형 (Select) | 2 | 동적 옵션 (데이터에서 추출) |
| 기간 | 요청 일시 (Input date × 2) | 5 | 기본값: 최근 1개월 |
| 필터 | 합의 유형 (Select) | 2 | 1단계 승인 / 2단계 승인 |
| 필터 | 상태 (Select) | 2 | 요청 / 승인 / 반려 / 인터널 허가요청 |

> 인터널 대비 **파트너 이름 필터 제거**

- **Chip**: 요청 유형, 요청 일시, 합의 유형, 상태 각각 활성화 시 Chip 표시
- **설정 초기화**: 모든 필터를 기본값으로 복원

#### 5.2.2 컬럼
| 헤더명 | key | 비고 |
| :--- | :--- | :--- |
| 오더 ID | orderId | |
| 차량 번호 | plate | |
| 차종 | model | |
| 존 이름 | zoneName | |
| 요청 유형 | requestType | |
| 요청 일시 | requestedAt | |
| 합의 유형 | approvalType | |
| 상태 | status | Badge (STATUS_TONE) |
| 처리 주체 | processorType | Badge (인터널: ok, 파트너: default) |
| 처리 일시 | processedAt | |

> 인터널 대비 **파트너 이름 컬럼 제거**

- **기본 정렬**: 오더 ID 내림차순
- **행 클릭**: Drawer 오픈

#### 5.2.3 페이지네이션
- 페이지 크기: 40건
- 좌우 화살표 + "시작 - 끝 / 전체" 텍스트

### 5.3 상세 (Drawer)

- **타이틀**: "합의 요청 상세 - {id}"

#### 5.3.1 카드 1: 요청 정보
| 필드 | 비고 |
| :--- | :--- |
| 오더 ID | 읽기 전용 |
| 차량 번호 | 읽기 전용 |
| 차종 | 읽기 전용 |
| 존 이름 | 읽기 전용 |
| 요청 유형 | 읽기 전용 |
| 요청 일시 | 읽기 전용 |
| 합의 유형 | Badge (1단계: ok, 2단계: warn) |
| 상태 | Badge (STATUS_TONE) |
| (1단계) 처리 주체 | Badge, processor 기반 판별 |
| (1단계) 처리자 | 텍스트 |
| (2단계) 1차 처리자 | primaryProcessor |
| (2단계) 2차 처리자 | secondaryProcessor |
| 처리 일시 | 텍스트 |
| ─── 구분선 ─── | |
| 청구 금액 | Input (number), `status === "요청"` 일 때만 수정 가능 |
| 요청 코멘트 | 텍스트 |
| 반려 코멘트 | `status === "반려"` 일 때만 표시, rose-600 |

> 인터널 대비 **파트너 이름 필드 제거**

#### 5.3.2 카드 2: 현장 사진
- Placeholder 이미지 영역

#### 5.3.3 Footer
- **status === "요청"**: [반려(secondary)] + [승인(primary)]
- **그 외**: [닫기(secondary)]

### 5.4 반려 모달 (2단계)

#### 5.4.1 반려 사유 입력 모달
- Input으로 사유 입력 (필수)
- 미입력 시 경고 메시지 + 버튼 비활성화
- Footer: [취소(secondary)] + [반려 확정(rose-600)]

#### 5.4.2 반려 최종 확인 모달
- 요청 유형, 청구 금액, 반려 사유 표시
- "위 내용으로 반려 처리합니다. 계속하시겠습니까?"
- Footer: [이전(secondary)] + [반려 처리(rose-600)]

## 6. UI 컴포넌트 의존성

| 컴포넌트 | 용도 |
| :--- | :--- |
| Card / CardHeader / CardTitle / CardContent | Drawer 내 카드 |
| Button | Footer 버튼, 모달 버튼 |
| Input | 기간 필터, 청구 금액, 반려 사유 |
| Select | 필터 셀렉트 |
| Badge | 상태, 합의 유형, 처리 주체 표시 |
| Chip | FilterPanel 활성 필터 표시 |
| FilterPanel | 조회 조건 설정 패널 |
| Drawer / Field | 상세 정보 오버레이 |
| DataTable | 목록 테이블 렌더링 |
| usePagination | 40건 단위 페이지네이션 |
| ChevronLeft / ChevronRight | Lucide 아이콘 |

## 7. 상태 관리
```
items: 파트너 합의 요청 데이터 배열 (초기화 시 partnerName 필터 적용)
fRequestType: 요청 유형 필터
periodFrom / periodTo: 요청일 기간 필터
approvalTypeFilter: 합의 유형 필터
statusFilter: 상태 필터
sortConfig: { key, direction }
selected: Drawer 표시 항목
rejectReason: 반려 사유 입력 임시 데이터
isRejecting: 반려 사유 입력 모달 표시 여부
isRejectConfirming: 반려 최종 확인 모달 표시 여부
```
