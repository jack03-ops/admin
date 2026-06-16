import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Bell, 
  Settings 
} from 'lucide-react';

export default function BottomNav({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#060814]/70 backdrop-blur-lg border-t border-orange-500/10 flex items-center justify-around px-4 z-40 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id || (item.id === 'members' && currentPage === 'edit-member') || (item.id === 'members' && currentPage === 'add-member');
        
        return (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 cursor-pointer relative"
            style={{ minWidth: '44px', minHeight: '44px' }} // 44px touch target
            aria-label={item.label}
          >
            <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-orange-500 scale-110' : 'text-zinc-500'}`} />
            <span className={`text-[9px] mt-1 font-bold ${isActive ? 'text-white' : 'text-zinc-500'}`}>
              {item.label}
            </span>
            {item.id === 'notifications' && (
              <span className="absolute top-1 right-2 bg-orange-500 w-1.5 h-1.5 rounded-full animate-ping" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
