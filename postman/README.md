# REMSANA Postman Collection

Comprehensive API collection for testing the REMSANA platform: **PHP Core API**, **Node Engagement Service** (fresh deployment: engagement, support tickets, chat).

## Collections

| File | Description | Addon Source |
|------|-------------|--------------|
| `REMSANA_Postman_Collection.json` | Full platform API (Auth, Learning, Admin, Support, Chat) | — |
| `addon-onboarding.postman_collection.json` | Onboarding (GET/PUT/POST complete) | Core API |
| `addon-business-registration.postman_collection.json` | CAC Business Registration (create, step1–4, submit) | Core API |
| `addon-dynamic-data-replacement.postman_collection.json` | Loans, Dashboard, Admin dashboard/summary, alerts | Core API |
| `addon-learning.postman_collection.json` | Learning (programmes, lessons, quizzes, progress, certificates) | Core API |
| `addon-support-tickets.postman_collection.json` | Support tickets (SME + Admin) | addon/remsana-web (ticketApi, insiderTicketApi) |
| `addon-chat.postman_collection.json` | Chat (SME + Admin) | addon/remsana-web (chatApi, insiderChatApi) |
| `addon-core-api.postman_collection.json` | Admin (transactions, videos, system health), Analyst (cohorts, export PDF) | addon/remsana-core-api (patches) |
| `addon-engagement-events.postman_collection.json` | Engagement events (lesson-completed, quiz-completed, certificate-issued) | remsana-engagement-service |

## Import into Postman

1. Open Postman
2. **Import** → **File** → select desired `.json` file(s)
3. For addon collections: set `sme_access_token` (and `insider_access_token` for Admin) from Login response

**Addon collections include test scripts** – each request has assertions (status 2xx, response shape). Run **Collection Runner** to execute all tests. Auto-set variables:
- `addon-business-registration`: `regId` after Create
- `addon-learning`: `lessonId`, `quizId` after Get Programme
- `addon-support-tickets`: `ticketId` after Create Ticket
- `addon-chat`: `conversationId` after Create Conversation, `msgId` after Send Message
- `addon-core-api`: `txnId` from List Transactions, `videoId` from List Videos

## Collection Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `core_base` | `http://localhost:8080` | PHP Core API base URL |
| `engagement_base` | `http://localhost:4000` | Node Engagement Service base URL |
| `support_base` | `http://localhost:4000` | Support Tickets API (via remsana-engagement-service) |
| `chat_base` | `http://localhost:4000` | Chat API (via remsana-engagement-service) |
| `sme_access_token` | (empty) | JWT from SME login – set after `Login (SME)` |
| `sme_refresh_token` | (empty) | Refresh token from SME login |
| `insider_access_token` | (empty) | JWT from Insider login – set after `Login (Insider Admin/Analyst)` |
| `insider_refresh_token` | (empty) | Refresh token from Insider login |
| `challenge_token` | (empty) | MFA challenge token – set from login when `mfa_required` |
| `lessonId` | (empty) | Path param for lesson endpoints |
| `quizId` | (empty) | Path param for quiz endpoints |
| `userId` | (empty) | Path param for admin user endpoints |
| `txnId` | (empty) | Path param for transaction endpoints |
| `regId` | (empty) | Path param for CAC registration endpoints |
| `videoId` | (empty) | Path param for content video endpoints |
| `ticketId` | (empty) | Path param for support ticket endpoints |
| `conversationId` | (empty) | Path param for chat conversation endpoints |
| `msgId` | (empty) | Path param for chat message read endpoints |

## Quick Setup

1. **Start services**
   - Core API: `cd remsana-core-api && php spark serve`
   - Engagement (includes support tickets + chat): `cd remsana-engagement-service && npm start`

2. **SME token**
   - Run `1. Core API - SME Auth` → `Login (SME)`
   - In **Tests** tab add:
     ```js
     const j = pm.response.json();
     if (j.access_token) {
       pm.collectionVariables.set("sme_access_token", j.access_token);
       pm.collectionVariables.set("sme_refresh_token", j.refresh_token || "");
     }
     if (j.challenge_token) pm.collectionVariables.set("challenge_token", j.challenge_token);
     ```

3. **Insider token**
   - Run `5. Core API - Insider Auth` → `Login (Insider Admin/Analyst)`
   - If MFA required: run `Verify MFA (Insider)` with `challenge_token` and `code`
   - Set `insider_access_token` and `insider_refresh_token` from the response

4. **Support ticket / chat IDs**
   - After creating a ticket: set `ticketId` from response
   - After creating a conversation: set `conversationId` from response
   - After sending a message: set `msgId` from response (for Mark Read)

## Endpoints Overview

### 1. Core API – SME Auth (no auth)
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/mfa/challenge`
- `POST /api/v1/auth/mfa/setup` – **Bearer (SME)**
- `POST /api/v1/auth/mfa/verify-setup` – **Bearer (SME)**
- `POST /api/v1/auth/mfa/disable` – **Bearer (SME)**
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout` – **Bearer (SME)**

