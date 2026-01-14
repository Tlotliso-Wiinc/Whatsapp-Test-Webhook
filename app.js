// Import Express.js
import express from 'express';

// Import message sender
import { sendWhatsAppMessage } from './whatsapp-sender.js';

// Import OpenAI service
import { getAIResponse } from './openai-service.js';

// Configure dotenv
import dotenv from 'dotenv';
dotenv.config();

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;



// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  // Parse webhook payload
  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
      const message = body.entry[0].changes[0].value.messages[0];

      // Only reply to text messages for now
      if (message.type === 'text') {
        const from = message.from;
        const userMessage = message.text.body;
        console.log(`Received message from ${from}: ${userMessage}`);

        (async () => {
          try {
            // Get AI-generated response
            console.log('Generating AI response...');
            const aiResponse = await getAIResponse(userMessage, from);
            console.log(`AI Response: ${aiResponse}`);

            // Send the AI response via WhatsApp
            const result = await sendWhatsAppMessage(from, aiResponse);
            console.log('AI reply sent:', result);
          } catch (error) {
            console.error('Failed to send AI reply:', error);
          }
        })();
      }
    }
  }

  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});