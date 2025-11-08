import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-6 text-center space-y-3 max-w-md">
        <h1 className="font-display text-3xl">404</h1>
        <p className="text-gray-600">We could not find that page.</p>
        <Link to="/" className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50">
          Go home
        </Link>
      </div>
    </div>
  );
}
