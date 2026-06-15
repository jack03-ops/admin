import express from 'express';
import { getAttendanceLogs, checkInMember } from '../controllers/attendanceController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Gate all attendance endpoints behind JWT protect middleware
router.use(protect);

router.route('/')
  .get(getAttendanceLogs);

router.post('/check-in', checkInMember);

export default router;
