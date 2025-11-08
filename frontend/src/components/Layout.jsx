// src/components/Layout.jsx
import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { GlobalAppBar } from './ui';
import { useAuth } from '../context/AuthContext';

const seasonOptions = [
  { value: '2024-25', label: '2024 / 2025' },
  { value: '2023-24', label: '2023 / 2024' },
  { value: '2022-23', label: '2022 / 2023' }
];

const tournamentOptions = [
  { value: 'league', label: 'Premier League' },
  { value: 'cup', label: 'Cup' },
  { value: 'continental', label: 'Continental' }
];

const navTabs = [
  { to: '/', label: 'Live' },
  { to: '/analytics', label: 'History' },
  { to: '/players', label: 'Players' },
  { to: '/teams', label: 'Teams' }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [season, setSeason] = useState(seasonOptions[0].value);
  const [tournament, setTournament] = useState(tournamentOptions[0].value);
  const location = useLocation();

  const matchweekLabel = useMemo(() => {
    const now = new Date();
    const weekNumber = Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + now.getDay() + 1) / 7);
    return `Matchweek ${weekNumber.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className="min-h-screen bg-shell-base text-text-primary">
      <GlobalAppBar
        seasonOptions={seasonOptions}
        selectedSeason={season}
        onSeasonChange={setSeason}
        tournamentOptions={tournamentOptions}
        selectedTournament={tournament}
        onTournamentChange={setTournament}
        matchweekLabel={matchweekLabel}
        user={user}
        onLogout={logout}
        onLogin={() => navigate('/admin/login')}
      />

      <div className="border-b border-shell-border bg-shell-base/95">
        <nav className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
          {navTabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `my-3 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-shell-raised text-text-primary'
                    : 'text-text-muted hover:text-text-primary hover:bg-shell-surface'
                }`
              }
              end={tab.to === '/'}
            >
              {tab.label}
            </NavLink>
          ))}
          <span className="ml-auto text-xs uppercase tracking-[0.2em] text-text-muted">
            {location.pathname === '/' ? 'Live View' : 'Browse'}
          </span>
        </nav>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet context={{ season, tournament }} />
      </main>
      <footer className="border-t border-shell-border/60 py-8 text-center text-sm text-text-muted">
        © {new Date().getFullYear()} Sports Analytics Hub — Live, Players, Teams, Admin
      </footer>
    </div>
  );
}
