import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  IndianRupee, 
  Search, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Receipt,
  X
} from 'lucide-react';
import { getSettings } from '../db/mockDb';

export default function Payments({ members, payments, onAddPayment, onMarkAsPaid }) {
  const settings = getSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [invoicePayment, setInvoicePayment] = useState(null);
  const [newPayment, setNewPayment] = useState({
    clientId: '',
    amount: '',
    method: 'UPI',
    plan: 'Monthly'
  });
  
  // Pending members compute
  const pendingMembers = useMemo(() => {
    return members.filter(m => m.paymentStatus === 'Pending');
  }, [members]);

  // Total summary calculations
  const stats = useMemo(() => {
    const totalCollected = payments.reduce((acc, curr) => acc + curr.amount, 0);
    
    // Total pending amount estimation
    const estimatedPending = pendingMembers.reduce((acc, curr) => {
      const planConfig = settings.membershipPlans.find(p => p.name === curr.plan);
      return acc + (planConfig ? planConfig.price : 1000);
    }, 0);

    return {
      collected: totalCollected,
      pendingCount: pendingMembers.length,
      pendingAmount: estimatedPending
    };
  }, [payments, pendingMembers, settings]);

  // Filter transaction list
  const filteredPayments = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return payments;
    return payments.filter(p => 
      p.clientName.toLowerCase().includes(query) || 
      p.clientId.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query)
    );
  }, [payments, searchTerm]);

  const handleAddPaymentSubmit = (e) => {
    e.preventDefault();
    if (!newPayment.clientId || !newPayment.amount) return;

    const memberObj = members.find(m => m.id === newPayment.clientId);
    if (!memberObj) {
      alert('Invalid Client ID. Please select a valid gym member.');
      return;
    }

    onAddPayment({
      clientId: newPayment.clientId,
      clientName: memberObj.fullName,
      amount: Number(newPayment.amount),
      method: newPayment.method,
      plan: newPayment.plan
    });

    setNewPayment({
      clientId: '',
      amount: '',
      method: 'UPI',
      plan: 'Monthly'
    });
    setShowAddForm(false);
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-80px)]">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel-glow-cyan p-6 rounded-2xl border border-zinc-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fees Collected</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">₹{stats.collected.toLocaleString()}</h3>
            </div>
            <div className="bg-cyan-500/10 p-3 rounded-xl text-cyan-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-4 uppercase">Across all historical terms</p>
        </div>

        <div className="glass-panel-glow-red p-6 rounded-2xl border border-zinc-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Pending Dues</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">₹{stats.pendingAmount.toLocaleString()}</h3>
            </div>
            <div className="bg-red-500/10 p-3 rounded-xl text-red-400">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] text-red-400 font-bold mt-4 uppercase">{stats.pendingCount} members pending payment</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 flex flex-col justify-center">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Record Operations</h4>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Manual Billing Receipt
          </button>
        </div>
      </div>

      {/* Manual invoice form panel */}
      {showAddForm && (
        <form onSubmit={handleAddPaymentSubmit} className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-4 max-w-xl">
          <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-zinc-900 pb-3">Bill Payment Receipt</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Gym Client</label>
              <select
                value={newPayment.clientId}
                onChange={(e) => {
                  const m = members.find(item => item.id === e.target.value);
                  const planPrice = settings.membershipPlans.find(p => p.name === m?.plan)?.price || '';
                  setNewPayment(prev => ({ 
                    ...prev, 
                    clientId: e.target.value,
                    plan: m?.plan || 'Monthly',
                    amount: planPrice
                  }));
                }}
                required
                className="w-full px-3 py-2 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Choose Member --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.fullName} ({m.id}) - {m.plan}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fees Amount (₹)</label>
              <input
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                required
                className="w-full px-3 py-2 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                placeholder="2700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Payment Method</label>
              <select
                value={newPayment.method}
                onChange={(e) => setNewPayment(prev => ({ ...prev, method: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="UPI">UPI (PhonePe/GPay)</option>
                <option value="Cash">Cash Handover</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="w-1/2 py-2 bg-zinc-900 border border-zinc-900 text-slate-400 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer"
              >
                Register Bill
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Grid of Pending payments & Transaction log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending lists */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 h-fit">
          <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 border-b border-zinc-900 pb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400" />
            Pending Member Dues
          </h4>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {pendingMembers.length > 0 ? (
              pendingMembers.map((m) => {
                const planPrice = settings.membershipPlans.find(p => p.name === m.plan)?.price || 1000;
                return (
                  <div key={m.id} className="p-3 bg-zinc-950/50 border border-zinc-900 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-white">{m.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{m.id} • {m.plan} plan</p>
                      <p className="text-[10px] text-rose-500 font-extrabold mt-1">Dues: ₹{planPrice}</p>
                    </div>
                    <button
                      onClick={() => onMarkAsPaid(m.id, planPrice, m.plan)}
                      className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/25 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
                    >
                      Receive Fee
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">All gym memberships are fully paid!</p>
            )}
          </div>
        </div>

        {/* Completed list */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 lg:col-span-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 mb-6">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-cyan-400" />
              Receipt Ledgers
            </h4>
            
            {/* Search filter transactions */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-[11px] text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/45 text-slate-500 text-[9px] uppercase font-black tracking-wider">
                  <th className="p-3 pl-4">Receipt ID</th>
                  <th className="p-3">Client</th>
                  <th className="p-3 text-center">Plan</th>
                  <th className="p-3 text-center">Method</th>
                  <th className="p-3 text-center">Amount</th>
                  <th className="p-3 text-center">Date</th>
                  <th className="p-3 pr-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40 text-[11px] text-slate-300">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-900/20">
                      <td className="p-3 pl-4 font-bold text-slate-400">{p.id}</td>
                      <td className="p-3">
                        <div className="font-semibold text-white">{p.clientName}</div>
                        <div className="text-[9px] text-slate-500 font-semibold">{p.clientId}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-zinc-800 rounded font-semibold text-[9px] uppercase text-slate-400">
                          {p.plan}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-cyan-400">{p.method}</td>
                      <td className="p-3 text-center font-extrabold text-white">₹{p.amount}</td>
                      <td className="p-3 text-center text-slate-500 font-semibold">{p.date}</td>
                      <td className="p-3 pr-4 text-right">
                        <button
                          onClick={() => setInvoicePayment(p)}
                          className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-900 rounded-lg cursor-pointer flex items-center justify-center inline-flex"
                          title="Generate Invoice Receipt"
                          style={{ minWidth: '32px', minHeight: '32px' }}
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      No payment receipts logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoice Receipt PDF Modal */}
      {invoicePayment && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in print:p-0 print:bg-white print:relative">
          <div className="glass-panel p-8 rounded-3xl border border-zinc-900 w-full max-w-lg relative space-y-6 print:border-none print:bg-white print:text-black print:p-0 print:max-w-full">
            {/* Modal actions (hidden during print) */}
            <div className="absolute top-4 right-4 flex items-center gap-2 print:hidden">
              <button 
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer"
              >
                Print Invoice
              </button>
              <button 
                onClick={() => setInvoicePayment(null)}
                className="p-1.5 text-zinc-550 hover:text-white hover:bg-zinc-900 rounded-xl transition-all cursor-pointer"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Header */}
            <div className="text-center pb-4 border-b border-zinc-900/60 print:border-zinc-300">
              <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest print:text-cyan-600">Payment Confirmation Invoice</span>
              <h3 className="text-xl font-black text-white mt-1 leading-snug print:text-black">PHOENIX FITNESS CENTER</h3>
              <p className="text-[10px] text-zinc-500">Official Membership Fee Bill Receipt</p>
            </div>

            {/* Bill Meta Data */}
            <div className="grid grid-cols-2 gap-4 text-[11px] text-zinc-300 print:text-black leading-relaxed">
              <div>
                <p className="font-bold text-zinc-500 print:text-zinc-600 uppercase text-[9px] tracking-wider">Invoice Details</p>
                <p className="mt-1"><span className="text-zinc-500 font-medium">Receipt ID:</span> <span className="font-bold text-white print:text-black">{invoicePayment.id}</span></p>
                <p><span className="text-zinc-500 font-medium">Payment Date:</span> {invoicePayment.date}</p>
                <p><span className="text-zinc-500 font-medium">Method:</span> <span className="font-bold text-cyan-400 print:text-cyan-650">{invoicePayment.method}</span></p>
              </div>
              <div className="text-right">
                <p className="font-bold text-zinc-500 print:text-zinc-600 uppercase text-[9px] tracking-wider">Member Details</p>
                <p className="mt-1"><span className="text-zinc-500 font-medium">Client Name:</span> <span className="font-bold text-white print:text-black">{invoicePayment.clientName}</span></p>
                <p><span className="text-zinc-500 font-medium">Client ID:</span> {invoicePayment.clientId}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl overflow-hidden print:border-zinc-300 print:bg-transparent">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/40 text-zinc-500 text-[9px] uppercase font-black tracking-wider print:border-zinc-300 print:bg-zinc-100 print:text-zinc-700">
                    <th className="p-3 pl-4">Description</th>
                    <th className="p-3 text-center">Plan Term</th>
                    <th className="p-3 pr-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40 text-slate-300 print:divide-zinc-200 print:text-black">
                  <tr>
                    <td className="p-3 pl-4">
                      <p className="font-bold text-white print:text-black">Gym Membership Access Fee</p>
                      <p className="text-[9px] text-zinc-500 leading-normal">Full facility usage & personal batches allocation</p>
                    </td>
                    <td className="p-3 text-center font-semibold">{invoicePayment.plan}</td>
                    <td className="p-3 pr-4 text-right font-bold">₹{invoicePayment.amount}</td>
                  </tr>
                  <tr className="bg-zinc-900/10 font-extrabold print:bg-zinc-50">
                    <td colSpan="2" className="p-3 pl-4 text-zinc-500 print:text-zinc-700">GRAND TOTAL COLLECTED</td>
                    <td className="p-3 pr-4 text-right text-white print:text-black">₹{invoicePayment.amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Invoice Footer Seal */}
            <div className="text-center pt-4 border-t border-zinc-900/60 text-[10px] text-zinc-500 print:border-zinc-300 print:text-zinc-700 leading-relaxed">
              <p className="font-semibold text-zinc-400 print:text-black">Thank you for working out with us!</p>
              <p className="mt-1">This is a system-generated electronic billing transaction receipt. No physical signature is required.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
