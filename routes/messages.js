import express from 'express';
import { User, Chat, Message } from '../models/index.js';

const router = express.Router();

// GET /api/messages - Get all messages with optional pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, chat_id, user_id, type, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (chat_id) whereClause.chat_id = chat_id;
    if (user_id) whereClause.user_id = user_id;
    if (type) whereClause.type = type;
    if (search) {
      whereClause.content = { [Message.sequelize.Sequelize.Op.like]: `%${search}%` };
    }

    const messages = await Message.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Chat,
          as: 'chat',
          attributes: ['id', 'uuid', 'title'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'phone']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    res.json({
      messages: messages.rows,
      pagination: {
        total: messages.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(messages.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET /api/messages/:id - Get a specific message by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findByPk(id, {
      include: [
        {
          model: Chat,
          as: 'chat',
          attributes: ['id', 'uuid', 'title', 'summary'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'phone', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'email']
        }
      ]
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

// POST /api/messages - Create a new message
router.post('/', async (req, res) => {
  try {
    const { chat_id, user_id, content, type = 'human' } = req.body;

    if (!chat_id) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const chat = await Chat.findByPk(chat_id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (user_id) {
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    const message = await Message.create({
      chat_id,
      user_id: user_id || chat.user_id,
      content,
      type
    });

    const createdMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: Chat,
          as: 'chat',
          attributes: ['id', 'uuid', 'title'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'phone']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    res.status(201).json(createdMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// PUT /api/messages/:id - Update a message
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type } = req.body;

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await message.update({
      content: content !== undefined ? content : message.content,
      type: type !== undefined ? type : message.type
    });

    const updatedMessage = await Message.findByPk(id, {
      include: [
        {
          model: Chat,
          as: 'chat',
          attributes: ['id', 'uuid', 'title'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'phone']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await message.destroy();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// GET /api/messages/chat/:chatId - Get all messages for a specific chat (alternative route)
router.get('/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50, type } = req.query;
    const offset = (page - 1) * limit;

    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const whereClause = { chat_id: chatId };
    if (type) whereClause.type = type;

    const messages = await Message.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'ASC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    res.json({
      messages: messages.rows,
      pagination: {
        total: messages.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(messages.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// GET /api/messages/user/:userId - Get all messages for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50, type, chat_id } = req.query;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const whereClause = { user_id: userId };
    if (type) whereClause.type = type;
    if (chat_id) whereClause.chat_id = chat_id;

    const messages = await Message.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Chat,
          as: 'chat',
          attributes: ['id', 'uuid', 'title']
        }
      ]
    });

    res.json({
      messages: messages.rows,
      pagination: {
        total: messages.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(messages.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({ error: 'Failed to fetch user messages' });
  }
});

// DELETE /api/messages/chat/:chatId - Delete all messages in a chat
router.delete('/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const deletedCount = await Message.destroy({
      where: { chat_id: chatId }
    });

    res.json({ 
      message: `Successfully deleted ${deletedCount} messages from chat`,
      deleted_count: deletedCount
    });
  } catch (error) {
    console.error('Error deleting chat messages:', error);
    res.status(500).json({ error: 'Failed to delete chat messages' });
  }
});

export default router;
