// src/App.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'

// temporary stubs so nav won’t break if you clicked around
function Stub({ name }) { return <div className="card p-6">{name} page</div> }

const qc = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/matches" element={<Stub name="Matches" />} />
          <Route path="/teams" element={<Stub name="Teams" />} />
          <Route path="/players" element={<Stub name="Players" />} />
          <Route path="/standings" element={<Stub name="Standings" />} />
          <Route path="/leaderboards" element={<Stub name="Leaderboards" />} />
          <Route path="/analytics" element={<Stub name="Analytics" />} />
          <Route path="/admin/login" element={<Stub name="Admin Login" />} />
        </Routes>
      </Layout>
    </QueryClientProvider>
  )
}
