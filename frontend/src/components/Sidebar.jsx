import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  CreditCard, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  Flame
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members List', icon: Users },
    { id: 'add-member', label: 'Add Member', icon: UserPlus },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900/60 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between shrink-0">
      <div>
        {/* Gym Logo / Brand */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="bg-orange-500/10 p-2 rounded-lg border border-orange-500/30 text-orange-500 animate-pulse-glow">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white m-0">Phoenix Gym</h1>
            <span className="text-[10px] text-orange-500 font-semibold uppercase tracking-wider">Admin System</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-950/20 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="text-sm">{item.label}</span>
                {item.id === 'notifications' && (
                  <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    3
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
