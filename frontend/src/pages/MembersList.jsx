import React, { useState, useMemo } from 'react';
import { 
  Search, 
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
    <div className="p-4 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)] bg-[#111111]">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Gym Members Directory</h2>
          <p className="text-xs text-zinc-400 mt-1">Manage physical files, subscriptions, active batches, and alerts.</p>
        </div>
        <button
          onClick={() => setPage('add-member')}
          className="px-4 py-2.5 bg-[#FF5F1F] hover:bg-[#e04f14] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto border-none"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Filters Control Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-zinc-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Search Inputs */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search members database..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#FF5F1F] transition-all shadow-sm"
            />
          </div>

          {/* Search Fields Dropdown */}
          <div className="md:col-span-3">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:border-[#FF5F1F] font-medium shadow-sm cursor-pointer"
            >
              <option value="all">Search All Fields</option>
              <option value="name">Search Name Only</option>
              <option value="id">Search Member ID</option>
              <option value="phone">Search Phone Number</option>
              <option value="village">Search Village</option>
            </select>
          </div>

          {/* Status Filter dropdown */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:border-[#FF5F1F] font-bold shadow-sm cursor-pointer"
            >
              <option value="all">Filter: All Members</option>
              <option value="active">Filter: Active Only</option>
              <option value="inactive">Filter: Inactive Only</option>
              <option value="pending">Filter: Pending Fees</option>
              <option value="expiring">Filter: Expiring in 15 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Database Telemetry Table / Grid Container */}
      <div>
        {loading ? (
          /* Loader Skelton state */
          <div className="hidden md:block bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 text-[10px] uppercase font-black tracking-wider">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Fees</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">QR Pass</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-100 animate-pulse">
                    <td className="p-4 pl-6"><div className="h-3 bg-zinc-100 rounded w-16" /></td>
                    <td className="p-4"><div className="h-4 bg-zinc-100 rounded w-28" /><div className="h-2 bg-zinc-100 rounded w-12 mt-1" /></td>
                    <td className="p-4"><div className="h-3 bg-zinc-100 rounded w-24" /></td>
                    <td className="p-4"><div className="h-3 bg-zinc-100 rounded w-20" /></td>
                    <td className="p-4"><div className="h-5 bg-zinc-100 rounded w-16" /></td>
                    <td className="p-4"><div className="h-3 bg-zinc-100 rounded w-16" /></td>
                    <td className="p-4 text-center"><div className="h-4 bg-zinc-100 rounded w-12 mx-auto" /></td>
                    <td className="p-4 text-center"><div className="h-4 bg-zinc-100 rounded w-16 mx-auto" /></td>
                    <td className="p-4 pr-6 text-right"><div className="h-6 bg-zinc-100 rounded w-16 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredMembers.length > 0 ? (
          <>
            {/* Desktop Table view */}
            <div className="hidden md:block bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 text-[10px] uppercase font-black tracking-wider">
                    <th className="p-4 pl-6">ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4 flex items-center gap-1">Village & Phone</th>
                    <th className="p-4">Assigned Plan</th>
                    <th className="p-4">Start / End Date</th>
                    <th className="p-4">Fees</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">QR Code</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredMembers.map((member) => {
                    const today = new Date();
                    const isExpired = new Date(member.endDate) < today;
                    const isOverdue = member.paymentStatus === 'Pending' || isExpired || member.status !== 'Active';

                    return (
                      <tr key={member.id} className="hover:bg-zinc-50/80 transition-colors text-xs text-zinc-700">
                        <td className="p-4 pl-6 font-bold text-[#FF5F1F] tracking-wider">{member.id}</td>
                        <td className="p-4">
                          <p className="font-bold text-zinc-900 text-sm">{member.fullName}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Age: {member.age} • {member.gender}</p>
                        </td>
                        <td className="p-4 font-medium">
                          <div className="flex items-center gap-1 text-zinc-800">
                            <MapPin className="w-3 h-3 text-[#FF5F1F] shrink-0" />
                            <span>{member.village}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-0.5">
                            <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span>{member.phone}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-zinc-50 border border-zinc-200 rounded-lg font-bold text-[10px] uppercase text-zinc-650">
                            {member.plan}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-zinc-600">
                          <div>S: {member.startDate}</div>
                          <div className="text-[10px] text-zinc-450 font-medium mt-0.5">E: {member.endDate}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${
                            member.paymentStatus === 'Paid' 
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                              : 'bg-red-500/10 text-[#EF4444] border border-red-500/20'
                          }`}>
                            {member.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {!isOverdue ? (
                            <div className="inline-flex items-center gap-1.5 justify-center">
                              <span className="w-2.5 h-2.5 bg-[#22C55E] rounded-full inline-block animate-pulse" />
                              <span className="text-[10px] font-bold text-slate-700">Active</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => onToggleStatus(member.id)}
                              className="px-2.5 py-1 bg-[#EF4444] hover:bg-red-500 text-white text-[10px] font-black rounded-lg transition-all shadow-sm cursor-pointer uppercase tracking-wider border-none inline-flex items-center justify-center"
                            >
                              Overdue
                            </button>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setQrMember(member)}
                            className="p-1.5 text-zinc-500 hover:text-[#FF5F1F] hover:bg-zinc-100 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center border-none"
                            title="Generate QR Pass"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditMember(member)}
                              className="p-1.5 text-zinc-400 hover:text-[#FF5F1F] hover:bg-zinc-100 rounded-lg transition-all cursor-pointer border-none"
                              title="Modify Profile"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer border-none"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards stack view */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredMembers.map((member) => {
                const today = new Date();
                const isExpired = new Date(member.endDate) < today;
                const isOverdue = member.paymentStatus === 'Pending' || isExpired || member.status !== 'Active';

                return (
                  <div 
                    key={member.id} 
                    className="bg-white p-4 rounded-2xl border border-zinc-200/85 flex flex-col gap-3 relative overflow-hidden shadow-md transition-transform active:scale-[0.99]"
                  >
                    {/* ID & Status Badge Row */}
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#FF5F1F] text-xs tracking-wider">{member.id}</span>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          member.paymentStatus === 'Paid' 
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-[#EF4444] border border-red-500/20'
                        }`}>
                          {member.paymentStatus}
                        </span>
                        {!isOverdue ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-zinc-700">Active</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => onToggleStatus(member.id)}
                            className="px-2 py-0.5 bg-[#EF4444] hover:bg-red-500 text-white text-[9px] font-black rounded-md cursor-pointer uppercase border-none"
                          >
                            Overdue
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Name, Age, Village */}
                    <div>
                      <h3 className="font-bold text-zinc-900 text-base leading-snug">{member.fullName}</h3>
                      <div className="text-[10px] text-zinc-450 mt-0.5">Age: {member.age} • {member.gender}</div>
                      
                      <div className="flex items-center gap-1 text-[11px] text-zinc-750 font-bold mt-2">
                        <MapPin className="w-3.5 h-3.5 text-[#FF5F1F] shrink-0" />
                        <span>{member.village}</span>
                      </div>
                      {member.address && (
                        <div className="text-[10px] text-zinc-500 ml-4.5 mt-0.5 truncate max-w-[250px]">{member.address}</div>
                      )}
                    </div>

                    {/* Subscription details */}
                    <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-[9px] text-zinc-450 uppercase font-black block">Plan</span>
                        <span className="font-bold text-zinc-850">{member.plan}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-zinc-450 uppercase font-black block">Ends On</span>
                        <span className="font-bold text-zinc-800">{member.endDate}</span>
                      </div>
                    </div>

                    {/* Quick triggers footer */}
                    <div className="flex gap-2 justify-end border-t border-zinc-100 pt-3">
                      <button
                        onClick={() => setQrMember(member)}
                        className="p-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-650 hover:text-[#FF5F1F] hover:border-[#FF5F1F]/40 cursor-pointer flex items-center justify-center border-solid"
                        title="View QR Code"
                        style={{ minWidth: '40px', minHeight: '40px' }}
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditMember(member)}
                        className="p-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-650 hover:text-[#FF5F1F] hover:border-[#FF5F1F]/40 cursor-pointer flex items-center justify-center border-solid"
                        title="Edit profile"
                        style={{ minWidth: '40px', minHeight: '40px' }}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-2 bg-rose-50/50 border border-rose-250 rounded-xl text-rose-600 hover:bg-rose-500 hover:text-white cursor-pointer flex items-center justify-center border-solid transition-colors"
                        title="Delete profile"
                        style={{ minWidth: '40px', minHeight: '40px' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Empty Search Fallback */
          <div className="bg-white p-8 text-center text-zinc-500 rounded-2xl border border-zinc-200 text-xs">
            No members match the query or filter parameters.
          </div>
        )}
      </div>

      {/* Floating Bright Neon Orange CTA Button ("+ New Member") - Bottom Right */}
      <button
        onClick={() => setPage('add-member')}
        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 z-40 px-5 py-3.5 bg-[#FF5F1F] hover:bg-[#e04f14] text-white text-xs font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(255,95,31,0.45)] hover:shadow-[0_0_30px_rgba(255,95,31,0.65)] hover:scale-105 transition-all duration-300 flex items-center gap-2 cursor-pointer border-none"
        style={{ minWidth: '44px', minHeight: '44px' }}
        aria-label="New Member"
      >
        <Plus className="w-5 h-5 stroke-[3]" />
        <span>New Member</span>
      </button>

      {/* QR Code Pass Modal Overlay */}
      {qrMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 w-full max-w-sm text-center relative space-y-5 shadow-2xl">
            <button 
              onClick={() => setQrMember(null)}
              className="absolute top-4 right-4 p-1.5 text-[#111111] hover:text-[#FF5F1F] hover:bg-zinc-100 rounded-xl transition-all cursor-pointer border-none"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] text-[#FF5F1F] font-extrabold uppercase tracking-widest">Gym Member Pass</span>
              <h3 className="text-xl font-bold text-zinc-900 mt-1 leading-snug">{qrMember.fullName}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">ID: {qrMember.id}</p>
            </div>

            <div className="bg-white p-4 border border-zinc-200 rounded-2xl inline-block mx-auto">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrMember.id}`} 
                alt={`${qrMember.fullName} Check-In QR`} 
                className="w-40 h-40 object-contain mx-auto"
              />
            </div>

            <div className="text-[10px] text-zinc-500 leading-normal px-2">
              Present this QR code at the reception desk camera scanner to record daily check-in attendance.
            </div>

            <a 
              href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrMember.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-[#FF5F1F] hover:bg-[#e04f14] text-white font-bold rounded-xl transition-all text-xs cursor-pointer border-none text-center no-underline"
            >
              Open QR Code in New Tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
