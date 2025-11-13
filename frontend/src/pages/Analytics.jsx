import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useRef, useEffect } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Filter, HelpCircle, SlidersHorizontal, Undo2, X } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import {
  fetchCareerAverages,
  fetchConsistency,
  fetchGoalsPer90,
  fetchHeadToHead,
  fetchPlayerVsTeam,
  fetchPlayerLoadVsInjuries,
  fetchPlayerWinRate,
  fetchSeasonalTrend,
  fetchWinRateByNationality,
  fetchPresenceImpact,
  fetchStandings,
  fetchInjuryBurden,
  fetchTopScorers
} from '../api/analytics';
import { fetchPlayers } from '../api/players';
import { fetchTeams } from '../api/teams';
import { fetchTournaments } from '../api/tournaments';
import { ChartCard } from '../components/ui';
import PageHeading from '../components/PageHeading';
import NationalityHeatmap from '../components/analytics/NationalityHeatmap';
import SeasonalTrendChart from '../components/analytics/SeasonalTrendChart';
import StandingsTable from '../components/analytics/StandingsTable';
import InjuryBurdenList from '../components/analytics/InjuryBurdenList';
import TopScorersTable from '../components/analytics/TopScorersTable';

const PresenceImpactTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;

  return (
    <div className="rounded-panel border border-shell-border bg-shell-surface px-4 py-3 text-sm shadow-panel">
      <p className="font-semibold text-text-primary">{entry.label}</p>
      <p className="text-text-muted">Avg score: {entry.avg_result.toFixed(2)}</p>
      <p className="text-text-muted">{entry.samples} matches</p>
    </div>
  );
};

