// src/components/PageHeading.jsx
export default function PageHeading({ eyebrow, title, description, actions }) {
  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-panel border border-shell-border/60 bg-shell-surface/70 px-4 py-3 shadow-panel">
      <div>
        {eyebrow ? (
          <p className="text-[11px] uppercase tracking-[0.3em] text-text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-2xl sm:text-3xl text-text-primary">{title}</h1>
        {description ? <p className="text-sm text-text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
