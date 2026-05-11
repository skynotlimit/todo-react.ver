# 데일리 투두 (Daily Todo)

오늘 할 일에 집중하기 위한 개인용 todo 앱. Next.js 16 (App Router) + Prisma + Postgres + Auth.js v5 (Google OAuth) + Tailwind v4 + next-intl 기반.

## 주요 기능

- 오늘 / 예정(2주) / 전체 / 완료 보기
- 우선순위(상·중·하), 마감 시각, 카테고리, 태그
- 반복 루틴 (매일 / 매주 요일 지정 / 매월 지정일)
- 푸시 알림 (Web Push, VAPID)
- 한국어 / 영어 i18n (쿠키 기반, 기본 한국어)
- 라이트 / 다크 / 시스템 테마

## 1. 로컬 실행

```bash
# 0. 의존성
npm install

# 1. Postgres 띄우기 (Docker Compose, 포트 5433)
npm run db:up

# 2. .env 셋업 — .env.example 복사 후 값 채우기
cp .env.example .env
# AUTH_SECRET 생성:
npx auth secret      # 또는: openssl rand -base64 32

# 3. DB 마이그레이션
npm run db:migrate

# 4. 개발 서버
npm run dev          # http://localhost:3000
```

## 2. Google OAuth 셋업

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → "OAuth 2.0 Client ID" 생성 (Application type: **Web application**)
2. **Authorized redirect URIs**에 추가:
   - 개발: `http://localhost:3000/api/auth/callback/google`
   - 운영: `https://your-domain/api/auth/callback/google`
3. 발급된 Client ID / Secret을 `.env`에 채우기:

```env
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
```

4. 서버 재시작 → `/signin`에서 Google 로그인.

## 3. Web Push (선택)

리마인더를 푸시 알림으로 받으려면 VAPID 키 생성 후 `.env`에 입력:

```bash
npm run vapid
```

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:you@example.com"
```

푸시 알림은 설정(`/settings`) → "푸시 알림 켜기"로 활성화.

리마인더는 `/api/push/dispatch`를 cron(분 단위 권장)으로 호출해 보냅니다. 인증을 위해 `CRON_SECRET`을 `.env`에 두고 헤더로 전달:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-host/api/push/dispatch
```

## 4. 자주 쓰는 스크립트

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 실행 |
| `npm run typecheck` | TS 타입 체크 |
| `npm run db:up` / `db:down` / `db:reset` | Postgres 컨테이너 제어 |
| `npm run db:migrate` | 스키마 변경 후 마이그레이션 |
| `npm run db:studio` | Prisma Studio (DB GUI) |
| `npm run vapid` | VAPID 키 생성 |

## 5. 폴더 구조

```
src/
  app/
    (app)/                  # 인증 필요 라우트 그룹 (force-dynamic)
      today/upcoming/all/completed/
      routines/categories/tags/settings/
    actions/                # 서버 액션 (todos, routines, categories, settings)
    api/                    # API 라우트 (auth, push)
    signin/
    layout.tsx              # 루트 레이아웃 (NextIntl + ThemeProvider)
    page.tsx                # / → /today 리다이렉트
  components/
    ui/                     # button, input, select, checkbox, card, badge, ...
    todo/                   # composer, list, row, editor
    routine/                # manager, today
    category/, settings/    # 도메인별 UI
    sidebar.tsx
    theme-provider.tsx
  i18n/request.ts           # next-intl (쿠키/Accept-Language 기반)
  messages/                 # ko.json, en.json
  lib/                      # auth, db (PrismaClient 싱글톤), session, queries, push, routines, utils
  proxy.ts                  # Next 16 proxy(구 middleware) — auth 가드
prisma/schema.prisma
docker-compose.yml          # Postgres 16 (port 5433)
public/sw.js                # 푸시 서비스 워커
```

## 6. 배포

### 옵션 A — Vercel + Neon/Supabase

1. 새 Vercel 프로젝트로 이 폴더 import
2. Neon 또는 Supabase에서 Postgres 생성 → 연결 문자열을 `DATABASE_URL`에 설정
3. Vercel 환경변수에 `.env`의 모든 키 등록 (`AUTH_SECRET`, `AUTH_GOOGLE_ID/SECRET`, VAPID, `DATABASE_URL`)
4. Google Cloud의 redirect URI에 운영 도메인 추가
5. `package.json`에 빌드 후크 추가 권장:

   ```json
   "scripts": {
     "postinstall": "prisma generate",
     "vercel-build": "prisma migrate deploy && next build"
   }
   ```

### 옵션 B — VPS (Docker Compose)

`docker-compose.yml`에 `web` 서비스 추가:

```yaml
services:
  web:
    build: .
    env_file: .env
    ports: ["3000:3000"]
    depends_on:
      db:
        condition: service_healthy
```

`Dockerfile`은 `next build` 후 `next start` (또는 standalone). 추가시 안내 가능.

## 7. 알려진 한계 / 다음 단계

- 마감 시각 자연어 입력 (예: "내일 오후 3시")
- 드래그 앤 드롭 정렬
- 통계 (주간 완료율, 루틴 스트릭)
- 모바일 햄버거 네비게이션 (현재 sidebar는 md 이상에서만 표시)
- iCal export
