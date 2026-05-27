# Phoenix Gym Admin System (Full-Stack Monorepo)

Welcome to the enterprise-level, production-ready **Phoenix Gym Admin System** monorepo! This repository contains both the high-fidelity responsive frontend dashboard and the secure JWT-protected Node.js Express REST API backend database service.

## 📂 Repository Layout
- **`frontend/`**: Single Page Application built using React.js (Vite), styled with Tailwind CSS, Lucide icons, Framer Motion, and dynamic Chart.js dashboards.
- **`backend/`**: REST API backend built using Node.js, Express, and MongoDB (Mongoose ODM). Includes secure JWT login gating, custom plans setup, invoicing tracking, reports compilation, and twilio/whatsapp notification servers.

## 🚀 Running Locally

### 1. Starting the Frontend
```bash
cd frontend
npm install
npm run dev
```
*Access on `http://localhost:5173/`* (Demo: `admin@phoenixgym.com` / `admin123`)

### 2. Starting the Backend
```bash
cd backend
npm install
npm run dev
```
*Access on `http://localhost:5000/`* (Admin Username: `Phoenix03` / Password: `PhoenixUlaga03`)

---

## 🔒 Security & Deployment Configurations
For complete detailed documentation on database configurations, environment variable mappings, system architecture specifications, and Step-by-Step Production Deployment procedures, refer to our system guides.
