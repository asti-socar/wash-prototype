import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ComposedChart,
} from "recharts";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className, children }) {
  return (
    <div className={cn("rounded-xl bg-white border border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.02)]", className)}>
      {children}
    </div>
  );
}
function CardHeader({ className, children }) {
  return <div className={cn("p-5 pb-3", className)}>{children}</div>;
}
function CardTitle({ className, children }) {
  return <div className={cn("text-sm font-bold text-[#172B4D]", className)}>{children}</div>;
}
function CardDescription({ className, children }) {
  return <div className={cn("mt-1 text-xs text-[#6B778C]", className)}>{children}</div>;
}
function CardContent({ className, children }) {
  return <div className={cn("p-5 pt-2", className)}>{children}</div>;
}

function Dashboard() {
  // Mock Data for Charts
  const dailyData = [
    { day: "월", prevWeek: 300, currWeek: 320 },
    { day: "화", prevWeek: 330, currWeek: 350 },
    { day: "수", prevWeek: 310, currWeek: 300 },
    { day: "목", prevWeek: 360, currWeek: 0 },
    { day: "금", prevWeek: 400, currWeek: 0 },
    { day: "토", prevWeek: 0, currWeek: 0 },
    { day: "일", prevWeek: 0, currWeek: 0 },
  ];

  const partnerData = [
    { name: "A파트너", timely: 45, undone: 10, delayed: 5 },
    { name: "B파트너", timely: 38, undone: 5, delayed: 12 },
    { name: "C파트너", timely: 52, undone: 8, delayed: 2 },
    { name: "D파트너", timely: 40, undone: 15, delayed: 8 },
  ];

  const hourlyData = [
    { time: "00", value: 10 }, { time: "04", value: 5 },
    { time: "08", value: 20 }, { time: "12", value: 50 },
    { time: "16", value: 40 }, { time: "20", value: 80 },
    { time: "24", value: 30 },
  ];

  const issueData = [
    { name: "완료", value: 85 },
    { name: "미처리", value: 15 },
  ];
  const COLORS = ["#0052CC", "#DFE1E6"];

  // KPI Data
  const performanceFlow = [
    { label: "발행", value: 248, color: "text-[#172B4D]" },
    { label: "예약 완료", value: 164, color: "text-[#0052CC]" },
    { label: "수행 완료", value: 79, color: "text-[#0052CC]" },
    { label: "취소", value: 5, color: "text-rose-600" },
  ];

  const emergencyMetrics = [
    { label: "위생 장애 인입", value: "12건" },
    { label: "긴급 세차 오더", value: "12건" },
    { label: "적시 수행 (3일 이내)", value: "10건" },
    { label: "평균 장애 처리 리드타임", value: "45시간" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Car Wash Performance Status */}
        <Card>
          <CardHeader>
            <CardTitle>세차 수행 현황 (Today)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {performanceFlow.map((item, idx) => (
                <React.Fragment key={item.label}>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-[#6B778C]">{item.label}</span>
                    <span className={cn("text-2xl font-bold", item.color)}>{item.value}</span>
                  </div>
                  {idx < performanceFlow.length - 1 && (
                    <div className="h-px w-8 bg-[#DFE1E6] md:w-16" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Wash Status */}
        <Card>
          <CardHeader>
            <CardTitle>긴급 세차 처리 현황 (최근 1주일)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              {emergencyMetrics.map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[#6B778C]">{item.label}</span>
                  <span className="text-xl font-bold text-[#172B4D]">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Daily Orders */}
          <Card>
            <CardHeader><CardTitle>전주 대비 일자별 오더</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE1E6" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <Tooltip cursor={{ fill: "#F4F5F7" }} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ top: -10 }} iconType="circle" />
                  <Area type="monotone" dataKey="prevWeek" name="전주" fill="#F1F5F9" stroke="#E2E8F0" />
                  <Bar dataKey="currWeek" name="금주" fill="#0052CC" radius={[4, 4, 0, 0]} barSize={30} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Partner Performance */}
          <Card>
            <CardHeader><CardTitle>파트너별 수행 현황 (최근 1주일)</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partnerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE1E6" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <Tooltip cursor={{ fill: "#F4F5F7" }} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ top: -10 }} iconType="circle" />
                  <Bar dataKey="timely" name="적시수행" fill="#0052CC" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="undone" name="미수행" fill="#DFE1E6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delayed" name="지연" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hourly Concentration */}
          <Card>
            <CardHeader><CardTitle>시간대별 세차 집중도 (최근 1주일, 세차 시작시간 기준)</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0052CC" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0052CC" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE1E6" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B778C" }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#0052CC" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Issue Resolution Rate */}
          <Card>
            <CardHeader><CardTitle>장애 처리율 (최근 1주일)</CardTitle></CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {issueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-[#172B4D]">
                    85%
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;