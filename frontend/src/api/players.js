import api from './client';

export const fetchPlayers = async (params = {}) => {
  const { data } = await api.get('/api/v1/players', { params });
  return data;
};

export const createPlayer = async (payload) => {
  const { data } = await api.post('/api/v1/players', payload);
  return data;
};

export const updatePlayer = async (id, payload) => {
  const { data } = await api.put(`/api/v1/players/${id}`, payload);
  return data;
};

export const deletePlayer = async (id) => {
  await api.delete(`/api/v1/players/${id}`);
};

export const importPlayersCsv = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/api/v1/players/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};
