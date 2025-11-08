import api from './client';

export const fetchMatches = async (params = {}) => {
  const { data } = await api.get('/api/v1/matches', { params });
  return data;
};

export const createMatch = async (payload) => {
  const { data } = await api.post('/api/v1/matches', payload);
  return data;
};

export const completeMatch = async (matchId, payload) => {
  const { data } = await api.post(`/api/v1/matches/${matchId}/complete`, payload);
  return data;
};

export const fetchMatchById = async (id) => {
  const { data } = await api.get(`/api/v1/matches/${id}`);
  return data;
};
