from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Coordinates(BaseModel):
    lat: float
    lng: float

class ExistingRequestItem(BaseModel):
    id: str
    title: str
    description: str
    category: str
    coordinates: Optional[Coordinates] = None
    createdAt: Optional[str] = None
    urgency: Optional[str] = "Medium"

class DuplicateCheckPayload(BaseModel):
    title: str
    description: str
    category: str
    coordinates: Optional[Coordinates] = None
    existingRequests: List[ExistingRequestItem] = []

class DuplicateMatchDetail(BaseModel):
    matchedRequestId: str
    similarityScore: float = Field(..., description="Percentage 0 - 100")
    textSimilarity: float
    distanceKm: Optional[float] = None
    duplicateReasons: List[str]
    isDuplicate: bool

class DuplicateCheckResponse(BaseModel):
    isDuplicate: bool
    highestSimilarityScore: float
    matchedRequestId: Optional[str] = None
    duplicateReasons: List[str] = []
    topMatches: List[DuplicateMatchDetail] = []
    analyzedAt: str

class UrgencyScorePayload(BaseModel):
    title: str
    description: str
    category: str
    declaredUrgency: Optional[str] = "Medium"
    coordinates: Optional[Coordinates] = None
    peopleCount: Optional[int] = 1

class KeywordAnalysis(BaseModel):
    criticalKeywordsFound: List[str]
    vulnerabilityKeywordsFound: List[str]
    timeDecayFactor: float
    rawScore: float
    calibratedScore: int

class UrgencyScoreResponse(BaseModel):
    urgencyScore: int = Field(..., ge=0, le=100)
    recommendedUrgency: str
    urgencyTier: str
    confidence: float
    criticalFactors: List[str]
    keywordAnalysis: KeywordAnalysis
    suggestedVolunteerSkills: List[str]
