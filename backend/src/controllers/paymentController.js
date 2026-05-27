import Payment from '../models/Payment.js';
import Member from '../models/Member.js';

// @desc    Record manual billing transaction invoice
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res, next) => {
  try {
    const { clientId, amount, method, plan } = req.body;

    const member = await Member.findOne({ clientId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Gym member not found with this client ID' });
    }

    const countTx = await Payment.countDocuments();
    const receiptId = `TXN-${101 + countTx}`;

    const payment = await Payment.create({
      receiptId,
      memberId: member._id,
      clientId,
      clientName: member.fullName,
      amount,
      plan,
      method
    });

    // Automatically mark the member's payment status as Paid
    member.paymentStatus = 'Paid';
    await member.save();

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Retrieve transaction receipt ledgers
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};
