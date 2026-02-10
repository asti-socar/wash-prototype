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
import dashboardData from "../mocks/dashboard.json";
import ordersData from "../mocks/orders.json";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Dashboard({ goOrdersWithFilter }) {
  const [data, setData] = useState(dashboardData);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [riskTab, setRiskTab] = useState("hygiene");

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

  const { order_status, risk_management, daily_risks, daily_regular_orders } = data;

  // 오더 상태 도넛 차트 데이터 (4개 상태: 수행 대기, 수행 중, 완료, 취소) - 쿨 톤 색상 80% 투명도
  const statusDonutData = [
    { name: "수행 대기", value: order_status.issued + order_status.reserved, color: "rgba(123, 163, 201, 0.8)", filterStatus: null },
    { name: "수행 중", value: order_status.in_progress, color: "rgba(232, 196, 124, 0.8)", filterStatus: "수행 중" },
    { name: "완료", value: order_status.completed.total, color: "rgba(123, 201, 168, 0.8)", filterStatus: "완료" },
    { name: "취소", value: order_status.cancelled.total, color: "rgba(217, 142, 142, 0.8)", filterStatus: "취소" },
  ];

  // 리스크 비율 도넛 차트 데이터 - 쿨 톤 색상 80% 투명도 (리스크 오더만 표시)
  const riskTotal = risk_management.hygiene.total + risk_management.ml_urgent.total + risk_management.long_term.total;
  const riskDonutData = [
    { name: "위생장애", value: risk_management.hygiene.total, color: "rgba(217, 142, 142, 0.8)" },
    { name: "ML긴급", value: risk_management.ml_urgent.total, color: "rgba(232, 196, 124, 0.8)" },
    { name: "초장기미세차", value: risk_management.long_term.total, color: "rgba(123, 163, 201, 0.8)" },
  ];

  // 일별 리스크 추이 차트 데이터
  const dailyRiskChartData = daily_risks.data.map((d) => ({
    ...d,
    date: d.date.slice(5), // MM-DD 형식
  }));

  // 리스크 탭 데이터 매핑
  const riskTabData = {
    hygiene: { label: "위생장애", data: risk_management.hygiene, orderType: "위생장애" },
    ml_urgent: { label: "고객피드백(ML)_긴급", data: risk_management.ml_urgent, orderType: "고객 피드백(ML)_긴급" },
    long_term: { label: "초장기미세차", data: risk_management.long_term, orderType: "초장기 미세차" },
  };

  const currentRisk = riskTabData[riskTab];

  // 리드 타임 계산 함수
  const calculateLeadTime = (order) => {
    const referenceDate = order.rootCreatedAt || order.createdAt;
    const now = new Date();
    const created = new Date(referenceDate);
    return (now - created) / (1000 * 60 * 60 * 24); // 일 단위
  };

  // 파트너별 데이터 집계
  const partnerStats = useMemo(() => {
    const stats = {};
    const riskTypes = ["위생장애", "고객 피드백(ML)_긴급", "초장기 미세차"];

    ordersData.forEach((order) => {
      const partner = order.partner || "미지정";
      if (!stats[partner]) {
        stats[partner] = {
          partner,
          total: 0,
          waiting: 0, // 발행 + 예약
          inProgress: 0, // 수행 중
          completedOnTime: 0, // 적시수행
          completedDelayed: 0, // 지연수행
          risk: 0, // 리스크 오더 (위생장애, ML긴급, 초장기미세차)
          delayed: 0, // 지연 중인 오더 (현재 수행 중이면서 지연)
          riskLeadTimes: [], // 리스크 오더들의 리드 타임 배열
        };
      }

      stats[partner].total += 1;

      // 상태별 집계
      if (order.status === "발행" || order.status === "예약") {
        stats[partner].waiting += 1;
      } else if (order.status === "수행 중") {
        stats[partner].inProgress += 1;
        // 지연 여부 체크 (elapsedDays가 특정 기준 초과 시)
        if (order.elapsedDays > 7) {
          stats[partner].delayed += 1;
        }
      } else if (order.status === "완료") {
        // 적시/지연 구분 (elapsedDays 기준)
        if (order.elapsedDays <= 7) {
          stats[partner].completedOnTime += 1;
        } else {
          stats[partner].completedDelayed += 1;
        }
      }

      // 리스크 오더 집계 및 리드 타임 수집
      if (riskTypes.includes(order.orderType)) {
        stats[partner].risk += 1;
        stats[partner].riskLeadTimes.push(calculateLeadTime(order));
      }
    });

    // 적시율 및 평균 리드타임 계산 후 배열로 변환
    return Object.values(stats).map((s) => ({
      ...s,
      onTimeRate: s.completedOnTime + s.completedDelayed > 0
        ? Math.round((s.completedOnTime / (s.completedOnTime + s.completedDelayed)) * 100)
        : 100,
      avgLeadTime: s.riskLeadTimes.length > 0
        ? s.riskLeadTimes.reduce((sum, lt) => sum + lt, 0) / s.riskLeadTimes.length
        : null,
    })).sort((a, b) => b.total - a.total); // 담당 오더 수 기준 정렬
  }, []);

  // 일자별 정규 오더 생성량 차트 데이터
  const dailyRegularChartData = daily_regular_orders.data.map((d) => ({
    ...d,
    dateLabel: d.date.slice(5).replace("-", "/"), // MM/DD 형식
  }));

  // 경고 표시 로직
  const getWarningLevel = (type, value) => {
    const thresholds = {
      waiting: { red: 10, yellow: 7 },
      onTimeRate: { red: 80, yellow: 85 }, // 미만이면 경고
      risk: { red: 5, yellow: 3 },
      delayed: { red: 3, yellow: 1 },
      leadTime: { red: 10, yellow: 7 }, // 이상이면 경고
    };
    const t = thresholds[type];
    if (!t) return null;

    if (type === "onTimeRate") {
      if (value < t.red) return "red";
      if (value < t.yellow) return "yellow";
    } else {
      if (value >= t.red) return "red";
      if (value >= t.yellow) return "yellow";
    }
    return null;
  };

  const warningColors = {
    red: "#D98E8E",
    yellow: "#E8C47C",
  };

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
          <h1 className="text-xl font-bold text-[#172B4D]">세차 운영 대시보드</h1>
          <p className="text-sm text-[#6B778C]">실시간 현황 모니터링 및 리스크 관리</p>
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

      {/* [영역 1] 오더 현황 - 카드 그리드 방식 */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h2 className="text-sm font-bold text-[#172B4D]">오더 현황</h2>
          <p className="text-xs text-[#6B778C] mt-0.5">전체 오더의 상태별 현황</p>
        </div>
        <div className="p-5">
          {/* Flex 레이아웃: 도넛+범례 (좌측) + 카드 4개 (우측) */}
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* 좌측: 도넛 차트 + 범례 */}
            <div className="flex items-center gap-4">
              {/* 도넛 차트 (배경 없음) */}
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
                      formatter={(value, name) => [`${value}건 (${((value / order_status.total) * 100).toFixed(1)}%)`, name]}
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
                <button
                  onClick={() => goToOrders({ status: "완료" })}
                  className="w-full"
                >
                  <div className="text-xs text-[#6B778C] mb-1">완료</div>
                  <div className="text-2xl font-bold text-[#7BC9A8]">{order_status.completed.total}</div>
                </button>
                <div className="mt-2 pt-2 border-t border-[#E2E8F0] space-y-0.5">
                  <button
                    onClick={() => goToOrders({ status: "완료" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#7BC9A8] transition-colors"
                  >
                    <span>적시수행</span>
                    <span className="font-semibold text-[#7BC9A8]">{order_status.completed.on_time}</span>
                  </button>
                  <button
                    onClick={() => goToOrders({ status: "완료" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#D98E8E] transition-colors"
                  >
                    <span>지연수행</span>
                    <span className="font-semibold text-[#D98E8E]">{order_status.completed.delayed}</span>
                  </button>
                </div>
              </div>

              {/* 취소 카드 */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
                <button
                  onClick={() => goToOrders({ status: "취소" })}
                  className="w-full"
                >
                  <div className="text-xs text-[#6B778C] mb-1">취소</div>
                  <div className="text-2xl font-bold text-[#D98E8E]">{order_status.cancelled.total}</div>
                </button>
                <div className="mt-2 pt-2 border-t border-[#E2E8F0] space-y-0.5">
                  <button
                    onClick={() => goToOrders({ status: "취소", cancelType: "시스템(변경 취소)" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#D98E8E] transition-colors"
                  >
                    <span>변경</span>
                    <span className="font-semibold">{order_status.cancelled.change}</span>
                  </button>
                  <button
                    onClick={() => goToOrders({ status: "취소", cancelType: "시스템(미예약 취소)" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#D98E8E] transition-colors"
                  >
                    <span>미예약</span>
                    <span className="font-semibold">{order_status.cancelled.no_reservation}</span>
                  </button>
                  <button
                    onClick={() => goToOrders({ status: "취소", cancelType: "시스템(노쇼 취소)" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#D98E8E] transition-colors"
                  >
                    <span>노쇼</span>
                    <span className="font-semibold">{order_status.cancelled.no_show}</span>
                  </button>
                  <button
                    onClick={() => goToOrders({ status: "취소" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#D98E8E] transition-colors"
                  >
                    <span>수행원</span>
                    <span className="font-semibold">{order_status.cancelled.agent}</span>
                  </button>
                  <button
                    onClick={() => goToOrders({ status: "취소", cancelType: "시스템(우천 취소)" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#D98E8E] transition-colors"
                  >
                    <span>우천</span>
                    <span className="font-semibold">{order_status.cancelled.rain}</span>
                  </button>
                </div>
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
                {riskTab === key && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#0052CC]" />
                )}
              </button>
            ))}
          </div>

          {/* Flex 레이아웃: 도넛+범례 (좌측) + 카드 4개 (우측) */}
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* 좌측: 도넛 차트 + 범례 */}
            <div className="flex items-center gap-4">
              {/* 도넛 차트 (배경 없음) */}
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
                      formatter={(value, name) => [`${value}건 (${((value / order_status.total) * 100).toFixed(1)}%)`, name]}
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
                <div className="text-2xl font-bold text-[#7BA3C9]">{currentRisk.data.issued + currentRisk.data.reserved}</div>
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
                    onClick={() => goToOrders({ status: "완료", orderType: currentRisk.orderType })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#7BC9A8] transition-colors"
                  >
                    <span>적시수행</span>
                    <span className="font-semibold text-[#7BC9A8]">{currentRisk.data.completed.on_time}</span>
                  </button>
                  <button
                    onClick={() => goToOrders({ status: "완료", orderType: currentRisk.orderType })}
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
                    {[
                      { key: "change", label: "변경", filterValue: "시스템(변경 취소)" },
                      { key: "no_reservation", label: "미예약", filterValue: "시스템(미예약 취소)" },
                      { key: "no_show", label: "노쇼", filterValue: "시스템(노쇼 취소)" },
                      { key: "agent", label: "수행원", filterValue: null },
                      { key: "rain", label: "우천", filterValue: "시스템(우천 취소)" },
                    ]
                      .filter((ct) => currentRisk.data.cancelled[ct.key] > 0)
                      .map((ct) => (
                        <button
                          key={ct.key}
                          onClick={() => goToOrders({ status: "취소", orderType: currentRisk.orderType, cancelType: ct.filterValue })}
                          className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#D98E8E] transition-colors"
                        >
                          <span>{ct.label}</span>
                          <span className="font-semibold">{currentRisk.data.cancelled[ct.key]}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* [영역 4] 파트너 수행 관리 */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h2 className="text-sm font-bold text-[#172B4D]">파트너 수행 관리</h2>
          <p className="text-xs text-[#6B778C] mt-0.5">파트너별 오더 현황 및 성과 지표</p>
        </div>
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="text-left py-3 px-3 font-medium text-[#6B778C]">파트너</th>
                  <th className="text-center py-3 px-3 font-medium text-[#6B778C]">담당</th>
                  <th className="text-center py-3 px-3 font-medium text-[#6B778C]">대기</th>
                  <th className="text-center py-3 px-3 font-medium text-[#6B778C]">수행중</th>
                  <th className="text-center py-3 px-3 font-medium text-[#6B778C]">리스크</th>
                  <th className="text-center py-3 px-3 font-medium text-[#6B778C]">지연</th>
                </tr>
              </thead>
              <tbody>
                {partnerStats.map((row) => {
                  const waitingWarning = getWarningLevel("waiting", row.waiting);
                  const riskWarning = getWarningLevel("risk", row.risk);
                  const delayedWarning = getWarningLevel("delayed", row.delayed);

                  return (
                    <tr
                      key={row.partner}
                      className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] transition-colors"
                    >
                      {/* 파트너 이름 */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => goToOrders({ partner: row.partner })}
                          className="font-medium text-[#172B4D] hover:text-[#0052CC] transition-colors"
                        >
                          {row.partner}
                        </button>
                      </td>

                      {/* 담당 */}
                      <td className="text-center py-3 px-3">
                        <button
                          onClick={() => goToOrders({ partner: row.partner })}
                          className="text-[#172B4D] hover:text-[#0052CC] transition-colors"
                        >
                          {row.total}
                        </button>
                      </td>

                      {/* 대기 */}
                      <td className="text-center py-3 px-3">
                        <button
                          onClick={() => goToOrders({ partner: row.partner, status: "발행" })}
                          className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
                          style={{ color: waitingWarning ? warningColors[waitingWarning] : "#172B4D" }}
                        >
                          {waitingWarning && (
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ backgroundColor: warningColors[waitingWarning] }}
                            />
                          )}
                          <span className={waitingWarning ? "font-semibold" : ""}>{row.waiting}</span>
                        </button>
                      </td>

                      {/* 수행중 */}
                      <td className="text-center py-3 px-3">
                        <button
                          onClick={() => goToOrders({ partner: row.partner, status: "수행 중" })}
                          className="text-[#172B4D] hover:text-[#0052CC] transition-colors"
                        >
                          {row.inProgress}
                        </button>
                      </td>

                      {/* 리스크 */}
                      <td className="text-center py-3 px-3">
                        <button
                          onClick={() => goToOrders({ partner: row.partner, orderType: "위생장애" })}
                          className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
                          style={{ color: riskWarning ? warningColors[riskWarning] : "#172B4D" }}
                        >
                          {riskWarning && (
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ backgroundColor: warningColors[riskWarning] }}
                            />
                          )}
                          <span className={riskWarning ? "font-semibold" : ""}>{row.risk}</span>
                        </button>
                      </td>

                      {/* 지연 */}
                      <td className="text-center py-3 px-3">
                        <button
                          onClick={() => goToOrders({ partner: row.partner, status: "수행 중" })}
                          className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
                          style={{ color: delayedWarning ? warningColors[delayedWarning] : "#172B4D" }}
                        >
                          {delayedWarning && (
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ backgroundColor: warningColors[delayedWarning] }}
                            />
                          )}
                          <span className={delayedWarning ? "font-semibold" : ""}>{row.delayed}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* [영역 3] 시계열 트렌드 그래프 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 일자별 정규 오더 생성량 */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-sm font-bold text-[#172B4D]">일자별 정규 오더 생성량</h2>
            <p className="text-xs text-[#6B778C] mt-0.5">최근 7일</p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dailyRegularChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="dateLabel"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#6B778C" }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6B778C" }} />
                <Tooltip
                  formatter={(value) => [`${value}건`, "정규 오더"]}
                  labelFormatter={(label) => label}
                />
                <Bar
                  dataKey="count"
                  fill="rgba(123, 163, 201, 0.8)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
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

export default Dashboard;
