import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { createTeam, deleteTeam, fetchTeams, updateTeam } from '../api/teams';
import { useAuth } from '../context/AuthContext';
import { DataTable, FilterBar } from '../components/ui';
import PageHeading from '../components/PageHeading';

const emptyTeam = { name: '', city: '', country: '', logoUrl: '' };

export default function Teams() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(emptyTeam);
  const [editingId, setEditingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['teams', { page, search }],
    queryFn: () => fetchTeams({
      page,
      limit: 10,
      search: search || undefined
    })
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => editingId ? updateTeam(editingId, payload) : createTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setFormData(emptyTeam);
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      setDeleteError('');
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Failed to delete team.';
      setDeleteError(message);
    }
  });

  const teams = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, totalPages: 1 };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const startEdit = (team) => {
    setEditingId(team.id);
    setFormData({
      name: team.name,
      city: team.city || '',
      country: team.country || '',
      logoUrl: team.logoUrl || ''
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyTeam);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this team? Only available if there are no players or matches linked.')) return;
    deleteMutation.mutate(id);
  };

  // Prepare filter data for FilterBar
  const filters = useMemo(() => [
    {
      id: 'search',
      label: 'Search',
      icon: null,
      value: search,
      onChange: (value) => { setPage(1); setSearch(value); },
      options: []
    }
  ], [search]);

  const activeFilters = useMemo(() => [
    ...(search ? [{ id: 'search', label: `Search: ${search}`, onRemove: () => { setPage(1); setSearch(''); } }] : [])
  ], [search]);

  const handleClearAllFilters = () => {
    setPage(1);
    setSearch('');
  };

  // Prepare table columns for DataTable
  const tableColumns = useMemo(() => [
    {
      key: 'name',
      label: 'Name',
      render: (value, team) => (
        <div className="font-medium text-text-primary">
          {team.name}
        </div>
      )
    },
    {
      key: 'city',
      label: 'City',
      render: (value, team) => (
        <span className="text-text-muted">{team.city || '—'}</span>
      )
    },
    {
      key: 'country',
      label: 'Country',
      render: (value, team) => (
        <span className="text-text-muted">{team.country || '—'}</span>
      )
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (value, team) => (
        <div className="flex justify-end space-x-2">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => startEdit(team)}
                className="inline-flex items-center gap-1 rounded-chip border border-shell-border bg-shell-raised px-2 py-1 text-xs text-text-muted transition hover:border-accent hover:text-accent"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(team.id)}
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

  const tableRows = useMemo(() => teams.map((team) => ({
    id: team.id,
    ...team
  })), [teams]);

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Organization"
        title="Team Management"
        description="Add, edit, and manage team profiles across the league."
      />

      {/* Team Management Form */}
      {isAuthenticated ? (
        <section className="rounded-panel border border-shell-border bg-shell-surface p-6 shadow-panel">
          <header className="mb-4">
            <h3 className="font-display text-lg text-text-primary">
              {editingId ? 'Edit Team' : 'Add Team'}
            </h3>
            <p className="text-sm text-text-muted">
              {editingId ? 'Update team information' : 'Create a new team profile'}
            </p>
          </header>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Team Name
                </label>
                <input
                  placeholder="Team name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  City
                </label>
                <input
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Country
                </label>
                <input
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Logo URL
                </label>
                <input
                  placeholder="Logo URL"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="rounded-chip border border-shell-border bg-shell-raised px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                />
              </div>
            </div>
            {saveMutation.error && (
              <div className="rounded-chip border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
                Failed to save team. Please try again.
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-chip bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90"
                disabled={saveMutation.isLoading}
              >
                {saveMutation.isLoading ? 'Saving…' : editingId ? 'Update Team' : 'Create Team'}
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
      ) : (
        <section className="rounded-panel border border-shell-border bg-shell-surface p-6 shadow-panel">
          <div className="flex items-center gap-3 text-text-muted">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-shell-base/70">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p className="text-sm">
              Sign in as an admin to add/edit team records. Team list below remains public.
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

      {/* Teams Table */}
      <DataTable
        title="Teams"
        columns={tableColumns}
        rows={tableRows}
        isLoading={isLoading}
        emptyState="No teams found matching your search criteria."
      />
        <div className="flex items-center justify-between rounded-panel border border-shell-border bg-shell-surface px-6 py-4 shadow-panel">
          <div className="text-sm text-text-muted">
            Showing page {meta.page} of {meta.totalPages} • {meta.totalPages === 1 ? teams.length : 'Multiple'} team{meta.totalPages === 1 && teams.length === 1 ? '' : 's'}
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
      </div>
    );
}
