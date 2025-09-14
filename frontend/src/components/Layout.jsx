// src/components/Layout.jsx
import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <footer className="mt-10 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Sports Analytics Hub
      </footer>
    </div>
  )
}