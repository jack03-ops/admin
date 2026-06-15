import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Camera, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  History, 
  User, 
  Clock, 
  X,
  UserCheck
} from 'lucide-react';
import * as api from '../services/api';

export default function CheckIn({ setPage }) {
  const [clientId, setClientId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [isScanning, setIsScanning] = useState(true);
  const [checkInResult, setCheckInResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load members and logs
  const loadData = async () => {
    try {
      const allMembers = await api.getMembers();
      setMembers(allMembers);
      
      const logs = await api.getAttendanceLogs();
      setAttendanceLogs(logs);
    } catch (err) {
      console.error('Failed to load check-in data', err);
    }
  };

  useEffect(() => {
    loadData();
    // Simulate camera activation
    const timer = setTimeout(() => {
      setIsScanning(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCheckIn = async (id) => {
    if (!id) return;
    setError('');
    setCheckInResult(null);
    setLoading(true);

    try {
      const res = await api.checkInMember(id.toUpperCase().trim());
      setCheckInResult(res);
      setClientId('');
      await loadData();
    } catch (err) {
      setError(err.message || 'Check-in failed. Please check the Client ID.');
    } finally {
      setLoading(false);
    }
  };

  // Filter members for manual search list
  const filteredMembers = searchQuery.trim() === ''
    ? []
    : members.filter(m => 
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.id.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

  return (
    <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)] bg-[#030303] text-slate-100">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <QrCode className="w-6 h-6 text-red-500" />
          QR Member Check-In
        </h2>
        <p className="text-xs text-slate-400 mt-1">Scan member QR codes or check in using their Client ID.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scanner Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-5 rounded-3xl border border-zinc-900 overflow-hidden relative min-h-[300px] flex flex-col justify-between">
            {isScanning ? (
              <div className="relative flex-1 bg-zinc-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-zinc-900 py-12">
                {/* Neon Scanner Frame */}
                <div className="relative w-64 h-64 border-2 border-red-500/20 rounded-3xl flex items-center justify-center overflow-hidden">
                  {/* Glowing Corners */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500" />
                  
                  {/* Animating Scan Line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_15px_#ef4444] animate-bounce w-full" style={{ animationDuration: '3s' }} />
                  
                  <Camera className="w-12 h-12 text-zinc-700 animate-pulse" />
                </div>
                <p className="text-xs text-zinc-400 mt-4 font-semibold animate-pulse">Position Member QR Code inside corners</p>
                
                <button 
                  onClick={() => setIsScanning(false)}
                  className="mt-4 px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white cursor-pointer"
                >
                  Switch to Manual Mode
                </button>
              </div>
            ) : (
              <div className="flex-1 bg-zinc-950 rounded-2xl border border-zinc-900 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <QrCode className="w-12 h-12 text-zinc-600" />
                <h3 className="text-sm font-bold text-white">Manual ID Entry Mode</h3>
                <p className="text-xs text-zinc-400 max-w-xs leading-normal">
                  Type the gym member's Client ID (e.g. PXM-1001) or search by name to record check-in.
                </p>
                <button 
                  onClick={() => setIsScanning(true)}
                  className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/20 cursor-pointer"
                >
                  Start Camera Scanner
                </button>
              </div>
            )}
            
            {/* Quick manual entry override bar always available below scanner */}
            <div className="mt-4 pt-4 border-t border-zinc-900 flex gap-2">
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter Client ID (PXM-XXXX)"
                className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 uppercase font-bold"
                onKeyDown={(e) => e.key === 'Enter' && handleCheckIn(clientId)}
              />
              <button
                onClick={() => handleCheckIn(clientId)}
                disabled={loading || !clientId.trim()}
                className="px-5 bg-gradient-to-r from-red-650 to-red-500 hover:from-red-500 hover:to-rose-450 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? '...' : 'Check In'}
              </button>
            </div>
          </div>

          {/* Quick Search Override Dropdown */}
          <div className="glass-panel p-5 rounded-3xl border border-zinc-900 space-y-3 relative">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Search & Check In Member</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type name or Client ID..."
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
              />
            </div>
            {filteredMembers.length > 0 && (
              <div className="absolute left-5 right-5 mt-1 bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl z-50 divide-y divide-zinc-900 overflow-hidden">
                {filteredMembers.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      handleCheckIn(m.id);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-zinc-900/50 flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <div>
                      <span className="font-bold text-white group-hover:text-red-400 transition-colors">{m.fullName}</span>
                      <span className="text-[10px] text-zinc-500 ml-2 font-semibold">({m.id})</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold uppercase">{m.plan}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Check-in Logs / Result Panel */}
        <div className="space-y-6">
          
          {/* Active Check-In Result Popups */}
          {error && (
            <div className="p-4 bg-rose-500/15 border border-rose-500/35 text-rose-300 rounded-2xl text-xs font-semibold flex items-start gap-2.5 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-bold text-rose-200">Access Denied</p>
                <p className="text-[10px] text-rose-450 mt-0.5 leading-normal">{error}</p>
              </div>
            </div>
          )}

          {checkInResult && (
            <div className={`p-5 rounded-3xl border text-xs shadow-lg relative overflow-hidden ${
              checkInResult.member.isExpired 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              {/* Absolutes for neon card header border */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${checkInResult.member.isExpired ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${checkInResult.member.isExpired ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
                  {checkInResult.member.isExpired ? (
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  ) : (
                    <UserCheck className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-white text-sm tracking-tight">{checkInResult.member.fullName}</h4>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">ID: {checkInResult.member.clientId}</p>
                  
                  <div className="mt-2.5 space-y-1">
                    <p className="text-[10px] text-zinc-300 font-medium">Plan: <span className="font-bold text-white uppercase">{checkInResult.member.plan}</span></p>
                    <p className="text-[10px] text-zinc-300 font-medium">Checked In: <span className="font-bold text-white">{new Date(checkInResult.data.checkInTime).toLocaleTimeString()}</span></p>
                  </div>
                  
                  {checkInResult.member.isExpired && (
                    <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold rounded-lg text-amber-400">
                      WARNING: Membership has expired. Outstanding payment or renewal required.
                    </div>
                  )}
                  {checkInResult.alreadyCheckedIn && (
                    <div className="mt-2 text-[10px] text-zinc-400 font-semibold italic">
                      Note: Checked in duplicate bypassed.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Today's Attendance Logs */}
          <div className="glass-panel p-5 rounded-3xl border border-zinc-900 flex flex-col justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-zinc-900 pb-3">
              <History className="w-4 h-4 text-red-500" />
              Today's Check-ins
            </h3>
            
            <div className="overflow-y-auto max-h-[300px] space-y-3 pr-1">
              {attendanceLogs.length > 0 ? (
                attendanceLogs.map((log) => (
                  <div key={log._id || log.id} className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl flex items-center justify-between gap-4 text-[11px]">
                    <div className="min-w-0">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        {log.clientName}
                        <span className="text-[9px] text-zinc-500 font-semibold">({log.clientId})</span>
                      </p>
                      <p className="text-[9px] text-zinc-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-650" />
                        {new Date(log.checkInTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {log.method}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 text-center py-12">No member check-ins logged today.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
