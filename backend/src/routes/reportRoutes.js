import express from 'express';
import { getReports } from '../controllers/reportController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getReports);

export default router;
