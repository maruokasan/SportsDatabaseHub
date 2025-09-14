import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../api/dashboard';
import KPICard from '../components/KPICard';
import ListTile from '../components/ListTile';
import TrendChart from '../components/TrendChart';
import StandingsMini from '../components/StandingsMini';

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard });

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load.</div>;

  const { liveUpcoming, standingsMini, topScorers, topAssists, trend } = data;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="card p-6 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_top_right,theme(colors.brand.600),transparent_50%),radial-gradient(ellipse_at_bottom_left,theme(colors.purple.400),transparent_50%)]" />
        <div className="relative flex flex-col gap-3">
          <h1 className="font-display text-2xl sm:text-3xl">League Overview</h1>
          <p className="text-gray-600">Live fixtures, form guide, top performers, and trends at a glance.</p>
        </div>
      </section>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4"><KPICard title="Live/Upcoming" value={liveUpcoming.length} sub="next 5 fixtures" /></div>
        <div className="card p-4"><KPICard title="Top Scorer Goals" value={topScorers[0]?.Goals ?? 0} sub={topScorers[0]?.FullName ?? '—'} /></div>
        <div className="card p-4"><KPICard title="Top Assists" value={topAssists[0]?.Assists ?? 0} sub={topAssists[0]?.FullName ?? '—'} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: Live/Upcoming + Top Scorers + Assists */}
        <div className="space-y-4">
          <div className="card p-4">
            <div className="mb-2 text-sm opacity-70">Live / Upcoming</div>
            {liveUpcoming.map(m => (
              <ListTile key={m.MatchID}
                primary={`${m.HomeTeam} vs ${m.AwayTeam}`}
                secondary={`${m.Status} • ${new Date(m.StartDateTime).toLocaleString()}`} />
            ))}
            {liveUpcoming.length === 0 && <div className="opacity-60 text-sm">No fixtures.</div>}
          </div>

          <div className="card p-4">
            <div className="mb-2 text-sm opacity-70">Top Scorers</div>
            {topScorers.map(p => (
              <ListTile key={p.PlayerID} primary={p.FullName} secondary={`${p.Goals} goals`} />
            ))}
          </div>

          <div className="card p-4">
            <div className="mb-2 text-sm opacity-70">Top Assists</div>
            {topAssists.map(p => (
              <ListTile key={p.PlayerID} primary={p.FullName} secondary={`${p.Assists} assists`} />
            ))}
          </div>
        </div>

        {/* Middle column: Standings mini */}
        <div className="card p-4"><StandingsMini rows={standingsMini} /></div>

        {/* Right column: Trend line */}
        <div className="card p-4"><TrendChart data={trend} /></div>
      </div>

      {/* Shortcuts */}
      <div className="card p-4">
        <div className="mb-2 text-sm opacity-70">Shortcuts</div>
        <div className="flex flex-wrap gap-2 text-sm">
          <a className="px-3 py-2 border rounded-xl" href="/leaderboards">Leaderboards</a>
          <a className="px-3 py-2 border rounded-xl" href="/standings">Standings</a>
          <a className="px-3 py-2 border rounded-xl" href="/analytics">Analytics</a>
          <a className="px-3 py-2 border rounded-xl" href="/matches">Matches</a>
        </div>
      </div>
    </div>
  );
}
