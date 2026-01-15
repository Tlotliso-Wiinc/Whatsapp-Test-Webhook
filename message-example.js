import { User, Chat, Message, initializeDatabase } from './models/index.js';

// Initialize the database
await initializeDatabase();

console.log('=== Message Model Examples ===\n');

// Example 1: Create a message in a chat
async function createMessage(chatId, type, content, userId = null) {
    try {
        const message = await Message.create({
            chat_id: chatId,
            type: type,
            content: content,
            user_id: userId
        });

        console.log('Message created:', message.toJSON());
        return message;
    } catch (error) {
        console.error('Error creating message:', error.message);
    }
}

// Example 2: Get all messages in a chat
async function getChatMessages(chatId) {
    try {
        const chat = await Chat.findByPk(chatId, {
            include: [{
                model: Message,
                as: 'messages',
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'phone']
                }]
            }]
        });

        if (chat) {
            console.log(`\nChat: ${chat.title}`);
            console.log(`Messages (${chat.messages.length}):`);
            chat.messages.forEach((msg, index) => {
                console.log(`  ${index + 1}. [${msg.type.toUpperCase()}] ${msg.content.substring(0, 50)}...`);
                if (msg.user) {
                    console.log(`     By: ${msg.user.name || msg.user.phone}`);
                }
            });
            return chat.messages;
        } else {
            console.log('Chat not found');
            return null;
        }
    } catch (error) {
        console.error('Error getting chat messages:', error.message);
    }
}

// Example 3: Get all messages by a user
async function getUserMessages(userId) {
    try {
        const user = await User.findByPk(userId, {
            include: [{
                model: Message,
                as: 'messages',
                include: [{
                    model: Chat,
                    as: 'chat',
                    attributes: ['id', 'title', 'uuid']
                }]
            }]
        });

        if (user) {
            console.log(`\nUser ${user.name} has ${user.messages.length} messages:`);
            user.messages.forEach((msg, index) => {
                console.log(`  ${index + 1}. [${msg.type}] in chat "${msg.chat.title}"`);
            });
            return user.messages;
        } else {
            console.log('User not found');
            return null;
        }
    } catch (error) {
        console.error('Error getting user messages:', error.message);
    }
}

// Example 4: Get conversation (alternating human/AI messages)
async function getConversation(chatId, limit = 10) {
    try {
        const messages = await Message.findAll({
            where: { chat_id: chatId },
            order: [['created_at', 'ASC']],
            limit: limit,
            include: [{
                model: User,
                as: 'user',
                attributes: ['name', 'phone']
            }]
        });

        console.log(`\n=== Conversation (Chat ID: ${chatId}) ===`);
        messages.forEach((msg) => {
            const speaker = msg.type === 'ai' ? 'AI' : (msg.user?.name || msg.user?.phone || 'User');
            console.log(`\n${speaker}: ${msg.content}`);
        });

        return messages;
    } catch (error) {
        console.error('Error getting conversation:', error.message);
    }
}

// Example 5: Update a message
async function updateMessage(messageId, newContent) {
    try {
        const message = await Message.findByPk(messageId);

        if (message) {
            await message.update({ content: newContent });
            console.log('Message updated:', message.toJSON());
            return message;
        } else {
            console.log('Message not found');
            return null;
        }
    } catch (error) {
        console.error('Error updating message:', error.message);
    }
}

// Example 6: Delete a message
async function deleteMessage(messageId) {
    try {
        const result = await Message.destroy({ where: { id: messageId } });

        if (result > 0) {
            console.log('Message deleted successfully');
        } else {
            console.log('Message not found');
        }

        return result;
    } catch (error) {
        console.error('Error deleting message:', error.message);
    }
}

// Run examples (uncomment to test)
const user = await User.findOne({ where: { phone: '+1234567890' } });
const chat = await Chat.findOne({ where: { user_id: user.id } });

if (user && chat) {
    console.log(`Testing with User: ${user.name}, Chat: ${chat.title}\n`);

    // Create a conversation
    await createMessage(chat.id, 'human', 'Hello, I need help with my account', user.id);
    await createMessage(chat.id, 'ai', 'Hello! I\'d be happy to help you with your account. What specific issue are you experiencing?');
    await createMessage(chat.id, 'human', 'I forgot my password', user.id);
    await createMessage(chat.id, 'ai', 'No problem! I can help you reset your password. Please check your email for a password reset link.');

    // Display the conversation
    await getConversation(chat.id);

    // Get all messages in the chat
    await getChatMessages(chat.id);
}

export {
    createMessage,
    getChatMessages,
    getUserMessages,
    getConversation,
    updateMessage,
    deleteMessage
};
