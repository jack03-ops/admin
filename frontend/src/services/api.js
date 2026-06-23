// Unified API Service Layer for Phoenix Gym Admin
import * as mockDb from '../db/mockDb';

const API_BASE = 'http://localhost:5001/api';
let isBackendOnline = null;

// Test connectivity to the backend API
export const checkBackendHealth = async () => {
  try {
    const res = await fetch('http://localhost:5001/health', { signal: AbortSignal.timeout(1500) });
    const data = await res.json();
    isBackendOnline = res.ok && data.success;
    console.log(`[API Service] Backend health check: ${isBackendOnline ? 'ONLINE' : 'OFFLINE'}`);
    return isBackendOnline;
  } catch (err) {
    isBackendOnline = false;
    console.warn('[API Service] Backend is offline. Falling back to Local Storage Database.');
    return false;
  }
};

const getHeaders = () => {
  const session = localStorage.getItem('phoenix_gym_session');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (session) {
    try {
      const { token } = JSON.parse(session);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('[API Service] Error decoding session token', e);
    }
  }
  return headers;
};

// Map credentials for demo compatibility:
// If frontend requests demo 'admin@phoenixgym.com' / 'admin123', we send backend seeds: 'Phoenix03' / 'PhoenixUlaga03'.
export const login = async (usernameOrEmail, password) => {
  let u = usernameOrEmail;
  let p = password;
  if (usernameOrEmail === 'admin@phoenixgym.com' && password === 'admin123') {
    u = 'Phoenix03';
    p = 'PhoenixUlaga03';
  }

  if (isBackendOnline === null) {
    await checkBackendHealth();
  }

  if (!isBackendOnline) {
    // Mock authentication
    if (usernameOrEmail === 'admin@phoenixgym.com' && password === 'admin123') {
      return {
        success: true,
        token: 'mock_jwt_token_123',
        admin: { username: 'Phoenix03', role: 'admin', name: 'Phoenix Gym Manager (Local)' }
      };
    }
    throw new Error('Invalid email or password (Local Mode).');
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: u, password: p }),
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Authentication failed');
  }
  return {
    success: true,
    token: data.token,
    admin: { ...data.admin, name: 'Phoenix Gym Manager' }
  };
};

export const getMembers = async (params = {}) => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    return mockDb.getMembers();
  }

  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.field) queryParams.append('field', params.field);
  if (params.status) queryParams.append('status', params.status);

  const res = await fetch(`${API_BASE}/members?${queryParams.toString()}`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch members');
  
  // Normalize response schemas: backend uses clientId & activeStatus, frontend expects id & status
  return data.data.map(m => ({
    ...m,
    id: m.clientId || m.id,
    status: m.activeStatus ? 'Active' : 'Inactive',
    startDate: m.startDate ? m.startDate.split('T')[0] : '',
    endDate: m.endDate ? m.endDate.split('T')[0] : '',
    joiningDate: m.joiningDate ? m.joiningDate.split('T')[0] : '',
    dob: m.dob ? m.dob.split('T')[0] : ''
  }));
};

export const createMember = async (memberData) => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    const list = mockDb.getMembers();
    const nextId = `PXM-${1001 + list.length}`;
    const newMember = {
      ...memberData,
      id: nextId,
      status: memberData.status || 'Active',
      paymentStatus: memberData.paymentStatus || 'Pending'
    };
    mockDb.saveMembers([...list, newMember]);
    
    // Auto-record initial payment if Paid
    if (memberData.paymentStatus === 'Paid') {
      const txns = mockDb.getPayments();
      const selectedPlan = mockDb.getSettings().membershipPlans.find(p => p.name === memberData.plan);
      const price = Number(memberData.amountPaid) || (selectedPlan ? selectedPlan.price : 1000);
      const newTx = {
        id: `TXN-${101 + txns.length}`,
        clientId: nextId,
        clientName: memberData.fullName,
        amount: price,
        date: memberData.startDate || new Date().toISOString().split('T')[0],
        plan: memberData.plan,
        method: 'UPI'
      };
      mockDb.savePayments([...txns, newTx]);
    }
    return newMember;
  }

  // Format data for backend schema requirements
  const payload = {
    ...memberData,
    activeStatus: memberData.status === 'Active'
  };

  const res = await fetch(`${API_BASE}/members`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to enroll member');
  return {
    ...data.data,
    id: data.data.clientId,
    status: data.data.activeStatus ? 'Active' : 'Inactive'
  };
};

