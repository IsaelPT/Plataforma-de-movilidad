# Auth Service - Agent Guide

## Tech Stack
- NestJS + TypeScript
- MongoDB with Mongoose
- JWT authentication + bcrypt
- Docker Compose for local dev

## Commands
```bash
npm run start:dev        # Development with watch
npm run build             # Production build
npm run start:prod        # Run built app
npm run lint             # ESLint
npm run test             # Jest tests
npm run test:watch       # Watch mode
npm run test:cov         # Coverage
```

## Local Development
- Requires MongoDB: `docker-compose up -d mongodb`
- API prefix: `/api/v1`
- Port: `3000` (from `.env`)

## Important Context
- Global prefix is set in `main.ts`: `app.setGlobalPrefix('api/v1')`
- Modules: `auth`, `users`, `admin`, `common` (health)
- Uses global `ValidationPipe` with whitelist
- Env config via `src/config/configuration.ts`
- Health check endpoint: `/api/v1/health`

## Existing Agent Instructions
- `.opencode/agents/backend_agent.md` - Project-specific guidance
- `.agents/skills/nestjs-best-practices/AGENTS.md` - NestJS patterns (40 rules)

## Database
- MongoDB connection configured in `docker-compose.yml`
- Service name in Docker: `mongodb`
- Database: `auth-service`