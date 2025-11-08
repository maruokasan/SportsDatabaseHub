import api from './client';

export const fetchTeams = async (params = {}) => {
  const { data } = await api.get('/api/v1/teams', { params });
  return data;
};

export const createTeam = async (payload) => {
  const { data } = await api.post('/api/v1/teams', payload);
  return data;
};

export const updateTeam = async (id, payload) => {
  const { data } = await api.put(`/api/v1/teams/${id}`, payload);
  return data;
};

export const deleteTeam = async (id) => {
  await api.delete(`/api/v1/teams/${id}`);
};
