import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, X, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Clock, Pencil
} from 'lucide-react';
import MOCK_DATA from '../mocks/order-type-policy.json';

// ============== UI Components (from PartnersPage) ==============
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Card = ({ className, children }) => <div className={cn("rounded-xl bg-white border border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.02)]", className)}>{children}</div>;
const CardHeader = ({ className, children }) => <div className={cn("p-5 pb-3", className)}>{children}</div>;
const CardTitle = ({ className, children }) => <div className={cn("text-sm font-bold text-[#172B4D]", className)}>{children}</div>;
const CardContent = ({ className, children }) => <div className={cn("p-5 pt-2", className)}>{children}</div>;

function Button({ className, variant = "default", size = "md", ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants = {
    default: "bg-[#0052CC] text-white hover:bg-[#0047B3] shadow-sm",
    secondary: "bg-white text-[#172B4D] border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-sm text-[#334155]",
    ghost: "bg-transparent text-[#172B4D] hover:bg-[#F4F5F7]",
  };
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-10 px-3.5 text-sm" };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]", className)} {...props} />
));

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn("h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]", className)} {...props}>{children}</select>
));

function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-slate-100 text-slate-800",
    danger: "bg-rose-100 text-rose-800",
    warn: "bg-amber-100 text-amber-800",
    ok: "bg-emerald-100 text-emerald-800",
    info: "bg-blue-100 text-blue-800",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", tones[tone])}>{children}</span>;
}

const Field = ({ label, children, isEditing, value, fullWidth = false, error }) => {
    const baseClass = `flex items-start justify-between gap-3 ${fullWidth ? 'flex-col items-start' : ''}`;
    if (!isEditing) {
        return (
            <div className={`${baseClass} mb-4`}>
                <div className="w-36 shrink-0 text-xs font-semibold text-[#6B778C] pt-2">{label}</div>
                <div className="min-w-0 flex-1 text-sm text-[#172B4D] pt-2 break-words">{value}</div>
            </div>
        );
    }
    return (
        <div className={`${baseClass} mb-2`}>
            <label className={`shrink-0 text-xs font-semibold text-[#6B778C] ${fullWidth ? 'w-full' : 'w-36'}`}>{label}</label>
            <div className="min-w-0 flex-1 w-full">
              {children}
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        </div>
    );
};


