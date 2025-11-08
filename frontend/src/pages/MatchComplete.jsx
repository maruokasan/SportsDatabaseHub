import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { completeMatch, fetchMatchById } from '../api/matches';
import { fetchPlayers } from '../api/players';
import { useAuth } from '../context/AuthContext';

const defaultRow = { playerId: '', minutesPlayed: 90, goals: 0, assists: 0, shotsOnTarget: 0 };

export default function MatchComplete() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [scores, setScores] = useState({ homeScore: '', awayScore: '' });
  const [playerStats, setPlayerStats] = useState([defaultRow]);

  const matchQuery = useQuery({
    queryKey: ['matches', 'detail', id],
    queryFn: () => fetchMatchById(id),
    enabled: Boolean(id)
  });

  const playersQuery = useQuery({
    queryKey: ['players', 'options'],
    queryFn: () => fetchPlayers({ limit: 200 })
  });

  const completeMutation = useMutation({
    mutationFn: (payload) => completeMatch(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      navigate('/matches');
    }
  });

  const players = playersQuery.data?.data ?? [];
  const match = matchQuery.data;

  useEffect(() => {
    if (match) {
      setScores({
        homeScore: match.homeScore ?? 0,
        awayScore: match.awayScore ?? 0
      });
    }
  }, [match]);

  const participatingPlayers = useMemo(() => {
    if (!match) return players;
    const teamIds = new Set([match.homeTeamId, match.awayTeamId]);
    return players.filter((player) => player.teamId && teamIds.has(player.teamId));
  }, [match, players]);

  const updateStat = (index, field, value) => {
    setPlayerStats((prev) => {
      const clone = [...prev];
      clone[index] = { ...clone[index], [field]: value };
      return clone;
    });
  };

  const addRow = () => setPlayerStats((prev) => [...prev, defaultRow]);
  const removeRow = (index) => setPlayerStats((prev) => prev.filter((_, i) => i !== index));

  const submitForm = (e) => {
    e.preventDefault();
    const payload = {
      homeScore: Number(scores.homeScore) || 0,
      awayScore: Number(scores.awayScore) || 0,
      playerStats: playerStats
        .filter((stat) => stat.playerId)
        .map((stat) => ({
          playerId: stat.playerId,
          minutesPlayed: Number(stat.minutesPlayed) || 0,
          goals: Number(stat.goals) || 0,
          assists: Number(stat.assists) || 0,
          shotsOnTarget: Number(stat.shotsOnTarget) || 0
        }))
    };
    completeMutation.mutate(payload);
  };

  if (!isAuthenticated) {
    return (
      <div className="card p-6">
        <h1 className="font-display text-2xl mb-2">Complete Match</h1>
        <p className="text-sm text-gray-600">You must sign in as an admin to finalize a match.</p>
      </div>
    );
  }

  if (matchQuery.isLoading) {
    return <div className="card p-6">Loading match…</div>;
  }

  if (matchQuery.error || !match) {
    return <div className="card p-6 text-red-600">Unable to load match.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <button type="button" className="text-sm text-brand-700" onClick={() => navigate(-1)}>
          ← Back to Matches
        </button>
        <h1 className="font-display text-2xl mt-2">Complete Match</h1>
        <p className="text-sm text-gray-600">
          {match.homeTeam?.name ?? 'TBD'} vs {match.awayTeam?.name ?? 'TBD'} · {new Date(match.matchDate).toLocaleString()}
        </p>
      </div>

      <form onSubmit={submitForm} className="card p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Home Score</label>
            <input
              type="number"
              value={scores.homeScore}
              onChange={(e) => setScores((prev) => ({ ...prev, homeScore: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Away Score</label>
            <input
              type="number"
              value={scores.awayScore}
              onChange={(e) => setScores((prev) => ({ ...prev, awayScore: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Player Stats</div>
            <button type="button" className="text-xs text-brand-700" onClick={addRow}>Add player</button>
          </div>
          <div className="space-y-2">
            {playerStats.map((row, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                <select
                  value={row.playerId}
                  onChange={(e) => updateStat(index, 'playerId', e.target.value)}
                  className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
                  required
                >
                  <option value="">Select player</option>
                  {participatingPlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.firstName} {player.lastName}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Minutes"
                  value={row.minutesPlayed}
                  onChange={(e) => updateStat(index, 'minutesPlayed', e.target.value)}
                  className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
                />
                <input
                  type="number"
                  placeholder="Goals"
                  value={row.goals}
                  onChange={(e) => updateStat(index, 'goals', e.target.value)}
                  className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
                />
                <input
                  type="number"
                  placeholder="Assists"
                  value={row.assists}
                  onChange={(e) => updateStat(index, 'assists', e.target.value)}
                  className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
                />
                <input
                  type="number"
                  placeholder="Shots on Target"
                  value={row.shotsOnTarget}
                  onChange={(e) => updateStat(index, 'shotsOnTarget', e.target.value)}
                  className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
                />
                <button type="button" className="text-xs text-red-600" onClick={() => removeRow(index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {completeMutation.error && (
          <div className="text-sm text-red-600">Failed to complete match.</div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" className="px-4 py-2 rounded-xl border" onClick={() => navigate('/matches')}>
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-brand-600 text-white disabled:opacity-70"
            disabled={completeMutation.isLoading}
          >
            {completeMutation.isLoading ? 'Completing…' : 'Complete Match'}
          </button>
        </div>
      </form>
    </div>
  );
}
