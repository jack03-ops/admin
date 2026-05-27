import React from 'react';
import { Bell, User, Search, Dumbbell } from 'lucide-react';

export default function Header({ title, user, setPage }) {
  return (
    <header className="h-20 border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md px-8 flex items-center justify-between">
      {/* Title / Greetings */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-red-500" />
          {title}
        </h2>
        <p className="text-xs text-zinc-400">Welcome back, {user?.name || 'Admin'}</p>
      </div>

      {/* Actions */}
      <div className="hidden md:flex items-center gap-4">
        {/* Notifications Indicator */}
        <button 
          onClick={() => setPage('notifications')}
          className="relative p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 rounded-xl transition-all cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>


  );
}
