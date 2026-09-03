# CrisisConnect API Documentation

Welcome to the CrisisConnect centralized API specification. This platform exposes REST endpoints across the **Node.js Gateway Backend** (port 5000) and the **Python FastAPI AI Microservice** (port 8000), alongside full duplex **Socket.io** real-time dispatch streams.

---

## 1. Authentication Endpoints (Node.js)

Base URL: `/api/auth`

### `POST /api/auth/register`
Registers a new citizen, volunteer, NGO representative, or administrator.

**Request Body:**
```json
{
  "name": "Dr. Rahul Verma",
  "email": "rahul@relief.org",
  "phone": "+91 91234 56789",
  "password": "SecurePassword123!",
  "role": "Volunteer",
  "skills": ["First Aid / BLS", "Doctor / Physician"],
  "vehicleType": "SUV / 4x4 Off-Road"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66d6a8f1...",
    "name": "Dr. Rahul Verma",
    "email": "rahul@relief.org",
    "role": "Volunteer",
    "trustScore": 90,
    "badges": ["⚡ Registered Responder"]
  }
}
```

### `POST /api/auth/login`
Authenticates an existing user and issues a JWT token.

**Request Body:**
```json
{
  "email": "rahul@relief.org",
  "password": "SecurePassword123!"
}
```

### `GET /api/auth/me`
Retrieves current user identity and trust profile. Requires `Authorization: Bearer <token>`.

---

## 2. Emergency Assistance Requests (Node.js)

Base URL: `/api/requests`

### `POST /api/requests`
Creates a standard or SOS panic emergency request. Automatically calls the Python AI microservice to compute distress urgency and deduplicate against existing active incidents.

**Request Body:**
```json
{
  "title": "Family Trapped on Rooftop",
  "description": "Rising floodwaters at Riverside Colony. 4 adults and 2 children stranded on roof without drinking water.",
  "category": "Rescue",
  "urgency": "Critical",
  "locationName": "Riverside Colony, Block C",
  "coordinates": {
    "lat": 28.6250,
    "lng": 77.2180
  },
  "requesterName": "Vikram Singh",
  "requesterPhone": "+91 99887 76655",
  "peopleCount": 6,
  "isSOS": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "request": {
    "customId": "CC-1043",
    "title": "🚨 CRITICAL SOS: Family Trapped on Rooftop",
    "category": "Rescue",
    "urgency": "Critical",
    "aiPriorityScore": 98,
    "status": "Awaiting Help",
    "isDuplicate": false,
    "expiresAt": "2026-09-03T23:00:00.000Z",
    "timeline": [
      { "status": "Created", "timestamp": "10:25 AM", "note": "1-Tap SOS Panic Button Triggered" },
      { "status": "AI Triaged", "timestamp": "10:26 AM", "note": "AI Auto-Triage: Assigned MAXIMUM CRITICAL priority (98/100)" }
    ]
  },
  "aiTriage": {
    "urgencyScore": 98,
    "urgencyTier": "Critical Tier 1 (Immediate Action Required)",
    "confidence": 0.95,
    "suggestedVolunteerSkills": ["Boat / Water Rescue", "Heavy Lifting / Debris Clearing"]
  },
  "duplicateCheck": {
    "isDuplicate": false,
    "highestSimilarityScore": 12.4
  }
}
```

### `GET /api/requests`
Retrieves list of active emergency requests with query parameters:
- `category` (e.g. `Medical`, `Rescue`, `Oxygen`, `Food & Water`)
- `urgency` (e.g. `Critical`, `High`, `Medium`, `Low`)
- `status` (e.g. `Awaiting Help`, `Assigned`, `En Route`, `Resolved`)
- `lat`, `lng`, `radiusKm` (geospatial radius filter)
- `search` (keyword search)

