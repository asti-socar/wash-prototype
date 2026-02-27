# 청구 관리 (파트너 어드민)

## 1. 개요
- **화면명**: 청구 관리
- **목적**: 자사 관련 청구 내역을 조회하고, 청구 건을 수정/삭제할 수 있는 관리 화면
- **주요 기능**: 청구 목록 조회/필터링, 엑셀 다운로드, 상세 조회(Drawer), 청구 수정, 청구 삭제
- **데이터 범위**: `billing.json`에서 `partner === currentPartner.partnerName`인 항목만 표시

## 2. 인터널 어드민 대비 차이점

| 항목 | 인터널 어드민 | 파트너 어드민 |
| :--- | :--- | :--- |
| 데이터 범위 | 전체 청구 | 자사 파트너 청구만 |
| 파트너 이름 필터 | 있음 | **제거** |
| 파트너 이름 컬럼 | 있음 | **제거** |
| 파트너 유형 컬럼 | 있음 | **제거** |
| 정산 제외 필터 | 있음 | **제거** |
| 정산 제외 컬럼 | 있음 | **제거** |
| Drawer 정산 제외 토글 | 있음 | **제거** |
| Drawer 파트너 이름 필드 | 있음 | **제거** |
| SAP 엑셀 다운로드 | SAP 양식 엑셀 | **엑셀 다운로드** (CSV, 필터 적용 데이터) |
| 수정 기능 | 없음 | **추가** (Drawer 수정 모드) |
| 삭제 기능 | 없음 | **추가** (삭제 확인 모달) |
| 테이블 액션 컬럼 | 없음 | **추가** (Pencil + Trash2 아이콘) |
| 오더 ID 링크 | `orders` 페이지 | `partner-orders` 페이지 |
| 부제 | "파트너사별 청구 내역 조회" | "{파트너이름}의 청구 내역을 조회하고 관리합니다." |

## 3. 데이터

### 3.1 Mock 데이터
- **소스**: `billing.json` (인터널과 동일)
- **필터링**: `billingData.filter(b => b.partner === currentPartner.partnerName)`
- **강남모빌리티 기준**: 28건 중 15건 해당

### 3.2 데이터 구조
인터널 어드민과 동일. `src/docs/specs/internal/billing.md` 참조.

### 3.3 상수
```
WASH_TYPE_OPTIONS: 내외부, 내부, 외부, 특수, 협의, 라이트, 기계세차
```

## 4. 화면 구성 및 기능

### 4.1 헤더
- **제목**: "청구 관리"
- **부제**: "{currentPartner.partnerName}의 청구 내역을 조회하고 관리합니다."

### 4.2 리스트

#### 4.2.1 검색 및 필터 (FilterPanel)
| 구분 | 필드 | col-span | 설명 |
| :--- | :--- | :---: | :--- |
| 검색 | 오더 ID (Input) | 2 | 텍스트 검색 |
| 기간 | 청구 일시 (Input date × 2) | 4 | 기본값: 이번 달 1일 ~ 말일 |

> 인터널 대비 **파트너 이름 필터, 정산 제외 필터 제거**

- **Chip**: 오더 ID, 기간 각각 활성화 시 Chip 표시
- **설정 초기화**: 모든 필터를 기본값으로 복원
- **건수 표시**: 필터 패널 아래 좌측에 "필터된 결과 N건 / 전체 N건" 표시
- **[엑셀 다운로드] 버튼**: 건수 표시 우측에 배치, Download 아이콘(green-600) 포함. 클릭 시 현재 필터/정렬 적용된 데이터를 CSV(UTF-8 BOM)로 다운로드. 파일명: `청구내역_{파트너이름}_{날짜}.csv`

#### 4.2.2 컬럼
| 헤더명 | key | 비고 |
| :--- | :--- | :--- |
| 청구 ID | id | sortable |
| 오더 ID | orderId | sortable |
| 오더 구분 | orderGroup | |
| 세차 유형 | washType | |
| 금액 | amount | sortable, `toLocaleString()원` |
| 청구 일시 | billedAt | sortable |
| (액션) | _actions | Pencil + Trash2 아이콘 |

