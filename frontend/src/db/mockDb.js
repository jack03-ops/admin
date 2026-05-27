// Phoenix Gym Mock Database Layer

const LOCAL_STORAGE_KEY = 'phoenix_gym_members';
const SETTINGS_KEY = 'phoenix_gym_settings';
const PAYMENTS_KEY = 'phoenix_gym_payments';

const DEFAULT_MEMBERS = [
  {
    id: "PXM-1001",
    fullName: "Arjun Singh",
    phone: "9876543210",
    whatsapp: "9876543210",
    village: "Rampur",
    address: "Near Temple, Rampur",
    gender: "Male",
    age: 24,
    joiningDate: "2026-01-10",
    plan: "Quarterly",
    startDate: "2026-04-10",
    endDate: "2026-07-10",
    paymentStatus: "Paid",
    status: "Active",
    notes: "Regular morning batch powerlifter."
  },
  {
    id: "PXM-1002",
    fullName: "Priya Sharma",
    phone: "8765432109",
    whatsapp: "8765432109",
    village: "Chandpur",
    address: "Gali No 3, Chandpur",
    gender: "Female",
    age: 22,
    joiningDate: "2025-12-15",
    plan: "Yearly",
    startDate: "2025-12-15",
    endDate: "2026-12-15",
    paymentStatus: "Paid",
    status: "Active",
    notes: "Prefers evening cardio sessions."
  },
  {
    id: "PXM-1003",
    fullName: "Vikram Rathore",
    phone: "7654321098",
    whatsapp: "7654321098",
    village: "Rampur",
    address: "Farmhouse Road, Rampur",
    gender: "Male",
    age: 29,
    joiningDate: "2026-03-01",
    plan: "Monthly",
    startDate: "2026-05-01",
    endDate: "2026-06-01",
    paymentStatus: "Pending",
    status: "Active",
    notes: "Requires posture correction guidance."
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
    notes: "Joined with friend Priya."
  },
  {
    id: "PXM-1007",
    fullName: "Amit Patel",
    phone: "9001122334",
    whatsapp: "",
    village: "Chandpur",
    address: "Near Post Office, Chandpur",
    gender: "Male",
    age: 31,
    joiningDate: "2026-02-10",
    plan: "Quarterly",
    startDate: "2026-02-10",
    endDate: "2026-05-10",
    paymentStatus: "Pending",
    status: "Inactive",
    notes: "Out of town, will renew in June."
  }
];

const DEFAULT_SETTINGS = {
  gymName: "Phoenix Fitness Gym",
  currency: "INR",
  membershipPlans: [
    { name: "Monthly", durationMonths: 1, price: 1000 },
    { name: "Quarterly", durationMonths: 3, price: 2700 },
    { name: "Half-Yearly", durationMonths: 6, price: 5000 },
    { name: "Yearly", durationMonths: 12, price: 9000 }
  ]
};

const DEFAULT_PAYMENTS = [
  { id: "TXN-101", clientId: "PXM-1001", clientName: "Arjun Singh", amount: 2700, date: "2026-04-10", plan: "Quarterly", method: "UPI" },
  { id: "TXN-102", clientId: "PXM-1002", clientName: "Priya Sharma", amount: 9000, date: "2025-12-15", plan: "Yearly", method: "Cash" },
  { id: "TXN-103", clientId: "PXM-1005", clientName: "Rajesh Kumar", amount: 5000, date: "2026-04-05", plan: "Half-Yearly", method: "UPI" },
  { id: "TXN-104", clientId: "PXM-1006", clientName: "Simran Kaur", amount: 1000, date: "2026-05-01", plan: "Monthly", method: "Net Banking" }
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
  return JSON.parse(data);
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

// Seed utility to fully initialize all stores on application mount
export const initializeDb = () => {
  getMembers();
  getSettings();
  getPayments();
};
