import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Apple, 
  Plus, 
  Trash2, 
  Save, 
  Droplet, 
  Camera, 
  History, 
  Sparkles, 
  CheckCircle,
  X,
  Upload,
  Calendar
} from 'lucide-react';
import * as api from '../services/api';

export default function DietWorkout() {
  const [members, setMembers] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState('workout'); // workout, diet, progress
  
  // Workout state
  const [exercises, setExercises] = useState([]);
  
  // Diet state
  const [meals, setMeals] = useState([]);
  const [waterTarget, setWaterTarget] = useState(3.5);

  // Progress state
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [waterLogs, setWaterLogs] = useState([]);
  const [newWaterLog, setNewWaterLog] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // Load members on mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const list = await api.getMembers();
        setMembers(list);
        if (list.length > 0) {
          setSelectedClientId(list[0].id);
        }
      } catch (err) {
        console.error('Error fetching members', err);
      }
    };
    fetchMembers();
  }, []);

  // Load selected member plans and progress logs
  useEffect(() => {
    if (!selectedClientId) return;
    const loadMemberData = async () => {
      setLoading(true);
      try {
        const member = members.find(m => m.id === selectedClientId);
        setSelectedMember(member);

        // Fetch workout plan
        const wPlan = await api.getWorkoutPlan(selectedClientId);
        setExercises(wPlan.exercises || []);

        // Fetch diet plan
        const dPlan = await api.getDietPlan(selectedClientId);
        setMeals(dPlan.meals || []);
        setWaterTarget(dPlan.waterTargetLiters || 3.5);

        // Load progress photos and water logs from local storage key unique to client
        const progressData = localStorage.getItem(`phoenix_gym_progress_${selectedClientId}`);
        if (progressData) {
          const parsed = JSON.parse(progressData);
          setProgressPhotos(parsed.photos || []);
          setWaterLogs(parsed.waterLogs || []);
        } else {
          setProgressPhotos([]);
          setWaterLogs([]);
        }
      } catch (err) {
        console.error('Error loading member plans', err);
      } finally {
        setLoading(false);
      }
    };
    loadMemberData();
  }, [selectedClientId, members]);

  // Workout Handlers
  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: '12', weight: '', dayOfWeek: 'All Days' }]);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index, field, value) => {
    const updated = exercises.map((ex, i) => {
      if (i === index) {
        return { ...ex, [field]: value };
      }
      return ex;
    });
    setExercises(updated);
  };

  const handleSaveWorkout = async () => {
    const valid = exercises.every(ex => ex.name.trim() !== '');
    if (!valid) {
      showToastMsg('Please fill in names for all exercises.');
      return;
    }

    try {
      await api.saveWorkoutPlan(selectedClientId, exercises);
      showToastMsg('Workout plan saved successfully!');
    } catch (err) {
      showToastMsg(`Failed to save: ${err.message}`);
    }
  };

  // Diet Handlers
  const addMeal = () => {
    setMeals([...meals, { mealTime: 'Breakfast', items: '', calories: 0 }]);
  };

  const removeMeal = (index) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const handleMealChange = (index, field, value) => {
    const updated = meals.map((m, i) => {
      if (i === index) {
        return { ...m, [field]: field === 'calories' ? Number(value) : value };
      }
      return m;
    });
    setMeals(updated);
  };

  const handleSaveDiet = async () => {
    const valid = meals.every(m => m.items.trim() !== '');
    if (!valid) {
      showToastMsg('Please specify items for all meals.');
      return;
    }

    try {
      await api.saveDietPlan(selectedClientId, meals, waterTarget);
      showToastMsg('Diet & nutrition plan saved!');
    } catch (err) {
      showToastMsg(`Failed to save: ${err.message}`);
    }
  };

  // Progress Tracker Handlers (Base64 photo upload & water logger)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const newPhoto = {
        id: `PPH-${Date.now()}`,
        url: base64String,
        date: new Date().toISOString().split('T')[0]
      };
      
      const updatedPhotos = [newPhoto, ...progressPhotos];
      setProgressPhotos(updatedPhotos);
      
      // Save logs
      const savedData = { photos: updatedPhotos, waterLogs };
      localStorage.setItem(`phoenix_gym_progress_${selectedClientId}`, JSON.stringify(savedData));
      showToastMsg('Progress photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const deletePhoto = (id) => {
    if (window.confirm('Delete this progress photo?')) {
      const updated = progressPhotos.filter(p => p.id !== id);
      setProgressPhotos(updated);
      localStorage.setItem(`phoenix_gym_progress_${selectedClientId}`, JSON.stringify({ photos: updated, waterLogs }));
      showToastMsg('Photo removed.');
    }
  };

  const handleAddWaterLog = (e) => {
    e.preventDefault();
    if (!newWaterLog || Number(newWaterLog) <= 0) return;

    const log = {
      id: `WAT-${Date.now()}`,
      amount: Number(newWaterLog),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0]
    };

    const updatedLogs = [log, ...waterLogs];
    setWaterLogs(updatedLogs);
    setNewWaterLog('');

    localStorage.setItem(`phoenix_gym_progress_${selectedClientId}`, JSON.stringify({ photos: progressPhotos, waterLogs: updatedLogs }));
    showToastMsg('Water intake recorded.');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)] bg-[#030303] text-zinc-800 pb-20 md:pb-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-zinc-900 border border-[#FF5F1F]/35 text-zinc-900 px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-md text-xs font-semibold">
          {toast}
        </div>
      )}

      {/* Header controls & Member Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#FF5F1F] animate-pulse" />
            Member Progression Center
          </h2>
          <p className="text-xs text-zinc-550 mt-1">Configure workouts, meals, track weight milestones and photos.</p>
        </div>

        {/* Member Dropdown Selector */}
        <div className="w-full md:w-72">
          <label className="block text-[9px] font-black uppercase text-zinc-500 tracking-wider mb-1">Select Member Profile</label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5F1F] font-bold"
          >
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.fullName} ({m.id})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedMember && (
        <div className="space-y-6">
          {/* Tab Selection Switcher */}
          <div className="flex bg-zinc-50 p-1 border border-zinc-200 rounded-2xl max-w-md w-full">
            <button
              onClick={() => setActiveTab('workout')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'workout' ? 'bg-gradient-to-r from-red-650 to-red-500 text-zinc-900' : 'text-zinc-550 hover:text-zinc-900'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              Workout Sheet
            </button>
            <button
              onClick={() => setActiveTab('diet')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'diet' ? 'bg-gradient-to-r from-red-650 to-red-500 text-zinc-900' : 'text-zinc-550 hover:text-zinc-900'
              }`}
            >
              <Apple className="w-4 h-4" />
              Diet & Meals
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'progress' ? 'bg-gradient-to-r from-red-650 to-red-500 text-zinc-900' : 'text-zinc-550 hover:text-zinc-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              Logs & Gallery
            </button>
          </div>

          {loading ? (
            <div className="glass-panel p-8 rounded-3xl border border-zinc-200 animate-pulse text-center py-20 text-zinc-500 text-xs">
              Loading member data parameters...
            </div>
          ) : (
            <div>
              {/* 1. Workout Tab */}
              {activeTab === 'workout' && (
                <div className="glass-panel p-6 rounded-3xl border border-zinc-200 space-y-6">
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                    <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4 text-[#FF5F1F]" />
                      Active Workout Assignment
                    </h3>
                    <button
                      onClick={addExercise}
                      className="px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Exercise
                    </button>
                  </div>

                  <div className="space-y-4">
                    {exercises.length > 0 ? (
                      exercises.map((ex, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-zinc-50/70 p-4 border border-zinc-200 rounded-2xl items-center relative pr-12 md:pr-4">
                          <div className="md:col-span-4">
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Exercise Name</label>
                            <input
                              type="text"
                              value={ex.name}
                              onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                              placeholder="e.g. Incline DB Press"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5F1F]"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Sets</label>
                            <input
                              type="number"
                              value={ex.sets}
                              onChange={(e) => handleExerciseChange(idx, 'sets', e.target.value)}
                              placeholder="3"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5F1F]"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Reps</label>
                            <input
                              type="text"
                              value={ex.reps}
                              onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                              placeholder="12"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5F1F]"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Target Weight</label>
                            <input
                              type="text"
                              value={ex.weight}
                              onChange={(e) => handleExerciseChange(idx, 'weight', e.target.value)}
                              placeholder="e.g. 20kg"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5F1F]"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Day of Week</label>
                            <select
                              value={ex.dayOfWeek}
                              onChange={(e) => handleExerciseChange(idx, 'dayOfWeek', e.target.value)}
                              className="w-full px-2 py-2 bg-zinc-900 border border-zinc-200 rounded-xl text-[11px] text-zinc-500 focus:outline-none focus:border-[#FF5F1F]"
                            >
                              <option value="All Days">All Days</option>
                              <option value="Monday">Monday</option>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                              <option value="Thursday">Thursday</option>
                              <option value="Friday">Friday</option>
                              <option value="Saturday">Saturday</option>
                              <option value="Sunday">Sunday</option>
                            </select>
                          </div>
                          
                          {/* Remove button */}
                          <button
                            onClick={() => removeExercise(idx)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 md:translate-y-0 md:static p-2 text-zinc-600 hover:text-[#FF5F1F] cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 text-center py-12">No exercises configured. Tap 'Add Exercise' to begin building workout.</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-200 flex justify-end">
                    <button
                      onClick={handleSaveWorkout}
                      className="px-6 py-2.5 bg-gradient-to-r from-red-650 to-red-500 hover:from-red-500 hover:to-rose-450 text-zinc-900 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" /> Save Workout Plan
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Diet Tab */}
              {activeTab === 'diet' && (
                <div className="glass-panel p-6 rounded-3xl border border-zinc-200 space-y-6">
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                    <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Apple className="w-4 h-4 text-[#FF5F1F]" />
                      Nutrition Diet & Meal Plan
                    </h3>
                    <button
                      onClick={addMeal}
                      className="px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Meal
                    </button>
                  </div>

                  {/* Water Target Settings */}
                  <div className="bg-zinc-50 p-4 border border-zinc-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600/10 p-3 rounded-xl text-blue-400">
                        <Droplet className="w-5 h-5 fill-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900">Daily Water Intake Target</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Hydration targets improve metabolism and strength.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="10"
                        value={waterTarget}
                        onChange={(e) => setWaterTarget(Number(e.target.value))}
                        className="w-20 px-3 py-2 bg-zinc-900 border border-zinc-200 rounded-xl text-xs text-zinc-900 text-center focus:outline-none focus:border-[#FF5F1F] font-bold"
                      />
                      <span className="text-xs text-zinc-550">Liters / day</span>
                    </div>
                  </div>

                  {/* Meals Planners */}
                  <div className="space-y-4">
                    {meals.length > 0 ? (
                      meals.map((meal, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-zinc-50/70 p-4 border border-zinc-200 rounded-2xl items-center relative pr-12 md:pr-4">
                          <div className="md:col-span-3">
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Meal Time</label>
                            <select
                              value={meal.mealTime}
                              onChange={(e) => handleMealChange(idx, 'mealTime', e.target.value)}
                              className="w-full px-2 py-2 bg-zinc-900 border border-zinc-200 rounded-xl text-xs text-zinc-500 focus:outline-none focus:border-[#FF5F1F]"
                            >
                              <option value="Breakfast">Breakfast</option>
                              <option value="Pre-Workout">Pre-Workout</option>
                              <option value="Post-Workout">Post-Workout</option>
                              <option value="Lunch">Lunch</option>
                              <option value="Evening Snack">Evening Snack</option>
                              <option value="Dinner">Dinner</option>
                            </select>
                          </div>
                          
                          <div className="md:col-span-6">
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Food Items</label>
                            <input
                              type="text"
                              value={meal.items}
                              onChange={(e) => handleMealChange(idx, 'items', e.target.value)}
                              placeholder="e.g. 50g Oats, 1 Scoop Whey, Almonds"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5F1F]"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Calories (kcal)</label>
                            <input
                              type="number"
                              value={meal.calories}
                              onChange={(e) => handleMealChange(idx, 'calories', e.target.value)}
                              placeholder="450"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-[#FF5F1F]"
                            />
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => removeMeal(idx)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 md:translate-y-0 md:static p-2 text-zinc-600 hover:text-[#FF5F1F] cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 text-center py-12">No meals configured yet. Click 'Add Meal' to begin building nutrition plan.</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-200 flex justify-end">
                    <button
                      onClick={handleSaveDiet}
                      className="px-6 py-2.5 bg-gradient-to-r from-red-650 to-red-500 hover:from-red-500 hover:to-rose-450 text-zinc-900 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" /> Save Diet Plan
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Progression Logs Tab */}
              {activeTab === 'progress' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Photo Timeline Gallery */}
                  <div className="glass-panel p-6 rounded-3xl border border-zinc-200 lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                      <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#FF5F1F]" />
                        Workout Progress Gallery
                      </h3>
                      
                      {/* Photo Upload triggers */}
                      <label className="px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" /> Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {progressPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                        {progressPhotos.map((photo) => (
                          <div key={photo.id} className="group relative bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-200 shadow-md">
                            <img 
                              src={photo.url} 
                              alt="Gym progression milestone" 
                              className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                            />
                            {/* Overlay date stamp */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 opacity-90">
                              <span className="text-[10px] font-bold text-zinc-900 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#FF5F1F]" />
                                {photo.date}
                              </span>
                            </div>
                            {/* Delete button */}
                            <button
                              onClick={() => deletePhoto(photo.id)}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/20 text-zinc-550 hover:text-[#FF5F1F] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center text-zinc-550 flex flex-col items-center justify-center space-y-2.5">
                        <Camera className="w-8 h-8 text-zinc-750" />
                        <p className="text-xs">No progression milestone photos uploaded yet.</p>
                        <p className="text-[10px] text-zinc-600">Upload side-by-side training progress captures to monitor body improvements.</p>
                      </div>
                    )}
                  </div>

                  {/* Water Tracker Panel */}
                  <div className="glass-panel p-6 rounded-3xl border border-zinc-200 space-y-4">
                    <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 pb-3">
                      <Droplet className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                      Hydration Intake logs
                    </h3>

                    {/* Water intake input logger */}
                    <form onSubmit={handleAddWaterLog} className="flex gap-2 bg-zinc-50 p-2 border border-zinc-200 rounded-2xl">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="3"
                        value={newWaterLog}
                        onChange={(e) => setNewWaterLog(e.target.value)}
                        placeholder="Intake (Liters, e.g. 0.5)"
                        className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 bg-gradient-to-r from-blue-650 to-blue-500 text-zinc-900 text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center"
                      >
                        Log
                      </button>
                    </form>

                    {/* Logs History timeline */}
                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                      {waterLogs.length > 0 ? (
                        waterLogs.map((log) => (
                          <div key={log.id} className="p-3 bg-zinc-50/40 border border-zinc-200 rounded-xl flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400 font-bold bg-blue-500/5 px-2 py-0.5 border border-blue-500/10 rounded-lg">+{log.amount}L</span>
                              <span className="text-zinc-500 font-medium">{log.time}</span>
                            </div>
                            <span className="text-zinc-500 font-semibold">{log.date}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-650 text-center py-12">No water logged for this term.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
