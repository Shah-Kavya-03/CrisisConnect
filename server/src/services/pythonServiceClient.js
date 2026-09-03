import axios from 'axios';
import { logger } from '../utils/logger.js';

const PYTHON_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';

export const pythonServiceClient = {
  /**
   * Check for duplicates using Python FastAPI AI Service
   */
  async checkDuplicate({ title, description, category, coordinates, existingRequests }) {
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/api/ai/check-duplicate`, {
        title,
        description,
        category,
        coordinates,
        existingRequests
      }, { timeout: 4000 });

      return response.data;
    } catch (error) {
      logger.warn(`Python AI microservice duplicate check unreachable (${error.message}). Executing in-process fallback.`);
      return this.fallbackDuplicateCheck({ title, description, category, coordinates, existingRequests });
    }
  },

  /**
   * Score emergency urgency & triage priority using Python FastAPI AI Service
   */
  async scoreUrgency({ title, description, category, declaredUrgency, coordinates, peopleCount }) {
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/api/ai/score-urgency`, {
        title,
        description,
        category,
        declaredUrgency,
        coordinates,
        peopleCount
      }, { timeout: 4000 });

      return response.data;
    } catch (error) {
      logger.warn(`Python AI microservice triage scoring unreachable (${error.message}). Executing in-process fallback.`);
      return this.fallbackScoreUrgency({ title, description, category, declaredUrgency, peopleCount });
    }
  },

  /**
   * Resilient fallback duplicate detector
   */
  fallbackDuplicateCheck({ title, description, category, existingRequests = [] }) {
    const textLower = `${title} ${description}`.toLowerCase();
    let bestMatch = null;
    let highestSim = 0;

    for (const req of existingRequests) {
      if (req.category === category) {
        const reqText = `${req.title} ${req.description}`.toLowerCase();
        let commonWords = 0;
        const words = textLower.split(/\s+/).filter(w => w.length > 3);
        words.forEach(w => {
          if (reqText.includes(w)) commonWords++;
        });
        const score = Math.min(Math.round((commonWords / (words.length || 1)) * 100), 95);
        if (score > highestSim) {
          highestSim = score;
          bestMatch = req;
        }
      }
    }

    const isDup = highestSim >= 70;
    return {
      isDuplicate: isDup,
      highestSimilarityScore: highestSim,
      matchedRequestId: isDup && bestMatch ? bestMatch.id : null,
      duplicateReasons: isDup ? ['High category & keyword overlap', 'Nearby vicinity match'] : [],
      topMatches: bestMatch ? [{ matchedRequestId: bestMatch.id, similarityScore: highestSim, textSimilarity: highestSim, isDuplicate: isDup }] : [],
      analyzedAt: new Date().toISOString()
    };
  },

  /**
   * Resilient fallback urgency scorer
   */
  fallbackScoreUrgency({ title, description, category, declaredUrgency, peopleCount = 1 }) {
    let score = 50;
    if (declaredUrgency === 'Critical') score += 30;
    else if (declaredUrgency === 'High') score += 20;
    else if (declaredUrgency === 'Medium') score += 10;

    const criticalWords = ['trapped', 'oxygen', 'diabetic', 'blood', 'unconscious', 'flooded', 'fire', 'baby', 'infant', 'heart'];
    const descLower = `${title} ${description}`.toLowerCase();
    
    let hits = 0;
    criticalWords.forEach(w => {
      if (descLower.includes(w)) hits++;
    });

    score += Math.min(hits * 6, 20);
    const finalScore = Math.min(Math.max(score, 15), 98);

    return {
      urgencyScore: finalScore,
      recommendedUrgency: finalScore >= 85 ? 'Critical' : finalScore >= 65 ? 'High' : 'Medium',
      urgencyTier: finalScore >= 85 ? 'Critical Tier 1' : 'High Priority Tier 2',
      confidence: 0.88,
      criticalFactors: hits > 0 ? ['Emergency distress keywords detected in narrative'] : ['Standard assistance triage'],
      suggestedVolunteerSkills: ['First Aid / BLS', 'Emergency Response']
    };
  }
};
