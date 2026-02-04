import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { RefreshCw } from "lucide-react";
import dashboardData from "../mocks/dashboard.json";

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

  const { order_status, risk_management, hourly_orders, daily_risks } = data;

  // 오더 상태 도넛 차트 데이터 (4개 상태: 수행 대기, 수행 중, 완료, 취소) - 쿨 톤 색상
  const statusDonutData = [
    { name: "수행 대기", value: order_status.issued + order_status.reserved, color: "#7BA3C9", filterStatus: null },
    { name: "수행 중", value: order_status.in_progress, color: "#E8C47C", filterStatus: "수행 중" },
    { name: "완료", value: order_status.completed.total, color: "#7BC9A8", filterStatus: "완료" },
    { name: "취소", value: order_status.cancelled.total, color: "#D98E8E", filterStatus: "취소" },
  ];

  // 리스크 비율 도넛 차트 데이터 - 쿨 톤 색상
  const riskTotal = risk_management.hygiene.total + risk_management.ml_urgent.total + risk_management.long_term.total;
  const normalOrders = order_status.total - riskTotal;
  const riskDonutData = [
    { name: "일반 오더", value: normalOrders, color: "#E2E8F0" },
    { name: "위생장애", value: risk_management.hygiene.total, color: "#D98E8E" },
    { name: "ML긴급", value: risk_management.ml_urgent.total, color: "#E8C47C" },
    { name: "초장기미세차", value: risk_management.long_term.total, color: "#7BA3C9" },
  ];

  // 시간대별 오더 생성량 차트 데이터
  const hourlyChartData = hourly_orders.data;
  const currentHour = new Date().getHours();

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
                    onClick={() => goToOrders({ status: "취소", cancelType: "변경취소" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#D98E8E] transition-colors"
                  >
                    <span>변경</span>
                    <span className="font-semibold">{order_status.cancelled.change}</span>
                  </button>
                  <button
                    onClick={() => goToOrders({ status: "취소", cancelType: "미예약취소" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#D98E8E] transition-colors"
                  >
                    <span>미예약</span>
                    <span className="font-semibold">{order_status.cancelled.no_reservation}</span>
                  </button>
                  <button
                    onClick={() => goToOrders({ status: "취소", cancelType: "노쇼취소" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#D98E8E] transition-colors"
                  >
                    <span>노쇼</span>
                    <span className="font-semibold">{order_status.cancelled.no_show}</span>
                  </button>
                  <button
                    onClick={() => goToOrders({ status: "취소", cancelType: "수행원취소" })}
                    className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#D98E8E] transition-colors"
                  >
                    <span>수행원</span>
                    <span className="font-semibold">{order_status.cancelled.agent}</span>
                  </button>
                  <button
                    onClick={() => goToOrders({ status: "취소", cancelType: "우천취소" })}
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
                      { key: "change", label: "변경", filterValue: "변경취소" },
                      { key: "no_reservation", label: "미예약", filterValue: "미예약취소" },
                      { key: "no_show", label: "노쇼", filterValue: "노쇼취소" },
                      { key: "agent", label: "수행원", filterValue: "수행원취소" },
                      { key: "rain", label: "우천", filterValue: "우천취소" },
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

      {/* [영역 3] 시계열 트렌드 그래프 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 시간대별 오더 생성량 */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-sm font-bold text-[#172B4D]">시간대별 오더 생성량</h2>
            <p className="text-xs text-[#6B778C] mt-0.5">오늘 vs 어제</p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#6B778C" }}
                  tickFormatter={(h) => `${h}시`}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6B778C" }} />
                <Tooltip
                  formatter={(value, name) => [
                    `${value}건`,
                    name === "today" ? `오늘 (${hourly_orders.today})` : `어제 (${hourly_orders.yesterday})`,
                  ]}
                  labelFormatter={(h) => `${h}시`}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ top: -5 }}
                  iconType="line"
                  formatter={(value) => (value === "today" ? "오늘" : "어제")}
                />
                <ReferenceLine x={currentHour} stroke="#0052CC" strokeDasharray="3 3" label="" />
                <Line
                  type="monotone"
                  dataKey="yesterday"
                  stroke="#94A3B8"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
                <Line type="monotone" dataKey="today" stroke="#0052CC" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
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
              <AreaChart data={dailyRiskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHygiene" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D98E8E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D98E8E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMlUrgent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8C47C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E8C47C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLongTerm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7BA3C9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7BA3C9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6B778C" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6B778C" }} />
                <Tooltip formatter={(value, name) => [`${value}건`, name]} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ top: -5 }}
                  iconType="circle"
                  formatter={(value) => {
                    const labels = { hygiene: "위생장애", ml_urgent: "ML긴급", long_term: "초장기미세차" };
                    return labels[value] || value;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hygiene"
                  stroke="#D98E8E"
                  fill="url(#colorHygiene)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="ml_urgent"
                  stroke="#E8C47C"
                  fill="url(#colorMlUrgent)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="long_term"
                  stroke="#7BA3C9"
                  fill="url(#colorLongTerm)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
