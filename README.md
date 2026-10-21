# 🌱 EcoSort — AI-Powered Smart Waste Segregation & Sustainable Recycling Platform

> **"Waste Less. Sort Smarter. Live Greener."**  
> EcoSort transforms everyday waste confusion into guided, safe, and verifiable circular recycling actions.

---

## 🏆 Project Highlights & Competition Differentiators

- **Centerpiece AI Waste Scanner**: Multimodal image classification with honest provider abstraction. Connects to cloud vision models when credentials exist, and falls back to a transparent, deterministic rule-based and semantic keyword engine in offline demonstration mode. **Zero fabricated confidence scores.**
- **Smart Disposal Knowledge Base**: Comprehensive encyclopedia of 35+ common household items with step-by-step preparation, segregation instructions, bin requirements, and critical safety warnings (e.g. fire hazards for lithium batteries, mercury hazards for CFLs).
- **Certified Recycling Facility Directory**: Interactive geolocation directory with list and simulated radar map view, distance calculations, operating hours, accepted material streams, and directions.
- **Doorstep Pickup Booking System**: Self-service collection scheduler for bulk dry waste and e-waste with date validation (rejects past dates), time slot selection, and unique booking reference generation (`ECO-2026-XXXX`).
- **Auditable EcoPoints & Environmental Impact**: Gamified sustainability accounting backed by a relational database ledger with unique event constraints that prevent duplicate point farming. Explicitly documented conversion factors based on IPCC municipal solid waste guidelines.
- **Role-Based Admin Console & Audit Log**: Restricted administrator portal (`admin@ecosort.org`) allowing dispatch management, knowledge base curation, and review of immutable security audit logs.
- **Judge Demo Walkthrough**: Fixed top demonstration bar with 1-click test scenarios, quick role switching (Citizen ↔ Admin), and a safe **Reset Demo Data** button to return the platform to pristine state anytime.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 with Vite 8 & TypeScript
- **Styling**: Tailwind CSS v4 with custom environmental color system
- **Icons**: Lucide React
- **Analytics & Visualizations**: Recharts
- **Celebration Feedback**: Canvas Confetti
- **Typography**: Plus Jakarta Sans & Inter via Google Fonts

### Backend & Storage
- **REST API Framework**: Python 3.14 with FastAPI & Uvicorn
- **Input Validation**: Pydantic v2
- **Database**: SQLite 3 with normalized relational schema, foreign key enforcement, and indexes
- **Authentication**: JWT (JSON Web Tokens) with 24-hour expiration and cryptographic hashing
- **Security**: PBKDF2-HMAC-SHA256 password hashing with 200,000 iterations, strict magic bytes inspection for image uploads, and server-side role-based access control (RBAC).

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Python 3.10+ (tested on Python 3.14.2)
- Node.js 18+ (tested on Node.js v24.20.0)

### 1. Backend Setup (FastAPI)
```bash
# Navigate to the server directory
cd server

# Install Python dependencies
pip install fastapi uvicorn pydantic pyjwt cryptography python-multipart

# Initialize and seed the database
python database.py

# Launch the FastAPI backend server
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
Backend will be live at: **`http://127.0.0.1:8000`**  
Interactive Swagger API docs at: **`http://127.0.0.1:8000/docs`**

### 2. Frontend Setup (React + Vite)
```bash
# In a new terminal, navigate to the client directory
cd client

# Install NPM dependencies
npm install

# Start the Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend will be live at: **`http://127.0.0.1:5173`**

---

## 👥 Seeded Demonstration Accounts

For competition judges and evaluators, the application is pre-seeded with two accounts:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Citizen (Demo)** | `demo@ecosort.org` | `DemoEco@2026` | Scanner, Knowledge Base, Pickup Scheduling, Personal Impact & History |
| **Admin (Demo)** | `admin@ecosort.org` | `AdminSort@2026` | All citizen features + Dispatch Queue, Knowledge Base Editor, Facility Manager, Audit Logs |

> 💡 **Tip:** Use the **Instant Demo Sign-In** buttons in the top Judge Demo Bar or inside the Sign-In modal for instant 1-click access without typing credentials.

---

## 🧪 Automated Testing

EcoSort includes an automated regression test suite covering authentication, RBAC boundaries, booking validation, and classification engines:

```bash
# Run the test suite against the running API
python server/test_ecosort.py
```

### Test Coverage Highlights:
- ✅ `test_01_health_and_provider_status`: Health check & honest AI mode disclosure.
- ✅ `test_02_categories_endpoint`: Verifies all 11 standard waste streams exist.
- ✅ `test_03_knowledge_base_search`: Instant search and special safety warning verification.
- ✅ `test_04_classification_analyze`: Categorization, bin matching, and uncertainty flagging.
- ✅ `test_05_auth_login_citizen`: JWT token issuance and `/api/auth/me` verification.
- ✅ `test_06_auth_login_admin`: Administrative role verification.
- ✅ `test_07_confirm_classification_and_points`: Points award and anti-cheat ledger check.
- ✅ `test_08_pickup_booking_past_date_rejection`: Rejection of past dates with 400 Bad Request.
- ✅ `test_09_pickup_booking_valid_flow`: Booking reference generation (`ECO-2026-XXXX`).
- ✅ `test_10_admin_security_rbac_guard`: Enforces 403 Forbidden for citizens accessing admin routes.

---

## 🔒 Security & Privacy Architecture

- **Tamper-Resistant Points Ledger**: Uses database-level unique compound keys `(user_id, event_type, reference_id)` preventing duplicate awards.
- **Upload Inspection**: Magic bytes header inspection prevents disguised executables or malicious files. Maximum file size capped at 5 MB.
- **RBAC Enforcement**: Role checks are performed entirely server-side via FastAPI dependencies (`require_admin`).
- **Privacy Masking**: Citizen names on community leaderboards are automatically masked (e.g. `Priya S.`) to prevent public exposure of private activity.
- **Zero Secret Exposure**: No API keys or database connection strings are bundled into the client build.

---

## 📊 Scientific Methodology for Environmental Impact

EcoSort avoids fabricated carbon offset claims. All calculations derive from recorded sorting events and published standards:
1. **Diverted Mass**: Derived from logged item weights and completed collected pickup tickets.
2. **Avoided CO₂e Emissions**: Calculated at **1.4 kg CO₂e per kg of diverted municipal waste** (IPCC Solid Waste Guidelines for avoided landfill methane).
3. **Paper & Tree Equivalent**: Evaluated at **~60 kg of recycled clean paper pulp per mature tree saved**.

---

## 📁 Repository Structure

```
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Navbar, AuthModal, JudgeDemoBar, CategoryIcon
│   │   ├── context/            # AuthContext with demo quick-login
│   │   ├── pages/              # Landing, Scanner, Guide, Locator, Pickup, Impact, History, Admin
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── App.tsx             # Root view controller
│   │   ├── index.css           # Tailwind v4 environmental styling
│   │   └── main.tsx            # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts          # Vite configuration with Tailwind and API proxy
│
├── server/                     # Python FastAPI Backend
│   ├── database.py             # SQLite schema, migrations & seed data
│   ├── security.py             # PBKDF2 hashing, JWT & RBAC guards
│   ├── classifier.py           # Classification engine & provider abstraction
│   ├── models.py               # Pydantic request/response models
│   ├── main.py                 # REST API endpoints & static file serving
│   ├── test_ecosort.py         # Automated API regression test suite
│   └── ecosort.db              # Seeded demonstration database
│
└── README.md                   # Full documentation & setup instructions
```

© 2026 EcoSort Platform. Developed with pride for Competition Demonstration.
