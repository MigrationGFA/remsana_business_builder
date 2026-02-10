# REMSANA Business Builder

**Status**: ⚠️ **Development / Prototype** - Backend implementation required for production

This repository contains the complete frontend implementation (React web + Expo mobile) and backend architecture design for the REMSANA SME Business Builder platform.

**Original Design**: https://www.figma.com/design/4cYe5d5idQXfUhJ3tF0YXv/REMSANA-Business-Builder

---

## 📋 What's Included

### ✅ Frontend (Complete)
- **Web App** (React + Vite): Complete UI flows for onboarding, business registration, 100-day learning programme, loans, admin/analyst dashboards
- **Mobile App** (Expo React Native): Complete mobile flows for registration, loans, learning

### ✅ Backend Architecture (Designed, Not Implemented)
- **PHP Core** (`backend-php/`): CodeIgniter 4 skeleton with setup instructions
- **Node Service** (`engagement-node/`): Engagement/behavioural service skeleton
- **MySQL Schema**: Complete database design (MySQL 8 compatible, Workbench-ready)
- **API Contracts**: All REST endpoints specified
- **xAPI Integration**: Learning event tracking patterns defined

### ⚠️ What's Missing (Required for Production)
- **Backend Implementation**: PHP/CodeIgniter 4 controllers, migrations, models not yet built
- **Database**: MySQL instance not set up
- **Security**: Production hardening not complete
- **Testing**: No test suite
- **Documentation**: API docs, deployment guides incomplete

---

## 🚀 Quick Start (Frontend Only)

### Web App
```bash
npm install
npm run dev
# Open http://localhost:5173
```

### Mobile App
```bash
cd mobile
npm install
npm start
# Follow Expo instructions
```

**Note**: Currently uses mock data. Backend must be implemented for real functionality.

---

## 🔧 Backend Setup (Required for Production)

See **[QUICK_START_BACKEND.md](./QUICK_START_BACKEND.md)** for step-by-step backend implementation guide.

**Quick Summary:**
1. Set up MySQL 8 database
2. Install CodeIgniter 4 in `backend-php/`
3. Create migrations and controllers
4. Set up Node engagement service
5. Wire frontends to backend APIs

---

## 📊 Production Readiness

**See [PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md)** for comprehensive audit.

**Current Status**: ⚠️ **NOT PRODUCTION READY**

**Key Blockers:**
- No backend implementation
- Mock data throughout frontend
- Security not hardened
- No database persistence

**Estimated Time to Production**: 12-18 weeks with dedicated team

---

## 📁 Project Structure

```
REMSANA-Business-Builder-1/
├── src/                    # React web app
│   ├── app/
│   │   ├── pages/         # All page components
│   │   ├── components/    # UI components
│   │   └── api/          # API clients (ready for backend)
│   └── ...
├── mobile/                # Expo React Native app
│   └── src/
│       ├── screens/       # Mobile screens
│       └── api/          # API client (ready for backend)
├── backend-php/          # CodeIgniter 4 skeleton (README only)
├── engagement-node/      # Node service skeleton (README only)
└── docs/                 # Documentation
```

---

## 🏗️ Architecture

**Designed Architecture:**
- **PHP (CodeIgniter 4)**: Authoritative core (Identity, Subscriptions, Finance, Learning, Audit)
- **Node.js**: Behavioural services (Engagement, Notifications, Real-time)
- **MySQL 8**: Canonical state + Analytics (Workbench-compatible)
- **React/Expo**: All user interfaces

See execution architecture document for ownership boundaries and rules.

---

## 📚 Documentation

- **[PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md)** - Complete audit of current state
- **[QUICK_START_BACKEND.md](./QUICK_START_BACKEND.md)** - Backend setup guide
- **[INSIDER_ADMIN_README.md](./INSIDER_ADMIN_README.md)** - Admin portal usage
- **[backend-php/README.md](./backend-php/README.md)** - PHP backend setup
- **[engagement-node/README.md](./engagement-node/README.md)** - Node service setup

---

## 🔐 Security Note

**⚠️ This codebase contains test credentials and mock authentication for development purposes only.**

**DO NOT deploy to production without:**
1. Implementing real backend authentication
2. Removing all test credentials
3. Implementing proper security measures
4. Completing security audit

---

## 📝 Next Steps

1. **Review** `PRODUCTION_READINESS_AUDIT.md` for complete status
2. **Follow** `QUICK_START_BACKEND.md` to implement backend
3. **Wire** frontends to real APIs (remove mocks)
4. **Harden** security before any production deployment

---

## 🤝 Contributing

This is a development/prototype codebase. Before contributing:
1. Review the architecture documents
2. Follow the execution architecture rules
3. Ensure backend implementation aligns with PHP/Node ownership boundaries
4. Remove mock data when implementing real features

---

**Last Updated**: January 27, 2026  
**Version**: 1.0 (Prototype)
  