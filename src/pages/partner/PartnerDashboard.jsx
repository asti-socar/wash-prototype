import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui";

export default function PartnerDashboard({ currentPartner }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-base font-bold text-[#172B4D]">{currentPartner.partnerName} 대시보드</div>
        <div className="mt-1 text-sm text-[#6B778C]">파트너 전용 운영 현황을 확인합니다.</div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>준비 중</CardTitle>
          <CardDescription>파트너 대시보드는 순차적으로 구현될 예정입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#6B778C]">
            자사 오더 현황, 정산 요약, 수행원 배치 현황 등을 한눈에 확인할 수 있는 대시보드가 제공될 예정입니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
