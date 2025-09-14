export default function KPICard({ title, value, sub }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-brand-700/80 mb-1">{title}</div>
      <div className="text-3xl font-semibold my-1">{value}</div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
    </div>
  );
}
