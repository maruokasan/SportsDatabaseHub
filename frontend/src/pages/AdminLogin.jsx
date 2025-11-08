// src/pages/AdminLogin.jsx
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@sports.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login({ email, password });
      const target = location.state?.from?.pathname || '/';
      navigate(target, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid credentials';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-6">
          <h2 className="font-display text-2xl mb-1">Admin Login</h2>
          <p className="text-sm text-gray-600 mb-4">Use the credentials seeded in the backend to continue.</p>
          {error && <div className="rounded-xl bg-red-50 text-red-700 text-sm px-3 py-2 mb-3">{error}</div>}
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-70 text-white py-2 font-medium"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3">
          Admin: admin@sports.local / Admin@123 · Viewer: viewer@sports.local / Viewer@123
        </p>
      </div>
    </div>
  );
}
