import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, X, ArrowUpDown, FileDown, HelpCircle
} from 'lucide-react';
import MOCK_DATA from '../mocks/order-type-policy.json';

// ============== Constants ==============

const SHARING_TYPES = ["단기", "시승"];

const ORDER_DIVISIONS = ["정규", "변경", "수시", "특별", "긴급"];

const WASH_TYPES = ["협의", "특수", "내외부", "내부", "외부", "물세차", "라이트"];

const ZONE_TYPES = ["일반존", "주기세차존", "현장세차 불가존", "시승존", "캠핑카"];

const PARTNER_TYPES = ["현장", "입고"];

const BLOCK_TYPES = ["세차블락", "장애블락"];

const YN_OPTIONS = ["Y", "N"];



const WASH_TYPE_SCORES = { "협의": 8, "특수": 7, "내외부": 5, "내부": 4, "외부": 3, "물세차": 2, "라이트": 1 };

const ORDER_DIVISION_SCORES = { "변경": 9, "수시": 8, "긴급": 7, "정규": 5, "특별": 3 };

const ZONE_TYPE_SCORES = { "일반존": 8, "주기세차존": 6, "현장세차 불가존": 4, "시승존": 5, "캠핑카": 5 };



const HELP_TEXTS = {



  wash_type: "점수: 협의(8), 특수(7), 내외부(5), 내부(4), 외부(3), 물세차(2), 라이트(1)",



  order_division: "점수: 변경(9), 수시(8), 긴급(7), 정규(5), 특별(3)",



  zone_type: "점수: 일반존(8), 주기세차존(6), 현장세차 불가존(4), 시승존/캠핑카(0)",



  order_type_score: "동일 오더 구분 그룹 내 우선순위를 결정하는 1~9 사이의 값입니다.",



  bonus_points: "기본 점수 외에 운영 판단에 따라 부여하는 추가 점수입니다. (1점당 총점 10점 가산)",



  total_score: "공식: (세차*10000) + (구분*1000) + (유형점수*100) + (가산점*10) + 존유형",



  total_block_time: "총 블락 시간 = 쿠션(전) + 핸들러(배차) + 세차수행시간 + 쿠션(후) + 핸들러(반차)",



  wait_time: "오더 발행 전 대기하는 시간(시간 단위)입니다.",



  partner_type: "존유형과 세차 유형의 조합에 의해 자동으로 결정됩니다. (현장세차 불가존 혹은 특수/협의 세차 시 '입고'로 자동 전환)"



};















// ============== UI Components ==============







function cn(...classes) {







  return classes.filter(Boolean).join(" ");







}















const Tooltip = ({ content, children }) => {







  const [isHovered, setIsHovered] = useState(false);







  return (







    <div 



      className="relative flex items-center"



      onMouseEnter={() => setIsHovered(true)}



      onMouseLeave={() => setIsHovered(false)}



    >



      {children}



      {isHovered && (



        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs z-10">



            <div className="bg-slate-800 text-white text-xs rounded-lg py-1.5 px-3 shadow-lg">



              {content}



            </div>



        </div>



      )}



    </div>



  );



};























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



  <input ref={ref} className={cn("h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] disabled:bg-slate-100 disabled:text-slate-500", className)} {...props} />



));















