# REMSANA /insider Admin Portal

Phase 1 implementation of the admin dashboards (soft launch → hard launch).

## Access

- **Portal (role selection):** `https://remsana.com/insider` or `http://localhost:5173/insider`
- **Admin console:** `/insider/admin` (ADMIN role only)
- **Analyst dashboard:** `/insider/analyst` (ANALYST role only)

## Test credentials (mock auth)

| Role    | Email               | Password   |
|---------|---------------------|------------|
| ADMIN   | admin@remsana.com   | admin123   |
| ANALYST | analyst@remsana.com  | analyst123 |

MFA: any 6-digit code (e.g. `123456`) passes in mock mode.

## Flow

1. Open `/insider` → select **Full Administrator** or **Analyst** → **Continue**
2. Enter email and password → **Login**
3. Enter 6-digit MFA code → **Verify**
4. Redirect to `/insider/admin` or `/insider/analyst`

## Implemented

- **Auth:** Role selection, login, MFA (mock), JWT-style storage, protected routes by role
- **Admin dashboard:** Quick stats, platform health, alerts; tabs: Users, Financials, CAC/Registrations, Content, System Health, Audit Logs (mock data)
- **Analyst dashboard:** KPI cards, Overview / Cohorts / Revenue / Registration tabs, Export CSV/PDF (placeholder)
- **API layer:** `src/app/api/insider/` — types, mock data, auth (swap for real backend later)

## Backend integration

Replace or extend:

- `src/app/api/insider/auth.ts` — real login/refresh/MFA and JWT validation
- `src/app/api/insider/mockData.ts` — replace with `GET /api/insider/admin/*` and `GET /api/insider/analyst/*` calls

Database schemas and API endpoints are defined in the main spec (Option B analytics, audit_logs, admin_users, etc.).
