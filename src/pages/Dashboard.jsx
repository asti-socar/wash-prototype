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

// 클릭 가능한 수치 컴포넌트
function ClickableValue({ value, label, onClick, size = "md", color = "text-[#172B4D]" }) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all hover:bg-[#F4F5F7] active:scale-95",
        onClick ? "cursor-pointer" : "cursor-default"
      )}
    >
      <span className="text-xs font-medium text-[#6B778C]">{label}</span>
      <span className={cn("font-bold", sizeClasses[size], color)}>{value}</span>
    </button>
  );
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

  // 오더 상태 도넛 차트 데이터 (4개 상태: 수행 대기, 수행 중, 완료, 취소)
  const statusDonutData = [
    { name: "수행 대기", value: order_status.issued + order_status.reserved, color: "#0052CC", filterStatus: null },
    { name: "수행 중", value: order_status.in_progress, color: "#FF991F", filterStatus: "수행 중" },
    { name: "완료", value: order_status.completed.total, color: "#36B37E", filterStatus: "완료" },
    { name: "취소", value: order_status.cancelled.total, color: "#DE350B", filterStatus: "취소" },
  ];

  // 리스크 비율 도넛 차트 데이터
  const riskTotal = risk_management.hygiene.total + risk_management.ml_urgent.total + risk_management.long_term.total;
  const normalOrders = order_status.total - riskTotal;
  const riskDonutData = [
    { name: "일반 오더", value: normalOrders, color: "#E2E8F0" },
    { name: "위생장애", value: risk_management.hygiene.total, color: "#EF4444" },
    { name: "ML긴급", value: risk_management.ml_urgent.total, color: "#F97316" },
    { name: "초장기미세차", value: risk_management.long_term.total, color: "#EAB308" },
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
          {/* 6열 그리드: 5개 카드 + 도넛 차트 */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {/* 전체 오더 카드 */}
            <button
              onClick={() => goToOrders({})}
              className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center hover:border-[#172B4D] hover:shadow-md transition-all"
            >
              <div className="text-sm text-[#6B778C] mb-1">전체 오더</div>
              <div className="text-3xl font-bold text-[#172B4D]">{order_status.total}</div>
            </button>

            {/* 수행 대기 카드 */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center">
              <div className="text-sm text-[#6B778C] mb-1">수행 대기</div>
              <div className="text-3xl font-bold text-[#0052CC]">{order_status.issued + order_status.reserved}</div>
              <div className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-1">
                <button
                  onClick={() => goToOrders({ status: "발행" })}
                  className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#0052CC] transition-colors"
                >
                  <span>발행</span>
                  <span className="font-semibold">{order_status.issued}</span>
                </button>
                <button
                  onClick={() => goToOrders({ status: "예약" })}
                  className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#0052CC] transition-colors"
                >
                  <span>예약</span>
                  <span className="font-semibold">{order_status.reserved}</span>
                </button>
              </div>
            </div>

            {/* 수행 중 카드 */}
            <button
              onClick={() => goToOrders({ status: "수행 중" })}
              className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center hover:border-[#FF991F] hover:shadow-md transition-all"
            >
              <div className="text-sm text-[#6B778C] mb-1">수행 중</div>
              <div className="text-3xl font-bold text-[#FF991F]">{order_status.in_progress}</div>
            </button>

            {/* 완료 카드 */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center">
              <button
                onClick={() => goToOrders({ status: "완료" })}
                className="w-full"
              >
                <div className="text-sm text-[#6B778C] mb-1">완료</div>
                <div className="text-3xl font-bold text-[#36B37E]">{order_status.completed.total}</div>
              </button>
              <div className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-1">
                <button
                  onClick={() => goToOrders({ status: "완료" })}
                  className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#36B37E] transition-colors"
                >
                  <span>적시수행</span>
                  <span className="font-semibold text-[#36B37E]">{order_status.completed.on_time}</span>
                </button>
                <button
                  onClick={() => goToOrders({ status: "완료" })}
                  className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#DE350B] transition-colors"
                >
                  <span>지연수행</span>
                  <span className="font-semibold text-[#DE350B]">{order_status.completed.delayed}</span>
                </button>
              </div>
            </div>

            {/* 취소 카드 */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center">
              <button
                onClick={() => goToOrders({ status: "취소" })}
                className="w-full"
              >
                <div className="text-sm text-[#6B778C] mb-1">취소</div>
                <div className="text-3xl font-bold text-[#DE350B]">{order_status.cancelled.total}</div>
              </button>
              <div className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-1">
                <button
                  onClick={() => goToOrders({ status: "취소", cancelType: "변경취소" })}
                  className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#DE350B] transition-colors"
                >
                  <span>변경</span>
                  <span className="font-semibold">{order_status.cancelled.change}</span>
                </button>
                <button
                  onClick={() => goToOrders({ status: "취소", cancelType: "미예약취소" })}
                  className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#DE350B] transition-colors"
                >
                  <span>미예약</span>
                  <span className="font-semibold">{order_status.cancelled.no_reservation}</span>
                </button>
                <button
                  onClick={() => goToOrders({ status: "취소", cancelType: "노쇼취소" })}
                  className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#DE350B] transition-colors"
                >
                  <span>노쇼</span>
                  <span className="font-semibold">{order_status.cancelled.no_show}</span>
                </button>
                <button
                  onClick={() => goToOrders({ status: "취소", cancelType: "수행원취소" })}
                  className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#DE350B] transition-colors"
                >
                  <span>수행원</span>
                  <span className="font-semibold">{order_status.cancelled.agent}</span>
                </button>
                <button
                  onClick={() => goToOrders({ status: "취소", cancelType: "우천취소" })}
                  className="w-full flex justify-between items-center text-xs text-[#6B778C] hover:text-[#DE350B] transition-colors"
                >
                  <span>우천</span>
                  <span className="font-semibold">{order_status.cancelled.rain}</span>
                </button>
              </div>
            </div>

            {/* 오더 상태 분포 도넛 차트 */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={statusDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
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
                    <tspan x="50%" dy="-3" className="text-sm font-bold fill-[#172B4D]">
                      {order_status.total}
                    </tspan>
                    <tspan x="50%" dy="14" className="text-[10px] fill-[#6B778C]">
                      전체
                    </tspan>
                  </text>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                {statusDonutData.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => goToOrders(item.filterStatus ? { status: item.filterStatus } : {})}
                    className="inline-flex items-center gap-1 text-[10px] text-[#6B778C] hover:text-[#172B4D] transition-colors"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.value}
                  </button>
                ))}
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
        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 탭 + 상세 내용 */}
            <div className="lg:col-span-2">
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

              {/* 탭 콘텐츠 */}
              <div className="py-4 space-y-4">
                {/* 오더 상태 수치 */}
                <div className="grid grid-cols-4 gap-3">
                  <ClickableValue
                    label="전체"
                    value={currentRisk.data.total}
                    size="sm"
                    onClick={() => goToOrders({ orderType: currentRisk.orderType })}
                  />
                  <ClickableValue
                    label="발행"
                    value={currentRisk.data.issued}
                    size="sm"
                    color="text-blue-600"
                    onClick={() => goToOrders({ status: "발행", orderType: currentRisk.orderType })}
                  />
                  <ClickableValue
                    label="예약"
                    value={currentRisk.data.reserved}
                    size="sm"
                    color="text-green-600"
                    onClick={() => goToOrders({ status: "예약", orderType: currentRisk.orderType })}
                  />
                  <ClickableValue
                    label="수행 중"
                    value={currentRisk.data.in_progress}
                    size="sm"
                    color="text-amber-600"
                    onClick={() => goToOrders({ status: "수행 중", orderType: currentRisk.orderType })}
                  />
                </div>

                {/* 취소된 오더 상세 */}
                {currentRisk.data.cancelled.total > 0 && (
                  <div className="rounded-lg bg-[#FEF2F2] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-rose-700">취소된 오더</span>
                      <button
                        onClick={() => goToOrders({ status: "취소", orderType: currentRisk.orderType })}
                        className="text-xs font-bold text-rose-700 hover:underline"
                      >
                        {currentRisk.data.cancelled.total}건
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "change", label: "변경취소", filterValue: "변경취소" },
                        { key: "no_reservation", label: "미예약취소", filterValue: "미예약취소" },
                        { key: "no_show", label: "노쇼취소", filterValue: "노쇼취소" },
                        { key: "agent", label: "수행원취소", filterValue: "수행원취소" },
                        { key: "rain", label: "우천취소", filterValue: "우천취소" },
                      ]
                        .filter((ct) => currentRisk.data.cancelled[ct.key] > 0)
                        .map((ct) => (
                          <button
                            key={ct.key}
                            onClick={() =>
                              goToOrders({ status: "취소", orderType: currentRisk.orderType, cancelType: ct.filterValue })
                            }
                            className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-rose-700 border border-rose-200 hover:bg-rose-50 transition-colors"
                          >
                            {ct.label}: {currentRisk.data.cancelled[ct.key]}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* 수행완료 상세 */}
                {currentRisk.data.completed.total > 0 && (
                  <div className="rounded-lg bg-[#F0FDF4] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-green-700">수행 완료</span>
                      <button
                        onClick={() => goToOrders({ status: "완료", orderType: currentRisk.orderType })}
                        className="text-xs font-bold text-green-700 hover:underline"
                      >
                        {currentRisk.data.completed.total}건
                      </button>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span className="text-green-700">
                        적시수행: <span className="font-bold">{currentRisk.data.completed.on_time}</span>
                      </span>
                      <span className="text-rose-600">
                        지연수행: <span className="font-bold">{currentRisk.data.completed.delayed}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 리스크 비율 도넛 차트 */}
            <div className="flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={riskDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
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
                    <tspan x="50%" dy="-5" className="text-2xl font-bold fill-[#172B4D]">
                      {riskTotal}
                    </tspan>
                    <tspan x="50%" dy="20" className="text-xs fill-[#6B778C]">
                      리스크
                    </tspan>
                  </text>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {riskDonutData.map((item) => (
                  <span key={item.name} className="inline-flex items-center gap-1.5 text-xs text-[#6B778C]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}: {item.value}
                  </span>
                ))}
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
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMlUrgent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLongTerm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
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
                  stroke="#EF4444"
                  fill="url(#colorHygiene)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="ml_urgent"
                  stroke="#F97316"
                  fill="url(#colorMlUrgent)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="long_term"
                  stroke="#EAB308"
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
