import { useQuery } from '@tanstack/react-query';
import { fetchGoalsPer90 } from '../api/analytics';

export default function Leaderboards() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'goals-per-90', 'leaderboards'],
    queryFn: fetchGoalsPer90
  });

  const per90 = (data ?? []).slice(0, 10);
  const totalGoals = [...(data ?? [])]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10);

  return (
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
  );
}
