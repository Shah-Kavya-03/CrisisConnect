from typing import Dict, Any, List
from app.models.schemas import UrgencyScorePayload, UrgencyScoreResponse, KeywordAnalysis

# Life-Threatening & Acute Emergency Indicators (Weight: +25 each)
ACUTE_EMERGENCY_WORDS = {
    "trapped": 30,
    "drowning": 35,
    "unconscious": 35,
    "bleeding": 30,
    "heart attack": 35,
    "cardiac": 35,
    "suffocating": 35,
    "oxygen cylinder": 30,
    "collapse": 25,
    "fire": 25,
    "burns": 25,
    "gas leak": 25,
    "floodwaters": 25,
    "water rising": 30,
    "roof": 20,
    "sos": 30
}

# Vulnerability Population Markers (Weight: +15 each)
VULNERABILITY_WORDS = {
    "infant": 20,
    "baby": 20,
    "child": 15,
    "children": 15,
    "pregnant": 25,
    "elderly": 15,
    "senior": 15,
    "wheelchair": 15,
    "diabetic": 20,
    "insulin": 20,
    "dialysis": 25,
    "asthma": 15,
    "disabled": 15
}

CATEGORY_BASE_SCORES = {
    "Rescue": 70,
    "Medical": 65,
    "Oxygen": 65,
    "Blood": 60,
    "Medicines": 50,
    "Food & Water": 45,
    "Shelter": 40,
    "Transportation": 35,
    "General": 30
}

DECLARED_URGENCY_OFFSET = {
    "Critical": 20,
    "High": 10,
    "Medium": 0,
    "Low": -10
}

def analyze_urgency(payload: UrgencyScorePayload) -> UrgencyScoreResponse:
    text = f"{payload.title} {payload.description}".lower()
    
    # Base score by category
    base = CATEGORY_BASE_SCORES.get(payload.category, 40)
    urgency_offset = DECLARED_URGENCY_OFFSET.get(payload.declaredUrgency, 0)
    
    critical_found = []
    crit_boost = 0
    for word, weight in ACUTE_EMERGENCY_WORDS.items():
        if word in text:
            critical_found.append(word)
            crit_boost += weight

    vulnerable_found = []
    vuln_boost = 0
    for word, weight in VULNERABILITY_WORDS.items():
        if word in text:
            vulnerable_found.append(word)
            vuln_boost += weight

    # Group size scaling (more people trapped = higher severity)
    group_bonus = 0
    if payload.peopleCount and payload.peopleCount > 1:
        group_bonus = min(payload.peopleCount * 2, 12)

    raw_score = base + urgency_offset + min(crit_boost, 40) + min(vuln_boost, 25) + group_bonus
    calibrated_score = int(min(max(raw_score, 12), 99))

    # Determine recommended tier
    if calibrated_score >= 85:
        tier = "Critical Tier 1 (Immediate Action Required)"
        recommended_urgency = "Critical"
    elif calibrated_score >= 65:
        tier = "High Priority Tier 2 (Urgent Assistance)"
        recommended_urgency = "High"
    elif calibrated_score >= 40:
        tier = "Medium Priority Tier 3 (Standard Dispatch)"
        recommended_urgency = "Medium"
    else:
        tier = "Low Priority Tier 4 (Routine Aid)"
        recommended_urgency = "Low"

    # Suggest volunteer skills based on content
    skills = []
    if "trapped" in text or "flood" in text or "roof" in text or payload.category == "Rescue":
        skills.extend(["Boat / Water Rescue", "Heavy Lifting / Debris Clearing"])
    if "blood" in text or "insulin" in text or "oxygen" in text or payload.category in ["Medical", "Oxygen", "Blood", "Medicines"]:
        skills.extend(["Doctor / Physician", "First Aid / BLS", "Paramedic / EMT"])
    if "food" in text or "water" in text or payload.category == "Food & Water":
        skills.append("Food & Ration Distribution")
    if "transport" in text or "evacuate" in text:
        skills.extend(["4x4 Off-Road Transport", "SUV / 4x4 Off-Road"])
    
    if not skills:
        skills.append("General Volunteer Support")

    critical_factors = []
    if critical_found:
        critical_factors.append(f"Acute danger indicators detected: {', '.join(critical_found)}")
    if vulnerable_found:
        critical_factors.append(f"Vulnerable demographic markers: {', '.join(vulnerable_found)}")
    if payload.peopleCount and payload.peopleCount > 2:
        critical_factors.append(f"Multiple affected individuals ({payload.peopleCount} people)")
    if not critical_factors:
        critical_factors.append("Standard assistance request without acute life hazards detected.")

    confidence = round(min(0.75 + (len(critical_found) * 0.05) + (len(vulnerable_found) * 0.05), 0.98), 2)

    return UrgencyScoreResponse(
        urgencyScore=calibrated_score,
        recommendedUrgency=recommended_urgency,
        urgencyTier=tier,
        confidence=confidence,
        criticalFactors=critical_factors,
        keywordAnalysis=KeywordAnalysis(
            criticalKeywordsFound=critical_found,
            vulnerabilityKeywordsFound=vulnerable_found,
            timeDecayFactor=1.0,
            rawScore=raw_score,
            calibratedScore=calibrated_score
        ),
        suggestedVolunteerSkills=list(set(skills))
    )
