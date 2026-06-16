import React, { useState, useEffect } from 'react';
import { Save, X, Sparkles, AlertCircle } from 'lucide-react';
import { getSettings } from '../db/mockDb';
import * as api from '../services/api';

export default function MemberForm({ memberToEdit, onSave, onCancel }) {
  const isEditMode = !!memberToEdit;
  const settings = getSettings();
  const [trainers, setTrainers] = useState([]);

  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    phone: '+91 ',
    whatsapp: '+91 ',
    village: '',
    address: '',
    gender: 'Male',
    age: '',
    joiningDate: new Date().toISOString().split('T')[0],
    plan: 'Monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    paymentStatus: 'Paid',
    status: 'Active',
    notes: '',
    trainerId: ''
  });

  // Fetch trainers for dropdown list
  useEffect(() => {
    const loadTrainers = async () => {
      try {
        const list = await api.getTrainers();
        setTrainers(list);
      } catch (err) {
        console.error('[MemberForm] Failed to load trainers', err);
      }
    };
    loadTrainers();
  }, []);

  const [errors, setErrors] = useState({});

  // Trigger effect to auto-calculate membership duration end date based on Plan selection
  useEffect(() => {
    if (formData.plan && formData.startDate) {
      const selectedPlan = settings.membershipPlans.find(p => p.name === formData.plan);
      const months = selectedPlan ? selectedPlan.durationMonths : 1;
      
      const start = new Date(formData.startDate);
      if (!isNaN(start)) {
        start.setMonth(start.getMonth() + months);
        setFormData(prev => ({
          ...prev,
          endDate: start.toISOString().split('T')[0]
        }));
      }
    }
  }, [formData.plan, formData.startDate]);

  // Load existing member details on editing trigger
  useEffect(() => {
    if (isEditMode && memberToEdit) {
      // Ensure phone and whatsapp loaded have +91 prefix formatted nicely
      const formatPhone = (val) => {
        if (!val) return '+91 ';
        if (val.startsWith('+91 ')) return val;
        const cleaned = val.replace(/^\+91\s*/, '').replace(/\D/g, '');
        return '+91 ' + cleaned;
      };

      setFormData({
        ...memberToEdit,
        phone: formatPhone(memberToEdit.phone),
        whatsapp: formatPhone(memberToEdit.whatsapp)
      });
    }
  }, [isEditMode, memberToEdit]);

  const handlePhoneChange = (e, name) => {
    let val = e.target.value;
    
    // Auto enforce prefix "+91 "
    if (!val.startsWith('+91 ')) {
      const cleaned = val.replace(/^\+91\s*/, '').replace(/\D/g, '');
      val = '+91 ' + cleaned;
    } else {
      const suffix = val.substring(4).replace(/\D/g, '');
      val = '+91 ' + suffix;
    }

    // Limit length to +91 + 10 digits (total 14 characters)
    if (val.length <= 14) {
      setFormData(prev => ({
        ...prev,
        [name]: val
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.fullName.trim()) tempErrors.fullName = 'Full Name is required';
    
    // Validate phone digits length post suffix "+91 "
    const phoneDigits = formData.phone.substring(4).replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      tempErrors.phone = 'Valid 10-digit Indian mobile number is required after +91';
    }

    const whatsappDigits = formData.whatsapp.substring(4).replace(/\D/g, '');
    if (formData.whatsapp.trim() !== '+91' && formData.whatsapp.trim() !== '' && whatsappDigits.length > 0 && whatsappDigits.length !== 10) {
      tempErrors.whatsapp = 'Valid 10-digit WhatsApp number is required or leave blank';
    }

    if (!formData.village.trim()) tempErrors.village = 'Village name is required';
    if (!formData.age || formData.age < 12 || formData.age > 100) {
      tempErrors.age = 'Age must be between 12 and 100';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(formData);
  };


  return (
    <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-red-500" />
            {isEditMode ? `Edit Member Profile: ${formData.id}` : 'Enroll New Gym Member'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isEditMode ? 'Modify active subscription parameters, phone records, or registration detail.' : 'Create new member profile in local secure ledger.'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-200 bg-zinc-900 border border-zinc-900 rounded-xl transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Panel */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core fields card */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-5 lg:col-span-2">
          <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-zinc-900 pb-3">Personal Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                placeholder="e.g. Rahul Sharma"
              />
              {errors.fullName && (
                <div className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fullName}
                </div>
              )}
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Age *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  placeholder="24"
                />
                {errors.age && (
                  <div className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1">
                    {errors.age}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e, 'phone')}
                maxLength="14"
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                placeholder="e.g. +91 9876543210"
              />
              {errors.phone && (
                <div className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
                </div>
              )}
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">WhatsApp Number (Optional)</label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => handlePhoneChange(e, 'whatsapp')}
                maxLength="14"
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                placeholder="e.g. +91 9876543210"
              />
              {errors.whatsapp && (
                <div className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.whatsapp}
                </div>
              )}
            </div>

            {/* Village */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Village *</label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                placeholder="Village / Town Name"
              />
              {errors.village && (
                <div className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.village}
                </div>
              )}
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
              />
            </div>
          </div>

          {/* Full address description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Address details</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all resize-none"
              placeholder="House, landmark or street specifics..."
            />
          </div>
        </div>

        {/* Membership & Payment Plan side details */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-zinc-900 pb-3">Subscription details</h3>
            
            {/* Membership Plan */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Membership Plan</label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              >
                {settings.membershipPlans.map(p => (
                  <option key={p.name} value={p.name}>{p.name} (₹{p.price})</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
              />
            </div>

            {/* Auto End Date display */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Expiry Date (Auto-calculated)</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                readOnly
                className="w-full px-3.5 py-2.5 bg-zinc-950/40 border border-zinc-900/80 rounded-xl text-xs text-slate-400 focus:outline-none cursor-not-allowed"
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Status</label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-bold"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Trainer Assignment */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assign Personal Trainer</label>
              <select
                name="trainerId"
                value={formData.trainerId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="">No Trainer Assigned (General Admission)</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Member Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Notes Card & Save */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Personal Fitness Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all resize-none"
                placeholder="Injuries, bodybuilding goals, time restrictions..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="w-1/2 py-2.5 bg-zinc-900 border border-zinc-900 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-gradient-phoenix hover:opacity-90 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Member
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
