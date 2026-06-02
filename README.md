# 🚀 CareerForge Pro: ATS-Proof Resume Generator & Job Matcher

CareerForge Pro is a production-grade, secure, full-stack AI-ready SaaS platform built for professional candidates to create, optimize, and manage ATS-proof resumes. Designed with high-performance state-management, security protocols, and real-time reactive design, CareerForge Pro features an instant split-screen builder, multi-theme template rendering engines, and real-time layout sorting.

---

## 🏗️ System Architecture & Data Flow

```mermaid
graph TD
    A[Vite + React 19 Frontend] -->|Zustand Global State| B[Optimistic Local Store]
    B -->|Immediate State Sync| C[Live Preview Panel & ATS Score]
    B -->|1.5s Debounced Update API| D[Express.js REST API Backend]
    D -->|Strict Payload & Security Gates| E[Mongoose & MongoDB Schema]
    
    subgraph Security Layer
        F[Helmet Headers]
        G[Express Rate Limiter]
        H[BCrypt & JWT Verification]
    end
    D --> F
```

### Key Engineering Paradigms:
1. **Optimistic UI & Debounced Autosave**: The resume editor binds input actions directly to local Zustand store updates, giving the candidate an instantaneous typing preview. All state transitions trigger a **1.5-second debounced backend save**, shielding the database and network from high-frequency REST updates.
2. **Definitive Resume Schema**: Built with highly organized models supporting nested Work Experience, Education, Technical Skill Keywords (for parser detection), Certifications, Projects, Languages, and custom sections.
3. **Reactive Layout Shuffling**: Uses a dedicated layout order array (`sectionOrder`) allowing candidates to rearrange whole resume blocks (e.g. placing Skills above Experience) on the fly, instantly recalculating the preview layout without complex page refreshes.

---

## 📂 Repository Layout & Clean Directory Tree

```bash
CareerForge-Pro/
├── backend/
│   ├── src/
│   │   ├── config/          # Mongoose Lifecycle hooks
│   │   ├── controllers/     # Controller handlers (Auth, Resumes, ATS feedback)
│   │   ├── middleware/      # JWT gates, Rate limits, Body validator pipelines
│   │   ├── models/          # Strict User & Resume schemas
│   │   ├── routes/          # Clean endpoint routes maps
│   │   └── server.js        # Main Express server entry point
│   ├── .env                 # API Secrets & database credentials
│   └── package.json         # Backend dependency scripts
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static media assets
│   │   ├── components/      # Shared elements (Protected routes)
│   │   ├── pages/           # High-fidelity interfaces (Landing, Dashboard, Builder)
│   │   ├── store/           # Zustand Auth & Resume stores (Autosave loop)
│   │   ├── index.css        # Tailwind v4 import + Premium theme styles
│   │   ├── main.jsx         # React DOM renderer
│   │   └── App.jsx          # Route controller
│   ├── vite.config.js       # Vite configuration with Tailwind v4 compiler
│   └── package.json         # Frontend UI packages
└── README.md                # System documentation
```

---

## 🛠️ Prerequisites & Local Environment

Ensure you have the following installed on your developer workspace:
- **Node.js**: `v18.0.0` or higher
- **NPM**: `v9.0.0` or higher
- **MongoDB**: Local Community Server instance running on port `27017` (or a MongoDB Atlas connection string)

---

## ⚡ Setup & Launch Instructions

Follow these step-by-step instructions to boot up the backend and frontend dev instances locally.

### Step 1: Clone & Setup Global Ignores
Check that sensitive credentials and node modules are blocked from Git tracking:
```bash
# Verify .gitignore at the root
node_modules/
.env
dist/
.DS_Store
```

### Step 2: Configure and Run Backend Service
1. Navigate into the backend directory:
   ```bash
   cd backend
   ```
2. Install production and developer dependencies:
   ```bash
   npm install
   ```
3. Initialize the environment configuration. Create a file named `.env` inside `backend/` and configure:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/careerforge-pro
   JWT_SECRET=cf_pro_super_secret_session_key_2026_xYz
   NODE_ENV=development
   ```
4. Start the backend development server using Nodemon (which automatically hot-reloads on file edits):
   ```bash
   npm run dev
   ```
   *The backend should print: `Server running on port 5000` and `MongoDB Connected successfully`.*

### Step 3: Configure and Run Frontend Service
1. Open a new terminal tab and navigate into the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install UI libraries and peer dependencies cleanly:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Boot up the high-speed Vite server with TailwindCSS compiler:
   ```bash
   npm run dev
   ```
   *The frontend dashboard will build and boot on `http://localhost:5173`.*

---

## 🔒 Security Auditing & Protections

CareerForge Pro incorporates production-grade safety layers directly within its REST controllers and middleware:
- **BCrypt Hashing**: Automatic user pre-save hook that hashes passwords before storing them in MongoDB.
- **Express Rate Limiting**: Restricts high-speed bruteforce requests, permitting a maximum of **100 calls per 15 minutes** per individual IP address.
- **Helmet Headers**: Automatically configures secure HTTP response headers to block cross-site scripting (XSS), sniff attacks, and frame hijacking.
- **JWT Protection Gates**: Custom auth middleware that parses authorization headers to extract user credentials and safeguard endpoints.

---

## 🎨 Creative Theme Customizer Compilers

CareerForge Pro compiles resumes dynamically into three selectable templates:
*   **Modern**: Uses clean geometric titles with custom accent color dividers, perfect for product and marketing managers.
*   **Classic**: Incorporates traditional serif layouts with centered titles and formal borders, perfect for law, finance, and consulting.
*   **Minimalist**: High line height ratios with ultra-tight spacing and clean structural dividers, designed for creative and technology fields.

---

## 📊 Real-time ATS Parsing Estimation Rules
The baseline ATS Optimization engine dynamically analyzes resume completeness on save:
*   **Education completeness**: `+15%`
*   **Work experience lists**: `+20%`
*   **Summary completeness**: `+15%`
*   **Keywords list details**: `+25%`
*   **Certifications & Projects**: `+15%`
*   **Social & Portfolio Links**: `+10%`

*Missing components trigger interactive optimization warnings inside the left panel editor sidebar instantly.*

---

## 🧑‍💻 Pair Programming Team
Designed and constructed with 💙 by **Antigravity** and the **Google DeepMind developer team**.
