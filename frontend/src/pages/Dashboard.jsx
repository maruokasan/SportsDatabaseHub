import { useQueries } from '@tanstack/react-query';
import { fetchMatches } from '../api/matches';
import { fetchGoalsPer90, fetchInjuryBurden, fetchStandings } from '../api/analytics';
import KPICard from '../components/KPICard';
import ListTile from '../components/ListTile';
import StandingsMini from '../components/StandingsMini';

export default function Dashboard() {
  const [matchesQuery, standingsQuery, goalsQuery, injuryQuery] = useQueries({
    queries: [
      {
        queryKey: ['matches', 'dashboard', { status: 'upcoming' }],
        queryFn: () => fetchMatches({ status: 'upcoming', page: 1, limit: 5 })
      },
      { queryKey: ['analytics', 'standings'], queryFn: fetchStandings },
      { queryKey: ['analytics', 'goals-per-90'], queryFn: fetchGoalsPer90 },
      { queryKey: ['analytics', 'injury-burden'], queryFn: fetchInjuryBurden }
    ]
  });

  const queries = [matchesQuery, standingsQuery, goalsQuery, injuryQuery];
  const isLoading = queries.some((q) => q.isLoading);
  const error = queries.find((q) => q.error)?.error;

  if (isLoading) return <div className="p-6">Loading dashboard…</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load dashboard.</div>;

  const liveUpcoming = matchesQuery.data?.data ?? [];
  const standings = standingsQuery.data ?? [];
  const goals = goalsQuery.data ?? [];
  const injuries = injuryQuery.data ?? [];
  const topGoals = goals.slice(0, 5);
  const topGoalsPer90 = topGoals[0]?.goalsPer90?.toFixed(2) ?? '0.00';
  const topGoalsPlayer = topGoals[0]?.name ?? '—';

  return (
    <div className="space-y-6">
      <section className="card p-6 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_top_right,theme(colors.brand.600),transparent_50%),radial-gradient(ellipse_at_bottom_left,theme(colors.purple.400),transparent_50%)]" />
        <div className="relative flex flex-col gap-3">
          <h1 className="font-display text-2xl sm:text-3xl">League Overview</h1>
          <p className="text-gray-600">Monitor fixtures, table movement, and player form at a glance.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <KPICard title="Upcoming Fixtures" value={liveUpcoming.length} sub="next five matches" />
        </div>
        <div className="card p-4">
          <KPICard title="Teams on Table" value={standings.length} sub="with completed matches" />
        </div>
        <div className="card p-4">
          <KPICard title="Best Goals / 90" value={topGoalsPer90} sub={topGoalsPlayer} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="card p-4">
            <div className="mb-2 text-sm opacity-70">Live / Upcoming</div>
            {liveUpcoming.map((match) => (
              <ListTile
                key={match.id}
                primary={`${match.homeTeam?.name ?? 'TBD'} vs ${match.awayTeam?.name ?? 'TBD'}`}
                secondary={`${match.status} • ${new Date(match.matchDate).toLocaleString()}`}
              />
            ))}
            {!liveUpcoming.length && <div className="opacity-60 text-sm">No fixtures scheduled.</div>}
          </div>

          <div className="card p-4">
            <div className="mb-2 text-sm opacity-70">Active Injuries</div>
            {injuries.map((team) => (
              <ListTile key={team.teamId} primary={team.teamName} secondary={`${team.activeInjuries} players`} />
            ))}
            {!injuries.length && <div className="text-sm text-gray-500">All squads healthy.</div>}
          </div>
        </div>

        <div className="card p-4">
          <StandingsMini rows={standings} />
        </div>

        <div className="card p-4">
          <div className="mb-2 text-sm opacity-70">Goals per 90</div>
          {topGoals.map((row) => (
            <ListTile key={row.playerId} primary={row.name} secondary={`${row.goalsPer90.toFixed(2)} g/90`} />
          ))}
          {!topGoals.length && <div className="text-sm text-gray-500">No stats yet.</div>}
        </div>
      </div>
    </div>
  );
}
