import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createTournament, deleteTournament, fetchTournaments, updateTournament } from '../api/tournaments';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', startDate: '', endDate: '' };

export default function Tournaments() {
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['tournaments', { page }],
    queryFn: () => fetchTournaments({ page, limit: 10 })
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => (editingId ? updateTournament(editingId, payload) : createTournament(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      setFormData(emptyForm);
      setEditingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTournament,
    onSuccess: () => {
      setDeleteError('');
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Unable to delete tournament.';
      setDeleteError(message);
    }
  });

  const tournaments = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, totalPages: 1 };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate || null
    };
    saveMutation.mutate(payload);
  };

  const startEdit = (tournament) => {
    setEditingId(tournament.id);
    setFormData({
      name: tournament.name,
      startDate: tournament.startDate ?? '',
      endDate: tournament.endDate ?? ''
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this tournament? Matches linked to it must be removed first.')) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-4">
      {isAuthenticated ? (
        <div className="card p-4">
          <h3 className="font-display text-lg mb-3">{editingId ? 'Edit Tournament' : 'Add Tournament'}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              placeholder="Tournament name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>
            </div>
            {saveMutation.error && <div className="text-sm text-red-600">Failed to save tournament.</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-600 text-white disabled:opacity-70"
                disabled={saveMutation.isLoading}
              >
                {saveMutation.isLoading ? 'Saving…' : editingId ? 'Update Tournament' : 'Create Tournament'}
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
          Sign in as an admin to manage tournaments. Existing tournaments remain visible below.
        </div>
      )}

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Tournaments</h2>
          <div className="text-sm text-gray-500">Page {meta.page} / {meta.totalPages}</div>
        </div>
        {isLoading && <div>Loading tournaments…</div>}
        {error && <div className="text-red-600 text-sm">Failed to load tournaments.</div>}
        {!isLoading && !tournaments.length && <div className="text-sm text-gray-500">No tournaments found.</div>}
        {tournaments.length > 0 && (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Name</th>
                  <th>Start</th>
                  <th>End</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map((tournament) => (
                  <tr key={tournament.id} className="border-b last:border-none">
                    <td className="py-2 font-medium">{tournament.name}</td>
                    <td>{tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : '—'}</td>
                    <td>{tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : '—'}</td>
                    <td className="text-right space-x-2">
                      {isAuthenticated ? (
                        <>
                          <button type="button" className="text-xs text-brand-700" onClick={() => startEdit(tournament)}>
                            Edit
                          </button>
                          <button type="button" className="text-xs text-red-600" onClick={() => handleDelete(tournament.id)}>
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
