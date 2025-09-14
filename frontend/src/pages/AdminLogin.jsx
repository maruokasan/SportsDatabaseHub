// src/pages/AdminLogin.jsx
import { useState } from 'react'

export default function AdminLogin(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const onSubmit = (e) => { e.preventDefault(); /* TODO: call /api/admin/login */ }

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <h2 className="font-display text-2xl mb-1">Admin Login</h2>
        <p className="text-sm text-gray-600 mb-4">Sign in to manage teams, players, and matches.</p>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-600" placeholder="••••••••" />
          </div>
          <button className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white py-2 font-medium">Sign in</button>
        </form>
      </div>
    </div>
  )
}