# Deployment

The stack is three containers — `postgres`, `server` (Node/Express API), and `client` (React build served by nginx, which also proxies `/api` and `/uploads` to `server`).

## Quick start

```bash
docker compose up --build
```

This builds both images, starts Postgres, waits for it to become healthy, then runs the server's migrations and seed automatically before the API starts listening. Once running:

- App: http://localhost:3000
- API: http://localhost:5000/api
- Default admin login: `admin` / `Admin@123` (created by the seed script on first run only)

To run in the background: `docker compose up --build -d`. To stop: `docker compose down` (add `-v` to also delete the Postgres and uploads volumes).

## Environment variables

Set these in a `.env` file next to `docker-compose.yml`, or export them before running `docker compose up`. Every variable has a development-safe default baked into `docker-compose.yml`, but **do not use the defaults in production** — set real values.

| Variable | Used by | Default | Notes |
|---|---|---|---|
| `POSTGRES_USER` | postgres, server | `ams_user` | |
| `POSTGRES_PASSWORD` | postgres, server | `ams_password` | Change this for any non-local deployment. |
| `POSTGRES_DB` | postgres, server | `ams_db` | |
| `JWT_SECRET` | server | `dev-only-secret-change-in-production` | Must be a long random string in production — this signs every login session. |
| `JWT_EXPIRES_IN` | server | `8h` | |
| `CLIENT_URL` | server | `http://localhost:3000` | Used for the API's CORS origin. |
| `POSTGRES_PORT` | host mapping | `5432` | Host-side port for Postgres, in case 5432 is already taken on the host. |
| `SERVER_PORT` | host mapping | `5000` | Host-side port for the API. |
| `CLIENT_PORT` | host mapping | `3000` | Host-side port for the web app. |

## Initial migration and seed

These run automatically every time the `server` container starts (`npx prisma migrate deploy && node prisma/seed.js`). Both are safe to re-run:

- `prisma migrate deploy` only applies migrations that haven't been applied yet — it does nothing on a database that's already current.
- The seed script checks for existing records (`admin` user, and a Supervisor/Contractor user linked to specific seeded records) before creating anything, so it never duplicates data on a restart.

To run either manually against a running stack:

```bash
docker compose exec server npx prisma migrate deploy
docker compose exec server node prisma/seed.js
```

## Uploaded files

Worker/contractor documents (photos, ID scans, policy PDFs, etc.) are written to `/app/uploads` inside the `server` container, which is backed by the `uploads_data` named volume — they persist across container restarts and rebuilds. If you need to inspect or back them up directly:

```bash
docker compose cp server:/app/uploads ./uploads-backup
```

## Pointing at an external/production database instead of the bundled Postgres

The bundled `postgres` service is meant for getting the stack running quickly, not as a production database. To use your own (a managed Postgres instance, a existing server, etc.):

1. Remove or comment out the `postgres` service and the `postgres_data` volume in `docker-compose.yml`.
2. Remove the `depends_on: postgres` block from the `server` service.
3. Set `DATABASE_URL` directly as an environment variable on the `server` service (or in your `.env` file) instead of the templated one that points at the `postgres` service:

   ```
   DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>?schema=public
   ```

4. Make sure the `server` container can actually reach that host — if it's not reachable from inside Docker's network (e.g. it's on `localhost` on the machine running Docker), use `host.docker.internal` instead of `localhost` in the connection string on Windows/Mac, or the host machine's real network address on Linux.
5. `docker compose up --build` — migrations and seed will run against the external database on startup exactly as they do against the bundled one.

## Verifying a deployment is healthy

```bash
curl http://localhost:5000/api/health      # {"status":"ok"}
curl http://localhost:3000/                # the app shell HTML
curl http://localhost:3000/api/health      # same as the first, proxied through nginx — confirms the client can reach the API
```
