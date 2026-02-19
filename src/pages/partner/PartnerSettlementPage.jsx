import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui";

export default function PartnerSettlementPage({ currentPartner }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-base font-bold text-[#172B4D]">합의 요청 관리</div>
        <div className="mt-1 text-sm text-[#6B778C]">{currentPartner.partnerName}의 합의 요청 현황을 조회합니다.</div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>준비 중</CardTitle>
          <CardDescription>합의 요청 관리 화면은 순차적으로 구현될 예정입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#6B778C]">
            인터널 어드민의 합의 요청 관리 화면을 기반으로, 자사 관련 합의 요청 내역을 조회하고 처리할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
