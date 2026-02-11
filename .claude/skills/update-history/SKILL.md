---
name: update-history
description: 업데이트 이력 항목 추가 및 version.json 재생성
---

# 업데이트 이력 추가

`src/constants/updateHistory.js`의 BROWN_HISTORY 배열 맨 앞에 새 항목을 추가하고 `npm run update`를 실행합니다.

## 입력
- `$ARGUMENTS`: 변경 내용 설명 (예: "[정책] 오더 관리 필터 추가")

## 절차

1. `src/constants/updateHistory.js`를 읽어 BROWN_HISTORY 첫 항목의 id를 확인
2. 새 항목 생성:
   - `id`: 직전 최대 id + 1
   - `date`: 현재 날짜시간 (`YYYY-MM-DD HH:mm` 형식, KST 기준)
   - `content`: `$ARGUMENTS`로 전달된 설명
   - `isPolicyChange`: content에 "[정책]" 포함 시 true, 아니면 false
   - `links`: content에서 언급된 화면명 기반으로 `{ label, page }` 배열 생성
3. BROWN_HISTORY 배열의 **첫 번째 위치**에 삽입
4. `npm run update` 실행하여 `public/version.json` 재생성
5. 생성된 version.json의 latestId 값 확인 출력

## 화면명 → page 매핑
| 화면명 | page |
|:--|:--|
| 대시보드 | dashboard |
| 오더 관리 | orders |
| 차량 관리 | cars |
| 청구 관리 | billing |
| 합의 요청 관리 | settlement |
| 미션 정책 관리 | missions |
| 분실물 관리 | lostfound |
| 존 정책 관리 | zone-policy |
| 존 배정 관리 | zone-assignment |
| 지역 정책 관리 | regionpolicy |
| 파트너 관리 | partners |
| 파트너 담당자 관리 | partner-managers |
| 수행원 조회 | workers |
| 발행 유형 정책 | order-type-policy |
| AI 모델 정책 | ai-policy |

## 주의사항
- MEMORY.md의 "Latest Brown ID" 값도 함께 갱신할 것