### 2. Core API – Learning (**Bearer SME**)
- `GET /api/v1/learning/programmes/100DAY_SME`
- `GET /api/v1/learning/lessons/{{lessonId}}`
- `GET /api/v1/learning/progress/me`
- `POST /api/v1/learning/lessons/{{lessonId}}/view`
- `POST /api/v1/learning/lessons/{{lessonId}}/video-progress`
- `POST /api/v1/learning/quizzes/{{quizId}}/attempt`
- `GET /api/v1/learning/certificates`
- `POST /api/v1/learning/certificates`

### 3. Core API – Users & Subscriptions (**Bearer SME**)
- `GET /api/v1/users/me`
- `PUT /api/v1/users/me`
- `GET /api/v1/subscriptions/me`
- `POST /api/v1/subscriptions/upgrade`
- `POST /api/v1/subscriptions/cancel`

### 4. Core API – xAPI (**Bearer SME**)
- `POST /api/v1/xapi/statements`

### 5. Core API – Insider Auth (no auth)
- `POST /api/insider/auth/login`
- `POST /api/insider/auth/verify-mfa` *(body: challenge_token, code)*
- `POST /api/insider/auth/refresh`
- `POST /api/insider/auth/logout` – **Bearer (Insider)**

### 6. Core API – Admin (**Bearer Insider, ADMIN role**)
- Users, Finances, Transactions, CAC, Content, System Health, Audit Logs

### 7. Core API – Analyst (**Bearer Insider, ANALYST role**)
- Metrics, Users, Revenue, Churn, Cohorts, Funnels, Learning, Export

### 8. Engagement Service (Node, port 4000)
- `GET /health` – no auth
- `POST /events/lesson-completed` – optional Bearer
- `POST /events/quiz-completed` – no auth
- `POST /events/certificate-issued` – no auth

### 9. Support Tickets – SME (via engagement service port 4000)
- `GET /health` – no auth
- `GET /tickets` – **Bearer (SME)**
- `POST /tickets` – **Bearer (SME)**
- `GET /tickets/{{ticketId}}` – **Bearer (SME)**
- `POST /tickets/{{ticketId}}/replies` – **Bearer (SME)**

### 10. Support Tickets – Admin (via engagement service port 4000)
- `GET /admin/tickets` – **Bearer (Insider, support:triage)**
- `GET /admin/tickets/{{ticketId}}` – **Bearer (Insider)**
- `PATCH /admin/tickets/{{ticketId}}` – **Bearer (Insider)**
- `POST /admin/tickets/{{ticketId}}/replies` – **Bearer (Insider)**

### 11. Chat – SME (via engagement service port 4000)
- `GET /health` – no auth
- `GET /chat/conversations` – **Bearer (SME)**
- `POST /chat/conversations` – **Bearer (SME)** *(body: optional ticket_id)*
- `GET /chat/conversations/{{conversationId}}` – **Bearer (SME)**
- `POST /chat/conversations/{{conversationId}}/messages` – **Bearer (SME)**
- `POST /chat/conversations/{{conversationId}}/upload` – **Bearer (SME)** *(form-data: file)*
- `PATCH /chat/conversations/{{conversationId}}/messages/{{msgId}}/read` – **Bearer (SME)**

### 12. Chat – Admin (via engagement service port 4000)
- `GET /chat/admin/conversations` – **Bearer (Insider)**
- `GET /chat/admin/conversations/{{conversationId}}` – **Bearer (Insider)**
- `POST /chat/admin/conversations/{{conversationId}}/messages` – **Bearer (Insider)**
- `POST /chat/admin/conversations/{{conversationId}}/upload` – **Bearer (Insider)** *(form-data: file)*
- `PATCH /chat/admin/conversations/{{conversationId}}/messages/{{msgId}}/read` – **Bearer (Insider)**

## Authentication Summary

| Endpoint Group | Auth Required | Token Type |
|----------------|---------------|------------|
| SME Auth (login/register/refresh/forgot/reset) | No | - |
| MFA challenge | No | - |
| Learning, Users, Subscriptions, xAPI | Yes | `sme_access_token` |
| Insider Auth (login/verify-mfa/refresh) | No | - |
| Admin endpoints | Yes | `insider_access_token` (ADMIN) |
| Analyst endpoints | Yes | `insider_access_token` (ANALYST) |
| Support Tickets SME | Yes | `sme_access_token` |
| Support Tickets Admin | Yes | `insider_access_token` |
| Chat SME | Yes | `sme_access_token` |
| Chat Admin | Yes | `insider_access_token` |
| Engagement events | Optional | `sme_access_token` |

## Expected Response Formats

- **Success (200)**: JSON with `data` or direct payload
- **Created (201)**: JSON with created resource
- **Error (4xx/5xx)**: `{ "message": "...", "error": "...", "code": ... }` or similar

Use this collection to:
- Test all endpoints
- Spot missing or inconsistent APIs
- Document request/response shapes
