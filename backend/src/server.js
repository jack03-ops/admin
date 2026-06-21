import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';

// Load model structures
import Admin from './models/Admin.js';
import Plan from './models/Plan.js';
import Trainer from './models/Trainer.js';

// Load route routers
import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import trainerRoutes from './routes/trainerRoutes.js';
import workoutDietRoutes from './routes/workoutDietRoutes.js';

// Init env setup
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Administrative and Plan seeding hooks
const seedDatabase = async () => {
  try {
    // 1. Seed Admin credentials
    const adminExists = await Admin.findOne({ username: 'Phoenix03' });
    if (!adminExists) {
      await Admin.create({
        username: 'Phoenix03',
        password: 'PhoenixUlaga03', // encrypted by pre-save hook automatically!
        role: 'admin'
      });
      console.log('[Seeding] Secure Admin credentials created (Username: Phoenix03).');
    }

    // 2. Seed Default Membership Plans
    await Plan.deleteMany({});
    await Plan.insertMany([
      { name: 'Monthly (Without Cardio)', durationMonths: 1, price: 1000 },
      { name: 'Quarterly (Without Cardio)', durationMonths: 3, price: 2800 },
      { name: 'Half-Yearly (Without Cardio)', durationMonths: 6, price: 4500 },
      { name: 'Yearly (Without Cardio)', durationMonths: 12, price: 7999 },
      { name: 'Monthly (With Cardio)', durationMonths: 1, price: 1200 },
      { name: 'Quarterly (With Cardio)', durationMonths: 3, price: 3200 },
      { name: 'Half-Yearly (With Cardio)', durationMonths: 6, price: 5000 },
      { name: 'Yearly (With Cardio)', durationMonths: 12, price: 8999 }
    ]);
    console.log('[Seeding] Standard gym membership plans updated (Plan 1 & Plan 2).');

    // 3. Seed Default Trainers
    const trainersCount = await Trainer.countDocuments();
    if (trainersCount === 0) {
      await Trainer.insertMany([
        { name: 'Vikram Rathore', phone: '+91 9988776655', specialty: 'Strength & Conditioning', schedule: 'Morning Batch' },
        { name: 'Priya Sharma', phone: '+91 8877665544', specialty: 'Cardio & Yoga', schedule: 'Evening Batch' },
        { name: 'Amit Singh', phone: '+91 9122334455', specialty: 'Powerlifting & CrossFit', schedule: 'Full Time' }
      ]);
      console.log('[Seeding] Standard gym trainers configured.');
    }
  } catch (error) {
    console.error(`[Seeding Error] ${error.message}`);
  }
};

// Execute seeding on launch
seedDatabase();

// Initialize automated background scheduler
import { initScheduler } from './services/scheduler.js';
initScheduler();

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api', workoutDietRoutes);

// Base Status Route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Phoenix Fitness Academy API Service is healthy.' });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Phoenix Server] Telemetry active on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
