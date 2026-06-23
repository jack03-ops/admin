import express from 'express';
import { 
  sendInstantNotification, 
  triggerAutoReminders, 
  getNotificationLogs,
  getNotificationConfig
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.post('/send', sendInstantNotification);
router.post('/auto-reminders', triggerAutoReminders);
router.get('/logs', getNotificationLogs);
router.get('/config', getNotificationConfig);

export default router;