export default function Analytics() {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [opponentTeamId, setOpponentTeamId] = useState('');
  const [isFiltersOpen, setFiltersOpen] = useState(false);
  const [consistencySort, setConsistencySort] = useState({ field: 'avgScore', direction: 'desc' });
  const [standingsAnnouncer, setStandingsAnnouncer] = useState('');
  const [consistencyAnnouncer, setConsistencyAnnouncer] = useState('');

  const prevFocusRef = useRef(null);
  const filtersModalRef = useRef(null);

  const openFilters = () => {
    try {
      prevFocusRef.current = document.activeElement;
    } catch (e) {
      prevFocusRef.current = null;
    }
    setFiltersOpen(true);
  };

  const closeFilters = () => {
    setFiltersOpen(false);
    try {
      if (prevFocusRef.current && document.contains(prevFocusRef.current)) {
        prevFocusRef.current.focus();
      }
    } catch (e) {
    }
  };

  useEffect(() => {
    if (!isFiltersOpen) return;

    const modal = filtersModalRef.current;
    if (!modal) return;

    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const allFocusable = Array.from(modal.querySelectorAll(focusableSelector)).filter((el) => el.offsetParent !== null);

    const focusTargets = allFocusable.length ? allFocusable : [modal];
    const first = focusTargets[0];
    first.focus?.();

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const active = document.activeElement;
      const idx = focusTargets.indexOf(active);
      if (e.shiftKey) {
        if (idx === 0 || idx === -1) {
          e.preventDefault();
          focusTargets[focusTargets.length - 1].focus();
        }
      } else {
        if (idx === focusTargets.length - 1 || idx === -1) {
          e.preventDefault();
          focusTargets[0].focus();
        }
      }
    };

    modal.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      modal.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFiltersOpen, filtersModalRef]);

  const goalsQuery = useQuery({
    queryKey: ['analytics', 'goals-per-90', 'analytics-page'],
    queryFn: fetchGoalsPer90
  });

  const loadVsInjuriesQuery = useQuery({
    queryKey: ['analytics', 'player-load-vs-active-injuries'],
    queryFn: fetchPlayerLoadVsInjuries
  });

  const teamsQuery = useQuery({
    queryKey: ['teams', 'all'],
    queryFn: () => fetchTeams({ limit: 100 })
  });

  const playersQuery = useQuery({
    queryKey: ['players', 'all-for-analytics'],
    queryFn: () => fetchPlayers({ limit: 200 })
  });

  const standingsQuery = useQuery({
    queryKey: ['analytics', 'standings'],
    queryFn: fetchStandings
  });

  const injuryBurdenQuery = useQuery({
    queryKey: ['analytics', 'injury-burden'],
    queryFn: fetchInjuryBurden
  });

  const tournamentsQuery = useQuery({
    queryKey: ['tournaments', 'all'],
    queryFn: () => fetchTournaments({ limit: 100 })
  });

  const tournamentId = tournamentsQuery.data?.data?.[0]?.id;

  const topScorersQuery = useQuery({
    queryKey: ['analytics', 'top-scorers', tournamentId],
    queryFn: () => fetchTopScorers({ tournamentId, limit: 10 }),
    enabled: Boolean(tournamentId)
  });

  const headToHeadQuery = useQuery({
    queryKey: ['analytics', 'head-to-head', teamA, teamB],
    queryFn: () => fetchHeadToHead(teamA, teamB),
    enabled: Boolean(teamA && teamB)
  });

  const careerQuery = useQuery({
    queryKey: ['analytics', 'career-averages'],
    queryFn: () => fetchCareerAverages()
  });

  const consistencyQuery = useQuery({
    queryKey: ['analytics', 'consistency'],
    queryFn: () => fetchConsistency()
  });

  const playerVsTeamQuery = useQuery({
    queryKey: ['analytics', 'player-vs-team', playerId, opponentTeamId],
    queryFn: () => fetchPlayerVsTeam({ playerId, teamId: opponentTeamId }),
    enabled: Boolean(playerId && opponentTeamId)
  });

  const presenceImpactQuery = useQuery({
    queryKey: ['analytics', 'presence-impact', playerId, opponentTeamId],
    queryFn: () => fetchPresenceImpact({ playerId, opponentTeamId }),
    enabled: Boolean(playerId && opponentTeamId)
  });

  const winRateQuery = useQuery({
    queryKey: ['analytics', 'player-win-rate'],
    queryFn: fetchPlayerWinRate
  });

  const nationalityWinRateQuery = useQuery({
    queryKey: ['analytics', 'player-win-rate-by-nationality'],
    queryFn: fetchWinRateByNationality
  });

  const seasonalTrendQuery = useQuery({
    queryKey: ['analytics', 'seasonal-trend'],
    queryFn: fetchSeasonalTrend
  });

  const selectedPlayer = playersQuery.data?.data?.find((player) => player.id === playerId);
  const selectedOpponentTeam = teamsQuery.data?.data?.find((team) => team.id === opponentTeamId);
  const presenceChartData = (presenceImpactQuery.data ?? []).map((row) => ({
    label: row.is_present ? 'With player' : 'Without player',
    avg_result: row.avg_result == null ? 0 : Number(row.avg_result),
    samples: Number(row.samples) || 0
  }));
  const hasFiltersApplied = Boolean(teamA || teamB || playerId || opponentTeamId);

  const resetFilters = () => {
    setTeamA('');
    setTeamB('');
    setPlayerId('');
    setOpponentTeamId('');
  };

  const getSortableValue = (row, field) => {
    if (field === 'samples') return Number(row.samples ?? 0);
    if (field === 'stdDevScore') return Number(row.stdDevScore ?? 0);
    return Number(row.avgScore ?? 0);
  };

  const sortedConsistency = useMemo(() => {
    const rows = (consistencyQuery.data ?? []).slice();
    return rows.sort((a, b) => {
      const valueA = getSortableValue(a, consistencySort.field);
      const valueB = getSortableValue(b, consistencySort.field);
      if (valueA === valueB) return 0;
      return consistencySort.direction === 'asc' ? valueA - valueB : valueB - valueA;
    });
  }, [consistencyQuery.data, consistencySort]);

  const displayedConsistency = sortedConsistency.slice(0, 8);

  const handleConsistencySort = (field) => {
    setConsistencySort((prev) => {
      if (prev.field === field) {
        const newDirection = prev.direction === 'asc' ? 'desc' : 'asc';
        setConsistencyAnnouncer(`Sorted by ${field} ${newDirection === 'asc' ? 'ascending' : 'descending'}`);
        return { field, direction: newDirection };
      }
      const defaultDirection = field === 'stdDevScore' ? 'asc' : 'desc';
      setConsistencyAnnouncer(`Sorted by ${field} ${defaultDirection === 'asc' ? 'ascending' : 'descending'}`);
      return { field, direction: defaultDirection };
    });
  };

  const getSortState = (field) => {
    if (consistencySort.field !== field) return 'none';
    return consistencySort.direction === 'asc' ? 'ascending' : 'descending';
  };

  const getPlayerInitials = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const SortIcon = ({ field }) => {
    if (consistencySort.field !== field) return <ArrowUpDown size={14} aria-hidden="true" />;
    const Icon = consistencySort.direction === 'asc' ? ArrowUp : ArrowDown;
    return <Icon size={14} aria-hidden="true" />;
  };

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="History"
        title="Match History & Analytics"
        description="Explore trend cards, league tables, and player context for every matchweek."
      />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-shell-border bg-shell-surface px-4 py-3 shadow-panel">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Filters</p>
          <p className="text-sm text-text-muted">Tweak comparison inputs for the cards below.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasFiltersApplied ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-1 text-xs font-semibold text-accent">
              <Filter size={14} aria-hidden="true" />
              Filters applied
            </span>
          ) : null}
          <button
            type="button"
            onClick={openFilters}
            aria-expanded={isFiltersOpen}
            className="inline-flex items-center gap-2 rounded-full border border-shell-border bg-shell-base/40 px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Adjust filters
          </button>
          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasFiltersApplied}
            className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-medium text-text-muted transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/40 disabled:pointer-events-none disabled:opacity-50"
          >
            <Undo2 size={16} aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>
      {isFiltersOpen ? (
        <div className="fixed inset-0 z-40">
          <button type="button" className="absolute inset-0 bg-black/70" onClick={closeFilters} aria-label="Close filters backdrop" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Analytics filters"
            aria-labelledby="analytics-filters-title"
            ref={filtersModalRef}
            className="fixed inset-x-4 top-20 z-50 mx-auto max-w-3xl rounded-panel border border-shell-border bg-shell-surface p-6 shadow-panel backdrop-blur sm:inset-x-auto sm:right-8 sm:top-24"
          >
            <header className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Filter panel</p>
                <h3 id="analytics-filters-title" className="font-display text-xl">Tune analytics context</h3>
                <p className="text-sm text-text-muted">Select teams or players to instantly update related tables.</p>
              </div>
              <button
                type="button"
                onClick={closeFilters}
                className="grid h-10 w-10 place-items-center rounded-full border border-shell-border text-text-muted transition hover:text-text-primary"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </header>
            <div className="space-y-6">
              <section>
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-text-muted">Head-to-head</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm font-medium text-text-muted">
                    Team A
                    <select
                      value={teamA}
                      onChange={(e) => setTeamA(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-shell-border bg-shell-base/40 px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600"
                    >
                      <option value="">Select Team A</option>
                      {teamsQuery.data?.data?.map((team) => (
                        <option key={`filter-team-a-${team.id}`} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-text-muted">
                    Team B
                    <select
                      value={teamB}
                      onChange={(e) => setTeamB(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-shell-border bg-shell-base/40 px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600"
                    >
                      <option value="">Select Team B</option>
                      {teamsQuery.data?.data?.map((team) => (
                        <option key={`filter-team-b-${team.id}`} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>
              <section>
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-text-muted">Player matchup</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm font-medium text-text-muted">
                    Player
                    <select
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-shell-border bg-shell-base/40 px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600"
                    >
                      <option value="">Select Player</option>
                      {playersQuery.data?.data?.map((player) => (
                        <option key={`filter-player-${player.id}`} value={player.id}>
                          {player.firstName} {player.lastName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-text-muted">
                    Opponent team
                    <select
                      value={opponentTeamId}
                      onChange={(e) => setOpponentTeamId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-shell-border bg-shell-base/40 px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600"
                    >
                      <option value="">Select Opponent Team</option>
                      {teamsQuery.data?.data?.map((team) => (
                        <option key={`filter-opponent-${team.id}`} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-full border border-shell-border px-4 py-2 text-sm font-medium text-text-muted transition hover:text-text-primary"
              >
                <Undo2 size={16} />
                Clear all
              </button>
              <button
                type="button"
                onClick={closeFilters}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-panel"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="card p-4">
        <h2 className="font-display text-2xl mb-3">Head-to-Head</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <select
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value="">Select Team A</option>
            {teamsQuery.data?.data?.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <select
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value="">Select Team B</option>
            {teamsQuery.data?.data?.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <div className="rounded-xl border px-3 py-2 text-sm flex items-center">
            {teamA && teamB ? 'Comparison ready' : 'Pick two teams'}
          </div>
        </div>
        {headToHeadQuery.isLoading && <div>Loading comparison…</div>}
        {headToHeadQuery.isFetched && headToHeadQuery.data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border p-4">
              <div className="text-sm opacity-70 mb-2">Summary</div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="text-2xl font-display">{headToHeadQuery.data.summary.teamA.wins}</div>
                  <div>Team A Wins</div>
                </div>
                <div>
                  <div className="text-2xl font-display">{headToHeadQuery.data.summary.teamB.wins}</div>
                  <div>Team B Wins</div>
                </div>
                <div>
                  <div className="text-2xl font-display">{headToHeadQuery.data.summary.draws}</div>
                  <div>Draws</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="text-sm opacity-70 mb-2">Recent Meetings</div>
              <div className="space-y-2 text-sm">
                {headToHeadQuery.data.details.map((match) => (
                  <div key={match.matchId} className="flex justify-between">
                    <div>{match.homeTeam} vs {match.awayTeam}</div>
                    <div className="font-medium">{match.score}</div>
                  </div>
                ))}
                {!headToHeadQuery.data.details.length && <div>No meetings yet.</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="font-display text-2xl mb-3">Player vs Opponent Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <select
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="">Select Player</option>
              {playersQuery.data?.data?.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.firstName} {player.lastName}
                </option>
              ))}
            </select>
            <select
              value={opponentTeamId}
              onChange={(e) => setOpponentTeamId(e.target.value)}
              className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="">Select Opponent Team</option>
              {teamsQuery.data?.data?.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <div className="rounded-xl border px-3 py-2 text-sm flex items-center">
              {playerId && opponentTeamId ? 'Ready to compute aggregate' : 'Pick a player and opponent'}
            </div>
          </div>
          {playerVsTeamQuery.isLoading && <div>Loading matchup aggregates…</div>}
          {playerVsTeamQuery.isError && <div className="text-sm text-red-600">Failed to load matchup results.</div>}
          {!playerVsTeamQuery.isLoading && playerId && opponentTeamId && (!playerVsTeamQuery.data || !playerVsTeamQuery.data.appearances) && (
            <div className="text-sm text-gray-500">No appearances for that matchup yet.</div>
          )}
          {playerVsTeamQuery.data?.appearances > 0 && (
            <table className="analytics-table w-full text-sm">
              <caption className="sr-only">Player vs Opponent table — aggregate points vs selected opponent</caption>
              <thead>
                <tr className="text-left border-b">
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Opponent</th>
                  <th className="px-4 py-3 text-right">Goals</th>
                  <th className="px-4 py-3 text-right">Assists</th>
                  <th className="px-4 py-3 text-right">Appearances</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 font-medium">
                    {playerVsTeamQuery.data.firstName} {playerVsTeamQuery.data.lastName}
                  </td>
                  <td className="px-4 py-3">{playerVsTeamQuery.data.opponentTeamName ?? 'Unknown'}</td>
                  <td className="px-4 py-3 text-right font-semibold">{Number(playerVsTeamQuery.data.totalGoals ?? 0).toFixed(0)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{Number(playerVsTeamQuery.data.totalAssists ?? 0).toFixed(0)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{Number(playerVsTeamQuery.data.appearances ?? 0)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        <ChartCard
          title="Player Presence Impact"
          subtitle="Team scoring delta"
          meta={
            playerId && opponentTeamId
              ? `${selectedPlayer ? `${selectedPlayer.firstName} ${selectedPlayer.lastName}` : 'Player'} · ${
                  selectedOpponentTeam?.name ?? 'Opponent'
                }`
              : 'Pick a player and opponent to compare'
          }
        >
          {!playerId || !opponentTeamId ? (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              Choose a player + opponent to explore presence impact.
            </div>
          ) : presenceImpactQuery.isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              Computing presence impact…
            </div>
          ) : presenceImpactQuery.isError ? (
            <div className="flex h-full items-center justify-center text-sm text-red-500">
              Failed to load presence impact.
            </div>
          ) : !presenceChartData.length ? (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              No completed matches found for that combination.
            </div>
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={presenceChartData} barCategoryGap={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="label" stroke="var(--color-text-muted)" />
                    <YAxis stroke="var(--color-text-muted)" allowDecimals={false} />
                    <RechartsTooltip content={<PresenceImpactTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="avg_result" fill="var(--team-home)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                {presenceChartData.map((row) => (
                  <div key={`presence-${row.label}`} className="rounded-xl border border-shell-border px-3 py-2">
                    <div className="font-semibold text-text-primary">{row.label}</div>
                    <div className="text-xs text-text-muted">{row.samples} matches · Avg {row.avg_result.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </div>

      <div className="card p-4">
        <h2 className="font-display text-2xl mb-3">Goals per 90</h2>
        {goalsQuery.isLoading && <div>Loading analytics…</div>}
        {!goalsQuery.isLoading && (goalsQuery.data ?? []).length === 0 && <div className="text-sm text-gray-500">No player stats yet.</div>}
        {(goalsQuery.data ?? []).length > 0 && (
          <table className="analytics-table w-full text-sm">
            <caption className="sr-only">Goals per 90 table — ranking of players by goals and minutes</caption>
            <thead>
              <tr className="text-left border-b">
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3 text-right">Goals</th>
                <th className="px-4 py-3 text-right">Minutes</th>
                <th className="px-4 py-3 text-right">G/90</th>
              </tr>
            </thead>
            <tbody>
              {goalsQuery.data.slice(0, 8).map((row) => (
                <tr key={`${row.playerId}-analytics`} className="border-b last:border-none">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-right">{row.goals}</td>
                  <td className="px-4 py-3 text-right">{row.minutes}</td>
                  <td className="px-4 py-3 text-right font-semibold">{row.goalsPer90.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-4">
        <h2 className="font-display text-2xl mb-3">Load &amp; Injury Burden (Minutes vs Active Injuries)</h2>
        {loadVsInjuriesQuery.isLoading && <div>Loading workload metrics…</div>}
        {loadVsInjuriesQuery.isError && <div className="text-sm text-red-600">Failed to load workload data.</div>}
        {!loadVsInjuriesQuery.isLoading && !loadVsInjuriesQuery.isError && (loadVsInjuriesQuery.data ?? []).length === 0 && (
          <div className="text-sm text-gray-500">No player workload data yet.</div>
        )}
        {!loadVsInjuriesQuery.isLoading && !loadVsInjuriesQuery.isError && (loadVsInjuriesQuery.data ?? []).length > 0 && (
          <div className="overflow-auto border rounded">
            <table className="analytics-table min-w-full text-sm">
              <caption className="sr-only">Load & Injury Burden table — minutes vs active injuries per player</caption>
              <thead>
                <tr className="text-left border-b">
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3 text-right">Minutes</th>
                  <th className="px-4 py-3 text-right">Active Injuries</th>
                </tr>
              </thead>
              <tbody>
                {(loadVsInjuriesQuery.data ?? []).map((row) => (
                  <tr key={row.playerId} className="border-b last:border-none">
                    <td className="px-4 py-3 font-medium">{row.firstName} {row.lastName}</td>
                    <td className="px-4 py-3 text-right">{Number(row.minutes ?? 0)}</td>
                    <td className="px-4 py-3 text-right">{Number(row.active_injuries ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-4">
        <h2 className="font-display text-2xl mb-3">Win Rate by Scores per Player</h2>
        {winRateQuery.isLoading && <div>Calculating win rates…</div>}
        {winRateQuery.isError && <div className="text-sm text-red-600">Failed to load player win rates.</div>}
        {!winRateQuery.isLoading && !winRateQuery.isError && (winRateQuery.data ?? []).length === 0 && (
          <div className="text-sm text-gray-500">No score records available.</div>
        )}
        {!winRateQuery.isLoading && !winRateQuery.isError && (winRateQuery.data ?? []).length > 0 && (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Win rate by scores table — avg results per player</caption>
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Player</th>
                  <th className="text-right">Avg Result</th>
                </tr>
              </thead>
              <tbody>
                {winRateQuery.data.map((row) => (
                  <tr key={`${row.playerId}-win-rate`} className="border-b last:border-none">
                    <td className="py-2 font-medium">{row.firstName} {row.lastName}</td>
                    <td className="text-right font-semibold">
                      {row.avgResult == null ? '—' : Number(row.avgResult).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <NationalityHeatmap
          data={nationalityWinRateQuery.data ?? []}
          isLoading={nationalityWinRateQuery.isLoading}
          isError={nationalityWinRateQuery.isError}
        />
        <SeasonalTrendChart
          data={seasonalTrendQuery.data ?? []}
          isLoading={seasonalTrendQuery.isLoading}
          isError={seasonalTrendQuery.isError}
          bucket="month"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="font-display text-2xl mb-3">Career Averages</h2>
          {careerQuery.isLoading && <div>Loading career averages…</div>}
          {!careerQuery.isLoading && (careerQuery.data ?? []).length === 0 && (
            <div className="text-sm text-gray-500">No player stats yet.</div>
          )}
          {(careerQuery.data ?? []).length > 0 && (
            <div className="overflow-auto">
              <table className="analytics-table w-full text-sm">
                <caption className="sr-only">Career averages table — player career stats and per-90 rates</caption>
                <thead>
                  <tr className="text-left border-b">
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3 text-right">Matches</th>
                    <th className="px-4 py-3 text-right">Total Goals</th>
                    <th className="px-4 py-3 text-right">Total Assists</th>
                    <th className="px-4 py-3 text-right">Total Minutes</th>
                    <th className="px-4 py-3 text-right">Avg Goals</th>
                    <th className="px-4 py-3 text-right">Avg Assists</th>
                    <th className="px-4 py-3 text-right">G/90</th>
                  </tr>
                </thead>
                <tbody>
                  {careerQuery.data.slice(0, 8).map((row) => (
                    <tr key={`${row.playerId}-career`} className="border-b last:border-none">
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3 text-right">{row.matches}</td>
                      <td className="px-4 py-3 text-right">{row.totalGoals}</td>
                      <td className="px-4 py-3 text-right">{row.totalAssists}</td>
                      <td className="px-4 py-3 text-right">{row.totalMinutes}</td>
                      <td className="px-4 py-3 text-right">{row.avgGoals.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{row.avgAssists.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{row.goalsPer90.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-4">
          <h2 className="font-display text-2xl mb-3">Consistency</h2>
          {consistencyQuery.isLoading && <div>Measuring consistency…</div>}
          {!consistencyQuery.isLoading && (consistencyQuery.data ?? []).length === 0 && (
            <div className="text-sm text-gray-500">Not enough match data.</div>
          )}
          {displayedConsistency.length > 0 && (
          <>
            <table className="analytics-table w-full text-sm">
              <caption className="sr-only">Consistency table — shows player consistency metrics</caption>
              <thead>
                <tr className="text-left border-b">
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3 text-right" aria-sort={getSortState('samples')}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleConsistencySort('samples')}
                        className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-text-muted"
                      >
                        Samples
                        <SortIcon field="samples" />
                      </button>
                      <button
                        type="button"
                        className="text-text-muted transition hover:text-text-primary"
                        title="Number of matches contributing to this score."
                        aria-label="Samples definition"
                      >
                        <HelpCircle size={14} />
                      </button>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right" aria-sort={getSortState('avgScore')}>
                    <button
                      type="button"
                      onClick={() => handleConsistencySort('avgScore')}
                      className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-text-muted"
                    >
                      Avg Score
                      <SortIcon field="avgScore" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right" aria-sort={getSortState('stdDevScore')}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleConsistencySort('stdDevScore')}
                        className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-text-muted"
                      >
                        Std Dev
                        <SortIcon field="stdDevScore" />
                      </button>
                      <button
                        type="button"
                        className="text-text-muted transition hover:text-text-primary"
                        title="Shows how volatile the player scores are from match to match."
                        aria-label="Standard deviation definition"
                      >
                        <HelpCircle size={14} />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedConsistency.map((row) => (
                  <tr
                    key={`${row.playerId}-consistency`}
                    className="border-b last:border-none transition hover:bg-shell-base/30 focus-within:bg-shell-base/30"
                  >
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-shell-base/70 text-sm font-semibold text-text-primary">
                          {getPlayerInitials(row.name)}
                        </span>
                        <div>
                          <div className="font-semibold text-text-primary">{row.name}</div>
                          <p className="text-xs text-text-muted">ID {row.playerId ? String(row.playerId).slice(0, 6) : '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right tabular-nums px-4 py-3">{row.samples}</td>
                    <td className="text-right tabular-nums px-4 py-3">{Number(row.avgScore ?? 0).toFixed(2)}</td>
                    <td className="text-right tabular-nums px-4 py-3">{Number(row.stdDevScore ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div id="analytics-consistency-announcer" aria-live="polite" className="sr-only">
              {consistencyAnnouncer}
            </div>
          </>
        )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StandingsTable data={standingsQuery.data ?? []} isLoading={standingsQuery.isLoading} isError={standingsQuery.isError} />
        <div id="analytics-standings-announcer" aria-live="polite" className="sr-only">
          {standingsAnnouncer}
        </div>
        <InjuryBurdenList data={injuryBurdenQuery.data ?? []} isLoading={injuryBurdenQuery.isLoading} isError={injuryBurdenQuery.isError} />
        <TopScorersTable data={topScorersQuery.data ?? []} isLoading={topScorersQuery.isLoading} isError={topScorersQuery.isError} />
      </div>
      </div>
    </div>
  );
}
