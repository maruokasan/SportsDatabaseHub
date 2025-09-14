import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TrendChart({ data }) {
  return (
    <div className="h-64 rounded-2xl border p-4">
      <div className="mb-2 text-sm opacity-70">Goals per Month</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ym" />
          <YAxis />
          <Tooltip />
          <Line dataKey="Goals" type="monotone" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
