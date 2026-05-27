import express from 'express';
import { createPayment, getPayments } from '../controllers/paymentController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPayments)
  .post(createPayment);

export default router;
