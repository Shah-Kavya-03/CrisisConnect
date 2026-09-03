# CrisisConnect Database Schema & Data Models

CrisisConnect utilizes **MongoDB** with **Mongoose ODM** and native **GeoJSON 2dsphere indexing** to achieve sub-second spatial proximity lookups and scalable multi-role data storage.

---

## Entity Relationship Overview

```
                      ┌───────────────┐
                      │     User      │
                      │ (Auth & Role) │
                      └───┬───────┬───┘
                          │       │
       1:1 Volunteer Profile      │ 1:N Requests
                          ▼       ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    Volunteer     │  │     Request      │  │   Organization   │
│ (Vehicle/Skills) │  │  (GeoJSON Point) │  │ (Relief Fleet)   │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         └──────────┬──────────┴─────────────────────┘
                    ▼
          ┌──────────────────┐
          │      Match       │
          │ (Dispatch Order) │
          └──────────────────┘
                    │
                    ▼
          ┌──────────────────┐
          │ VerificationLog  │
          │  (Audit Trail)   │
          └──────────────────┘
```

---

## Collections & Schemas

### 1. `users`
Represents citizens, volunteers, NGO staff, and system admins.

| Field | Type | Index | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | MongoDB internal ID |
| `name` | String | - | Full name of user |
| `email` | String | Unique | Login email address |
| `phone` | String | - | Contact phone number |
| `password` | String | - | Hashed bcrypt credential (hidden by default) |
| `role` | String | - | Enum: `['Requester', 'Volunteer', 'NGO', 'Admin']` |
| `location.coordinates`| Object | - | `{ lat: Number, lng: Number }` |
| `trustScore` | Number | - | Reputation rating: 0 to 100 (Default: 85) |
| `completedAssignments`| Number | - | Count of successful relief deliveries |
| `abandonedAssignments`| Number | - | Count of dropped assignments |
| `avgResponseMinutes`  | Number | - | Average time between dispatch and arrival |
| `badges` | Array[String]| - | Earned credentials (e.g. `🏆 Reliable Responder`) |
| `isVerified` | Boolean| - | Identity verification checkmark |
| `createdAt` | Date | - | Registration timestamp |

---

### 2. `requests`
Central emergency record indexed with `2dsphere` geometry for geospatial dispatch.

| Field | Type | Index | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | MongoDB internal ID |
| `customId` | String | Unique | Human-readable ID (e.g. `CC-1043`) |
| `title` | String | Text | Emergency title or short headline |
| `description` | String | Text | Full incident narrative |
| `category` | String | Yes | Enum: `['Medical', 'Rescue', 'Food & Water', 'Oxygen', 'Medicines', 'Blood', 'Shelter', 'Transportation', 'General']` |
| `urgency` | String | Yes | Enum: `['Critical', 'High', 'Medium', 'Low']` |
| `aiPriorityScore` | Number | Compound | Computed 0-100 severity index (sorted descending) |
| `locationName` | String | - | Human address / landmark description |
| `geometry` | GeoJSON Point | **2dsphere** | `{ type: "Point", coordinates: [lng, lat] }` |
| `coordinates` | Object | - | `{ lat: Number, lng: Number }` |
| `status` | String | Compound | Enum: `['Awaiting Help', 'Assigned', 'En Route', 'In Progress', 'Resolved', 'Expired', 'Flagged Duplicate', 'Cancelled']` |
| `assignedTo` | Object | - | Responder ID, name, phone, trust score |
| `expiresAt` | Date | Yes | Life-preserving lease expiration deadline |
| `isDuplicate` | Boolean | - | True if AI or moderator flagged as duplicate |
| `duplicateMatchId`| String | - | Canonical request ID that this is duplicate of |
| `similarityScore` | Number | - | Multi-factor similarity percentage (0 - 100) |
| `duplicateReasons`| Array[String]| - | Explanatory reasons for duplicate match |
| `timeline` | Array[Object]| - | Chronological history of status transitions |

**Compound Indexes:**
- `{ geometry: "2dsphere" }`
- `{ status: 1, urgency: 1, aiPriorityScore: -1 }`

---

### 3. `volunteers`
Extended responder profile with capabilities and live tracking.

| Field | Type | Index | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | MongoDB internal ID |
| `userId` | ObjectId (Ref: User)| Unique | Associated user account |
| `skills` | Array[String] | - | Skills: First Aid, Water Rescue, Doctor, 4x4, etc. |
| `vehicleType` | String | - | Vehicle capacity: Boat, 4x4 SUV, Ambulance, etc. |
| `isAvailable` | Boolean | - | Availability toggle for real-time dispatch |
| `serviceRadiusKm` | Number | - | Maximum coverage radius (default: 15 km) |
| `currentLocation` | GeoJSON Point | **2dsphere** | Live responder coordinates `[lng, lat]` |
| `activeAssignmentId` | ObjectId | - | Current active request reference |
| `totalHoursVolunteered`| Number | - | Total cumulative service hours |

---

### 4. `organizations`
Authorized NGOs and emergency response units.

| Field | Type | Index | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | MongoDB internal ID |
| `name` | String | Unique | Official NGO / Agency title |
| `registrationNumber` | String | Unique | Government / NGO registry code |
| `type` | String | - | Registered NGO, Red Cross Unit, Govt Agency |
| `resourcesInventory` | Object | - | Real-time counts: oxygen, boats, beds, water |
| `isVerified` | Boolean | - | Authorized government disaster partner status |

---

### 5. `matches`
Dispatched pairings connecting requests with responders.

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `requestId` | ObjectId (Ref: Request)| Target request |
| `customRequestId` | String | Human readable ID |
| `volunteerUserId`| ObjectId (Ref: User) | Dispatched responder |
| `distanceKm` | Number | Distance between responder and incident |
| `estimatedArrivalMinutes` | Number | Estimated arrival time |
| `status` | String | Enum: `['Pending', 'Accepted', 'Declined', 'Completed']` |

---

### 6. `verification_logs`
Immutable audit trail ensuring transparent disaster response governance.

| Field | Type | Description |
| :--- | :--- | :--- |
| `actionType` | String | `AI_DUPLICATE_FLAG`, `ADMIN_DUPLICATE_MERGE`, `REQUEST_RENEWAL`, `EXPIRY_AUTO_ARCHIVE` |
| `requestId` | String | Affected request ID |
| `performerRole`| String | `SYSTEM_AI`, `SYSTEM_CRON`, `ADMIN`, `REQUESTER` |
| `details` | Mixed | Context payload (scores, reasons, coordinates) |
| `timestamp` | Date | Audit event creation time |
