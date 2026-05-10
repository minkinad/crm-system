# SaaS CRM System (NestJS + React)

Многопользовательская CRM-платформа, ориентированная на производство, с RBAC, JWT / refresh auth, журналом аудита, программным удалением, управлением версиями API, документами OpenAPI, ограничением скорости Redis / кэшированием, очередями BullMQ и событиями websocket в реальном времени.

## 1) Архитектура (диаграмма словами)

Система построена как модульный монорепозиторий:

- **Frontend (React + TypeScript)**
  - SPA-клиент с MUI, Zustand и React Query.
  - Авторизация через access token + refresh token (cookie), auto-refresh через Axios interceptor.
  - Tenant isolation на клиенте через `x-tenant-id` header.

- **Backend API (NestJS, v1)**
  - Clean/Hexagonal подход: `controller -> service -> repository`.
  - DTO валидация + sanitization (XSS mitigation).
  - RBAC (`RolesGuard`) + tenant isolation (`TenantMiddleware` + `TenantAccessGuard`).
  - JWT access + rotated refresh sessions.
  - Audit logging через глобальный interceptor.
  - Soft delete через `DeleteDateColumn` и `softDelete`.
  - OpenAPI документация на `/api/docs`.

- **Data & Infra**
  - PostgreSQL: основная транзакционная БД.
  - Redis: rate limiting + cache + BullMQ transport.
  - BullMQ: фоновые очереди напоминаний задач.
  - WebSocket (`/crm`): realtime события на комнаты по tenant.

### Почему TypeORM вместо Prisma

Выбран **TypeORM** из-за:
- нативной интеграции с NestJS decorators/modular DI;
- удобного soft delete (`DeleteDateColumn`);
- гибкой работы с query builder для фильтрации/поиска;
- простого внедрения repository pattern.

## 2) Структура проекта (дерево)

