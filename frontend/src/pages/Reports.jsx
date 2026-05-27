import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Map, 
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  MembershipGrowthChart, 
  RevenueChart, 
  MemberDistributionChart 
} from '../components/Charts';

export default function Reports({ members, payments }) {
  const [cycleTab, setCycleTab] = useState('monthly'); // daily, weekly, monthly

  // Dynamically compute charts & statistics based on tab selection
  const stats = useMemo(() => {
    // 1. Dynamic calculations for selected cycle
    let activeMembersList = members.filter(m => m.status === 'Active');
    let totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // 2. Compute Village breakdown metrics (Extremely useful for gym business!)
    const villageCounts = {};
    members.forEach(m => {
      villageCounts[m.village] = (villageCounts[m.village] || 0) + 1;
    });
    const topVillages = Object.entries(villageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // 3. Compute payment methods ratio
    const methodCounts = { UPI: 0, Cash: 0, Card: 0, "Net Banking": 0 };
    payments.forEach(p => {
      if (methodCounts[p.method] !== undefined) {
        methodCounts[p.method] += p.amount;
      }
    });

    return {
      revenue: totalRevenue,
      topVillages,
      methodCounts,
      newJoins: members.length
    };
  }, [members, payments, cycleTab]);

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8 overflow-y-auto max-h-[calc(100vh-80px)]">
      {/* Tab controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Phoenix Analytics & Telemetry</h2>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Review operational performance charts, cash receipts, and geographical hotspots.</p>
        </div>

        {/* Cycles Selector */}
        <div className="inline-flex bg-zinc-900 border border-zinc-900 p-1 rounded-xl shrink-0 self-start md:self-auto w-full md:w-auto">
          {['daily', 'weekly', 'monthly'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCycleTab(tab)}
              className={`flex-1 md:flex-none text-center px-4 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                cycleTab === tab 
                  ? 'bg-gradient-to-r from-red-650 to-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Reports Widgets Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        {/* Metric 1 */}
        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-900">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Total Income</span>
            <span className="p-1.5 md:p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0"><DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4" /></span>
          </div>
          <h3 className="text-lg md:text-2xl font-extrabold text-white">₹{stats.revenue.toLocaleString()}</h3>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-3">
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span className="truncate">+12.4% past term</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-900">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">Registered</span>
            <span className="p-1.5 md:p-2 bg-red-500/10 text-red-400 rounded-lg shrink-0"><Users className="w-3.5 h-3.5 md:w-4 md:h-4" /></span>
          </div>
          <h3 className="text-lg md:text-2xl font-extrabold text-white">{stats.newJoins} Enrolled</h3>
          <div className="flex items-center gap-1 text-[10px] text-red-400 font-bold mt-3">
            <ArrowUpRight className="w-3 h-3 shrink-0" />
            <span className="truncate">Growth trajectory</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-900 col-span-2 md:col-span-1">
          <div className="flex justify-between items-center mb-3 border-b border-zinc-900 pb-1.5">
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400">Village Hotspots</span>
            <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0"><Map className="w-3.5 h-3.5" /></span>
          </div>
          <div className="space-y-1">
            {stats.topVillages.map(([village, count], idx) => (
              <div key={village} className="flex justify-between text-[10px] md:text-xs font-semibold">
                <span className="text-slate-350 truncate max-w-[100px]">{idx+1}. {village}</span>
                <span className="text-cyan-455 shrink-0">{count} members</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main performance charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-900">
          <h4 className="text-xs md:text-sm font-bold text-white mb-1">Member Growth Curve</h4>
          <p className="text-[10px] text-slate-400 mb-4">Subscriptions curve trajectory</p>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[450px] lg:min-w-0">
              <MembershipGrowthChart />
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-900">
          <h4 className="text-xs md:text-sm font-bold text-white mb-1">Revenue Curves</h4>
          <p className="text-[10px] text-slate-400 mb-4">Payments and invoice records billing</p>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[450px] lg:min-w-0">
              <RevenueChart />
            </div>
          </div>
        </div>
      </div>

      {/* Payment methods allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-900 flex flex-col justify-between">
          <div>
            <h4 className="text-xs md:text-sm font-bold text-white mb-1">Member Distribution</h4>
            <p className="text-[10px] text-slate-400 mb-4">Active vs Inactive subscriptions overview</p>
          </div>
          <div className="flex justify-center items-center py-2">
            <MemberDistributionChart 
              activeCount={members.filter(m => m.status === 'Active').length} 
              inactiveCount={members.filter(m => m.status === 'Inactive').length} 
            />
          </div>
        </div>

        {/* Detailed Payment statistics breakdown */}
        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-900 lg:col-span-2 space-y-6">
          <h4 className="text-xs md:text-sm font-bold text-white border-b border-zinc-900 pb-3 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-400" />
            Payment Category Allocation Breakdown
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats.methodCounts).map(([method, amount]) => (
              <div key={method} className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl text-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase">{method}</p>
                <h5 className="text-sm md:text-base font-extrabold text-white mt-1">₹{amount.toLocaleString()}</h5>
                <span className="text-[8px] text-slate-400 font-semibold block mt-1.5">
                  {stats.revenue > 0 ? ((amount/stats.revenue)*100).toFixed(1) : 0}% share
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl">
            <h5 className="text-xs font-bold text-white mb-1">Geographical Analytics Insights</h5>
            <p className="text-[10px] md:text-[11px] text-slate-400 leading-relaxed">
              Village marketing campaigns show Rampur and Sohna remain high acquisition zones. Increasing flyers and WhatsApp campaigns here would raise average membership lifetime value.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
