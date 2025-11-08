import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchCareerAverages, fetchConsistency, fetchGoalsPer90, fetchHeadToHead, fetchInjuryBurden } from '../api/analytics';
import { fetchTeams } from '../api/teams';

export default function Analytics() {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');

  const goalsQuery = useQuery({
    queryKey: ['analytics', 'goals-per-90', 'analytics-page'],
    queryFn: fetchGoalsPer90
  });

  const injuryQuery = useQuery({
    queryKey: ['analytics', 'injury-burden', 'analytics-page'],
    queryFn: fetchInjuryBurden
  });

  const teamsQuery = useQuery({
    queryKey: ['teams', 'all'],
    queryFn: () => fetchTeams({ limit: 100 })
  });

  const headToHeadQuery = useQuery({
    queryKey: ['analytics', 'head-to-head', teamA, teamB],
    queryFn: () => fetchHeadToHead(teamA, teamB),
    enabled: Boolean(teamA && teamB)
  });

  const careerQuery = useQuery({
    queryKey: ['analytics', 'career-averages'],
    queryFn: () => fetchCareerAverages()
  });

  const consistencyQuery = useQuery({
    queryKey: ['analytics', 'consistency'],
    queryFn: () => fetchConsistency()
  });

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="font-display text-2xl mb-3">Head-to-Head</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <select
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value="">Select Team A</option>
            {teamsQuery.data?.data?.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <select
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value="">Select Team B</option>
            {teamsQuery.data?.data?.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <div className="rounded-xl border px-3 py-2 text-sm flex items-center">
            {teamA && teamB ? 'Comparison ready' : 'Pick two teams'}
          </div>
        </div>
        {headToHeadQuery.isLoading && <div>Loading comparison…</div>}
        {headToHeadQuery.isFetched && headToHeadQuery.data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border p-4">
              <div className="text-sm opacity-70 mb-2">Summary</div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="text-2xl font-display">{headToHeadQuery.data.summary.teamA.wins}</div>
                  <div>Team A Wins</div>
                </div>
                <div>
                  <div className="text-2xl font-display">{headToHeadQuery.data.summary.teamB.wins}</div>
                  <div>Team B Wins</div>
                </div>
                <div>
                  <div className="text-2xl font-display">{headToHeadQuery.data.summary.draws}</div>
                  <div>Draws</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="text-sm opacity-70 mb-2">Recent Meetings</div>
              <div className="space-y-2 text-sm">
                {headToHeadQuery.data.details.map((match) => (
                  <div key={match.matchId} className="flex justify-between">
                    <div>{match.homeTeam} vs {match.awayTeam}</div>
                    <div className="font-medium">{match.score}</div>
                  </div>
                ))}
                {!headToHeadQuery.data.details.length && <div>No meetings yet.</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="font-display text-2xl mb-3">Goals per 90</h2>
          {goalsQuery.isLoading && <div>Loading analytics…</div>}
          {!goalsQuery.isLoading && (goalsQuery.data ?? []).length === 0 && <div className="text-sm text-gray-500">No player stats yet.</div>}
          {(goalsQuery.data ?? []).length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Player</th>
                  <th className="text-right">Goals</th>
                  <th className="text-right">Minutes</th>
                  <th className="text-right">G/90</th>
                </tr>
              </thead>
              <tbody>
                {goalsQuery.data.slice(0, 8).map((row) => (
                  <tr key={`${row.playerId}-analytics`} className="border-b last:border-none">
                    <td className="py-2 font-medium">{row.name}</td>
                    <td className="text-right">{row.goals}</td>
                    <td className="text-right">{row.minutes}</td>
                    <td className="text-right font-semibold">{row.goalsPer90.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card p-4">
          <h2 className="font-display text-2xl mb-3">Injury Burden</h2>
          {injuryQuery.isLoading && <div>Loading injuries…</div>}
          {!injuryQuery.isLoading && (injuryQuery.data ?? []).length === 0 && <div className="text-sm text-gray-500">All squads healthy.</div>}
          {(injuryQuery.data ?? []).length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Team</th>
                  <th className="text-right">Active Injuries</th>
                </tr>
              </thead>
              <tbody>
                {injuryQuery.data.map((row) => (
                  <tr key={`${row.teamId}-injury`} className="border-b last:border-none">
                    <td className="py-2 font-medium">{row.teamName}</td>
                    <td className="text-right">{row.activeInjuries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="font-display text-2xl mb-3">Career Averages</h2>
          {careerQuery.isLoading && <div>Loading career averages…</div>}
          {!careerQuery.isLoading && (careerQuery.data ?? []).length === 0 && (
            <div className="text-sm text-gray-500">No player stats yet.</div>
          )}
          {(careerQuery.data ?? []).length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Player</th>
                  <th className="text-right">Matches</th>
                  <th className="text-right">Avg Goals</th>
                  <th className="text-right">Avg Assists</th>
                  <th className="text-right">G/90</th>
                </tr>
              </thead>
              <tbody>
                {careerQuery.data.slice(0, 8).map((row) => (
                  <tr key={`${row.playerId}-career`} className="border-b last:border-none">
                    <td className="py-2 font-medium">{row.name}</td>
                    <td className="text-right">{row.matches}</td>
                    <td className="text-right">{row.avgGoals.toFixed(2)}</td>
                    <td className="text-right">{row.avgAssists.toFixed(2)}</td>
                    <td className="text-right font-semibold">{row.goalsPer90.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card p-4">
          <h2 className="font-display text-2xl mb-3">Consistency</h2>
          {consistencyQuery.isLoading && <div>Measuring consistency…</div>}
          {!consistencyQuery.isLoading && (consistencyQuery.data ?? []).length === 0 && (
            <div className="text-sm text-gray-500">Not enough match data.</div>
          )}
          {(consistencyQuery.data ?? []).length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Player</th>
                  <th className="text-right">Matches</th>
                  <th className="text-right">Avg Goals</th>
                  <th className="text-right">Std Dev (Goals)</th>
                  <th className="text-right">Std Dev (Assists)</th>
                </tr>
              </thead>
              <tbody>
                {consistencyQuery.data.slice(0, 8).map((row) => (
                  <tr key={`${row.playerId}-consistency`} className="border-b last:border-none">
                    <td className="py-2 font-medium">{row.name}</td>
                    <td className="text-right">{row.matches}</td>
                    <td className="text-right">{row.avgGoals.toFixed(2)}</td>
                    <td className="text-right">{row.stdDevGoals.toFixed(2)}</td>
                    <td className="text-right">{row.stdDevAssists.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
