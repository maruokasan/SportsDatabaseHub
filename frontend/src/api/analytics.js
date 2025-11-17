import api from "./client";

export const fetchStandings = async () => {
  const { data } = await api.get("/api/v1/analytics/standings");
  return data;
};

export const fetchGoalsPer90 = async () => {
  const { data } = await api.get("/api/v1/analytics/goals-per-90");
  return data;
};

export const fetchHeadToHead = async (teamA, teamB) => {
  const { data } = await api.get("/api/v1/analytics/head-to-head", {
    params: { teamA, teamB },
  });
  return data;
};

export const fetchInjuryBurden = async () => {
  const { data } = await api.get("/api/v1/analytics/injury-burden");
  return data;
};

export const fetchCareerAverages = async (params = {}) => {
  const { data } = await api.get("/api/v1/analytics/career-averages", {
    params,
  });
  return data;
};

export const fetchConsistency = async (params = {}) => {
  const { data } = await api.get("/api/v1/analytics/consistency", { params });
  return data;
};

export const fetchPlayerVsTeam = async (params = {}) => {
  const { data } = await api.get("/api/v1/analytics/player-vs-team", {
    params,
  });
  return data;
};

export const fetchPlayerWinRate = async () => {
  const { data } = await api.get("/api/v1/analytics/player-win-rate");
  return data;
};

export const fetchWinRateByNationality = async () => {
  const { data } = await api.get(
    "/api/v1/analytics/player-win-rate-by-nationality"
  );
  return data;
};

export const fetchTopScorers = async ({
  tournamentId,
  limit,
  offset,
  ...rest
} = {}) => {
  // Require tournamentId to avoid backend 400s. Keep backwards compatibility by
  // returning a rejected Promise when missing so callers that don't pass it will fail fast.
  if (!tournamentId) {
    return Promise.reject(
      new Error("fetchTopScorers: tournamentId query param required")
    );
  }
  const params = { tournamentId, limit, offset, ...rest };
  const { data } = await api.get("/api/v1/analytics/top-scorers", { params });
  return data;
};

export const fetchSeasonalTrend = async (params = {}) => {
  const { data } = await api.get("/api/v1/analytics/seasonal-trend", {
    params,
  });
  return data;
};

export const fetchPlayerLoadVsInjuries = async () => {
  const { data } = await api.get(
    "/api/v1/analytics/player-load-vs-active-injuries"
  );
  return data;
};

export const fetchNationalityPerformance = async () => {
  const { data } = await api.get("/api/v1/analytics/nationality-performance");
  return data;
};

export const fetchPresenceImpact = async (params = {}) => {
  const { data } = await api.get("/api/v1/analytics/player-presence-impact", {
    params,
  });
  return data;
};

export const fetchAgeGroupPerformance = async (params = {}) => {
  const { data } = await api.get("/api/v1/analytics/age-group-performance", {
    params,
  });
  return data;
};
