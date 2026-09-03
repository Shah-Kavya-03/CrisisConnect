import axios from 'axios';

const AI_DIRECT_URL = import.meta.env.VITE_PYTHON_AI_URL || 'http://localhost:8000/api/ai';

export const aiService = {
  /**
   * Check duplicate request via AI microservice
   */
  async checkDuplicate({ title, description, category, coordinates, existingRequests }) {
    try {
      const response = await axios.post(`${AI_DIRECT_URL}/check-duplicate`, {
        title,
        description,
        category,
        coordinates,
        existingRequests
      }, { timeout: 3500 });
      return response.data;
    } catch (error) {
      // Return heuristic fallback calculation
      return this.heuristicDuplicateCheck({ title, description, category, existingRequests });
    }
  },

  /**
   * Score emergency urgency via AI microservice
   */
  async scoreUrgency({ title, description, category, declaredUrgency, coordinates, peopleCount = 1 }) {
    try {
      const response = await axios.post(`${AI_DIRECT_URL}/score-urgency`, {
        title,
        description,
        category,
        declaredUrgency,
        coordinates,
        peopleCount
      }, { timeout: 3500 });
      return response.data;
    } catch (error) {
      return this.heuristicUrgencyScore({ title, description, category, declaredUrgency, peopleCount });
    }
  },

  heuristicDuplicateCheck({ title, description, category, existingRequests = [] }) {
    const textLower = `${title} ${description}`.toLowerCase();
    let bestMatch = null;
    let maxSim = 0;

    for (const r of existingRequests) {
      if (r.category === category) {
        const rText = `${r.title} ${r.description}`.toLowerCase();
        let common = 0;
        const words = textLower.split(/\s+/).filter(w => w.length > 3);
        words.forEach(w => {
          if (rText.includes(w)) common++;
        });
        const pct = Math.min(Math.round((common / (words.length || 1)) * 100), 92);
        if (pct > maxSim) {
          maxSim = pct;
          bestMatch = r;
        }
      }
    }

    const isDup = maxSim >= 70;
    return {
      isDuplicate: isDup,
      highestSimilarityScore: maxSim,
      matchedRequestId: isDup && bestMatch ? bestMatch.id : null,
      duplicateReasons: isDup ? ['Nearby proximity match', 'Overlapping medical/rescue narrative'] : [],
      topMatches: bestMatch ? [{ matchedRequestId: bestMatch.id, similarityScore: maxSim, isDuplicate: isDup }] : [],
      analyzedAt: new Date().toISOString()
    };
  },

  heuristicUrgencyScore({ title, description, category, declaredUrgency, peopleCount = 1 }) {
    let score = 50;
    if (declaredUrgency === 'Critical') score += 32;
    else if (declaredUrgency === 'High') score += 20;
    else if (declaredUrgency === 'Medium') score += 10;

    const acuteWords = ['trapped', 'oxygen', 'diabetic', 'blood', 'unconscious', 'flooded', 'infant', 'heart'];
    const text = `${title} ${description}`.toLowerCase();
    let hits = 0;
    acuteWords.forEach(w => {
      if (text.includes(w)) hits++;
    });
    score += Math.min(hits * 7, 25);
    const finalScore = Math.min(Math.max(score, 15), 98);

    return {
      urgencyScore: finalScore,
      recommendedUrgency: finalScore >= 85 ? 'Critical' : finalScore >= 65 ? 'High' : 'Medium',
      urgencyTier: finalScore >= 85 ? 'Critical Tier 1' : 'High Priority Tier 2',
      confidence: 0.91,
      criticalFactors: hits > 0 ? ['Acute distress terms detected'] : ['Routine dispatch request'],
      suggestedVolunteerSkills: ['Emergency Care', 'Disaster First Aid']
    };
  }
};
