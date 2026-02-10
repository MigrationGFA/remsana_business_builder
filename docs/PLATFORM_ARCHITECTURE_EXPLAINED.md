# REMSANA Platform Architecture - Team Guide

**Purpose**: This document explains the REMSANA platform architecture in clear, technical terms for your development team. It covers what we built, why we built it this way, and how it all works together.

---

## Table of Contents

1. [What is REMSANA?](#what-is-remsana)
2. [High-Level Architecture](#high-level-architecture)
3. [Why This Architecture?](#why-this-architecture)
4. [How It Works](#how-it-works)
5. [Key Components Explained](#key-components-explained)
6. [Data Flow & Storage](#data-flow--storage)
7. [Security Model](#security-model)
8. [Development Workflow](#development-workflow)
9. [Technology Choices](#technology-choices)

---

## What is REMSANA?

**REMSANA** is a digital platform designed specifically for Nigerian Small and Medium Enterprises (SMEs). Think of it as a "business school + registration assistant + support system" all in one.

### What It Does

1. **Business Registration**: Helps SMEs register their businesses with CAC (Corporate Affairs Commission) through a guided, step-by-step process.

2. **100-Day Learning Programme**: Provides structured business education through video lessons, quizzes, and downloadable resources. Users progress day-by-day, earning certificates upon completion.

3. **Business Registration Loans**: Offers loans specifically to cover the ₦25,000 business registration fee. Users can borrow the registration fee and repay it monthly, making business registration more accessible.

4. **Admin & Analytics**: Internal dashboards for platform administrators and analysts to manage users, track metrics, and monitor system health.

### Who Uses It

- **SME Owners** (Primary Users): Register businesses, take courses, access loans to pay registration fees
- **Administrators**: Manage users, content, finances, system operations
- **Analysts**: View metrics, generate reports, analyze user behavior

---

## High-Level Architecture

REMSANA follows a **microservices-inspired architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACES                            │
├─────────────────────┬───────────────────────────────────────┤
│  Web App (React)    │  Mobile App (React Native)             │
│  Port: 5173         │  iOS & Android                         │
└──────────┬──────────┴──────────────┬────────────────────────┘
           │                          │
           │  HTTP/REST APIs          │
           │                          │
┌──────────▼──────────┐    ┌──────────▼──────────┐
│   PHP Core          │    │  Node.js Service    │
│   (CodeIgniter 4)   │    │  (Express)          │
│   Port: 8080        │    │  Port: 4000          │
│                     │    │                      │
│  • Authentication   │    │  • Notifications    │
│  • User Management  │    │  • Email/SMS        │
│  • Learning Content  │    │  • Event Processing │
│  • Subscriptions    │    │  • Real-time Events │
│  • Analytics         │    │                      │
└──────────┬──────────┘    └──────────┬──────────┘
           │                          │
           │                          │
           └──────────┬───────────────┘
                      │
           ┌──────────▼──────────┐
           │   MySQL Database   │
           │   Port: 3306       │
           │                     │
           │  • User Data        │
           │  • Learning Data    │
           │  • Analytics        │
           │  • Audit Logs       │
           └─────────────────────┘
```

### The Three Layers

1. **Frontend Layer**: React web app + React Native mobile app
2. **Backend Layer**: PHP (authoritative core) + Node.js (engagement services)
3. **Data Layer**: MySQL database storing all persistent data

---

## Why This Architecture?

### 1. **Separation of Concerns**

**PHP Core (Authoritative)**: Handles all "source of truth" operations
- User identity and authentication
- Business data and subscriptions
- Learning content and progress
- Financial transactions
- Audit logs

**Why PHP?** 
- Mature, stable framework (CodeIgniter 4)
- Excellent for CRUD operations
- Strong database integration
- Easy to maintain and debug
- Well-suited for authoritative data operations

**Node.js Service (Behavioural)**: Handles all "engagement" operations
- Email notifications
- SMS/WhatsApp messages
- Real-time event processing
- Push notifications
- Background jobs

**Why Node.js?**
- Excellent for async operations (emails, SMS)
- Great ecosystem for integrations (Twilio, SendGrid)
- Fast for I/O-bound tasks
- Easy to scale horizontally

### 2. **Scalability**

- **Frontend**: Can be deployed to CDN (Vercel, Netlify, AWS CloudFront)
- **PHP Core**: Can scale vertically (bigger server) or horizontally (load balancer + multiple instances)
- **Node Service**: Can scale horizontally easily (multiple instances behind load balancer)
- **Database**: Can use read replicas for analytics queries

### 3. **Maintainability**

- Clear ownership: PHP owns data, Node owns engagement
- Teams can work independently
- Easy to test each component separately
- Clear API contracts between services

### 4. **Technology Fit**

- **React**: Industry standard, great developer experience, large ecosystem
- **React Native**: Write once, deploy to iOS and Android
- **MySQL**: Reliable, well-understood, good tooling (MySQL Workbench)
- **PHP/CodeIgniter**: Battle-tested, many developers know it
- **Node.js**: Perfect for async operations

---

## How It Works

### User Request Flow

**Example: User logs in and views a lesson**

```
1. User opens web app (React)
   ↓
2. User enters email/password, clicks "Login"
   ↓
3. React app sends POST request to PHP backend:
   POST /api/v1/auth/login
   { email: "user@example.com", password: "..." }
   ↓
4. PHP backend:
   - Validates credentials against MySQL
   - Generates JWT token
   - Returns token + user info
   ↓
5. React app stores token, redirects to dashboard
   ↓
6. User clicks "Start Lesson"
   ↓
7. React app sends GET request:
   GET /api/v1/learning/lessons/{lessonId}
   Authorization: Bearer {token}
   ↓
8. PHP backend:
   - Validates token
   - Fetches lesson from MySQL
   - Returns lesson data (video URL, quiz, resources)
   ↓
9. React app displays lesson player
   ↓
10. User watches video, React tracks progress
    ↓
11. React sends progress updates:
    POST /api/v1/learning/lessons/{lessonId}/video-progress
    { watchedSeconds: 120, durationSeconds: 600 }
    ↓
12. PHP backend:
    - Updates progress in MySQL
    - Records analytics event
    - Optionally triggers Node service for notifications
    ↓
13. Node service (if triggered):
    - Sends email: "Great progress on Lesson 5!"
    - Updates user engagement metrics
```

### Data Flow

**Learning Progress Example:**

```
User Action (Frontend)
    ↓
API Call (HTTP Request)
    ↓
PHP Controller (Validates, Processes)
    ↓
PHP Model (Database Query)
    ↓
MySQL Database (Stores Data)
    ↓
Analytics Event (Optional)
    ↓
Node Service (Processes Event)
    ↓
External Services (Email/SMS)
```

---

## Key Components Explained

### 1. **Frontend (React Web App)**

**Location**: `src/app/`

**What It Does**:
- Renders all user interfaces
- Handles user interactions
- Makes API calls to backend
- Manages client-side state
- Handles routing (React Router)

**Key Files**:
- `pages/`: All page components (Login, Dashboard, Learning, etc.)
- `components/`: Reusable UI components
- `api/`: API client functions (calls to backend)
- `App.tsx`: Main router, defines all routes

**How It Connects to Backend**:
- Uses Axios HTTP client
- Reads `VITE_API_BASE_URL` from environment
- Automatically adds auth token to requests
- Handles errors and retries

### 2. **PHP Core (CodeIgniter 4)**

**Location**: `backend-php/app/`

**What It Does**:
- Handles all business logic
- Manages database operations
- Validates user input
- Generates JWT tokens
- Serves API endpoints

**Key Components**:

**Controllers** (`app/Controllers/Api/`):
- `Auth.php`: Login, logout, token refresh
- `Learning.php`: Lessons, quizzes, progress, certificates
- `Users.php`: User profile management
- `Subscriptions.php`: Subscription management
- `Insider/Admin.php`: Admin dashboard endpoints
- `Insider/Analyst.php`: Analyst dashboard endpoints

**Models** (`app/Models/`):
- `UserModel.php`: User database operations
- `LearningProgrammeModel.php`: Learning content operations
- `AnalyticsEventModel.php`: Analytics event storage

**Migrations** (`app/Database/Migrations/`):
- Define database schema
- Create tables (users, lessons, quizzes, etc.)
- Run with: `php spark migrate`

**Filters** (`app/Filters/`):
- `Auth.php`: Validates JWT tokens
- `InsiderAuth.php`: Validates admin/analyst tokens

**Routes** (`app/Config/Routes.php`):
- Defines all API endpoints
- Maps URLs to controllers
- Applies filters (auth, permissions)

### 3. **Node.js Engagement Service**

**Location**: `engagement-node/src/`

**What It Does**:
- Listens for events from PHP core
- Sends emails, SMS, WhatsApp messages
- Processes background jobs
- Handles real-time notifications

**Key Endpoints**:
- `POST /events/lesson-completed`: Triggered when user completes lesson
- `POST /events/quiz-completed`: Triggered when user completes quiz
- `POST /events/certificate-issued`: Triggered when certificate is issued

**How It Works**:
1. PHP core sends event to Node service (via HTTP or message queue)
2. Node service processes event
3. Node service calls external APIs (SendGrid, Twilio)
4. Node service logs result

### 4. **MySQL Database**

**Location**: MySQL server (separate from code)

**What It Stores**:

**Core Tables**:
- `users`: SME user accounts
- `admin_users`: Admin/analyst accounts
- `subscriptions`: User subscription tiers
- `audit_logs`: All admin actions

**Learning Tables**:
- `learning_programmes`: The 100-day programme
- `learning_modules`: Groups of lessons (Day 1-5, Day 6-10, etc.)
- `learning_lessons`: Individual lessons
- `learning_quizzes`: Quizzes for lessons
- `learning_lesson_progress`: User progress tracking
- `learning_certificates`: Certificates issued
- `learning_xapi_statements`: xAPI learning events

**Analytics Tables**:
- `analytics_events`: All platform events
- `analytics_learning_events`: Learning-specific events
- `analytics_daily_revenue`: Daily revenue aggregates
- `analytics_daily_churn`: Churn tracking
- `analytics_daily_user_cohorts`: User cohort data

**Why MySQL?**
- Reliable and proven
- Good performance for structured data
- Excellent tooling (MySQL Workbench)
- Easy to backup and restore
- Good for analytics queries

---

## Data Flow & Storage

### Authentication Flow

```
1. User enters credentials
   ↓
2. Frontend sends to PHP: POST /api/v1/auth/login
   ↓
3. PHP validates against MySQL users table
   ↓
4. PHP generates JWT token (contains user ID, email, tier)
   ↓
5. PHP returns token to frontend
   ↓
6. Frontend stores token in localStorage
   ↓
7. Frontend includes token in all future requests:
   Authorization: Bearer {token}
   ↓
8. PHP validates token on each request
```

### Learning Progress Flow

```
1. User watches lesson video
   ↓
2. Frontend tracks video position
   ↓
3. Frontend sends progress: POST /api/v1/learning/lessons/{id}/video-progress
   ↓
4. PHP updates learning_lesson_progress table
   ↓
5. PHP records analytics event in analytics_learning_events
   ↓
6. (Optional) PHP triggers Node service for notification
   ↓
7. Node service sends email/SMS
```

### Analytics Flow

```
1. User action occurs (login, lesson view, quiz completion)
   ↓
2. PHP records event in analytics_events or analytics_learning_events
   ↓
3. Background job (cron) aggregates daily:
   - Calculates daily revenue
   - Calculates churn rates
   - Updates cohort data
   ↓
4. Admin/Analyst dashboards query aggregated tables
   ↓
5. Fast queries (no need to scan millions of events)
```

---

## Security Model

### Authentication

**JWT Tokens**:
- Short-lived access tokens (24 hours)
- Long-lived refresh tokens (30 days)
- Tokens contain user ID, email, subscription tier
- Tokens signed with secret key (stored in `.env`)

**Multi-Factor Authentication (MFA)**:
- Required for admin/analyst accounts
- Uses TOTP (Time-based One-Time Password)
- 6-digit codes from authenticator app

### Authorization

**Role-Based Access Control (RBAC)**:
- **SME Users**: Can access their own data, learning content
- **Admin**: Full access to users, finances, content, system
- **Analyst**: Read-only access to metrics and reports

**How It Works**:
- JWT token contains user role
- PHP filters check role before allowing access
- Frontend hides UI elements based on role

### Data Protection

**Password Hashing**:
- All passwords hashed with `password_hash()` (bcrypt)
- Never stored in plain text

**SQL Injection Prevention**:
- CodeIgniter uses prepared statements
- Never concatenate user input into SQL

**XSS Prevention**:
- React automatically escapes content
- Never render raw HTML from user input

**CORS**:
- Only allows requests from approved origins
- Configured in PHP backend

**HTTPS**:
- Required in production
- Encrypts all data in transit

---

## Development Workflow

### Setting Up Locally

**1. Frontend (React)**:
```bash
npm install
cp .env.example .env
# Edit .env: VITE_API_BASE_URL=http://localhost:8080/api/v1
npm run dev
# Opens http://localhost:5173
```

**2. Backend (PHP)**:
```bash
cd backend-php
composer install
cp .env.example .env
# Edit .env: database credentials, JWT secrets
php spark migrate  # Creates all tables
php spark db:seed AdminUserSeeder  # Creates admin users
php spark serve  # Starts server on http://localhost:8080
```

**3. Node Service**:
```bash
cd engagement-node
npm install
cp .env.example .env
# Edit .env: API keys for SendGrid, Twilio
npm start  # Starts on http://localhost:4000
```

**4. Database (MySQL)**:
```bash
# Install MySQL 8
# Create database: remsana_core
# Update backend-php/.env with credentials
```

### Making Changes

**Adding a New API Endpoint**:

1. **Define Route** (`backend-php/app/Config/Routes.php`):
   ```php
   $routes->get('api/v1/new-endpoint', 'NewController::method');
   ```

2. **Create Controller** (`backend-php/app/Controllers/Api/NewController.php`):
   ```php
   public function method() {
       // Logic here
       return $this->respond($data);
   }
   ```

3. **Create Model** (if needed) (`backend-php/app/Models/NewModel.php`)

4. **Call from Frontend** (`src/app/api/newApi.ts`):
   ```typescript
   export async function getNewData() {
       const response = await api.get('/new-endpoint');
       return response.data;
   }
   ```

5. **Use in Component** (`src/app/pages/SomePage.tsx`):
   ```typescript
   const data = await getNewData();
   ```

### Database Changes

**Adding a New Table**:

1. **Create Migration**:
   ```bash
   php spark make:migration CreateNewTable
   ```

2. **Edit Migration** (`app/Database/Migrations/...`):
   ```php
   public function up() {
       $this->forge->addField([...]);
       $this->forge->createTable('new_table');
   }
   ```

3. **Run Migration**:
   ```bash
   php spark migrate
   ```

4. **Create Model** (`app/Models/NewTableModel.php`)

---

## Technology Choices

### Frontend: React + Vite

**Why React?**
- Industry standard, huge ecosystem
- Component-based architecture (reusable code)
- Great developer tools
- Large talent pool

**Why Vite?**
- Fast development server
- Fast builds
- Modern tooling
- Great developer experience

### Backend: PHP (CodeIgniter 4)

**Why PHP?**
- Mature, stable language
- Many developers know it
- Good for CRUD operations
- Excellent database integration
- Easy to deploy

**Why CodeIgniter 4?**
- Lightweight framework
- Good documentation
- Active community
- Built-in security features
- Easy to learn

### Database: MySQL 8

**Why MySQL?**
- Reliable and proven
- Good performance
- Excellent tooling (MySQL Workbench)
- Easy to backup/restore
- Good for analytics queries

### Engagement: Node.js

**Why Node.js?**
- Perfect for async operations
- Great for I/O-bound tasks (emails, SMS)
- Excellent ecosystem (npm packages)
- Easy to integrate with external APIs
- Fast development

---

## Key Concepts Explained

### JWT Tokens

**What**: JSON Web Tokens - a way to securely transmit user identity

**Why**: Stateless authentication (server doesn't need to store sessions)

**How**: 
- Token contains user info (ID, email, role)
- Token signed with secret key
- Server validates signature on each request
- Token expires after set time

### xAPI (Experience API)

**What**: Standard for tracking learning experiences

**Why**: Industry standard for learning analytics

**How**:
- Records events like "user completed lesson"
- Stores in `learning_xapi_statements` table
- Can be exported to learning analytics platforms
- Enables detailed learning analytics

### Event-Driven Analytics

**What**: Recording every user action as an event

**Why**: 
- Detailed analytics
- Can answer any question ("How many users completed lesson 5?")
- Can aggregate into dashboards

**How**:
- Every action creates event in `analytics_events` table
- Background jobs aggregate into daily tables
- Dashboards query aggregated tables (fast)

### Microservices Architecture

**What**: Breaking application into separate services

**Why**:
- Each service can scale independently
- Teams can work independently
- Clear ownership boundaries
- Easier to maintain

**In REMSANA**:
- PHP Core: Authoritative data
- Node Service: Engagement/notifications
- Frontend: User interface

---

## Common Questions

### Q: Why not use one backend (just PHP or just Node)?

**A**: We could, but separating them gives us:
- Better scalability (can scale Node independently)
- Clear ownership (PHP owns data, Node owns engagement)
- Technology fit (PHP great for CRUD, Node great for async)

### Q: Why MySQL instead of PostgreSQL or MongoDB?

**A**: MySQL is:
- Reliable and proven
- Good for structured data (users, lessons, quizzes)
- Easy to use with MySQL Workbench
- Good performance for our use case

### Q: Can we add more services later?

**A**: Yes! The architecture supports adding:
- Payment service (Stripe, Paystack)
- File storage service (AWS S3)
- Search service (Elasticsearch)
- Real-time service (WebSockets)

### Q: How do we handle errors?

**A**: 
- Frontend: Error boundaries catch React errors
- Backend: Try-catch blocks, return error responses
- Database: Transactions for data integrity
- Logging: All errors logged for debugging

### Q: How do we test?

**A**:
- **Unit Tests**: Test individual functions
- **Integration Tests**: Test API endpoints
- **E2E Tests**: Test full user flows
- **Manual Testing**: Test in browser/mobile app

---

## Summary

**REMSANA** is a platform that helps Nigerian SMEs register businesses, learn business skills, and access loans specifically to cover business registration fees.

**Architecture**:
- **Frontend**: React (web) + React Native (mobile)
- **Backend**: PHP Core (data) + Node Service (engagement)
- **Database**: MySQL (all persistent data)

**Why This Way**:
- Clear separation of concerns
- Scalable and maintainable
- Technology fit for each job
- Easy for teams to work independently

**How It Works**:
- Users interact with frontend
- Frontend calls PHP APIs
- PHP handles business logic and database
- Node handles notifications and engagement
- All data stored in MySQL

This architecture gives us flexibility, scalability, and maintainability while using proven technologies your team likely already knows.

---

**Questions?** Refer to:
- `IMPLEMENTATION_COMPLETE.md` - Setup instructions
- `backend-php/README.md` - PHP backend details
- `engagement-node/README.md` - Node service details
- `PRODUCTION_READINESS_AUDIT.md` - Production checklist
