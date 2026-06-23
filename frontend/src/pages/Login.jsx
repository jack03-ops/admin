import React, { useState } from 'react';
import { Lock, Mail, Dumbbell, ShieldCheck } from 'lucide-react';
import phoenixLogo from '../assets/phoenix_logo.png';
import * as api from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@phoenixgym.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login(email, password);
      onLoginSuccess(result);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#FF5F1F]/10 blur-[150px] animate-pulse-glow" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#FF5F1F]/5 blur-[150px] animate-pulse-glow" />

      <div className="w-full max-w-md relative z-10">
        {/* Gym Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-1.5 bg-zinc-950 border border-orange-500/20 rounded-3xl mb-4 shadow-xl">
            <img src={phoenixLogo} alt="Phoenix Logo" className="w-16 h-16 object-contain animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Phoenix Fitness Academy</h2>
          <p className="text-zinc-400 text-sm mt-1">Management Portal & Admin Telemetry</p>
        </div>

        {/* Card Panel (Dark themed instead of glass-panel white card) */}
        <div className="bg-[#111111]/90 backdrop-blur-lg p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-zinc-800">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF5F1F] via-[#FF5F1F]/80 to-[#FF5F1F]/40" />
          
          <h3 className="text-xl font-bold text-white mb-6">Staff Log In</h3>

          {error && (
            <div className="mb-4 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-550" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#FF5F1F] transition-all placeholder:text-zinc-600"
                  placeholder="admin@phoenixgym.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-555" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#FF5F1F] transition-all placeholder:text-zinc-660"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-phoenix hover:opacity-95 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-orange-950/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          {/* Credentials helper box */}
          <div className="mt-8 p-3.5 bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl flex gap-3 items-center">
            <div className="bg-orange-500/10 p-2 rounded-xl text-[#FF5F1F] shrink-0">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div className="text-[11px] text-zinc-400">
              <p className="font-semibold text-zinc-300">Demo Access Enabled</p>
              <p className="mt-0.5">Use email: <code className="text-[#FF5F1F]">admin@phoenixgym.com</code> and password: <code className="text-[#FF5F1F]">admin123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