export const updateMember = async (id, memberData) => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    const list = mockDb.getMembers();
    const updated = list.map(m => m.id === id ? { ...m, ...memberData } : m);
    mockDb.saveMembers(updated);
    return updated.find(m => m.id === id);
  }

  // Find MongoDB document id from member first
  const membersRes = await fetch(`${API_BASE}/members`, { headers: getHeaders() });
  const membersData = await membersRes.json();
  const dbMember = membersData.data.find(m => m.clientId === id || m._id === id);
  if (!dbMember) throw new Error('Member not found in backend database');

  const payload = {
    ...memberData,
    activeStatus: memberData.status === 'Active'
  };

  const res = await fetch(`${API_BASE}/members/${dbMember._id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update member profile');
  return {
    ...data.data,
    id: data.data.clientId,
    status: data.data.activeStatus ? 'Active' : 'Inactive'
  };
};

export const deleteMember = async (id) => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    const list = mockDb.getMembers();
    const updated = list.filter(m => m.id !== id);
    mockDb.saveMembers(updated);
    return true;
  }

  const membersRes = await fetch(`${API_BASE}/members`, { headers: getHeaders() });
  const membersData = await membersRes.json();
  const dbMember = membersData.data.find(m => m.clientId === id || m._id === id);
  if (!dbMember) throw new Error('Member not found in database');

  const res = await fetch(`${API_BASE}/members/${dbMember._id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to delete member');
  }
  return true;
};

export const toggleStatus = async (id, currentStatus) => {
  const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
  return updateMember(id, { status: nextStatus });
};

export const renewMembership = async (id, planName, method = 'UPI') => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    const list = mockDb.getMembers();
    const member = list.find(m => m.id === id);
    if (!member) throw new Error('Member not found');
    
    const today = new Date().toISOString().split('T')[0];
    const durationMonths = planName === 'Yearly' ? 12 : planName === 'Half-Yearly' ? 6 : planName === 'Quarterly' ? 3 : 1;
    const endDateObj = new Date();
    endDateObj.setMonth(endDateObj.getMonth() + durationMonths);
    const newEnd = endDateObj.toISOString().split('T')[0];
    
    member.plan = planName;
    member.startDate = today;
    member.endDate = newEnd;
    member.status = 'Active';
    member.paymentStatus = 'Paid';
    
    mockDb.saveMembers(list);
    
    // Add transaction
    const txns = mockDb.getPayments();
    const price = planName === 'Yearly' ? 9000 : planName === 'Half-Yearly' ? 5000 : planName === 'Quarterly' ? 2700 : 1000;
    const newTx = {
      id: `TXN-${101 + txns.length}`,
      clientId: id,
      clientName: member.fullName,
      amount: price,
      date: today,
      plan: planName,
      method
    };
    mockDb.savePayments([...txns, newTx]);
    return { member, payment: newTx };
  }

  const membersRes = await fetch(`${API_BASE}/members`, { headers: getHeaders() });
  const membersData = await membersRes.json();
  const dbMember = membersData.data.find(m => m.clientId === id || m._id === id);
  if (!dbMember) throw new Error('Member not found in database');

  const res = await fetch(`${API_BASE}/members/${dbMember._id}/renew`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ planName, method })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Renewal failed');
  return data;
};

export const getPayments = async () => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    return mockDb.getPayments();
  }

  const res = await fetch(`${API_BASE}/payments`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load payments ledger');
  
  return data.data.map(p => ({
    ...p,
    id: p.receiptId || p.id,
    date: p.date ? p.date.split('T')[0] : ''
  }));
};

