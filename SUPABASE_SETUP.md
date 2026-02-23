# Supabase 설정 체크리스트

MCP 연결 후 순서대로 진행하세요.

---

## 1. Supabase 프로젝트

- [ ] [supabase.com](https://supabase.com)에서 프로젝트 생성
- [ ] MCP를 해당 프로젝트에 연결

---

## 2. 환경 변수 (`.env.local`)

MCP가 연결되면 `get_project_url`, `get_publishable_keys`로 값을 가져올 수 있습니다.

```bash
cp .env.example .env.local
```

필요한 값:
- `NEXT_PUBLIC_SUPABASE_URL` — 프로젝트 API URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3001` (이미 설정됨)

---

## 3. DB 스키마 적용

**MCP 사용 시:** `apply_migration`으로 `supabase/migrations/001_initial_schema.sql` 실행  
(테이블명: `projects_nvc`, `activities_nvc` — nice vibe coding suffix)

**수동:** Supabase 대시보드 → SQL Editor → 해당 파일 내용 붙여넣기 후 실행

---

## 4. Auth 설정

Supabase 대시보드에서:

- [ ] **Authentication → Providers** → Google, GitHub 활성화 및 Client ID/Secret 설정
  - GitHub scope `repo`는 로그인 시 클라이언트에서 자동 요청됨 (별도 설정 불필요)
- [ ] **Authentication → URL Configuration** → Redirect URLs에 추가:
  - `http://localhost:3001/auth/callback`
  - (배포 시) `https://your-domain.com/auth/callback`

---

## MCP 도구로 할 수 있는 것

| 도구 | 용도 |
|------|------|
| `get_project_url` | URL → `.env.local`에 넣기 |
| `get_publishable_keys` | anon key → `.env.local`에 넣기 |
| `apply_migration` | 스키마 적용 |
| `list_tables` | 테이블 생성 확인 |
| `execute_sql` | 직접 SQL 실행 |
