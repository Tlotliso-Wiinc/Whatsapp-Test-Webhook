// WhatsApp Business API Message Sender
require('dotenv').config();

// Configuration
const config = {
  phoneNumberId: process.env.PHONE_NUMBER_ID,
  accessToken: process.env.ACCESS_TOKEN,
  apiVersion: process.env.API_VERSION
};

/**
 * Send a text message via WhatsApp Business API
 * @param {string} recipientPhone - Phone number in international format (e.g., +26657683501)
 * @param {string} messageText - The text message to send
 * @returns {Promise<Object>} API response
 */
async function sendWhatsAppMessage(recipientPhone, messageText) {
  const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipientPhone,
    type: 'text',
    text: {
      body: messageText
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.accessToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
      response: data
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send a message with preview URL
 * @param {string} recipientPhone - Phone number in international format
 * @param {string} messageText - The text message to send
 * @param {boolean} previewUrl - Whether to show URL preview
 * @returns {Promise<Object>} API response
 */
async function sendMessageWithUrlPreview(recipientPhone, messageText, previewUrl = true) {
  const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipientPhone,
    type: 'text',
    text: {
      preview_url: previewUrl,
      body: messageText
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.accessToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
      response: data
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Example usage
async function main() {
  // Send a simple text message
  const result = await sendWhatsAppMessage('26657683501', 'Hello mvetho!');
  console.log('Message sent:', result);

  // Send a message with URL preview
  /*
  const urlResult = await sendMessageWithUrlPreview(
    '+26657683501',
    'Check out this link: https://example.com'
  );
  console.log('URL message sent:', urlResult);
  */
}

// For Node.js environments
if (typeof require !== 'undefined' && require.main === module) {
  main();
}

// Export for use as a module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sendWhatsAppMessage,
    sendMessageWithUrlPreview,
    config
  };
}