import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { RefreshCw } from "lucide-react";
import ordersData from "../../mocks/orders.json";
import leadTimeData from "../../mocks/orders-leadTime.json";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PartnerDashboard({ currentPartner, goOrdersWithFilter }) {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [riskTab, setRiskTab] = useState("hygiene");

  // 파트너 필터링된 오더 데이터
  const partnerOrders = useMemo(
    () => ordersData.filter((o) => o.partner === currentPartner.partnerName),
    [currentPartner.partnerName]
  );

  // 갱신 시간 카운터
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // 새로고침 핸들러
  const handleRefresh = () => {
    setLastUpdated(new Date());
    setSecondsAgo(0);
  };

  // ── 오더 현황 (파트너 필터링된 데이터 기반) ──
  const RISK_TYPES = ["위생장애", "고객 피드백(ML)_긴급", "초장기 미세차"];

  const aggregateStatus = (orders) => {
    const issued = orders.filter((o) => o.status === "발행").length;
    const reserved = orders.filter((o) => o.status === "예약").length;
    const inProgress = orders.filter((o) => o.status === "수행 중").length;
    const completed = orders.filter((o) => o.status === "완료");
    const cancelled = orders.filter((o) => o.status === "취소");
    const onTime = completed.filter((o) => !leadTimeData[o.orderId]?.isDelayed).length;
    const delayed = completed.filter((o) => leadTimeData[o.orderId]?.isDelayed).length;
    const cancelByType = {};
    cancelled.forEach((o) => {
      const ct = o.cancelType || "기타";
      cancelByType[ct] = (cancelByType[ct] || 0) + 1;
    });
    return {
      total: orders.length,
      issued,
      reserved,
      in_progress: inProgress,
      completed: { total: completed.length, on_time: onTime, delayed },
      cancelled: { total: cancelled.length, byType: cancelByType },
    };
  };

  const order_status = useMemo(() => aggregateStatus(partnerOrders), [partnerOrders]);

  // 리스크 관리 (발행유형별 산출)
  const risk_management = useMemo(
    () => ({
      hygiene: aggregateStatus(partnerOrders.filter((o) => o.orderType === "위생장애")),
      ml_urgent: aggregateStatus(partnerOrders.filter((o) => o.orderType === "고객 피드백(ML)_긴급")),
      long_term: aggregateStatus(partnerOrders.filter((o) => o.orderType === "초장기 미세차")),
    }),
    [partnerOrders]
  );

  // 일자별 오더 생성량 (최근 7일)
  const dailyRegularChartData = useMemo(() => {
    const dateMap = {};
    partnerOrders.forEach((o) => {
      const d = o.createdAt.slice(0, 10);
      dateMap[d] = (dateMap[d] || 0) + 1;
    });
    return Object.entries(dateMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map(([date, count]) => ({ date, count, dateLabel: date.slice(5).replace("-", "/") }));
  }, [partnerOrders]);

  // 일별 리스크 추이 (최근 7일)
  const dailyRiskChartData = useMemo(() => {
    const riskMap = { 위생장애: "hygiene", "고객 피드백(ML)_긴급": "ml_urgent", "초장기 미세차": "long_term" };
    const dateMap = {};
    partnerOrders
      .filter((o) => RISK_TYPES.includes(o.orderType))
      .forEach((o) => {
        const d = o.createdAt.slice(0, 10);
        if (!dateMap[d]) dateMap[d] = { hygiene: 0, ml_urgent: 0, long_term: 0 };
        const key = riskMap[o.orderType];
        if (key) dateMap[d][key]++;
      });
    return Object.entries(dateMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map(([date, counts]) => ({ ...counts, date: date.slice(5) }));
  }, [partnerOrders]);

  // 취소 유형 고정 표시 순서
  const CANCEL_TYPE_ORDER = [
    "시스템(노쇼 취소)",
    "시스템(미예약 취소)",
    "수행원(개인 사유)",
    "시스템(변경 취소)",
    "시스템(우천 취소)",
    "수행원(차량 없음)",
    "수행원(주차장 문제)",
    "시스템(예약 불가)",
    "수행원(기타)",
  ];
  const CANCEL_DANGER_TYPES = new Set(["시스템(노쇼 취소)", "시스템(미예약 취소)"]);

  // 오더 상태 도넛 차트 데이터
  const statusDonutData = [
    { name: "수행 대기", value: order_status.issued + order_status.reserved, color: "rgba(123, 163, 201, 0.8)", filterStatus: null },
    { name: "수행 중", value: order_status.in_progress, color: "rgba(232, 196, 124, 0.8)", filterStatus: "수행 중" },
    { name: "완료", value: order_status.completed.total, color: "rgba(123, 201, 168, 0.8)", filterStatus: "완료" },
    { name: "취소", value: order_status.cancelled.total, color: "rgba(217, 142, 142, 0.8)", filterStatus: "취소" },
  ];

  // 리스크 도넛 차트 데이터
  const riskTotal = risk_management.hygiene.total + risk_management.ml_urgent.total + risk_management.long_term.total;
  const riskDonutData = [
    { name: "위생장애", value: risk_management.hygiene.total, color: "rgba(217, 142, 142, 0.8)" },
    { name: "ML긴급", value: risk_management.ml_urgent.total, color: "rgba(232, 196, 124, 0.8)" },
    { name: "초장기미세차", value: risk_management.long_term.total, color: "rgba(123, 163, 201, 0.8)" },
  ];

  // 리스크 탭 매핑
  const riskTabData = {
    hygiene: { label: "위생장애", data: risk_management.hygiene, orderType: "위생장애" },
    ml_urgent: { label: "고객피드백(ML)_긴급", data: risk_management.ml_urgent, orderType: "고객 피드백(ML)_긴급" },
    long_term: { label: "초장기미세차", data: risk_management.long_term, orderType: "초장기 미세차" },
  };
  const currentRisk = riskTabData[riskTab];

  // 네비게이션 핸들러
  const goToOrders = (filter = {}) => {
    if (goOrdersWithFilter) {
      goOrdersWithFilter(filter);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172B4D]">{currentPartner.partnerName} 대시보드</h1>
          <p className="text-sm text-[#6B778C]">운영 현황 모니터링 및 리스크 관리</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#6B778C]">
            마지막 갱신: {secondsAgo < 60 ? `${secondsAgo}초 전` : `${Math.floor(secondsAgo / 60)}분 전`}
          </span>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-medium text-[#172B4D] hover:bg-[#F4F5F7] transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            새로고침
          </button>
        </div>
      </div>

      {/* [영역 1] 오더 현황 */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h2 className="text-sm font-bold text-[#172B4D]">오더 현황</h2>
          <p className="text-xs text-[#6B778C] mt-0.5">자사 오더의 상태별 현황</p>
        </div>
        <div className="p-5">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* 좌측: 도넛 차트 + 범례 */}
            <div className="flex items-center gap-4">
              <div className="w-[160px] h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusDonutData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="cursor-pointer"
                          onClick={() => goToOrders(entry.filterStatus ? { status: entry.filterStatus } : {})}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${value}건 (${((value / order_status.total) * 100).toFixed(1)}%)`,
                        name,
                      ]}
                    />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                      <tspan x="50%" dy="-5" className="text-xl font-bold fill-[#172B4D]">
                        {order_status.total}
                      </tspan>
                      <tspan x="50%" dy="20" className="text-xs fill-[#6B778C]">
                        전체
                      </tspan>
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* 세로 범례 */}
              <div className="flex flex-col gap-2">
                {statusDonutData.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => goToOrders(item.filterStatus ? { status: item.filterStatus } : {})}
                    className="flex items-center gap-2 text-sm text-[#6B778C] hover:text-[#172B4D] transition-colors"
                  >
                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span>{item.name}:</span>
                    <span className="font-semibold text-[#172B4D]">{item.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 우측: 4개 카드 영역 */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 수행 대기 카드 */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
                <div className="text-xs text-[#6B778C] mb-1">수행 대기</div>
                <div className="text-2xl font-bold text-[#7BA3C9]">{order_status.issued + order_status.reserved}</div>
                <div className="mt-2 pt-2 border-t border-[#E2E8F0] space-y-0.5">
                  <button
                    onClick={() => goToOrders({ status: "발행" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#7BA3C9] transition-colors"
                  >
                    <span>발행</span>
                    <span className="font-semibold">{order_status.issued}</span>
                  </button>
                  <button
                    onClick={() => goToOrders({ status: "예약" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#7BA3C9] transition-colors"
                  >
                    <span>예약</span>
                    <span className="font-semibold">{order_status.reserved}</span>
                  </button>
                </div>
              </div>

              {/* 수행 중 카드 */}
              <button
                onClick={() => goToOrders({ status: "수행 중" })}
                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center hover:border-[#E8C47C] hover:shadow-md transition-all"
              >
                <div className="text-xs text-[#6B778C] mb-1">수행 중</div>
                <div className="text-2xl font-bold text-[#E8C47C]">{order_status.in_progress}</div>
              </button>

              {/* 완료 카드 */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
                <button onClick={() => goToOrders({ status: "완료" })} className="w-full">
                  <div className="text-xs text-[#6B778C] mb-1">완료</div>
                  <div className="text-2xl font-bold text-[#7BC9A8]">{order_status.completed.total}</div>
                </button>
                <div className="mt-2 pt-2 border-t border-[#E2E8F0] space-y-0.5">
                  <button
                    onClick={() => goToOrders({ status: "완료", delayed: "정상" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#7BC9A8] transition-colors"
                  >
                    <span>적시수행</span>
                    <span className="font-semibold text-[#7BC9A8]">{order_status.completed.on_time}</span>
                  </button>
                  <button
                    onClick={() => goToOrders({ status: "완료", delayed: "지연" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#D98E8E] transition-colors"
                  >
                    <span>지연수행</span>
                    <span className="font-semibold text-[#D98E8E]">{order_status.completed.delayed}</span>
                  </button>
                </div>
              </div>

              {/* 취소 카드 */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
                <button onClick={() => goToOrders({ status: "취소" })} className="w-full">
                  <div className="text-xs text-[#6B778C] mb-1">취소</div>
                  <div className="text-2xl font-bold text-[#D98E8E]">{order_status.cancelled.total}</div>
                </button>
                {order_status.cancelled.total > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#E2E8F0] space-y-0.5">
                    {CANCEL_TYPE_ORDER.filter((type) => order_status.cancelled.byType[type])
                      .map((type) => [type, order_status.cancelled.byType[type]])
                      .map(([type, count]) => {
                        const shortLabel = type
                          .replace(/^시스템\(|\)$/g, "")
                          .replace(/^수행원\(|\)$/g, "")
                          .replace(" 취소", "");
                        const isDanger = CANCEL_DANGER_TYPES.has(type);
                        return (
                          <button
                            key={type}
                            onClick={() => goToOrders({ status: "취소", cancelType: type })}
                            className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#D98E8E] transition-colors"
                          >
                            <span>{shortLabel}</span>
                            <span className={cn("font-semibold", isDanger && "text-[#D98E8E]")}>{count}</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* [영역 2] 리스크 관리 */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h2 className="text-sm font-bold text-[#172B4D]">리스크 관리</h2>
          <p className="text-xs text-[#6B778C] mt-0.5">리스크 유형별 오더 현황 모니터링</p>
        </div>
        <div className="p-5 space-y-5">
          {/* 탭 헤더 */}
          <div className="flex border-b border-[#E2E8F0]">
            {Object.entries(riskTabData).map(([key, { label, data }]) => (
              <button
                key={key}
                onClick={() => setRiskTab(key)}
                className={cn(
                  "relative px-4 py-2.5 text-sm font-medium transition-all",
                  riskTab === key ? "text-[#0052CC]" : "text-[#6B778C] hover:text-[#172B4D]"
                )}
              >
                {label}
                <span
                  className={cn(
                    "ml-1.5 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold",
                    riskTab === key ? "bg-[#0052CC] text-white" : "bg-[#F1F5F9] text-[#6B778C]"
                  )}
                >
                  {data.total}
                </span>
                {riskTab === key && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#0052CC]" />}
              </button>
            ))}
          </div>

          {/* Flex 레이아웃: 도넛+범례 (좌측) + 카드 4개 (우측) */}
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* 좌측: 도넛 차트 + 범례 */}
            <div className="flex items-center gap-4">
              <div className="w-[160px] h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${value}건 (${riskTotal > 0 ? ((value / riskTotal) * 100).toFixed(1) : 0}%)`,
                        name,
                      ]}
                    />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                      <tspan x="50%" dy="-5" className="text-xl font-bold fill-[#172B4D]">
                        {riskTotal}
                      </tspan>
                      <tspan x="50%" dy="20" className="text-xs fill-[#6B778C]">
                        리스크
                      </tspan>
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* 세로 범례 */}
              <div className="flex flex-col gap-2">
                {riskDonutData.map((item) => (
                  <span key={item.name} className="flex items-center gap-2 text-sm text-[#6B778C]">
                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span>{item.name}:</span>
                    <span className="font-semibold text-[#172B4D]">{item.value}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 우측: 4개 카드 영역 (탭 선택에 따라 데이터 변경) */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 수행 대기 카드 */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
                <div className="text-xs text-[#6B778C] mb-1">수행 대기</div>
                <div className="text-2xl font-bold text-[#7BA3C9]">
                  {currentRisk.data.issued + currentRisk.data.reserved}
                </div>
                <div className="mt-2 pt-2 border-t border-[#E2E8F0] space-y-0.5">
                  <button
                    onClick={() => goToOrders({ status: "발행", orderType: currentRisk.orderType })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#7BA3C9] transition-colors"
                  >
                    <span>발행</span>
                    <span className="font-semibold">{currentRisk.data.issued}</span>
                  </button>
                  <button
                    onClick={() => goToOrders({ status: "예약", orderType: currentRisk.orderType })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#7BA3C9] transition-colors"
                  >
                    <span>예약</span>
                    <span className="font-semibold">{currentRisk.data.reserved}</span>
                  </button>
                </div>
              </div>

              {/* 수행 중 카드 */}
              <button
                onClick={() => goToOrders({ status: "수행 중", orderType: currentRisk.orderType })}
                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center hover:border-[#E8C47C] hover:shadow-md transition-all"
              >
                <div className="text-xs text-[#6B778C] mb-1">수행 중</div>
                <div className="text-2xl font-bold text-[#E8C47C]">{currentRisk.data.in_progress}</div>
              </button>

              {/* 완료 카드 */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
                <button
                  onClick={() => goToOrders({ status: "완료", orderType: currentRisk.orderType })}
                  className="w-full"
                >
                  <div className="text-xs text-[#6B778C] mb-1">완료</div>
                  <div className="text-2xl font-bold text-[#7BC9A8]">{currentRisk.data.completed.total}</div>
                </button>
                <div className="mt-2 pt-2 border-t border-[#E2E8F0] space-y-0.5">
                  <button
                    onClick={() => goToOrders({ status: "완료", orderType: currentRisk.orderType, delayed: "정상" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#7BC9A8] transition-colors"
                  >
                    <span>적시수행</span>
                    <span className="font-semibold text-[#7BC9A8]">{currentRisk.data.completed.on_time}</span>
                  </button>
                  <button
                    onClick={() => goToOrders({ status: "완료", orderType: currentRisk.orderType, delayed: "지연" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#D98E8E] transition-colors"
                  >
                    <span>지연수행</span>
                    <span className="font-semibold text-[#D98E8E]">{currentRisk.data.completed.delayed}</span>
                  </button>
                </div>
              </div>

              {/* 취소 카드 */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
                <button
                  onClick={() => goToOrders({ status: "취소", orderType: currentRisk.orderType })}
                  className="w-full"
                >
                  <div className="text-xs text-[#6B778C] mb-1">취소</div>
                  <div className="text-2xl font-bold text-[#D98E8E]">{currentRisk.data.cancelled.total}</div>
                </button>
                {currentRisk.data.cancelled.total > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#E2E8F0] space-y-0.5">
                    {CANCEL_TYPE_ORDER.filter((type) => (currentRisk.data.cancelled.byType || {})[type])
                      .map((type) => [type, currentRisk.data.cancelled.byType[type]])
                      .map(([type, count]) => {
                        const shortLabel = type
                          .replace(/^시스템\(|\)$/g, "")
                          .replace(/^수행원\(|\)$/g, "")
                          .replace(" 취소", "");
                        const isDanger = CANCEL_DANGER_TYPES.has(type);
                        return (
                          <button
                            key={type}
                            onClick={() =>
                              goToOrders({ status: "취소", orderType: currentRisk.orderType, cancelType: type })
                            }
                            className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#D98E8E] transition-colors"
                          >
                            <span>{shortLabel}</span>
                            <span className={cn("font-semibold", isDanger && "text-[#D98E8E]")}>{count}</span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* [영역 3] 시계열 트렌드 그래프 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 일자별 오더 생성량 */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-sm font-bold text-[#172B4D]">일자별 오더 생성량</h2>
            <p className="text-xs text-[#6B778C] mt-0.5">최근 7일</p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dailyRegularChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="dateLabel" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6B778C" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6B778C" }} />
                <Tooltip formatter={(value) => [`${value}건`, "오더"]} labelFormatter={(label) => label} />
                <Bar dataKey="count" fill="rgba(123, 163, 201, 0.8)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 일별 리스크 유형별 추이 */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-sm font-bold text-[#172B4D]">일별 리스크 유형별 추이</h2>
            <p className="text-xs text-[#6B778C] mt-0.5">최근 7일</p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={dailyRiskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6B778C" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6B778C" }} />
                <Tooltip
                  formatter={(value, name) => {
                    const labels = { hygiene: "위생장애", ml_urgent: "ML긴급", long_term: "초장기미세차" };
                    return [`${value}건`, labels[name] || name];
                  }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ top: -5, paddingBottom: "10px" }}
                  iconType="circle"
                  formatter={(value) => {
                    const labels = { hygiene: "위생장애", ml_urgent: "ML긴급", long_term: "초장기미세차" };
                    return labels[value] || value;
                  }}
                />
                <Line
                  type="linear"
                  dataKey="hygiene"
                  name="위생장애"
                  stroke="rgba(217, 142, 142, 0.8)"
                  strokeWidth={2}
                  dot={{ fill: "rgba(217, 142, 142, 0.8)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#D98E8E" }}
                />
                <Line
                  type="linear"
                  dataKey="ml_urgent"
                  name="ML긴급"
                  stroke="rgba(232, 196, 124, 0.8)"
                  strokeWidth={2}
                  dot={{ fill: "rgba(232, 196, 124, 0.8)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#E8C47C" }}
                />
                <Line
                  type="linear"
                  dataKey="long_term"
                  name="초장기미세차"
                  stroke="rgba(123, 163, 201, 0.8)"
                  strokeWidth={2}
                  dot={{ fill: "rgba(123, 163, 201, 0.8)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#7BA3C9" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
