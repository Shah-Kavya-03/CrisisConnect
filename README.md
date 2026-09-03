# CrisisConnect – Real-Time Emergency Assistance & Community Response Platform

> **Connect. Respond. Save Lives.**  
> A centralized, real-time emergency assistance and disaster response platform connecting citizens in urgent need with verified volunteers, NGOs, and authorized agencies during natural disasters, medical emergencies, accidents, and crisis situations.

---

## 🌟 Highlights & 6 Innovational Systems

1. **AI Spatio-Temporal Duplicate Suppression Engine (`/api/ai/check-duplicate`)**:
   - Evaluates incoming emergency calls against existing incidents using a composite similarity vector:
     $$\text{Score} = 0.55 \cdot \text{TextSimilarity} + 0.30 \cdot \text{GeoProximity} + 0.15 \cdot \text{CategoryMatch}$$
   - Prevents dispatching multiple NGO units or ambulances to the exact same incident while clustering reports for first responders.

2. **Automated AI Distress Severity & Urgency Triage (`/api/ai/score-urgency`)**:
   - Natural language processing engine that analyzes high-threat indicators (*trapped, drowning, oxygen cylinder, infant, cardiac, rising water*) and assigns calibrated 0–100 priority scores to automatically bubble life-critical requests to the top of volunteer feeds.

3. **Offline & Low-Bandwidth Burst Sync Queue**:
   - Designed for disaster zones where cellular towers collapse. LocalStorage / IndexedDB queue captures SOS alerts with GPS coordinates offline, burst-synchronizing immediately upon re-establishing connection.

4. **Dynamic Volunteer Trust & Proof-of-Help Engine**:
   - Calculates dynamic responder trust ratings (0–100) based on verified response speed, on-site check-in within 100m of incident site, and requester feedback.

5. **Geo-Spatial Skill & Equipment Dispatcher**:
   - Matches requests with responders based on distance, vehicle capability (inflatable boats for water rescues, 4x4 off-road SUVs for landslides), and specialized skills (certified doctors, paramedics, first-aid).

6. **Auto-Expiring Life-Preserving Lease System**:
   - Background cron daemon automatically flags stale unrenewed requests as `Expired` after 4 hours with 1-click renewal for citizens, preventing relief teams from traveling to already-evacuated locations.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend / Client** | React 18, Vite, Tailwind CSS, Lucide React, Leaflet Maps, React-Leaflet, Axios, Socket.io-client |
| **Backend Gateway** | Node.js, Express.js, Socket.io (WebSockets), JWT Authentication, Helmet, Morgan, Express-Rate-Limit |
| **AI Microservice** | Python 3.11, FastAPI, Uvicorn, Scikit-Learn (TF-IDF & Cosine Similarity), Pydantic, NumPy |
| **Database** | MongoDB with Mongoose ODM & native `2dsphere` GeoJSON indexing |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## 📁 Repository Structure

