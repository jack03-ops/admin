import express from 'express';
import { 
  getWorkoutPlan, 
  saveWorkoutPlan, 
  getDietPlan, 
  saveDietPlan 
} from '../controllers/workoutDietController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Gate all routes with JWT protect middleware
router.use(protect);

router.route('/workout/:clientId')
  .get(getWorkoutPlan)
  .post(saveWorkoutPlan);

router.route('/diet/:clientId')
  .get(getDietPlan)
  .post(saveDietPlan);

export default router;
