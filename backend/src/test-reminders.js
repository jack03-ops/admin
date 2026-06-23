import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Member from './models/Member.js';
import Notification from './models/Notification.js';
import { runAutomatedReminders } from './services/scheduler.js';

dotenv.config();

const runLiveTest = async () => {
  console.log('Connecting to local MongoDB...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/phoenix_gym');
  console.log('MongoDB Connected successfully!');

  // Clear existing notifications sent today for a clean trigger state
  const today = new Date();
  today.setHours(0,0,0,0);
  const endOfToday = new Date(today);
  endOfToday.setHours(23,59,59,999);

  await Notification.deleteMany({
    createdAt: { $gte: today, $lte: endOfToday }
  });
  console.log("Cleared today's reminder dispatches for clean run.");

  // Create/Update Member 1: Expiring in 5 days
  const date5 = new Date();
  date5.setDate(date5.getDate() + 5);
  date5.setHours(12, 0, 0, 0);

  await Member.findOneAndUpdate(
    { clientId: 'PXM-TEST-5D' },
    {
      fullName: 'Aravind Swamy (5 Days Expiring Test)',
      phone: '+91 94878 17301',
      whatsapp: '+91 94878 17301',
      village: 'Rampur',
      gender: 'Male',
      age: 28,
      plan: 'Monthly',
      startDate: new Date(),
      endDate: date5,
      paymentStatus: 'Paid',
      activeStatus: true
    },
    { upsert: true, new: true }
  );
  console.log('Registered live member expiring in 5 days (Phone: +91 80155 52425)');

  // Create/Update Member 2: Expiring in 3 days
  const date3 = new Date();
  date3.setDate(date3.getDate() + 3);
  date3.setHours(12, 0, 0, 0);

  await Member.findOneAndUpdate(
    { clientId: 'PXM-TEST-3D' },
    {
      fullName: 'Prabhu Deva (3 Days Expiring Test)',
      phone: '+91 94878 17301',
      whatsapp: '+91 94878 17301',
      village: 'Chandpur',
      gender: 'Male',
      age: 34,
      plan: 'Monthly',
      startDate: new Date(),
      endDate: date3,
      paymentStatus: 'Paid',
      activeStatus: true
    },
    { upsert: true, new: true }
  );
  console.log('Registered live member expiring in 3 days (Phone: +91 80155 52425)');

  console.log('\n--- STARTING AUTOMATED SCHEDULER DISPATCH ---');
  await runAutomatedReminders();
  console.log('--- SCHEDULER DISPATCH ENDED ---\n');

  // Query database notification logs to show them live
  const logs = await Notification.find({
    createdAt: { $gte: today, $lte: endOfToday }
  }).sort({ createdAt: -1 });

  console.log('Live Dispatched Notification Ledger Logs:');
  logs.forEach(log => {
    console.log(`[${log.type}] Status: ${log.status} | To: ${log.phone} (${log.clientName})`);
    console.log(`Message: "${log.message}"\n`);
  });

  await mongoose.disconnect();
  console.log('Mongoose Disconnected successfully!');
};

runLiveTest().catch(err => {
  console.error('Error during live test run:', err);
  mongoose.disconnect();
});
