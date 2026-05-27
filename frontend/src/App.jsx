import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MembersList from './pages/MembersList';
import MemberForm from './pages/MemberForm';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { 
  CheckCircle2,
  LayoutDashboard,
  Users,
  CreditCard,
  MoreHorizontal,
  X,
  BarChart3,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  UserPlus
} from 'lucide-react';
import { 
  getMembers, 
  saveMembers, 
  getPayments, 
  savePayments, 
  initializeDb 
} from './db/mockDb';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [toast, setToast] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Initialize DB and load state
  useEffect(() => {
    initializeDb();
    setMembers(getMembers());
    setPayments(getPayments());

    // Check if session exists in localStorage for convenience
    const session = localStorage.getItem('phoenix_gym_session');
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('phoenix_gym_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('phoenix_gym_session');
    setIsMobileMenuOpen(false);
  };

  // Add & Update Member Handler
  const handleSaveMember = (formData) => {
    let updatedMembers = [];
    if (formData.id) {
      // Editing
      updatedMembers = members.map(m => m.id === formData.id ? formData : m);
    } else {
      // Create auto Client ID
      const nextId = 1001 + members.length;
      const newId = `PXM-${nextId}`;
      const newMember = { ...formData, id: newId };
      updatedMembers = [...members, newMember];
      
      // Also register initial payment log if Paid
      if (formData.paymentStatus === 'Paid') {
        const txnId = `TXN-${101 + payments.length}`;
        const newTxn = {
          id: txnId,
          clientId: newId,
          clientName: formData.fullName,
          amount: 1000, // base default fallback
          date: formData.startDate,
          plan: formData.plan,
          method: 'UPI'
        };
        const updatedPayments = [...payments, newTxn];
        setPayments(updatedPayments);
        savePayments(updatedPayments);
      }
    }
    
    setMembers(updatedMembers);
    saveMembers(updatedMembers);
    setMemberToEdit(null);
    showToast(formData.id ? 'Member profile successfully updated!' : 'Gym member successfully registered!', 'success');
    setCurrentPage('members');
  };

  // Delete member record
  const handleDeleteMember = (id) => {
    if (window.confirm(`Are you sure you want to delete member ${id}?`)) {
      const updated = members.filter(m => m.id !== id);
      setMembers(updated);
      saveMembers(updated);
      showToast('Member profile deleted successfully!', 'success');
    }
  };

  // Toggle subscriber status quickly
  const handleToggleStatus = (id) => {
    const updated = members.map(m => {
      if (m.id === id) {
        return { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return m;
    });
    setMembers(updated);
    saveMembers(updated);
    showToast('Member status updated successfully!', 'success');
  };

  const handleEditMemberTrigger = (member) => {
    setMemberToEdit(member);
    setCurrentPage('edit-member');
  };

  // Record Manual Payments
  const handleAddPayment = (paymentData) => {
    const txnId = `TXN-${101 + payments.length}`;
    const newTxn = {
      id: txnId,
      ...paymentData,
      date: new Date().toISOString().split('T')[0]
    };
    const updatedPayments = [...payments, newTxn];
    setPayments(updatedPayments);
    savePayments(updatedPayments);

    // Update member payment status as Paid
    const updatedMembers = members.map(m => {
      if (m.id === paymentData.clientId) {
        return { ...m, paymentStatus: 'Paid' };
      }
      return m;
    });
    setMembers(updatedMembers);
    saveMembers(updatedMembers);
  };

  // Quick mark outstanding balances as Paid
  const handleMarkAsPaid = (clientId, amount, plan) => {
    const memberObj = members.find(m => m.id === clientId);
    if (!memberObj) return;

    handleAddPayment({
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
        return <Dashboard members={members} payments={payments} setPage={setCurrentPage} />;
      case 'members':
        return (
          <MembersList 
            members={members} 
            onDeleteMember={handleDeleteMember} 
            onToggleStatus={handleToggleStatus} 
            onEditMember={handleEditMemberTrigger}
            setPage={setCurrentPage} 
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
          />
        );
      case 'reports':
        return <Reports members={members} payments={payments} />;
      case 'notifications':
        return <Notifications members={members} payments={payments} onMarkAsPaid={handleMarkAsPaid} setPage={setCurrentPage} />;
      case 'settings':
        return <Settings onSettingsUpdate={() => setMembers(getMembers())} />;
      default:
        return <Dashboard members={members} payments={payments} setPage={setCurrentPage} />;
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
  };

  return (
    <div className="flex bg-[#030303] min-h-screen w-full max-w-full text-slate-100 font-sans overflow-x-hidden pb-20 md:pb-0">
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

      {/* Sidebar navigation (Desktop only) */}
      <div className="hidden md:flex">
        <Sidebar 
          currentPage={currentPage === 'edit-member' ? 'members' : currentPage} 
          setCurrentPage={setCurrentPage} 
          onLogout={handleLogout} 
        />
      </div>

      {/* Main Container Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Global header bar */}
        <Header 
          title={pageTitles[currentPage] || 'Phoenix System'} 
          user={user} 
          setPage={setCurrentPage}
        />
        
        {/* Page content window */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      {/* Bottom Mobile Navigation (Mobile only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950/90 border-t border-zinc-900 backdrop-blur-xl z-40 flex items-center justify-around px-4">
        <button 
          onClick={() => { setCurrentPage('dashboard'); setIsMobileMenuOpen(false); }}
          className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors ${currentPage === 'dashboard' ? 'text-red-500 font-bold' : 'text-zinc-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px]">Dashboard</span>
        </button>

        <button 
          onClick={() => { setCurrentPage('members'); setIsMobileMenuOpen(false); }}
          className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors ${(currentPage === 'members' || currentPage === 'add-member' || currentPage === 'edit-member') ? 'text-red-500 font-bold' : 'text-zinc-400'}`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px]">Members</span>
        </button>

        <button 
          onClick={() => { setCurrentPage('payments'); setIsMobileMenuOpen(false); }}
          className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors ${currentPage === 'payments' ? 'text-red-500 font-bold' : 'text-zinc-400'}`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[9px]">Payments</span>
        </button>

        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center justify-center gap-1 py-1 cursor-pointer transition-colors ${isMobileMenuOpen ? 'text-red-500 font-bold' : 'text-zinc-400'}`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[9px]">More</span>
        </button>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden flex justify-end transition-opacity duration-300">
          <div className="w-[80%] max-w-sm bg-zinc-950 h-full border-l border-zinc-900 flex flex-col justify-between p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-900/50 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-8 mt-10">
              <div>
                <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Phoenix Gym</h3>
                <p className="text-[10px] text-zinc-400">Gym Administration Console</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => { setCurrentPage('add-member'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentPage === 'add-member' ? 'bg-red-500/10 text-red-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="text-xs">Enroll Member</span>
                </button>

                <button
                  onClick={() => { setCurrentPage('reports'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentPage === 'reports' ? 'bg-red-500/10 text-red-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-xs">Reports Stats</span>
                </button>

                <button
                  onClick={() => { setCurrentPage('notifications'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentPage === 'notifications' ? 'bg-red-500/10 text-red-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="text-xs">Alert Notifications</span>
                </button>

                <button
                  onClick={() => { setCurrentPage('settings'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentPage === 'settings' ? 'bg-red-500/10 text-red-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  <SettingsIcon className="w-5 h-5" />
                  <span className="text-xs">Settings & Configuration</span>
                </button>
              </nav>
            </div>

            <div className="border-t border-zinc-900 pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all font-semibold"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-xs">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