```
CrisisConnect/
├── README.md                                  # Platform overview & setup
├── .gitignore                                 # Root Git ignore
├── docker-compose.yml                         # Multi-container orchestration
│
├── client/                                    # React 18 frontend monorepo client
│   ├── public/favicon.ico
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                            # Tab routing & state management
│       ├── index.css                          # Custom animations & styles
│       ├── components/
│       │   ├── CrisisMap.jsx                  # Leaflet interactive map & markers
│       │   ├── DemoBar.jsx                    # 1-Click evaluator flow switcher
│       │   ├── Navbar.jsx                     # Topbar with auth & connectivity toggle
│       │   └── SosModal.jsx                   # 1-Tap SOS panic dispatch modal
│       ├── context/
│       │   └── CrisisContext.jsx              # Hybrid online/offline state engine
│       ├── pages/
│       │   ├── LandingPage.jsx                # Platform overview & stats
│       │   ├── RequesterDashboard.jsx         # Citizen portal with SOS button
│       │   ├── VolunteerDashboard.jsx         # Urgency-ranked feed & accept flow
│       │   ├── AdminDashboard.jsx             # Overwatch heatmap & unmet demand
│       │   ├── RequestCreationPage.jsx        # Voice-to-text & request creation
│       │   ├── RequestDetailsPage.jsx         # Live dispatch timeline & map
│       │   ├── AiTriagePage.jsx               # NLP keyword extraction analytics
│       │   ├── DuplicateModerationPage.jsx    # Flagged duplicate approval/merge
│       │   ├── TrustScorePage.jsx             # Responder trust scorecard & badges
│       │   ├── Login.jsx                      # Authentication & quick demo login
│       │   └── Signup.jsx                     # Responder registration & skills
│       ├── services/
│       │   ├── api.js                         # Axios interceptor instance
│       │   ├── authService.js                 # JWT auth service
│       │   ├── requestService.js              # Emergency request CRUD
│       │   ├── volunteerService.js            # Responder telemetry
│       │   └── aiService.js                   # Client-side AI bridge
│       └── hooks/
│           ├── useAuth.js                     # User authentication hook
│           ├── useSocket.js                   # Real-time WebSocket hook
│           └── useGeolocation.js              # Browser GPS locator hook
│
├── server/                                    # Node.js / Express backend
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   └── src/
│       ├── server.js                          # HTTP & Socket.io server entry
│       ├── app.js                             # Express routing & middleware
│       ├── config/
│       │   ├── db.js                          # MongoDB Mongoose connection
│       │   └── socket.js                      # Real-time broadcast rooms
│       ├── models/
│       │   ├── User.js                        # User & trust rating schema
│       │   ├── Request.js                     # Emergency request (2dsphere)
│       │   ├── Volunteer.js                   # Responder capabilities
│       │   ├── Organization.js                # NGO inventory & resources
│       │   ├── Match.js                       # Dispatch pairing orders
│       │   ├── Notification.js                # Multi-channel alerts
│       │   └── VerificationLog.js             # Audit trail of AI & admin actions
│       ├── controllers/                       # REST endpoint controllers
│       ├── routes/                            # Modular API routers
│       ├── middleware/                        # Auth, RBAC, rate-limiting
│       ├── services/
│       │   ├── pythonServiceClient.js         # HTTP client to FastAPI microservice
│       │   ├── geoMatchService.js             # Geospatial proximity ranker
│       │   └── expiryCronJob.js               # Life-preserving lease daemon
│       └── utils/
│           ├── generateToken.js
│           ├── logger.js
│           └── seedData.js                    # Realistic disaster seeder
│
├── ai-service/                                # Python FastAPI AI microservice
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── app/
│       ├── main.py                            # FastAPI app & CORS
│       ├── models/schemas.py                  # Pydantic schemas
│       ├── routes/
│       │   ├── duplicate_check.py             # POST /check-duplicate
│       │   └── severity_score.py              # POST /score-urgency
│       ├── services/
│       │   ├── similarity.py                  # TF-IDF + Haversine similarity
│       │   └── keyword_scorer.py              # Clinical & vulnerability triage
│       └── utils/text_cleaner.py              # Text normalization & stopwords
│
├── shared/
│   └── requestTypes.js                        # Shared enums and constants
│
└── docs/
    ├── API_DOCS.md                            # Comprehensive REST & Socket API docs
    ├── DB_SCHEMA.md                           # Database models, schemas & indexes
    └── architecture-diagram.md                # System flow & Mermaid diagrams
```

---

## 🚀 Quick Start & Installation

### Option 1: Docker Compose (All Services in 1 Command)
```bash
docker-compose up --build
```
- Client: `http://localhost:5173`
- Node.js API: `http://localhost:5000/api`
- Python AI Docs: `http://localhost:8000/docs`
- MongoDB: `localhost:27017`

---

### Option 2: Local Development

#### 1. Python FastAPI AI Service
```bash
cd ai-service
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Node.js Express Backend
```bash
cd server
npm install
cp .env.example .env
npm run seed     # Seeds realistic emergency scenarios into MongoDB
npm run dev      # Starts Express & Socket.io server on port 5000
```

#### 3. React Frontend Client
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on port 5173
```

---

## ⚡ Live Hackathon Demo Walkthrough

1. **Top Demo Bar**: Click **"🚀 Launch 30s Live Demo Flow"** on the top bar to run an automated simulation:
   - Requester opens SOS Modal -> Dispatches 1-Tap SOS request.
   - Python AI triages emergency to 98/100 (Critical).
   - System automatically switches to Volunteer Feed where the request appears at the top.
   - Volunteer accepts assignment -> Dispatched.
   - Switches to Admin Overwatch Command Center with real-time heatmap update.
2. **Offline Simulation**: Click the **"🟢 Online"** toggle in the navbar to enter **"🟠 Low Bandwidth"** mode. Submit an SOS request; notice it safely stores in the local sync queue and auto-burst-syncs the second you toggle back online!
3. **Voice-to-Request**: Open **Create Help Request** and tap **"🎙️ Tap Voice-to-Request"** to speak hands-free emergency requests.
4. **Duplicate Moderation**: Go to **Duplicates AI** tab to see how the system flagged Request `#CC-1046` as an 87% duplicate of `#CC-1043` due to nearby proximity (420m) and overlapping flood evacuation wording.

---

## 🛡️ License
MIT License. Built with ❤️ for disaster relief and emergency response worldwide.
