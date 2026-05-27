// WhatsApp Cloud API Integration Client
import dotenv from 'dotenv';
dotenv.config();

export const sendWhatsAppMessage = async (to, body) => {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  const isMock = !phoneId || phoneId.includes('mock') || !token || token.includes('mock');

  console.log(`[WhatsApp Queue] Preparing WhatsApp Cloud message to ${to}...`);

  if (isMock) {
    console.log(`[MOCK WHATSAPP SUCCESS] to: ${to} | body: "${body}"`);
    return { success: true, messageId: `MOCK-WA-${Math.random().toString(36).substr(2, 9).toUpperCase()}` };
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
    
    // We send a template message or dynamic text. WhatsApp Cloud API requires text object for custom messages
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to.startsWith('+') ? to : `+91${to}`,
      type: "text",
      text: {
        preview_url: false,
        body: body
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed WhatsApp message delivery');
    }

    console.log(`[WhatsApp Cloud Success] Message ID: ${data.messages?.[0]?.id}`);
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    console.error(`[WhatsApp Error] Cloud delivery failure: ${error.message}`);
    throw new Error(`WhatsApp gateway error: ${error.message}`);
  }
};
