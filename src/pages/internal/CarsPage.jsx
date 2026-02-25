import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Download,
  ExternalLink,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  cn,
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
  Field,
} from "../../components/ui";

/** 검색 가능한 셀렉트 (옵션이 많은 필터용) */
function SearchableSelect({ value, onChange, options, placeholder = "검색", disabled }) {
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
          className={cn(
            "h-10 w-full rounded-lg border border-[#E2E8F0] bg-white pl-8 pr-8 text-sm text-[#172B4D] outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]",
            disabled && "bg-[#F4F5F7]! text-[#C1C7CD] cursor-not-allowed"
          )}
          value={value || search}
          onChange={(e) => {
            if (disabled) return;
            if (value) { onChange(""); setSearch(e.target.value); }
            else { setSearch(e.target.value); }
            setOpen(true);
          }}
          onFocus={() => { if (!disabled) setOpen(true); }}
          placeholder={value ? value : placeholder}
          disabled={disabled}
        />
        {value && !disabled && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-[#DFE1E6]"
            onClick={() => { onChange(""); setSearch(""); }}
          >
            <X className="h-3.5 w-3.5 text-[#6B778C]" />
          </button>
        )}
      </div>
      {open && !disabled && (
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

// Mock Data for Vehicles (Shared)
const MOCK_VEHICLES = [
  { plate: "12가3456", zoneName: "강남역 1번존", zoneId: "Z-1001", region1: "서울", region2: "강남", partner: "강남모빌리티", activeOrderId: "O-90001", activeOrderStatus: "예약", lastWash: "2026-01-10", model: "아반떼 AD", isRechargeGuaranteed: false },
  { plate: "34나7890", zoneName: "잠실역 2번존", zoneId: "Z-1002", region1: "서울", region2: "송파", partner: "강남모빌리티", activeOrderId: null, activeOrderStatus: null, lastWash: "2026-01-08", model: "K5", isRechargeGuaranteed: false },
  { plate: "56다1122", zoneName: "홍대입구 3번존", zoneId: "Z-1003", region1: "서울", region2: "마포", partner: "강남모빌리티", activeOrderId: "O-90003", activeOrderStatus: "미배정", lastWash: "2026-01-05", model: "쏘나타", isRechargeGuaranteed: false },
  { plate: "78라3344", zoneName: "판교 1번존", zoneId: "Z-2001", region1: "경기", region2: "성남", partner: "수원카케어", activeOrderId: "O-90004", activeOrderStatus: "입고 중", lastWash: "2026-01-09", model: "아이오닉5", isRechargeGuaranteed: true },
  { plate: "90마5566", zoneName: "수원역 2번존", zoneId: "Z-2002", region1: "경기", region2: "수원", partner: "수원카케어", activeOrderId: null, activeOrderStatus: null, lastWash: "2026-01-07", model: "스포티지", isRechargeGuaranteed: false },
  { plate: "11바7788", zoneName: "부산역 1번존", zoneId: "Z-3001", region1: "부산", region2: "동구", partner: "미션핸들코리아", activeOrderId: "O-90006", activeOrderStatus: "미배정", lastWash: "2026-01-03", model: "그랜저", isRechargeGuaranteed: false },
  { plate: "22사9900", zoneName: "해운대 2번존", zoneId: "Z-3002", region1: "부산", region2: "해운대", partner: "미션핸들코리아", activeOrderId: "O-90007", activeOrderStatus: "예약", lastWash: "2026-01-11", model: "레이", isRechargeGuaranteed: false },
  { plate: "33아1212", zoneName: "대전역 1번존", zoneId: "Z-4001", region1: "대전", region2: "동구", partner: "미션핸들코리아", activeOrderId: null, activeOrderStatus: null, lastWash: "2026-01-06", model: "카니발", isRechargeGuaranteed: false },
  { plate: "44자3434", zoneName: "청주 2번존", zoneId: "Z-5002", region1: "충북", region2: "청주", partner: "수원카케어", activeOrderId: "O-90009", activeOrderStatus: "미배정", lastWash: "2026-01-02", model: "모닝", isRechargeGuaranteed: false },
  { plate: "55차5656", zoneName: "광주 1번존", zoneId: "Z-6001", region1: "광주", region2: "서구", partner: "미션핸들코리아", activeOrderId: "O-90010", activeOrderStatus: "예약", lastWash: "2026-01-09", model: "EV6", isRechargeGuaranteed: false },
  { plate: "66카7878", zoneName: "인천공항 1번존", zoneId: "Z-7001", region1: "인천", region2: "중구", partner: "수원카케어", activeOrderId: null, activeOrderStatus: null, lastWash: "2026-01-08", model: "티볼리", isRechargeGuaranteed: false },
  { plate: "77타9090", zoneName: "제주공항 1번존", zoneId: "Z-8001", region1: "제주", region2: "제주시", partner: "미션핸들코리아", activeOrderId: "O-90012", activeOrderStatus: "미배정", lastWash: "2026-01-01", model: "셀토스", isRechargeGuaranteed: false },
];

function CarsPage() {
  const data = MOCK_VEHICLES;

  const [q, setQ] = useState("");
  const [searchField, setSearchField] = useState("plate");
  const [sortConfig, setSortConfig] = useState({ key: 'lastWash', direction: 'asc' });
  const [fRegion1, setFRegion1] = useState("");
  const [fRegion2, setFRegion2] = useState("");
  const [fPartner, setFPartner] = useState("");
  const [selected, setSelected] = useState(null);

  // 날짜 계산 유틸
  const getElapsedDays = (dateStr) => {
    if (!dateStr) return "-";
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const regions1 = useMemo(() => Array.from(new Set(data.map((d) => d.region1))), [data]);
  const regions2 = useMemo(() => Array.from(new Set(data.filter((d) => (fRegion1 ? d.region1 === fRegion1 : true)).map((d) => d.region2))), [data, fRegion1]);
  const partners = useMemo(() => Array.from(new Set(data.map((d) => d.partner))), [data]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return data.filter((d) => {
      const targetVal = String(d[searchField] || "").toLowerCase();
      const hitQ = !qq || targetVal.includes(qq);

      const hitR1 = !fRegion1 || d.region1 === fRegion1;
      const hitR2 = !fRegion2 || d.region2 === fRegion2;
      const hitP = !fPartner || d.partner === fPartner;

      return hitQ && hitR1 && hitR2 && hitP;
    });
  }, [data, q, searchField, fRegion1, fRegion2, fPartner]);

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

  const columns = [
    { key: "plate", header: "차량 번호" },
    { key: "zoneName", header: "존 이름" },
    { key: "zoneId", header: "존 ID" },
    { key: "region1", header: "지역1" },
    { key: "region2", header: "지역2" },
    { key: "lastWash", header: "마지막 세차일", sortable: true },
    { key: "elapsedDays", header: "세차 경과일", render: (r) => <span className="font-medium">{getElapsedDays(r.lastWash)}일</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">차량 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">수행률 낮은 차량, 존 이름별 현황 모니터링(프로토타입)</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            목록 다운로드
          </Button>
        </div>
      </div>

      <FilterPanel
        chips={<>
          {q ? <Chip onRemove={() => setQ("")}>검색: {q}</Chip> : null}
          {fRegion1 ? <Chip onRemove={() => { setFRegion1(""); setFRegion2(""); }}>지역1: {fRegion1}</Chip> : null}
          {fRegion2 ? <Chip onRemove={() => setFRegion2("")}>지역2: {fRegion2}</Chip> : null}
          {fPartner ? <Chip onRemove={() => setFPartner("")}>파트너 이름: {fPartner}</Chip> : null}
        </>}
        onReset={() => { setQ(""); setFRegion1(""); setFRegion2(""); setFPartner(""); }}
      >
        <div className="md:col-span-1">
          <label htmlFor="searchField" className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색항목</label>
          <Select id="searchField" value={searchField} onChange={e => setSearchField(e.target.value)}>
            <option value="plate">차량 번호</option>
            <option value="zoneName">존 이름</option>
            <option value="zoneId">존 ID</option>
          </Select>
        </div>
        <div className="md:col-span-4">
          <label htmlFor="searchQuery" className="block text-xs font-semibold text-[#6B778C] mb-1.5">검색어</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B778C]" />
            <Input
              id="searchQuery"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`${
                searchField === 'plate' ? '차량 번호' : searchField === 'zoneName' ? '존 이름' : '존 ID'
              } 검색`}
              className="pl-9"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fRegion1" className="block text-xs font-semibold text-[#6B778C] mb-1.5">지역1</label>
          <Select id="fRegion1" value={fRegion1} onChange={(e) => { setFRegion1(e.target.value); setFRegion2(""); }}>
            <option value="">전체</option>
            {regions1.map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label className={cn("block text-xs font-semibold mb-1.5", fRegion1 ? "text-[#6B778C]" : "text-[#C1C7CD]")}>지역2</label>
          <SearchableSelect
            value={fRegion2}
            onChange={setFRegion2}
            options={regions2}
            placeholder="지역2 검색"
            disabled={!fRegion1}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fPartner" className="block text-xs font-semibold text-[#6B778C] mb-1.5">파트너 이름</label>
          <Select id="fPartner" value={fPartner} onChange={(e) => setFPartner(e.target.value)}>
            <option value="">전체</option>
            {partners.map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>
        </div>
      </FilterPanel>

      <div className="flex items-center mb-2">
        <div className="text-sm text-[#6B778C]">
          {filtered.length !== data.length ? `필터된 결과 ${filtered.length.toLocaleString()}건 / ` : ''}
          전체 <b className="text-[#172B4D]">{data.length.toLocaleString()}</b>건
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={currentData}
        rowKey={(r) => `${r.zoneId}-${r.plate}`}
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

      <Drawer
        open={!!selected}
        title={selected ? `차량 상세 - ${selected.plate}` : "차량 상세"}
        onClose={() => setSelected(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>닫기</Button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <CardDescription>리스트 필드 + 차종</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[#172B4D]">
                <Field label="차량 번호" value={selected.plate} />
                <Field label="차종" value={selected.model} />
                <Field label="존 이름" value={`${selected.zoneName} (${selected.zoneId})`} />
                <Field label="지역1" value={selected.region1} />
                <Field label="지역2" value={selected.region2} />
                <Field label="파트너 이름" value={selected.partner} />
                <Field
                  label="발행된 오더"
                  value={selected.activeOrderId ? (
                    <span className="flex items-center gap-1.5">
                      <button
                        className="inline-flex items-center gap-1 text-sm text-[#0052CC] underline hover:text-[#0747A6] transition-colors"
                        onClick={() => window.open(`/?page=orders&orderId=${selected.activeOrderId}`, "_blank")}
                      >
                        {selected.activeOrderId}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[#6B778C]">({selected.activeOrderStatus})</span>
                    </span>
                  ) : "없음"}
                />
                <Field label="마지막 세차일" value={selected.lastWash} />
                <Field label="세차 경과일" value={`${getElapsedDays(selected.lastWash)}일`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>세차 이력(더미)</CardTitle>
                <CardDescription>실데이터 연동 전 UI 형태만 제공</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#172B4D]">
                  {[
                    { date: "2026-01-10", type: "라이트 세차", status: "완료", orderId: "O-90001" },
                    { date: "2026-01-08", type: "수시 세차", status: "완료", orderId: "O-90002" },
                    { date: "2026-01-05", type: "주기 세차", status: "미배정", orderId: "O-90003" },
                  ].map((h, i) => (
                    <li
                      key={i}
                      className="flex cursor-pointer items-center justify-between rounded p-2 transition-colors hover:bg-[#F4F5F7]"
                      onClick={() => window.open(`/?page=orders&orderId=${h.orderId}`, "_blank")}
                    >
                      <span>{h.date}, {h.type}</span>
                      <div className="flex items-center gap-2">
                        <Badge tone="ok">{h.status}</Badge>
                        <ExternalLink className="h-3 w-3 text-[#6B778C]" />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

export default CarsPage;