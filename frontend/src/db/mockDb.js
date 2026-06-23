// Phoenix Gym Mock Database Layer

const LOCAL_STORAGE_KEY = 'phoenix_gym_members';
const SETTINGS_KEY = 'phoenix_gym_settings';
const PAYMENTS_KEY = 'phoenix_gym_payments';
const REMINDERS_KEY = 'phoenix_gym_reminders';

// Calculate test dates relative to current date (2026-05-27)
const getRelativeDateStr = (daysAhead) => {
  const date = new Date('2026-05-27');
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
};

const DEFAULT_MEMBERS = [
  {
    id: "PXM-1001",
    fullName: "Karthik Kumar",
    phone: "+91 94878 17301",
    whatsapp: "+91 94878 17301",
    village: "Rampur",
    address: "Near Temple, Rampur",
    gender: "Male",
    age: 24,
    joiningDate: "2026-04-28",
    plan: "Monthly",
    startDate: "2026-04-28",
    endDate: getRelativeDateStr(1), // Expiring in 1 day!
    paymentStatus: "Paid",
    status: "Active",
    notes: "Requires regular warnings for expiry."
  },
  {
    id: "PXM-1002",
    fullName: "Suresh Raina",
    phone: "+91 94878 17301",
    whatsapp: "+91 94878 17301",
    village: "Chandpur",
    address: "Gali No 3, Chandpur",
    gender: "Male",
    age: 32,
    joiningDate: "2026-04-30",
    plan: "Monthly",
    startDate: "2026-04-30",
    endDate: getRelativeDateStr(3), // Expiring in 3 days!
    paymentStatus: "Paid",
    status: "Active",
    notes: "Prefers evening cardio sessions."
  },
  {
    id: "PXM-1003",
    fullName: "Dhanush Raj",
    phone: "+91 94878 17301",
    whatsapp: "+91 94878 17301",
    village: "Sohna",
    address: "Main Market, Sohna",
    gender: "Male",
    age: 21,
    joiningDate: "2026-05-02",
    plan: "Monthly",
    startDate: "2026-05-02",
    endDate: getRelativeDateStr(5), // Expiring in 5 days!
    paymentStatus: "Paid",
    status: "Active",
    notes: "Regular morning batch powerlifter."
  },
  {
    id: "PXM-1004",
    fullName: "Neha Verma",
    phone: "9988776655",
    whatsapp: "",
    village: "Sohna",
    address: "Block B, Sohna",
    gender: "Female",
    age: 27,
    joiningDate: "2026-02-15",
    plan: "Monthly",
    startDate: "2026-04-15",
    endDate: "2026-05-15",
    paymentStatus: "Pending",
    status: "Inactive",
    notes: "Membership expired, requested pause due to exams."
  },
  {
    id: "PXM-1005",
    fullName: "Rajesh Kumar",
    phone: "9122334455",
    whatsapp: "9122334455",
    village: "Badshahpur",
    address: "Sector 66, Badshahpur",
    gender: "Male",
    age: 35,
    joiningDate: "2026-04-05",
    plan: "Half-Yearly",
    startDate: "2026-04-05",
    endDate: "2026-10-05",
    paymentStatus: "Paid",
    status: "Active",
    notes: "Focus on functional strength & stamina."
  },
  {
    id: "PXM-1006",
    fullName: "Simran Kaur",
    phone: "8877665544",
    whatsapp: "8877665544",
    village: "Sohna",
    address: "Main Market, Sohna",
    gender: "Female",
    age: 25,
    joiningDate: "2026-05-01",
    plan: "Monthly",
    startDate: "2026-05-01",
    endDate: "2026-06-01",
    paymentStatus: "Paid",
    status: "Active",
    notes: "Joined with friend Suresh."
  }
];

const DEFAULT_SETTINGS = {
  gymName: "Phoenix Fitness Academy",
  currency: "INR",
  membershipPlans: [
    { name: "Monthly (Without Cardio)", durationMonths: 1, price: 1000 },
    { name: "Quarterly (Without Cardio)", durationMonths: 3, price: 2800 },
    { name: "Half-Yearly (Without Cardio)", durationMonths: 6, price: 4500 },
    { name: "Yearly (Without Cardio)", durationMonths: 12, price: 7999 },
    { name: "Monthly (With Cardio)", durationMonths: 1, price: 1200 },
    { name: "Quarterly (With Cardio)", durationMonths: 3, price: 3200 },
    { name: "Half-Yearly (With Cardio)", durationMonths: 6, price: 5000 },
    { name: "Yearly (With Cardio)", durationMonths: 12, price: 8999 }
  ]
};

const DEFAULT_PAYMENTS = [
  { id: "TXN-101", clientId: "PXM-1001", clientName: "Karthik Kumar", amount: 1000, date: "2026-04-28", plan: "Monthly", method: "UPI" },
  { id: "TXN-102", clientId: "PXM-1002", clientName: "Suresh Raina", amount: 1000, date: "2026-04-30", plan: "Monthly", method: "Cash" },
  { id: "TXN-103", clientId: "PXM-1003", clientName: "Dhanush Raj", amount: 1000, date: "2026-05-02", plan: "Monthly", method: "UPI" },
  { id: "TXN-104", clientId: "PXM-1005", clientName: "Rajesh Kumar", amount: 5000, date: "2026-04-05", plan: "Half-Yearly", method: "UPI" }
];

const DEFAULT_REMINDERS = [
  { id: "REM-101", clientName: "Karthik Kumar", phone: "+91 94878 17301", date: "2026-05-26", type: "WhatsApp", status: "Sent", message: "Hello Karthik Kumar, your Phoenix Fitness Academy membership expires in 1 day(s). Please renew your membership to continue uninterrupted access." }
];

export const getMembers = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_MEMBERS));
    return DEFAULT_MEMBERS;
  }
  return JSON.parse(data);
};

export const saveMembers = (members) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
};

export const getSettings = () => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  const parsed = JSON.parse(data);
  // Migrate old plans to new 8-plan structure automatically
  if (!parsed.membershipPlans || parsed.membershipPlans.length === 4 || !parsed.membershipPlans[0].name.includes('Cardio')) {
    parsed.membershipPlans = DEFAULT_SETTINGS.membershipPlans;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
  }
  return parsed;
};

export const saveSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getPayments = () => {
  const data = localStorage.getItem(PAYMENTS_KEY);
  if (!data) {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(DEFAULT_PAYMENTS));
    return DEFAULT_PAYMENTS;
  }
  return JSON.parse(data);
};

export const savePayments = (payments) => {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
};

export const getReminders = () => {
  const data = localStorage.getItem(REMINDERS_KEY);
  if (!data) {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(DEFAULT_REMINDERS));
    return DEFAULT_REMINDERS;
  }
  return JSON.parse(data);
};

export const saveReminders = (reminders) => {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
};

// Seed utility to fully initialize all stores on application mount
export const initializeDb = () => {
  getMembers();
  getSettings();
  getPayments();
  getReminders();
};
