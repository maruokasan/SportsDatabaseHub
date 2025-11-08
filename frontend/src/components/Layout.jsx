// src/components/Layout.jsx
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { GlobalAppBar } from './ui';
import PrimaryNav from './PrimaryNav';
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

const routeLabels = {
  '/': 'Live View',
  '/analytics': 'Match History & Analytics',
  '/players': 'Players Directory',
  '/teams': 'Teams Directory'
};

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

  const locationDescriptor = routeLabels[location.pathname] ?? 'Browse';

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

      <PrimaryNav tabs={navTabs} locationDescriptor={locationDescriptor} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet context={{ season, tournament }} />
      </main>
      <footer className="border-t border-shell-border/60 py-8 text-center text-sm text-text-muted">
        © {new Date().getFullYear()} Sports Analytics Hub - Live Sports Analytics
      </footer>
    </div>
  );
}
