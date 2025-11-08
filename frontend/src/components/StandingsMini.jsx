export default function StandingsMini({ rows = [] }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 text-sm opacity-70">Standings (Top 5)</div>
      <div className="grid grid-cols-5 gap-2 text-sm font-medium border-b pb-2">
        <div>Team</div>
        <div className="text-right">P</div>
        <div className="text-right">Pts</div>
        <div className="text-right">GD</div>
        <div className="text-right">W-D-L</div>
      </div>
      {rows.slice(0, 5).map((row) => {
        const gd = row.goalsFor - row.goalsAgainst;
        return (
          <div key={row.teamId} className="grid grid-cols-5 gap-2 py-2 border-b last:border-none text-sm">
            <div className="truncate">{row.teamName}</div>
            <div className="text-right">{row.played}</div>
            <div className="text-right font-semibold">{row.points}</div>
            <div className="text-right">{gd}</div>
            <div className="text-right">{`${row.wins}-${row.draws}-${row.losses}`}</div>
          </div>
        );
      })}
      {!rows.length && <div className="py-4 text-sm text-gray-500">No completed matches yet.</div>}
    </div>
  );
}