const Select = React.forwardRef(({ className, children, ...props }, ref) => (



  <select ref={ref} className={cn("h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] disabled:bg-slate-100", className)} {...props}>{children}</select>



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















const Field = ({ label, children, error, fullWidth = false, tooltip }) => (



    <div className={`mb-2 ${fullWidth ? 'flex flex-col items-start' : 'grid grid-cols-3 items-center'}`}>



        <div className="flex items-center gap-1.5 col-span-1">



          <label className="text-xs font-semibold text-[#6B778C]">{label}</label>



          {tooltip && (



            <Tooltip content={tooltip}>



              <HelpCircle className="h-[14px] w-[14px] text-[#6B778C] cursor-help" />



            </Tooltip>



          )}



        </div>



        <div className="col-span-2 w-full">



            {children}



            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}



        </div>



    </div>



);















function Drawer({ open, title, onClose, children, footer }) {



  useEffect(() => {



    if (open) document.body.style.overflow = 'hidden';



    else document.body.style.overflow = 'auto';



    return () => { document.body.style.overflow = 'auto'; };



  }, [open]);















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















function DataTable({ columns, rows, onRowClick, rowKey, sortConfig, onSort }) {



  return (



    <div className="overflow-y-auto rounded-xl border border-[#E2E8F0] h-[calc(100vh-280px)]">



      <table className="min-w-full bg-white text-left text-sm">



        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] sticky top-0 z-10">



          <tr>



            {columns.map(c => (



              <th key={c.key} className={cn("whitespace-nowrap px-4 py-3.5 text-[13px] font-semibold text-[#475569]", c.sortable && "cursor-pointer hover:bg-slate-100", c.align === 'center' && 'text-center')} onClick={() => c.sortable && onSort && onSort(c.key)}>



                <div className={cn("flex items-center gap-1", c.align === 'center' && 'justify-center')}>



                  {c.header}



                  {c.sortable && <ArrowUpDown className={cn("h-3 w-3", sortConfig?.key === c.key ? "text-[#0052CC]" : "text-[#C1C7CD]")} />}



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







const calculatePartnerType = (zoneType, washType) => {



  if (zoneType === '현장세차 불가존' || washType === '특수' || washType === '협의') {



    return '입고';



  }



  return '현장';



};















const generateApiSchema = (policy) => JSON.stringify({



  "wash_type_policy": {



    "id": policy.id,



    "name": policy.order_type_name,



    "sharing_type": policy.sharing_type,



    "order_division": policy.order_division,



    "wash_type": policy.wash_type,



    "zone_type": policy.zone_type,



    "score_details": {



      "total_score": calculateTotalScore(policy),



      "wash_type_score": WASH_TYPE_SCORES[policy.wash_type] || 0,



      "order_division_score": ORDER_DIVISION_SCORES[policy.order_division] || 0,



      "order_type_score": Number(policy.order_type_score) || 0,



      "bonus_points": Number(policy.bonus_points) || 0,



      "zone_type_score": ZONE_TYPE_SCORES[policy.zone_type] || 0



    }



  }



}, null, 2);















const calculateTotalScore = (policy) => {



    const washTypeScore = WASH_TYPE_SCORES[policy.wash_type] || 0;



    const orderDivisionScore = ORDER_DIVISION_SCORES[policy.order_division] || 0;



    const orderTypeScore = Number(policy.order_type_score) || 0;



    const bonusPoints = Number(policy.bonus_points) || 0;



    const zoneTypeScore = ZONE_TYPE_SCORES[policy.zone_type] || 0;



    return (washTypeScore * 10000) + (orderDivisionScore * 1000) + (orderTypeScore * 100) + (bonusPoints * 10) + zoneTypeScore;



};















const getIssuanceTone = (issuance) => {



    if (issuance === 'Y') return 'ok';



    if (issuance === 'N') return 'danger';



    return 'default';



};















const DetailDrawer = ({ policy, onClose, onSave, policies, mode }) => {















  const isCreating = mode === 'create';















  const [isEditing, setIsEditing] = useState(isCreating);















  const [activeTab, setActiveTab] = useState("details");















  const [formData, setFormData] = useState(null);















  const [errors, setErrors] = useState({});















  const [apiSchema, setApiSchema] = useState("");































  const ReadOnlyValue = ({ children, className }) => (















    <div className={cn("h-10 flex items-center px-3 text-sm text-[#172B4D] bg-slate-50 rounded-lg w-full", className)}>















      {renderValue(children)}















    </div>















  );































  useEffect(() => {















    const initialData = {















      cushion_before: 0,















      handler_dispatch: 0,















      wash_time: 0,















      cushion_after: 0,















      handler_return: 0,















      total_block_time: 0,















      ...policy,















    };















    if (policy && policy.total_block_time === undefined) {















        initialData.total_block_time = 















            (initialData.cushion_before || 0) +















            (initialData.handler_dispatch || 0) +















            (initialData.wash_time || 0) +















            (initialData.cushion_after || 0) +















            (initialData.handler_return || 0);















    }















    setFormData(initialData);















    setApiSchema(generateApiSchema(initialData));















    setErrors({});















    if (mode === 'edit') {















      setIsEditing(false);















    } else {















      setIsEditing(true);















    }















  }, [policy, mode]);































  useEffect(() => {















    if (!formData || !isEditing) return;















    const newPartnerType = calculatePartnerType(formData.zone_type, formData.wash_type);















    if (newPartnerType !== formData.partner_type) {















      handleFormDataChange('partner_type', newPartnerType);















    }















  }, [formData?.zone_type, formData?.wash_type, isEditing]);































  const allPoliciesWithScores = useMemo(() =>















    policies.map(p => ({ ...p, total_score: calculateTotalScore(p) }))















  , [policies]);































  const { totalScore, rank } = useMemo(() => {















    if (!formData) return { totalScore: 0, rank: null };















    const currentTotalScore = calculateTotalScore(formData);















    const otherPolicies = policies.filter(p => p.id !== formData.id);















    const allScores = otherPolicies.map(p => calculateTotalScore(p));















    















    const tempSorted = [...new Set([...allScores, currentTotalScore])].sort((a,b) => b-a);















    const currentRank = tempSorted.indexOf(currentTotalScore) + 1;































    return { totalScore: currentTotalScore, rank: currentRank };















  }, [formData, policies]);















  















  useEffect(() => {















    if (!formData) return;















    const newSchema = generateApiSchema(formData);















    if(apiSchema !== newSchema) {















      setApiSchema(newSchema);















    }















  }, [formData]);































  const handleFormDataChange = (field, value) => {















    setFormData(prev => ({ ...prev, [field]: value }));















    if (errors[field]) {















      setErrors(prev => ({ ...prev, [field]: null }));















    }















  };































  const handleBlockTimeChange = (field, value) => {















    const numericValue = Number(value) || 0;















    setFormData(prev => {















      const newBlockTimes = { ...prev, [field]: numericValue };















      const total =















        (newBlockTimes.cushion_before || 0) +















        (newBlockTimes.handler_dispatch || 0) +















        (newBlockTimes.wash_time || 0) +















        (newBlockTimes.cushion_after || 0) +















        (newBlockTimes.handler_return || 0);















      return { ...newBlockTimes, total_block_time: total };















    });















  };































  const validate = () => {















    const newErrors = {};















    if (!formData.order_type_name?.trim()) newErrors.order_type_name = "발행 유형 명칭은 필수입니다.";















    if (policies.some(p => p.order_type_name === formData.order_type_name && p.id !== formData.id)) newErrors.order_type_name = "이미 존재하는 발행 유형 명칭입니다.";















    if (formData.order_type_score < 1 || formData.order_type_score > 9) newErrors.order_type_score = "발행 유형 점수는 1-9 사이여야 합니다.";















    else if (policies.some(p => p.order_division === formData.order_division && p.order_type_score === formData.order_type_score && p.id !== formData.id)) newErrors.order_type_score = "동일 오더 구분 내에 중복된 발행 유형 점수가 있습니다.";















    if (formData.description?.length > 100) newErrors.description = "설명은 100자를 초과할 수 없습니다.";















    setErrors(newErrors);















    return Object.keys(newErrors).length === 0;















  };















  















  const handleSave = () => {















    if (!validate()) return;















    const finalData = { ...formData, api_schema: apiSchema };















    if (isCreating) {















        onSave(finalData);















        onClose();















        return;















    }















    const changes = Object.keys(finalData).reduce((acc, key) => {















        if (JSON.stringify(finalData[key]) !== JSON.stringify(policy[key])) acc[`${key}`] = { from: policy[key], to: finalData[key] };















        return acc;















    }, {});















    if (Object.keys(changes).length === 0) {















      setIsEditing(false);















      return;















    }















    const newHistoryEntry = { date: new Date().toISOString(), user: 'Ops Admin', changes };















    const updatedPolicy = { ...finalData, version: (finalData.version || 1) + 1, history: [newHistoryEntry, ...(finalData.history || [])] };















    onSave(updatedPolicy);















    onClose();















  };















  















  const handleCancel = () => {















    if (isCreating) {















      onClose();















    } else {















      setIsEditing(false);















      setFormData(policy);















      setErrors({});















    }















  };































  const renderValue = (val) => val === null || val === undefined || val === "" ? "-" : String(val);















  















  if (!formData) return null;































  return (















    <Drawer open={!!policy} title={isCreating ? "발행 유형 추가" : `[ID: ${policy.id}] 발행 유형 정책 수정`} onClose={onClose} footer={















      <div className="flex w-full items-center justify-between">















        <div className="text-xs text-gray-500">{!isCreating && `Version: ${policy.version || 1}`}</div>















        {isEditing ? (















          <div className="flex gap-2">















            <Button variant="secondary" onClick={handleCancel}>취소</Button>















            <Button onClick={handleSave}>{isCreating ? "추가하기" : "저장하기"}</Button>















          </div>















        ) : (















          <div className="flex gap-2">















            <Button variant="secondary" onClick={onClose}>닫기</Button>















            <Button onClick={() => setIsEditing(true)}>수정하기</Button>















          </div>















        )}















      </div>















    }>















      <Tabs>















        <TabsList>















          <TabsTrigger value="details" currentValue={activeTab} onClick={setActiveTab}>상세 정보</TabsTrigger>















          {!isCreating && <TabsTrigger value="history" currentValue={activeTab} onClick={setActiveTab}>변경 이력</TabsTrigger>}















          <TabsTrigger value="api" currentValue={activeTab} onClick={setActiveTab}>API 상세</TabsTrigger>















        </TabsList>































        <TabsContent value="details" currentValue={activeTab}>















            <div className="space-y-4">















                <Card>















                    <CardHeader><CardTitle>기본 정보</CardTitle></CardHeader>















                    <CardContent className="grid grid-cols-2 gap-x-8 gap-y-2">















                        <Field label="셰어링 유형">{isEditing ? <Select value={formData.sharing_type} onChange={e => handleFormDataChange('sharing_type', e.target.value)}>{SHARING_TYPES.map(o => <option key={o} value={o}>{o}</option>)}</Select> : <ReadOnlyValue>{formData.sharing_type}</ReadOnlyValue>}</Field>















                        <Field label="오더 구분" tooltip={HELP_TEXTS.order_division}>{isEditing ? <Select value={formData.order_division} onChange={e => handleFormDataChange('order_division', e.target.value)}>{ORDER_DIVISIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select> : <ReadOnlyValue>{formData.order_division}</ReadOnlyValue>}</Field>















                        <Field label="세차 유형" tooltip={HELP_TEXTS.wash_type}>{isEditing ? <Select value={formData.wash_type} onChange={e => handleFormDataChange('wash_type', e.target.value)}>{WASH_TYPES.map(o => <option key={o} value={o}>{o}</option>)}</Select> : <ReadOnlyValue>{formData.wash_type}</ReadOnlyValue>}</Field>















                        <Field label="존유형" tooltip={HELP_TEXTS.zone_type}>{isEditing ? <Select value={formData.zone_type} onChange={e => handleFormDataChange('zone_type', e.target.value)}>{ZONE_TYPES.map(o => <option key={o} value={o}>{o}</option>)}</Select> : <ReadOnlyValue>{formData.zone_type}</ReadOnlyValue>}</Field>















                        <Field label="파트너 유형" tooltip={HELP_TEXTS.partner_type}><ReadOnlyValue>{formData.partner_type}</ReadOnlyValue></Field>















                        <Field label="오더발행 여부">{isEditing ? <Select value={formData.order_issuance} onChange={e => handleFormDataChange('order_issuance', e.target.value)}>{YN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select> : <ReadOnlyValue>{formData.order_issuance}</ReadOnlyValue>}</Field>















                    </CardContent>















                </Card>















                <Card className="bg-[#F0F7FF]">















                    <CardHeader><CardTitle>오더 중요도</CardTitle></CardHeader>















                    <CardContent className="grid grid-cols-2 gap-x-8 gap-y-2">















                        <Field label="발행 유형 명칭" error={errors.order_type_name}>{isEditing ? <Input value={formData.order_type_name || ''} onChange={e => handleFormDataChange('order_type_name', e.target.value)} /> : <ReadOnlyValue>{formData.order_type_name}</ReadOnlyValue>}</Field>















                        <Field label="발행 유형 점수" error={errors.order_type_score} tooltip={HELP_TEXTS.order_type_score}>{isEditing ? <Input type="number" min="1" max="9" value={formData.order_type_score || ''} onChange={e => handleFormDataChange('order_type_score', Number(e.target.value))} /> : <ReadOnlyValue>{formData.order_type_score}</ReadOnlyValue>}</Field>















                        <Field label="가산점" error={errors.bonus_points} tooltip={HELP_TEXTS.bonus_points}>{isEditing ? <Input type="number" value={formData.bonus_points || '0'} onChange={e => handleFormDataChange('bonus_points', Number(e.target.value))} /> : <ReadOnlyValue>{formData.bonus_points}</ReadOnlyValue>}</Field>















                        <Field label="세차 유형 점수"><ReadOnlyValue>{WASH_TYPE_SCORES[formData.wash_type] || 0}</ReadOnlyValue></Field>















                        <Field label="오더 구분 점수"><ReadOnlyValue>{ORDER_DIVISION_SCORES[formData.order_division] || 0}</ReadOnlyValue></Field>















                        <Field label="존유형 점수"><ReadOnlyValue>{ZONE_TYPE_SCORES[formData.zone_type] || 0}</ReadOnlyValue></Field>















                        <Field label="중요도 총점" tooltip={HELP_TEXTS.total_score}><ReadOnlyValue>{totalScore}</ReadOnlyValue></Field>















                        <Field label="순위 (Rank)"><ReadOnlyValue>{rank ? `${rank} 위` : "-"}</ReadOnlyValue></Field>















                    </CardContent>















                </Card>































                <Card>















                    <CardHeader><CardTitle>블락 정책</CardTitle></CardHeader>















                    <CardContent className="grid grid-cols-2 gap-x-8 gap-y-2">















                        <Field label="블락 유형">{isEditing ? <Select value={formData.block_type || ''} onChange={e => handleFormDataChange('block_type', e.target.value)}><option value="">없음</option>{BLOCK_TYPES.map(o => <option key={o} value={o}>{o}</option>)}</Select> : <ReadOnlyValue>{formData.block_type}</ReadOnlyValue>}</Field>















                        <Field label="총 블락 시간" tooltip={HELP_TEXTS.total_block_time}><ReadOnlyValue>{formData.total_block_time || '0'}분</ReadOnlyValue></Field>















                        <Field label="쿠션(전)">{isEditing ? <div className="flex items-center"><Input type="number" value={formData.cushion_before || ''} onChange={e => handleBlockTimeChange('cushion_before', e.target.value)} /><span className="ml-2 text-sm text-slate-600">분</span></div> : <ReadOnlyValue>{formData.cushion_before}분</ReadOnlyValue>}</Field>















                        <Field label="핸들러(배차)">{isEditing ? <div className="flex items-center"><Input type="number" value={formData.handler_dispatch || ''} onChange={e => handleBlockTimeChange('handler_dispatch', e.target.value)} /><span className="ml-2 text-sm text-slate-600">분</span></div> : <ReadOnlyValue>{formData.handler_dispatch}분</ReadOnlyValue>}</Field>















                        <Field label="세차수행시간">{isEditing ? <div className="flex items-center"><Input type="number" value={formData.wash_time || ''} onChange={e => handleBlockTimeChange('wash_time', e.target.value)} /><span className="ml-2 text-sm text-slate-600">분</span></div> : <ReadOnlyValue>{formData.wash_time}분</ReadOnlyValue>}</Field>















                        <Field label="쿠션(후)">{isEditing ? <div className="flex items-center"><Input type="number" value={formData.cushion_after || ''} onChange={e => handleBlockTimeChange('cushion_after', e.target.value)} /><span className="ml-2 text-sm text-slate-600">분</span></div> : <ReadOnlyValue>{formData.cushion_after}분</ReadOnlyValue>}</Field>















                        <Field label="핸들러(반차)">{isEditing ? <div className="flex items-center"><Input type="number" value={formData.handler_return || ''} onChange={e => handleBlockTimeChange('handler_return', e.target.value)} /><span className="ml-2 text-sm text-slate-600">분</span></div> : <ReadOnlyValue>{formData.handler_return}분</ReadOnlyValue>}</Field>















                    </CardContent>















                </Card>































                <Card>















                    <CardHeader><CardTitle>부가 정책</CardTitle></CardHeader>















                    <CardContent className="grid grid-cols-2 gap-x-8 gap-y-2">















                        <Field label="미션등록 여부">{isEditing ? <Select value={formData.mission_registration} onChange={e => handleFormDataChange('mission_registration', e.target.value)}>{YN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select> : <ReadOnlyValue>{formData.mission_registration}</ReadOnlyValue>}</Field>















                        <Field label="wait_time (시간)" error={errors.wait_time} tooltip={HELP_TEXTS.wait_time}>{isEditing ? <Input type="number" value={formData.wait_time || ''} onChange={e => handleFormDataChange('wait_time', Number(e.target.value))} /> : <ReadOnlyValue>{formData.wait_time}</ReadOnlyValue>}</Field>















                        <Field label="wait_time 취소 여부">{isEditing ? <Select value={formData.wait_time_cancel} onChange={e => handleFormDataChange('wait_time_cancel', e.target.value)}>{YN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</Select> : <ReadOnlyValue>{formData.wait_time_cancel}</ReadOnlyValue>}</Field>















                    </CardContent>















                </Card>































                <Field label="설명" error={errors.description} fullWidth>















                    {isEditing ? <textarea rows="3" className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm" value={formData.description || ''} onChange={e => handleFormDataChange('description', e.target.value)} /> : <div className="text-sm text-slate-700 py-2 px-3 bg-slate-50 rounded-lg min-h-[80px]">{formData.description || '-'}</div>}















                </Field>















            </div>















        </TabsContent>















        <TabsContent value="history" currentValue={activeTab}>















            <div className="space-y-4">















                {policy?.history && policy.history.length > 0 ? policy.history.map((entry, index) => (















                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-slate-50 rounded-r-lg">















                        <div className="font-semibold text-sm text-slate-800">{new Date(entry.date).toLocaleString()} by {entry.user}</div>















                        <ul className="mt-1 list-disc list-inside text-xs text-slate-600 space-y-1">















                            {Object.entries(entry.changes).map(([key, value], cIndex) => (















                                <li key={cIndex}><span className="font-semibold">{key}</span>: <span className="font-mono bg-red-100 text-red-800 px-1 rounded">{renderValue(value.from)}</span> → <span className="font-mono bg-green-100 text-green-800 px-1 rounded">{renderValue(value.to)}</span></li>















                            ))}















                        </ul>















                    </div>















                )) : <div className="text-center text-sm text-slate-500 py-10">변경 이력이 없습니다.</div>}















            </div>















        </TabsContent>















        <TabsContent value="api" currentValue={activeTab}>















            <Card>















                <CardHeader><CardTitle>API 호출 예시 (JSON)</CardTitle></CardHeader>















                <CardContent>















                    <textarea 















                        rows="20"















                        className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 font-mono text-xs" 















                        value={apiSchema}















                        onChange={e => setApiSchema(e.target.value)}















                    />















                </CardContent>















            </Card>















        </TabsContent>















      </Tabs>















    </Drawer>















  );















};





// ============== Main Page Component ==============

export default function OrderTypePolicyPage() {

  const [policies, setPolicies] = useState(() => MOCK_DATA.map(p => ({

    ...p,

    order_type_score: p.order_type_score || Math.floor(Math.random() * 9) + 1,

    bonus_points: p.bonus_points || 0,

    order_type_name: p.order_type,

    total_block_time: p.block_time || 0, // Migrate old block_time

  })));

    const [drawerState, setDrawerState] = useState({ open: false, mode: 'view', policy: null });

    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  

    const policiesWithScoresAndRank = useMemo(() => {

      const policiesWithScores = policies.map(p => ({ ...p, total_score: calculateTotalScore(p) }));

      const sortedByScore = [...policiesWithScores].sort((a, b) => b.total_score - a.total_score);

      return sortedByScore.map((p, index) => ({ ...p, rank: index + 1 }));

    }, [policies]);

  

    const sortedData = useMemo(() => {

      return [...policiesWithScoresAndRank].sort((a, b) => {

        if (!sortConfig.key) return 0;

  

        const aVal = a[sortConfig.key];

        const bVal = b[sortConfig.key];

  

        // keep nulls/undefined at the bottom

        if (aVal == null && bVal == null) return 0;

        if (aVal == null) return 1;

        if (bVal == null) return -1;

  

        const aComparable = typeof aVal === 'string' ? aVal.toLowerCase() : aVal;

        const bComparable = typeof bVal === 'string' ? bVal.toLowerCase() : bVal;

        

        if (aComparable < bComparable) {

          return sortConfig.direction === 'asc' ? -1 : 1;

        }

        if (aComparable > bComparable) {

          return sortConfig.direction === 'asc' ? 1 : -1;

        }

        return 0;

      });

    }, [policiesWithScoresAndRank, sortConfig]);



  const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

  

  const handleCreate = () => setDrawerState({ open: true, mode: 'create', policy: { 

    id: null, 

    sharing_type: "단기", 

    order_division: "정규", 

    order_type_name: "", 

    wash_type: "내외부", 

    zone_type: "일반존", 

    order_issuance: "Y", 

    order_type_score: 5, 

    bonus_points: 0, 

    partner_type: "현장", 

    block_type: "", 

    mission_registration: "N", 

    wait_time: 0, 

    wait_time_cancel: "N", 

    description: "", 

    version: 1, 

    history: [],

    cushion_before: 0,

    handler_dispatch: 0,

    wash_time: 0,

    cushion_after: 0,

    handler_return: 0,

    total_block_time: 0,

  } });

  const handleEdit = (policy) => setDrawerState({ open: true, mode: 'edit', policy });

  const handleSave = (policyToSave) => {

    if (drawerState.mode === 'create') setPolicies(prev => [{...policyToSave, id: Math.max(0, ...prev.map(p => p.id)) + 1 }, ...prev]);

    else setPolicies(prev => prev.map(p => p.id === policyToSave.id ? policyToSave : p));

  };

  

  const handleDownloadCsv = () => {

    const header = columns.map(c => c.header).join(',');

    const body = sortedData.map(row => columns.map(c => {

        let value = c.render ? c.render(row) : row[c.key];

        // For Badge component, extract text content

        if (typeof value === 'object' && value && value.props?.children) {

            value = value.props.children;

        }

        return `"${String(value ?? '').replace(/"/g, '""')}"`;

    }).join(',')).join('\n');



    const csvContent = `data:text/csv;charset=utf-8,\uFEFF${header}\n${body}`;

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);

    link.setAttribute("download", "order_type_policy.csv");

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  }



    const columns = [



      { key: 'id', header: '정책 ID', align: 'center', sortable: true },



      { key: 'rank', header: '순위', align: 'center', sortable: true },



      { key: 'order_division', header: '오더 구분', sortable: true },



      { key: 'order_type_name', header: '발행 유형', sortable: true },



      { key: 'wash_type', header: '세차 유형', sortable: true },



      { key: 'zone_type', header: '존유형', sortable: true },



      { key: 'total_block_time', header: '블락시간', align: 'center', sortable: true, render: r => `${r.total_block_time || 0}분` },



      { key: 'order_issuance', header: '발행여부', align: 'center', sortable: true, render: r => <Badge tone={getIssuanceTone(r.order_issuance)}>{r.order_issuance}</Badge> },



      { key: 'partner_type', header: '파트너 유형', sortable: true, render: r => r.partner_type ? <Badge>{r.partner_type}</Badge> : '-' }



    ];

  

  return (

    <div className="space-y-4">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

        <div>

          <h1 className="text-base font-bold text-[#172B4D]">발행 유형 정책 관리</h1>

          <p className="mt-1 text-sm text-[#6B778C]">오더 발행의 기준이 되는 발행 유형별 상세 정책을 관리합니다.</p>

        </div>

        <div className="flex items-center gap-2">

            <Button variant="secondary" onClick={handleDownloadCsv}><FileDown className="mr-2 h-4 w-4" />엑셀 다운로드</Button>

            <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" />발행 유형 추가</Button>

        </div>

      </div>

      <div className="flex items-center justify-between">

        <div className="text-sm text-[#6B778C]">전체 <b className="text-[#172B4D]">{sortedData.length.toLocaleString()}</b>건</div>

      </div>

      <DataTable columns={columns} rows={sortedData} rowKey={r => r.id} onRowClick={handleEdit} sortConfig={sortConfig} onSort={handleSort} />

      {drawerState.open && <DetailDrawer policy={drawerState.policy} policies={policies} mode={drawerState.mode} onClose={() => setDrawerState({ open: false, mode: 'view', policy: null })} onSave={handleSave}/>}

    </div>

  );

}
