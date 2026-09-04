import api from './api';

export const requestService = {
  async getRequests(params = {}) {
    try {
      const response = await api.get('/requests', { params });
      return response.data.requests;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch requests' };
    }
  },

  async getRequestById(id) {
    try {
      const response = await api.get(`/requests/${id}`);
      return response.data.request;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch request details' };
    }
  },

  async createRequest(requestData) {
    try {
      const response = await api.post('/requests', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create request' };
    }
  },

  async updateStatus(id, status, volunteerInfo = null, note = '') {
    try {
      const response = await api.patch(`/requests/${id}/status`, { status, volunteerInfo, note });
      return response.data.request;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update request status' };
    }
  },

  async renewRequest(id) {
    try {
      const response = await api.patch(`/requests/${id}/renew`);
      return response.data.request;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to renew request' };
    }
  },

  async approveRequest(id) {
    try {
      const response = await api.patch(`/requests/${id}/approve`);
      return response.data.request;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to approve request' };
    }
  },

  async mergeRequests(duplicateId, targetId) {
    try {
      const response = await api.post('/requests/merge', { duplicateId, targetId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to merge requests' };
    }
  },

  async rejectRequest(id, reason = '') {
    try {
      const response = await api.patch(`/requests/${id}/reject`, { reason });
      return response.data.request;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reject request' };
    }
  },

  async addComment(id, text, author = '') {
    try {
      const response = await api.post(`/requests/${id}/comments`, { text, author });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add comment' };
    }
  },

  async verifyArrival(id, volunteerId, coordinates) {
    try {
      const response = await api.post(`/requests/${id}/verify-arrival`, { volunteerId, coordinates });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to verify on-site arrival' };
    }
  }
};
