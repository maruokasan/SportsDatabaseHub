import React, { useEffect, useRef, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import ChartCard from '../ui/ChartCard';

const colors = ['#0ea5e9', '#2563eb', '#7c3aed', '#f97316', '#14b8a6', '#ec4899'];

const HeatmapTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;

  return (
    <div className="rounded-panel border border-shell-border bg-shell-surface px-4 py-3 text-sm shadow-panel">
      <p className="font-semibold text-text-primary">{entry.nationality}</p>
      <p className="text-text-muted">Avg result: {entry.avg_result.toFixed(2)}</p>
      <p className="text-text-muted">Samples: {entry.n_samples}</p>
    </div>
  );
};

export default function NationalityHeatmap({ data = [], isLoading = false, isError = false }) {
  // DEBUG: Log component props and data processing
  if (import.meta.env.DEV) {
    console.log('DEBUG: NationalityHeatmap', {
      dataLength: data?.length,
      isLoading,
      isError,
      data: data?.slice(0, 3) // Log first 3 items
    });
  }
  
  const sorted = [...(data ?? [])].sort((a, b) => (Number(b.avg_result ?? 0) || 0) - (Number(a.avg_result ?? 0) || 0));
  const chartData = sorted
    .filter((row) => row.avg_result != null)
    .slice(0, 12)
    .map((row) => ({
      nationality: row.nationality || 'Unknown',
      avg_result: Number(row.avg_result) || 0,
      n_samples: Number(row.n_samples) || 0
    }));
  const totalSamples = data.reduce((sum, row) => sum + (Number(row.n_samples) || 0), 0);
  
  // DEBUG: Log processed data
  if (import.meta.env.DEV) {
    console.log('DEBUG: NationalityHeatmap Processed', {
      chartDataLength: chartData.length,
      totalSamples,
      visible: false // Will be updated by IntersectionObserver
    });
  }

  // IntersectionObserver lazy-mount for heavy chart rendering
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) {
      if (import.meta.env.DEV) console.log('DEBUG: NationalityHeatmap - No container ref');
      return;
    }
    
    if (import.meta.env.DEV) console.log('DEBUG: NationalityHeatmap - Setting up IntersectionObserver');
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (import.meta.env.DEV) {
          console.log('DEBUG: NationalityHeatmap - IntersectionObserver callback', {
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            boundingClientRect: entry.boundingClientRect,
            rootBounds: entry.rootBounds,
            target: entry.target
          });
        }
        
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [containerRef]);

  let content = null;
  if (isLoading) {
    content = <div className="flex h-full items-center justify-center text-sm text-text-muted">Aggregating by nationality…</div>;
  } else if (isError) {
    content = <div className="flex h-full items-center justify-center text-sm text-red-500">Failed to load nationality analytics.</div>;
  } else if (!chartData.length) {
    content = <div className="flex h-full items-center justify-center text-sm text-text-muted">No nationality data available.</div>;
  } else {
    // Render lightweight placeholder until visible to avoid heavy chart rendering off-screen.
    if (!visible) {
      content = (
        <div ref={containerRef} className="h-60 flex items-center justify-center text-sm text-text-muted">
          Chart will load when visible
        </div>
      );
    } else {
      content = (
        <>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" barCategoryGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" stroke="var(--color-text-muted)" domain={[0, 'dataMax']} />
                <YAxis type="category" dataKey="nationality" width={80} stroke="var(--color-text-muted)" />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<HeatmapTooltip />} />
                <Bar dataKey="avg_result" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${entry.nationality}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-xs text-text-muted">
            Based on {totalSamples} scoring events · Showing top {chartData.length} nationalities.
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            {chartData.slice(0, 6).map((row) => (
              <div key={`stat-${row.nationality}`} className="flex items-baseline justify-between rounded-xl border border-shell-border px-3 py-2">
                <span className="font-medium text-text-primary">{row.nationality}</span>
                <div className="text-right">
                  <div className="font-semibold">{row.avg_result.toFixed(2)}</div>
                  <div className="text-xs text-text-muted">{row.n_samples} samples</div>
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
  }

  return (
    <ChartCard title="Nationality Heatmap" subtitle="Win rate" meta="AVG(result) grouped by nationality">
      {content}
    </ChartCard>
  );
}
