import React, { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const MembersList = lazy(() => import('./pages/MembersList'));
const MemberForm = lazy(() => import('./pages/MemberForm'));
const Payments = lazy(() => import('./pages/Payments'));
const Reports = lazy(() => import('./pages/Reports'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const CheckIn = lazy(() => import('./pages/CheckIn'));
const Trainers = lazy(() => import('./pages/Trainers'));
const DietWorkout = lazy(() => import('./pages/DietWorkout'));

import { CheckCircle2 } from 'lucide-react';
import * as api from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load backend state
  const loadData = async () => {
    setLoading(true);
    try {
      await api.checkBackendHealth();
      const memberList = await api.getMembers();
      setMembers(memberList);
      const paymentList = await api.getPayments();
      setPayments(paymentList);
    } catch (err) {
      console.error('[App] Failed to load data from API:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check if session exists in localStorage for convenience
    const session = localStorage.getItem('phoenix_gym_session');
    if (session) {
      try {
        const sessionObj = JSON.parse(session);
        setUser(sessionObj.admin || sessionObj);
      } catch (err) {
        console.error('[App] Failed to parse stored session');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData.admin || userData);
    localStorage.setItem('phoenix_gym_session', JSON.stringify(userData));
    loadData();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('phoenix_gym_session');
  };

  // Add & Update Member Handler
  const handleSaveMember = async (formData) => {
    try {
      if (formData.id) {
        // Editing
        await api.updateMember(formData.id, formData);
      } else {
        // Enrolling
        await api.createMember(formData);
      }
      await loadData();
      setMemberToEdit(null);
      showToast(formData.id ? 'Member profile successfully updated!' : 'Gym member successfully registered!', 'success');
      setCurrentPage('members');
    } catch (err) {
      showToast(`Error saving member: ${err.message}`, 'error');
    }
  };

  // Delete member record
  const handleDeleteMember = async (id) => {
    if (window.confirm(`Are you sure you want to delete member ${id}?`)) {
      try {
        await api.deleteMember(id);
        await loadData();
        showToast('Member profile deleted successfully!', 'success');
      } catch (err) {
        showToast(`Error deleting member: ${err.message}`, 'error');
      }
    }
  };

  // Toggle subscriber status quickly
  const handleToggleStatus = async (id) => {
    try {
      const memberObj = members.find(m => m.id === id);
      if (!memberObj) return;
      await api.toggleStatus(id, memberObj.status);
      await loadData();
      showToast('Member status updated successfully!', 'success');
    } catch (err) {
      showToast(`Error updating status: ${err.message}`, 'error');
    }
  };

  const handleEditMemberTrigger = (member) => {
    setMemberToEdit(member);
    setCurrentPage('edit-member');
  };

  // Record Manual Payments
  const handleAddPayment = async (paymentData) => {
    try {
      await api.createPayment(paymentData);
      await loadData();
      showToast('Payment recorded successfully!', 'success');
    } catch (err) {
      showToast(`Error recording payment: ${err.message}`, 'error');
    }
  };

  // Quick mark outstanding balances as Paid
  const handleMarkAsPaid = async (clientId, amount, plan) => {
    const memberObj = members.find(m => m.id === clientId);
    if (!memberObj) return;

    await handleAddPayment({
      clientId,
      clientName: memberObj.fullName,
      amount,
      plan,
      method: 'UPI'
    });
  };

  // Render correct dashboard view based on active tab
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard members={members} payments={payments} setPage={setCurrentPage} loading={loading} />;
      case 'members':
        return (
          <MembersList 
            members={members} 
            onDeleteMember={handleDeleteMember} 
            onToggleStatus={handleToggleStatus} 
            onEditMember={handleEditMemberTrigger}
            setPage={setCurrentPage} 
            loading={loading}
          />
        );
      case 'add-member':
        return (
          <MemberForm 
            onSave={handleSaveMember} 
            onCancel={() => setCurrentPage('members')} 
          />
        );
      case 'edit-member':
        return (
          <MemberForm 
            memberToEdit={memberToEdit} 
            onSave={handleSaveMember} 
            onCancel={() => {
              setMemberToEdit(null);
              setCurrentPage('members');
            }} 
          />
        );
      case 'payments':
        return (
          <Payments 
            members={members} 
            payments={payments} 
            onAddPayment={handleAddPayment} 
            onMarkAsPaid={handleMarkAsPaid} 
            loading={loading}
          />
        );
      case 'reports':
        return <Reports members={members} payments={payments} />;
      case 'notifications':
        return <Notifications members={members} payments={payments} onMarkAsPaid={handleMarkAsPaid} setPage={setCurrentPage} />;
      case 'settings':
        return <Settings onSettingsUpdate={loadData} />;
      case 'check-in':
        return <CheckIn setPage={setCurrentPage} />;
      case 'trainers':
        return <Trainers />;
      case 'diet-workout':
        return <DietWorkout />;
      default:
        return <Dashboard members={members} payments={payments} setPage={setCurrentPage} loading={loading} />;
    }
  };

  // Route guarding (Must log in to access telemetry)
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Active Title configuration
  const pageTitles = {
    dashboard: 'Core Metrics Telemetry',
    members: 'Gym Members Directory',
    'add-member': 'Enroll Gym Member',
    'edit-member': 'Modify Member Profile',
    payments: 'Billing & Fee Receipts',
    reports: 'System Performance Reports',
    notifications: 'Alert Center Feed',
    settings: 'Gym configurations & custom pricing',
    'check-in': 'Member QR Check-In Scanner',
    trainers: 'Gym Trainers & Batches',
    'diet-workout': 'Progression, Workout & Diet Plans',
  };

  return (
    <div className="flex bg-[#030303] min-h-screen w-full max-w-full text-slate-100 font-sans overflow-x-hidden">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-zinc-900/95 border border-emerald-500/30 text-slate-100 px-5 py-4 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.15)] backdrop-blur-md transition-all duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-white">Success Action Logged</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Sidebar navigation */}
      <Sidebar 
        currentPage={currentPage === 'edit-member' ? 'members' : currentPage} 
        setCurrentPage={setCurrentPage} 
        onLogout={handleLogout} 
      />

      {/* Main Container Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Global header bar */}
        <Header 
          title={pageTitles[currentPage] || 'Phoenix System'} 
          user={user} 
          setPage={setCurrentPage}
        />
        
        {/* Page content window */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-16 md:pb-0">
          <Suspense fallback={
            <div className="p-8 text-center text-zinc-500 animate-pulse text-xs py-20 bg-[#030303] min-h-screen">
              Loading component modules...
            </div>
          }>
            {renderPage()}
          </Suspense>
        </main>
      </div>

      {/* Bottom navigation for mobile */}
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
}
