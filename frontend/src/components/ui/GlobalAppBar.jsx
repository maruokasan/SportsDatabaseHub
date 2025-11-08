// src/components/ui/GlobalAppBar.jsx
import { ShieldCheck, Bell, PlayCircle, Filter, ChevronDown } from 'lucide-react';

const Select = ({ id, label, value, options = [], onChange }) => (
  <label htmlFor={id} className="flex flex-col gap-1 text-xs text-text-muted uppercase tracking-wide">
    {label}
    <div className="relative">
      <select
        id={id}
        value={value ?? ''}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full appearance-none rounded-chip border border-shell-border bg-shell-surface/60 px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60"
      >
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
    </div>
  </label>
);

export default function GlobalAppBar({
  seasonOptions = [],
  selectedSeason,
  onSeasonChange,
  tournamentOptions = [],
  selectedTournament,
  onTournamentChange,
  onFollowMatch,
  matchweekLabel = 'Matchweek 0',
  user,
  onLogin,
  onLogout,
  notifications = 0
}) {
  const handleFollow = () => {
    onFollowMatch?.();
  };

  const handleLoginState = () => {
    if (user) {
      onLogout?.();
    } else {
      onLogin?.();
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-shell-border bg-shell-base/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 items-center gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-accent to-info/80 text-white shadow-panel">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="font-display text-base leading-tight">Sports Database Hub</p>
            <p className="text-[12px] uppercase tracking-[0.18em] text-text-muted">{matchweekLabel}</p>
          </div>
        </div>

        <div className="hidden flex-1 items-center gap-4 lg:flex">
          <Select id="season-select" label="Season" value={selectedSeason} onChange={onSeasonChange} options={seasonOptions} />
          <Select
            id="tournament-select"
            label="Tournament"
            value={selectedTournament}
            onChange={onTournamentChange}
            options={tournamentOptions}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleFollow}
            className="inline-flex items-center gap-2 rounded-shell bg-accent/90 px-4 py-2 text-sm font-medium text-white shadow-panel transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <PlayCircle size={18} />
            Follow Match
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-shell-border bg-shell-surface text-text-primary transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60"
          >
            <Bell size={18} />
            {notifications > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold text-shell-base">
                {notifications}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={handleLoginState}
            className="inline-flex items-center gap-3 rounded-full border border-shell-border bg-shell-surface px-3 py-1.5 text-left transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-shell-raised text-sm font-semibold uppercase text-accent">
              {user?.name?.[0] ?? 'A'}
            </span>
            <span className="hidden text-sm leading-tight sm:block">
              <span className="block font-medium text-text-primary">{user ? user.name : 'Admin'}</span>
              <span className="text-[12px] uppercase tracking-wide text-text-muted">{user ? user.role : 'Sign in'}</span>
            </span>
          </button>
        </div>
      </div>

      <div className="border-t border-shell-border px-4 pb-4 pt-3 lg:hidden">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-panel border border-dashed border-shell-border/80 px-3 py-2 text-sm text-text-muted transition hover:border-accent hover:text-accent"
        >
          <Filter size={16} />
          Adjust filters
        </button>
      </div>
    </header>
  );
}
