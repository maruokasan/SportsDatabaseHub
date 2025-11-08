// src/App.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import Teams from './pages/Teams';
import Players from './pages/Players';
import Tournaments from './pages/Tournaments';
import Standings from './pages/Standings';
import Leaderboards from './pages/Leaderboards';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/AdminLogin';
import MatchComplete from './pages/MatchComplete';
import { AuthProvider } from './context/AuthContext';

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/complete/:id" element={<MatchComplete />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/players" element={<Players />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}
