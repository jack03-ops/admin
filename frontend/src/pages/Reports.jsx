import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  IndianRupee, 
  Users, 
  Map, 
  Layers,
  ArrowUpRight,
  Download
} from 'lucide-react';
import { 
  MembershipGrowthChart, 
  RevenueChart, 
  MemberDistributionChart 
} from '../components/Charts';
import { getSettings } from '../db/mockDb';

const filterTabs = [
  { id: '1m', label: '1 Month', min: 1, max: 1 },
  { id: '2m', label: '2 Months', min: 2, max: 2 },
  { id: '3m', label: '3 Months', min: 3, max: 3 },
  { id: '4m', label: '4 Months', min: 4, max: 4 },
  { id: '5m', label: '5 Months', min: 5, max: 5 },
  { id: '6-12m', label: '6-12 Months', min: 6, max: 12 },
  { id: '1y', label: '1 Year', min: 12, max: 12 },
  { id: '2y', label: '2 Years', min: 24, max: 24 },
  { id: '12y', label: '12 Years', min: 144, max: 144 }
];

const getPlanDurationMonths = (planName, plans) => {
  const found = plans?.find(p => p.name.toLowerCase() === String(planName).toLowerCase());
  if (found) return found.durationMonths;
  
  const name = String(planName).toLowerCase();
  if (name.includes('monthly') || name.includes('1 month')) return 1;
  if (name.includes('2 month')) return 2;
  if (name.includes('quarterly') || name.includes('3 month') || name.includes('3-month')) return 3;
  if (name.includes('4 month')) return 4;
  if (name.includes('5 month')) return 5;
  if (name.includes('half-yearly') || name.includes('6 month') || name.includes('6-month')) return 6;
  if (name.includes('yearly') || name.includes('12 month') || name.includes('1 year')) return 12;
  if (name.includes('2 year')) return 24;
  if (name.includes('12 year')) return 144;
  
  const digitMatch = name.match(/(\d+)\s*(month|year)/);
  if (digitMatch) {
    const val = parseInt(digitMatch[1], 10);
    const unit = digitMatch[2];
    return unit.startsWith('year') ? val * 12 : val;
  }
  return 1;
};

