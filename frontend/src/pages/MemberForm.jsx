import React, { useState, useEffect } from 'react';
import { Save, X, Sparkles, AlertCircle, Dumbbell, Activity, ShieldAlert } from 'lucide-react';
import { getSettings } from '../db/mockDb';
import * as api from '../services/api';

export default function MemberForm({ memberToEdit, onSave, onCancel }) {
  const isEditMode = !!memberToEdit;
  const settings = getSettings();
  const [trainers, setTrainers] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

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
    trainerId: '',
    // New Fields
    dob: '',
    height: '',
    weight: '',
    bmi: '',
    emergencyContact: '',
    email: '',
    purposeOfJoining: '',
    gymExperience: '',
    profession: '',
    amountPaid: '',
    hasMedicalCondition: 'No',
    medicalConditionDetails: ''
  });

  const [errors, setErrors] = useState({});

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

  // Load existing member details on editing trigger
  useEffect(() => {
    if (isEditMode && memberToEdit) {
      const formatPhone = (val) => {
        if (!val) return '+91 ';
        if (val.startsWith('+91 ')) return val;
        const cleaned = val.replace(/^\+91\s*/, '').replace(/\D/g, '');
        return '+91 ' + cleaned;
      };

      setFormData({
        id: memberToEdit.id || '',
        fullName: memberToEdit.fullName || '',
        phone: formatPhone(memberToEdit.phone),
        whatsapp: formatPhone(memberToEdit.whatsapp),
        village: memberToEdit.village || '',
        address: memberToEdit.address || '',
        gender: memberToEdit.gender || 'Male',
        age: memberToEdit.age || '',
        joiningDate: memberToEdit.joiningDate ? memberToEdit.joiningDate.split('T')[0] : new Date().toISOString().split('T')[0],
        plan: memberToEdit.plan || 'Monthly',
        startDate: memberToEdit.startDate ? memberToEdit.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: memberToEdit.endDate ? memberToEdit.endDate.split('T')[0] : '',
        paymentStatus: memberToEdit.paymentStatus || 'Paid',
        status: memberToEdit.status || 'Active',
        notes: memberToEdit.notes || '',
        trainerId: memberToEdit.trainerId || '',
        dob: memberToEdit.dob ? memberToEdit.dob.split('T')[0] : '',
        height: memberToEdit.height || '',
        weight: memberToEdit.weight || '',
        bmi: memberToEdit.bmi || '',
        emergencyContact: memberToEdit.emergencyContact || '',
        email: memberToEdit.email || '',
        purposeOfJoining: memberToEdit.purposeOfJoining || '',
        gymExperience: memberToEdit.gymExperience || '',
        profession: memberToEdit.profession || '',
        amountPaid: memberToEdit.amountPaid !== undefined ? memberToEdit.amountPaid : '',
        hasMedicalCondition: memberToEdit.hasMedicalCondition || 'No',
        medicalConditionDetails: memberToEdit.medicalConditionDetails || ''
      });
      setIsInitialized(true);
    } else {
      setIsInitialized(true);
    }
  }, [isEditMode, memberToEdit]);

  // Trigger effect to auto-calculate membership duration end date based on Plan selection
  useEffect(() => {
    if (!isInitialized) return;
    if (formData.plan && formData.startDate) {
      const selectedPlan = settings.membershipPlans.find(p => p.name === formData.plan);
      const months = selectedPlan ? selectedPlan.durationMonths : 1;
      const price = selectedPlan ? selectedPlan.price : 1000;
      
      const start = new Date(formData.startDate);
      if (!isNaN(start)) {
        start.setMonth(start.getMonth() + months);
        setFormData(prev => ({
          ...prev,
          endDate: start.toISOString().split('T')[0],
          amountPaid: prev.amountPaid === '' || prev.plan !== formData.plan ? price : prev.amountPaid
        }));
      }
    }
  }, [formData.plan, formData.startDate, isInitialized]);

  // Auto-calculate BMI based on height & weight
  useEffect(() => {
    const h = parseFloat(formData.height);
    const w = parseFloat(formData.weight);
    if (h && w && h > 0) {
      const heightInMeters = h / 100;
      const bmiVal = (w / (heightInMeters * heightInMeters)).toFixed(1);
      setFormData(prev => ({
        ...prev,
        bmi: bmiVal
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        bmi: ''
      }));
    }
  }, [formData.height, formData.weight]);

  // Auto-calculate Age if DOB changes
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      if (!isNaN(birthDate)) {
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        if (calculatedAge >= 0 && calculatedAge <= 120) {
          setFormData(prev => ({
            ...prev,
            age: calculatedAge
          }));
        }
      }
    }
  }, [formData.dob]);

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

    if (formData.hasMedicalCondition === 'Yes' && !formData.medicalConditionDetails.trim()) {
      tempErrors.medicalConditionDetails = 'Please explain your medical condition';
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
            {isEditMode ? 'Modify active subscription parameters, phone records, or registration details.' : 'Create new member profile in local secure ledger.'}
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
        <div className="space-y-6 lg:col-span-2">
          
          {/* CARD 1: Personal & Physical Profile */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-5">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-zinc-900 pb-3 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-red-500" />
              Personal & Physical Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="col-span-1 md:col-span-2">
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

              {/* Gender */}
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

              {/* DOB */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Age *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  placeholder="e.g. 24"
                />
                {errors.age && (
                  <div className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.age}
                  </div>
                )}
              </div>

              {/* Physical Parameters Row */}
              <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Height (cms)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="e.g. 175"
                    className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Weight (kgs)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g. 72"
                    className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">BMI (Auto)</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="bmi"
                      value={formData.bmi}
                      readOnly
                      placeholder="Auto"
                      className="w-full px-3.5 py-2.5 bg-zinc-950/40 border border-zinc-900/80 rounded-xl text-xs text-orange-400 font-bold focus:outline-none cursor-not-allowed"
                    />
                    {formData.bmi && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {formData.bmi < 18.5 ? 'Underweight' : formData.bmi < 25 ? 'Normal' : formData.bmi < 30 ? 'Overweight' : 'Obese'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Contact & Location Details */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-5">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-zinc-900 pb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" />
              Contact & Location details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">E-mail Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  placeholder="e.g. client@email.com"
                />
              </div>

              {/* Emergency Contact No */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Emergency Contact No.</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  placeholder="e.g. +91 98765 01234"
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

              {/* Joining Date (formerly in main list) */}
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

            {/* Address */}
            <div className="pt-2">
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

          {/* CARD 3: Fitness & Health Assessment */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-5">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-zinc-900 pb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Fitness & Health Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profession */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Profession</label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all"
                  placeholder="e.g. Student, Software Engineer"
                />
              </div>

              {/* Gym Experience (Yes/No custom cards) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Prior Gym Experience?</label>
                <div className="flex gap-3">
                  {['Yes', 'No'].map(exp => (
                    <label 
                      key={exp} 
                      className={`flex items-center justify-center flex-1 py-2.5 border rounded-xl cursor-pointer text-xs font-bold transition-all ${
                        formData.gymExperience === exp 
                          ? 'border-red-500 bg-red-950/20 text-white' 
                          : 'border-zinc-900 bg-zinc-950/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gymExperience"
                        value={exp}
                        checked={formData.gymExperience === exp}
                        onChange={handleChange}
                        className="hidden"
                      />
                      {exp}
                    </label>
                  ))}
                </div>
              </div>

              {/* Purpose of Joining (Custom Radio Cards Grid) */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Purpose of Joining</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Gain Weight', 'Lose Weight', 'Fitness', 'Become Professional'].map(purpose => (
                    <label 
                      key={purpose} 
                      className={`flex items-center justify-center py-2.5 px-2 border rounded-xl cursor-pointer text-[10px] font-bold text-center transition-all ${
                        formData.purposeOfJoining === purpose 
                          ? 'border-red-500 bg-red-950/20 text-white' 
                          : 'border-zinc-900 bg-zinc-950/40 text-slate-400 hover:text-slate-200 hover:border-zinc-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="purposeOfJoining"
                        value={purpose}
                        checked={formData.purposeOfJoining === purpose}
                        onChange={handleChange}
                        className="hidden"
                      />
                      {purpose}
                    </label>
                  ))}
                </div>
              </div>

              {/* Medical Condition Question */}
              <div className="col-span-1 md:col-span-2 space-y-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Any Medical Condition / Allergies?</label>
                  <div className="flex gap-3">
                    {['Yes', 'No'].map(choice => (
                      <label 
                        key={choice} 
                        className={`flex items-center justify-center flex-1 py-2.5 border rounded-xl cursor-pointer text-xs font-bold transition-all ${
                          formData.hasMedicalCondition === choice 
                            ? 'border-red-500 bg-red-950/20 text-white' 
                            : 'border-zinc-900 bg-zinc-950/40 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hasMedicalCondition"
                          value={choice}
                          checked={formData.hasMedicalCondition === choice}
                          onChange={handleChange}
                          className="hidden"
                        />
                        {choice}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Conditional Explain Details */}
                {formData.hasMedicalCondition === 'Yes' && (
                  <div className="animate-fade-in space-y-1">
                    <label className="block text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-2">Explain Medical details *</label>
                    <textarea
                      name="medicalConditionDetails"
                      value={formData.medicalConditionDetails}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all resize-none"
                      placeholder="List medical conditions, surgery histories, or food/drug allergies..."
                    />
                    {errors.medicalConditionDetails && (
                      <div className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.medicalConditionDetails}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Membership & Payment Plan side details */}
        <div className="space-y-6">
          {/* CARD 4: Subscription & Billing */}
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

            {/* Amount Paid input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Amount Paid (₹)</label>
              <input
                type="number"
                name="amountPaid"
                value={formData.amountPaid}
                onChange={handleChange}
                placeholder="Plan Price"
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 transition-all font-bold text-emerald-400 placeholder:text-slate-700"
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

          {/* CARD 5: Notes & Actions */}
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
