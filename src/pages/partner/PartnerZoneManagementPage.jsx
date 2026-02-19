import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui";

export default function PartnerZoneManagementPage({ currentPartner }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-base font-bold text-[#172B4D]">존 관리</div>
        <div className="mt-1 text-sm text-[#6B778C]">{currentPartner.partnerName}가 담당하는 존의 차량 현황과 수행원 배치를 관리합니다.</div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>준비 중</CardTitle>
          <CardDescription>존 관리 화면은 순차적으로 구현될 예정입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#6B778C]">
            인터널 어드민의 존 배정 관리 화면과 동일한 구조로, 자사가 담당하는 존만 필터링하여 표시됩니다.
            존별 배치 차량 수를 확인하고 수행원을 배정할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
