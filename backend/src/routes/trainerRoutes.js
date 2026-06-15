import express from 'express';
import { getTrainers, createTrainer, updateTrainer, deleteTrainer } from '../controllers/trainerController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Gate all trainer routes with JWT auth protect
router.use(protect);

router.route('/')
  .get(getTrainers)
  .post(createTrainer);

router.route('/:id')
  .put(updateTrainer)
  .delete(deleteTrainer);

export default router;
