import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { Plus, Upload, Search, X } from 'lucide-react';
import { createPlayer, deletePlayer, fetchPlayers, importPlayersCsv, updatePlayer } from '../api/players';
import { fetchTeams } from '../api/teams';
import { useAuth } from '../context/AuthContext';
import { DataTable, FilterBar } from '../components/ui';
import PageHeading from '../components/PageHeading';

const emptyForm = {
  firstName: '',
  lastName: '',
  position: '',
  nationality: '',
  birthdate: '',
  jerseyNumber: '',
  teamId: ''
};

export default function Players() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [csvSummary, setCsvSummary] = useState(null);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['players', { page, search, teamFilter }],
    queryFn: () => fetchPlayers({
      page,
      limit: 10,
      search: search || undefined,
      teamId: teamFilter || undefined
    })
  });

  const teamsQuery = useQuery({
    queryKey: ['teams', 'options'],
    queryFn: () => fetchTeams({ limit: 100 })
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => editingId ? updatePlayer(editingId, payload) : createPlayer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      setFormData(emptyForm);
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlayer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['players'] })
  });

  const importMutation = useMutation({
    mutationFn: importPlayersCsv,
    onSuccess: (res) => {
      setCsvSummary(res);
      queryClient.invalidateQueries({ queryKey: ['players'] });
    }
  });

  const players = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, totalPages: 1 };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      position: formData.position || null,
      nationality: formData.nationality || null,
      birthdate: formData.birthdate || null,
      jerseyNumber: Number(formData.jerseyNumber),
      teamId: formData.teamId || null
    };
    saveMutation.mutate(payload);
  };

  const startEdit = (player) => {
    setEditingId(player.id);
    setFormData({
      firstName: player.firstName,
      lastName: player.lastName,
      position: player.position || '',
      nationality: player.nationality || '',
      birthdate: player.birthdate || '',
      jerseyNumber: player.jerseyNumber?.toString() ?? '',
      teamId: player.teamId || ''
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleCsvChange = (e) => {
    const file = e.target.files?.[0];
    if (file) importMutation.mutate(file);
    e.target.value = '';
  };

  // Prepare filter data for FilterBar
  const filters = useMemo(() => [
    {
      id: 'team',
      label: 'Team',
      icon: null,
      value: teamFilter,
      onChange: (value) => { setPage(1); setTeamFilter(value); },
      options: [
        { value: '', label: 'All Teams' },
        ...(teamsQuery.data?.data?.map((team) => ({ value: team.id, label: team.name })) || [])
      ]
    }
  ], [teamFilter, teamsQuery.data]);

  const activeFilters = useMemo(() => [
    ...(search ? [{ id: 'search', label: `Search: ${search}`, onRemove: () => { setPage(1); setSearch(''); } }] : []),
    ...(teamFilter ? [{ id: 'team', label: `Team: ${teamsQuery.data?.data?.find(t => t.id === teamFilter)?.name}`, onRemove: () => { setPage(1); setTeamFilter(''); } }] : [])
  ], [search, teamFilter, teamsQuery.data]);

  const handleClearAllFilters = () => {
    setPage(1);
    setSearch('');
    setTeamFilter('');
  };

  // Prepare table columns for DataTable
  const tableColumns = useMemo(() => [
    {
      key: 'name',
      label: 'Name',
      render: (value, player) => (
        <div className="font-medium text-text-primary">
          {player.firstName} {player.lastName}
        </div>
      )
    },
    {
      key: 'position',
      label: 'Position',
      render: (value, player) => (
        <span className="text-text-muted">{player.position || '—'}</span>
      )
    },
    {
      key: 'team',
      label: 'Team',
      render: (value, player) => (
        <span className="text-text-primary">{player.team?.name || 'Free Agent'}</span>
      )
    },
    {
      key: 'nationality',
      label: 'Nationality',
      render: (value, player) => (
        <span className="text-text-muted">{player.nationality || '—'}</span>
      )
    },
    {
      key: 'jerseyNumber',
      label: 'Jersey #',
      align: 'right',
      render: (value, player) => (
        <span className="font-medium text-text-primary">{player.jerseyNumber}</span>
      )
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (value, player) => (
        <div className="flex justify-end space-x-2">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => startEdit(player)}
                className="inline-flex items-center gap-1 rounded-chip border border-shell-border bg-shell-raised px-2 py-1 text-xs text-text-muted transition hover:border-accent hover:text-accent"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(player.id)}
                className="inline-flex items-center gap-1 rounded-chip border border-shell-border bg-shell-raised px-2 py-1 text-xs text-text-muted transition hover:border-danger hover:text-danger"
              >
                Delete
              </button>
            </>
          ) : (
            <span className="text-xs text-text-muted">Admin only</span>
          )}
        </div>
      )
    }
  ], [isAuthenticated, deleteMutation]);

  const tableRows = useMemo(() => players.map((player) => ({
    id: player.id,
    ...player
  })), [players]);

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Roster"
        title="Player Management"
        description="Add, edit, and manage player profiles across all teams."
      />

      {/* Player Management Forms */}
      {isAuthenticated ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-panel border border-shell-border bg-shell-surface p-6 shadow-panel">
            <header className="mb-4">
              <h3 className="font-display text-lg text-text-primary">
                {editingId ? 'Edit Player' : 'Add Player'}
              </h3>
              <p className="text-sm text-text-muted">
                {editingId ? 'Update player information' : 'Create a new player profile'}
              </p>
            </header>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    First Name
                  </label>
                  <input
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Last Name
                  </label>
                  <input
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Position
                  </label>
                  <input
                    placeholder="Position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Nationality
                  </label>
                  <input
                    placeholder="Nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                    className="rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Jersey Number
                  </label>
                  <input
                    type="number"
                    placeholder="Jersey #"
                    value={formData.jerseyNumber}
                    onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
                    required
                    className="rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Team
                  </label>
                  <select
                    value={formData.teamId}
                    onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                    className="rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                  >
                    <option value="">Free Agent</option>
                    {teamsQuery.data?.data?.map((team) => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {saveMutation.error && (
                <div className="rounded-chip border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
                  Failed to save player. Please try again.
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-chip bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90"
                  disabled={saveMutation.isLoading}
                >
                  {saveMutation.isLoading ? 'Saving…' : editingId ? 'Update Player' : 'Create Player'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 rounded-chip border border-shell-border bg-shell-raised px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="rounded-panel border border-shell-border bg-shell-surface p-6 shadow-panel">
            <header className="mb-4">
              <h3 className="font-display text-lg text-text-primary">Import Players (CSV)</h3>
              <p className="text-sm text-text-muted">Bulk import player data from CSV file</p>
            </header>
            <div className="space-y-4">
              <div className="text-xs text-text-muted">
                <strong>Required headers:</strong> first_name,last_name,position,nationality,birthdate,jersey_number,team_id
              </div>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-chip border border-shell-border bg-shell-raised px-4 py-2 text-sm text-text-primary transition hover:border-accent hover:text-accent cursor-pointer">
                  <Upload size={16} />
                  <span>Choose CSV File</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvChange}
                    className="hidden"
                  />
                </label>
              </div>
              {importMutation.isLoading && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  Importing…
                </div>
              )}
              {importMutation.error && (
                <div className="rounded-chip border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
                  Import failed. Please check your CSV format and try again.
                </div>
              )}
              {csvSummary && (
                <div className="rounded-chip border border-success/20 bg-success/5 px-3 py-2 text-sm text-success">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span>Import completed</span>
                  </div>
                  <div className="mt-1 text-xs text-text-muted">
                    Imported: {csvSummary.count} rows · Success: {csvSummary.results?.filter((r) => r.status === 'inserted').length ?? 0} · Errors: {csvSummary.results?.filter((r) => r.status === 'error').length ?? 0}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <section className="rounded-panel border border-shell-border bg-shell-surface p-6 shadow-panel">
          <div className="flex items-center gap-3 text-text-muted">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-shell-base/70">
              <Plus size={20} />
            </div>
            <p className="text-sm">
              Sign in as an admin to add/edit players or import CSV data. Player list below remains public.
            </p>
          </div>
        </section>
      )}

      {/* Filters */}
      <FilterBar
        filters={filters}
        activeFilters={activeFilters}
        onClear={handleClearAllFilters}
      />

      {/* Players Table */}
      <DataTable
        title="Players"
        columns={tableColumns}
        rows={tableRows}
        isLoading={isLoading}
        emptyState="No players found matching your search criteria."
      />

      {/* Pagination */}
      {players.length > 0 && (
        <div className="flex items-center justify-between rounded-panel border border-shell-border bg-shell-surface px-6 py-4 shadow-panel">
          <div className="text-sm text-text-muted">
            Showing page {meta.page} of {meta.totalPages} • {meta.totalPages === 1 ? players.length : 'Multiple'} player{meta.totalPages === 1 && players.length === 1 ? '' : 's'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-chip border border-shell-border bg-shell-raised px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-chip border border-shell-border bg-shell-raised px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent hover:text-accent"
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
