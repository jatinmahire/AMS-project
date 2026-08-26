# Build Task: Attendance Management System — Phase 1 (Admin Portal)

Read this entire prompt before writing any code. Two reference files are attached alongside this prompt:

- `AMS_Phase1_Admin_PRD.docx` — the full product requirements for this phase (every module, every form, every field)
- `schema.prisma` — the exact, already-validated database schema (20 models, PostgreSQL). Use it as-is. Do not redesign, rename, or restructure it.

Read both files fully before starting. If anything in this prompt and the PRD ever conflicts, the PRD wins.

---

## 1. What you're building

A real, working Attendance Management System for an industrial client (construction/labour-contractor site management). This is a sponsored college project — the code will be handed to the company's own engineers, who will read it and manually extend it. It has to hold up to that.

**This phase = Admin portal only.** Every form and screen an Admin has access to, fully working end-to-end against a real PostgreSQL database, with a working Express backend. Supervisor and Contractor login screens are NOT part of this phase — do not build them. The `Role` enum and auth system should still support all three roles at the data/logic level (so Phase 2 can add their screens later without reworking the backend), but only build Admin-facing UI right now.

Do not build: Muster Roll / PF Chalan full wage-calculation logic (stub these two report pages with a simple "Coming in Phase 2" placeholder instead of guessing at incomplete business rules), notifications engine, offline sync, Docker/deployment config. If you're ever unsure whether something is in scope, check Section 1 of the PRD — if it's not listed there, don't build it yet.

---

## 2. Tech stack (fixed — do not substitute)

- Frontend: React (Vite) + Tailwind CSS + React Router + Axios + lucide-react for icons
- Backend: Node.js + Express.js, Controller → Service → Prisma layering
- Database: PostgreSQL, accessed via Prisma ORM using the provided `schema.prisma`
- Auth: JWT access tokens + bcrypt password hashing
- Validation: Zod, on every write endpoint, server-side
- File uploads: Multer, saved to a local `/uploads` directory for this phase

---

## 3. Non-negotiable code quality rules

This is the most important section. Violating these is worse than being slow.

1. **Write code like a competent human developer wrote it in one sitting** — not like it was generated. Clear, ordinary variable and function names. Small functions that do one thing. No unnecessary abstraction, no over-engineered patterns for a project this size.
2. **Comment sparingly and only where it adds real value** — explain a business rule, a non-obvious validation, or a workaround. Do not narrate what the code is obviously already doing. Never write comment filler like "Now we create the function that..." or "This is responsible for...".
3. **No AI-sounding artifacts anywhere**: no excessive emoji in code or commit messages, no overly verbose docstrings, no repeated boilerplate disclaimers, no placeholder text like "TODO: implement this later" unless it's one of the explicitly-deferred Phase 2 items.
4. **Consistent conventions across the entire codebase**: camelCase for JS variables/functions, PascalCase for React components and Prisma models, one quote style, one import order convention — pick one approach per pattern and use it everywhere, not different styles per file.
5. **No dead code.** No commented-out blocks left in. No unused imports or variables.
6. **Every write operation must actually validate and actually persist** — no mock data, no hardcoded arrays standing in for a database call, anywhere, at any point, even temporarily. If a screen is scaffolded before its API is ready, wire it to the real (even if empty) endpoint, don't fake the data.
7. **Zero unhandled errors.** Every async operation on both frontend and backend needs proper try/catch or `.catch()` with a real error message shown to the user — no silent failures, no unhandled promise rejections in the console.

---

## 4. Non-negotiable UI rules

1. **Simple, clean, human-made looking — not "AI generated."** Concretely, that means: no heavy gradients, no glassmorphism, no piling multiple shadow/blur/rounded-corner effects on the same element, no over-designed hero sections. This is an internal daily-use tool, not a marketing landing page.
2. **Minimal animation.** Small, fast transitions only (e.g. ~150ms fade/slide on a modal or dropdown). No scroll-triggered animations, no bouncing/pulsing elements, no decorative motion of any kind. Admin, Contractor, and Supervisor users need to get their task done quickly, not watch the interface move.
3. **No emojis anywhere in the UI.** Use `lucide-react` icons instead, consistent size and color per context (e.g. all sidebar icons the same size).
4. **Every screen should be immediately understandable** — a first-time user should know what to do without guessing. Clear labels (not just placeholder text standing in for a label), clear primary action buttons, inline validation errors next to the field that failed, not just a toast that vanishes.
5. **Icons used with purpose**, not decoration — next to nav items, action buttons (edit/delete/view), and status badges (Active/Inactive/Blacklisted, Present/Absent).
6. **One consistent spacing/sizing system** across every page — pick a small set of Tailwind spacing/sizing values and reuse them; don't invent arbitrary pixel values per screen.
7. **Tables and forms are the primary UI** for this app — invest polish there (sortable/searchable tables, clear form sections with headers grouping related fields, e.g. "Personal Info", "Address", "Bank Details" on the Worker form) rather than on decorative elements.

