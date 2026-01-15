import { User, Chat, Message, initializeDatabase } from './models/index.js';

// Initialize the database
await initializeDatabase();

console.log('=== Setting up sample data ===\n');

// Create a user
let user = await User.findOne({ where: { phone: '+1234567890' } });
if (!user) {
    user = await User.create({
        phone: '+1234567890',
        email: 'john.doe@example.com',
        firstname: 'John',
        lastname: 'Doe',
        name: 'John Doe'
    });
    console.log('✓ User created:', user.name);
} else {
    console.log('✓ User already exists:', user.name);
}

// Create a chat
let chat = await Chat.findOne({ where: { user_id: user.id } });
if (!chat) {
    chat = await Chat.create({
        user_id: user.id,
        title: 'Customer Support Chat',
        summary: 'A conversation about account help'
    });
    console.log('✓ Chat created:', chat.title);
} else {
    console.log('✓ Chat already exists:', chat.title);
}

// Create messages
const existingMessages = await Message.count({ where: { chat_id: chat.id } });
if (existingMessages === 0) {
    await Message.create({
        chat_id: chat.id,
        type: 'human',
        content: 'Hello, I need help with my account',
        user_id: user.id
    });

    await Message.create({
        chat_id: chat.id,
        type: 'ai',
        content: 'Hello! I\'d be happy to help you with your account. What specific issue are you experiencing?',
        user_id: null
    });

    await Message.create({
        chat_id: chat.id,
        type: 'human',
        content: 'I forgot my password and can\'t log in',
        user_id: user.id
    });

    await Message.create({
        chat_id: chat.id,
        type: 'ai',
        content: 'No problem! I can help you reset your password. I\'ll send you a password reset link to your registered email address. Please check your email inbox.',
        user_id: null
    });

    await Message.create({
        chat_id: chat.id,
        type: 'human',
        content: 'Thank you! I received the email.',
        user_id: user.id
    });

    await Message.create({
        chat_id: chat.id,
        type: 'ai',
        content: 'You\'re welcome! Is there anything else I can help you with today?',
        user_id: null
    });

    console.log('✓ Messages created: 6 messages');
} else {
    console.log(`✓ Messages already exist: ${existingMessages} messages`);
}

console.log('\n=== Displaying Conversation ===\n');

// Display the conversation
const messages = await Message.findAll({
    where: { chat_id: chat.id },
    order: [['created_at', 'ASC']],
    include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'phone']
    }]
});

messages.forEach((msg, index) => {
    const speaker = msg.type === 'ai' ? '🤖 AI Assistant' : `👤 ${msg.user?.name || 'User'}`;
    console.log(`${speaker}:`);
    console.log(`   ${msg.content}\n`);
});

console.log('=== Summary ===');
console.log(`Total Users: ${await User.count()}`);
console.log(`Total Chats: ${await Chat.count()}`);
console.log(`Total Messages: ${await Message.count()}`);
console.log('\n✓ Database setup complete!');
