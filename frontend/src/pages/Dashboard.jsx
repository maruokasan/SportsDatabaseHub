import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, Users, LineChart as LineChartIcon, Bell, BellRing, Bookmark, BookmarkCheck, UserRound } from 'lucide-react';
import { fetchMatches } from '../api/matches';
import { fetchGoalsPer90, fetchInjuryBurden, fetchStandings } from '../api/analytics';
import { FilterBar, StatTile, ChartCard, DataTable, MatchTimeline, InlineAlert, SkeletonBlock } from '../components/ui';
import PageHeading from '../components/PageHeading';
import { uiTokens } from '../theme/tokens';

const scopeOptions = [
  { value: 'live', label: 'Live window' },
  { value: '24h', label: 'Next 24h' },
  { value: 'week', label: 'Next 7d' }
];

const viewOptions = [
  { value: 'form', label: 'Recent form' },
  { value: 'season', label: 'Full season' }
];

const EMPTY_ARRAY = Object.freeze([]);

const SparkCell = ({ series = [] }) => {
  if (!series.length) return <span className="text-text-muted">—</span>;
  const width = 80;
  const height = 32;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const points = series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="text-accent">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const TrendTooltip = ({ active, payload, label, teamBadges = {} }) => {
  if (!active || !payload?.length) return null;
  const matchLabel = label ?? payload[0]?.payload?.label ?? 'Matchweek';
  return (
    <div className="rounded-panel border border-shell-border bg-shell-surface px-4 py-2 text-sm text-text-primary shadow-panel">
      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{matchLabel}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-medium" style={{ color: entry.color }}>
            {teamBadges[entry.dataKey] ? (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-shell-raised text-xs font-bold uppercase text-text-primary">
                {teamBadges[entry.dataKey]}
              </span>
            ) : null}
            {entry.name}
          </span>
          <span className="font-semibold text-text-primary">{Number(entry.value ?? 0).toFixed(2)} pts</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const outletContext = useOutletContext();
  const navigate = useNavigate();
  const { season, tournament } = outletContext ?? {};

  const [matchScope, setMatchScope] = useState(scopeOptions[0].value);
  const [focusTeam, setFocusTeam] = useState('all');
  const [viewMode, setViewMode] = useState(viewOptions[0].value);
  const [tableSearch, setTableSearch] = useState('');
  const [isFollowingMatch, setIsFollowingMatch] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(false);

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

  const liveUpcoming = matchesQuery.data?.data ?? EMPTY_ARRAY;
  const standings = standingsQuery.data ?? EMPTY_ARRAY;
  const goals = goalsQuery.data ?? EMPTY_ARRAY;
  const injuries = injuryQuery.data ?? EMPTY_ARRAY;
  const topGoals = goals.slice(0, 5);
  const topScorer = topGoals[0];
  const topScorerGoals = topScorer?.goals ?? 0;
  const topScorerPer90 = topScorer?.goalsPer90 != null ? topScorer.goalsPer90.toFixed(2) : '0.00';
  const topScorerInitials = topScorer?.name
    ? topScorer.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : null;
  const topScorerNarrative = topScorer
    ? `${topScorer.name?.split(' ')[0] ?? 'This player'} is pacing the window with ${topScorerGoals} goals and ${topScorerPer90} per 90 minutes.`
    : 'Once new stats drop we will spotlight the standout performer with form notes.';

  const filteredMatches = useMemo(() => {
    const validMatches = liveUpcoming.filter((match) => {
      const matchTime = new Date(match.matchDate).getTime();
      return !Number.isNaN(matchTime);
    });
    if (matchScope === 'live') return validMatches.slice(0, 3);
    if (matchScope === '24h') {
      const cutoff = Date.now() + 24 * 60 * 60 * 1000;
      return validMatches.filter((match) => new Date(match.matchDate).getTime() <= cutoff);
    }
    if (matchScope === 'week') {
      const cutoff = Date.now() + 7 * 24 * 60 * 60 * 1000;
      return validMatches.filter((match) => new Date(match.matchDate).getTime() <= cutoff);
    }
    return validMatches;
  }, [liveUpcoming, matchScope]);

  const tableRows = useMemo(
    () =>
      standings.map((row, index) => {
        const played = row.played ?? 1;
        const points = row.points ?? 0;
        const goalDiff = (row.goalsFor ?? 0) - (row.goalsAgainst ?? 0);
        const base = points / Math.max(played, 1);
        const swing = goalDiff / Math.max(played, 1);
        return {
          ...row,
          rank: index + 1,
          goalDiff,
          trendSeries: Array.from({ length: 5 }, (_, idx) => Number((base + swing * idx).toFixed(2)))
        };
      }),
    [standings]
  );

  const teamOptions = useMemo(
    () => [{ value: 'all', label: 'All teams' }, ...standings.map((row) => ({ value: row.teamId, label: row.teamName }))],
    [standings]
  );

  const focusLabel = teamOptions.find((option) => option.value === focusTeam)?.label ?? 'All teams';
  const scopeLabel = scopeOptions.find((option) => option.value === matchScope)?.label;
  const viewLabel = viewOptions.find((option) => option.value === viewMode)?.label;

  const activeChips = [
    matchScope !== 'live' && { id: 'scope', label: scopeLabel, onRemove: () => setMatchScope('live') },
    focusTeam !== 'all' && { id: 'team', label: `Team: ${focusLabel}`, onRemove: () => setFocusTeam('all') },
    viewMode !== 'form' && { id: 'view', label: viewLabel, onRemove: () => setViewMode('form') }
  ].filter(Boolean);

  const clearFilters = () => {
    setMatchScope('live');
    setFocusTeam('all');
    setViewMode('form');
  };

  const highlightMatch = filteredMatches[0];
  const highlightLabel = highlightMatch
    ? `${highlightMatch.homeTeam?.name ?? 'Home'} vs ${highlightMatch.awayTeam?.name ?? 'Away'}`
    : 'Awaiting fixtures';
  const highlightKickoff = highlightMatch ? new Date(highlightMatch.matchDate) : null;
  const highlightMeta = highlightKickoff
    ? `${highlightKickoff.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${highlightKickoff.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${
        highlightMatch.stadium ? ` · ${highlightMatch.stadium}` : ''
      }`
    : 'Fixtures sync as soon as the schedule updates.';
  const followButtonLabel = isFollowingMatch ? 'Following match' : 'Follow match';
  const notifyButtonLabel = notificationsOn ? 'Notifications on' : 'Notify me';

  const timelineEvents = useMemo(() => {
    if (!highlightMatch) {
      return [
        { minute: 5, type: 'goal', description: 'Pressure building from kickoff', team: 'home' },
        { minute: 27, type: 'card', description: 'Ref keeps control early', team: 'away' },
        { minute: 58, type: 'sub', description: 'Shape shift down the flank', team: 'home' },
        { minute: 79, type: 'goal', description: 'Late winner pending', team: 'away' }
      ];
    }
    const home = highlightMatch.homeTeam?.name ?? 'Home XI';
    const away = highlightMatch.awayTeam?.name ?? 'Away XI';
    return [
      { minute: 6, type: 'goal', description: `${home} set the tone with early runs`, team: 'home', player: home },
      { minute: 28, type: 'card', description: `${away} cautioned for tactical foul`, team: 'away', player: away },
      { minute: 54, type: 'sub', description: `${home} refresh wide lanes`, team: 'home', player: 'Manager' },
      { minute: 70, type: 'goal', description: `${away} find parity on counter`, team: 'away', player: away },
      { minute: 88, type: 'goal', description: `${home} push for decisive moment`, team: 'home', player: home }
    ];
  }, [highlightMatch]);

  const topTeams = tableRows.slice(0, 2);
  const getTeamBadge = (name, fallback) => {
    if (!name) return fallback;
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };
  const teamBadges = {
    home: getTeamBadge(topTeams[0]?.teamName, 'H'),
    away: getTeamBadge(topTeams[1]?.teamName, 'A')
  };
  const chartSeriesHome = topTeams[0]?.trendSeries ?? [1, 1.2, 1.25, 1.4, 1.5];
  const chartSeriesAway = topTeams[1]?.trendSeries ?? chartSeriesHome.map((value) => Number((value * 0.9).toFixed(2)));
  const lastAwaySample =
    chartSeriesAway.length > 0
      ? chartSeriesAway[chartSeriesAway.length - 1]
      : chartSeriesHome[chartSeriesHome.length - 1] ?? chartSeriesHome[0] ?? 0;
  const chartData = chartSeriesHome.map((value, index) => {
    const awayValue = chartSeriesAway[index] ?? lastAwaySample ?? value;
    return {
      label: `MW ${index + 1}`,
      home: Number(value.toFixed(2)),
      away: Number(awayValue.toFixed(2)),
      badges: teamBadges
    };
  });

  const focusFilteredRows = focusTeam === 'all' ? tableRows : tableRows.filter((row) => String(row.teamId) === String(focusTeam));

  const standingsColumns = [
    {
      key: 'rank',
      label: 'Pos',
      pinned: true,
      render: (value) => <span className="font-mono text-sm text-text-muted">#{String(value).padStart(2, '0')}</span>
    },
    { key: 'teamName', label: 'Team' },
    { key: 'played', label: 'P' },
    { key: 'wins', label: 'W' },
    { key: 'draws', label: 'D' },
    { key: 'losses', label: 'L' },
    {
      key: 'goalDiff',
      label: 'GD',
      align: 'right',
      render: (value) => <span className={value >= 0 ? 'text-success' : 'text-danger'}>{value}</span>
    },
    {
      key: 'points',
      label: 'Pts',
      align: 'right',
      render: (value) => <span className="font-semibold text-text-primary">{value}</span>
    },
    {
      key: 'trendSeries',
      label: 'Spark',
      render: (_value, row) => <SparkCell series={row.trendSeries} />
    }
  ];

  const filteredRows = focusFilteredRows.filter((row) => row.teamName?.toLowerCase().includes(tableSearch.toLowerCase()));

  const filters = [
    { id: 'scope', label: 'Match scope', value: matchScope, onChange: setMatchScope, options: scopeOptions, icon: Activity },
    { id: 'team', label: 'Team focus', value: focusTeam, onChange: setFocusTeam, options: teamOptions, icon: Users },
    { id: 'view', label: 'Data view', value: viewMode, onChange: setViewMode, options: viewOptions, icon: LineChartIcon }
  ];

  const injuryTotal = injuries.reduce((sum, item) => sum + (item.activeInjuries ?? 0), 0);
  const injuryLeader = injuries.reduce(
    (max, entry) => (entry.activeInjuries > (max?.activeInjuries ?? 0) ? entry : max),
    null
  );

  const statSparklineMatches = filteredMatches.slice(0, 5).map((match) => {
    const kickoff = new Date(match.matchDate).getTime();
    if (Number.isNaN(kickoff)) return 0;
    const hoursAway = Math.max(0, (kickoff - Date.now()) / 36e5);
    return Number(hoursAway.toFixed(2));
  });
  const statSparklineStandings = tableRows.slice(0, 5).map((row) => row.points ?? 0);
  const statSparklineGoals = topGoals.map((row) => Number(row.goalsPer90 ?? 0));

  const outsideWindow = Math.max(liveUpcoming.length - filteredMatches.length, 0);
  const teamDelta = standings.length ? standings.length - 20 : 0;

  if (error) {
    return (
      <div className="py-8">
        <InlineAlert status="error" title="Dashboard unavailable" message="We failed to fetch the latest insights. Retry in a few seconds." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonBlock height={220} />
        <SkeletonBlock height={120} />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBlock key={index} height={180} />
          ))}
        </div>
        <SkeletonBlock height={320} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-shell border border-shell-border bg-gradient-to-br from-shell-surface via-shell-base to-shell-surface p-6 shadow-panel">
        <div
          className="absolute inset-0 opacity-20 mix-blend-screen"
          style={{ backgroundImage: `radial-gradient(circle at top, ${uiTokens.colors.accent}66, transparent 55%)` }}
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Live control center</p>
            <div className="space-y-2">
              <h1 className="font-display text-3xl sm:text-4xl">Football Intelligence Deck</h1>
              <p className="text-base text-text-primary">
                Tracking {season ?? 'current season'} · {tournament ?? 'All tournaments'} · {highlightLabel}
              </p>
              <p className="text-sm text-text-muted">{highlightMeta}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-widest text-text-muted">
              {filteredMatches.map((match) => (
                <span key={match.id} className="rounded-full border border-shell-border px-3 py-1 text-[11px]">
                  {match.homeTeam?.name ?? 'Home'} vs {match.awayTeam?.name ?? 'Away'} ·{' '}
                  {new Date(match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              ))}
              {!filteredMatches.length ? <span>No fixtures in this window.</span> : null}
            </div>
          </div>
          <div className="w-full max-w-sm rounded-panel border border-shell-border/70 bg-shell-base/60 p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-text-muted">Live controls</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsFollowingMatch((prev) => !prev)}
                aria-pressed={isFollowingMatch}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                  isFollowingMatch
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-shell-border text-text-primary hover:border-accent hover:text-white'
                }`}
              >
                {isFollowingMatch ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {followButtonLabel}
              </button>
              <button
                type="button"
                onClick={() => setNotificationsOn((prev) => !prev)}
                aria-pressed={notificationsOn}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/50 ${
                  notificationsOn
                    ? 'border-info bg-info/10 text-info'
                    : 'border-shell-border text-text-primary hover:border-info hover:text-white'
                }`}
              >
                {notificationsOn ? <BellRing size={16} /> : <Bell size={16} />}
                {notifyButtonLabel}
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigate('/analytics')}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-panel transition hover:translate-y-0.5"
            >
              <LineChartIcon size={16} />
              Open Analytics
            </button>
          </div>
        </div>
      </section>

      <FilterBar filters={filters} activeFilters={activeChips} onClear={clearFilters} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatTile
          title="Upcoming fixtures"
          value={filteredMatches.length}
          subtitle={scopeLabel}
          delta={`${outsideWindow} outside window`}
          sparkline={statSparklineMatches.length ? statSparklineMatches : [4, 8, 6, 5, 3]}
          timestamp="live"
        />
        <StatTile
          title="Teams tracked"
          value={standings.length}
          subtitle="Completed clubs"
          delta={`${teamDelta >= 0 ? '+' : ''}${teamDelta} vs last season`}
          deltaDirection={teamDelta >= 0 ? 'up' : 'down'}
          sparkline={statSparklineStandings.length ? statSparklineStandings : [40, 42, 43, 44, 45]}
          timestamp="table sync"
        />
        <StatTile
          title="Best goals / 90"
          value={topScorer ? topScorer.goalsPer90.toFixed(2) : '0.00'}
          subtitle={topScorer?.name ?? 'Awaiting stats'}
          delta={topScorer ? `+${(topScorer.goals ?? 0).toFixed(0)} goals` : '—'}
          sparkline={statSparklineGoals.length ? statSparklineGoals : [0.5, 0.6, 0.8, 0.9, 1.1]}
          definition="Goals scored per 90 minutes played."
        />
      </div>

      {injuryTotal ? (
        <InlineAlert
          status="warning"
          title={`Squad watch: ${injuryTotal} active injuries`}
          message={
            injuryLeader
              ? `${injuryLeader.teamName} lead the list with ${injuryLeader.activeInjuries} players in rehab.`
              : 'Monitor workloads before confirming lineups.'
          }
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ChartCard
            title="Points accumulation pace"
            subtitle="Trend"
            meta="Line compares the top two teams · solid = home · dashed = away"
            legend={[
              { label: topTeams[0]?.teamName ?? 'Home form', color: 'var(--team-home)', type: 'solid', badge: teamBadges.home },
              { label: topTeams[1]?.teamName ?? 'Away form', color: 'var(--team-away)', type: 'dashed', badge: teamBadges.away }
            ]}
          >
            <ResponsiveContainer width="100%" height={280}>
              <ReLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="label"
                  stroke="var(--color-text-muted)"
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-text-muted)', strokeWidth: 1 }}
                  tick={{ fill: 'var(--color-text-primary)', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--color-text-primary)', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip content={<TrendTooltip teamBadges={teamBadges} />} cursor={{ stroke: 'var(--team-home)', strokeWidth: 1 }} />
                <Line
                  type="monotone"
                  dataKey="home"
                  name={topTeams[0]?.teamName ?? 'Home'}
                  stroke="var(--team-home)"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={{ r: 4, strokeWidth: 2, stroke: 'var(--team-home)', fill: 'var(--team-home)' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="away"
                  name={topTeams[1]?.teamName ?? 'Away'}
                  stroke="var(--team-away)"
                  strokeDasharray="6 4"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={{ r: 4, strokeWidth: 2, stroke: 'var(--team-away)', fill: 'var(--team-away)' }}
                  activeDot={{ r: 6 }}
                />
              </ReLineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="space-y-6 lg:col-span-5">
          <MatchTimeline events={timelineEvents} />
          <div className="rounded-panel border border-shell-border bg-shell-surface p-5 shadow-panel">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-accent/40 via-info/30 to-shell-base/60 p-4 text-center">
                {topScorer ? (
                  <span className="text-2xl font-semibold text-white">{topScorerInitials}</span>
                ) : (
                  <UserRound size={32} className="mx-auto text-text-muted" aria-hidden="true" />
                )}
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-widest text-white/80">
                  Form
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Player of the window</p>
                <h3 className="font-display text-xl text-text-primary">{topScorer?.name ?? 'TBD'}</h3>
                <p className="text-sm text-text-muted">{topScorerNarrative}</p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-sm text-text-muted">
              <div>
                <dt className="text-[11px] uppercase tracking-widest">Goals</dt>
                <dd className="text-lg font-semibold text-text-primary">{topScorer ? topScorerGoals : '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-widest">Goals / 90</dt>
                <dd className="text-lg font-semibold text-text-primary">{topScorerPer90}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-widest">Trend</dt>
                <dd className="text-lg font-semibold text-success">{topGoals.length ? '↑ steady' : '—'}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-shell-border px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              View player insights
            </button>
          </div>
        </div>
      </div>

      <DataTable
        title="League standings"
        columns={standingsColumns}
        rows={filteredRows}
        isLoading={standingsQuery.isLoading}
        emptyState="No teams match your search."
        onSearch={setTableSearch}
        searchPlaceholder="Search team…"
      />
    </div>
  );
}
