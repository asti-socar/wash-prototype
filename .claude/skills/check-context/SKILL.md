---
name: check-context
description: 특정 화면 또는 전체 화면의 JSX ↔ MD 명세 정합성 검증
---

# JSX ↔ MD 정합성 검증

화면 구현(JSX)과 기능 명세(MD)의 정합성을 검증합니다.

## 입력
- `$ARGUMENTS`: 화면명 또는 페이지 파일명 (예: "오더 관리", "orders", "BillingPage")
- 인자 없으면 전체 화면 대상으로 검증

## 검증 항목

### 리스트
- [ ] 컬럼 구성: 헤더명, 순서, 개수 일치
- [ ] 정렬: sortable 플래그와 MD 정렬 컬럼 일치
- [ ] 기본 정렬: DataTable defaultSort와 MD 기본 정렬 일치
- [ ] 페이지네이션: usePagination 건수와 MD 일치

### 필터
- [ ] 필터 필드: 필드명, 타입(Select/Input/DatePicker) 일치
- [ ] 기본값: "전체", 기간 기본값 일치
- [ ] 종속 관계: 지역1→지역2 비활성화 등

### Drawer (상세)
- [ ] 필드 구성: 표시 필드명, 순서 일치
- [ ] Badge: tone 값과 MD 색상 표현 일치
- [ ] 액션 버튼: 조건부 표시 로직 일치

### 데이터
- [ ] Mock 데이터 값과 JSX 코드의 참조값 일치 (예: O/X, Y/N)
- [ ] Select 옵션값과 Mock 데이터 값 범위 일치

## 화면 ↔ 파일 매핑
| 화면명 | JSX | MD |
|:--|:--|:--|
| 대시보드 | Dashboard.jsx | dashboard.md |
| 오더 관리 | OrdersPage.jsx | orders.md |
| 차량 관리 | CarsPage.jsx | vehicles.md |
| 청구 관리 | BillingPage.jsx | billing.md |
| 합의 요청 관리 | SettlementPage.jsx | settlement.md |
| 미션 정책 관리 | MissionsPage.jsx | missions.md |
| 분실물 관리 | LostItemsPage.jsx | lostfound.md |
| 존 정책 관리 | ZonePolicyPage.jsx | zone-policy.md |
| 존 배정 관리 | ZoneAssignmentPage.jsx | zone-assignment.md |
| 지역 정책 관리 | RegionPolicyPage.jsx | regionpolicy.md |
| 파트너 관리 | PartnersPage.jsx | partners.md |
| 파트너 담당자 관리 | PartnerManagersPage.jsx | partner-managers.md |
| 수행원 조회 | WorkersPage.jsx | workers.md |
| 발행 유형 정책 | OrderTypePolicyPage.jsx | order-type-policy.md |
| AI 모델 정책 | AIPolicyPage.jsx | ai-policy.md |

## 출력 형식

불일치 항목만 리포트:

```
## [화면명] 정합성 검증 결과

### 불일치 N건

| # | 영역 | 항목 | JSX | MD | 수정 제안 |
|---|------|------|-----|-----|----------|
| 1 | 리스트 컬럼 | ... | ... | ... | ... |
```

불일치가 없으면 "정합성 검증 완료: 불일치 없음" 출력.
