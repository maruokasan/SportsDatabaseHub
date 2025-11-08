import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createTeam, deleteTeam, fetchTeams, updateTeam } from '../api/teams';
import { useAuth } from '../context/AuthContext';

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

  return (
    <div className="space-y-4">
      {isAuthenticated ? (
        <div className="card p-4">
          <h3 className="font-display text-lg mb-3">{editingId ? 'Edit Team' : 'Add Team'}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                placeholder="Team name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
              />
              <input
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                placeholder="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
              />
              <input
                placeholder="Logo URL"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
            {saveMutation.error && <div className="text-sm text-red-600">Failed to save team.</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-600 text-white disabled:opacity-70"
                disabled={saveMutation.isLoading}
              >
                {saveMutation.isLoading ? 'Saving…' : editingId ? 'Update Team' : 'Create Team'}
              </button>
              {editingId && (
                <button type="button" className="px-4 py-2 rounded-xl border" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="card p-4 text-sm text-gray-600">
          Sign in as an admin to add or edit team records. Existing teams remain visible below.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Search</label>
        <input
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
          placeholder="Club name, city, or country"
        />
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Teams</h2>
          <div className="text-sm text-gray-500">Page {meta.page} / {meta.totalPages}</div>
        </div>
        {isLoading && <div>Loading teams…</div>}
        {error && <div className="text-red-600 text-sm">Failed to load teams.</div>}
        {!isLoading && !teams.length && <div className="text-sm text-gray-500">No teams found.</div>}
        {teams.length > 0 && (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Name</th>
                  <th>City</th>
                  <th>Country</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id} className="border-b last:border-none">
                    <td className="py-2 font-medium">{team.name}</td>
                    <td>{team.city || '—'}</td>
                    <td>{team.country || '—'}</td>
                    <td className="text-right space-x-2">
                      {isAuthenticated ? (
                        <>
                          <button type="button" className="text-xs text-brand-700" onClick={() => startEdit(team)}>
                            Edit
                          </button>
                          <button type="button" className="text-xs text-red-600" onClick={() => handleDelete(team.id)}>
                            Delete
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Admin only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {deleteError && <div className="text-sm text-red-600 mt-3">{deleteError}</div>}
        <div className="flex justify-between items-center mt-4 text-sm">
          <button
            type="button"
            className="px-3 py-1 rounded-xl border disabled:opacity-50"
            disabled={meta.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="px-3 py-1 rounded-xl border disabled:opacity-50"
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
