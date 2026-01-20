import React, { useState } from "react";
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
import { X } from "lucide-react";

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
  const [isGuideOpen, setIsGuideOpen] = useState(true);

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
    { label: "긴급 세차 오더", value: "15건" },
    { label: "위생 장애 인입", value: "12건" },
    { label: "적시 수행 (72시간 이내)", value: "10건" },
    { label: "평균 장애 처리 리드타임", value: "45시간" },
  ];

  return (
    <div className="space-y-6">
      {/* Guide Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in-0">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <button 
              onClick={() => setIsGuideOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-800">대시보드 구현 방향 안내</h2>
            <p className="mt-2 text-sm text-slate-500">
              현재 대시보드 UI는 프로토타입에서만 제공합니다. 실제 기능 제공은 아래 방향으로 계획 중입니다.
            </p>
            <div className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">1</div>
                <div>
                  <h3 className="font-bold text-slate-800">관제 대시보드 기능 구현</h3>
                  <p className="mt-1 text-slate-600">
                    신규 시스템 DB 데이터를 BigQuery에 적재하고, 이를 구글 스프레드시트와 1시간 주기로 연동하여 KPI 및 차트 데이터를 제공합니다. (인터널 어드민에서 제공하지 않음. 구글 스프레드시트로 제공.)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">2</div>
                <div>
                  <h3 className="font-bold text-slate-800">오더 관리 연동</h3>
                  <p className="mt-1 text-slate-600">
                    현재 대시보드 UI안의 각 지표 클릭 시, 해당 조건으로 필터링된 오더 관리 화면으로 즉시 연결할 수 있도록, 오더 관리 필터 화면 Short-Cut 기능을 제공할 예정입니다. (인터널 어드민에서)
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setIsGuideOpen(false)} className="w-full sm:w-auto rounded-lg bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 active:scale-95">
                확인했습니다
              </button>
            </div>
          </div>
        </div>
      )}
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