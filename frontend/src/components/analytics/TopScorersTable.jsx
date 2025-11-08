import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpDown } from 'lucide-react';
import ChartCard from '../ui/ChartCard';
import { fetchTeams } from '../../api/teams';

const badgePalette = [
  'bg-accent/15 text-accent',
  'bg-info/15 text-info',
  'bg-success/15 text-success',
  'bg-warning/15 text-warning'
];

const getPlayerName = (row = {}) => `${row.firstName ?? row.first_name ?? ''} ${row.lastName ?? row.last_name ?? ''}`.trim() || 'Unknown player';
const getTeamName = (row = {}, teamMap) => {
  if (row.teamName ?? row.team_name) return row.teamName ?? row.team_name;
  if (teamMap?.has(row.teamId)) return teamMap.get(row.teamId);
  if (row.team_id && teamMap?.has(row.team_id)) return teamMap.get(row.team_id);
  return row.teamId ?? row.team_id ?? '—';
};
const getTournamentName = (row = {}) => row.tournamentName ?? row.tournament_name ?? '';

const getSortMetric = (row, metric) => {
  if (metric === 'goals') return Number(row.totalGoals ?? row.goals ?? 0);
  if (metric === 'assists') return Number(row.totalAssists ?? row.assists ?? 0);
  return Number(row.totalPoints ?? row.total_points ?? row.points ?? 0);
};

const sortOptions = [
  { value: 'points', label: 'Points' },
  { value: 'goals', label: 'Goals' },
  { value: 'assists', label: 'Assists' }
];

export default function TopScorersTable({ data = [], isLoading = false, isError = false }) {
  const [sortField, setSortField] = useState('points');
  const [sortDirection, setSortDirection] = useState('desc');
  const [tournamentFilter, setTournamentFilter] = useState('all');
  // aria-live announcer for sort changes
  const [topScorersAnnouncer, setTopScorersAnnouncer] = useState('');
  const teamsQuery = useQuery({
    queryKey: ['teams', 'top-scorers-card'],
    queryFn: () => fetchTeams({ limit: 200 })
  });

  const teamMap = useMemo(() => {
    const entries = teamsQuery.data?.data ?? [];
    return new Map(entries.map((team) => [team.id, team.name]));
  }, [teamsQuery.data]);

  const tournaments = useMemo(() => {
    const entries = Array.from(
      data.reduce((map, row) => {
        const name = getTournamentName(row);
        if (!name) return map;
        map.set(name, name);
        return map;
      }, new Map())
    ).map(([value, label]) => ({ value, label }));
    return entries;
  }, [data]);

  const filteredRows = useMemo(() => {
    if (tournamentFilter === 'all') return data;
    return data.filter((row) => getTournamentName(row) === tournamentFilter);
  }, [data, tournamentFilter]);

  const sortedRows = useMemo(() => {
    const rows = filteredRows.slice();
    rows.sort((a, b) => {
      const metricA = getSortMetric(a, sortField);
      const metricB = getSortMetric(b, sortField);
      if (metricA === metricB) return 0;
      return sortDirection === 'asc' ? metricA - metricB : metricB - metricA;
    });
    return rows;
  }, [filteredRows, sortField, sortDirection]);

  const activeTournamentLabel =
    tournamentFilter === 'all'
      ? tournaments.length === 1
        ? tournaments[0]?.label
        : null
      : tournamentFilter;

  if (isLoading) {
    return (
      <ChartCard title="Top Scorers" subtitle="By tournament">
        <div className="flex h-40 items-center justify-center text-sm text-text-muted">Loading top scorers…</div>
      </ChartCard>
    );
  }

  if (isError) {
    return (
      <ChartCard title="Top Scorers" subtitle="By tournament">
        <div className="flex h-40 items-center justify-center text-sm text-red-500">Failed to load top scorers.</div>
      </ChartCard>
    );
  }

  if (!data || !data.length) {
    return (
      <ChartCard title="Top Scorers" subtitle="By tournament">
        <div className="flex h-40 items-center justify-center text-sm text-text-muted">No scorer data available.</div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Top Scorers" subtitle="By tournament" meta={activeTournamentLabel ? `Tournament · ${activeTournamentLabel}` : undefined}>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          Sort by
          <select
            value={sortField}
            onChange={(event) => {
              const field = event.target.value;
              setSortField(field);
              // aria-live announcer update — no logic change
              setTopScorersAnnouncer(`Sorted by ${field} ${sortDirection === 'asc' ? 'ascending' : 'descending'}`);
            }}
            className="rounded-full border border-shell-border bg-shell-base/40 px-3 py-1.5 text-xs uppercase tracking-wide"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() =>
            setSortDirection((prev) => {
              const next = prev === 'asc' ? 'desc' : 'asc';
              // aria-live announcer update — no logic change
              setTopScorersAnnouncer(`Sorted by ${sortField} ${next === 'asc' ? 'ascending' : 'descending'}`);
              return next;
            })
          }
          className="inline-flex items-center gap-2 rounded-full border border-shell-border px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:text-text-primary"
        >
          <ArrowUpDown size={14} aria-hidden="true" />
          {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
        </button>
        {tournaments.length > 1 ? (
          <label className="flex items-center gap-2">
            Tournament
            <select
              value={tournamentFilter}
              onChange={(event) => setTournamentFilter(event.target.value)}
              className="rounded-full border border-shell-border bg-shell-base/40 px-3 py-1.5 text-xs uppercase tracking-wide"
            >
              <option value="all">All</option>
              {tournaments.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <caption className="sr-only">Top scorers table — ranked by goals and minutes</caption>
          <thead>
            <tr className="border-b border-shell-border/80 text-xs uppercase tracking-[0.2em] text-text-muted">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Player</th>
              <th className="px-3 py-2 text-left">Team</th>
              <th className="px-3 py-2 text-right" aria-sort={sortField === 'goals' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                Goals
              </th>
              <th className="px-3 py-2 text-right" aria-sort={sortField === 'assists' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                Assists
              </th>
              <th className="px-3 py-2 text-right" aria-sort={sortField === 'points' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                Points
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-shell-border/40">
            {sortedRows.map((row, idx) => {
              const playerName = getPlayerName(row);
              const teamName = getTeamName(row, teamMap);
              const badgeTone = badgePalette[idx % badgePalette.length];
              return (
                <tr key={`scorer-${row.playerId ?? idx}`} className="transition hover:bg-shell-base/30">
                  <td className="px-3 py-3 font-semibold text-text-muted">{row.rank ?? idx + 1}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold ${badgeTone}`}>
                        {playerName
                          .split(' ')
                          .filter(Boolean)
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase() || '—'}
                      </span>
                      <div>
                        <p className="font-semibold text-text-primary">{playerName}</p>
                        <p className="text-xs text-text-muted">{row.position ?? 'Attacker'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full border border-shell-border/60 px-2 py-0.5 text-xs font-semibold uppercase text-text-muted">
                      {teamName}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold">{Number(getSortMetric(row, 'goals')).toLocaleString()}</td>
                  <td className="px-3 py-3 text-right font-semibold">{Number(getSortMetric(row, 'assists')).toLocaleString()}</td>
                  <td className="px-3 py-3 text-right font-semibold">
                    {Number(getSortMetric(row, 'points')).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div id="topscorers-sort-announcer" aria-live="polite" className="sr-only">
          {topScorersAnnouncer}
        </div>
      </div>
    </ChartCard>
  );
}
