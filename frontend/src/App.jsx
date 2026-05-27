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
    setCurrentPage('members');
  };

  // Delete member record
  const handleDeleteMember = (id) => {
    if (window.confirm(`Are you sure you want to delete member ${id}?`)) {
      const updated = members.filter(m => m.id !== id);
      setMembers(updated);
      saveMembers(updated);
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
    <div className="flex bg-[#030303] min-h-screen text-slate-100 font-sans overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar 
        currentPage={currentPage === 'edit-member' ? 'members' : currentPage} 
        setCurrentPage={setCurrentPage} 
        onLogout={handleLogout} 
      />

      {/* Main Container Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global header bar */}
        <Header 
          title={pageTitles[currentPage] || 'Phoenix System'} 
          user={user} 
          setPage={setCurrentPage}
        />
        
        {/* Page content window */}
        <main className="flex-1 overflow-hidden">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
