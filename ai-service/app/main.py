import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from dotenv import load_dotenv

from app.routes.duplicate_check import router as duplicate_router
from app.routes.severity_score import router as severity_router

load_dotenv()

app = FastAPI(
    title="CrisisConnect AI Triage & De-duplication Microservice",
    description="Intelligent natural language severity triage, semantic text similarity, and spatio-temporal duplicate detection for disaster response.",
    version="1.0.0"
)

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(duplicate_router)
app.include_router(severity_router)

@app.get("/", tags=["Health"])
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "CrisisConnect AI Microservice",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "endpoints": [
            "/api/ai/check-duplicate",
            "/api/ai/score-urgency",
            "/docs"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
