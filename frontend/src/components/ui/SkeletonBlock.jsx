// src/components/ui/SkeletonBlock.jsx
export default function SkeletonBlock({ height = 48, width = '100%' }) {
  return (
    <div
      className="shimmer rounded-panel bg-shell-raised/60"
      style={{ height: typeof height === 'number' ? `${height}px` : height, width }}
    />
  );
}
