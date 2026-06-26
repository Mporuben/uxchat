# Real time Chat

## Commands

### Setup

```bash
docker compose run --rm dev pnpm i
```

### Run stack

```bash
docker compose up -d
```

### Test

```
docker exec -it ux-dev pnpm test
```

## Type check

```
docker compose run dev pnpm typecheck
```

---

## Architecture

### App

**Nuxt** - I picked Nuxt as a full stack framework that I have experience with.

**Logto** - I used Logto on some project. It is simple authentication for app

**TRPC** - Instead of regular Rest API i picked TRPC as it provided more integrated communication. It supports web sockets as well it's ideal for chat mix of rest API and real time communication

**Drizzle** - Drizzle is nice DB ORM tool. Furthermore, it helps with database schemas and migration. It's ORM that doesn't do lots of abstraction for SQL.

**Zod** - Zod is nice validation library.

### Postgres DB

As data storage I picked Postgres as relational databases are good option for wide range of use cases.
Postgres is DB that I have experience with and provides lot's of additional functionality like notify.
Notify i my choice for facilitating real time communication. It allows me scale App vertically because I can spawn multiple app instances
and their communication is facilitated by Postgres itself.

### Playwright

Playwright is an E2E testing framework that simulates actual user testing in the browser. I have more experience with integration testing in vite, but for this assignment I picked playwright so I can test both the UI and the BE API with a single test runner instance. On a larger-scale project, more granular testing like integration or unit testing should do the heavy lifting. E2E tests are more resource-heavy and prone to flakiness.