export default function Reports({ members, payments }) {
  const [cycleTab, setCycleTab] = useState('1m');

  const settings = useMemo(() => {
    try {
      const data = localStorage.getItem('phoenix_gym_settings');
      return data ? JSON.parse(data) : getSettings();
    } catch (e) {
      return getSettings();
    }
  }, []);

  const activeTabConfig = useMemo(() => {
    return filterTabs.find(t => t.id === cycleTab) || filterTabs[0];
  }, [cycleTab]);

  // Export CSV Helper Functions
  const handleExportMembersCSV = () => {
    const headers = ['Member ID', 'Full Name', 'Phone', 'Whatsapp', 'Village', 'Gender', 'Age', 'Plan', 'Start Date', 'End Date', 'Payment Status', 'Status', 'Personal Trainer'];
    const rows = members.map(m => [
      m.id,
      m.fullName,
      m.phone,
      m.whatsapp || '',
      m.village,
      m.gender,
      m.age,
      m.plan,
      m.startDate,
      m.endDate,
      m.paymentStatus,
      m.status,
      m.personalTrainerOption ? 'Yes' : 'No'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Phoenix_Gym_Members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPaymentsCSV = () => {
    const headers = ['Receipt ID', 'Member ID', 'Client Name', 'Amount (₹)', 'Payment Method', 'Plan', 'Transaction Date'];
    const rows = payments.map(p => [
      p.id,
      p.clientId,
      p.clientName,
      p.amount,
      p.method,
      p.plan,
      p.date
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Phoenix_Gym_Payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute stats according to filters
  const stats = useMemo(() => {
    const plans = settings.membershipPlans;
    const filteredMembers = members.filter(m => {
      const dur = getPlanDurationMonths(m.plan, plans);
      return dur >= activeTabConfig.min && dur <= activeTabConfig.max;
    });

    // Filter payments matching current tab duration
    const filteredPayments = payments.filter(p => {
      const dur = getPlanDurationMonths(p.plan, plans);
      return dur >= activeTabConfig.min && dur <= activeTabConfig.max;
    });

    let totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

    // Compute Village breakdown metrics
    const villageCounts = {};
    filteredMembers.forEach(m => {
      villageCounts[m.village] = (villageCounts[m.village] || 0) + 1;
    });
    const topVillages = Object.entries(villageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Compute payment methods ratio
    const methodCounts = { UPI: 0, Cash: 0, Card: 0, "Net Banking": 0 };
    filteredPayments.forEach(p => {
      if (methodCounts[p.method] !== undefined) {
        methodCounts[p.method] += p.amount;
      }
    });

    return {
      revenue: totalRevenue,
      topVillages,
      methodCounts,
      newJoins: filteredMembers.length
    };
  }, [members, payments, activeTabConfig, settings]);

  const growthChartData = useMemo(() => {
    const plans = settings.membershipPlans;
    const filteredMembers = members.filter(m => {
      const dur = getPlanDurationMonths(m.plan, plans);
      return dur >= activeTabConfig.min && dur <= activeTabConfig.max;
    });

    const months = [];
    const counts = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      months.push(label);
      
      const count = filteredMembers.filter(m => {
        if (!m.joiningDate) return false;
        const jd = new Date(m.joiningDate);
        return jd.getMonth() === d.getMonth() && jd.getFullYear() === d.getFullYear();
      }).length;
      counts.push(count);
    }

    return { labels: months, dataValues: counts };
  }, [members, activeTabConfig, settings]);

  const revenueChartData = useMemo(() => {
    const plans = settings.membershipPlans;
    const filteredPayments = payments.filter(p => {
      const dur = getPlanDurationMonths(p.plan, plans);
      return dur >= activeTabConfig.min && dur <= activeTabConfig.max;
    });

    const months = [];
    const amounts = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      months.push(label);
      
      const total = filteredPayments.filter(p => {
        if (!p.date) return false;
        const pd = new Date(p.date);
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
      }).reduce((sum, p) => sum + p.amount, 0);
      amounts.push(total);
    }

    return { labels: months, dataValues: amounts };
  }, [payments, activeTabConfig, settings]);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto max-h-[calc(100vh-80px)] bg-[#111111]">
      {/* Tab controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-zinc-800 pb-5 border-solid">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Phoenix Analytics & Telemetry</h2>
          <p className="text-xs text-zinc-400 mt-1">Review operational performance charts, cash receipts, and geographical hotspots.</p>
        </div>

        {/* Swipeable Cycles Selector */}
        <div className="flex overflow-x-auto gap-2 pb-2 max-w-full scrollbar-none scroll-smooth shrink-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCycleTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                cycleTab === tab.id 
                  ? 'bg-gradient-phoenix text-white shadow-md shadow-orange-950/25 border-none'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-450 hover:text-white border-solid'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Reports Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Total Income generated</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg"><IndianRupee className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-black text-zinc-900">₹{stats.revenue.toLocaleString()}</h3>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-4">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active target segment billing</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Net Enrolled Members</span>
            <span className="p-2 bg-orange-500/10 text-[#FF5F1F] rounded-lg"><Users className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-black text-zinc-900">{stats.newJoins} Registered</h3>
          <div className="flex items-center gap-1.5 text-xs text-[#FF5F1F] font-bold mt-4">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Active growth coefficient</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Top Village Hotspots</span>
            <span className="p-2 bg-orange-550/10 text-[#FF5F1F] rounded-lg"><Map className="w-4 h-4" /></span>
          </div>
          <div className="space-y-1.5 mt-2">
            {stats.topVillages.length > 0 ? (
              stats.topVillages.map(([village, count], idx) => (
                <div key={village} className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-650">{idx+1}. {village}</span>
                  <span className="text-[#FF5F1F] font-bold">{count} Members</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-450 py-1">No hotspots in segment.</p>
            )}
          </div>
        </div>
      </div>

      {/* Data Export Console */}
      <div className="glass-panel p-5 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <Download className="w-4 h-4 text-[#FF5F1F]" />
            System Database Export Utility
          </h4>
          <p className="text-[10px] text-zinc-500 mt-0.5">Export members listing or financial ledger entries directly into spreadsheet format.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportMembersCSV}
            className="flex-1 sm:flex-none px-4 py-2 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all border-solid"
            title="Download members roster in CSV format"
          >
            <Download className="w-3.5 h-3.5 text-[#FF5F1F]" /> Members Roster (.csv)
          </button>
          <button
            onClick={handleExportPaymentsCSV}
            className="flex-1 sm:flex-none px-4 py-2 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all border-solid"
            title="Download payment records in CSV format"
          >
            <Download className="w-3.5 h-3.5 text-[#FF5F1F]" /> Billing Ledger (.csv)
          </button>
        </div>
      </div>

      {/* Main performance charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200">
          <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-1">Member Growth Curve</h4>
          <p className="text-[10px] text-zinc-450 mb-6">Subscriptions curve trajectory</p>
          <MembershipGrowthChart dataValues={growthChartData.dataValues} labels={growthChartData.labels} />
        </div>

        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200">
          <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-1">Revenue Curves</h4>
          <p className="text-[10px] text-zinc-450 mb-6">Payments and invoice records billing</p>
          <RevenueChart dataValues={revenueChartData.dataValues} labels={revenueChartData.labels} />
        </div>
      </div>

      {/* Payment methods allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-1">Member Distribution</h4>
            <p className="text-[10px] text-zinc-450 mb-6">Active vs Inactive subscriptions overview</p>
          </div>
          <MemberDistributionChart 
            activeCount={members.filter(m => m.status === 'Active').length} 
            inactiveCount={members.filter(m => m.status === 'Inactive').length} 
          />
        </div>

        {/* Detailed Payment statistics breakdown */}
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200 lg:col-span-2 space-y-6">
          <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-200 pb-3 flex items-center gap-2 border-solid">
            <Layers className="w-4 h-4 text-[#FF5F1F]" />
            Payment Category Allocation Breakdown
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(stats.methodCounts).map(([method, amount]) => (
              <div key={method} className="p-3 bg-zinc-50 border border-zinc-250 rounded-xl text-center border-solid">
                <p className="text-[9px] font-bold text-zinc-500 uppercase">{method}</p>
                <h5 className="text-base font-extrabold text-zinc-900 mt-1">₹{amount.toLocaleString()}</h5>
                <span className="text-[9px] text-zinc-500 font-semibold block mt-1.5">
                  {stats.revenue > 0 ? ((amount/stats.revenue)*100).toFixed(1) : 0}% share
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl border-solid">
            <h5 className="text-xs font-bold text-zinc-800 mb-1">Geographical Analytics Insights</h5>
            <p className="text-[11px] text-zinc-650 leading-relaxed">
              Village marketing campaigns show Rampur and Sohna remain high acquisition zones. Increasing flyers and WhatsApp campaigns here would raise average membership lifetime value.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
