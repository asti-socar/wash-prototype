import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui";

export default function PartnerNoticesPage({ currentPartner }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-base font-bold text-[#172B4D]">공지사항</div>
        <div className="mt-1 text-sm text-[#6B778C]">{currentPartner.partnerName} 대상 공지사항을 확인합니다.</div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>준비 중</CardTitle>
          <CardDescription>공지사항 화면은 순차적으로 구현될 예정입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#6B778C]">
            인터널 어드민에서 발행한 공지사항 중 자사 대상 공지를 조회할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
