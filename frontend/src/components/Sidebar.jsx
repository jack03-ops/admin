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
  Flame,
  Dumbbell
} from 'lucide-react';
import phoenixLogo from '../assets/phoenix_logo.png';

export default function Sidebar({ currentPage, setCurrentPage, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members List', icon: Users },
    { id: 'add-member', label: 'Add Member', icon: UserPlus },
    { id: 'trainers', label: 'Trainers', icon: Dumbbell },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-64 min-h-screen bg-[#0f172a] border-r border-slate-800 flex-col justify-between shrink-0">
      <div>
        {/* Gym Logo / Brand */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="p-1 rounded-xl border border-cyan-500/30 bg-slate-950 shrink-0">
            <img src={phoenixLogo} alt="Phoenix Logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white m-0">Phoenix Fitness Academy</h1>
            <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">Admin System</span>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="text-sm">{item.label}</span>
                {item.id === 'notifications' && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-slate-950 text-cyan-400' : 'bg-cyan-500 text-slate-950'}`}>
                    3
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </aside>

  );
}
