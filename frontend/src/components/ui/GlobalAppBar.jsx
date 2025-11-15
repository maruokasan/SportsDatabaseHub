import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Bell, PlayCircle, ChevronDown, User, Settings } from 'lucide-react';

const Select = ({ id, label, value, options = [], onChange }) => (
  <label htmlFor={id} className="flex flex-col gap-1 text-xs text-text-muted uppercase tracking-wide">
    {label}
    <div className="relative">
      <select
        id={id}
        value={value ?? ''}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-48 appearance-none rounded-chip border border-shell-border bg-shell-surface/60 px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60"
      >
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option} disabled={option.disabled}>
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
  sportOptions = [],
  selectedSport,
  onSportChange,
  onFollowMatch,
  matchweekLabel = 'Matchweek 0',
  user,
  onLogin,
  onLogout,
  notifications = 0
}) {
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileButtonRef = useRef(null);

  const handleFollow = () => {
    onFollowMatch?.();
  };

  useEffect(() => {
    const handleClickAway = (event) => {
      if (!profileButtonRef.current) return;
      if (!profileButtonRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('mousedown', handleClickAway);
      return () => window.removeEventListener('mousedown', handleClickAway);
    }
    return undefined;
  }, []);

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
          <Select id="sport-select" label="Sport" value={selectedSport} onChange={onSportChange} options={sportOptions} />
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
            title="Get notifications whenever this match updates"
            className="inline-flex items-center gap-2 rounded-shell bg-accent/90 px-4 py-2 text-sm font-medium text-white shadow-panel transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <PlayCircle size={18} aria-hidden="true" />
            Follow Match
          </button>

          <button
            type="button"
            aria-label="Notifications"
            title="Open match notifications"
            className="relative inline-flex items-center gap-2 rounded-full border border-shell-border bg-shell-surface px-3 py-2 text-sm font-medium text-text-primary transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60"
          >
            <Bell size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Alerts</span>
            {notifications > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold text-shell-base">
                {notifications}
              </span>
            ) : null}
          </button>

          <div className="relative" ref={profileButtonRef}>
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-shell-border bg-shell-surface transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60"
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                >
                  <span className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent/80 to-info/80 text-sm font-semibold uppercase text-white shadow-panel">
                    {user?.name?.[0] ?? 'A'}
                  </span>
                </button>
                {isProfileMenuOpen ? (
                  <div
                    role="menu"
                    aria-label="Profile quick actions"
                    className="absolute right-0 mt-2 w-56 rounded-panel border border-shell-border bg-shell-surface/95 p-2 text-sm shadow-panel backdrop-blur"
                  >
                    <button
                      type="button"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-text-primary transition hover:bg-shell-raised"
                    >
                      <Settings size={16} aria-hidden="true" />
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onLogout?.();
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-text-primary transition hover:bg-shell-raised"
                    >
                      <Settings size={16} aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center gap-2 rounded-lg border border-shell-border bg-shell-surface px-3 py-2 text-sm font-medium text-text-primary transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60"
                title="Sign in to manage players, teams and settings"
              >
                <User size={16} aria-hidden="true" />
                <span>Admin sign-in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
