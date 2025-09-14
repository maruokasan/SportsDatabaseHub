export default function StandingsMini({ rows }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 text-sm opacity-70">Standings (Top 5)</div>
      <div className="grid grid-cols-6 gap-2 text-sm font-medium border-b pb-2">
        <div>Team</div><div className="text-right">Pts</div><div className="text-right">GD</div><div className="col-span-3 text-right">Form</div>
      </div>
      {rows.map(r => (
        <div key={r.TeamID} className="grid grid-cols-6 gap-2 py-2 border-b last:border-none">
          <div className="truncate">{r.TeamName}</div>
          <div className="text-right">{r.Pts}</div>
          <div className="text-right">{r.GD}</div>
          <div className="col-span-3 text-right">{r.Form}</div>
        </div>
      ))}
    </div>
  );
}
