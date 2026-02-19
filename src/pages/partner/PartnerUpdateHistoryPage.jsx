import { useState, useMemo, useEffect } from 'react';
import {
  ExternalLink, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { PARTNER_HISTORY } from '../../constants/updateHistory';

function cn(...classes) { return classes.filter(Boolean).join(" "); }

function Card({ className, children }) {
  return <div className={cn("rounded-xl bg-white border border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.02)]", className)}>{children}</div>;
}
function Button({ className, variant = "default", size = "md", ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants = {
    default: "bg-[#10B981] text-white hover:bg-[#059669] shadow-sm",
    secondary: "bg-white text-[#172B4D] border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-sm text-[#334155]",
    ghost: "bg-transparent text-[#172B4D] hover:bg-[#F4F5F7]",
  };
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-10 px-3.5 text-sm" };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

function usePagination(data, itemsPerPage = 40) {
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => setCurrentPage(1), [data]);
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const currentData = useMemo(() => data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [data, currentPage, itemsPerPage]);
  return { currentPage, setCurrentPage, totalPages, currentData, totalItems };
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 0) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <Button variant="ghost" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
      {pages.map(p => (
        <Button key={p} variant={p === currentPage ? "default" : "ghost"} size="sm" className={cn("w-8 h-8 p-0", p !== currentPage && "font-normal text-[#6B778C]")} onClick={() => onPageChange(p)}>{p}</Button>
      ))}
      <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
    </div>
  );
}

function DataTable({ columns, rows, rowKey, sortConfig, onSort }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
      <table className="min-w-full bg-white text-left text-sm">
        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <tr>
            {columns.map(c => (
              <th key={c.key} className="whitespace-nowrap px-4 py-3.5 text-[13px] font-semibold text-[#475569] cursor-pointer hover:bg-slate-100" onClick={() => onSort && onSort(c.key)}>
                <div className="flex items-center gap-1">
                  {c.header}
                  {sortConfig?.key === c.key && (
                    <ArrowUpDown className={cn("h-3 w-3", sortConfig.direction === 'asc' ? "text-[#10B981]" : "text-[#10B981] rotate-180")} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {rows.length === 0 ? <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[#6B778C]">결과가 없습니다.</td></tr> : rows.map(r => (
            <tr key={rowKey(r)} className="hover:bg-[#F8FAFC]">
              {columns.map(c => <td key={c.key} className="whitespace-nowrap px-4 py-3.5 text-sm text-[#1E293B]">{typeof c.render === "function" ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PartnerUpdateHistoryPage() {
  const [showPolicyOnly, setShowPolicyOnly] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const filteredHistory = useMemo(() => {
    let data = [...PARTNER_HISTORY].sort((a, b) => b.id - a.id);
    if (showPolicyOnly) {
      data = data.filter((item) => item.isPolicyChange);
    }
    return data;
  }, [showPolicyOnly]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredHistory;
    return [...filteredHistory].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredHistory, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 py-2">
        <input
          type="checkbox"
          id="partnerPolicyFilter"
          className="h-4 w-4 rounded border-gray-300 text-[#10B981] focus:ring-[#10B981]"
          checked={showPolicyOnly}
          onChange={(e) => setShowPolicyOnly(e.target.checked)}
        />
        <label htmlFor="partnerPolicyFilter" className="text-sm text-[#172B4D] cursor-pointer select-none">
          제품 정책 변경 건만 보기
        </label>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-[#6B778C]">전체 건수 <b className="text-[#172B4D]">{totalItems.toLocaleString()}</b>건</div>
        <div className="text-xs text-[#6B778C]">현재 페이지 ({currentPage}/{totalPages})</div>
      </div>

      <Card>
        <DataTable
          columns={[
            { key: "id", header: "ID" },
            { key: "date", header: "일시", render: (r) => {
              const d = new Date(r.date.replace(' ', 'T'));
              const days = ['일', '월', '화', '수', '목', '금', '토'];
              const formatted = `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}(${days[d.getDay()]}) ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
              return <span className="font-medium text-[#172B4D]">{formatted}</span>;
            }},
            { key: "content", header: "변경내용" },
            {
              key: "isPolicyChange",
              header: "제품 정책 변경",
              render: (r) => r.isPolicyChange ? <span className="font-bold text-[#10B981]">해당</span> : null
            },
            {
              key: "links",
              header: "링크",
              render: (r) => (
                <div className="flex gap-2">
                  {r.links && r.links.map((link, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-[#10B981]"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/?admin=partner&page=${link.page}`, "_blank");
                      }}
                    >
                      {link.label} <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  ))}
                </div>
              ),
            },
          ]}
          rows={currentData}
          rowKey={(r) => r.id}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Card>
    </div>
  );
}
