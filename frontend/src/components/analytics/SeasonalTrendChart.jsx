import React, { useEffect, useRef, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import ChartCard from '../ui/ChartCard';

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;

  return (
    <div className="rounded-panel border border-shell-border bg-shell-surface px-4 py-3 text-sm shadow-panel">
      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{label}</p>
      <p className="font-semibold text-text-primary">Avg result: {entry.avg_result.toFixed(2)}</p>
    </div>
  );
};

export default function SeasonalTrendChart({ data = [], isLoading = false, isError = false, bucket = 'month' }) {
  // DEBUG: Log component props and data processing
  if (import.meta.env.DEV) {
    console.log('DEBUG: SeasonalTrendChart', {
      dataLength: data?.length,
      isLoading,
      isError,
      bucket,
      data: data?.slice(0, 3) // Log first 3 items
    });
  }
  
  const chartData = (data ?? [])
    .map((row) => ({
      label: row.bucket_label || row.month_bucket,
      avg_result: row.avg_result == null ? null : Number(row.avg_result)
    }))
    .filter((row) => row.label && row.avg_result != null);
  
  // DEBUG: Log processed data
  if (import.meta.env.DEV) {
    console.log('DEBUG: SeasonalTrendChart Processed', {
      chartDataLength: chartData.length,
      chartData: chartData.slice(0, 3),
      visible: false // Will be updated by IntersectionObserver
    });
  }

  // IntersectionObserver based lazy-mount: only render heavy chart when visible
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) {
      if (import.meta.env.DEV) console.log('DEBUG: SeasonalTrendChart - No container ref');
      return;
    }
    
    if (import.meta.env.DEV) console.log('DEBUG: SeasonalTrendChart - Setting up IntersectionObserver');
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (import.meta.env.DEV) {
          console.log('DEBUG: SeasonalTrendChart - IntersectionObserver callback', {
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
    content = <div className="flex h-full items-center justify-center text-sm text-text-muted">Loading seasonal trend…</div>;
  } else if (isError) {
    content = <div className="flex h-full items-center justify-center text-sm text-red-500">Failed to load seasonal trend.</div>;
  } else if (!chartData.length) {
    content = <div className="flex h-full items-center justify-center text-sm text-text-muted">No score data available.</div>;
  } else {
    // If not yet visible, render a lightweight placeholder with same height to avoid layout shift.
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
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" stroke="var(--color-text-muted)" hide={chartData.length > 12} />
                <YAxis stroke="var(--color-text-muted)" domain={[0, 'dataMax']} />
                <Tooltip content={<TrendTooltip />} cursor={{ stroke: 'var(--team-home)', strokeWidth: 1 }} />
                <Line
                  type="monotone"
                  dataKey="avg_result"
                  stroke="var(--team-home)"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, stroke: 'var(--team-home)', fill: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
            {chartData.slice(-6).map((row) => (
              <div key={`trend-${row.label}`} className="rounded-xl border border-shell-border px-3 py-2">
                <div className="text-xs uppercase tracking-[0.2em] text-text-muted">{bucket}</div>
                <div className="font-semibold text-text-primary">{row.label}</div>
                <div className="text-sm text-text-muted">Avg {row.avg_result.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </>
      );
    }
  }

  const bucketLabel = bucket === 'week' ? 'week (ISO)' : bucket;

  // Ensure containerRef exists when chart is visible (in case the element was already observed)
  return (
    <ChartCard title="Seasonal Trend" subtitle="Time series" meta={`AVG(result) by ${bucketLabel}`}>
      {content}
    </ChartCard>
  );
}
