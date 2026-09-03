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
  }
};
