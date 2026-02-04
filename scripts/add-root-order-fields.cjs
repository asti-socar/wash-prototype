const fs = require('fs');
const path = require('path');

const ordersPath = path.join(__dirname, '../src/mocks/orders.json');
const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));

// 리스크 오더 타입
const riskTypes = ["위생장애", "고객 피드백(ML)_긴급", "초장기 미세차"];

// 날짜 계산 헬퍼
function subtractDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

// 랜덤 정수 생성 (min ~ max)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 가상의 root order ID 생성
let rootOrderCounter = 80001;
function generateRootOrderId() {
  return `O-${rootOrderCounter++}`;
}

// 오더 처리
const updatedOrders = orders.map((order) => {
  const isRiskOrder = riskTypes.includes(order.orderType);
  const isCancelledWithReissue = order.status === "취소" &&
    (order.cancelType === "변경취소" || order.cancelType === "미예약취소");

  // 재발행 확률 결정
  let reissueChance;
  if (isCancelledWithReissue) {
    reissueChance = 0.7; // 변경취소/미예약취소는 70% 재발행
  } else if (isRiskOrder) {
    reissueChance = 0.5; // 리스크 오더는 50% 재발행
  } else {
    reissueChance = 0.3; // 일반 오더는 30% 재발행
  }

  const isReissued = Math.random() < reissueChance;

  if (isReissued) {
    // 재발행 오더
    let daysBack;
    if (isCancelledWithReissue) {
      daysBack = randomInt(7, 21); // 변경취소/미예약취소는 7~21일 이전
    } else if (isRiskOrder) {
      daysBack = randomInt(5, 14); // 리스크 오더는 5~14일 이전
    } else {
      daysBack = randomInt(3, 10); // 일반 오더는 3~10일 이전
    }

    return {
      ...order,
      rootOrderId: generateRootOrderId(),
      rootCreatedAt: subtractDays(order.createdAt, daysBack),
    };
  } else {
    // 최초 오더
    return {
      ...order,
      rootOrderId: null,
      rootCreatedAt: order.createdAt,
    };
  }
});

// 파일 저장
fs.writeFileSync(ordersPath, JSON.stringify(updatedOrders, null, 2));

// 통계 출력
const stats = {
  total: updatedOrders.length,
  reissued: updatedOrders.filter(o => o.rootOrderId !== null).length,
  original: updatedOrders.filter(o => o.rootOrderId === null).length,
  riskReissued: updatedOrders.filter(o => riskTypes.includes(o.orderType) && o.rootOrderId !== null).length,
  riskTotal: updatedOrders.filter(o => riskTypes.includes(o.orderType)).length,
};

console.log('=== 처리 완료 ===');
console.log(`전체 오더: ${stats.total}`);
console.log(`최초 오더: ${stats.original} (${(stats.original / stats.total * 100).toFixed(1)}%)`);
console.log(`재발행 오더: ${stats.reissued} (${(stats.reissued / stats.total * 100).toFixed(1)}%)`);
console.log(`리스크 오더 중 재발행: ${stats.riskReissued}/${stats.riskTotal} (${(stats.riskReissued / stats.riskTotal * 100).toFixed(1)}%)`);
