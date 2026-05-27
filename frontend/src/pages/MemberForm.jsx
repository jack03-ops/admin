import React, { useState, useEffect } from 'react';
import { Save, X, Sparkles, AlertCircle } from 'lucide-react';
import { getSettings } from '../db/mockDb';

export default function MemberForm({ memberToEdit, onSave, onCancel }) {
  const isEditMode = !!memberToEdit;
  const settings = getSettings();

  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    phone: '',
    whatsapp: '',
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
    notes: ''
  });

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
      setFormData(memberToEdit);
    }
  }, [isEditMode, memberToEdit]);

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
    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone Number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      tempErrors.phone = 'Enter valid 10-digit number';
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
            <Sparkles className="w-6 h-6 text-orange-500" />
            {isEditMode ? `Edit Member Profile: ${formData.id}` : 'Enroll New Gym Member'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isEditMode ? 'Modify active subscription parameters, phone records, or registration detail.' : 'Create new member profile in local secure ledger.'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-xl transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Panel */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core fields card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 lg:col-span-2">
          <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">Personal Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 transition-all"
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
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 transition-all"
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
                  className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-orange-500"
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
                onChange={handleChange}
                maxLength="10"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 transition-all"
                placeholder="e.g. 9876543210"
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
                onChange={handleChange}
                maxLength="10"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 transition-all"
                placeholder="Leave blank if same as phone"
              />
            </div>

            {/* Village */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Village *</label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 transition-all"
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
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 transition-all"
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
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 transition-all resize-none"
              placeholder="House, landmark or street specifics..."
            />
          </div>
        </div>

        {/* Membership & Payment Plan side details */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">Subscription details</h3>
            
            {/* Membership Plan */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Membership Plan</label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
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
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 transition-all"
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
                className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl text-xs text-slate-400 focus:outline-none cursor-not-allowed"
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Status</label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 font-bold"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Member Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Notes Card & Save */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Personal Fitness Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 transition-all resize-none"
                placeholder="Injuries, bodybuilding goals, time restrictions..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="w-1/2 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
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
