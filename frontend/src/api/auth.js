import api from './client';

export const loginRequest = async (email, password) => {
  const { data } = await api.post('/api/v1/auth/login', { email, password });
  return data;
};
