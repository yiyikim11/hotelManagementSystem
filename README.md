# Hotel Management System

Full-stack hotel PMS with a Spring Boot (Kotlin/Java) backend and a Vite + React + TypeScript frontend.

```
.
├── backend/    # Spring Boot 3.3 · Java 21 · Gradle · PostgreSQL · Redis · JWT
└── frontend/   # Vite 6 · React 18 · TypeScript · MUI · Tailwind v4
```

---

## Prerequisites

- **Java 21** (toolchain auto-managed by Gradle)
- **Node.js 20+** and **npm**
- **PostgreSQL** running locally (or via Docker)
- **Redis** running locally (or via Docker)

---

## Backend

### Configure

Set DB / Redis / JWT config via environment variables or `backend/src/main/resources/application.properties` (e.g. `spring.datasource.url`, `spring.datasource.username`, `spring.datasource.password`, `spring.data.redis.host`).

### Run the dev server

```bash
cd backend
./gradlew bootRun
```

App boots on `http://localhost:8080`.

- Swagger UI: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health

### Build a jar

```bash
cd backend
./gradlew clean build
java -jar build/libs/hotel-pms-0.0.1-SNAPSHOT.jar
```

### Run tests

```bash
cd backend
./gradlew test
```

Test report: `backend/build/reports/tests/test/index.html`.

---

## Frontend

### Install

```bash
cd frontend
npm install
```

### Run the dev server

```bash
npm run dev
```

Vite serves on `http://localhost:5173`.

### Build for production

```bash
npm run build
```

Output in `frontend/dist/`. Preview with `npx vite preview`.

### Tests

No test runner is wired up yet. To add one:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Then add `"test": "vitest"` to `package.json` scripts.

---

## Full-stack local workflow

1. Start PostgreSQL and Redis.
2. In one terminal: `cd backend && ./gradlew bootRun`
3. In another: `cd frontend && npm run dev`
4. Open http://localhost:5173 — the frontend talks to the backend at `http://localhost:8080`.
