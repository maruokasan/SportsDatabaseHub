# SportsDatabaseHub

TIC2601 Sports Database Hub for Strategic Planning

## Getting Started

### Backend (API)

```bash
cd backend
cp .env.example .env   # adjust if needed
npm install
npm run dev            # launches http://localhost:4000
```

Default accounts are seeded automatically:

- Admin: `admin@sports.local` / `Admin@123`
- Viewer: `viewer@sports.local` / `Viewer@123`

### Frontend (React SPA)

```bash
cd frontend
npm install
npm run dev            # launches http://localhost:5173
```

Set `VITE_API_BASE_URL` in `frontend/.env` if the backend runs on another host/port.

### Testing

- Use `doc/postman_collection.json` to exercise auth, CRUD, and match completion flows in Postman.
- `npm run build` (frontend) ensures the SPA compiles without warnings.
- `npm run lint` (backend) verifies code quality before submission.

## Project Structure

- `backend/` — Express + Sequelize API, JWT auth, business logic, analytics services.
- `frontend/` — React + React Query dashboard with protected routes and CRUD/analytics pages.
- `doc/` — PRD, SDD, test plan, changelog, and Postman collection.

Refer to `doc/changelog.md` for phased progress notes and remaining backlog.
