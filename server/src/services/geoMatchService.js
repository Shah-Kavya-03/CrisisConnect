import Volunteer from '../models/Volunteer.js';
import User from '../models/User.js';

/**
 * Computes Haversine distance in km between two coordinate pairs
 */
export const getHaversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

/**
 * Finds and ranks best available volunteers for an emergency request
 */
export const findMatchingVolunteers = async (request) => {
  try {
    const { lat, lng } = request.coordinates || { lat: 28.6139, lng: 77.2090 };

    // Query available verified volunteers with active profiles
    const volunteers = await Volunteer.find({
      isAvailable: true,
      verificationStatus: 'Verified'
    }).populate('userId', 'name phone email trustScore badges');

    const candidates = [];

    for (const vol of volunteers) {
      if (!vol.userId) continue;

      const vCoords = vol.currentLocation && vol.currentLocation.coordinates
        ? { lng: vol.currentLocation.coordinates[0], lat: vol.currentLocation.coordinates[1] }
        : { lng: 77.2090, lat: 28.6139 };

      const distance = getHaversineDistanceKm(lat, lng, vCoords.lat, vCoords.lng);

      if (distance <= vol.serviceRadiusKm) {
        // Compute suitability rank:
        // Lower distance is better, higher trust score is better, matching skill is a bonus
        let skillBonus = 0;
        if (request.category === 'Medical' && vol.skills.some(s => s.toLowerCase().includes('doctor') || s.toLowerCase().includes('aid') || s.toLowerCase().includes('paramedic'))) {
          skillBonus = 20;
        } else if (request.category === 'Rescue' && vol.skills.some(s => s.toLowerCase().includes('rescue') || s.toLowerCase().includes('boat') || s.toLowerCase().includes('lifting'))) {
          skillBonus = 25;
        }

        const compositeRank = (100 - Math.min(distance * 5, 60)) + (vol.userId.trustScore * 0.4) + skillBonus;

        candidates.push({
          volunteerId: vol._id,
          userId: vol.userId._id,
          name: vol.userId.name,
          phone: vol.userId.phone,
          trustScore: vol.userId.trustScore,
          badges: vol.userId.badges,
          vehicleType: vol.vehicleType,
          skills: vol.skills,
          distanceKm: distance,
          estimatedArrivalMinutes: Math.max(Math.round(distance * 3.5), 5),
          suitabilityScore: Math.round(compositeRank)
        });
      }
    }

    candidates.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    return candidates;
  } catch (error) {
    return [];
  }
};
