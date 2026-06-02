# Plataforma de Movilidad — Agent Guide

## Repository layout

```
├── auth-service/     NestJS + MongoDB/Mongoose (JWT auth, users, admin)
├── ride-service/     NestJS + PostgreSQL/PostGIS (rides, geo, routing, SOS)
├── frontend/         React + Vite + Tailwind (passenger/driver UI)
└── README.md
```

Each service is independent — own `package.json`, own `docker-compose.yml`, own `.env`. No root-level package manager.

## Quick commands (per service)

```bash
npm run start:dev      # dev with --watch
npm run build          # compile to dist/
npm run start:prod     # node dist/main.js
npm run lint           # eslint fix
npm run test           # jest (src/**/*.spec.ts)
npm run test:watch
npm run test:cov       # jest --coverage
```

## Databases

| Service | DB | Docker image | Port | ORM/ODM |
|---------|----|-------------|------|---------|
| auth-service | MongoDB 7 | `mongo:7.0` | 27017 | Mongoose |
| ride-service | PostgreSQL 16 + PostGIS 3.4 | `postgis/postgis:16-3.4` | 5432 | TypeORM (raw SQL for PostGIS) |

## ride-service specifics

- **Schema is managed manually** via `src/database/migrations/001_initial_schema.sql`. TypeORM `synchronize: false`. The SQL runs automatically on first PostGIS container start via `docker-entrypoint-initdb.d/`.
- **All PostGIS spatial queries** use raw SQL through `DataSource.query()` (TypeORM QueryBuilder lacks native GEOGRAPHY support). Encapsulated in repository classes under each module.
- **WebSocket gateways**: namespace `/rides` for ride events, `/geo` for location streaming. Client must pass `userId` and `role` (`passenger` or `driver`) as handshake query params. WebSocket runs on separate port `WS_PORT` (default 3002).
- **State machine** for rides: `solicitado → en_camino → llego → iniciado → finalizado`. Cancellation from `solicitado/en_camino/llego`. Validated via `RideStateMachine`.
- **Scheduled rides** (HU10): `@nestjs/schedule` with `@Cron(EVERY_MINUTE)` checks `scheduled_rides` where `search_at <= NOW()`.
- **Driver location broadcast**: `GeoService` runs `@Cron(EVERY_5_SECONDS)` sending `driver_location_update` to all WebSocket clients.
- **OpenRouteService** dependency at port 8082 for route calculation; falls back to haversine straight-line if ORS is unavailable.
- **Global pipes/filters**: `ValidationPipe` (whitelist, forbidNonWhitelisted, transform with implicit conversion), `HttpExceptionFilter`, `TimeoutInterceptor(30000)`.
- **Global prefix**: `app.setGlobalPrefix('api/v1')`.
- **Modules**: `ride`, `driver`, `geo`, `routing`, `scheduling`, `cancellation`, `sos`, `notifications`, `health`.

## auth-service specifics

- Uses Mongoose schemas (not TypeORM).
- JWT auth with Passport.js, bcrypt for passwords.
- File uploads via Multer for driver document verification.
- Global `ValidationPipe` (whitelist, forbidNonWhitelisted, transform), `HttpExceptionFilter`, and `/api/v1` prefix same pattern as ride-service.
- Modules: `auth`, `users`, `admin`, `common` (health).

## Docker

Each service has its own `docker-compose.yml`. Start separately:

```bash
cd auth-service && docker-compose up -d   # mongodb + auth-service on :3000
cd ride-service && docker-compose up -d   # postgis + ors + ride-service on :3001
```

Ride-service docker-compose auto-runs the SQL migration on first start. pgAdmin can be added manually for DB inspection (credentials in `.env`).

## Health checks

```
GET /api/v1/health   # ride-service also checks DB connectivity
```

## Key enums

`src/common/enums/` in each service: `RideStatus`, `DriverStatus`, `CancellationReasonCode` (ride-service); `UserRole`, `UserStatus`, `DocumentStatus` (auth-service).

## References

- `auth-service/.agents/skills/nestjs-best-practices/AGENTS.md` — 40 NestJS rules
- `auth-service/.opencode/agents/backend_agent.md` — project-specific agent instructions (naming, workflow, decision rules)
- `ride-service/.agents/skills/` — NestJS, Node.js, TypeScript skills (4 skill files)
