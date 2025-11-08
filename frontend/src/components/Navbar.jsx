// src/components/Navbar.jsx
import { Link, NavLink } from 'react-router-dom';
import { ShieldCheck, Trophy, LineChart, Users, List, BarChart3, LogOut, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-xl text-sm font-medium ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`;

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-600 grid place-items-center text-white">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="font-display text-lg leading-5">Sports Dashboard</div>
            <div className="text-[11px] text-gray-500 -mt-0.5">Insights & Management</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/matches" className={linkClass}><List className="inline-block mr-1" size={16} />Matches</NavLink>
          <NavLink to="/teams" className={linkClass}><Users className="inline-block mr-1" size={16} />Teams</NavLink>
          <NavLink to="/players" className={linkClass}><Trophy className="inline-block mr-1" size={16} />Players</NavLink>
          <NavLink to="/tournaments" className={linkClass}><CalendarDays className="inline-block mr-1" size={16} />Tournaments</NavLink>
          <NavLink to="/standings" className={linkClass}><BarChart3 className="inline-block mr-1" size={16} />Standings</NavLink>
          <NavLink to="/leaderboards" className={linkClass}><Trophy className="inline-block mr-1" size={16} />Leaderboards</NavLink>
          <NavLink to="/analytics" className={linkClass}><LineChart className="inline-block mr-1" size={16} />Analytics</NavLink>
        </nav>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              <div className="font-medium text-gray-900">{user.name}</div>
              <div className="text-xs uppercase tracking-wide">{user.role}</div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <Link to="/admin/login" className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
