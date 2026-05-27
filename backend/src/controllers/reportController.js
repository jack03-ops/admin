import Member from '../models/Member.js';
import Payment from '../models/Payment.js';

// @desc    Get Daily, Weekly, and Monthly business performance analytics metrics
// @route   GET /api/reports
// @access  Private
export const getReports = async (req, res, next) => {
  try {
    const cycle = req.query.cycle || 'monthly'; // daily, weekly, monthly
    const today = new Date();
    let startDate = new Date();

    if (cycle === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (cycle === 'weekly') {
      startDate.setDate(today.getDate() - 7);
    } else {
      startDate.setDate(today.getDate() - 30); // Default to Monthly
    }

    // 1. Gather all active / inactive stats
    const totalMembers = await Member.countDocuments();
    const activeMembers = await Member.countDocuments({ activeStatus: true });
    const inactiveMembers = await Member.countDocuments({ activeStatus: false });

    // 2. Compute Expired memberships count
    const expiredMembers = await Member.countDocuments({ 
      activeStatus: true, 
      endDate: { $lt: today } 
    });

    // 3. Compute Pending payment members
    const pendingPaymentMembers = await Member.countDocuments({ paymentStatus: 'Pending' });

    // 4. Calculate total revenue within the range
    const rangePayments = await Payment.find({ date: { $gte: startDate } });
    const revenueRange = rangePayments.reduce((sum, p) => sum + p.amount, 0);

    // 5. Total all-time revenue collected
    const allPayments = await Payment.find();
    const totalRevenueAllTime = allPayments.reduce((sum, p) => sum + p.amount, 0);

    // 6. Registrations in range
    const newMembersInRange = await Member.countDocuments({ joiningDate: { $gte: startDate } });

    // 7. Payment method distribution breakdown
    const paymentMethods = { UPI: 0, Cash: 0, Card: 0, "Net Banking": 0 };
    allPayments.forEach(p => {
      if (paymentMethods[p.method] !== undefined) {
        paymentMethods[p.method] += p.amount;
      }
    });

    res.status(200).json({
      success: true,
      cycle,
      data: {
        totalNewMembers: newMembersInRange,
        activeMemberships: activeMembers,
        inactiveMemberships: inactiveMembers,
        expiredMemberships: expiredMembers,
        pendingPayments: pendingPaymentMembers,
        revenueInRange: revenueRange,
        totalRevenueAllTime,
        allTimeMembers: totalMembers,
        paymentMethodsBreakdown: paymentMethods
      }
    });
  } catch (error) {
    next(error);
  }
};
