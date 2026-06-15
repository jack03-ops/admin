import React from 'react';
import { Bell, User, Search, Dumbbell, QrCode } from 'lucide-react';

export default function Header({ title, user, setPage }) {
  return (
    <header className="h-20 border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Title / Greetings */}
      <div>
        <h2 className="text-base md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Dumbbell className="w-4 h-4 md:w-5 md:h-5 text-red-500 shrink-0" />
          <span className="truncate max-w-[180px] md:max-w-none">{title}</span>
        </h2>
        <p className="text-[10px] md:text-xs text-zinc-400">Welcome, {user?.name || 'Admin'}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* QR Check-In Scanner Trigger */}
        <button 
          onClick={() => setPage('check-in')}
          className="relative p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 rounded-xl transition-all cursor-pointer flex items-center justify-center"
          title="QR Check-In Scanner"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <QrCode className="w-5 h-5 text-red-500" />
        </button>

        {/* Notifications Indicator */}
        <button 
          onClick={() => setPage('notifications')}
          className="relative p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 rounded-xl transition-all cursor-pointer flex items-center justify-center"
          style={{ minWidth: '44px', minHeight: '44px' }}
          title="Notification Center"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>


  );
}
