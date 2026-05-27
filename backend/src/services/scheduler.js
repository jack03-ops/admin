import Member from '../models/Member.js';
import Notification from '../models/Notification.js';
import { sendSMS } from './smsService.js';
import { sendWhatsAppMessage } from './whatsappService.js';

// Retry helper for sending WhatsApp messages
const sendWhatsAppWithRetry = async (phone, message, maxRetries = 3) => {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      const result = await sendWhatsAppMessage(phone, message);
      return result;
    } catch (error) {
      attempts++;
      console.warn(`[WhatsApp Retry] Attempt ${attempts} failed for ${phone}: ${error.message}`);
      if (attempts >= maxRetries) {
        throw error;
      }
      // Wait for 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// Main task to run automated daily reminders
export const runAutomatedReminders = async () => {
  console.log('[Scheduler] Executing scheduled membership expiry scanning...');
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const intervals = [5, 3, 1]; // 5, 3, and 1 days before expiry
    let dispatchedCount = 0;
    
    for (const days of intervals) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + days);

      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);

      // Locate active members whose membership ends in this targetDate window
      const membersExpiring = await Member.find({
        activeStatus: true,
        endDate: { $gte: targetDate, $lt: nextDay }
      });

      for (const member of membersExpiring) {
        const startOfToday = new Date(today);
        const endOfToday = new Date(today);
        endOfToday.setHours(23,59,59,999);

        // Construct distinct reminder messages per interval
        let reminderText = '';
        if (days === 5) {
          reminderText = `Hello ${member.fullName}, your Phoenix Gym membership expires in 5 day(s). Please renew your membership to continue uninterrupted access. Don't break your workout streak!`;
        } else if (days === 3) {
          reminderText = `Hello ${member.fullName}, your Phoenix Gym membership expires in 3 day(s). Please renew your membership to continue uninterrupted access. Early renewals keep your fitness routine on track!`;
        } else {
          reminderText = `Hello ${member.fullName}, your Phoenix Gym membership expires in 1 day(s). Please renew your membership to continue uninterrupted access. Secure your slot to avoid lockout!`;
        }

        const targetPhone = '+91 9487817301'; // Force strictly this test number

        // 1. WhatsApp Dispatch with retry and duplicate prevention
        try {
          const alreadySentWA = await Notification.findOne({
            memberId: member._id,
            type: 'WhatsApp',
            createdAt: { $gte: startOfToday, $lte: endOfToday }
          });

          if (!alreadySentWA) {
            let status = 'Sent';
            try {
              await sendWhatsAppWithRetry(targetPhone, reminderText);
            } catch (err) {
              status = 'Failed';
            }

            await Notification.create({
              memberId: member._id,
              clientName: member.fullName,
              phone: targetPhone,
              type: 'WhatsApp',
              message: reminderText,
              status
            });
            dispatchedCount++;
          } else {
            console.log(`[Scheduler] WhatsApp reminder already dispatched today for ${member.fullName}`);
          }
        } catch (err) {
          console.error(`[Scheduler WA Error] Member ${member.fullName}: ${err.message}`);
        }

        // 2. SMS Dispatch with duplicate prevention
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

            await Notification.create({
              memberId: member._id,
              clientName: member.fullName,
              phone: targetPhone,
              type: 'SMS',
              message: reminderText,
              status
            });
            dispatchedCount++;
          } else {
            console.log(`[Scheduler] SMS reminder already dispatched today for ${member.fullName}`);
          }
        } catch (err) {
          console.error(`[Scheduler SMS Error] Member ${member.fullName}: ${err.message}`);
        }
      }
    }
    console.log(`[Scheduler] Expiry alerts check completed. Dispatched ${dispatchedCount} reminders.`);
  } catch (error) {
    console.error(`[Scheduler Error] Automated reminder check encountered an error: ${error.message}`);
  }
};

// Initialize automated background scheduling
export const initScheduler = () => {
  console.log('[Scheduler] Initializing automated daily reminder scheduler...');
  
  // Run on startup
  setTimeout(() => {
    runAutomatedReminders();
  }, 5000);

  // Run every 24 hours
  setInterval(() => {
    runAutomatedReminders();
  }, 24 * 60 * 60 * 1000);
};
