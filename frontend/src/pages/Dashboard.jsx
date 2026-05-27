import React, { useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Hourglass, 
  AlertTriangle, 
  TrendingUp, 
  IndianRupee,
  Plus
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { 
  MembershipGrowthChart, 
  RevenueChart, 
  MemberDistributionChart 
} from '../components/Charts';

export default function Dashboard({ members, payments, setPage }) {
  // Compute summary metrics dynamically
  const metrics = useMemo(() => {
    const total = members.length;
    const active = members.filter(m => m.status === 'Active').length;
    const inactive = members.filter(m => m.status === 'Inactive').length;
    
    // Expiring soon: ending date is within the next 15 days, and member is active
    const today = new Date();
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(today.getDate() + 15);
    
    const expiringSoon = members.filter(m => {
      if (m.status !== 'Active') return false;
      const endDate = new Date(m.endDate);
      return endDate >= today && endDate <= fifteenDaysFromNow;
    }).length;

    // Pending payments
    const pendingPayments = members.filter(m => m.paymentStatus === 'Pending').length;

    // Total Revenue (Sum of all completed payments)
    const revenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      total,
      active,
      inactive,
      expiringSoon,
      pendingPayments,
      revenue
    };
  }, [members, payments]);

  // Recent activities list
  const recentActivities = useMemo(() => {
    const list = [];
    // Last 3 registered members
    const sortedMembers = [...members].sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate));
    sortedMembers.slice(0, 3).forEach(m => {
      list.push({
        id: `reg-${m.id}`,
        type: 'registration',
        text: `New member registered: ${m.fullName} (${m.id}) from ${m.village}`,
        time: m.joiningDate,
        color: 'text-orange-500'
      });
    });

    // Last 3 payments
    const sortedPayments = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));
    sortedPayments.slice(0, 3).forEach(p => {
      list.push({
        id: `pay-${p.id}`,
        type: 'payment',
        text: `Payment of ₹${p.amount} received from ${p.clientName} via ${p.method}`,
        time: p.date,
        color: 'text-cyan-500'
      });
    });

    // Sort combined activities by date
    return list.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
  }, [members, payments]);

  return (
    <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-80px)]">
      {/* Welcome Banner */}
      <div className="flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-orange-600/5 blur-[80px] animate-pulse-glow" />
        <div>
          <h2 className="text-2xl font-black text-white m-0 tracking-tight">Phoenix Fitness Club Metrics</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-lg">
            Monitor real-time fitness subscriptions, pending payment alerts, custom villages analytics, and active plans.
          </p>
        </div>
        <button 
          onClick={() => setPage('add-member')}
          className="px-5 py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-sm font-semibold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Members" 
          value={metrics.total} 
          icon={Users} 
          trend="+8%" 
          trendType="up"
          glowColor="default"
        />
        <StatCard 
          title="Active Members" 
          value={metrics.active} 
          icon={UserCheck} 
          trend="+12%" 
          trendType="up"
          glowColor="orange"
        />
        <StatCard 
          title="Expiring Soon" 
          value={metrics.expiringSoon} 
          icon={Hourglass} 
          trend="Action Required" 
          trendType="down"
          glowColor="default"
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${metrics.revenue.toLocaleString()}`} 
          icon={IndianRupee} 
          trend="+18%" 
          trendType="up"
          glowColor="cyan"
        />
      </div>

      {/* Minor alerts row */}
      {(metrics.pendingPayments > 0 || metrics.expiringSoon > 0) && (
        <div className="flex gap-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
          <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0" />
          <div className="text-sm text-orange-200">
            <span className="font-bold">System Alerts:</span> You have <span className="font-extrabold text-white">{metrics.pendingPayments} pending payments</span> and <span className="font-extrabold text-white">{metrics.expiringSoon} active subscriptions expiring soon</span>. Check notifications or members list for details.
          </div>
        </div>
      )}

      {/* Charts & Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-base font-bold text-white">Membership Registrations Growth</h4>
              <p className="text-xs text-slate-400 mt-1">Growth trends over the current semester</p>
            </div>
            <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Optimal Growth
            </span>
          </div>
          <MembershipGrowthChart />
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-white mb-2">Member Distribution</h4>
            <p className="text-xs text-slate-400 mb-6">Ratio of active vs inactive members</p>
          </div>
          <MemberDistributionChart activeCount={metrics.active} inactiveCount={metrics.inactive} />
        </div>
      </div>

      {/* Secondary Graphs & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-2">
          <h4 className="text-base font-bold text-white mb-2">Weekly Revenue Trends</h4>
          <p className="text-xs text-slate-400 mb-6">Daily sales & fee acquisitions for current week</p>
          <RevenueChart />
        </div>

        {/* Recent Activities */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-white mb-2">Recent Activities</h4>
            <p className="text-xs text-slate-400 mb-6">Latest notifications and operations</p>
            
            <div className="space-y-4">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex gap-3 text-xs leading-normal">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-slate-300 font-medium">{act.text}</p>
                    <span className="text-[10px] text-slate-500 font-semibold">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
