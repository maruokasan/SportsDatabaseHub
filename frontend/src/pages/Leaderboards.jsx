import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchConsistency, fetchGoalsPer90, fetchTopScorers } from '../api/analytics';
import { fetchTournaments } from '../api/tournaments';

export default function Leaderboards() {
  const [selectedTournament, setSelectedTournament] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'goals-per-90', 'leaderboards'],
    queryFn: fetchGoalsPer90
  });

  const tournamentsQuery = useQuery({
    queryKey: ['tournaments', 'leaderboard-filter'],
    queryFn: () => fetchTournaments({ limit: 50 })
  });

  const topScorersQuery = useQuery({
    queryKey: ['analytics', 'top-scorers', selectedTournament],
    queryFn: () => fetchTopScorers({ tournamentId: selectedTournament, limit: 10 }),
    enabled: Boolean(selectedTournament)
  });

  const consistencyQuery = useQuery({
    queryKey: ['analytics', 'consistency', 'leaderboards'],
    queryFn: fetchConsistency
  });

  useEffect(() => {
    if (!selectedTournament && tournamentsQuery.data?.data?.length) {
      setSelectedTournament(tournamentsQuery.data.data[0].id);
    }
  }, [selectedTournament, tournamentsQuery.data]);

  const per90 = (data ?? []).slice(0, 10);
  const totalGoals = [...(data ?? [])]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10);
  const tournaments = tournamentsQuery.data?.data ?? [];
  const topScorers = topScorersQuery.data ?? [];
  const consistencyLeaders = (consistencyQuery.data ?? []).slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="font-display text-xl mb-3">Goals per 90</h2>
          {isLoading && <div>Loading leaderboards…</div>}
          {error && <div className="text-red-600 text-sm">Failed to load data.</div>}
          {!isLoading && !per90.length && <div className="text-sm text-gray-500">No stats yet.</div>}
          {per90.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Player</th>
                  <th>Team</th>
                  <th className="text-right">Goals</th>
                  <th className="text-right">Minutes</th>
                  <th className="text-right">G/90</th>
                </tr>
              </thead>
              <tbody>
                {per90.map((row) => (
                  <tr key={row.playerId} className="border-b last:border-none">
                    <td className="py-2 font-medium">{row.name}</td>
                    <td>{row.teamId ?? '—'}</td>
                    <td className="text-right">{row.goals}</td>
                    <td className="text-right">{row.minutes}</td>
                    <td className="text-right font-semibold">{row.goalsPer90.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card p-4">
          <h2 className="font-display text-xl mb-3">Total Goals</h2>
          {totalGoals.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Player</th>
                  <th className="text-right">Goals</th>
                  <th className="text-right">Minutes</th>
                </tr>
              </thead>
              <tbody>
                {totalGoals.map((row) => (
                  <tr key={`${row.playerId}-total`} className="border-b last:border-none">
                    <td className="py-2 font-medium">{row.name}</td>
                    <td className="text-right">{row.goals}</td>
                    <td className="text-right">{row.minutes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !isLoading && <div className="text-sm text-gray-500">No goal data yet.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <h2 className="font-display text-xl">Top Scorers by Tournament</h2>
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600"
              disabled={!tournaments.length}
            >
              {!tournaments.length && <option value="">No tournaments</option>}
              {tournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </option>
              ))}
            </select>
          </div>
          {tournamentsQuery.isLoading && <div>Loading tournaments…</div>}
          {selectedTournament && topScorersQuery.isLoading && <div>Loading top scorers…</div>}
          {selectedTournament && !topScorersQuery.isLoading && topScorers.length === 0 && (
            <div className="text-sm text-gray-500">No scoring data for this tournament.</div>
          )}
          {selectedTournament && topScorers.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Rank</th>
                  <th>Player</th>
                  <th className="text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {topScorers.map((row) => (
                  <tr key={row.playerId} className="border-b last:border-none">
                    <td className="py-2">{row.rank}</td>
                    <td className="font-medium">
                      {row.firstName} {row.lastName}
                    </td>
                    <td className="text-right font-semibold">{Number(row.totalPoints ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card p-4">
          <h2 className="font-display text-xl mb-3">Player Consistency Index</h2>
          {consistencyQuery.isLoading && <div>Loading consistency data…</div>}
          {!consistencyQuery.isLoading && consistencyLeaders.length === 0 && (
            <div className="text-sm text-gray-500">No score samples yet.</div>
          )}
          {consistencyLeaders.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Player</th>
                  <th className="text-right">Samples</th>
                  <th className="text-right">Avg Score</th>
                  <th className="text-right">Std Dev</th>
                </tr>
              </thead>
              <tbody>
                {consistencyLeaders.map((row) => (
                  <tr key={row.playerId} className="border-b last:border-none">
                    <td className="py-2 font-medium">{row.name}</td>
                    <td className="text-right">{row.samples}</td>
                    <td className="text-right">{Number(row.avgScore ?? 0).toFixed(2)}</td>
                    <td className="text-right">{Number(row.stdDevScore ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
