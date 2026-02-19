import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui";

export default function PartnerOrdersPage({ currentPartner }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-base font-bold text-[#172B4D]">오더 조회</div>
        <div className="mt-1 text-sm text-[#6B778C]">{currentPartner.partnerName}에 배정된 오더를 조회합니다.</div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>준비 중</CardTitle>
          <CardDescription>오더 조회 화면은 순차적으로 구현될 예정입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#6B778C]">
            인터널 어드민의 오더 관리 화면을 기반으로, 자사에 배정된 오더만 읽기 전용으로 조회할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
