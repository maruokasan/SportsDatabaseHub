import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createMatch, fetchMatches } from '../api/matches';
import { fetchTeams } from '../api/teams';
import { fetchTournaments } from '../api/tournaments';
import { useAuth } from '../context/AuthContext';

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
  const [matchForm, setMatchForm] = useState(emptyMatchForm);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const matchesQuery = useQuery({
    queryKey: ['matches', { page, status }],
    queryFn: () => fetchMatches({
      page,
      limit: 10,
      status: status || undefined
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


  return (
    <div className="space-y-4">
      {isAuthenticated ? (
        <div className="card p-4">
          <h3 className="font-display text-lg mb-3">Schedule Match</h3>
          <form onSubmit={handleCreateMatch} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              required
              value={matchForm.tournamentId}
              onChange={(e) => setMatchForm({ ...matchForm, tournamentId: e.target.value })}
              className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="">Tournament</option>
              {tournamentsQuery.data?.data?.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <input
              type="datetime-local"
              required
              value={matchForm.matchDate}
              onChange={(e) => setMatchForm({ ...matchForm, matchDate: e.target.value })}
              className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
            />
            <select
              required
              value={matchForm.homeTeamId}
              onChange={(e) => setMatchForm({ ...matchForm, homeTeamId: e.target.value })}
              className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="">Home team</option>
              {teamsQuery.data?.data?.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <select
              required
              value={matchForm.awayTeamId}
              onChange={(e) => setMatchForm({ ...matchForm, awayTeamId: e.target.value })}
              className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="">Away team</option>
              {teamsQuery.data?.data?.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
            <input
              placeholder="Stadium"
              value={matchForm.stadium}
              onChange={(e) => setMatchForm({ ...matchForm, stadium: e.target.value })}
              className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
            />
            <input
              placeholder="Referee"
              value={matchForm.referee}
              onChange={(e) => setMatchForm({ ...matchForm, referee: e.target.value })}
              className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
            />
            {createMatchMutation.error && <div className="text-sm text-red-600">Failed to create match.</div>}
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-600 text-white disabled:opacity-70"
                disabled={createMatchMutation.isLoading || matchForm.homeTeamId === matchForm.awayTeamId}
              >
                {createMatchMutation.isLoading ? 'Scheduling…' : 'Schedule Match'}
              </button>
              {matchForm.homeTeamId === matchForm.awayTeamId && (
                <div className="text-sm text-red-600 flex items-center">Teams must be different.</div>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="card p-4 text-sm text-gray-600">
          Sign in as an admin to schedule or complete matches. Upcoming fixtures remain visible below.
        </div>
      )}

      <div className="flex gap-3 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value); }}
            className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value="">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Matches</h2>
          <div className="text-sm text-gray-500">Page {meta.page} / {meta.totalPages}</div>
        </div>
        {matchesQuery.isLoading && <div>Loading matches…</div>}
        {matchesQuery.error && <div className="text-red-600 text-sm">Failed to load matches.</div>}
        {!matchesQuery.isLoading && !matches.length && <div className="text-sm text-gray-500">No matches found.</div>}
        {matches.length > 0 && (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Fixture</th>
                  <th>Tournament</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.id} className="border-b last:border-none">
                    <td className="py-2 font-medium">
                      {match.homeTeam?.name ?? 'TBD'} vs {match.awayTeam?.name ?? 'TBD'}
                    </td>
                    <td>{match.tournament?.name ?? '—'}</td>
                    <td>{new Date(match.matchDate).toLocaleString()}</td>
                    <td className="capitalize">{match.status}</td>
                    <td className="text-right">
                      {match.status !== 'completed' && (
                        isAuthenticated ? (
                          <Link to={`/matches/complete/${match.id}`} className="text-xs text-brand-700">
                            Complete
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">Admin only</span>
                        )
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
