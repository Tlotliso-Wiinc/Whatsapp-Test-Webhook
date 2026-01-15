// Import Express.js
import express from 'express';

// Import message sender
import { sendWhatsAppMessage } from './whatsapp-sender.js';

// Import OpenAI service
import { getAIResponse } from './openai-service.js';

// Import database models
import { User, Chat, Message, initializeDatabase } from './models/index.js';

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

// Initialize database
await initializeDatabase();

// Helper function to find or create user by phone number
async function findOrCreateUser(phoneNumber) {
  try {
    const [user, created] = await User.findOrCreate({
      where: { phone: phoneNumber },
      defaults: {
        phone: phoneNumber,
        name: `User ${phoneNumber}`
      }
    });
    
    if (created) {
      console.log(`New user created with phone: ${phoneNumber}`);
    } else {
      console.log(`Existing user found with phone: ${phoneNumber}`);
    }
    
    return user;
  } catch (error) {
    console.error('Error finding or creating user:', error);
    throw error;
  }
}

// Helper function to find or create chat for user
async function findOrCreateChat(userId) {
  try {
    // Check if user has any existing chats
    const existingChat = await Chat.findOne({
      where: { user_id: userId }
    });

    if (existingChat) {
      console.log(`Existing chat found for user ID: ${userId}`);
      return existingChat;
    } else {
      // Create new chat for user
      const newChat = await Chat.create({
        user_id: userId,
        title: 'WhatsApp Chat',
        summary: 'Chat started via WhatsApp'
      });
      console.log(`New chat created for user ID: ${userId}`);
      return newChat;
    }
  } catch (error) {
    console.error('Error finding or creating chat:', error);
    throw error;
  }
}

// Helper function to save message to chat
async function saveMessageToChat(chatId, userId, content, messageType = 'human') {
  try {
    const message = await Message.create({
      chat_id: chatId,
      user_id: userId,
      content: content,
      type: messageType
    });
    
    console.log(`Message saved to chat ${chatId}: ${messageType} message`);
    return message;
  } catch (error) {
    console.error('Error saving message to chat:', error);
    throw error;
  }
}

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
            // Step 1: Find or create user
            console.log('Checking user existence...');
            const user = await findOrCreateUser(from);
            
            // Step 2: Find or create chat for user
            console.log('Checking chat existence...');
            const chat = await findOrCreateChat(user.id);
            
            // Step 3: Save the WhatsApp message to chat
            console.log('Saving user message to chat...');
            await saveMessageToChat(chat.id, user.id, userMessage, 'human');

            // Get AI-generated response
            console.log('Generating AI response...');
            const aiResponse = await getAIResponse(userMessage, from);
            console.log(`AI Response: ${aiResponse}`);

            // Save AI response to chat
            console.log('Saving AI response to chat...');
            await saveMessageToChat(chat.id, user.id, aiResponse, 'ai');

            // Send the AI response via WhatsApp
            const result = await sendWhatsAppMessage(from, aiResponse);
            console.log('AI reply sent:', result);
          } catch (error) {
            console.error('Failed to process message:', error);
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