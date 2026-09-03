import api from './api';

export const volunteerService = {
  async getNearbyVolunteers(params = {}) {
    try {
      const response = await api.get('/volunteers/nearby', { params });
      return response.data.volunteers;
    } catch (error) {
      return [];
    }
  },

  async getVolunteerStats() {
    try {
      const response = await api.get('/volunteers/stats');
      return response.data.stats;
    } catch (error) {
      return null;
    }
  },

  async updateLocation(lat, lng, isAvailable = true) {
    try {
      const response = await api.patch('/volunteers/location', { lat, lng, isAvailable });
      return response.data.volunteer;
    } catch (error) {
      return null;
    }
  }
};
