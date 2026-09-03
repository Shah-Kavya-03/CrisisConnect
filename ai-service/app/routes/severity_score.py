from fastapi import APIRouter, HTTPException
from app.models.schemas import UrgencyScorePayload, UrgencyScoreResponse
from app.services.keyword_scorer import analyze_urgency

router = APIRouter(prefix="/api/ai", tags=["Urgency & Severity Triage"])

@router.post("/score-urgency", response_model=UrgencyScoreResponse)
async def score_request_urgency(payload: UrgencyScorePayload):
    """
    Analyzes emergency distress signals, keywords, victim count, and contextual hazard level
    to assign an AI triage priority score (0 - 100) and suggest suitable volunteer skill sets.
    """
    try:
        response = analyze_urgency(payload)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Urgency triage scoring failed: {str(e)}")
