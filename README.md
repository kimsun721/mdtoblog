# GitHub-Driven Blog API

GitHub 저장소의 마크다운 파일을 자동으로 블로그 포스트로 동기화하는 NestJS 기반 블로그 백엔드입니다.

## 개요

별도의 에디터 없이, GitHub 저장소에 `.md` 파일을 push하면 블로그 포스트로 자동 동기화됩니다. GitHub OAuth로 로그인하고, 연동할 레포지토리를 등록하면 끝입니다. Webhook을 통해 push 이벤트가 발생할 때마다 포스트가 자동으로 갱신됩니다.

## 핵심 기능

- **GitHub 마크다운 자동 동기화** — 레포지토리 등록 후 push 시 Webhook으로 포스트 자동 업데이트
- **무시 경로 설정** — 특정 디렉토리/파일을 동기화 대상에서 제외 가능
- **SHA 기반 변경 감지** — GitHub commit SHA로 변경된 파일만 선택적으로 갱신
- **댓글 스레드** — 부모-자식 관계의 대댓글 지원
- **좋아요** — 포스트 및 댓글에 개별 좋아요 (유저당 1개 유니크 제약)
- **전문 검색** — MySQL FULLTEXT 인덱스 기반 포스트 검색
- **조회수 트래킹** — 포스트 조회 시 자동 카운트 증가

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | NestJS 11, TypeScript 5.7 |
| Database | MySQL 8, TypeORM 0.3 |
| Auth | GitHub OAuth2, Passport.js, JWT (Access/Refresh Token) |
| Security | AES 암호화 (crypto-js), HTTP-only Cookie |
| API | GitHub REST API v3 (Axios) |
| Docs | Swagger / OpenAPI |

## 아키텍처

```
src/
├── auth/        # GitHub OAuth2, JWT 전략, 토큰 발급/갱신
├── user/        # 사용자 프로필, 레포/포스트/댓글 관계
├── repo/        # GitHub 레포 연동, Webhook 수신, 마크다운 동기화
├── post/        # 포스트 CRUD, 전문 검색, 조회수, 좋아요
├── comment/     # 스레드 댓글, CRUD, 좋아요
├── like/        # PostLike / CommentLike 엔티티
├── common/      # 공통 Guard, Decorator, Filter, Interceptor
└── database/    # TypeORM 마이그레이션
```

## 인증 흐름

```
클라이언트 → GET /api/auth/github
    → GitHub OAuth 동의 화면
    → Callback: /api/auth/github/redirect
    → JWT Access Token (10분) + Refresh Token (30일, HTTP-only Cookie) 발급
```

- GitHub Access Token은 AES로 암호화 후 DB 저장
- Refresh Token은 HTTP-only Cookie에 저장 (XSS 방어)
- `POST /api/auth/refresh` 로 Access Token 재발급

## GitHub 동기화 흐름

```
레포 등록 (POST /api/repo)
    → GitHub API로 .md 파일 목록 수집
    → 포스트 최초 생성

이후 push 이벤트
    → GitHub Webhook → POST /api/repo/webhook
    → 변경된 .md 파일만 SHA 비교 후 업데이트
```

## 주요 API

**인증 불필요**
```
GET  /api/post              포스트 목록 (페이지네이션)
GET  /api/post/search       전문 검색 (?keyword=)
GET  /api/post/:id          포스트 상세
GET  /api/comment/:postId   댓글 목록
GET  /api/user/:userId      유저 프로필
```

**JWT 필요**
```
POST   /api/repo            레포지토리 연동
PATCH  /api/repo/:id        무시 경로 등록 등 설정 변경
POST   /api/repo/sync       수동 동기화
POST   /api/comment         댓글 작성
PATCH  /api/comment/:id     댓글 수정 (본인만)
DELETE /api/comment/:id     댓글 삭제 (본인만)
POST   /api/post/:id/likes  포스트 좋아요
POST   /api/comment/:id/likes  댓글 좋아요
```

## 데이터 모델

```
User ─┬─< Repo ─< Post ─< Comment ─< CommentLike
      ├─< Post
      ├─< Comment
      ├─< PostLike
      └─< CommentLike

Comment (self-referential: parentId → Comment.id)
```

## 환경변수

```env
DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME

JWT_SECRET
JWT_REFRESH_SECRET

GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_CALLBACK_URL

CRYPTO_SECRET          # GitHub Access Token 암호화 키

FRONTEND_URL           # CORS 허용 오리진
```
