import api from './client';

export const fetchStandings = async () => {
  const { data } = await api.get('/api/v1/analytics/standings');
  return data;
};

export const fetchGoalsPer90 = async () => {
  const { data } = await api.get('/api/v1/analytics/goals-per-90');
  return data;
};

export const fetchHeadToHead = async (teamA, teamB) => {
  const { data } = await api.get('/api/v1/analytics/head-to-head', {
    params: { teamA, teamB }
  });
  return data;
};

export const fetchInjuryBurden = async () => {
  const { data } = await api.get('/api/v1/analytics/injury-burden');
  return data;
};

export const fetchCareerAverages = async (params = {}) => {
  const { data } = await api.get('/api/v1/analytics/career-averages', { params });
  return data;
};

export const fetchConsistency = async (params = {}) => {
  const { data } = await api.get('/api/v1/analytics/consistency', { params });
  return data;
};
