import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { fetchAgeGroupPerformance } from '../../api/analytics';
import { ChartCard } from '../ui';

const AgeGroupTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;

  return (
    <div className="rounded-panel border border-shell-border bg-shell-surface px-4 py-3 text-sm shadow-panel">
      <p className="font-semibold text-text-primary">{entry.bucket}</p>
      <p className="text-text-muted">Avg performance: {entry.avgPerformance}</p>
      <p className="text-text-muted">{entry.count} players</p>
    </div>
  );
};

export default function AgeGroupComparison({ season, tournaments }) {
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics', 'age-group-performance', season, selectedTournamentId],
    queryFn: () => fetchAgeGroupPerformance({ season, tournamentId: selectedTournamentId }),
  });

  const chartData = (data?.buckets ?? []).map((bucket) => ({
    bucket: bucket.bucket,
    avgPerformance: parseFloat(bucket.avgPerformance),
    count: bucket.count,
  }));

  const selectedTournament = tournaments?.find(t => t.id === selectedTournamentId);

  return (
    <ChartCard
      title="Age Group Performance"
      subtitle="Average performance by age group"
      meta={
        season || selectedTournamentId
          ? `${season ? `Season ${season}` : ''}${season ? ' · ' : ''}${selectedTournamentId ? `${selectedTournament?.name || 'Tournament filtered'}` : 'All tournaments'}`.trim()
          : 'All data'
      }
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-muted mb-2">
          Tournament Filter
        </label>
        <select
          value={selectedTournamentId || ''}
          onChange={(e) => setSelectedTournamentId(e.target.value || null)}
          className="w-full rounded-xl border border-shell-border bg-shell-base/40 px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600"
        >
          <option value="">All tournaments</option>
          {tournaments?.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.name}
            </option>
          ))}
        </select>
      </div>
      {!data || isLoading ? (
        <div className="flex h-full items-center justify-center text-sm text-text-muted">
          {isLoading ? 'Loading age group data…' : 'No data available'}
        </div>
      ) : isError ? (
        <div className="flex h-full items-center justify-center text-sm text-red-500">
          Failed to load age group performance data.
        </div>
      ) : !chartData.length ? (
        <div className="flex h-full items-center justify-center text-sm text-text-muted">
          No performance data found for the selected filters.
        </div>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="bucket" stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" />
                <RechartsTooltip content={<AgeGroupTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="avgPerformance" fill="var(--team-home)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 overflow-auto">
            <table className="analytics-table w-full text-sm">
              <caption className="sr-only">Age group performance table — average performance and player count by age bucket</caption>
              <thead>
                <tr className="text-left border-b">
                  <th className="px-4 py-3">Age Group</th>
                  <th className="px-4 py-3 text-right">Avg Performance</th>
                  <th className="px-4 py-3 text-right">Player Count</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row) => (
                  <tr key={row.bucket} className="border-b last:border-none">
                    <td className="px-4 py-3 font-medium">{row.bucket}</td>
                    <td className="px-4 py-3 text-right">{row.avgPerformance.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </ChartCard>
  );
}