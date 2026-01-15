import { User, Chat, initializeDatabase } from './models/index.js';

// Initialize the database
await initializeDatabase();

console.log('=== Chat Model Examples ===\n');

// Example 1: Create a chat for a user
async function createChatForUser(userId, title, summary) {
    try {
        const chat = await Chat.create({
            user_id: userId,
            title: title,
            summary: summary
        });

        console.log('Chat created:', chat.toJSON());
        return chat;
    } catch (error) {
        console.error('Error creating chat:', error.message);
    }
}

// Example 2: Get all chats for a user (using association)
async function getUserChats(userId) {
    try {
        const user = await User.findByPk(userId, {
            include: [{
                model: Chat,
                as: 'chats'
            }]
        });

        if (user) {
            console.log(`User ${user.name} has ${user.chats.length} chats:`);
            user.chats.forEach(chat => {
                console.log(`  - ${chat.title} (UUID: ${chat.uuid})`);
            });
            return user.chats;
        } else {
            console.log('User not found');
            return null;
        }
    } catch (error) {
        console.error('Error getting user chats:', error.message);
    }
}

// Example 3: Get a chat with its user
async function getChatWithUser(chatId) {
    try {
        const chat = await Chat.findByPk(chatId, {
            include: [{
                model: User,
                as: 'user'
            }]
        });

        if (chat) {
            console.log('Chat details:', {
                id: chat.id,
                uuid: chat.uuid,
                title: chat.title,
                summary: chat.summary,
                user: {
                    name: chat.user.name,
                    phone: chat.user.phone
                }
            });
            return chat;
        } else {
            console.log('Chat not found');
            return null;
        }
    } catch (error) {
        console.error('Error getting chat:', error.message);
    }
}

// Example 4: Update a chat
async function updateChat(chatId, updates) {
    try {
        const chat = await Chat.findByPk(chatId);

        if (chat) {
            await chat.update(updates);
            console.log('Chat updated:', chat.toJSON());
            return chat;
        } else {
            console.log('Chat not found');
            return null;
        }
    } catch (error) {
        console.error('Error updating chat:', error.message);
    }
}

// Example 5: Delete a chat
async function deleteChat(chatId) {
    try {
        const result = await Chat.destroy({ where: { id: chatId } });

        if (result > 0) {
            console.log('Chat deleted successfully');
        } else {
            console.log('Chat not found');
        }

        return result;
    } catch (error) {
        console.error('Error deleting chat:', error.message);
    }
}

// Example 6: Find chat by UUID
async function findChatByUUID(uuid) {
    try {
        const chat = await Chat.findOne({
            where: { uuid },
            include: [{
                model: User,
                as: 'user'
            }]
        });

        if (chat) {
            console.log('Chat found:', chat.toJSON());
        } else {
            console.log('Chat not found');
        }

        return chat;
    } catch (error) {
        console.error('Error finding chat:', error.message);
    }
}

// Run examples (uncomment to test)
const user = await User.findOne({ where: { phone: '+1234567890' } });
if (user) {
    await createChatForUser(user.id, 'My First Chat', 'This is a summary of the chat');
    await createChatForUser(user.id, 'Another Chat', 'Another chat summary');
    await getUserChats(user.id);
}

export {
    createChatForUser,
    getUserChats,
    getChatWithUser,
    updateChat,
    deleteChat,
    findChatByUUID
};
