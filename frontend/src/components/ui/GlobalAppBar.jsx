// src/components/ui/GlobalAppBar.jsx
import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Bell, PlayCircle, ChevronDown, Moon, Settings } from 'lucide-react';

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
  const [theme, setTheme] = useState(() => (typeof document !== 'undefined' ? document.documentElement.dataset.theme ?? 'dark' : 'dark'));
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileButtonRef = useRef(null);

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

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = nextTheme;
    }
    setTheme(nextTheme);
    setProfileMenuOpen(false);
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
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-3 rounded-full border border-shell-border bg-shell-surface px-3 py-1.5 text-left transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60"
              aria-haspopup="menu"
              aria-expanded={isProfileMenuOpen}
            >
              <span className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent/80 to-info/80 text-sm font-semibold uppercase text-white shadow-panel">
                {user?.name?.[0] ?? 'A'}
              </span>
              <span className="hidden text-sm leading-tight sm:block">
                <span className="block font-medium text-text-primary">{user ? user.name : 'Admin'}</span>
                <span className="text-[12px] uppercase tracking-wide text-text-muted">{user ? user.role : 'Sign in'}</span>
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
                  onClick={toggleTheme}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-text-primary transition hover:bg-shell-raised"
                >
                  <Moon size={16} aria-hidden="true" />
                  Toggle theme ({theme === 'dark' ? 'Dark' : 'Light'})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    handleLoginState();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-text-primary transition hover:bg-shell-raised"
                >
                  <Settings size={16} aria-hidden="true" />
                  {user ? 'Account settings' : 'Sign in'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