function Drawer({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[800px] max-w-full bg-white shadow-2xl flex flex-col">
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
  if (totalPages <= 1) return null;
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
              <th key={c.key} className={cn("whitespace-nowrap px-4 py-3.5 text-[13px] font-semibold text-[#475569] cursor-pointer hover:bg-slate-100", c.align === 'center' && 'text-center')} onClick={() => onSort && onSort(c.key)}>
                <div className={cn("flex items-center gap-1", c.align === 'center' && 'justify-center')}>
                  {c.header}
                  {onSort && (
                    <ArrowUpDown className={cn("h-3 w-3", sortConfig?.key === c.key ? "text-[#0052CC]" : "text-slate-400", sortConfig?.direction === 'desc' && 'rotate-180')} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {rows.length === 0 ? <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[#6B778C]">결과가 없습니다.</td></tr> : rows.map(r => (
            <tr key={rowKey(r)} className="cursor-pointer hover:bg-[#F1F5F9]" onClick={() => onRowClick?.(r)}>
              {columns.map(c => <td key={c.key} className={cn("whitespace-nowrap px-4 py-3.5 text-sm text-[#1E293B]", c.align === 'center' && 'text-center')}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Tabs = ({ children }) => <div className="w-full">{children}</div>;
const TabsList = ({ children }) => <div className="flex border-b border-[#DFE1E6]">{children}</div>;
function TabsTrigger({ value, currentValue, onClick, children }) {
  const active = value === currentValue;
  return (
    <button onClick={() => onClick(value)} className={cn("relative px-4 py-2.5 text-sm font-medium transition-all", active ? "text-[#0052CC]" : "text-[#6B778C] hover:text-[#172B4D]")}>
      {children}
      {active && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#0052CC]" />}
    </button>
  );
}
const TabsContent = ({ value, currentValue, children, className }) => value === currentValue ? <div className={cn("pt-5", className)}>{children}</div> : null;


// ============== Page Specific Components ==============

const getIssuanceTone = (issuance) => {
    if (issuance === 'o') return 'ok';
    if (issuance === 'x') return 'danger';
    return 'default';
};

const WASH_TYPE_SCORES = { "협의": 8, "특수": 7, "내외부": 5, "내부": 4, "외부": 3, "물세차": 2, "라이트": 1 };
const ORDER_DIVISION_SCORES = { "변경": 9, "수시": 8, "긴급": 7, "정규": 5, "특별": 3 };
const ZONE_TYPE_SCORES = { "일반존": 8, "주기세차존": 6, "현장세차 불가존": 4 };
const ORDER_TYPE_SCORES = {
  "위생장애": 2, "고객 피드백(ML)_긴급": 1, "초장기 미세차": 4, "주기세차": 1,
  "고객 피드백(ML)": 3, "반납 사진(ML)": 2, "미션핸들": 1, "특수세차": 2,
  "협의세차": 3, "재세차": 1, "수시세차": 2, "BMW": 4, "랜지로버": 3,
  "포르쉐": 2, "캠핑카": 1, "터미널": 0, "플랜": 0
};

const calculateScore = (policy, allPolicies) => {
    const washTypeScore = WASH_TYPE_SCORES[policy.wash_type] || 0;
    const orderDivisionScore = ORDER_DIVISION_SCORES[policy.order_division] || 0;
    const orderTypeScore = ORDER_TYPE_SCORES[policy.order_type] || 0;
    const zoneTypeScore = ZONE_TYPE_SCORES[policy.zone_type] || 0;
    const bonusPoints = Number(policy.bonusPoints) || 0;

    const totalScore = (washTypeScore * 10000) + (orderDivisionScore * 1000) + (orderTypeScore * 100) + (bonusPoints * 10) + zoneTypeScore;

    const allScores = allPolicies
      .filter(p => p.id !== policy.id)
      .map(p => calculateScore(p, []).totalScore);
    
    allScores.push(totalScore);
    const sortedScores = [...new Set(allScores)].sort((a, b) => b - a);
    const rank = sortedScores.indexOf(totalScore) + 1;

    return { washTypeScore, orderDivisionScore, orderTypeScore, zoneTypeScore, bonusPoints, totalScore, rank };
};


const DetailDrawer = ({ policy, onClose, onSave, policies }) => {
  const isCreating = !policy?.id;
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(isCreating);
  const [formData, setFormData] = useState(policy);
  const [orderTypeNameError, setOrderTypeNameError] = useState(null);

  const scoreData = useMemo(() => calculateScore(formData, policies), [formData, policies]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      order_priority_score: scoreData.totalScore,
      order_priority_rank: scoreData.rank,
    }));
  }, [scoreData]);

  useEffect(() => {
    setFormData(policy);
    setIsEditing(isCreating);
    setOrderTypeNameError(null);
  }, [policy, isCreating]);

  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  const handleOrderTypeChange = (e) => {
    const newName = e.target.value;
    handleFormDataChange('order_type', newName);
    const isDuplicate = policies.some(p => p.order_type === newName && p.id !== formData.id);
    if (isDuplicate) {
      setOrderTypeNameError(`오더 유형명 '${newName}'은(는) 이미 존재합니다.`);
    } else {
      setOrderTypeNameError(null);
    }
  };
  
  const handleSave = () => {
    if (orderTypeNameError) {
      alert("중복된 오더 유형명이 있습니다. 수정 후 저장해주세요.");
      return;
    }
    if (!formData.order_type?.trim()) {
        alert("오더 유형 명칭은 필수입니다.");
        return;
    }

    if (isCreating) {
        onSave(formData);
        onClose();
        return;
    }
    
    const changes = Object.keys(formData).reduce((acc, key) => {
        if (JSON.stringify(formData[key]) !== JSON.stringify(policy[key])) {
            acc.push({ field: key, from: policy[key], to: formData[key] });
        }
        return acc;
    }, []);

    const newHistoryEntry = {
        date: new Date().toISOString(),
        user: 'Ops Admin',
        changes: changes,
    };

    const updatedPolicy = {
        ...formData,
        version: (formData.version || 1) + 1,
        history: [newHistoryEntry, ...(formData.history || [])]
    };

    onSave(updatedPolicy);
    onClose();
  };
  
  const renderValue = (val) => {
    if (val === null || val === undefined || val === "") return "-";
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }

  const handleBlockPolicyChange = (field, value) => {
    setFormData(prev => ({...prev, block_policy: {...(prev.block_policy || {}), [field]: value}}))
  }

  return (
    <Drawer 
      open={!!policy} 
      title={isCreating ? "오더 유형 추가" : `[ID: ${policy.id}] 오더유형 정책 상세`}
      onClose={onClose}
      footer={
        <div className="flex w-full items-center justify-between">
           <div className="text-xs text-gray-500">{!isCreating && `Version: ${policy.version || 1}`}</div>
           <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>닫기</Button>
            {isEditing ? (
              <Button onClick={handleSave} disabled={!!orderTypeNameError}>{isCreating ? "추가하기" : "저장하기"}</Button>
            ) : (
              <Button onClick={() => setIsEditing(true)}>수정하기</Button>
            )}
           </div>
        </div>
      }
    >
      <Tabs>
        <TabsList>
          <TabsTrigger value="details" currentValue={activeTab} onClick={setActiveTab}>상세 정보</TabsTrigger>
          {!isCreating && <TabsTrigger value="history" currentValue={activeTab} onClick={setActiveTab}>변경 이력</TabsTrigger>}
        </TabsList>
        <TabsContent value="details" currentValue={activeTab}>
            <div className="grid grid-cols-2 gap-x-8">
                <Field label="셰어링 유형" isEditing={isEditing} value={formData.sharing_type} ><Input value={formData.sharing_type} onChange={e => handleFormDataChange('sharing_type', e.target.value)} /></Field>
                <Field label="오더구분" isEditing={isEditing} value={formData.order_division}><Input value={formData.order_division} onChange={e => handleFormDataChange('order_division', e.target.value)} /></Field>
                <Field label="세차유형" isEditing={isEditing} value={formData.wash_type}><Input value={formData.wash_type} onChange={e => handleFormDataChange('wash_type', e.target.value)} /></Field>
                <Field label="존유형" isEditing={isEditing} value={formData.zone_type}><Input value={formData.zone_type} onChange={e => handleFormDataChange('zone_type', e.target.value)} /></Field>
                <Field label="발행여부" isEditing={isEditing} value={formData.order_issuance}><Select value={formData.order_issuance} onChange={e => handleFormDataChange('order_issuance', e.target.value)}><option value="o">o</option><option value="x">x</option></Select></Field>
                <Field label="파트너유형" isEditing={isEditing} value={formData.partner_type}><Input value={formData.partner_type} onChange={e => handleFormDataChange('partner_type', e.target.value)} /></Field>
                <Field label="미션등록" isEditing={isEditing} value={formData.mission_registration}><Select value={formData.mission_registration} onChange={e => handleFormDataChange('mission_registration', e.target.value)}><option value="O">O</option><option value="X">X</option></Select></Field>
                <Field label="wait_time" isEditing={isEditing} value={formData.wait_time}><Input type="number" value={formData.wait_time} onChange={e => handleFormDataChange('wait_time', Number(e.target.value))} /></Field>
                <Field label="wait_time 취소" isEditing={isEditing} value={formData.wait_time_cancel}><Select value={formData.wait_time_cancel} onChange={e => handleFormDataChange('wait_time_cancel', e.target.value)}><option value="O">O</option><option value="X">X</option></Select></Field>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <Card className="bg-[#F0F7FF]">
                <CardHeader>
                  <CardTitle>오더 중요도</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-x-8">
                     <Field label="오더 유형 명칭" isEditing={isEditing} value={formData.order_type} error={orderTypeNameError}>
                        <Input value={formData.order_type} onChange={handleOrderTypeChange} />
                    </Field>
                    <Field label="가산점" isEditing={isEditing} value={formData.bonusPoints}><Input type="number" value={formData.bonusPoints || ''} placeholder="0" onChange={e => handleFormDataChange('bonusPoints', e.target.value === '' ? null : Number(e.target.value))} /></Field>
                    <Field label="세차유형 점수" isEditing={false} value={scoreData.washTypeScore} />
                    <Field label="오더구분 점수" isEditing={false} value={scoreData.orderDivisionScore} />
                    <Field label="오더유형 점수" isEditing={false} value={scoreData.orderTypeScore} />
                    <Field label="존유형 점수" isEditing={false} value={scoreData.zoneTypeScore} />
                    <Field label="오더 중요도 총점" isEditing={false} value={scoreData.totalScore} />
                    <Field label="오더 중요도 순위" isEditing={false} value={`${scoreData.rank} 위`} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 pt-6 border-t">
                <CardTitle>블락 정책</CardTitle>
                <div className="grid grid-cols-2 gap-x-8 mt-4">
                    <Field label="블락유형" isEditing={isEditing} value={formData.block_policy?.type}><Input value={formData.block_policy?.type} onChange={e => handleBlockPolicyChange('type', e.target.value)} /></Field>
                    <Field label="블락시간" isEditing={isEditing} value={formData.block_policy?.time}><Input type="number" value={formData.block_policy?.time} onChange={e => handleBlockPolicyChange('time', Number(e.target.value))} /></Field>
                    <Field label="쿠션1" isEditing={isEditing} value={formData.block_policy?.cushion1}><Input type="number" value={formData.block_policy?.cushion1} onChange={e => handleBlockPolicyChange('cushion1', Number(e.target.value))} /></Field>
                    <Field label="핸들러(배차)" isEditing={isEditing} value={formData.block_policy?.handler_dispatch}><Input type="number" value={formData.block_policy?.handler_dispatch} onChange={e => handleBlockPolicyChange('handler_dispatch', Number(e.target.value))} /></Field>
                    <Field label="세차수행시간" isEditing={isEditing} value={formData.block_policy?.wash_time}><Input type="number" value={formData.block_policy?.wash_time} onChange={e => handleBlockPolicyChange('wash_time', Number(e.target.value))} /></Field>
                    <Field label="핸들러(반차)" isEditing={isEditing} value={formData.block_policy?.handler_return}><Input type="number" value={formData.block_policy?.handler_return} onChange={e => handleBlockPolicyChange('handler_return', Number(e.target.value))} /></Field>
                    <Field label="쿠션2" isEditing={isEditing} value={formData.block_policy?.cushion2}><Input type="number" value={formData.block_policy?.cushion2} onChange={e => handleBlockPolicyChange('cushion2', Number(e.target.value))} /></Field>
                </div>
            </div>
             <div className="mt-6 pt-6 border-t">
                <Field label="설명" isEditing={isEditing} value={formData.description} fullWidth>
                     <textarea rows="3" className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm" value={formData.description} onChange={e => handleFormDataChange('description', e.target.value)} />
                </Field>
             </div>
        </TabsContent>
        <TabsContent value="history" currentValue={activeTab}>
            <div className="space-y-4">
                {policy?.history && policy.history.length > 0 ? (
                    policy.history.map((entry, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-slate-50 rounded-r-lg">
                            <div className="font-semibold text-sm text-slate-800">{new Date(entry.date).toLocaleString()} by {entry.user}</div>
                            <ul className="mt-1 list-disc list-inside text-xs text-slate-600 space-y-1">
                                {entry.changes.map((change, cIndex) => (
                                    <li key={cIndex}>
                                        <span className="font-semibold">{change.field}</span> changed from <span className="font-mono bg-red-100 text-red-800 px-1 rounded">{renderValue(change.from)}</span> to <span className="font-mono bg-green-100 text-green-800 px-1 rounded">{renderValue(change.to)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-sm text-slate-500 py-10">변경 이력이 없습니다.</div>
                )}
            </div>
        </TabsContent>
      </Tabs>
    </Drawer>
  );
};


// ============== Main Page Component ==============

export default function OrderTypePolicyPage() {
  const [policies, setPolicies] = useState(() => MOCK_DATA.map(p => ({...p, bonusPoints: p.bonusPoints || 0 })));
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'order_priority_rank', direction: 'asc' });

  const sortedData = useMemo(() => {
    const dataWithScores = policies.map(p => {
        const scores = calculateScore(p, policies);
        return {
            ...p,
            order_priority_score: scores.totalScore,
            order_priority_rank: scores.rank,
        };
    });

    if (!sortConfig.key) return dataWithScores;
    
    return [...dataWithScores].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key.includes('score') || sortConfig.key.includes('rank')) {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
      } else {
          aVal = aVal || "";
          bVal = bVal || "";
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [policies, sortConfig]);

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 15);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  const handleCreate = () => {
    setSelectedPolicy({
        id: null,
        sharing_type: "",
        order_division: "",
        order_type: "",
        wash_type: "",
        zone_type: "",
        order_issuance: "o",
        bonusPoints: 0,
        partner_type: "",
        block_policy: {
            type: "",
            time: 0,
            cushion1: 0,
            handler_dispatch: 0,
            wash_time: 0,
            handler_return: 0,
            cushion2: 0
        },
        mission_registration: "X",
        wait_time: 0,
        wait_time_cancel: "X",
        description: "",
        version: 1,
        history: []
    });
  };

  const handleSave = (policyToSave) => {
    if (policyToSave.id) { // Update
        setPolicies(prev => prev.map(p => p.id === policyToSave.id ? policyToSave : p));
    } else { // Create
        const newPolicy = {
            ...policyToSave,
            id: Math.max(...policies.map(p => p.id)) + 1, // Simple ID generation
        }
        setPolicies(prev => [newPolicy, ...prev]);
    }
  };

  const columns = [
    { key: 'sharing_type', header: '셰어링 유형' },
    { key: 'order_division', header: '오더구분' },
    { key: 'order_type', header: '오더유형' },
    { key: 'wash_type', header: '세차유형' },
    { key: 'zone_type', header: '존유형' },
    { key: 'order_issuance', header: '발행여부', align: 'center', render: r => <Badge tone={getIssuanceTone(r.order_issuance)}>{r.order_issuance}</Badge> },
    { key: 'order_priority_rank', header: '오더 중요도 순위', align: 'center' },
    { key: 'partner_type', header: '파트너유형' },
    { key: 'block_policy', header: '블락유형', render: r => r.block_policy?.type || '-' },
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
            <h1 className="text-base font-bold text-[#172B4D]">오더유형 정책 관리</h1>
            <p className="mt-1 text-sm text-[#6B778C]">오더 발행의 기준이 되는 오더 유형별 상세 정책을 관리합니다.</p>
        </div>
        <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            오더 유형 추가
        </Button>
      </div>

      
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-[#6B778C]">전체 <b className="text-[#172B4D]">{totalItems.toLocaleString()}</b>건</div>
      </div>
      
      <DataTable 
        columns={columns} 
        rows={currentData} 
        rowKey={r => r.id} 
        onRowClick={setSelectedPolicy} 
        sortConfig={sortConfig} 
        onSort={handleSort} 
      />
      
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {selectedPolicy && (
        <DetailDrawer
          policy={selectedPolicy}
          policies={policies}
          onClose={() => setSelectedPolicy(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
