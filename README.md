# AMS — Attendance Management System (Phase 1: Admin Portal)

Full-stack attendance and workforce management system. Phase 1 covers the complete
Admin portal — auth, master data, KYC lookup, daily attendance, operational forms
(Damage/Fine/Accident/Advance/Overtime), reports, and Policy/Holiday management.
See `AMS_Phase1_Admin_PRD.docx` for the full spec.

**Stack:** React (Vite) + Tailwind CSS on the client, Node/Express + Prisma on the
server, PostgreSQL as the database.

## Prerequisites

- Node.js 20+
- A PostgreSQL database (a local install, or run one with Docker — see below)

## 1. Database

If you don't already have PostgreSQL running, the quickest way is Docker:

```bash
docker run -d --name ams-postgres \
  -e POSTGRES_USER=ams_user \
  -e POSTGRES_PASSWORD=ams_password \
  -e POSTGRES_DB=ams_db \
  -p 5432:5432 \
  postgres:16-alpine
```

If you're using your own PostgreSQL instance instead, just make sure the database
in `server/.env` (see next step) matches it.

## 2. Server setup

```bash
cd server
cp .env.example .env      # edit DATABASE_URL / JWT_SECRET if you're not using the Docker command above
npm install
npx prisma migrate dev    # creates the schema in your database
npm run seed               # creates the first Admin login
npm run dev                 # starts the API on http://localhost:5000
```

`npm run seed` creates the initial Admin account:

- **Login ID:** `admin`
- **Password:** `Admin@123`

Change this password after your first login (Change Password, in the top-right menu) —
it's a known default meant only to get you into a fresh install. `npm run seed` is
safe to re-run; it skips creating the account if one with login ID `admin` already exists.

> **If `npm install` leaves `@prisma/client` or `bcrypt` broken** (errors like `@prisma/client
> did not initialize` or a native `bcrypt` binding failure), your npm version may be holding
> their install scripts back for review. Run `npm approve-scripts --allow-scripts-pending`
> in `server/`, then `npm install` again.

## 3. Client setup

In a second terminal:

```bash
cd client
npm install
npm run dev    # starts the app on http://localhost:5173, proxying /api to the server
```

Open `http://localhost:5173` and log in with the Admin credentials above.

## Project layout

```
server/   Express API — controllers → services → Prisma, one file per resource
client/   React (Vite) admin UI — pages/ mirrors the backend's resources
```

See `Claude_Code_Build_Prompt.md` for the build conventions this codebase follows.
