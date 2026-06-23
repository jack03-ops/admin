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

    const m = members.find(item => item.id === newPayment.clientId);
    onAddPayment({
      clientId: newPayment.clientId,
      clientName: m ? m.fullName : 'Unknown Member',
      amount: Number(newPayment.amount),
      method: newPayment.method,
      plan: newPayment.plan,
      date: new Date().toISOString().split('T')[0]
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
    <div className="p-4 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)] bg-[#111111]">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-[#FF5F1F]" />
            Billing & Invoices Hub
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Review collections telemetry, pending dues, and record manual member payments.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Fees Collected</p>
              <h3 className="text-2xl md:text-3xl font-black text-zinc-900 mt-1 md:mt-2">₹{stats.collected.toLocaleString()}</h3>
            </div>
            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 font-bold mt-4 uppercase">Across all historical terms</p>
        </div>

        <div className="glass-panel border-red-200 p-5 md:p-6 rounded-2xl border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Estimated Pending Dues</p>
              <h3 className="text-2xl md:text-3xl font-black text-zinc-900 mt-1 md:mt-2">₹{stats.pendingAmount.toLocaleString()}</h3>
            </div>
            <div className="bg-rose-500/10 p-2.5 rounded-xl text-rose-500">
              <Clock className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] text-rose-550 font-bold mt-4 uppercase">{stats.pendingCount} members pending payment</p>
        </div>

        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200 flex flex-col justify-center">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Record Operations</h4>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full py-2.5 bg-[#FF5F1F] hover:bg-[#e04f14] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            <Plus className="w-4 h-4" />
            Manual Billing Receipt
          </button>
        </div>
      </div>

      {/* Manual invoice form panel */}
      {showAddForm && (
        <form onSubmit={handleAddPaymentSubmit} className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200 space-y-4 max-w-xl border-solid">
          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-200 pb-3 border-solid">Bill Payment Receipt</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Select Gym Client</label>
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
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:border-[#FF5F1F] cursor-pointer"
              >
                <option value="">-- Choose Member --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.fullName} ({m.id}) - {m.plan}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Fees Amount (₹)</label>
              <input
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                required
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:border-[#FF5F1F]"
                placeholder="e.g. 1000"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Payment Method</label>
              <select
                value={newPayment.method}
                onChange={(e) => setNewPayment(prev => ({ ...prev, method: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:border-[#FF5F1F] cursor-pointer"
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
                className="w-1/2 py-2 bg-zinc-100 border border-zinc-250 text-zinc-650 hover:bg-zinc-200 hover:text-zinc-800 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 bg-[#FF5F1F] hover:bg-[#e04f14] text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer border-none"
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
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200 h-fit">
          <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-200 pb-3 flex items-center gap-2 border-solid">
            <Clock className="w-4 h-4 text-rose-500" />
            Pending Member Dues
          </h4>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {pendingMembers.length > 0 ? (
              pendingMembers.map((m) => {
                const planPrice = settings.membershipPlans.find(p => p.name === m.plan)?.price || 1000;
                return (
                  <div key={m.id} className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-zinc-900">{m.fullName}</p>
                      <p className="text-[10px] text-zinc-450 font-semibold">{m.id} • {m.plan} plan</p>
                      <p className="text-[10px] text-rose-600 font-black mt-1">Dues: ₹{planPrice}</p>
                    </div>
                    <button
                      onClick={() => onMarkAsPaid(m.id, planPrice, m.plan)}
                      className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-500/25 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border-solid"
                    >
                      Receive Fee
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-zinc-400 text-center py-6">All gym memberships are fully paid!</p>
            )}
          </div>
        </div>

        {/* Completed list */}
        <div className="glass-panel p-5 md:p-6 rounded-2xl border border-zinc-200 lg:col-span-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 mb-6">
            <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#FF5F1F]" />
              Receipt Ledgers
            </h4>
            
            {/* Search filter transactions */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] text-zinc-800 focus:outline-none focus:border-[#FF5F1F]"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 text-[9px] uppercase font-black tracking-wider">
                  <th className="p-3 pl-4">Receipt ID</th>
                  <th className="p-3">Client</th>
                  <th className="p-3 text-center">Plan</th>
                  <th className="p-3 text-center">Method</th>
                  <th className="p-3 text-center">Amount</th>
                  <th className="p-3 text-center">Date</th>
                  <th className="p-3 pr-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 text-[11px] text-zinc-700">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="p-3 pl-4 font-bold text-[#FF5F1F]">{p.id}</td>
                      <td className="p-3">
                        <div className="font-semibold text-zinc-900">{p.clientName}</div>
                        <div className="text-[9px] text-zinc-450 font-semibold">{p.clientId}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-zinc-100 rounded font-semibold text-[9px] uppercase text-zinc-600 border border-zinc-200">
                          {p.plan}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-zinc-800">{p.method}</td>
                      <td className="p-3 text-center font-extrabold text-zinc-900">₹{p.amount}</td>
                      <td className="p-3 text-center text-zinc-500 font-semibold">{p.date}</td>
                      <td className="p-3 pr-4 text-right">
                        <button
                          onClick={() => setInvoicePayment(p)}
                          className="p-1.5 text-zinc-500 hover:text-[#FF5F1F] hover:bg-zinc-100 rounded-lg cursor-pointer flex items-center justify-center inline-flex border-none"
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
                    <td colSpan="7" className="p-8 text-center text-zinc-400">
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
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 w-full max-w-lg relative space-y-6 print:border-none print:bg-white print:text-black print:p-0 print:max-w-full">
            {/* Modal actions (hidden during print) */}
            <div className="absolute top-4 right-4 flex items-center gap-2 print:hidden">
              <button 
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-[#FF5F1F] hover:bg-[#e04f14] text-white text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer border-none"
              >
                Print Invoice
              </button>
              <button 
                onClick={() => setInvoicePayment(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer border-none"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Header */}
            <div className="text-center pb-4 border-b border-zinc-200 text-zinc-800 print:border-zinc-300">
              <span className="text-[10px] text-[#FF5F1F] font-extrabold uppercase tracking-widest">Payment Confirmation Invoice</span>
              <h3 className="text-xl font-black text-zinc-900 mt-1 leading-snug">PHOENIX FITNESS ACADEMY</h3>
              <p className="text-[10px] text-zinc-500">Official Membership Fee Bill Receipt</p>
            </div>

            {/* Bill Meta Data */}
            <div className="grid grid-cols-2 gap-4 text-[11px] text-zinc-700 leading-relaxed">
              <div>
                <p className="font-bold text-zinc-400 uppercase text-[9px] tracking-wider">Invoice Details</p>
                <p className="mt-1"><span className="text-zinc-500 font-medium">Receipt ID:</span> <span className="font-bold text-[#FF5F1F]">{invoicePayment.id}</span></p>
                <p><span className="text-zinc-500 font-medium">Payment Date:</span> {invoicePayment.date}</p>
                <p><span className="text-zinc-500 font-medium">Method:</span> <span className="font-bold text-[#FF5F1F]">{invoicePayment.method}</span></p>
              </div>
              <div className="text-right">
                <p className="font-bold text-zinc-400 uppercase text-[9px] tracking-wider">Member Details</p>
                <p className="mt-1"><span className="text-zinc-500 font-medium">Client Name:</span> <span className="font-bold text-zinc-900">{invoicePayment.clientName}</span></p>
                <p><span className="text-zinc-500 font-medium">Client ID:</span> {invoicePayment.clientId}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden print:border-zinc-300 print:bg-transparent">
              <table className="w-full text-left text-[11px] text-zinc-700">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-100 text-zinc-500 text-[9px] uppercase font-black tracking-wider print:border-zinc-300 print:bg-zinc-100 print:text-zinc-700">
                    <th className="p-3 pl-4">Description</th>
                    <th className="p-3 text-center">Plan Term</th>
                    <th className="p-3 pr-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 print:divide-zinc-200 print:text-black">
                  <tr>
                    <td className="p-3 pl-4">
                      <p className="font-bold text-zinc-900">Gym Membership Access Fee</p>
                      <p className="text-[9px] text-zinc-500 leading-normal">Full facility usage & personal batches allocation</p>
                    </td>
                    <td className="p-3 text-center font-semibold">{invoicePayment.plan}</td>
                    <td className="p-3 pr-4 text-right font-bold">₹{invoicePayment.amount}</td>
                  </tr>
                  <tr className="bg-zinc-100 font-extrabold print:bg-zinc-50">
                    <td colSpan="2" className="p-3 pl-4 text-zinc-500 print:text-zinc-700">GRAND TOTAL COLLECTED</td>
                    <td className="p-3 pr-4 text-right text-zinc-950">₹{invoicePayment.amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Invoice Footer Seal */}
            <div className="text-center pt-4 border-t border-zinc-200 text-[10px] text-zinc-500 print:border-zinc-300 print:text-zinc-700 leading-relaxed">
              <p className="font-semibold text-zinc-700">Thank you for working out with us!</p>
              <p className="mt-1">This is a system-generated electronic billing transaction receipt. No physical signature is required.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
