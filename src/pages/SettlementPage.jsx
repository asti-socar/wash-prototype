import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, ArrowUpDown, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';

/**
 * Utility & UI Components
 */
function cn(...classes) { return classes.filter(Boolean).join(" "); }

function Card({ className, children }) {
  return <div className={cn("rounded-xl bg-white border border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.02)]", className)}>{children}</div>;
}
function CardHeader({ className, children }) {
  return <div className={cn("p-5 pb-3", className)}>{children}</div>;
}
function CardTitle({ className, children }) {
  return <div className={cn("text-sm font-bold text-[#172B4D]", className)}>{children}</div>;
}
function CardContent({ className, children }) {
  return <div className={cn("p-5 pt-2", className)}>{children}</div>;
}
function Button({ className, variant = "default", size = "md", ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants = {
    default: "bg-[#0052CC] text-white hover:bg-[#0047B3] shadow-sm",
    secondary: "bg-white text-[#172B4D] border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-sm text-[#334155]",
    ghost: "bg-transparent text-[#172B4D] hover:bg-[#F4F5F7]",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-10 px-3.5 text-sm" };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
function Input({ className, ...props }) {
  return <input className={cn("h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]", className)} {...props} />;
}
function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-slate-100 text-slate-800",
    danger: "bg-rose-100 text-rose-800",
    warn: "bg-amber-100 text-amber-800",
    ok: "bg-emerald-100 text-emerald-800",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", tones[tone])}>{children}</span>;
}
function Field({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="w-36 shrink-0 text-xs font-semibold text-[#6B778C]">{label}</div>
      <div className="min-w-0 flex-1 text-sm text-[#172B4D]">{value}</div>
    </div>
  );
}

function Drawer({ open, title, onClose, children, footer }) {
  const [width, setWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('drawer-open');
    } else {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('drawer-open');
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('drawer-open');
    };
  }, [open]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 400 && newWidth <= 1200) setWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
    };
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    };
  }, [isResizing]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full bg-white shadow-2xl flex flex-col" style={{ width }}>
        <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#0052CC] transition-colors z-50" onMouseDown={() => setIsResizing(true)} />
        <div className="flex h-16 items-center justify-between border-b border-[#DFE1E6] px-6 shrink-0">
          <div className="text-lg font-bold text-[#172B4D]">{title}</div>
          <button onClick={onClose}><X className="h-6 w-6 text-gray-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        <div className="flex h-[72px] items-center justify-end gap-2 border-t border-[#DFE1E6] px-6 bg-[#F4F5F7] shrink-0">{footer}</div>
      </div>
    </div>
  );
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

