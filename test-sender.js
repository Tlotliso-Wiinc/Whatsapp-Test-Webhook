// Import message sender
import { sendWhatsAppMessage } from './whatsapp-sender.js';

// Import OpenAI service
import { getAIResponse } from './openai-service.js';

// Send a simple text message
(async () => {
    try {
        // Get AI-generated response
        console.log('Generating AI response...');
        const aiResponse = await getAIResponse('Hello');
        console.log(`AI Response: ${aiResponse}`);

        const result = await sendWhatsAppMessage('26657683501', aiResponse);
        console.log('Message sent:', result);
    } catch (error) {
        console.error('Error sending message:', error.message);
        process.exit(1);
    }
})();