### `PATCH /api/requests/:id/status`
Updates request lifecycle status and records timeline notes.
```json
{
  "status": "En Route",
  "volunteerInfo": {
    "id": "VOL-802",
    "name": "Dr. Rahul Verma",
    "phone": "+91 91234 56789"
  },
  "note": "Volunteer equipped with boat and medical kit dispatched"
}
```

### `PATCH /api/requests/:id/renew`
1-Click renewal for the **Life-Preserving Lease System**. Extends request duration by 4 hours to avoid auto-expiration.

---

## 3. Volunteer & Geo-Matching Endpoints (Node.js)

Base URL: `/api/volunteers`

### `GET /api/volunteers/nearby`
Finds nearest verified volunteers ranked by Haversine distance, suitability score, and equipment match.
- Query params: `requestId`, `lat`, `lng`, `category`

### `PATCH /api/volunteers/location`
Updates live GPS coordinates and availability toggle.
```json
{
  "lat": 28.6142,
  "lng": 77.2095,
  "isAvailable": true
}
```

---

## 4. Python FastAPI AI Microservice Endpoints

Base URL: `http://localhost:8000/api/ai`

### `POST /api/ai/check-duplicate`
Computes composite similarity vector between candidate request and existing incidents:
$$\text{Score} = 0.55 \cdot \text{TextSimilarity} + 0.30 \cdot \text{GeoProximity} + 0.15 \cdot \text{CategoryMatch}$$

**Request Body:**
```json
{
  "title": "Rooftop rescue near riverside",
  "description": "People stuck on roof at Riverside Colony. Need boat urgently!",
  "category": "Rescue",
  "coordinates": { "lat": 28.6254, "lng": 77.2182 },
  "existingRequests": [
    {
      "id": "CC-1043",
      "title": "Family Trapped on Roof due to Rising Floodwaters",
      "description": "4 adults and 2 children stuck on rooftop near Riverside Colony.",
      "category": "Rescue",
      "coordinates": { "lat": 28.6250, "lng": 77.2180 }
    }
  ]
}
```

**Response:**
```json
{
  "isDuplicate": true,
  "highestSimilarityScore": 87.2,
  "matchedRequestId": "CC-1043",
  "duplicateReasons": [
    "Hyper-local proximity (420m apart)",
    "Identical crisis category: Rescue",
    "Strong semantic description overlap (84%)"
  ],
  "topMatches": [
    {
      "matchedRequestId": "CC-1043",
      "similarityScore": 87.2,
      "textSimilarity": 84.1,
      "distanceKm": 0.42,
      "isDuplicate": true
    }
  ],
  "analyzedAt": "2026-09-03T18:30:00Z"
}
```

### `POST /api/ai/score-urgency`
NLP evaluation analyzing clinical distress tokens, victim demographic vulnerabilities, and time decay factors.

**Response:**
```json
{
  "urgencyScore": 96,
  "recommendedUrgency": "Critical",
  "urgencyTier": "Critical Tier 1 (Immediate Action Required)",
  "confidence": 0.94,
  "criticalFactors": [
    "Acute danger indicators detected: trapped, oxygen cylinder, flooded",
    "Vulnerable demographic markers: diabetic, elderly"
  ],
  "suggestedVolunteerSkills": ["Doctor / Physician", "First Aid / BLS"]
}
```

---

## 5. Real-Time Socket.io Events

Port: 5000 (WebSocket)

| Event Name | Direction | Payload Description |
| :--- | :--- | :--- |
| `join:role` | Client -> Server | Joins role broadcast channel (`Requester`, `Volunteer`, `Admin`) |
| `join:request` | Client -> Server | Joins incident specific room for live telemetry |
| `emergency:new` | Server -> All | Global broadcast when new emergency is created |
| `emergency:volunteer_alert` | Server -> Volunteers | Priority alert for nearby available responders |
| `request:status_update` | Server -> Room | Broadcasts status change (`Assigned`, `En Route`, `Resolved`, `Expired`) |
| `notification:received` | Server -> User | Targeted alert notification |
