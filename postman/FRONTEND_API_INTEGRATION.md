# Frontend API Integration Guide

Short, practical guide for how **remsana-web** consumes endpoints from both the **PHP Core API** and the **Node.js Engagement Service**.

---

## 1. API Split Overview

| Backend | Port | Purpose |
|---------|------|---------|
| **PHP Core API** (CodeIgniter 4) | 8080 | Auth, Learning, Dashboard, Loans, Onboarding, CAC, Users, Subscriptions, Admin, Analyst |
| **Node.js Engagement Service** | 4000 | Support Tickets, Chat, Engagement Events (lesson/quiz/certificate) |

The frontend uses **two base URLs**. All API clients attach the appropriate Bearer token from localStorage.

---

## 2. Environment Variables

Add to `remsana-web/.env`:

```env
# PHP Core API (required for main app)
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Node.js Engagement Service (optional – for support tickets & chat)
VITE_ENGAGEMENT_API_URL=http://localhost:4000
```

- If `VITE_ENGAGEMENT_API_URL` is empty, support/chat features are hidden or use mock fallbacks.
- For production, use your deployed URLs.

---

## 3. API Client Mapping

### PHP Core API (`VITE_API_BASE_URL`)

| API Client | Base URL | Endpoints |
|------------|----------|-----------|
| `api` (httpClient) | `http://localhost:8080/api/v1` | Auth, Learning, Dashboard, Loans, Onboarding, CAC, Users, Subscriptions |
| `insiderApi` (httpClient) | `http://localhost:8080/api/insider` | Admin, Analyst, Insider auth |

**Token storage:**
- SME: `localStorage.remsana_auth_token`, `remsana_refresh_token`
- Insider: `localStorage.remsana_insider_auth` (JSON with `access_token`)

**Usage example:**
```ts
import { api } from './api/httpClient';

// GET /api/v1/onboarding
const { data } = await api.get('/onboarding');

// POST /api/v1/learning/lessons/{id}/complete
await api.post(`/learning/lessons/${lessonId}/complete`, {});
```

### Node.js Engagement Service (`VITE_ENGAGEMENT_API_URL`)

| API Client | Base URL | Endpoints |
|------------|----------|-----------|
| `ticketApi` | `http://localhost:4000` | `GET/POST /tickets`, `GET/POST /tickets/:id/replies` |
| `insiderTicketApi` | `http://localhost:4000` | `GET /admin/tickets`, `PATCH /admin/tickets/:id`, `POST /admin/tickets/:id/replies` |
| `chatApi` | `http://localhost:4000/chat` | `GET/POST /conversations`, `GET/POST /conversations/:id/messages`, `POST /conversations/:id/upload` |
| `insiderChatApi` | `http://localhost:4000/chat/admin` | `GET /conversations`, `GET/POST /conversations/:id/messages` |
| `chatSocket` | WebSocket | `ws://localhost:4000` path `/chat/socket.io` – real-time messages |

**Token:** Same `remsana_auth_token` (SME) or `remsana_insider_auth` (Insider) as PHP API.

**Usage example:**
```ts
import { getMyTickets, createTicket } from './api/ticketApi';

const tickets = await getMyTickets();
const ticket = await createTicket({ subject: 'Help', message: '...', priority: 'medium' });
```

---

## 4. Quick Reference: Frontend → Backend

| Frontend Feature | API Client | Backend | Postman Collection |
|------------------|------------|---------|--------------------|
| Login, Register, MFA | `api`, `authApi` | PHP | REMSANA_Postman_Collection |
| Onboarding | `onboardingApi` → `api` | PHP | addon-onboarding |
| Learning (programmes, lessons, quizzes) | `learningApi` → `api` | PHP | addon-learning |
| Dashboard | `dashboardApi` → `api` | PHP | addon-dynamic-data-replacement |
| Loans | `loansApi` → `api` | PHP | addon-dynamic-data-replacement |
| CAC Business Registration | `cacApi` → `api` | PHP | addon-business-registration |
| Support Tickets | `ticketApi` | Node | addon-support-tickets |
| Chat | `chatApi`, `chatSocket` | Node | addon-chat |
| Admin (users, transactions, videos, CAC) | `insiderApi` | PHP | addon-core-api, main collection |
| Analyst (cohorts, export) | `insiderApi` | PHP | addon-core-api |
| Insider Support/Chat | `insiderTicketApi`, `insiderChatApi` | Node | addon-support-tickets, addon-chat |

---

## 5. Integration Checklist

1. **Start both backends**
   - PHP: `cd remsana-core-api && php spark serve`
   - Node: `cd remsana-engagement-service && npm start`

2. **Set `.env`** in remsana-web:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   VITE_ENGAGEMENT_API_URL=http://localhost:4000
   ```

3. **Copy addon API clients** (if not yet integrated):
   - From `addon/remsana-web/api/` → `remsana-web/src/app/api/`
   - `ticketApi.ts`, `insiderTicketApi.ts`, `chatApi.ts`, `chatSocket.ts`, `insiderChatApi.ts`

4. **Install socket.io-client** for chat:
   ```bash
   cd remsana-web && npm install socket.io-client
   ```

5. **Use `hasSupportApi()` / `hasChatApi()`** to conditionally show Support/Chat UI when `VITE_ENGAGEMENT_API_URL` is set.

---

## 6. Postman Collection

**File:** `postman/REMSANA_Postman_Collections.zip`

Contains:
- `REMSANA_Postman_Collection.json` – full platform
- `addon-*.postman_collection.json` – 8 addon collections
- `README.md`

**Import:** Postman → Import → File → select the zip or individual JSON files.

**Variables to set:** `sme_access_token`, `insider_access_token` (from Login responses). Use Collection Runner to execute tests.
