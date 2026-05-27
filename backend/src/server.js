import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';

// Load model structures
import Admin from './models/Admin.js';
import Plan from './models/Plan.js';

// Load route routers
import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

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
    const plansCount = await Plan.countDocuments();
    if (plansCount === 0) {
      await Plan.insertMany([
        { name: 'Monthly', durationMonths: 1, price: 1000 },
        { name: 'Quarterly', durationMonths: 3, price: 2700 },
        { name: 'Half-Yearly', durationMonths: 6, price: 5000 },
        { name: 'Yearly', durationMonths: 12, price: 9000 }
      ]);
      console.log('[Seeding] Standard gym membership plans configured.');
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

// Base Status Route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Phoenix Gym Admin API Service is healthy.' });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Phoenix Server] Telemetry active on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