---

## 5. Folder structure (follow exactly — see PRD Section 3.3 for the full tree)

```
server/
  prisma/schema.prisma
  src/
    config/
    controllers/
    services/
    middlewares/
    routes/
    validators/
    utils/
    app.js
  .env.example
client/
  src/
    api/
    components/
    pages/
    context/
    routes/
    utils/
```

One file per resource in `controllers/`, `services/`, `routes/`, `validators/`, and `client/src/api/` (e.g. `workerController.js`, `workerService.js`, `workerRoutes.js`, `workerValidator.js`, `workers.js`). Keep this pattern consistent for every module listed in the PRD — Contractor, Supervisor, Worker, Designation, LabourCategory, Attendance, Damage, Fine, Accident, Advance, Overtime, Policy, Holiday, IdCard, ComplianceTracker, AuditLog, Auth.

---

## 6. Build order

Work in this order — each step should be fully working (backend route + frontend screen + real database read/write) before moving to the next, not all scaffolded at once and wired up later.

1. **Project setup**: init `server/` and `client/`, install dependencies, set up Prisma with the provided `schema.prisma`, run the initial migration, confirm the database connects.
2. **Auth**: User model login (loginId + password), JWT issuance, auth middleware, protected-route wrapper on the frontend, login page, logout, change password. Confirm a seeded Admin user can log in and stay logged in across a page refresh.
3. **Layout shell**: sidebar navigation (matching the Admin menu from the PRD), top bar, protected app shell. No page content yet beyond placeholders — but the shell itself should be final-quality, not a placeholder.
4. **Dashboard**: live count cards wired to real Prisma count queries.
5. **Master data + Registration, in this order**: Designation → Labour Category → Contractor (+ ContractorDocument upload) → Supervisor → Worker. Each one: list view (search/paginate), create form, edit form, delete/deactivate action, all against the real database.
6. **KYC lookup** (Worker, Contractor, Supervisor).
7. **Daily Attendance**: manual entry form, one-record-per-worker-per-day enforced, edit capability, list/filter by date.
8. **Operational forms**: Damage, Fine, Accident, Advance (+ auto-generated repayment schedule), Overtime — in that order.
9. **Reports**: Worker ID Card (view-only, print-blocked), 90-Days Form, statutory registers, Muster Roll/PF Chalan placeholder pages.
10. **Policy & Holiday management.**
11. **Final pass**: confirm every module in the PRD's Definition of Done (Section 7) actually holds — walk through it as a checklist before considering this phase complete.

---

## 7. Backend implementation requirements

- Every write endpoint validates its request body with a Zod schema before touching the database; return `400` with a specific, field-level error message on failure — never a raw stack trace to the client.
- Single shared auth middleware checking the JWT and attaching `req.user` — every protected route uses it, no route reimplements its own check.
- Single centralized error-handling middleware (`server/src/middlewares/errorHandler.js`) — every controller forwards errors to it via `next(err)` instead of handling errors inconsistently per route.
- Every update/delete on Attendance, Fine, Advance, Damage, Accident, or Overtime writes a matching `AuditLog` row capturing `userId`, `action`, `entityType`, `entityId`, `oldValue`, `newValue`.
- File uploads go through Multer with file-type and size validation, saved under `/uploads/<category>/`, with the resulting path saved into the relevant `*Url` field.
- Use a Prisma transaction anywhere multiple rows must succeed or fail together — the clearest example is creating an `Advance` together with its `AdvanceRepayment` installment rows.
- Auto-generate human-readable codes (`workerCode`, `contractorCode`, `supervisorCode`) server-side on creation — don't make the Admin type them.

---

## 8. Before you say you're done

Go through the PRD's Section 7 (Definition of Done) as a literal checklist. In particular, verify by actually doing it, not by assuming:

- Create a Worker through the Registration form, then find that exact same worker in KYC lookup, in the Daily Attendance worker search, and in the Worker master list — confirm all three show identical, live data.
- Refresh the browser on an internal page (not just the login page) and confirm the session persists instead of bouncing to login.
- Open the browser console and the server logs during a normal walkthrough of every module — there should be nothing red.
- Have someone unfamiliar with the code find, in under a minute, which file handles the Fine form's backend route — if the folder structure and naming don't make that trivial, fix the structure before calling this done.

---

## 9. Reminders (repeating on purpose — these are the easiest things to drift on over a long build)

- Admin-only screens this phase. No Supervisor/Contractor UI yet.
- Real database, real validation, everywhere. No mock data.
- Code reads as human-written: plain naming, sparse purposeful comments, no filler.
- UI is simple, clean, minimal-animation, icon-based, zero emoji, immediately understandable.
- Follow the folder structure exactly so the mentor's engineers can navigate it without a tour.
- No unhandled errors, anywhere, on either side of the stack.
