import express from 'express';
import { Op } from 'sequelize';
import { User, Chat, Message, KnowledgeBase } from '../models/index.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalChats = await Chat.count();
    const totalMessages = await Message.count();
    const totalKnowledgeItems = await KnowledgeBase.count();
    const activeKnowledgeItems = await KnowledgeBase.count({ where: { is_active: true } });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.count({
      where: {
        created_at: { [Op.gte]: sevenDaysAgo }
      }
    });

    const recentMessages = await Message.count({
      where: {
        created_at: { [Op.gte]: sevenDaysAgo }
      }
    });

    res.json({
      totalUsers,
      totalChats,
      totalMessages,
      totalKnowledgeItems,
      activeKnowledgeItems,
      recentUsers,
      recentMessages
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{
        model: Chat,
        as: 'chats',
        attributes: ['id'],
        include: [{
          model: Message,
          as: 'messages',
          attributes: ['id'],
          required: false
        }]
      }]
    });

    // Format user data with message counts
    const formattedUsers = users.map(user => {
      const userData = user.toJSON();
      const totalMessages = userData.chats.reduce((sum, chat) => sum + (chat.messages ? chat.messages.length : 0), 0);
      return {
        ...userData,
        totalChats: userData.chats.length,
        totalMessages,
        chats: undefined // Remove nested data
      };
    });

    res.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all chats with user info and message count
router.get('/chats', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: chats } = await Chat.findAndCountAll({
      limit,
      offset,
      order: [['updated_at', 'DESC']]
    });

    // Format chat data
    const formattedChats = chats.map(chat => {
      const chatData = chat.toJSON();
      
      return {
        ...chatData,
        messageCount: 0, // Will be updated when we fix the message include
        lastMessageAt: chatData.updated_at
      };
    });

    res.json({
      chats: formattedChats,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Get chat details with messages
router.get('/chats/:id', async (req, res) => {
  try {
    const chatId = req.params.id;

    const chat = await Chat.findOne({
      where: { id: chatId }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat details:', error);
    res.status(500).json({ error: 'Failed to fetch chat details' });
  }
});

// Get all knowledge base items
router.get('/knowledge', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const type = req.query.type;

    const whereClause = type ? { type } : {};

    const { count, rows: items } = await KnowledgeBase.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      items,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching knowledge base items:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge base items' });
  }
});

// Create knowledge base item
router.post('/knowledge', async (req, res) => {
  try {
    const { title, type, content, url, tags } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    const newItem = await KnowledgeBase.create({
      title,
      type,
      content,
      url,
      tags: tags || []
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating knowledge base item:', error);
    res.status(500).json({ error: 'Failed to create knowledge base item' });
  }
});

// Update knowledge base item
router.put('/knowledge/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const { title, type, content, url, tags, is_active } = req.body;

    const item = await KnowledgeBase.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Knowledge base item not found' });
    }

    await item.update({
      title,
      type,
      content,
      url,
      tags,
      is_active
    });

    res.json(item);
  } catch (error) {
    console.error('Error updating knowledge base item:', error);
    res.status(500).json({ error: 'Failed to update knowledge base item' });
  }
});

// Delete knowledge base item
router.delete('/knowledge/:id', async (req, res) => {
  try {
    const itemId = req.params.id;

    const item = await KnowledgeBase.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Knowledge base item not found' });
    }

    await item.destroy();

    res.json({ message: 'Knowledge base item deleted successfully' });
  } catch (error) {
    console.error('Error deleting knowledge base item:', error);
    res.status(500).json({ error: 'Failed to delete knowledge base item' });
  }
});

export default router;
