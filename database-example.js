import { dbOperations } from './database.js';

// Example usage of the database operations

console.log('=== Database Example Usage ===\n');

// 1. Save some messages
console.log('1. Saving messages...');
dbOperations.saveMessage('+1234567890', 'Hello, I need help', true);
dbOperations.saveMessage('+1234567890', 'Hi, how can I help you today?', false);
dbOperations.saveMessage('+1234567890', 'What are your hours?', true);
dbOperations.saveMessage('+1234567890', 'We are open 24/7!', false);

dbOperations.saveMessage('+9876543210', 'Hi there', true);
dbOperations.saveMessage('+9876543210', 'Hello! How can I assist you?', false);

console.log('✓ Messages saved\n');

// 2. Get conversation history
console.log('2. Getting conversation history for +1234567890:');
const history = dbOperations.getConversationHistory('+1234567890');
history.forEach(msg => {
    const sender = msg.is_from_user ? 'User' : 'Bot';
    console.log(`   [${sender}] ${msg.message_text} (${msg.created_at})`);
});
console.log('');

// 3. Get all conversations
console.log('3. Getting all conversations:');
const conversations = dbOperations.getAllConversations();
conversations.forEach(conv => {
    console.log(`   Phone: ${conv.phone_number}, Messages: ${conv.message_count}, Last updated: ${conv.updated_at}`);
});
console.log('');

// 4. Example: Delete a conversation (commented out to preserve data)
// console.log('4. Deleting conversation for +9876543210...');
// dbOperations.deleteConversation('+9876543210');
// console.log('✓ Conversation deleted\n');

console.log('=== Example Complete ===');
