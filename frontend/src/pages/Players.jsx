import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createPlayer, deletePlayer, fetchPlayers, importPlayersCsv, updatePlayer } from '../api/players';
import { fetchTeams } from '../api/teams';
import { useAuth } from '../context/AuthContext';

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

  return (
    <div className="space-y-4">
      {isAuthenticated ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-4 space-y-3">
            <h3 className="font-display text-lg">{editingId ? 'Edit Player' : 'Add Player'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
                />
                <input
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  placeholder="Position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
                />
                <input
                  placeholder="Nationality"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
                />
                <input
                  type="number"
                  placeholder="Jersey #"
                  value={formData.jerseyNumber}
                  onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
                  required
                  className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
                />
                <select
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
                >
                  <option value="">Free Agent</option>
                  {teamsQuery.data?.data?.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              {saveMutation.error && <div className="text-sm text-red-600">Failed to save player.</div>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white disabled:opacity-70"
                  disabled={saveMutation.isLoading}
                >
                  {saveMutation.isLoading ? 'Saving…' : editingId ? 'Update Player' : 'Create Player'}
                </button>
                {editingId && (
                  <button type="button" className="px-4 py-2 rounded-xl border" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card p-4 space-y-3">
            <h3 className="font-display text-lg">Import Players (CSV)</h3>
            <p className="text-sm text-gray-600">Headers: first_name,last_name,position,nationality,birthdate,jersey_number,team_id</p>
            <input type="file" accept=".csv" onChange={handleCsvChange} />
            {importMutation.isLoading && <div className="text-sm text-gray-600">Importing…</div>}
            {importMutation.error && <div className="text-sm text-red-600">Import failed.</div>}
            {csvSummary && (
              <div className="text-sm text-gray-700">
                Imported rows: {csvSummary.count}. Success: {csvSummary.results?.filter((r) => r.status === 'inserted').length ?? 0}, Errors: {csvSummary.results?.filter((r) => r.status === 'error').length ?? 0}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-4 text-sm text-gray-600">
          Sign in as an admin to add/edit players or import CSV data. Player list below remains public.
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
            placeholder="Name or nationality"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Team</label>
          <select
            value={teamFilter}
            onChange={(e) => { setPage(1); setTeamFilter(e.target.value); }}
            className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value="">All</option>
            {teamsQuery.data?.data?.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Players</h2>
          <div className="text-sm text-gray-500">Page {meta.page} / {meta.totalPages}</div>
        </div>
        {isLoading && <div>Loading players…</div>}
        {error && <div className="text-red-600 text-sm">Failed to load players.</div>}
        {!isLoading && !players.length && <div className="text-sm text-gray-500">No players found.</div>}
        {players.length > 0 && (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Name</th>
                  <th>Position</th>
                  <th>Team</th>
                  <th>Nationality</th>
                  <th>Jersey</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id} className="border-b last:border-none">
                    <td className="py-2 font-medium">{player.firstName} {player.lastName}</td>
                    <td>{player.position || '—'}</td>
                    <td>{player.team?.name || 'Free Agent'}</td>
                    <td>{player.nationality || '—'}</td>
                    <td>{player.jerseyNumber}</td>
                    <td className="text-right space-x-2">
                      {isAuthenticated ? (
                        <>
                          <button
                            type="button"
                            className="text-xs text-brand-700"
                            onClick={() => startEdit(player)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-xs text-red-600"
                            onClick={() => deleteMutation.mutate(player.id)}
                          >
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
