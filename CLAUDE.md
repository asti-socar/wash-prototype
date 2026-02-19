# Wash Admin Proto

쏘카 세차 운영 어드민 프로토타입. Mock 데이터 기반 UI/UX 검증 및 기능 명세 관리 목적.

## 기술 스택
- React 19 + Vite, Tailwind CSS v4, Recharts, Lucide Icons
- Mock 데이터 기반 (API 없음), 한국어 UI

## 명령어
- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드 (prebuild로 version.json 자동 갱신)
- `npm run update` — version.json 수동 재생성

## 프로젝트 구조
```
src/
├── App.jsx              # 인터널 어드민 (InternalApp) + 어드민 선택 화면
├── PartnerApp.jsx       # 파트너 어드민
├── components/ui.jsx    # 공유 UI 컴포넌트 (전체 페이지 공용)
├── pages/
│   ├── internal/        # 인터널 어드민 페이지 (17개)
│   └── partner/         # 파트너 어드민 페이지 (9개)
├── mocks/               # Mock 데이터 (JSON)
├── docs/specs/
│   ├── internal/        # 인터널 어드민 화면별 기능 명세 (MD)
│   └── partner/         # 파트너 어드민 화면별 기능 명세 (MD)
├── constants/
│   └── updateHistory.js # 변경 이력 (BROWN_HISTORY, ASTI_HISTORY)
└── generate-version.js  # updateHistory → version.json 생성
```

## 공유 UI 컴포넌트 (`src/components/ui.jsx`)
- **레이아웃**: Card, CardHeader, CardTitle, CardContent
- **입력**: Button, Input, Select, Badge, Chip
- **데이터**: DataTable, usePagination, Pagination, FilterPanel
- **네비게이션**: PillTabs, Tabs/TabsList/TabsTrigger/TabsContent
- **오버레이**: Drawer, Field
- **유틸리티**: cn, toYmd, useIsMobile, formatPercent

## 코드 규칙

### Tailwind v4
- Important 구문: `bg-[#F4F5F7]!` (suffix `!`), ~~`!bg-[#F4F5F7]`~~ (prefix 사용 금지)

### 한국어 용어
- "파트너 이름" (O) / "파트너 명" (X)
- "승인"/"반려" (O) / "수락"/"거절" (X)
- "조회 조건 설정" (FilterPanel 제목)
- "설정 초기화" (리셋 버튼)

### FilterPanel 패턴
```jsx
<FilterPanel chips={<>...</>} onReset={resetFn}>
  {/* 12-col grid 내부에 필터 필드 배치 */}
  <div className="md:col-span-2">
    <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">라벨</label>
    <Select value={v} onChange={handler}>
      <option value="">전체</option>
    </Select>
  </div>
</FilterPanel>
```

### Mock 데이터 상태 관리
```jsx
import data from '../mocks/file.json';
const [rows, setRows] = useState(() => data.map(d => ({ ...d })));
```

### Badge tone
- `ok` (emerald/green), `warn` (amber), `danger` (rose), `default` (slate), `info` (blue)

## 화면 ↔ 명세 정합성
- 화면(JSX) 수정 시 대응하는 명세와 정합성 유지
  - 인터널 어드민: `src/docs/specs/internal/*.md`
  - 파트너 어드민: `src/docs/specs/partner/*.md`
- 명세 수정 시 화면 코드의 구현과 일치 여부 확인
- 주요 검증 항목: 컬럼 구성, 필터 필드, Drawer 필드, Badge 색상, 정렬 설정, 페이지네이션

## 업데이트 이력 작업 흐름

### 등록 위치
- `src/constants/updateHistory.js`
- 탭: ASTI_HISTORY (아스티), BROWN_HISTORY (브라운)
- 해당 배열 맨 앞에 새 항목 추가
- id는 각 배열 내 직전 최대값 + 1 (현재 Asti: 4, Brown: 106)
- date는 현재 KST 시각 (`YYYY-MM-DD HH:mm`)
- 등록 후 `npm run update` 실행 → `public/version.json` 재생성

### 변경내용(content) 작성 규칙
- **일반 변경**: `페이지명: 변경내용` (예: `오더 관리: 취소 유형 필터 추가`)
- **제품 정책 변경**: `정책명: 변경내용` (예: `존정책: 주기세차 기본값 변경`)
- isPolicyChange: 제품 정책 변경이면 `true`, 아니면 `false`
- links: 관련 페이지 링크 배열 `[{ label: "페이지명", page: "page-key" }]`
