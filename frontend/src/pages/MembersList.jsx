import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Phone, 
  MapPin, 
  UserCheck, 
  UserX,
  CreditCard,
  Plus,
  QrCode,
  X
} from 'lucide-react';

export default function MembersList({ members, onDeleteMember, onToggleStatus, onEditMember, setPage, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all'); // all, name, id, phone, village
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive, expiring, pending
  const [qrMember, setQrMember] = useState(null);

  // Compute filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // 1. Search Query filter
      const term = searchTerm.toLowerCase().trim();
      let matchesSearch = true;

      if (term) {
        const idMatch = member.id.toLowerCase().includes(term);
        const nameMatch = member.fullName.toLowerCase().includes(term);
        const phoneMatch = member.phone.includes(term);
        const villageMatch = member.village.toLowerCase().includes(term);

        if (searchField === 'all') {
          matchesSearch = idMatch || nameMatch || phoneMatch || villageMatch;
        } else if (searchField === 'name') {
          matchesSearch = nameMatch;
        } else if (searchField === 'id') {
          matchesSearch = idMatch;
        } else if (searchField === 'phone') {
          matchesSearch = phoneMatch;
        } else if (searchField === 'village') {
          matchesSearch = villageMatch;
        }
      }

      // 2. Status & Alert filters
      let matchesFilter = true;
      if (statusFilter === 'active') {
        matchesFilter = member.status === 'Active';
      } else if (statusFilter === 'inactive') {
        matchesFilter = member.status === 'Inactive';
      } else if (statusFilter === 'pending') {
        matchesFilter = member.paymentStatus === 'Pending';
      } else if (statusFilter === 'expiring') {
        const today = new Date();
        const fifteenDaysFromNow = new Date();
        fifteenDaysFromNow.setDate(today.getDate() + 15);
        const endDate = new Date(member.endDate);
        matchesFilter = member.status === 'Active' && endDate >= today && endDate <= fifteenDaysFromNow;
      }

      return matchesSearch && matchesFilter;
    });
  }, [members, searchTerm, searchField, statusFilter]);

  return (
    <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Gym Members Directory</h2>
          <p className="text-xs text-slate-400 mt-1">Manage physical files, subscriptions, active batches, and alerts.</p>
        </div>
        <button
          onClick={() => setPage('add-member')}
          className="px-4 py-2.5 bg-gradient-phoenix hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Filters Control Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-zinc-900 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Search Inputs */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search members database..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-all"
            />
          </div>

          {/* Search Field Dropdown */}
          <div className="md:col-span-3">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-orange-500"
            >
              <option value="all">Search In All Fields</option>
              <option value="name">Search By Full Name</option>
              <option value="id">Search By Client ID</option>
              <option value="phone">Search By Phone No.</option>
              <option value="village">Search By Village</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-orange-500 font-semibold"
            >
              <option value="all">All Registrations</option>
              <option value="active">Active Subscriptions</option>
              <option value="inactive">Inactive Members</option>
              <option value="expiring">Expiring in 15 Days</option>
              <option value="pending">Pending Payments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Database Table Panel */}
      <div className="hidden md:block glass-panel rounded-2xl border border-zinc-900 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/45 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                <th className="p-4 pl-6">Client ID</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Phone / WhatsApp</th>
                <th className="p-4">Village & Address</th>
                <th className="p-4">Active Plan</th>
                <th className="p-4">End Date</th>
                <th className="p-4 text-center">Payment</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60 text-xs text-slate-300">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4 pl-6"><div className="h-3 bg-zinc-850 rounded w-16" /></td>
                    <td className="p-4"><div className="h-4 bg-zinc-850 rounded w-28" /><div className="h-2 bg-zinc-850 rounded w-12 mt-1" /></td>
                    <td className="p-4"><div className="h-3 bg-zinc-850 rounded w-24" /></td>
                    <td className="p-4"><div className="h-3 bg-zinc-850 rounded w-20" /></td>
                    <td className="p-4"><div className="h-5 bg-zinc-850 rounded w-16" /></td>
                    <td className="p-4"><div className="h-3 bg-zinc-850 rounded w-16" /></td>
                    <td className="p-4 text-center"><div className="h-4 bg-zinc-850 rounded w-12 mx-auto" /></td>
                    <td className="p-4 text-center"><div className="h-4 bg-zinc-850 rounded w-16 mx-auto" /></td>
                    <td className="p-4 pr-6 text-right"><div className="h-6 bg-zinc-850 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const today = new Date();
                  const isExpired = new Date(member.endDate) < today;
                  
                  return (
                    <tr key={member.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="p-4 pl-6 font-bold text-orange-400">
                        {member.id}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-white">{member.fullName}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Age: {member.age} • {member.gender}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{member.phone}</span>
                        </div>
                        {member.whatsapp && (
                          <div className="text-[9px] text-emerald-400 font-medium mt-0.5">WhatsApp Active</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-white font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-orange-500" />
                          {member.village}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px] mt-0.5">{member.address}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-zinc-900 border border-slate-700/65 rounded-lg font-bold text-[10px] uppercase text-slate-300">
                          {member.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold ${isExpired ? 'text-rose-400' : 'text-slate-400'}`}>
                          {member.endDate}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          member.paymentStatus === 'Paid' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {member.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onToggleStatus(member.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer border transition-all ${
                            member.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                              : 'bg-zinc-900 text-slate-500 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {member.status === 'Active' ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                           <button
                             onClick={() => setQrMember(member)}
                             className="p-1.5 text-slate-400 hover:text-orange-400 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                             title="Show Check-in QR Pass"
                           >
                             <QrCode className="w-4 h-4" />
                           </button>
                           <button
                             onClick={() => onEditMember(member)}
                             className="p-1.5 text-slate-400 hover:text-orange-400 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                             title="Edit Profile"
                           >
                             <Edit3 className="w-4 h-4" />
                           </button>
                          <button
                            onClick={() => onDeleteMember(member.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-slate-500">
                    No members match the query or filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile-first card list layout */}
      <div className="md:hidden space-y-4 pb-12">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="glass-panel p-5 rounded-2xl border border-zinc-900 animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-3 bg-zinc-850 rounded w-14" />
                <div className="h-4 bg-zinc-850 rounded w-20" />
              </div>
              <div className="space-y-2.5">
                <div className="h-4 bg-zinc-850 rounded w-2/3" />
                <div className="h-3 bg-zinc-850 rounded w-1/3" />
              </div>
              <div className="h-10 bg-zinc-850 rounded-xl w-full" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-3 bg-zinc-850 rounded w-24" />
                <div className="h-8 bg-zinc-850 rounded-lg w-24" />
              </div>
            </div>
          ))
        ) : filteredMembers.length > 0 ? (
          filteredMembers.map((member) => {
            const today = new Date();
            const isExpired = new Date(member.endDate) < today;

            return (
              <div 
                key={member.id} 
                className="glass-panel p-5 rounded-2xl border border-zinc-900 flex flex-col gap-3.5 relative overflow-hidden shadow-lg transition-transform active:scale-[0.99]"
              >
                {/* ID & Status Row */}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-red-450 text-xs tracking-wider">{member.id}</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      member.paymentStatus === 'Paid' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {member.paymentStatus}
                    </span>
                    <button
                      onClick={() => onToggleStatus(member.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold cursor-pointer border transition-all ${
                        member.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : 'bg-zinc-900 text-slate-500 border-slate-700'
                      }`}
                    >
                      {member.status === 'Active' ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                {/* Name, Age/Gender & Location */}
                <div>
                  <h3 className="font-bold text-white text-base leading-snug">{member.fullName}</h3>
                  <div className="text-[10px] text-slate-500 mt-0.5">Age: {member.age} • {member.gender}</div>
                  
                  <div className="flex items-center gap-1 text-[11px] text-slate-355 font-semibold mt-2.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>{member.village}</span>
                  </div>
                  {member.address && (
                    <div className="text-[10px] text-slate-500 ml-4.5 mt-0.5 truncate max-w-[250px]">{member.address}</div>
                  )}
                </div>

                {/* Plan Details & Expiry */}
                <div className="p-3 bg-zinc-950 border border-zinc-900/60 rounded-xl flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-black block">Plan</span>
                    <span className="font-bold text-slate-200">{member.plan}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 uppercase font-black block">Expires</span>
                    <span className={`font-bold ${isExpired ? 'text-rose-400' : 'text-slate-450'}`}>{member.endDate}</span>
                  </div>
                </div>

                {/* Actions and Phone row */}
                <div className="flex justify-between items-center border-t border-zinc-900/65 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] text-slate-450 font-semibold">{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <button
                       onClick={() => setQrMember(member)}
                       className="p-2 bg-zinc-950 border border-zinc-900 rounded-xl text-slate-400 hover:text-orange-400 cursor-pointer flex items-center justify-center"
                       style={{ minWidth: '44px', minHeight: '44px' }}
                       title="Show Check-in QR Pass"
                     >
                       <QrCode className="w-4 h-4" />
                     </button>
                     <button
                       onClick={() => onEditMember(member)}
                       className="p-2 bg-zinc-950 border border-zinc-900 rounded-xl text-slate-400 hover:text-orange-400 cursor-pointer flex items-center justify-center"
                       style={{ minWidth: '44px', minHeight: '44px' }}
                       title="Edit Profile"
                     >
                       <Edit3 className="w-4 h-4" />
                     </button>
                    <button
                      onClick={() => onDeleteMember(member.id)}
                      className="p-2 bg-rose-500/10 border border-rose-500/10 rounded-xl text-rose-450 hover:bg-rose-500/20 cursor-pointer flex items-center justify-center"
                      style={{ minWidth: '44px', minHeight: '44px' }}
                      title="Delete Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-panel p-8 text-center text-slate-500 rounded-2xl border border-zinc-900 text-xs">
            No members match the query or filter parameters.
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) for mobile screen */}
      <button
        onClick={() => setPage('add-member')}
        className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-gradient-phoenix rounded-full flex items-center justify-center text-white shadow-xl shadow-red-950/40 z-30 transition-transform active:scale-95 cursor-pointer"
        style={{ minWidth: '44px', minHeight: '44px' }}
        aria-label="Add Member"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* QR Code Pass Modal Overlay */}
      {qrMember && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-zinc-900 w-full max-w-sm text-center relative space-y-5">
            <button 
              onClick={() => setQrMember(null)}
              className="absolute top-4 right-4 p-1.5 text-zinc-550 hover:text-white hover:bg-zinc-900 rounded-xl transition-all cursor-pointer"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] text-orange-500 font-extrabold uppercase tracking-widest">Gym Member Pass</span>
              <h3 className="text-xl font-bold text-white mt-1 leading-snug">{qrMember.fullName}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">ID: {qrMember.id}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block mx-auto">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrMember.id}`} 
                alt={`${qrMember.fullName} Check-In QR`} 
                className="w-40 h-40 object-contain mx-auto"
              />
            </div>

            <div className="text-[10px] text-zinc-400 leading-normal px-2">
              Present this QR code at the reception desk camera scanner to record daily check-in attendance.
            </div>

            <a 
              href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrMember.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold rounded-xl transition-all text-xs cursor-pointer"
            >
              Open QR Code in New Tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