function DataTable({ columns, rows, onRowClick, rowKey, sortConfig, onSort }) {
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
                    <ArrowUpDown className={cn("h-3 w-3", sortConfig.direction === 'asc' ? "text-[#0052CC]" : "text-[#0052CC] rotate-180")} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {rows.length === 0 ? <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[#6B778C]">결과가 없습니다.</td></tr> : rows.map(r => (
            <tr key={rowKey(r)} className={cn(onRowClick ? "cursor-pointer hover:bg-[#F1F5F9]" : "hover:bg-[#F8FAFC]")} onClick={() => onRowClick?.(r)}>
              {columns.map(c => <td key={c.key} className="whitespace-nowrap px-4 py-3.5 text-sm text-[#1E293B]">{typeof c.render === "function" ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SettlementPage() {
  const [items, setItems] = useState([
    { id: "A-1001", orderId: "O-90012", plate: "34나7890", model: "K5", zoneName: "잠실역 2번존", partner: "B파트너", requestedAt: "2026-01-12 10:30", approvalType: "1단계 승인", requestType: "현장 변경(내부→내외부)", status: "요청", cost: 15000, reason: "오염도 심각으로 인한 세차 유형 상향", requestComment: "조수석 시트 및 바닥 오염 심각합니다. 첨부 사진 확인 부탁드립니다.", rejectComment: null, washItems: ["내부세차", "특수오염제거"] },
    { id: "A-1002", orderId: "O-90008", plate: "90마5566", model: "스포티지", zoneName: "수원역 2번존", partner: "B파트너", requestedAt: "2026-01-11 14:20", approvalType: "1단계 승인", requestType: "현장 변경(라이트→내외부)", status: "수락", cost: 10000, reason: "현장 세차 유형 업그레이드", requestComment: "유아 카시트 음식물 오염으로 분리 세척 필요합니다.", rejectComment: null, washItems: ["카시트세척"] },
    { id: "A-1003", orderId: "O-90005", plate: "55차5656", model: "EV6", zoneName: "광주 1번존", partner: "A파트너", requestedAt: "2026-01-10 09:15", approvalType: "2단계 승인", requestType: "입고 변경(내외부→특수)", status: "거절", cost: 20000, reason: "입고 세차 유형 변경 (특수)", requestComment: "외부 스크래치가 많아 광택 작업 요청드립니다.", rejectComment: "광택 작업은 세차 서비스 범위에 포함되지 않습니다. 별도 외부 업체 이용 바랍니다.", washItems: ["광택"] },
    { id: "A-1004", orderId: "O-90003", plate: "12가3456", model: "아반떼", zoneName: "강남역 1번존", partner: "C파트너", requestedAt: "2026-01-09 16:45", approvalType: "1단계 승인", requestType: "전환(현장→입고)", status: "요청", cost: 8000, reason: "현장 세차 → 입고(특수) 세차 변경", requestComment: "진흙 오염이 심해 현장에서 처리가 어렵습니다.", rejectComment: null, washItems: ["특수오염제거"] },
    { id: "A-1005", orderId: "O-90001", plate: "78다9012", model: "쏘나타", zoneName: "판교역 3번존", partner: "A파트너", requestedAt: "2026-01-08 11:20", approvalType: "2단계 승인", requestType: "입고 변경(내외부→협의)", status: "수락", cost: 35000, reason: "입고 세차 유형 변경 (협의)", requestComment: "엔진룸 오일 누출로 특수 약품 처리 필요합니다.", rejectComment: null, washItems: ["엔진룸세척", "특수약품처리"] },
  ]);

  const [selected, setSelected] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'orderId', direction: 'desc' });
  const [statusFilter, setStatusFilter] = useState("전체");
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const columns = [
    { key: "orderId", header: "오더 ID" },
    { key: "plate", header: "차량 번호" },
    { key: "model", header: "차종" },
    { key: "zoneName", header: "존 이름" },
    { key: "partner", header: "파트너 명" },
    { key: "requestedAt", header: "요청 시간" },
    { key: "approvalType", header: "합의 유형" },
    { key: "requestType", header: "요청 유형" },
    {
      key: "status",
      header: "상태",
      render: (r) => {
        const tone = r.status === "요청" ? "warn" : r.status === "수락" ? "ok" : r.status === "거절" ? "danger" : "default";
        return <Badge tone={tone}>{r.status}</Badge>;
      },
    },
  ];

  const handleUpdateStatus = (newStatus, rejectCommentText = "") => {
    if (!selected) return;
    setItems((prev) =>
      prev.map((it) => (it.id === selected.id ? { ...it, status: newStatus, rejectComment: newStatus === "거절" ? rejectCommentText : it.rejectComment } : it))
    );
    setSelected(null);
    setIsRejecting(false);
    setRejectReason("");
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = items;
    if (statusFilter !== "전체") {
      filtered = items.filter(item => item.status === statusFilter);
    }
    if (!sortConfig.key) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortConfig, statusFilter]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(filteredAndSortedData, 40);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">합의 요청 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">현장 추가 요금 및 특수 세차 합의 요청 건 처리</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#6B778C]">상태</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
          >
            <option value="전체">전체</option>
            <option value="요청">요청</option>
            <option value="수락">수락</option>
            <option value="거절">거절</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} rows={currentData} rowKey={(r) => r.id} onRowClick={setSelected} sortConfig={sortConfig} onSort={handleSort} />
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
        title={selected ? `합의 요청 상세 - ${selected.id}` : ""}
        onClose={() => { setSelected(null); setIsRejecting(false); }}
        footer={
          selected?.status === "요청" ? (
            <>
              <Button variant="secondary" onClick={() => setIsRejecting(true)}>반려</Button>
              <Button onClick={() => handleUpdateStatus("수락")}>승인</Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setSelected(null)}>닫기</Button>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>요청 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[#172B4D]">
                <Field label="오더 ID" value={selected.orderId} />
                <Field label="차량 번호" value={`${selected.plate} (${selected.model})`} />
                <Field label="파트너 명" value={selected.partner} />
                <Field label="합의 유형" value={<Badge tone={selected.approvalType === "1단계 승인" ? "ok" : "warn"}>{selected.approvalType}</Badge>} />
                <Field label="요청 유형" value={selected.requestType} />
                <Field label="요청 사유" value={selected.reason} />
                <Field label="세차 항목" value={selected.washItems.join(", ")} />
                <div className="flex items-center justify-between gap-3">
                  <div className="w-36 shrink-0 text-xs font-semibold text-[#6B778C]">청구 금액</div>
                  <Input
                    type="number"
                    className="h-8 w-32 text-right"
                    defaultValue={selected.cost}
                    disabled={selected.status !== "요청"}
                  />
                </div>
                <Field label="요청 코멘트" value={selected.requestComment || '-'} />
                {selected.status === '거절' && (
                  <Field label="반려 코멘트" value={<span className="text-rose-600">{selected.rejectComment || '-'}</span>} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>현장 사진</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-32 w-full items-center justify-center rounded-lg bg-[#F4F5F7] text-[#6B778C]">
                  <span className="text-xs">이미지 미리보기 (Placeholder)</span>
                </div>
              </CardContent>
            </Card>

            {isRejecting && (
              <Card className="ring-rose-200">
                <CardHeader>
                  <CardTitle className="text-rose-700">반려 사유 입력</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="반려 사유를 입력하세요"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsRejecting(false)}>취소</Button>
                    <Button variant="danger" onClick={() => handleUpdateStatus("거절", rejectReason)}>반려 확정</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}