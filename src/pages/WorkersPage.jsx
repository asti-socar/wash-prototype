import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import {
  cn,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Select,
  Badge,
  Field,
  Drawer,
  usePagination,
  DataTable,
  FilterPanel,
  Chip,
} from '../components/ui';

export default function WorkersPage() {
  const [workers] = useState([
    {
      id: 'W-001', name: '최수행', partner: 'A파트너', zoneName: '강남역 1번존', zoneId: 'Z-1001', region1: '서울', region2: '강남', penalty: 0,
      penaltyHistory: [],
    },
    {
      id: 'W-002', name: '강수행', partner: 'B파트너', zoneName: '잠실역 2번존', zoneId: 'Z-1002', region1: '서울', region2: '송파', penalty: 2,
      penaltyHistory: [
        { orderId: 'O-90015', reason: '지연', date: '2026-01-15' },
        { orderId: 'O-90022', reason: '노쇼', date: '2026-01-22' },
      ],
    },
    {
      id: 'W-003', name: '한수행', partner: 'C파트너', zoneName: '판교 1번존', zoneId: 'Z-2001', region1: '경기', region2: '성남', penalty: 0,
      penaltyHistory: [],
    },
    {
      id: 'W-004', name: '오수행', partner: 'D파트너', zoneName: '해운대 2번존', zoneId: 'Z-3002', region1: '부산', region2: '해운대', penalty: 1,
      penaltyHistory: [
        { orderId: 'O-90038', reason: '지연', date: '2026-02-03' },
      ],
    },
    {
      id: 'W-005', name: '박수행', partner: 'A파트너', zoneName: '역삼역 1번존', zoneId: 'Z-1003', region1: '서울', region2: '강남', penalty: 0,
      penaltyHistory: [],
    },
    {
      id: 'W-006', name: '이수행', partner: 'B파트너', zoneName: '건대입구 1번존', zoneId: 'Z-1004', region1: '서울', region2: '광진', penalty: 3,
      penaltyHistory: [
        { orderId: 'O-90008', reason: '노쇼', date: '2026-01-08' },
        { orderId: 'O-90019', reason: '지연', date: '2026-01-19' },
        { orderId: 'O-90033', reason: '노쇼', date: '2026-02-01' },
      ],
    },
    {
      id: 'W-007', name: '김수행', partner: 'C파트너', zoneName: '수원역 1번존', zoneId: 'Z-2002', region1: '경기', region2: '수원', penalty: 0,
      penaltyHistory: [],
    },
    {
      id: 'W-008', name: '정수행', partner: 'A파트너', zoneName: '서면역 1번존', zoneId: 'Z-3001', region1: '부산', region2: '부산진', penalty: 1,
      penaltyHistory: [
        { orderId: 'O-90028', reason: '지연', date: '2026-01-28' },
      ],
    },
    {
      id: 'W-009', name: '조수행', partner: 'D파트너', zoneName: '분당 1번존', zoneId: 'Z-2003', region1: '경기', region2: '성남', penalty: 0,
      penaltyHistory: [],
    },
    {
      id: 'W-010', name: '윤수행', partner: 'B파트너', zoneName: '홍대입구 1번존', zoneId: 'Z-1005', region1: '서울', region2: '마포', penalty: 2,
      penaltyHistory: [
        { orderId: 'O-90012', reason: '노쇼', date: '2026-01-12' },
        { orderId: 'O-90042', reason: '지연', date: '2026-02-05' },
      ],
    },
  ]);

  const [selected, setSelected] = useState(null);
  const [fRegion1, setFRegion1] = useState("");
  const [fRegion2, setFRegion2] = useState("");
  const [fPartner, setFPartner] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  const regions1 = useMemo(() => Array.from(new Set(workers.map(w => w.region1))), [workers]);
  const regions2 = useMemo(() => Array.from(new Set(workers.filter(w => fRegion1 ? w.region1 === fRegion1 : true).map(w => w.region2))), [workers, fRegion1]);
  const partners = useMemo(() => Array.from(new Set(workers.map(w => w.partner))), [workers]);

  const filteredData = useMemo(() => {
    return workers.filter(w => {
      const matchRegion1 = !fRegion1 || w.region1 === fRegion1;
      const matchRegion2 = !fRegion2 || w.region2 === fRegion2;
      const matchPartner = !fPartner || w.partner === fPartner;
      return matchRegion1 && matchRegion2 && matchPartner;
    });
  }, [workers, fRegion1, fRegion2, fPartner]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key] ?? "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  const columns = [
    { key: 'id', header: '수행원 ID' },
    { key: 'name', header: '이름' },
    { key: 'partner', header: '파트너 이름' },
    { key: 'region1', header: '지역1' },
    { key: 'region2', header: '지역2' },
    { key: 'zoneName', header: '배정된 쏘카존' },
    { key: 'penalty', header: '벌점', render: (r) => {
      if (r.penalty === 0) return <span className="text-[#94A3B8]">0</span>;
      return <Badge tone="danger">{r.penalty}</Badge>;
    }},
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="text-base font-bold text-[#172B4D]">수행원 조회 (View Only)</div>
        <div className="mt-1 text-sm text-[#6B778C]">현장 수행원의 배치 현황을 모니터링하고 품질 이슈 발생 시 피드백 근거로 활용합니다.</div>
      </div>

      <FilterPanel
        chips={<>
          {fPartner ? <Chip onRemove={() => setFPartner("")}>파트너: {fPartner}</Chip> : null}
          {fRegion1 ? <Chip onRemove={() => { setFRegion1(""); setFRegion2(""); }}>지역1: {fRegion1}</Chip> : null}
          {fRegion2 ? <Chip onRemove={() => setFRegion2("")}>지역2: {fRegion2}</Chip> : null}
        </>}
        onReset={() => { setFPartner(""); setFRegion1(""); setFRegion2(""); }}
      >
        <div className="md:col-span-2">
          <label htmlFor="fPartner" className="block text-xs font-semibold text-[#6B778C] mb-1.5">파트너 이름</label>
          <Select id="fPartner" value={fPartner} onChange={e => setFPartner(e.target.value)}>
            <option value="">전체</option>
            {partners.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fRegion1" className="block text-xs font-semibold text-[#6B778C] mb-1.5">지역1</label>
          <Select id="fRegion1" value={fRegion1} onChange={e => { setFRegion1(e.target.value); setFRegion2(""); }}>
            <option value="">전체</option>
            {regions1.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fRegion2" className={cn("block text-xs font-semibold mb-1.5", fRegion1 ? "text-[#6B778C]" : "text-[#C1C7CD]")}>지역2</label>
          <Select id="fRegion2" value={fRegion2} onChange={e => setFRegion2(e.target.value)} disabled={!fRegion1} className={!fRegion1 ? "bg-[#F4F5F7]! text-[#C1C7CD] cursor-not-allowed" : ""}>
            <option value="">전체</option>
            {regions2.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </div>
      </FilterPanel>


      <DataTable columns={columns} rows={currentData} rowKey={r => r.id} onRowClick={setSelected} sortConfig={sortConfig} onSort={handleSort} />
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

      <Drawer open={!!selected} title="수행원 상세 (View Only)" onClose={() => setSelected(null)} footer={<Button variant="secondary" onClick={() => setSelected(null)}>닫기</Button>}>
        {selected && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>기본 정보</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Field label="수행원 ID" value={selected.id} />
                <Field label="이름" value={selected.name} />
                <Field label="파트너 이름" value={selected.partner} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>배정된 쏘카존</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-[#172B4D]">{selected.zoneName} ({selected.zoneId})</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>벌점 이력</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Field label="벌점" value={selected.penalty === 0 ? <span className="text-[#94A3B8]">0</span> : <Badge tone="danger">{selected.penalty}</Badge>} />
                {selected.penaltyHistory.length === 0 ? (
                  <div className="text-sm text-[#94A3B8] py-2">벌점 이력이 없습니다.</div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
                    <table className="min-w-full text-sm">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">오더 ID</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">사유</th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#475569]">일자</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {selected.penaltyHistory.map((h, idx) => (
                          <tr key={idx} className="hover:bg-[#F8FAFC]">
                            <td className="px-4 py-2.5">
                              <a
                                href={`?page=orders&orderId=${h.orderId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#0052CC] hover:underline font-medium"
                              >
                                {h.orderId}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </td>
                            <td className="px-4 py-2.5">
                              <Badge tone={h.reason === '노쇼' ? 'danger' : 'warn'}>{h.reason}</Badge>
                            </td>
                            <td className="px-4 py-2.5 text-[#6B778C]">{h.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}
