import express from 'express';
import { User, Chat, Message } from '../models/index.js';

const router = express.Router();

// GET /api/chats - Get all chats with optional pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, user_id, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (user_id) whereClause.user_id = user_id;
    if (search) {
      whereClause[Chat.sequelize.Sequelize.Op.or] = [
        { title: { [Chat.sequelize.Sequelize.Op.like]: `%${search}%` } },
        { summary: { [Chat.sequelize.Sequelize.Op.like]: `%${search}%` } }
      ];
    }

    const chats = await Chat.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: Message,
          as: 'messages',
          attributes: ['id', 'type', 'content', 'created_at'],
          limit: 1,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    res.json({
      chats: chats.rows,
      pagination: {
        total: chats.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(chats.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// GET /api/chats/:id - Get a specific chat by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const chat = await Chat.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'email']
        },
        {
          model: Message,
          as: 'messages',
          order: [['created_at', 'ASC']]
        }
      ]
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// GET /api/chats/:uuid - Get a specific chat by UUID
router.get('/uuid/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    
    const chat = await Chat.findOne({
      where: { uuid },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'email']
        },
        {
          model: Message,
          as: 'messages',
          order: [['created_at', 'ASC']]
        }
      ]
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat by UUID:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// POST /api/chats - Create a new chat
router.post('/', async (req, res) => {
  try {
    const { user_id, title, summary } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const chat = await Chat.create({
      user_id,
      title: title || 'New Chat',
      summary: summary || 'Chat started'
    });

    const createdChat = await Chat.findByPk(chat.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    res.status(201).json(createdChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// PUT /api/chats/:id - Update a chat
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary } = req.body;

    const chat = await Chat.findByPk(id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    await chat.update({
      title: title !== undefined ? title : chat.title,
      summary: summary !== undefined ? summary : chat.summary
    });

    const updatedChat = await Chat.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    res.json(updatedChat);
  } catch (error) {
    console.error('Error updating chat:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update chat' });
  }
});

// DELETE /api/chats/:id - Delete a chat (and all associated messages)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findByPk(id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    await chat.destroy();

    res.json({ message: 'Chat and all associated messages deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// GET /api/chats/:id/messages - Get all messages for a specific chat
router.get('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, type } = req.query;
    const offset = (page - 1) * limit;

    const chat = await Chat.findByPk(id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const whereClause = { chat_id: id };
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

// POST /api/chats/:id/messages - Add a message to a chat
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type = 'human', user_id } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const chat = await Chat.findByPk(id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const message = await Message.create({
      chat_id: id,
      user_id: user_id || chat.user_id,
      content,
      type
    });

    const createdMessage = await Message.findByPk(message.id, {
      include: [
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

export default router;
