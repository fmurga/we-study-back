---
name: backend-conventions
description: NestJS, TypeORM, and TypeScript conventions for we-study-back. Apply when editing controllers, services, entities, DTOs, or any backend module. Ensures consistent architecture across the API.
when_to_use: When writing or editing .ts files in the NestJS backend. When creating modules, services, controllers, entities, DTOs, or guards.
paths: "src/**/*.ts,test/**/*.ts"
---

## NestJS Architecture
- Controllers handle HTTP only — no business logic, no DB queries
- Business logic lives in Services
- One Module per feature (module + controller + service + entity + dto)
- DTOs validate input using `class-validator` decorators (`@IsString()`, `@IsEmail()`, etc.)
- Never use `any` — use proper TypeScript types or `unknown`

## TypeORM Patterns
- Entities: `@Entity()` decorator, relations defined on both sides
- Inject repositories via `@InjectRepository(Entity)` in services
- Use `QueryBuilder` for complex queries, repository methods for simple ones
- Schema changes via migrations only — never `synchronize: true` in production

## API Design
- REST: proper HTTP verbs — GET (read), POST (create), PUT (full update), PATCH (partial), DELETE
- Return consistent response shapes
- Add `@ApiTags()` and `@ApiOperation()` on every controller for Swagger
- Protected routes use `@UseGuards(JwtAuthGuard)` — never forget this on sensitive endpoints

## Error Handling
- Use NestJS built-in exceptions: `NotFoundException`, `UnauthorizedException`, `BadRequestException`, `ForbiddenException`
- Throw exceptions from services, not controllers
- Never let raw DB errors bubble up to the response

## Testing
- Unit tests for services: mock repositories with `jest.fn()`
- E2E tests for controllers: use the NestJS testing module
- Run `npm run test` before committing
