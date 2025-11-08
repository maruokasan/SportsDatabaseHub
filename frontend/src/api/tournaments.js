import api from './client';

export const fetchTournaments = async (params = {}) => {
  const { data } = await api.get('/api/v1/tournaments', { params });
  return data;
};

export const createTournament = async (payload) => {
  const { data } = await api.post('/api/v1/tournaments', payload);
  return data;
};

export const updateTournament = async (id, payload) => {
  const { data } = await api.put(`/api/v1/tournaments/${id}`, payload);
  return data;
};

export const deleteTournament = async (id) => {
  await api.delete(`/api/v1/tournaments/${id}`);
};
