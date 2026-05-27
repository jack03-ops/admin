import React from 'react';
import { Bell, User, Search, Dumbbell } from 'lucide-react';

export default function Header({ title, user, setPage }) {
  return (
    <header className="h-20 border-b border-slate-800 bg-slate-950/40 backdrop-blur-md px-8 flex items-center justify-between">
      {/* Title / Greetings */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-orange-500" />
          {title}
        </h2>
        <p className="text-xs text-slate-400">Welcome back, {user?.name || 'Admin'}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications Indicator */}
        <button 
          onClick={() => setPage('notifications')}
          className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-800" />

        {/* User Info & Profile */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-200">{user?.name || 'Gym Admin'}</span>
            <span className="text-[10px] text-slate-400 font-medium">Head Manager</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 p-0.5 shadow-md">
            <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center text-white font-bold">
              GA
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