export const createPayment = async (paymentData) => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    const txns = mockDb.getPayments();
    const newTx = {
      id: `TXN-${101 + txns.length}`,
      ...paymentData,
      date: new Date().toISOString().split('T')[0]
    };
    mockDb.savePayments([...txns, newTx]);
    
    // Mark member paid
    const list = mockDb.getMembers();
    const member = list.find(m => m.id === paymentData.clientId);
    if (member) {
      member.paymentStatus = 'Paid';
      mockDb.saveMembers(list);
    }
    return newTx;
  }

  const res = await fetch(`${API_BASE}/payments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(paymentData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit payment record');
  return data.data;
};

export const getReports = async (cycle = 'monthly') => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    // Generate reports dynamically based on mock database state
    const members = mockDb.getMembers();
    const payments = mockDb.getPayments();
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const active = members.filter(m => m.status === 'Active').length;
    const pending = members.filter(m => m.paymentStatus === 'Pending').length;
    
    const methodBreakdown = { UPI: 0, Cash: 0, Card: 0, "Net Banking": 0 };
    payments.forEach(p => {
      const m = p.method === 'UPI' ? 'UPI' : p.method === 'Cash' ? 'Cash' : p.method === 'Card' ? 'Card' : 'Net Banking';
      methodBreakdown[m] = (methodBreakdown[m] || 0) + p.amount;
    });

    return {
      success: true,
      cycle,
      data: {
        totalNewMembers: members.length,
        activeMemberships: active,
        inactiveMemberships: members.length - active,
        expiredMemberships: members.filter(m => new Date(m.endDate) < new Date()).length,
        pendingPayments: pending,
        revenueInRange: totalRevenue,
        totalRevenueAllTime: totalRevenue,
        allTimeMembers: members.length,
        paymentMethodsBreakdown: methodBreakdown
      }
    };
  }

  const res = await fetch(`${API_BASE}/reports?cycle=${cycle}`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to pull reports analytics');
  return data;
};

export const getNotificationConfig = async () => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    return {
      testMode: true,
      testRecipient: "+91 94878 17301",
      senderPhoneId: "Mock (Offline)",
      hasToken: false,
      templateName: "Mock (Fallback to custom text)"
    };
  }

  const res = await fetch(`${API_BASE}/notifications/config`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch WhatsApp config');
  return data.data;
};

export const getReminders = async () => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    return mockDb.getReminders();
  }

  const res = await fetch(`${API_BASE}/notifications/logs`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch reminder logs');
  return data.data.map(l => ({
    ...l,
    id: l._id || l.id,
    date: l.createdAt ? l.createdAt.split('T')[0] : ''
  }));
};

export const triggerReminders = async () => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    // Triggers local mock scanning and log generation
    const members = mockDb.getMembers();
    const reminders = mockDb.getReminders();
    const today = new Date('2026-05-27');
    let added = 0;
    
    members.forEach(member => {
      if (member.status !== 'Active') return;
      const end = new Date(member.endDate);
      const diffTime = end - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if ([1, 3, 5].includes(diffDays)) {
        const channels = ['WhatsApp', 'SMS'];
        channels.forEach(ch => {
          const duplicate = reminders.some(r => r.clientName === member.fullName && r.date === '2026-05-27' && r.type === ch);
          if (duplicate) return;

          const reminderMsg = `Hello ${member.fullName}, your Phoenix Gym membership expires in ${diffDays} day(s). Please renew your membership to continue uninterrupted access.`;
          reminders.unshift({
            id: `REM-${101 + reminders.length}`,
            clientName: member.fullName,
            phone: "+91 9487817301",
            date: "2026-05-27",
            type: ch,
            status: "Sent",
            message: reminderMsg
          });
          added++;
        });
      }
    });

    if (added > 0) {
      mockDb.saveReminders(reminders);
    }
    return {
      success: true,
      message: `Local scan completed. Dispatched ${added} mock alerts.`,
      dispatched: added
    };
  }

  const res = await fetch(`${API_BASE}/notifications/auto-reminders`, {
    method: 'POST',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Auto reminder scan failed');
  return data;
};

export const getAttendanceLogs = async () => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    const data = localStorage.getItem('phoenix_gym_attendance');
    return data ? JSON.parse(data) : [];
  }

  const res = await fetch(`${API_BASE}/attendance`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to pull attendance logs');
  return data.data;
};

export const checkInMember = async (clientId) => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    const list = mockDb.getMembers();
    const member = list.find(m => m.id === clientId);
    if (!member) throw new Error(`No member found with Client ID ${clientId}.`);
    if (member.status !== 'Active') throw new Error('Membership status is Inactive.');

    const logs = localStorage.getItem('phoenix_gym_attendance');
    const logsList = logs ? JSON.parse(logs) : [];

    const isExpired = new Date(member.endDate) < new Date();
    const newLog = {
      id: `ATT-${101 + logsList.length}`,
      memberId: member.id,
      clientId: member.id,
      clientName: member.fullName,
      checkInTime: new Date().toISOString(),
      method: 'QR Code'
    };

    logsList.unshift(newLog);
    localStorage.setItem('phoenix_gym_attendance', JSON.stringify(logsList));

    return {
      success: true,
      alreadyCheckedIn: false,
      message: isExpired ? `Checked in ${member.fullName} successfully, but their membership has EXPIRED.` : `Checked in ${member.fullName} successfully.`,
      data: newLog,
      member: {
        fullName: member.fullName,
        clientId: member.id,
        plan: member.plan,
        isExpired
      }
    };
  }

  const res = await fetch(`${API_BASE}/attendance/check-in`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ clientId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Check-in failed');
  return data;
};

export const getTrainers = async () => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    const data = localStorage.getItem('phoenix_gym_trainers');
    if (!data) {
      const defaultTrainers = [
        { id: "TR-101", name: 'Vikram Rathore', phone: '+91 9988776655', specialty: 'Strength & Conditioning', schedule: 'Morning Batch', assignedCount: 2 },
        { id: "TR-102", name: 'Priya Sharma', phone: '+91 8877665544', specialty: 'Cardio & Yoga', schedule: 'Evening Batch', assignedCount: 1 },
        { id: "TR-103", name: 'Amit Singh', phone: '+91 9122334455', specialty: 'Powerlifting & CrossFit', schedule: 'Full Time', assignedCount: 0 }
      ];
      localStorage.setItem('phoenix_gym_trainers', JSON.stringify(defaultTrainers));
      return defaultTrainers;
    }
    return JSON.parse(data);
  }

  const res = await fetch(`${API_BASE}/trainers`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to pull trainers');
  return data.data.map(t => ({
    ...t,
    id: t._id || t.id
  }));
};

export const createTrainer = async (trainerData) => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    const list = await getTrainers();
    const newTrainer = {
      ...trainerData,
      id: `TR-${101 + list.length}`,
      assignedCount: 0
    };
    localStorage.setItem('phoenix_gym_trainers', JSON.stringify([...list, newTrainer]));
    return newTrainer;
  }

  const res = await fetch(`${API_BASE}/trainers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(trainerData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add trainer');
  return data.data;
};

export const updateTrainer = async (id, trainerData) => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    const list = await getTrainers();
    const updated = list.map(t => t.id === id ? { ...t, ...trainerData } : t);
    localStorage.setItem('phoenix_gym_trainers', JSON.stringify(updated));
    return updated.find(t => t.id === id);
  }

  const res = await fetch(`${API_BASE}/trainers/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(trainerData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update trainer');
  return data.data;
};

export const deleteTrainer = async (id) => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    const list = await getTrainers();
    const updated = list.filter(t => t.id !== id);
    localStorage.setItem('phoenix_gym_trainers', JSON.stringify(updated));
    return true;
  }

  const res = await fetch(`${API_BASE}/trainers/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to delete trainer');
  }
  return true;
};

