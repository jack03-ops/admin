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
  Dumbbell
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
  const [whatsappConfig, setWhatsappConfig] = useState({
    testMode: true,
    testRecipient: '+91 94878 17301',
    senderPhoneId: 'Not Loaded',
    hasToken: false,
    templateName: ''
  });

  // Load reminders and WhatsApp config from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [list, config] = await Promise.all([
          api.getReminders(),
          api.getNotificationConfig()
        ]);
        setReminders(list);
        setWhatsappConfig(config);
      } catch (err) {
        console.error('[Dashboard] Error loading data:', err.message);
      }
    };
    loadData();
  }, []);

  // Compute summary metrics dynamically
  const metrics = useMemo(() => {
    const total = members.length;
    const active = members.filter(m => m.status === 'Active').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(today.getDate() + 15);
    
    const expiringSoon = members.filter(m => {
      if (m.status !== 'Active') return false;
      const endDate = new Date(m.endDate);
      return endDate >= today && endDate <= fifteenDaysFromNow;
    }).length;

    const pendingPayments = members.filter(m => m.paymentStatus === 'Pending').length;

    const todaysRenewals = members.filter(m => {
      const todayStr = new Date().toISOString().split('T')[0];
      return m.startDate === todayStr && m.paymentStatus === 'Paid';
    }).length;

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
    <div className="w-full max-w-full p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-80px)] bg-[#111111]">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-zinc-950 to-zinc-900 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-orange-600/5 blur-[80px] animate-pulse-glow" />
        <div className="space-y-1.5 md:space-y-2">
          <h2 className="text-xl md:text-2xl font-black text-white m-0 tracking-tight flex items-center gap-2">
            <Dumbbell className="w-5 h-5 md:w-6 md:h-6 text-[#FF5F1F]" />
            Phoenix Fitness Academy Core
          </h2>
          <p className="text-[11px] md:text-xs text-zinc-400 max-w-lg leading-relaxed">
            Monitor real-time subscription telemetry, outstanding dues alerts, and automate direct WhatsApp reminders.
          </p>
        </div>
        <button 
          onClick={() => setPage('add-member')}
          className="mt-4 md:mt-0 px-4 md:px-5 py-2.5 md:py-3 bg-gradient-phoenix hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer border-none shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Real-time Dashboard Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Active Members" 
          value={metrics.active} 
          icon={UserCheck} 
          trend="+12%" 
          trendType="up"
          glowColor="cyan"
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
          glowColor="red"
        />
        <StatCard 
          title="Today's Renewals" 
          value={metrics.todaysRenewals} 
          icon={RefreshCw} 
          trend="Active Subscriptions" 
          trendType="up"
          glowColor="default"
        />
      </div>

      {/* Quick Action buttons panel */}
      <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200/60 space-y-4">
        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Quick Actions Console</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <button
            onClick={() => setPage('add-member')}
            className="flex flex-col items-center justify-center p-3 md:p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl hover:border-[#FF5F1F]/40 hover:bg-zinc-100/50 transition-all cursor-pointer group border-solid"
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6 text-[#FF5F1F] mb-1.5 md:mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] md:text-xs font-semibold text-zinc-800">Add Member</span>
          </button>

          <button
            onClick={() => setPage('payments')}
            className="flex flex-col items-center justify-center p-3 md:p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl hover:border-[#FF5F1F]/40 hover:bg-zinc-100/50 transition-all cursor-pointer group border-solid"
          >
            <IndianRupee className="w-5 h-5 md:w-6 md:h-6 text-[#FF5F1F] mb-1.5 md:mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] md:text-xs font-semibold text-zinc-800">Renew Membership</span>
          </button>

          <button
            onClick={handleTriggerReminders}
            className="flex flex-col items-center justify-center p-3 md:p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl hover:border-[#FF5F1F]/40 hover:bg-zinc-100/50 transition-all cursor-pointer group border-solid"
          >
            <Send className="w-5 h-5 md:w-6 md:h-6 text-[#FF5F1F] mb-1.5 md:mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] md:text-xs font-semibold text-zinc-800">Send Reminders</span>
          </button>

          <button
            onClick={() => setPage('trainers')}
            className="flex flex-col items-center justify-center p-3 md:p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl hover:border-[#FF5F1F]/40 hover:bg-zinc-100/50 transition-all cursor-pointer group border-solid"
          >
            <Dumbbell className="w-5 h-5 md:w-6 md:h-6 text-[#FF5F1F] mb-1.5 md:mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] md:text-xs font-semibold text-zinc-800">Manage Trainers</span>
          </button>

          <button
            onClick={() => setPage('reports')}
            className="flex flex-col items-center justify-center p-3 md:p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl hover:border-[#FF5F1F]/40 hover:bg-zinc-100/50 transition-all cursor-pointer group border-solid col-span-2 md:col-span-1"
          >
            <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-[#FF5F1F] mb-1.5 md:mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] md:text-xs font-semibold text-zinc-800">View Reports</span>
          </button>
        </div>
        {triggerStatus && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-[#FF5F1F] rounded-xl text-xs font-bold animate-pulse text-center">
            {triggerStatus}
          </div>
        )}
      </div>

      {/* Reminder Dispatch Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reminder Stats widgets */}
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200 flex flex-col justify-between space-y-5 md:space-y-6">
          <div>
            <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-1">Reminder Logs Monitor</h4>
            <p className="text-[10px] text-zinc-500">Total automated expiration warnings stats</p>
          </div>
          
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-2.5 bg-zinc-50 border border-zinc-200/60 rounded-xl text-center">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 mx-auto mb-1" />
              <span className="text-[9px] font-bold text-zinc-500 uppercase block">Sent</span>
              <h5 className="text-sm md:text-base font-extrabold text-zinc-850 mt-0.5">{reminderStats.sent}</h5>
            </div>
            <div className="p-2.5 bg-zinc-50 border border-zinc-200/60 rounded-xl text-center">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-amber-500 mx-auto mb-1 animate-pulse" />
              <span className="text-[9px] font-bold text-zinc-500 uppercase block">Pending</span>
              <h5 className="text-sm md:text-base font-extrabold text-zinc-850 mt-0.5">{reminderStats.pending}</h5>
            </div>
            <div className="p-2.5 bg-zinc-50 border border-zinc-200/60 rounded-xl text-center">
              <XCircle className="w-4 h-4 md:w-5 md:h-5 text-rose-500 mx-auto mb-1" />
              <span className="text-[9px] font-bold text-zinc-500 uppercase block">Failed</span>
              <h5 className="text-sm md:text-base font-extrabold text-zinc-850 mt-0.5">{reminderStats.failed}</h5>
            </div>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-zinc-900 uppercase tracking-wider">WhatsApp Integration</span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                whatsappConfig.hasToken 
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              }`}>
                {whatsappConfig.hasToken ? 'Connected' : 'Offline / Mock'}
              </span>
            </div>

            <div className="text-[10px] text-zinc-650 space-y-1.5 leading-normal">
              <div className="flex justify-between">
                <span>Delivery Mode:</span>
                <span className={`font-bold ${whatsappConfig.testMode ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {whatsappConfig.testMode ? '⚠️ TEST MODE' : '🚀 LIVE MODE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Active Target:</span>
                <code className="text-zinc-900 font-semibold bg-zinc-200/60 px-1 rounded">
                  {whatsappConfig.testMode ? whatsappConfig.testRecipient : 'Gym Member\'s Phone'}
                </code>
              </div>
              <div className="flex justify-between">
                <span>Sender Phone ID:</span>
                <code className="text-zinc-800 font-medium">{whatsappConfig.senderPhoneId}</code>
              </div>
              <div className="flex justify-between text-right">
                <span>Template Alert:</span>
                <span className="text-zinc-800 font-medium truncate max-w-[130px]">{whatsappConfig.templateName}</span>
              </div>
            </div>
            
            <div className="text-[9px] text-zinc-500 border-t border-zinc-200 pt-2 leading-relaxed">
              {whatsappConfig.testMode ? (
                <span>All automated notifications are forwarded to your test number to prevent accidental client spam. To go live, set <code className="text-zinc-800 font-bold">WHATSAPP_TEST_MODE=false</code>.</span>
              ) : (
                <span>System is LIVE! Alerts will go directly to members' registered WhatsApp/phone numbers.</span>
              )}
            </div>
          </div>
        </div>

        {/* Recent Reminder Logs Table */}
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200 lg:col-span-2 flex flex-col">
          <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-200 pb-3 flex items-center gap-2 border-solid">
            <BellRing className="w-4 h-4 text-[#FF5F1F]" />
            Recent WhatsApp Dispatches Logs
          </h4>
          <div className="overflow-y-auto max-h-[220px] space-y-3 pr-1 flex-1">
            {reminders.length > 0 ? (
              reminders.map((log) => (
                <div key={log.id} className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-xl flex items-center justify-between gap-4 text-[11px]">
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-850 flex items-center gap-1.5">
                      {log.clientName}
                      <span className="text-[9px] text-zinc-500 font-semibold">{log.phone}</span>
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1 truncate max-w-[280px] md:max-w-[320px]">{log.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/25">
                      {log.status}
                    </span>
                    <p className="text-[9px] text-zinc-550 mt-1">{log.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 text-center py-12">No expiration alerts logged yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200 lg:col-span-2">
          <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-4">Membership Registrations Growth</h4>
          <MembershipGrowthChart />
        </div>

        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-2">Member Distribution</h4>
            <p className="text-[10px] text-zinc-500 mb-6">Ratio of active vs inactive members</p>
          </div>
          <MemberDistributionChart activeCount={metrics.active} inactiveCount={members.length - metrics.active} />
        </div>
      </div>
    </div>
  );
}
