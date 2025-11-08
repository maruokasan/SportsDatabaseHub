import { useQuery } from '@tanstack/react-query';
import { fetchStandings } from '../api/analytics';

export default function Standings() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'standings', 'full'],
    queryFn: fetchStandings
  });

  return (
    <div className="card p-4">
      <h2 className="font-display text-2xl mb-4">League Standings</h2>
      {isLoading && <div>Loading standings…</div>}
      {error && <div className="text-red-600 text-sm">Failed to load standings.</div>}
      {!isLoading && (data ?? []).length === 0 && <div className="text-sm text-gray-500">No completed matches yet.</div>}
      {(data ?? []).length > 0 && (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">#</th>
                <th>Team</th>
                <th className="text-right">P</th>
                <th className="text-right">W</th>
                <th className="text-right">D</th>
                <th className="text-right">L</th>
                <th className="text-right">GF</th>
                <th className="text-right">GA</th>
                <th className="text-right">GD</th>
                <th className="text-right">Pts</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={row.teamId} className="border-b last:border-none">
                  <td className="py-2">{index + 1}</td>
                  <td className="font-medium">{row.teamName}</td>
                  <td className="text-right">{row.played}</td>
                  <td className="text-right">{row.wins}</td>
                  <td className="text-right">{row.draws}</td>
                  <td className="text-right">{row.losses}</td>
                  <td className="text-right">{row.goalsFor}</td>
                  <td className="text-right">{row.goalsAgainst}</td>
                  <td className="text-right">{row.goalsFor - row.goalsAgainst}</td>
                  <td className="text-right font-semibold">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
