import api from './client';

export const fetchDashboard = async () => {
  const { data } = await api.get('/api/dashboard');
  return data;
};
