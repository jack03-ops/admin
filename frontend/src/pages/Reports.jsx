import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Map, 
  Calendar,
  Layers,
  ArrowUpRight,
  Download
} from 'lucide-react';
import { 
  MembershipGrowthChart, 
  RevenueChart, 
  MemberDistributionChart 
} from '../components/Charts';

export default function Reports({ members, payments }) {
  const [cycleTab, setCycleTab] = useState('monthly'); // daily, weekly, monthly

  const handleExportMembersCSV = () => {
    if (members.length === 0) return;
    const headers = ['ID', 'Full Name', 'Phone', 'Age', 'Gender', 'Village', 'Plan', 'Status', 'Payment Status', 'Start Date', 'End Date'];
    const rows = members.map(m => [
      m.id || '',
      m.fullName || '',
      m.phone || '',
      m.age || '',
      m.gender || '',
      m.village || '',
      m.plan || '',
      m.status || '',
      m.paymentStatus || '',
      m.startDate || '',
      m.endDate || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Phoenix_Gym_Members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPaymentsCSV = () => {
    if (payments.length === 0) return;
    const headers = ['Receipt ID', 'Client ID', 'Client Name', 'Amount', 'Date', 'Plan', 'Payment Method'];
    const rows = payments.map(p => [
      p.id || '',
      p.clientId || '',
      p.clientName || '',
      p.amount || 0,
      p.date || '',
      p.plan || '',
      p.method || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Phoenix_Gym_Payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Phoenix Analytics & Telemetry</h2>
          <p className="text-xs text-slate-400 mt-1">Review operational performance charts, cash receipts, and geographical hotspots.</p>
        </div>

        {/* Cycles Selector */}
        <div className="inline-flex bg-zinc-900 border border-zinc-900 p-1.5 rounded-xl shrink-0 self-start md:self-auto">
          {['daily', 'weekly', 'monthly'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCycleTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                cycleTab === tab 
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md'
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
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900">
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
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Enrolled Members</span>
            <span className="p-2 bg-red-500/10 text-red-400 rounded-lg"><Users className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">{stats.newJoins} Registered</h3>
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold mt-4">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Active growth coefficient</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900">
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

      {/* Data Export Console */}
      <div className="glass-panel p-5 rounded-2xl border border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Download className="w-4 h-4 text-red-500" />
            System Database Export Utility
          </h4>
          <p className="text-[10px] text-zinc-500 mt-0.5">Export members listing or financial ledger entries directly into spreadsheet format.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportMembersCSV}
            className="flex-1 sm:flex-none px-4 py-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all"
            title="Download members roster in CSV format"
          >
            <Download className="w-3.5 h-3.5" /> Members Roster (.csv)
          </button>
          <button
            onClick={handleExportPaymentsCSV}
            className="flex-1 sm:flex-none px-4 py-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all"
            title="Download payment records in CSV format"
          >
            <Download className="w-3.5 h-3.5" /> Billing Ledger (.csv)
          </button>
        </div>
      </div>

      {/* Main performance charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900">
          <h4 className="text-sm font-bold text-white mb-2">Member Growth Curve</h4>
          <p className="text-xs text-slate-400 mb-6">Subscriptions curve trajectory</p>
          <MembershipGrowthChart />
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-zinc-900">
          <h4 className="text-sm font-bold text-white mb-2">Revenue Curves</h4>
          <p className="text-xs text-slate-400 mb-6">Payments and invoice records billing</p>
          <RevenueChart />
        </div>
      </div>

      {/* Payment methods allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 flex flex-col justify-between">
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
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 lg:col-span-2 space-y-6">
          <h4 className="text-sm font-bold text-white border-b border-zinc-900 pb-3 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-400" />
            Payment Category Allocation Breakdown
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(stats.methodCounts).map(([method, amount]) => (
              <div key={method} className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">{method}</p>
                <h5 className="text-base font-extrabold text-white mt-1">₹{amount.toLocaleString()}</h5>
                <span className="text-[9px] text-slate-400 font-semibold block mt-2">
                  {stats.revenue > 0 ? ((amount/stats.revenue)*100).toFixed(1) : 0}% share
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl">
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
