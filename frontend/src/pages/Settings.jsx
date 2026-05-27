import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Plus, Trash2, Shield, Heart } from 'lucide-react';
import { getSettings, saveSettings } from '../db/mockDb';

export default function Settings({ onSettingsUpdate }) {
  const [settings, setSettings] = useState(getSettings());
  const [newPlan, setNewPlan] = useState({ name: '', durationMonths: 1, price: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlanChange = (index, field, value) => {
    const updatedPlans = [...settings.membershipPlans];
    updatedPlans[index] = {
      ...updatedPlans[index],
      [field]: field === 'price' || field === 'durationMonths' ? Number(value) : value
    };
    setSettings(prev => ({
      ...prev,
      membershipPlans: updatedPlans
    }));
  };

  const handleDeletePlan = (index) => {
    const updatedPlans = settings.membershipPlans.filter((_, idx) => idx !== index);
    setSettings(prev => ({
      ...prev,
      membershipPlans: updatedPlans
    }));
  };

  const handleAddPlanSubmit = (e) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.price) return;

    const updatedPlans = [
      ...settings.membershipPlans,
      {
        name: newPlan.name,
        durationMonths: Number(newPlan.durationMonths),
        price: Number(newPlan.price)
      }
    ];

    setSettings(prev => ({
      ...prev,
      membershipPlans: updatedPlans
    }));

    setNewPlan({ name: '', durationMonths: 1, price: '' });
  };

  const handleSaveAll = () => {
    saveSettings(settings);
    if (onSettingsUpdate) onSettingsUpdate(settings);
    setSuccessMsg('System parameters updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-80px)]">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-orange-500" />
          Gym Settings & Parameters
        </h2>
        <p className="text-xs text-slate-400 mt-1">Configure brand labels, customizable subscription plans, and billing configurations.</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl text-xs max-w-3xl">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        {/* Core Settings card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5 lg:col-span-2">
          <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">Branding Configurations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gym / Club Name</label>
              <input
                type="text"
                name="gymName"
                value={settings.gymName}
                onChange={handleSettingsChange}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Currency</label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleSettingsChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-orange-500 font-semibold"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3 pt-4">Membership Plans configuration</h3>
          
          <div className="space-y-3">
            {settings.membershipPlans.map((plan, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-5">
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => handlePlanChange(idx, 'name', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                    placeholder="Plan Label"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    value={plan.durationMonths}
                    onChange={(e) => handlePlanChange(idx, 'durationMonths', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                    placeholder="Months"
                    title="Duration in Months"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    value={plan.price}
                    onChange={(e) => handlePlanChange(idx, 'price', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                    placeholder="Price"
                  />
                </div>
                <div className="col-span-1 text-center">
                  <button
                    onClick={() => handleDeletePlan(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                    title="Remove Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add custom plan sub-form */}
          <div className="mt-4 p-4 bg-slate-950/60 border border-slate-900 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-300 mb-3">Add Custom Membership Plan</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <input
                type="text"
                placeholder="Plan Name (e.g. 5 Months)"
                value={newPlan.name}
                onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
              <input
                type="number"
                placeholder="Duration (Months)"
                value={newPlan.durationMonths}
                onChange={(e) => setNewPlan(prev => ({ ...prev, durationMonths: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newPlan.price}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                />
                <button
                  onClick={handleAddPlanSubmit}
                  type="button"
                  className="p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security & System sidecards */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              Portal Security
            </h3>
            
            <div className="text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-200">Local Ledger Enabled</p>
              <p>All CRUD configurations reside directly inside browser sandbox via secure standard localStorage allocations. No active cloud connection needed.</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-4">
            <Heart className="w-8 h-8 text-rose-500 mx-auto animate-pulse" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Phoenix Fitness</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Designed with robust responsive grid layout support and buttery smooth layouts using Framer Motion capabilities.
            </p>
            
            <button
              onClick={handleSaveAll}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
