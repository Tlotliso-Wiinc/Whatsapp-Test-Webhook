// Import message sender
const { sendWhatsAppMessage } = require('./whatsapp-sender');

// Send a simple text message
(async () => {
    try {
        const result = await sendWhatsAppMessage('26657683501', 'Hello, we are testing here!');
        console.log('Message sent:', result);
    } catch (error) {
        console.error('Error sending message:', error.message);
        process.exit(1);
    }
})();
