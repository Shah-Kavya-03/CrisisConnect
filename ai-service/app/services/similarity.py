import math
from typing import List, Dict, Any, Optional
from collections import Counter
from app.utils.text_cleaner import clean_text
from app.models.schemas import Coordinates, ExistingRequestItem, DuplicateMatchDetail

def calculate_haversine_distance(coord1: Optional[Coordinates], coord2: Optional[Coordinates]) -> Optional[float]:
    """
    Calculates Haversine distance in kilometers between two coordinates.
    """
    if not coord1 or not coord2:
        return None
    
    lat1, lon1 = coord1.lat, coord1.lng
    lat2, lon2 = coord2.lat, coord2.lng

    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 3)

def _get_ngrams(words: List[str]) -> List[str]:
    """Generates unigrams and bigrams for rich semantic representation."""
    ngrams = list(words)
    for i in range(len(words) - 1):
        ngrams.append(f"{words[i]}_{words[i+1]}")
    return ngrams

def _pure_python_tfidf_cosine(query_text: str, doc_texts: List[str]) -> List[float]:
    """
    Pure Python TF-IDF Vectorizer and Cosine Similarity calculation.
    Zero native compilation required, runs seamlessly across all Python versions.
    """
    all_docs = [query_text] + doc_texts
    tokenized_docs = [_get_ngrams(doc.split()) for doc in all_docs]
    num_docs = len(all_docs)

    # Calculate Document Frequency (DF) for each term
    df: Dict[str, int] = {}
    for doc in tokenized_docs:
        unique_terms = set(doc)
        for term in unique_terms:
            df[term] = df.get(term, 0) + 1

    # Calculate IDF: ln((1 + N) / (1 + df)) + 1
    idf: Dict[str, float] = {}
    for term, count in df.items():
        idf[term] = math.log((1 + num_docs) / (1 + count)) + 1.0

    # Compute TF-IDF vectors
    tfidf_vectors: List[Dict[str, float]] = []
    for doc in tokenized_docs:
        term_counts = Counter(doc)
        total_terms = len(doc) or 1
        vec: Dict[str, float] = {}
        for term, count in term_counts.items():
            tf = count / total_terms
            vec[term] = tf * idf.get(term, 1.0)
        tfidf_vectors.append(vec)

    query_vec = tfidf_vectors[0]
    query_norm = math.sqrt(sum(v ** 2 for v in query_vec.values())) or 1.0

    similarities: List[float] = []
    for doc_vec in tfidf_vectors[1:]:
        doc_norm = math.sqrt(sum(v ** 2 for v in doc_vec.values())) or 1.0
        # Dot product
        dot_product = sum(query_vec[t] * doc_vec[t] for t in query_vec if t in doc_vec)
        cosine_sim = dot_product / (query_norm * doc_norm)
        similarities.append(min(max(cosine_sim, 0.0), 1.0))

    return similarities

def compute_similarity(
    candidate_title: str,
    candidate_desc: str,
    candidate_category: str,
    candidate_coords: Optional[Coordinates],
    existing_requests: List[ExistingRequestItem],
    threshold: float = 0.70
) -> Dict[str, Any]:
    """
    Computes multi-factor spatio-temporal and semantic similarity vector.
    Composite Score = 0.55 * text_sim + 0.30 * geo_proximity + 0.15 * category_match
    """
    if not existing_requests:
        return {
            "isDuplicate": False,
            "highestSimilarityScore": 0.0,
            "matchedRequestId": None,
            "duplicateReasons": [],
            "topMatches": []
        }

    candidate_full_text = clean_text(f"{candidate_title} {candidate_desc}")
    cleaned_existing = [clean_text(f"{req.title} {req.description}") for req in existing_requests]

    # Calculate text similarities with pure-python TF-IDF
    cosine_sims = _pure_python_tfidf_cosine(candidate_full_text, cleaned_existing)

    matches: List[DuplicateMatchDetail] = []
    
    for idx, req in enumerate(existing_requests):
        text_sim = float(cosine_sims[idx])
        category_match = 1.0 if req.category.strip().lower() == candidate_category.strip().lower() else 0.0
        
        # Calculate geospatial proximity factor
        dist_km = calculate_haversine_distance(candidate_coords, req.coordinates)
        geo_score = 0.0
        reasons = []

        if dist_km is not None:
            if dist_km <= 0.5: # within 500m
                geo_score = 1.0
                reasons.append(f"Hyper-local proximity ({int(dist_km * 1000)}m apart)")
            elif dist_km <= 1.5:
                geo_score = 0.8
                reasons.append(f"Nearby incident site ({dist_km} km)")
            elif dist_km <= 3.0:
                geo_score = 0.5
            else:
                geo_score = max(0.0, 1.0 - (dist_km / 10.0))

        if category_match > 0.5:
            reasons.append(f"Identical crisis category: {req.category}")

        if text_sim > 0.65:
            reasons.append(f"Strong semantic description overlap ({int(text_sim * 100)}%)")
        elif text_sim > 0.40:
            reasons.append(f"Moderate description keyword match ({int(text_sim * 100)}%)")

        # Composite score weighting
        composite_score = (0.55 * text_sim) + (0.30 * geo_score) + (0.15 * category_match)
        percentage_score = round(composite_score * 100, 1)

        is_dup = composite_score >= threshold

        matches.append(DuplicateMatchDetail(
            matchedRequestId=req.id,
            similarityScore=percentage_score,
            textSimilarity=round(text_sim * 100, 1),
            distanceKm=dist_km,
            duplicateReasons=reasons,
            isDuplicate=is_dup
        ))

    # Sort descending by similarity score
    matches.sort(key=lambda m: m.similarityScore, reverse=True)
    top_match = matches[0] if matches else None

    return {
        "isDuplicate": top_match.isDuplicate if top_match else False,
        "highestSimilarityScore": top_match.similarityScore if top_match else 0.0,
        "matchedRequestId": top_match.matchedRequestId if (top_match and top_match.isDuplicate) else (top_match.matchedRequestId if top_match else None),
        "duplicateReasons": top_match.duplicateReasons if top_match else [],
        "topMatches": matches[:5]
    }