export const getWorkoutPlan = async (clientId) => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    const data = localStorage.getItem(`phoenix_gym_workout_${clientId}`);
    if (!data) {
      return { clientId, memberName: '', exercises: [] };
    }
    return JSON.parse(data);
  }

  const res = await fetch(`${API_BASE}/workout/${clientId}`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch workout plan');
  return data.data;
};

export const saveWorkoutPlan = async (clientId, exercises) => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    const data = { clientId, exercises, lastUpdatedBy: 'Admin (Local)' };
    localStorage.setItem(`phoenix_gym_workout_${clientId}`, JSON.stringify(data));
    return data;
  }

  const res = await fetch(`${API_BASE}/workout/${clientId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ exercises })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to save workout plan');
  return data.data;
};

export const getDietPlan = async (clientId) => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    const data = localStorage.getItem(`phoenix_gym_diet_${clientId}`);
    if (!data) {
      return { clientId, memberName: '', meals: [], waterTargetLiters: 3.5 };
    }
    return JSON.parse(data);
  }

  const res = await fetch(`${API_BASE}/diet/${clientId}`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch diet plan');
  return data.data;
};

export const saveDietPlan = async (clientId, meals, waterTargetLiters = 3.5) => {
  if (isBackendOnline === null) await checkBackendHealth();

  if (!isBackendOnline) {
    const data = { clientId, meals, waterTargetLiters, lastUpdatedBy: 'Admin (Local)' };
    localStorage.setItem(`phoenix_gym_diet_${clientId}`, JSON.stringify(data));
    return data;
  }

  const res = await fetch(`${API_BASE}/diet/${clientId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ meals, waterTargetLiters })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to save diet plan');
  return data.data;
};
