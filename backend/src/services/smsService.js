// Twilio SMS Integration Client
import dotenv from 'dotenv';
dotenv.config();

export const sendSMS = async (to, body) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  const isMock = !accountSid || accountSid.includes('mock') || !authToken || authToken.includes('mock');

  console.log(`[SMS Queue] Dispatching SMS payload to ${to}...`);

  if (isMock) {
    console.log(`[MOCK SMS SUCCESS] to: ${to} | body: "${body}"`);
    return { success: true, messageId: `MOCK-SMS-${Math.random().toString(36).substr(2, 9).toUpperCase()}` };
  }

  // Real Twilio Client load dynamically (avoid failures if twilio module is not imported)
  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(accountSid, authToken);
    
    const cleanTo = to.replace(/\s+/g, '');
    const message = await client.messages.create({
      body,
      from,
      to: cleanTo.startsWith('+') ? cleanTo : `+91${cleanTo}` // Default to Indian prefix if missing
    });

    console.log(`[Twilio Success] Message SID: ${message.sid}`);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error(`[Twilio Error] Failed to send SMS: ${error.message}`);
    throw new Error(`SMS gateway error: ${error.message}`);
  }
};
