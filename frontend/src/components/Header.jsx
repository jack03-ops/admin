import React from 'react';
import { Bell, User, Search, Dumbbell, QrCode } from 'lucide-react';

export default function Header({ title, user, setPage }) {
  return (
    <header className="h-20 border-b border-slate-200 bg-white px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Title / Greetings */}
      <div>
        <h2 className="text-base md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Dumbbell className="w-4 h-4 md:w-5 md:h-5 text-slate-700 shrink-0" />
          <span className="truncate max-w-[180px] md:max-w-none">{title}</span>
        </h2>
        <p className="text-[10px] md:text-xs text-slate-500 font-medium">Welcome, {user?.name || 'Admin'}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* QR Check-In Scanner Trigger */}
        <button 
          onClick={() => setPage('check-in')}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer flex items-center justify-center"
          title="QR Check-In Scanner"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <QrCode className="w-5 h-5 text-cyan-500" />
        </button>

        {/* Notifications Indicator */}
        <button 
          onClick={() => setPage('notifications')}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer flex items-center justify-center"
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