> 인터널 대비 **파트너 이름, 파트너 유형, 정산 제외 컬럼 제거**, **액션 컬럼 추가**

- **기본 정렬**: 청구 ID 내림차순
- **행 클릭**: 읽기 모드로 Drawer 오픈
- **액션 컬럼**: Pencil(hover:bg-slate-100) 클릭 시 수정 모드 Drawer 오픈, Trash2(hover:bg-red-50) 클릭 시 삭제 확인 모달

#### 4.2.3 페이지네이션
- 페이지 크기: 40건, `usePagination(sortedData, 40)`
- 좌우 화살표(ChevronLeft/ChevronRight) + "시작 - 끝 / 전체" 텍스트

### 4.3 상세 (Drawer)

- **타이틀**: "청구 상세 - {id}" (읽기) / "청구 수정 - {id}" (수정)

#### 4.3.1 카드 1: 청구 정보
| 필드 | 읽기 모드 | 수정 모드 |
| :--- | :--- | :--- |
| 청구 ID | 텍스트 | 읽기 전용 |
| 오더 ID | 링크 (`partner-orders` 페이지) | 읽기 전용 |
| 청구 금액 | `N원` | Input (number) |
| 세차 유형 | 텍스트 | Select (WASH_TYPE_OPTIONS) |
| 청구 일시 | 텍스트 | 읽기 전용 |

#### 4.3.2 카드 2: 오더 정보
| 필드 | 비고 |
| :--- | :--- |
| 오더 구분 | 읽기 전용 |
| 차량 번호 | 읽기 전용 |
| 차량 모델 | 읽기 전용 |

#### 4.3.3 Footer
- **읽기 모드**: 닫기(secondary) | flex-1 | 수정(default) | 삭제(bg-rose-600)
- **수정 모드**: 취소(secondary) | 저장(default)

### 4.4 수정 확인 모달

- **진입**: Drawer 수정 모드에서 [저장] 클릭 시, 변경 사항이 있으면 표시
- **내용**: 변경된 필드별 이전 값(취소선) → 새 값 표시
- **Footer**: [취소] + [저장]
- **저장 시 동작**: 항목 업데이트, Drawer 읽기 모드로 전환
- **변경 사항 없을 때**: 모달 없이 수정 모드 종료

### 4.5 삭제 확인 모달

- **진입**: 테이블 Trash2 아이콘 클릭 또는 Drawer 읽기 모드 [삭제] 버튼 클릭
- **타이틀**: "청구 삭제 확인"
- **내용**: "해당 청구 건({id})을 삭제하시겠습니까?" + "삭제된 청구 건은 복구할 수 없습니다."
- **Footer**: 취소(secondary) + 삭제(bg-rose-600)
- **삭제 시 동작**: localData에서 항목 제거, Drawer가 열려있으면 닫기

## 5. UI 컴포넌트 의존성

| 컴포넌트 | 용도 |
| :--- | :--- |
| Card / CardHeader / CardTitle / CardContent | Drawer 내 카드, 모달 |
| Button | Footer 버튼 |
| Input | 검색어, 기간 필터, 금액 수정 |
| Select | 세차 유형 수정 |
| Chip | FilterPanel 활성 필터 표시 |
| FilterPanel | 조회 조건 설정 패널 |
| Drawer / Field | 상세 정보 오버레이 |
| DataTable | 목록 테이블 렌더링 |
| usePagination | 40건 단위 페이지네이션 |
| Pencil / Trash2 / ChevronLeft / ChevronRight / ExternalLink / Download | Lucide 아이콘 |

## 6. 상태 관리
```
localData: 파트너 청구 데이터 배열 (초기화 시 partnerName 필터 적용)
searchOrderId: 오더 ID 검색어
periodFrom / periodTo: 청구일 기간 필터
sortConfig: { key, direction }
selected: Drawer 표시 항목
isEditMode: 읽기/수정 모드 여부
drafts: { amount, washType } 수정 중 임시 데이터
isSaveConfirming / pendingChanges: 수정 확인 모달 상태
deleteTarget: 삭제 확인 모달 대상 항목
```
