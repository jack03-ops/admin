import Attendance from '../models/Attendance.js';
import Member from '../models/Member.js';

// @desc    Get all recent check-in logs
// @route   GET /api/attendance
// @access  Private
export const getAttendanceLogs = async (req, res, next) => {
  try {
    const logs = await Attendance.find().sort({ checkInTime: -1 }).limit(100);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a member check-in via QR scan
// @route   POST /api/attendance/check-in
// @access  Private
export const checkInMember = async (req, res, next) => {
  try {
    const { clientId, method = 'QR Code' } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, message: 'Client ID is required for check-in.' });
    }

    const member = await Member.findOne({ clientId });
    if (!member) {
      return res.status(404).json({ success: false, message: `No member found with Client ID ${clientId}.` });
    }

    // Check if membership is inactive
    if (!member.activeStatus) {
      return res.status(400).json({ success: false, message: 'Membership status is Inactive. Cannot check in.' });
    }

    // Check if membership has expired
    const today = new Date();
    const isExpired = new Date(member.endDate) < today;

    // Check if member already checked in today (prevent duplicates within 12 hours)
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const existingCheckIn = await Attendance.findOne({
      memberId: member._id,
      checkInTime: { $gte: twelveHoursAgo }
    });

    if (existingCheckIn) {
      return res.status(200).json({
        success: true,
        alreadyCheckedIn: true,
        message: `${member.fullName} has already checked in recently.`,
        data: existingCheckIn,
        member: {
          fullName: member.fullName,
          clientId: member.clientId,
          plan: member.plan,
          isExpired
        }
      });
    }

    const log = await Attendance.create({
      memberId: member._id,
      clientId: member.clientId,
      clientName: member.fullName,
      method
    });

    res.status(201).json({
      success: true,
      alreadyCheckedIn: false,
      message: isExpired 
        ? `Checked in ${member.fullName} successfully, but their membership has EXPIRED.` 
        : `Checked in ${member.fullName} successfully.`,
      data: log,
      member: {
        fullName: member.fullName,
        clientId: member.clientId,
        plan: member.plan,
        isExpired
      }
    });
  } catch (error) {
    next(error);
  }
};
