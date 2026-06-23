import React from 'react';

export default function StatCard({ title, value, icon: Icon, trend, trendType, glowColor }) {
  const glowClasses = {
    red: 'glass-panel border-red-200 hover:shadow-red-500/10',
    cyan: 'glass-panel border-emerald-200 hover:shadow-emerald-500/10',
    default: 'glass-panel hover:shadow-lg'
  };

  const selectedGlow = glowClasses[glowColor] || glowClasses.default;

  return (
    <div className={`p-4 md:p-5 rounded-2xl transition-all duration-300 ${selectedGlow}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-zinc-500">{title}</p>
          <h3 className="text-2xl md:text-3xl font-black text-zinc-900 mt-1 md:mt-2 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl shrink-0 ${
          glowColor === 'red' ? 'bg-red-550/10 text-red-500' : 
          glowColor === 'cyan' ? 'bg-emerald-550/10 text-emerald-600' : 
          'bg-orange-500/10 text-[#FF5F1F]'
        }`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 md:mt-4 flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            trendType === 'up' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-500'
          }`}>
            {trend}
          </span>
          <span className="text-[9px] font-bold text-zinc-400">vs last month</span>
        </div>
      )}
    </div>
  );
}
