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
  Plus
} from 'lucide-react';

export default function MembersList({ members, onDeleteMember, onToggleStatus, onEditMember, setPage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all'); // all, name, id, phone, village
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive, expiring, pending

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
          className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
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
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-all"
            />
          </div>

          {/* Search Field Dropdown */}
          <div className="md:col-span-3">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
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
              className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500 font-semibold"
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
      <div className="glass-panel rounded-2xl border border-zinc-900 overflow-hidden shadow-2xl">
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
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const today = new Date();
                  const isExpired = new Date(member.endDate) < today;
                  
                  return (
                    <tr key={member.id} className="hover:bg-zinc-900/30 transition-colors">
                      {/* ID */}
                      <td className="p-4 pl-6 font-bold text-red-400">
                        {member.id}
                      </td>

                      {/* Name & Basic details */}
                      <td className="p-4">
                        <div className="font-semibold text-white">{member.fullName}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Age: {member.age} • {member.gender}</div>
                      </td>

                      {/* Phone */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{member.phone}</span>
                        </div>
                        {member.whatsapp && (
                          <div className="text-[9px] text-emerald-400 font-medium mt-0.5">WhatsApp Active</div>
                        )}
                      </td>

                      {/* Village & Address */}
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-white font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          {member.village}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px] mt-0.5">{member.address}</div>
                      </td>

                      {/* Plan */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-zinc-900 border border-slate-700/65 rounded-lg font-bold text-[10px] uppercase text-slate-300">
                          {member.plan}
                        </span>
                      </td>

                      {/* End Date */}
                      <td className="p-4">
                        <span className={`font-semibold ${isExpired ? 'text-rose-400' : 'text-slate-400'}`}>
                          {member.endDate}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          member.paymentStatus === 'Paid' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {member.paymentStatus}
                        </span>
                      </td>

                      {/* Status Toggle Button */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onToggleStatus(member.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer border transition-all ${
                            member.status === 'Active'
                              ? 'bg-red-500/10 text-red-400 border-red-500/25 hover:bg-red-500/20'
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

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Edit button */}
                          <button
                            onClick={() => onEditMember(member)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          {/* Delete button */}
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
    </div>
  );
}
