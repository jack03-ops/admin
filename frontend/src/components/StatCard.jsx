import React from 'react';

export default function StatCard({ title, value, icon: Icon, trend, trendType, glowColor }) {
  const glowClasses = {
    orange: 'glass-panel-glow-orange hover:shadow-orange-950/20',
    cyan: 'glass-panel-glow-cyan hover:shadow-cyan-950/20',
    default: 'glass-panel hover:bg-slate-900/40'
  };

  const selectedGlow = glowClasses[glowColor] || glowClasses.default;

  return (
    <div className={`p-6 rounded-2xl transition-all duration-300 ${selectedGlow}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${
          glowColor === 'orange' ? 'bg-orange-500/10 text-orange-400' : 
          glowColor === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' : 
          'bg-slate-800 text-slate-300'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            trendType === 'up' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
          }`}>
            {trend}
          </span>
          <span className="text-[10px] font-medium text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
}
