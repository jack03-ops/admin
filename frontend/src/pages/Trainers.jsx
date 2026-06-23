import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Phone, 
  Calendar, 
  Award, 
  X, 
  Save, 
  Briefcase 
} from 'lucide-react';
import * as api from '../services/api';

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('directory'); // directory, calendar
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('General Fitness');
  const [schedule, setSchedule] = useState('Full Time');

  const [toast, setToast] = useState('');

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const tList = await api.getTrainers();
      setTrainers(tList);
      const mList = await api.getMembers();
      setMembers(mList);
    } catch (err) {
      console.error('Failed to load data in Trainers page', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper to get dates of the current week (Monday to Sunday)
  const getCurrentWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
    const mondayDiff = currentDay === 0 ? -6 : 1 - currentDay;
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() + mondayDiff + i);
      days.push({
        name: dayDate.toLocaleDateString('en-US', { weekday: 'long' }),
        shortName: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: dayDate.toISOString().split('T')[0],
        displayDate: dayDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
      });
    }
    return days;
  };

  const openAddModal = () => {
    setEditingTrainer(null);
    setName('');
    setPhone('');
    setSpecialty('General Fitness');
    setSchedule('Full Time');
    setShowFormModal(true);
  };

  const openEditModal = (trainer) => {
    setEditingTrainer(trainer);
    setName(trainer.name);
    setPhone(trainer.phone);
    setSpecialty(trainer.specialty || 'General Fitness');
    setSchedule(trainer.schedule || 'Full Time');
    setShowFormModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    try {
      const payload = { name, phone, specialty, schedule };
      if (editingTrainer) {
        await api.updateTrainer(editingTrainer.id, payload);
        showToastMsg('Trainer profile updated successfully!');
      } else {
        await api.createTrainer(payload);
        showToastMsg('Trainer registered successfully!');
      }
      setShowFormModal(false);
      loadData();
    } catch (err) {
      showToastMsg(`Error saving trainer: ${err.message}`);
    }
  };

  const handleDelete = async (id, trainerName) => {
    if (window.confirm(`Are you sure you want to delete trainer ${trainerName}? All assigned members will be unassigned.`)) {
      try {
        await api.deleteTrainer(id);
        showToastMsg('Trainer profile removed.');
        loadData();
      } catch (err) {
        showToastMsg(`Error deleting trainer: ${err.message}`);
      }
    }
  };

  const renderWeeklyCalendar = () => {
    const days = getCurrentWeekDays();
    const todayStr = new Date().toISOString().split('T')[0];

    return (
      <div className="space-y-6">
        <div className="p-4 bg-zinc-50/60 border border-zinc-200 rounded-2xl">
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-1">Operational Shift Schedule & Expiry Monitor</h4>
          <p className="text-[10px] text-zinc-500">Real-time scheduling map displaying weekly shifts along with member expiration alerts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {days.map((day) => {
            const isToday = day.dateStr === todayStr;
            const morningTrainers = trainers.filter(t => t.schedule === 'Morning Batch' || t.schedule === 'Full Time');
            const eveningTrainers = trainers.filter(t => t.schedule === 'Evening Batch' || t.schedule === 'Full Time');
            const expiringMembers = members.filter(m => m.endDate === day.dateStr);

            return (
              <div 
                key={day.dateStr}
                className={`glass-panel p-4 rounded-2xl border flex flex-col gap-4 relative overflow-hidden transition-all duration-300 min-h-[200px] ${
                  isToday 
                    ? 'border-[#FF5F1F]/50 bg-red-950/5 shadow-[0_0_20px_rgba(239,68,68,0.08)]' 
                    : 'border-zinc-200 bg-zinc-50/20 hover:border-zinc-200'
                }`}
              >
                <div className="border-b border-zinc-200 pb-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-black uppercase ${isToday ? 'text-[#FF5F1F]' : 'text-zinc-900'}`}>{day.shortName}</span>
                    <span className="text-[9px] text-zinc-500 font-bold">{day.displayDate}</span>
                  </div>
                  {isToday && (
                    <span className="inline-block mt-1 bg-orange-500/10 text-[#FF5F1F] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border border-[#FF5F1F]/20 tracking-wider">
                      Today
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wide block mb-1">Morning Shifts</span>
                    {morningTrainers.length > 0 ? (
                      morningTrainers.map(t => (
                        <p key={t.id} className="text-[10px] text-zinc-500 font-semibold truncate">🌅 {t.name}</p>
                      ))
                    ) : (
                      <p className="text-[9px] text-zinc-650 italic">No shifts</p>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wide block mb-1">Evening Shifts</span>
                    {eveningTrainers.length > 0 ? (
                      eveningTrainers.map(t => (
                        <p key={t.id} className="text-[10px] text-zinc-500 font-semibold truncate">🌇 {t.name}</p>
                      ))
                    ) : (
                      <p className="text-[9px] text-zinc-650 italic">No shifts</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-3 mt-auto">
                  <span className="text-[8px] font-bold text-[#FF5F1F] uppercase tracking-wide block mb-1.5">Expirations ({expiringMembers.length})</span>
                  {expiringMembers.length > 0 ? (
                    <div className="space-y-1.5">
                      {expiringMembers.map(m => (
                        <div key={m.id} className="p-1.5 bg-red-500/5 border border-[#FF5F1F]/10 rounded-lg text-[9px] text-red-300 font-bold truncate" title={`${m.fullName} - Plan: ${m.plan}`}>
                          ⚠️ {m.fullName}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] text-zinc-600">No expirations</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)] bg-[#030303] text-zinc-800 pb-20 md:pb-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-zinc-900 border border-[#FF5F1F]/30 text-zinc-900 px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-md text-xs font-semibold">
          {toast}
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#FF5F1F]" />
            Gym Trainers & Schedules
          </h2>
          <p className="text-xs text-zinc-550 mt-1">Manage trainer profiles, batch schedules, and member allocations.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#FF5F1F] hover:bg-[#e04f14] hover:opacity-90 text-zinc-900 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Trainer
        </button>
      </div>

      {/* Tab Selection Switcher */}
      <div className="flex bg-zinc-50 p-1 border border-zinc-200 rounded-2xl max-w-sm w-full">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'directory' ? 'bg-[#FF5F1F] hover:bg-[#e04f14] text-zinc-900' : 'text-zinc-550 hover:text-zinc-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Trainers List
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'calendar' ? 'bg-[#FF5F1F] hover:bg-[#e04f14] text-zinc-900' : 'text-zinc-550 hover:text-zinc-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Weekly Calendar
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-panel p-6 rounded-3xl border border-zinc-200 animate-pulse space-y-4">
              <div className="h-4 bg-zinc-850 rounded w-2/3" />
              <div className="h-3 bg-zinc-850 rounded w-1/2" />
              <div className="h-10 bg-zinc-850 rounded-2xl w-full" />
            </div>
          ))}
        </div>
      ) : activeTab === 'calendar' ? (
        renderWeeklyCalendar()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.length > 0 ? (
            trainers.map((trainer) => (
              <div 
                key={trainer.id} 
                className="glass-panel p-6 rounded-3xl border border-zinc-200 flex flex-col justify-between gap-6 shadow-lg relative overflow-hidden transition-all duration-300 hover:border-zinc-200"
              >
                {/* Visual Neon Indicator */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] ${
                  trainer.schedule === 'Morning Batch' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                    : trainer.schedule === 'Evening Batch'
                      ? 'bg-gradient-to-r from-amber-500 to-red-500'
                      : 'bg-gradient-to-r from-red-600 to-rose-600'
                }`} />

                <div className="space-y-4">
                  {/* Title & Badge */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-zinc-900 text-base leading-tight">{trainer.name}</h3>
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase mt-0.5 tracking-wider flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#FF5F1F]" />
                        {trainer.specialty}
                      </p>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      trainer.status === 'Active' 
                        ? 'bg-orange-500/10 text-[#FF5F1F] border-[#FF5F1F]/20' 
                        : 'bg-zinc-900 text-zinc-500 border-zinc-200'
                    }`}>
                      {trainer.status}
                    </span>
                  </div>

                  {/* Phone & Batch Details */}
                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-zinc-600 shrink-0" />
                      <span>{trainer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-600 shrink-0" />
                      <span className="font-semibold">{trainer.schedule}</span>
                    </div>
                  </div>
                </div>

                {/* Assignment statistics */}
                <div className="p-3 bg-zinc-50/70 border border-zinc-200 rounded-2xl flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-semibold">Active Assignments</span>
                  <span className="font-bold text-zinc-900 bg-zinc-900 border border-zinc-200 px-3 py-1 rounded-xl">
                    {trainer.assignedCount || 0} members
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 border-t border-zinc-200/60 pt-4 justify-end">
                  <button
                    onClick={() => openEditModal(trainer)}
                    className="p-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-550 hover:text-[#FF5F1F] cursor-pointer flex items-center justify-center transition-colors"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                    title="Edit Trainer Profile"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(trainer.id, trainer.name)}
                    className="p-2 bg-rose-500/5 border border-rose-500/10 rounded-xl text-rose-450 hover:bg-rose-550/15 cursor-pointer flex items-center justify-center transition-colors"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                    title="Delete Trainer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel p-8 text-center text-zinc-550 rounded-3xl border border-zinc-200 text-xs col-span-3">
              No trainers registered in the system.
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 rounded-3xl border border-zinc-200 w-full max-w-md relative">
            <button 
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-550 hover:text-zinc-900 hover:bg-zinc-900 rounded-xl transition-all cursor-pointer"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-zinc-900 mb-4">
              {editingTrainer ? 'Modify Trainer Profile' : 'Register Gym Trainer'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-550 tracking-wider mb-1.5">
                  Trainer Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Rathore"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5F1F]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-550 tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9988776655"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5F1F]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-550 tracking-wider mb-1.5">
                  Specialty / Certification
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Strength & Conditioning"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5F1F]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-550 tracking-wider mb-1.5">
                  Shift Batch Schedule
                </label>
                <select
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-[#FF5F1F]"
                >
                  <option value="Morning Batch">Morning Batch (6:00 AM - 10:00 AM)</option>
                  <option value="Evening Batch">Evening Batch (4:00 PM - 8:00 PM)</option>
                  <option value="Full Time">Full Time Shift</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#FF5F1F] hover:bg-[#e04f14] hover:opacity-90 text-zinc-900 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Trainer Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
