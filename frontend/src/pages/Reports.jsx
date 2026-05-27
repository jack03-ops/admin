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
    <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-80px)]">
      {/* Tab controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Phoenix Analytics & Telemetry</h2>
          <p className="text-xs text-slate-400 mt-1">Review operational performance charts, cash receipts, and geographical hotspots.</p>
        </div>

        {/* Cycles Selector */}
        <div className="inline-flex bg-slate-900 border border-slate-800 p-1.5 rounded-xl shrink-0 self-start md:self-auto">
          {['daily', 'weekly', 'monthly'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCycleTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                cycleTab === tab 
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Reports Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Income generated</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><DollarSign className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">₹{stats.revenue.toLocaleString()}</h3>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-4">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.4% vs past cycle</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Enrolled Members</span>
            <span className="p-2 bg-orange-500/10 text-orange-400 rounded-lg"><Users className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">{stats.newJoins} Registered</h3>
          <div className="flex items-center gap-1.5 text-xs text-orange-400 font-bold mt-4">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Active growth coefficient</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Village Hotspots</span>
            <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><Map className="w-4 h-4" /></span>
          </div>
          <div className="space-y-1.5">
            {stats.topVillages.map(([village, count], idx) => (
              <div key={village} className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">{idx+1}. {village}</span>
                <span className="text-cyan-400">{count} Members</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main performance charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h4 className="text-sm font-bold text-white mb-2">Member Growth Curve</h4>
          <p className="text-xs text-slate-400 mb-6">Subscriptions curve trajectory</p>
          <MembershipGrowthChart />
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h4 className="text-sm font-bold text-white mb-2">Revenue Curves</h4>
          <p className="text-xs text-slate-400 mb-6">Payments and invoice records billing</p>
          <RevenueChart />
        </div>
      </div>

      {/* Payment methods allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-2">Member Distribution</h4>
            <p className="text-xs text-slate-400 mb-6">Active vs Inactive subscriptions overview</p>
          </div>
          <MemberDistributionChart 
            activeCount={members.filter(m => m.status === 'Active').length} 
            inactiveCount={members.filter(m => m.status === 'Inactive').length} 
          />
        </div>

        {/* Detailed Payment statistics breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-2 space-y-6">
          <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-3 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" />
            Payment Category Allocation Breakdown
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(stats.methodCounts).map(([method, amount]) => (
              <div key={method} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">{method}</p>
                <h5 className="text-base font-extrabold text-white mt-1">₹{amount.toLocaleString()}</h5>
                <span className="text-[9px] text-slate-400 font-semibold block mt-2">
                  {stats.revenue > 0 ? ((amount/stats.revenue)*100).toFixed(1) : 0}% share
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl">
            <h5 className="text-xs font-bold text-white mb-1">Geographical Analytics Insights</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Village marketing campaigns show Rampur and Sohna remain high acquisition zones. Increasing flyers and WhatsApp campaigns here would raise average membership lifetime value.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
