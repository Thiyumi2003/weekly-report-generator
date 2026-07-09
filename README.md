# TeamPulse - Weekly Report Generator & Team Dashboard

TeamPulse is a production-ready, feature-rich MERN stack application built for companies to organize and audit weekly reports submitted by employees. It provides team members with a clean dashboard to submit weekly progress logs and gives managers analytical dashboards, project management capabilities, and an AI report assistant powered by OpenAI.

---

## 🌟 Key Features

### 👤 Role-Based Authorization
- **Managers**: Can access all team members' reports, search and filter logs, approve reports, CRUD projects, view Recharts analytics, and converse with the AI Assistant.
- **Team Members**: Can create, edit, save draft, delete, and submit weekly reports for active projects. Access is securely restricted to their own reports.

### 🔒 JWT Authentication & Security
- Complete registration, login, profile view, and cookie-based/header-based session validation.
- Secure password hashing using `bcryptjs`.
- Custom middleware layers block unauthenticated queries and restrict manager endpoints.
- High-fidelity validation on all input fields using `express-validator`.

### 📋 Interactive Report Builder
- Team members can submit weekly summaries with dynamic, growing arrays of:
  - Tasks Completed
  - Tasks Planned (for next week)
  - Impediments & Blockers
- Includes auto-calculation of work hours and validation of the current week (e.g., `YYYY-WXX` format).
- Automatically marks submissions submitted after the Sunday deadline as `Late`.

### 📊 Manager Analytics Panel
- Summary counts tracking Total Reports, Submitted logs, Pending drafts, and active Open Blockers.
- Responsive charts designed with **Recharts**:
  - **Bar Chart**: Tasks Completed vs. Planned.
  - **Pie Chart**: Submission status distribution (Draft, Submitted, Late, Approved).
  - **Doughnut Chart**: Worked hours division by Project.
  - **Line Chart**: Report submission trend over weeks.

### 🤖 AI Team Assistant (Bonus)
- Managers can submit natural-language questions to summarize team achievements or list blockers.
- **Dual-Mode AI**: Uses OpenAI's chat completion API if configured with a key. If no key is set, it falls back to a smart local search query parser that scans the MongoDB collections directly, keeping the feature functional in demo runs.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 (Vite), React Router DOM v7, Tailwind CSS v4, Axios, React Hook Form, React Icons, Recharts.
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose), JWT, bcryptjs, express-validator, dotenv.
- **Root tooling**: `concurrently` (coordinates running backend & frontend servers together).

---

## 📁 Repository Structure

```
weekly-report-generator/ (Workspace Root)
├── package.json (Root scripts for workspace setup)
├── README.md
├── backend/
│   ├── config/ (db, openai)
│   ├── controllers/ (auth, project, report, dashboard)
│   ├── middleware/ (auth, error, validation)
│   ├── models/ (User, Project, WeeklyReport)
│   ├── routes/ (auth, project, report, dashboard)
│   ├── validations/ (auth, project, report)
│   ├── seed.js (Database seeding script)
│   ├── server.js (Express server entry point)
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── components/ (Navbar, Sidebar, Button, Inputs, Modals, Loader, etc.)
        ├── context/ (AuthContext)
        ├── hooks/ (useAuth)
        ├── layouts/ (DashboardLayout)
        ├── pages/ (Home, Login, Register, Dashboard, MyReports, CreateReport, EditReport, Projects, ManagerDashboard, Analytics, Profile, AIAssistant, NotFound)
        ├── services/ (api)
        ├── App.jsx
        ├── index.css
        └── main.jsx
```

---

## 🚀 Installation & Local Run

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (local database server, or a MongoDB Atlas connection URI)

### 2. Install Dependencies
Open your shell at the workspace root directory and run the helper installer script:
```bash
npm run install:all
```
*This installs root dependencies (`concurrently`), backend packages (`mongoose`, `express`, `jsonwebtoken`), and frontend assets (`recharts`, `tailwindcss`).*

### 3. Setup Environment Variables
Configure the backend environmental parameters by copying the example template:
```bash
cp backend/.env.example backend/.env
```
Open `backend/.env` and update credentials if needed:
- `MONGODB_URI`: set your MongoDB connection string (defaults to `mongodb://localhost:27017/teampulse`).
- `JWT_SECRET`: change this to a secure random string.
- `OPENAI_API_KEY`: set your OpenAI API developer key if you want real AI completions (leave blank for local demo mode).

### 4. Seed the Database
Seed the database collections with 1 Manager, 3 Team Members, 4 Projects, and 9 historical Weekly Reports across weeks:
```bash
npm run seed
```
*Console output will display confirmation of created records.*

### 5. Launch Development Servers
Start both the backend API server (port 5000) and the frontend Vite web server (port 5173) concurrently:
```bash
npm run dev
```
Open your browser and navigate to: **[http://localhost:5173](http://localhost:5173)**.

---

## 🎯 Demo Login Credentials

For evaluation or grading, click the "Demo Sign In" button on the login screen or quick-fill using:
- **Manager Account**:
  - Email: `manager@teampulse.com`
  - Password: `password123`
- **Team Member Account** (John Doe):
  - Email: `john@teampulse.com`
  - Password: `password123`

---

## 🔌 API Documentation

All API endpoints are prefixed with `/api`. Authenticated routes expect a JWT token passed in the `Authorization` header as `Bearer <token>` or stored inside cookies.

### 🔐 Authentication (`/api/auth`)
- `POST /register`: Registers a new user (Manager or Team Member).
- `POST /login`: Log in and return JWT token. Sets cookie.
- `POST /logout`: Clear cookies and end session.
- `GET /me`: Return current user profile information.
- `GET /members`: Return a list of all registered team members (Manager role required).

### 📂 Projects (`/api/projects`)
- `GET /`: Retrieve all projects.
- `POST /`: Create a new project (Manager role required).
- `PUT /:id`: Update project details (Manager role required).
- `DELETE /:id`: Archive/Delete project (Manager role required).

### 📝 Reports (`/api/reports`)
- `GET /`: List weekly reports. (Members only see their own; Managers see all). Supports filters: `?week=...&project=...&member=...&status=...&search=...`
- `GET /:id`: Fetch a single report details.
- `POST /`: Submit or save draft weekly report.
- `PUT /:id`: Update report details. (Members cannot modify Approved reports).
- `DELETE /:id`: Delete report (Draft status only).

### 📊 Dashboard & AI (`/api/dashboard`)
- `GET /summary`: Returns cards summary metrics.
- `GET /charts`: Returns aggregated counts formatted for Recharts charts and recent activity lists.
- `POST /ai`: Submits queries to the OpenAI summary service (Manager role required).

---

## ☁️ Deployment Ready

### Backend (Render)
1. Commit the repository to GitHub.
2. Create a new Web Service on Render linking the repo.
3. Configure settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Register environment variables in Render Dashboard (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` pointing to frontend domain, `OPENAI_API_KEY`).

### Frontend (Vercel)
1. Open the Vercel dashboard and Import Project.
2. Select repository and set parameters:
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Click Deploy.
