import React, { useMemo, useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Hourglass, 
  AlertTriangle, 
  TrendingUp, 
  IndianRupee,
  Plus,
  RefreshCw,
  Send,
  BarChart3,
  BellRing,
  CheckCircle2,
  XCircle,
  Clock,
  Dumbbell,
  Flame
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { 
  MembershipGrowthChart, 
  MemberDistributionChart 
} from '../components/Charts';
import * as api from '../services/api';

export default function Dashboard({ members, payments, setPage }) {
  const [reminders, setReminders] = useState([]);
  const [triggerStatus, setTriggerStatus] = useState('');

  // Load reminders from API
  useEffect(() => {
    const loadReminders = async () => {
      try {
        const list = await api.getReminders();
        setReminders(list);
      } catch (err) {
        console.error('[Dashboard] Error loading reminders:', err.message);
      }
    };
    loadReminders();
  }, []);

  // Compute summary metrics dynamically
  const metrics = useMemo(() => {
    const total = members.length;
    const active = members.filter(m => m.status === 'Active').length;
    
    // Expiring soon: ending date is within the next 15 days, and member is active
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(today.getDate() + 15);
    
    const expiringSoon = members.filter(m => {
      if (m.status !== 'Active') return false;
      const endDate = new Date(m.endDate);
      return endDate >= today && endDate <= fifteenDaysFromNow;
    }).length;

    // Pending payments
    const pendingPayments = members.filter(m => m.paymentStatus === 'Pending').length;

    // Today's Renewals: members whose membership starts today or has been renewed today
    const todaysRenewals = members.filter(m => {
      const todayStr = new Date().toISOString().split('T')[0];
      return m.startDate === todayStr && m.paymentStatus === 'Paid';
    }).length;

    // Total Revenue
    const revenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      total,
      active,
      expiringSoon,
      pendingPayments,
      todaysRenewals,
      revenue
    };
  }, [members, payments]);

  // Compute Reminder Statistics
  const reminderStats = useMemo(() => {
    const sent = reminders.filter(r => r.status === 'Sent').length;
    const failed = reminders.filter(r => r.status === 'Failed').length;
    const pending = reminders.filter(r => r.status === 'Pending').length;
    return { sent, failed, pending };
  }, [reminders]);

  // Automated Expiry Reminders Scheduling Action (Delegated to API)
  const handleTriggerReminders = async () => {
    setTriggerStatus('Scanning database for expiring memberships...');
    try {
      const res = await api.triggerReminders();
      const list = await api.getReminders();
      setReminders(list);
      setTriggerStatus(res.message || `Dispatched ${res.dispatched || 0} reminders successfully.`);
    } catch (err) {
      setTriggerStatus(`Error executing scan: ${err.message}`);
    }
    setTimeout(() => setTriggerStatus(''), 5000);
  };

  return (
    <div className="w-full max-w-full p-8 space-y-8 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-80px)] bg-[#030303]">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-zinc-950 to-zinc-900 p-8 rounded-3xl border border-zinc-900 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-red-600/5 blur-[80px] animate-pulse-glow" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white m-0 tracking-tight flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-red-500" />
            Phoenix Fitness Academy Core
          </h2>
          <p className="text-xs text-zinc-400 max-w-lg">
            Monitor real-time subscription telemetry, outstanding dues alerts, and automate direct WhatsApp reminders.
          </p>
        </div>
        <button 
          onClick={() => setPage('add-member')}
          className="mt-4 md:mt-0 px-5 py-3 bg-gradient-to-r from-red-650 to-red-500 hover:from-red-500 hover:to-rose-450 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Real-time Dashboard Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Members" 
          value={metrics.active} 
          icon={UserCheck} 
          trend="+12%" 
          trendType="up"
          glowColor="red"
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
          title="Payments Pending" 
          value={metrics.pendingPayments} 
          icon={AlertTriangle} 
          trend="Invoices Outstanding" 
          trendType="down"
          glowColor="default"
        />
        <StatCard 
          title="Today's Renewals" 
          value={metrics.todaysRenewals} 
          icon={RefreshCw} 
          trend="Active Subscriptions" 
          trendType="up"
          glowColor="cyan"
        />
      </div>

      {/* Quick Action buttons panel */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-wider">Quick Actions Console</h3>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <button
            onClick={() => setPage('add-member')}
            className="flex flex-col items-center justify-center p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl hover:border-red-500/40 hover:bg-zinc-900/50 transition-all cursor-pointer group"
          >
            <Plus className="w-6 h-6 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-white">Add Member</span>
          </button>

          <button
            onClick={() => setPage('payments')}
            className="flex flex-col items-center justify-center p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl hover:border-red-500/40 hover:bg-zinc-900/50 transition-all cursor-pointer group"
          >
            <IndianRupee className="w-6 h-6 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-white">Renew Membership</span>
          </button>

          <button
            onClick={handleTriggerReminders}
            className="flex flex-col items-center justify-center p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl hover:border-red-500/40 hover:bg-zinc-900/50 transition-all cursor-pointer group relative overflow-hidden"
          >
            <Send className="w-6 h-6 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-white">Send Reminders</span>
          </button>

          <button
            onClick={() => setPage('trainers')}
            className="flex flex-col items-center justify-center p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl hover:border-red-500/40 hover:bg-zinc-900/50 transition-all cursor-pointer group"
          >
            <Dumbbell className="w-6 h-6 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-white">Manage Trainers</span>
          </button>

          <button
            onClick={() => setPage('diet-workout')}
            className="flex flex-col items-center justify-center p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl hover:border-red-500/40 hover:bg-zinc-900/50 transition-all cursor-pointer group"
          >
            <Flame className="w-6 h-6 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-white">Diet & Workouts</span>
          </button>

          <button
            onClick={() => setPage('reports')}
            className="flex flex-col items-center justify-center p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl hover:border-red-500/40 hover:bg-zinc-900/50 transition-all cursor-pointer group"
          >
            <BarChart3 className="w-6 h-6 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-white">View Reports</span>
          </button>
        </div>
        {triggerStatus && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold animate-pulse text-center">
            {triggerStatus}
          </div>
        )}
      </div>

      {/* Reminder Dispatch Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reminder Stats widgets */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 flex flex-col justify-between space-y-6">
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1.5">Reminder Logs Monitor</h4>
            <p className="text-[10px] text-zinc-400">Total automated expiration warnings stats</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
              <span className="text-[9px] font-bold text-zinc-500 uppercase">Sent</span>
              <h5 className="text-base font-extrabold text-white mt-0.5">{reminderStats.sent}</h5>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-center">
              <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1.5 animate-pulse" />
              <span className="text-[9px] font-bold text-zinc-500 uppercase">Pending</span>
              <h5 className="text-base font-extrabold text-white mt-0.5">{reminderStats.pending}</h5>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-center">
              <XCircle className="w-5 h-5 text-rose-500 mx-auto mb-1.5" />
              <span className="text-[9px] font-bold text-zinc-500 uppercase">Failed</span>
              <h5 className="text-base font-extrabold text-white mt-0.5">{reminderStats.failed}</h5>
            </div>
          </div>

          <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
            <span className="text-[10px] font-bold text-red-400 block mb-1">Target Phone Testing Line</span>
            <p className="text-[10px] text-zinc-400 leading-normal">
              Active test WhatsApp endpoint set to: <code className="text-white font-bold">+91 80155 52425</code>
            </p>
          </div>
        </div>

        {/* Recent Reminder Logs Table */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 lg:col-span-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4 border-b border-zinc-900 pb-3 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-red-500" />
            Recent WhatsApp Dispatches Logs
          </h4>
          <div className="overflow-y-auto max-h-[180px] space-y-3 pr-1">
            {reminders.length > 0 ? (
              reminders.map((log) => (
                <div key={log.id} className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl flex items-center justify-between gap-4 text-[11px]">
                  <div className="min-w-0">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      {log.clientName}
                      <span className="text-[9px] text-zinc-500 font-semibold">{log.phone}</span>
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1 truncate max-w-[320px]">{log.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {log.status}
                    </span>
                    <p className="text-[9px] text-zinc-500 font-semibold mt-1">{log.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 text-center py-8">No expiration alerts logged yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 lg:col-span-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">Membership Registrations Growth</h4>
          <MembershipGrowthChart />
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">Member Distribution</h4>
            <p className="text-[10px] text-zinc-400 mb-6">Ratio of active vs inactive members</p>
          </div>
          <MemberDistributionChart activeCount={metrics.active} inactiveCount={members.length - metrics.active} />
        </div>
      </div>
    </div>
  );
}
