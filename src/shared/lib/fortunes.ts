/**
 * Daily fortune-cookie quotes. Picked deterministically per-day so the same
 * user sees the same fortune on a given date (no flicker on remount).
 */

const ko: { text: string; author?: string }[] = [
  { text: "시작이 반이다.", author: "아리스토텔레스" },
  { text: "오늘 할 일을 내일로 미루지 말라.", author: "벤저민 프랭클린" },
  { text: "천 리 길도 한 걸음부터.", author: "노자" },
  { text: "느리게 가더라도 멈추지만 않으면 된다.", author: "공자" },
  { text: "할 수 있다고 믿는 사람은 그렇게 된다.", author: "샤를 드골" },
  { text: "가장 어두운 밤도 끝나고 해는 떠오른다.", author: "빅토르 위고" },
  { text: "작은 일이라도 매일 하면 큰 변화가 온다." },
  { text: "오늘의 너는 어제의 너보다 한 걸음 앞서 있다." },
  { text: "완벽보다 완료가 낫다." },
  { text: "지금 이 순간이 가장 빠른 때이다." },
  { text: "어려움 속에 기회가 있다.", author: "아인슈타인" },
  { text: "행복은 준비된 마음에 찾아온다.", author: "파스퇴르" },
  { text: "할 일을 미루는 가장 큰 적은 '나중에'이다." },
  { text: "한 번에 하나씩, 그것으로 충분하다." },
  { text: "성공은 매일의 작은 노력이 쌓인 결과다." },
  { text: "스스로를 믿어라. 너는 생각보다 강하다." },
  { text: "포기하지 않는 한 실패는 없다." },
  { text: "오늘 흘린 땀은 내일의 자산이다." },
  { text: "꾸준함은 재능을 이긴다." },
  { text: "삶은 10%의 사건과 90%의 반응으로 이루어진다.", author: "찰스 R. 스윈돌" },
  { text: "두려움은 행동 앞에서 작아진다." },
  { text: "마음먹은 그 순간이 시작점이다." },
  { text: "남과 비교하지 말고 어제의 나와 비교하라." },
  { text: "휴식도 일의 일부다. 잘 쉬는 것도 능력이다." },
  { text: "오늘 하루도 너에게 좋은 일이 있을 거야." },
  { text: "걱정의 90%는 실제로 일어나지 않는다." },
  { text: "감사하는 마음이 행운을 부른다." },
  { text: "한 발짝씩, 그러나 매일." },
  { text: "지금 이 순간을 살아라.", author: "호라티우스" },
  { text: "변화는 작은 결심에서 시작된다." },
];

const en: { text: string; author?: string }[] = [
  { text: "Well begun is half done.", author: "Aristotle" },
  { text: "Don't put off till tomorrow what you can do today.", author: "Benjamin Franklin" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Those who believe they can, do.", author: "Charles de Gaulle" },
  { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo" },
  { text: "Small daily improvements compound into big change." },
  { text: "Today's you is one step ahead of yesterday's you." },
  { text: "Done is better than perfect." },
  { text: "The best time is now." },
  { text: "In the middle of difficulty lies opportunity.", author: "Einstein" },
  { text: "Fortune favors the prepared mind.", author: "Pasteur" },
  { text: "The biggest enemy of progress is 'later'." },
  { text: "One thing at a time. That's enough." },
  { text: "Success is small efforts repeated day in and day out." },
  { text: "Trust yourself — you are stronger than you think." },
  { text: "There is no failure unless you give up." },
  { text: "Today's sweat is tomorrow's asset." },
  { text: "Consistency beats talent." },
  { text: "Life is 10% what happens and 90% how you react.", author: "Charles R. Swindoll" },
  { text: "Fear shrinks in front of action." },
  { text: "The moment you decide is the starting line." },
  { text: "Compare yourself with who you were yesterday — not someone else." },
  { text: "Rest is part of the work." },
  { text: "Something good is going to happen today." },
  { text: "90% of worries never come to pass." },
  { text: "Gratitude attracts good fortune." },
  { text: "One step at a time — but every day." },
  { text: "Carpe diem.", author: "Horace" },
  { text: "Change starts with a small decision." },
];

/** "YYYY-MM-DD" in local time. */
function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getFortuneForToday(locale: string, userKey = "anon") {
  const list = locale.startsWith("en") ? en : ko;
  const idx = hash(`${userKey}:${todayKey()}`) % list.length;
  return list[idx];
}

export { todayKey };
