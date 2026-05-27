import React, { useMemo, useState } from 'react';
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
import { getReminders, saveReminders } from '../db/mockDb';

export default function Dashboard({ members, payments, setPage }) {
  const [reminders, setReminders] = useState(() => getReminders());
  const [triggerStatus, setTriggerStatus] = useState('');

  // 1. Compute summary metrics dynamically
  const metrics = useMemo(() => {
    const total = members.length;
    const active = members.filter(m => m.status === 'Active').length;
    
    // Expiring soon: ending date is within the next 15 days, and member is active
    const today = new Date('2026-05-27');
    const fifteenDaysFromNow = new Date('2026-05-27');
    fifteenDaysFromNow.setDate(today.getDate() + 15);
    
    const expiringSoon = members.filter(m => {
      if (m.status !== 'Active') return false;
      const endDate = new Date(m.endDate);
      return endDate >= today && endDate <= fifteenDaysFromNow;
    }).length;

    // Pending payments
    const pendingPayments = members.filter(m => m.paymentStatus === 'Pending').length;

    // Today's Renewals: members whose membership ends today or has been renewed today
    const todaysRenewals = members.filter(m => {
      const todayStr = '2026-05-27';
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

  // 2. Compute Reminder Statistics
  const reminderStats = useMemo(() => {
    const sent = reminders.filter(r => r.status === 'Sent').length;
    const failed = reminders.filter(r => r.status === 'Failed').length;
    const pending = reminders.filter(r => r.status === 'Pending').length;
    return { sent, failed, pending };
  }, [reminders]);

  // 3. Automated Expiry Reminders Scheduling Action (Scans 1, 3, and 5 days before expiry)
  const handleTriggerReminders = () => {
    setTriggerStatus('Scanning database for expiring memberships...');
    
    setTimeout(() => {
      const today = new Date('2026-05-27');
      const currentList = [...reminders];
      let newDispatches = 0;
      let duplicatesSkipped = 0;

      // Scan day intervals: 1, 3, 5 days before expiry
      const targetIntervals = [1, 3, 5];

      members.forEach(member => {
        if (member.status !== 'Active') return;

        const endDate = new Date(member.endDate);
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (targetIntervals.includes(diffDays)) {
          // Send alerts via BOTH channels: WhatsApp and SMS
          const channels = ['WhatsApp', 'SMS'];
          
          channels.forEach(channel => {
            // Check if reminder was already sent to this member via this channel today to avoid duplicates
            const alreadySentToday = currentList.some(r => 
              (r.phone === member.phone || r.phone === "+91 9487817301") && 
              r.date === '2026-05-27' && 
              r.type === channel &&
              r.message.includes(member.fullName) &&
              (r.message.includes(`expires in 5 day(s)`) || r.message.includes(`expires in 3 day(s)`) || r.message.includes(`expires in 1 day(s)`))
            );

            if (alreadySentToday) {
              duplicatesSkipped++;
              return;
            }

            // Construct exact template matching requirements
            let reminderMessage = '';
            if (diffDays === 5) {
              reminderMessage = `Hello ${member.fullName}, your Phoenix Gym membership expires in 5 day(s). Please renew your membership to continue uninterrupted access. Don't break your workout streak!`;
            } else if (diffDays === 3) {
              reminderMessage = `Hello ${member.fullName}, your Phoenix Gym membership expires in 3 day(s). Please renew your membership to continue uninterrupted access. Early renewals keep your fitness routine on track!`;
            } else {
              reminderMessage = `Hello ${member.fullName}, your Phoenix Gym membership expires in 1 day(s). Please renew your membership to continue uninterrupted access. Secure your slot to avoid lockout!`;
            }

            // Log in mock db ledger
            const newLog = {
              id: `REM-${101 + currentList.length}`,
              clientName: member.fullName,
              phone: "+91 9487817301", // force use target test number
              date: "2026-05-27",
              type: channel,
              status: "Sent",
              message: reminderMessage
            };

            currentList.unshift(newLog);
            newDispatches++;
          });
        }
      });

      if (newDispatches > 0) {
        setReminders(currentList);
        saveReminders(currentList);
        setTriggerStatus(`Dispatched ${newDispatches} alerts (WhatsApp & SMS) to registered test numbers successfully!`);
      } else if (duplicatesSkipped > 0) {
        setTriggerStatus(`All reminders for today were already sent. (${duplicatesSkipped} checks skipped to prevent duplicates)`);
      } else {
        setTriggerStatus('No members found expiring in exactly 1, 3, or 5 days.');
      }

      setTimeout(() => setTriggerStatus(''), 4000);
    }, 1000);
  };

  return (
    <div className="w-full max-w-full p-4 md:p-8 space-y-4 md:space-y-8 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-80px)] md:max-h-[calc(100vh-80px)] bg-[#030303]">
      {/* Real-time Dashboard Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
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
      <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-900 space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-wider">Quick Actions Console</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <button
            onClick={() => setPage('add-member')}
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl hover:border-red-500/40 hover:bg-zinc-900/50 transition-all cursor-pointer group"
          >
            <Plus className="w-5 h-5 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-semibold text-white">Add Member</span>
          </button>

          <button
            onClick={() => setPage('payments')}
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl hover:border-red-500/40 hover:bg-zinc-900/50 transition-all cursor-pointer group"
          >
            <IndianRupee className="w-5 h-5 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-semibold text-white">Renew Fees</span>
          </button>

          <button
            onClick={handleTriggerReminders}
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl hover:border-red-500/40 hover:bg-zinc-900/50 transition-all cursor-pointer group relative overflow-hidden"
          >
            <Send className="w-5 h-5 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-semibold text-white">Send Alerts</span>
          </button>

          <button
            onClick={() => setPage('reports')}
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-zinc-950/80 border border-zinc-900 rounded-xl hover:border-red-500/40 hover:bg-zinc-900/50 transition-all cursor-pointer group"
          >
            <BarChart3 className="w-5 h-5 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-semibold text-white">View Reports</span>
          </button>
        </div>
        {triggerStatus && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold animate-pulse text-center">
            {triggerStatus}
          </div>
        )}
      </div>

      {/* Reminder Dispatch Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Reminder Stats widgets */}
        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-900 flex flex-col justify-between space-y-6">
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1.5">Reminder Logs Monitor</h4>
            <p className="text-[10px] text-zinc-400">Total automated expiration warnings stats</p>
          </div>
          
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-2 sm:p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <span className="text-[8px] font-bold text-zinc-500 uppercase">Sent</span>
              <h5 className="text-sm md:text-base font-extrabold text-white mt-0.5">{reminderStats.sent}</h5>
            </div>
            <div className="p-2 sm:p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-center">
              <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1 animate-pulse" />
              <span className="text-[8px] font-bold text-zinc-500 uppercase">Pending</span>
              <h5 className="text-sm md:text-base font-extrabold text-white mt-0.5">{reminderStats.pending}</h5>
            </div>
            <div className="p-2 sm:p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-center">
              <XCircle className="w-4 h-4 text-rose-500 mx-auto mb-1" />
              <span className="text-[8px] font-bold text-zinc-500 uppercase">Failed</span>
              <h5 className="text-sm md:text-base font-extrabold text-white mt-0.5">{reminderStats.failed}</h5>
            </div>
          </div>

          <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
            <span className="text-[10px] font-bold text-red-400 block mb-1">Target Phone Testing Line</span>
            <p className="text-[10px] text-zinc-400 leading-normal">
              Active test WhatsApp endpoint set to: <code className="text-white font-bold">9487817301</code>
            </p>
          </div>
        </div>

        {/* Recent Reminder Logs Table */}
        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-900 lg:col-span-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4 border-b border-zinc-900 pb-3 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-red-500" />
            Recent WhatsApp Dispatches Logs
          </h4>
          <div className="overflow-y-auto max-h-[180px] space-y-2.5 pr-1">
            {reminders.length > 0 ? (
              reminders.map((log) => (
                <div key={log.id} className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl flex items-center justify-between gap-3 text-[11px]">
                  <div className="min-w-0">
                    <p className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                      {log.clientName}
                      <span className="text-[9px] text-zinc-500 font-semibold">{log.phone}</span>
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1 truncate max-w-[150px] sm:max-w-[320px]">{log.message}</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-900 lg:col-span-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4">Membership Registrations Growth</h4>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[450px] lg:min-w-0">
              <MembershipGrowthChart />
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-zinc-900 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">Member Distribution</h4>
            <p className="text-[10px] text-zinc-400 mb-6">Ratio of active vs inactive members</p>
          </div>
          <div className="flex justify-center items-center py-2">
            <MemberDistributionChart activeCount={metrics.active} inactiveCount={members.length - metrics.active} />
          </div>
        </div>
      </div>
    </div>
  );
}