```text
CRM-system/
├── backend/
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── health.controller.ts
│   │   ├── config/
│   │   ├── common/
│   │   │   ├── constants/
│   │   │   ├── decorators/
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── interfaces/
│   │   │   ├── middleware/
│   │   │   ├── pipes/
│   │   │   └── utils/
│   │   ├── database/
│   │   └── modules/
│   │       ├── auth/
│   │       ├── users/
│   │       ├── tenants/
│   │       ├── accounts/
│   │       ├── contacts/
│   │       ├── deals/
│   │       ├── tasks/
│   │       ├── comments/
│   │       ├── audit/
│   │       ├── realtime/
│   │       └── queues/
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── pages/
│   │   └── shared/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## 3) Реализованные backend-модули

### `base entity`
- Файлы: `backend/src/common/entities/base.entity.ts`, `backend/src/common/entities/tenant-scoped.entity.ts`.
- Роль: единая модель `id + timestamps + soft delete` и обязательный `tenantId` для tenant-scoped данных.

### `tenants`
- Файлы: `backend/src/modules/tenants/*`.
- Роль: изоляция SaaS-workspace, хранение tenant, контекст tenant через `AsyncLocalStorage`.

### `roles & guards`
- Файлы: `backend/src/common/constants/roles.ts`, `backend/src/common/guards/roles.guard.ts`, `backend/src/common/decorators/roles.decorator.ts`, `backend/src/common/guards/tenant-access.guard.ts`.
- Роль: RBAC и защита от cross-tenant access.

### `users`
- Файлы: `backend/src/modules/users/*`.
- Роль: управление пользователями tenant, ролями и аккаунт-статусом.

### `auth`
- Файлы: `backend/src/modules/auth/*`.
- Роль: onboarding tenant + admin, login, refresh rotation, logout, cookie-based refresh + CSRF token.

### `contacts` (CRUD + search + pagination + CSV)
- Файлы: `backend/src/modules/contacts/*`.
- Роль: управление контактами клиентов/лидов.

### `deals` (CRUD + pipeline + history + CSV)
- Файлы: `backend/src/modules/deals/*`.
- Роль: воронка продаж, стадии, история переходов, фильтрация и экспорт.

### `accounts`
- Файлы: `backend/src/modules/accounts/*`.
- Роль: компании/аккаунты CRM с Redis-кэшированием списков.

### `tasks`
- Файлы: `backend/src/modules/tasks/*`.
- Роль: дедлайны, ответственные, напоминания (BullMQ delayed jobs).

### `comments`
- Файлы: `backend/src/modules/comments/*`.
- Роль: обсуждения по сущностям CRM (Account/Contact/Deal/Task).

### `audit`
- Файлы: `backend/src/modules/audit/*`, `backend/src/common/interceptors/audit.interceptor.ts`.
- Роль: immutable audit trail по mutating API вызовам.

### `realtime`
- Файлы: `backend/src/modules/realtime/*`.
- Роль: websocket push событий (`contacts.*`, `deals.*`, `tasks.*`, `comments.*`) по tenant-комнатам.

### `queues`
- Файлы: `backend/src/modules/queues/*`.
- Роль: обработка отложенных задач (напоминания).

## 4) Безопасность

- RBAC Guard: `RolesGuard`
- Tenant middleware isolation: `TenantMiddleware`
- Rate limiting (Redis): `RedisRateLimitGuard`
- Input + DTO validation: `ValidationPipe` + `class-validator`
- XSS mitigation: `SanitizePipe`
- CSRF protection: `CsrfMiddleware` (double-submit token)
- Password hashing: `bcrypt`
- Helmet + CORS: `main.ts`

## 5) Frontend auth (React)

- `frontend/src/auth/store.ts`: хранение access/csrf/user.
- `frontend/src/api/http.ts`: JWT + tenant + csrf headers, auto-refresh on 401.
- `frontend/src/pages/LoginPage.tsx`, `RegisterPage.tsx`: auth flows.
- `frontend/src/components/ProtectedRoute.tsx`: защита роутов.
- `frontend/src/pages/DashboardPage.tsx`: пример защищённого tenant-aware экрана.

## 6) Docker и запуск

1. Скопируйте конфиги:
   - `cp .env.example .env`
2. Запустите:
   - `docker compose up --build`
3. Доступ:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3000`
   - OpenAPI: `http://localhost:3000/api/docs`
   - Readiness: `http://localhost:3000/api/v1/health/ready`
   - Liveness: `http://localhost:3000/api/v1/health/live`

## 6.1) Quality Gates

- Backend build: `cd backend && npm run build`
- Backend lint: `cd backend && npm run lint`
- Backend tests: `cd backend && npm test -- --runInBand`
- Frontend build: `cd frontend && npm run build`

В репозиторий добавлен workflow `.github/workflows/ci.yml`, который прогоняет эти проверки на `push` и `pull_request`.

## 6.2) Миграции

- Генерация миграции: `cd backend && npm run migration:generate -- src/database/migrations/<MigrationName>`
- Применение миграций: `cd backend && npm run migration:run`

В проект добавлена базовая миграция `backend/src/database/migrations/1778412012813-InitialSchema.ts`, чтобы схема БД больше не зависела от ручного создания таблиц.

## 7) Деплой frontend на GitHub Pages

Важно: GitHub Pages хостит только **статический frontend**. Backend (NestJS/Postgres/Redis) нужно развернуть отдельно (например, Render/Railway/Fly.io/VPS).

Что уже добавлено:
- workflow: `.github/workflows/deploy-pages.yml`;
- поддержка base path для Pages: `frontend/vite.config.ts`;
- hash-router режим для SPA на Pages: `frontend/src/main.tsx`.

Шаги:
1. Запушьте проект в GitHub репозиторий.
2. В репозитории откройте `Settings -> Pages` и выберите `Build and deployment: GitHub Actions`.
3. В `Settings -> Secrets and variables -> Actions -> Variables` создайте переменную:
   - `VITE_API_BASE_URL=https://<ваш-backend-домен>/api/v1`
4. Убедитесь, что деплой идет в ветку `main` (workflow триггерится на push в `main`).
5. После успешного workflow сайт будет доступен по адресу вида:
   - `https://<username>.github.io/<repo-name>/`

## API v1

Все endpoint'ы версионированы через URI:
- пример: `GET /api/v1/contacts`

## Примечания production

- `synchronize` уже отключен; используйте только миграции.
- Валидация env теперь блокирует некорректные параметры и placeholder secrets в `production`.
- Добавлены readiness/liveness endpoints, глобальный error contract, CI quality gates и корректное завершение Redis-клиента.
- Для следующего этапа рекомендую добавить observability stack: Sentry + Prometheus/Grafana + централизованный log shipping.
