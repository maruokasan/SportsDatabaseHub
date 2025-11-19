import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy, Clock, Play, CheckCircle } from 'lucide-react';
import { createMatch, fetchMatches } from '../api/matches';
import { fetchTeams } from '../api/teams';
import { fetchTournaments } from '../api/tournaments';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/ui';
import { FilterBar } from '../components/ui';

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    upcoming: { icon: Clock, color: 'text-info', bg: 'bg-info/10', label: 'Upcoming' },
    live: { icon: Play, color: 'text-warning', bg: 'bg-warning/10', label: 'Live' },
    completed: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Completed' }
  };

  const config = statusConfig[status] || statusConfig.upcoming;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.color} ${config.bg}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

const emptyMatchForm = {
  tournamentId: '',
  homeTeamId: '',
  awayTeamId: '',
  matchDate: '',
  stadium: '',
  referee: ''
};

export default function Matches() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [tournamentId, setTournamentId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [matchForm, setMatchForm] = useState(emptyMatchForm);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const matchesQuery = useQuery({
    queryKey: ['matches', { page, status, tournamentId, teamId }],
    queryFn: () => fetchMatches({
      page,
      limit: 10,
      status: status || undefined,
      tournamentId: tournamentId || undefined,
      teamId: teamId || undefined
    })
  });

  const teamsQuery = useQuery({ queryKey: ['teams', 'all'], queryFn: () => fetchTeams({ limit: 100 }) });
  const tournamentsQuery = useQuery({ queryKey: ['tournaments', 'all'], queryFn: () => fetchTournaments({ limit: 100 }) });

  const createMatchMutation = useMutation({
    mutationFn: createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      setMatchForm(emptyMatchForm);
    }
  });


  const matches = matchesQuery.data?.data ?? [];
  const meta = matchesQuery.data?.meta ?? { page: 1, totalPages: 1 };

  const handleCreateMatch = (e) => {
    e.preventDefault();
    if (matchForm.homeTeamId === matchForm.awayTeamId) return;
    createMatchMutation.mutate({
      ...matchForm,
      matchDate: matchForm.matchDate ? new Date(matchForm.matchDate).toISOString() : new Date().toISOString(),
      status: 'upcoming'
    });
  };


  // Prepare filter data for FilterBar
  const filters = [
    {
      id: 'status',
      label: 'Status',
      icon: Trophy,
      value: status,
      onChange: (value) => { setPage(1); setStatus(value); },
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'live', label: 'Live' },
        { value: 'completed', label: 'Completed' }
      ]
    },
    {
      id: 'tournament',
      label: 'Tournament',
      icon: Trophy,
      value: tournamentId,
      onChange: (value) => { setPage(1); setTournamentId(value); },
      options: [
        { value: '', label: 'All Tournaments' },
        ...(tournamentsQuery.data?.data?.map((t) => ({ value: t.id, label: t.name })) || [])
      ]
    },
    {
      id: 'team',
      label: 'Team',
      icon: Users,
      value: teamId,
      onChange: (value) => { setPage(1); setTeamId(value); },
      options: [
        { value: '', label: 'All Teams' },
        ...(teamsQuery.data?.data?.map((team) => ({ value: team.id, label: team.name })) || [])
      ]
    }
  ];

  const activeFilters = [
    ...(status ? [{ id: 'status', label: `Status: ${status}`, onRemove: () => { setPage(1); setStatus(''); } }] : []),
    ...(tournamentId ? [{ id: 'tournament', label: `Tournament: ${tournamentsQuery.data?.data?.find(t => t.id === tournamentId)?.name}`, onRemove: () => { setPage(1); setTournamentId(''); } }] : []),
    ...(teamId ? [{ id: 'team', label: `Team: ${teamsQuery.data?.data?.find(t => t.id === teamId)?.name}`, onRemove: () => { setPage(1); setTeamId(''); } }] : [])
  ];

  // Prepare table data for DataTable
  const tableColumns = [
    {
      key: 'fixture',
      label: 'Fixture',
      render: (value, match) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium text-text-primary">{match.homeTeam?.name ?? 'TBD'}</span>
              <span className="text-xs text-text-muted">vs</span>
              <span className="text-sm font-medium text-text-primary">{match.awayTeam?.name ?? 'TBD'}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'tournament',
      label: 'Tournament',
      render: (value, match) => (
        <span className="text-sm text-text-primary">{match.tournament?.name ?? '—'}</span>
      )
    },
    {
      key: 'datetime',
      label: 'Date & Time',
      render: (value, match) => (
        <div className="flex items-center gap-2 text-sm text-text-primary">
          <Calendar size={14} className="text-text-muted" />
          {new Date(match.matchDate).toLocaleDateString()}
          <Clock size={14} className="text-text-muted ml-2" />
          {new Date(match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )
    },
    {
      key: 'venue',
      label: 'Venue',
      render: (value, match) => (
        <div className="flex items-center gap-2 text-sm text-text-primary">
          <MapPin size={14} className="text-text-muted" />
          {match.stadium || '—'}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, match) => <StatusBadge status={match.status} />
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (value, match) => (
        <div className="flex justify-end">
          {match.status !== 'completed' && (
            isAuthenticated ? (
              <Link
                to={`/matches/complete/${match.id}`}
                className="inline-flex items-center gap-1 rounded-full border border-accent px-3 py-1.5 text-xs font-medium text-accent transition hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                Complete Match
              </Link>
            ) : (
              <span className="text-xs text-text-muted">Admin only</span>
            )
          )}
        </div>
      )
    }
  ];

  const tableRows = matches.map((match) => ({
    id: match.id,
    ...match
  }));

  return (
    <div className="space-y-6">
      {/* Schedule Match Form */}
      {isAuthenticated ? (
        <section className="rounded-panel border border-shell-border bg-shell-surface p-6 shadow-panel">
          <header className="mb-4">
            <h3 className="font-display text-lg text-text-primary">Schedule New Match</h3>
            <p className="text-sm text-text-muted">Create a new match fixture</p>
          </header>
          <form onSubmit={handleCreateMatch} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-text-muted">
                Tournament
              </label>
              <select
                required
                value={matchForm.tournamentId}
                onChange={(e) => setMatchForm({ ...matchForm, tournamentId: e.target.value })}
                className="w-full rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <option value="">Select Tournament</option>
                {tournamentsQuery.data?.data?.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-text-muted">
                Match Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={matchForm.matchDate}
                onChange={(e) => setMatchForm({ ...matchForm, matchDate: e.target.value })}
                className="w-full rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-text-muted">
                Home Team
              </label>
              <select
                required
                value={matchForm.homeTeamId}
                onChange={(e) => setMatchForm({ ...matchForm, homeTeamId: e.target.value })}
                className="w-full rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <option value="">Select Home Team</option>
                {teamsQuery.data?.data?.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-text-muted">
                Away Team
              </label>
              <select
                required
                value={matchForm.awayTeamId}
                onChange={(e) => setMatchForm({ ...matchForm, awayTeamId: e.target.value })}
                className="w-full rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <option value="">Select Away Team</option>
                {teamsQuery.data?.data?.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-text-muted">
                Stadium
              </label>
              <input
                placeholder="Enter stadium name"
                value={matchForm.stadium}
                onChange={(e) => setMatchForm({ ...matchForm, stadium: e.target.value })}
                className="w-full rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-text-muted">
                Referee
              </label>
              <input
                placeholder="Enter referee name"
                value={matchForm.referee}
                onChange={(e) => setMatchForm({ ...matchForm, referee: e.target.value })}
                className="w-full rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              />
            </div>

            {createMatchMutation.error && (
              <div className="md:col-span-2 lg:col-span-3 rounded-chip border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
                Failed to create match. Please try again.
              </div>
            )}

            <div className="md:col-span-2 lg:col-span-3 flex items-center gap-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-chip bg-accent px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={createMatchMutation.isLoading || matchForm.homeTeamId === matchForm.awayTeamId}
              >
                {createMatchMutation.isLoading ? 'Scheduling…' : 'Schedule Match'}
              </button>
              {matchForm.homeTeamId === matchForm.awayTeamId && matchForm.homeTeamId && (
                <div className="text-sm text-danger flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-danger"></span>
                  Home and away teams must be different
                </div>
              )}
            </div>
          </form>
        </section>
      ) : (
        <section className="rounded-panel border border-shell-border bg-shell-surface p-6 shadow-panel">
          <div className="flex items-center gap-3 text-text-muted">
            <Users size={20} />
            <p className="text-sm">
              Sign in as an admin to schedule or complete matches. Upcoming fixtures remain visible below.
            </p>
          </div>
        </section>
      )}

      {/* Filters */}
      <FilterBar
        filters={filters}
        activeFilters={activeFilters}
        onClear={() => {
          setPage(1);
          setStatus('');
          setTournamentId('');
          setTeamId('');
        }}
      />

      {/* Matches Table */}
      <DataTable
        title="Matches"
        columns={tableColumns}
        rows={tableRows}
        isLoading={matchesQuery.isLoading}
        emptyState="No matches found matching your filters."
      />

      {/* Pagination */}
      {matches.length > 0 && (
        <div className="flex items-center justify-between rounded-panel border border-shell-border bg-shell-surface px-6 py-4 shadow-panel">
          <div className="text-sm text-text-muted">
            Showing page {meta.page} of {meta.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-chip border border-shell-border bg-shell-raised px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-chip border border-shell-border bg-shell-raised px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
