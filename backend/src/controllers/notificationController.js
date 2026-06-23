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

    const payloadText = message || `Hello ${member.fullName}, your gym membership plan (${member.plan}) is scheduled to expire on ${new Date(member.endDate).toLocaleDateString()}. Please renew soon. - Phoenix Fitness Academy`;

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
const sendWhatsAppWithRetry = async (phone, message, templateData = null, maxRetries = 3) => {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      return await sendWhatsAppMessage(phone, message, templateData);
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

        let templateParams = [];
        if (days === 5) {
          reminderText = `Hello ${member.fullName}, your Phoenix Fitness Academy membership expires in 5 day(s). Please renew your membership to continue uninterrupted access. Don't break your workout streak!`;
          templateParams = [member.fullName, '5'];
        } else if (days === 3) {
          reminderText = `Hello ${member.fullName}, your Phoenix Fitness Academy membership expires in 3 day(s). Please renew your membership to continue uninterrupted access. Early renewals keep your fitness routine on track!`;
          templateParams = [member.fullName, '3'];
        } else {
          reminderText = `Hello ${member.fullName}, your Phoenix Fitness Academy membership expires in 1 day(s). Please renew your membership to continue uninterrupted access. Secure your slot to avoid lockout!`;
          templateParams = [member.fullName, '1'];
        }

        // Determine destination phone dynamically based on configuration
        const isTestMode = process.env.WHATSAPP_TEST_MODE !== 'false';
        const testRecipient = process.env.WHATSAPP_TEST_RECIPIENT || '+919487817301';
        const targetPhone = isTestMode ? testRecipient : (member.whatsapp || member.phone);

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
              await sendWhatsAppWithRetry(targetPhone, reminderText, { parameters: templateParams });
            } catch (err) {
              status = 'Failed';
            }

            const notif = await Notification.create({
              memberId: member._id,
              clientName: member.fullName,
              phone: targetPhone,
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
              await sendSMS(targetPhone, reminderText);
            } catch (err) {
              status = 'Failed';
            }

            const notif = await Notification.create({
              memberId: member._id,
              clientName: member.fullName,
              phone: targetPhone,
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

// @desc    Retrieve backend environment configuration status for WhatsApp
// @route   GET /api/notifications/config
// @access  Private
export const getNotificationConfig = async (req, res, next) => {
  try {
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    const token = process.env.WHATSAPP_ACCESS_TOKEN || '';
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || '';
    const testMode = process.env.WHATSAPP_TEST_MODE !== 'false';
    const testRecipient = process.env.WHATSAPP_TEST_RECIPIENT || '+91 94878 17301';

    res.status(200).json({
      success: true,
      data: {
        testMode,
        testRecipient,
        senderPhoneId: phoneId ? `${phoneId.substring(0, 4)}...${phoneId.substring(phoneId.length - 4)}` : 'Not Configured',
        hasToken: !!token,
        templateName: templateName || 'Not Configured (Fallback to custom text)'
      }
    });
  } catch (error) {
    next(error);
  }
};
