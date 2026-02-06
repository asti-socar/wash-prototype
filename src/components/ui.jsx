import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronRight,
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
  ArrowUpDown,
} from "lucide-react";

/**
 * util
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatPercent(v) {
  if (typeof v !== "number") return "-";
  return `${Math.round(v * 100)}%`;
}

export function toYmd(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Custom hook to detect mobile screen size
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's 'md' breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
}

/**
 * shadcn-ish minimal UI (Tailwind only)
 */
export function Card({ className, children }) {
  return (
    <div className={cn("rounded-xl bg-white border border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.02)]", className)}>
      {children}
    </div>
  );
}
export function CardHeader({ className, children }) {
  return <div className={cn("p-5 pb-3", className)}>{children}</div>;
}
export function CardTitle({ className, children }) {
  return <div className={cn("text-sm font-bold text-[#172B4D]", className)}>{children}</div>;
}
export function CardDescription({ className, children }) {
  return <div className={cn("mt-1 text-xs text-[#6B778C]", className)}>{children}</div>;
}
export function CardContent({ className, children }) {
  return <div className={cn("p-5 pt-2", className)}>{children}</div>;
}
export function Button({ className, variant = "default", size = "md", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants = {
    default: "bg-[#0052CC] text-white hover:bg-[#0047B3] shadow-sm",
    secondary: "bg-white text-[#172B4D] border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-sm text-[#334155]",
    ghost: "bg-transparent text-[#172B4D] hover:bg-[#F4F5F7]",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    outline: "bg-white border border-[#DFE1E6] text-[#172B4D] hover:bg-[#F4F5F7]",
  };
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-3.5 text-sm",
    lg: "h-11 px-4 text-sm",
  };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8]",
        "focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]",
        className
      )}
      {...props}
    />
  );
}
export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition",
        "focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
export function PillTabs({ value, onChange, items }) {
  return (
    <div className="inline-flex rounded-lg bg-[#F4F5F7] p-1 border border-[#DFE1E6]">
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={cn(
              "h-8 rounded-md px-3 text-sm transition font-medium",
              active ? "bg-white text-[#0052CC] shadow-sm" : "text-[#6B778C] hover:text-[#172B4D]"
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
export function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-slate-100 text-slate-800",
    danger: "bg-rose-100 text-rose-800",
    warn: "bg-amber-100 text-amber-800",
    ok: "bg-emerald-100 text-emerald-800",
    info: "bg-blue-100 text-blue-800",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", tones[tone])}>
      {children}
    </span>
  );
}
export function FilterPanel({ children, chips, onReset }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>조회 조건 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
          {children}
          <div className="md:col-span-12 flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap gap-2">
              {chips}
            </div>
            <Button variant="secondary" onClick={onReset}>
              설정 초기화
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export function Chip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-[#F4F5F7] px-2 py-1 text-xs font-medium text-[#172B4D] border border-[#DFE1E6]">
      {children}
      {onRemove ? (
        <button className="rounded-full p-0.5 hover:bg-[#DFE1E6]" onClick={onRemove} aria-label="remove">
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </span>
  );
}

/**
 * Drawer
 */
export function Drawer({ open, title, subtitle, onClose, children, footer }) {
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
      const minWidth = window.innerWidth * 0.3;
      const maxWidth = window.innerWidth * 0.9;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
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
    <>
      <div
        className="fixed top-0 left-0 w-full h-screen bg-black/30 z-[1000]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed top-0 right-0 h-full bg-white shadow-2xl flex flex-col z-[1001]"
        style={{ width, maxWidth: "100vw" }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#0052CC] transition-colors z-50"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        />
        <div className="flex h-16 items-center justify-between border-b border-[#DFE1E6] px-6 shrink-0">
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-[#0052CC]">{title}</div>
            <div className="truncate text-xs text-[#6B778C]">{subtitle || '우측 Drawer 상세'}</div>
          </div>
          <button
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        <div className="flex h-[72px] items-center justify-end gap-2 border-t border-[#DFE1E6] px-6 bg-[#F4F5F7] shrink-0">
          {footer}
        </div>
      </div>
    </>
  );
}

/**
 * Accordion (for Sidebar)
 */
export function Accordion({ type, children, ...props }) {
  return <div {...props}>{children}</div>;
}

export function AccordionItem({ value, children }) {
  return <div className="border-b border-transparent">{children}</div>;
}

export function AccordionTrigger({ children, isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-[#B3BAC5] transition-all hover:bg-[#0052CC] hover:text-white hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {children}
      </div>
      <ChevronRight
        className={cn(
          "h-4 w-4 shrink-0 text-[#8993A4] transition-transform duration-200 group-hover:text-white",
          isOpen && "rotate-90"
        )}
      />
    </button>
  );
}

export function AccordionContent({ children, isOpen }) {
  return (
    <div className={cn("overflow-hidden text-sm transition-all", isOpen ? "max-h-96" : "max-h-0")}>
      <div className="pt-1 pb-2 pl-6">{children}</div>
    </div>
  );
}

/**
 * Pagination Components & Hooks
 */
export function usePagination(data, itemsPerPage = 40) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  return { currentPage, setCurrentPage, totalPages, currentData, totalItems };
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 0) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <Button variant="ghost" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pages.map(p => (
        <Button
          key={p}
          variant={p === currentPage ? "default" : "ghost"}
          size="sm"
          className={cn("w-8 h-8 p-0", p === currentPage ? "" : "font-normal text-[#6B778C]")}
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}

      <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

/**
 * Table (simple)
 */
export function DataTable({ columns, rows, onRowClick, rowKey, sortConfig, onSort }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
      <table className="min-w-full bg-white text-left text-sm">
        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <tr>
            {columns.map((c) => (
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
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[#6B778C]">
                결과가 없습니다.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr
                key={rowKey(r)}
                className={cn(
                  onRowClick ? "cursor-pointer hover:bg-[#F1F5F9]" : "hover:bg-[#F8FAFC]"
                )}
                onClick={() => onRowClick?.(r)}
              >
                {columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-4 py-3.5 text-sm text-[#1E293B]">
                    {typeof c.render === "function" ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Tabs Components
 */
export function Tabs({ value, onValueChange, children }) {
  return <div className="w-full space-y-4">{children}</div>;
}

export function TabsList({ children, className }) {
  return <div className={cn("flex border-b border-[#DFE1E6]", className)}>{children}</div>;
}

export function TabsTrigger({ value, currentValue, onClick, children }) {
  const active = value === currentValue;
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        "relative px-4 py-2.5 text-sm font-medium transition-all",
        active ? "text-[#0052CC]" : "text-[#6B778C] hover:text-[#172B4D]"
      )}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#0052CC]" />
      )}
    </button>
  );
}

export function TabsContent({ value, currentValue, children, className }) {
  if (value !== currentValue) return null;
  return (
    <div className={cn("animate-in fade-in slide-in-from-bottom-1 duration-200", className)}>{children}</div>
  );
}

export function Field({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="w-36 shrink-0 text-xs font-semibold text-[#6B778C]">{label}</div>
      <div className="min-w-0 flex-1 text-sm text-[#172B4D]">{value}</div>
    </div>
  );
}
