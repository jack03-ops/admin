import Member from '../models/Member.js';
import Notification from '../models/Notification.js';
import { sendSMS } from '../services/smsService.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';

// @desc    Trigger instant manually targeted SMS / WhatsApp notification
// @route   POST /api/notifications/send
// @access  Private
export const sendInstantNotification = async (req, res, next) => {
  try {
    const { memberId, type, message } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Gym member record not found' });
    }

    const payloadText = message || `Hello ${member.fullName}, your gym membership plan (${member.plan}) is scheduled to expire on ${new Date(member.endDate).toLocaleDateString()}. Please renew soon. - Phoenix Gym`;

    let deliveryResult;
    if (type === 'WhatsApp') {
      deliveryResult = await sendWhatsAppMessage(member.phone, payloadText);
    } else {
      deliveryResult = await sendSMS(member.phone, payloadText);
    }

    // Log the transaction
    const log = await Notification.create({
      memberId: member._id,
      clientName: member.fullName,
      phone: member.phone,
      type,
      message: payloadText,
      status: deliveryResult.success ? 'Sent' : 'Failed'
    });

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

// Helper for WhatsApp retry in controller
const sendWhatsAppWithRetry = async (phone, message, maxRetries = 3) => {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      return await sendWhatsAppMessage(phone, message);
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// @desc    Cron trigger endpoint to auto scan expiring memberships and dispatch reminders
// @route   POST /api/notifications/auto-reminders
// @access  Private
export const triggerAutoReminders = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const intervals = [5, 3, 1]; // scan days
    let dispatchedCount = 0;
    const logs = [];

    for (const days of intervals) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + days);

      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);

      // Locate active members whose membership ends exactly in targetDate range
      const membersExpiring = await Member.find({
        activeStatus: true,
        endDate: { $gte: targetDate, $lt: nextDay }
      });

      for (const member of membersExpiring) {
        const startOfToday = new Date(today);
        const endOfToday = new Date(today);
        endOfToday.setHours(23,59,59,999);

        // Reminder template
        const reminderText = `Hello ${member.fullName}, your Phoenix Gym membership expires in ${days} day(s). Please renew your membership to continue uninterrupted access.`;

        // Dispatch WhatsApp if not sent today
        try {
          const alreadySentWA = await Notification.findOne({
            memberId: member._id,
            type: 'WhatsApp',
            createdAt: { $gte: startOfToday, $lte: endOfToday }
          });

          if (!alreadySentWA) {
            let status = 'Sent';
            try {
              await sendWhatsAppWithRetry(member.phone, reminderText);
            } catch (err) {
              status = 'Failed';
            }

            const notif = await Notification.create({
              memberId: member._id,
              clientName: member.fullName,
              phone: member.phone,
              type: 'WhatsApp',
              message: reminderText,
              status
            });
            logs.push(notif);
            dispatchedCount++;
          }
        } catch (err) {
          console.error(`[Auto-Reminder Failure WA] member ID ${member.clientId}: ${err.message}`);
        }

        // Dispatch SMS if not sent today
        try {
          const alreadySentSMS = await Notification.findOne({
            memberId: member._id,
            type: 'SMS',
            createdAt: { $gte: startOfToday, $lte: endOfToday }
          });

          if (!alreadySentSMS) {
            let status = 'Sent';
            try {
              await sendSMS(member.phone, reminderText);
            } catch (err) {
              status = 'Failed';
            }

            const notif = await Notification.create({
              memberId: member._id,
              clientName: member.fullName,
              phone: member.phone,
              type: 'SMS',
              message: reminderText,
              status
            });
            logs.push(notif);
            dispatchedCount++;
          }
        } catch (err) {
          console.error(`[Auto-Reminder Failure SMS] member ID ${member.clientId}: ${err.message}`);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Scanned expiry alerts successfully. Dispatched ${dispatchedCount} reminders.`,
      dispatched: dispatchedCount,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Retrieve alert delivery logs
// @route   GET /api/notifications/logs
// @access  Private
export const getNotificationLogs = async (req, res, next) => {
  try {
    const logs = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};
