# CrisisConnect Architecture Specification

```mermaid
graph TD
    subgraph Frontend [Client Layer (React 18 + Vite)]
        A1[1-Tap SOS Panic Button]
        A2[Interactive Leaflet Heatmap]
        A3[Voice-to-Request NLP Input]
        A4[Offline Sync Queue]
        A5[Role Portals: Requester / Volunteer / Admin]
    end

    subgraph Gateway [API Gateway & Real-Time Hub (Node.js + Express)]
        B1[JWT Auth & RBAC Middleware]
        B2[Rate Limiting & Spam Shield]
        B3[Socket.io Broadcast Hub]
        B4[GeoMatch Proximity Dispatcher]
        B5[Life-Preserving Lease Expiry Cron]
    end

    subgraph AIService [AI Microservice (Python FastAPI)]
        C1[TF-IDF + Cosine Similarity Engine]
        C2[Haversine Geo-Proximity Penalty]
        C3[Spatio-Temporal Duplicate Detector]
        C4[Clinical & Vulnerability NLP Urgency Scorer]
    end

    subgraph Storage [Geospatial Database (MongoDB)]
        D1[(Users & Volunteer Profiles)]
        D2[(Requests 2dsphere GeoJSON)]
        D3[(Organizations & Inventories)]
        D4[(Matches & Verification Logs)]
    end

    A1 -->|REST / WebSocket| B1
    A2 -->|Live Telemetry| B3
    A3 -->|Transcript Submission| B1
    A4 -.->|Burst Sync on Reconnect| B1
    A5 -->|Role Navigation| B1

    B1 --> D1
    B4 --> D2
    B5 --> D2
    B1 -->|Internal REST| C1
    B1 -->|Internal REST| C4

    C1 --> C3
    C2 --> C3
    C3 -->|Similarity Vector & Reasons| B1
    C4 -->|0-100 Priority Score & Tiers| B1

    B3 -->|emergency:new Broadcast| A5
    B3 -->|request:status_update| A2
```

---

## Data Flow for Emergency SOS Lifecycle

1. **Trigger**: Requester taps 1-Tap SOS panic button on mobile or desktop.
2. **Telemetry Capture**: Browser captures GPS coordinates (accuracy ~5m) and device timestamp.
3. **AI Triage & Deduplication**:
   - Node.js queries existing active incidents within 5km.
   - Python FastAPI runs TF-IDF semantic overlap + Haversine distance decay to check if multiple citizens are reporting the same collapsed building or water rescue.
   - Clinical distress keywords (*oxygen, infant, trapped, rising flood*) are weighted to produce an urgency score (e.g. 98/100).
4. **Broadcast**:
   - Incident stored in MongoDB with `geometry: { type: "Point", coordinates: [lng, lat] }`.
   - Socket.io broadcasts `emergency:new` and `emergency:volunteer_alert` to all qualified responders within service radius.
5. **Dispatch & Tracking**:
   - Volunteer accepts assignment; status transitions to `Assigned` -> `En Route` -> `Resolved`.
   - Live timeline updates are pushed to Requester, Volunteer, and Command Center simultaneously.
6. **Lease Guard**:
   - If a request is not renewed within designated lease duration (4h), background cron marks it `Expired` to keep volunteer queues clean.
