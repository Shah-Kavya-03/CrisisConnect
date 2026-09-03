from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.models.schemas import DuplicateCheckPayload, DuplicateCheckResponse
from app.services.similarity import compute_similarity

router = APIRouter(prefix="/api/ai", tags=["Duplicate Detection"])

@router.post("/check-duplicate", response_model=DuplicateCheckResponse)
async def check_duplicate_request(payload: DuplicateCheckPayload):
    """
    Evaluates whether a newly submitted help request is a duplicate of any existing active requests.
    Combines TF-IDF cosine text similarity, category matching, and Haversine geospatial proximity.
    """
    try:
        result = compute_similarity(
            candidate_title=payload.title,
            candidate_desc=payload.description,
            candidate_category=payload.category,
            candidate_coords=payload.coordinates,
            existing_requests=payload.existingRequests,
            threshold=0.70
        )

        return DuplicateCheckResponse(
            isDuplicate=result["isDuplicate"],
            highestSimilarityScore=result["highestSimilarityScore"],
            matchedRequestId=result["matchedRequestId"],
            duplicateReasons=result["duplicateReasons"],
            topMatches=result["topMatches"],
            analyzedAt=datetime.utcnow().isoformat() + "Z"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Duplicate check analysis failed: {str(e)}")
