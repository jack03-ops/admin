import React, { useMemo } from 'react';
import { 
  Bell, 
  Hourglass, 
  CreditCard, 
  UserPlus, 
  CheckCircle2, 
  MessageSquare,
  AlertTriangle 
} from 'lucide-react';

export default function Notifications({ members, payments, onMarkAsPaid, setPage }) {
  // Compute alerts dynamically from Mock DB
  const alertsList = useMemo(() => {
    const list = [];
    const today = new Date();
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(today.getDate() + 15);

    // 1. Expiring memberships
    members.forEach(m => {
      if (m.status === 'Active') {
        const endDate = new Date(m.endDate);
        if (endDate >= today && endDate <= fifteenDaysFromNow) {
          const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
          list.push({
            id: `exp-${m.id}`,
            type: 'expiration',
            title: 'Membership Expiring Soon!',
            message: `${m.fullName} (${m.id})'s ${m.plan} plan expires in ${daysLeft} days (${m.endDate}).`,
            member: m,
            severity: 'warning'
          });
        }
      }
    });

    // 2. Pending dues
    members.forEach(m => {
      if (m.paymentStatus === 'Pending') {
        list.push({
          id: `pend-${m.id}`,
          type: 'payment',
          title: 'Pending Dues Outstanding',
          message: `${m.fullName} (${m.id}) has outstanding fee payments for the ${m.plan} plan.`,
          member: m,
          severity: 'danger'
        });
      }
    });

    // 3. New registrations (past 5 days)
    members.forEach(m => {
      list.push({
        id: `new-${m.id}`,
        type: 'join',
        title: 'New Member Registered',
        message: `${m.fullName} enrolled into the system from village ${m.village}.`,
        member: m,
        severity: 'info'
      });
    });

    return list.slice(0, 8); // Top 8 relevant notifications
  }, [members]);

  const handleWhatsAppAlert = (member) => {
    const text = `Hello ${member.fullName}, this is a friendly reminder from Phoenix Fitness Academy that your membership plan (${member.plan}) ends on ${member.endDate}. Please renew on time to avoid interruption!`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${member.phone}&text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Bell className="w-6 h-6 text-red-500" />
          Alert Feed & Action Center
        </h2>
        <p className="text-xs text-slate-400 mt-1">Review critical pending balances, client expirations, and triggers.</p>
      </div>

      <div className="glass-panel rounded-2xl border border-zinc-900 divide-y divide-zinc-900/80 shadow-2xl max-w-4xl">
        {alertsList.length > 0 ? (
          alertsList.map((alert) => {
            const Icon = 
              alert.type === 'expiration' ? Hourglass : 
              alert.type === 'payment' ? CreditCard : 
              UserPlus;
            
            const colorClass = 
              alert.severity === 'danger' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
              alert.severity === 'warning' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
              'bg-blue-500/10 border-blue-500/30 text-blue-400';

            return (
              <div key={alert.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-900/10 transition-colors">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl border shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                      {alert.title}
                      {alert.severity === 'danger' && <span className="bg-rose-500/15 text-rose-400 text-[8px] px-1.5 py-0.5 rounded font-black">CRITICAL</span>}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">{alert.message}</p>
                    <p className="text-[10px] text-slate-600 font-medium mt-1">Contact: {alert.member.phone} • Village: {alert.member.village}</p>
                  </div>
                </div>

                {/* Operations triggers */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {/* WhatsApp prompt */}
                  <button
                    onClick={() => handleWhatsAppAlert(alert.member)}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/25 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                    title="Send alert notice on WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>

                  {/* Quick Fee collector */}
                  {alert.type === 'payment' && (
                    <button
                      onClick={() => {
                        setPage('payments');
                      }}
                      className="px-3 py-1.5 bg-gradient-phoenix hover:opacity-90 text-white rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
                    >
                      Receive Fee
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            No system notifications or pending alerts found. All clear!
          </div>
        )}
      </div>
    </div>
  );
}
