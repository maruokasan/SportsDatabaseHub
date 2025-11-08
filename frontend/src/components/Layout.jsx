// src/components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Sports Analytics Hub
      </footer>
    </div>
  );
}
