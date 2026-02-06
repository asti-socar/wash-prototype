import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  cn,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Select,
  Field,
  Drawer,
  usePagination,
  DataTable,
  FilterPanel,
  Chip,
} from '../components/ui';

export default function WorkersPage() {
  const [workers, setWorkers] = useState([
    { id: 'W-001', name: '최수행', partner: 'A파트너', zoneName: '강남역 1번존', zoneId: 'Z-1001', region1: '서울', region2: '강남', score: 95 },
    { id: 'W-002', name: '강수행', partner: 'B파트너', zoneName: '잠실역 2번존', zoneId: 'Z-1002', region1: '서울', region2: '송파', score: 88 },
    { id: 'W-003', name: '한수행', partner: 'C파트너', zoneName: '판교 1번존', zoneId: 'Z-2001', region1: '경기', region2: '성남', score: 92 },
    { id: 'W-004', name: '오수행', partner: 'D파트너', zoneName: '해운대 2번존', zoneId: 'Z-3002', region1: '부산', region2: '해운대', score: 98 },
  ]);

  const [selected, setSelected] = useState(null);
  const [fRegion1, setFRegion1] = useState("");
  const [fRegion2, setFRegion2] = useState("");
  const [fPartner, setFPartner] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
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
    { key: 'name', header: '이름' },
    { key: 'partner', header: '소속 파트너사' },
    { key: 'region1', header: '지역1' },
    { key: 'region2', header: '지역2' },
    { key: 'zoneName', header: '배정된 쏘카존' },
    { key: 'score', header: '수행 점수', align: 'center' },
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
          <label htmlFor="fRegion2" className="block text-xs font-semibold text-[#6B778C] mb-1.5">지역2</label>
          <Select id="fRegion2" value={fRegion2} onChange={e => setFRegion2(e.target.value)}>
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
                <Field label="이름" value={selected.name} />
                <Field label="소속 파트너사" value={selected.partner} />
                <Field label="수행 점수" value={`${selected.score}점`} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>배정된 쏘카존</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-[#172B4D]">{selected.zoneName} ({selected.zoneId})</div>
              </CardContent>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}
