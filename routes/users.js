import express from 'express';
import { User, Chat, Message } from '../models/index.js';

const router = express.Router();

// GET /api/users - Get all users with optional pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search ? {
      [User.sequelize.Sequelize.Op.or]: [
        { name: { [User.sequelize.Sequelize.Op.like]: `%${search}%` } },
        { phone: { [User.sequelize.Sequelize.Op.like]: `%${search}%` } },
        { email: { [User.sequelize.Sequelize.Op.like]: `%${search}%` } }
      ]
    } : {};

    const users = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Chat,
          as: 'chats',
          attributes: ['id', 'title', 'created_at']
        }
      ]
    });

    res.json({
      users: users.rows,
      pagination: {
        total: users.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(users.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - Get a specific user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      include: [
        {
          model: Chat,
          as: 'chats',
          include: [
            {
              model: Message,
              as: 'messages',
              attributes: ['id', 'type', 'content', 'created_at'],
              limit: 5,
              order: [['created_at', 'DESC']]
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users - Create a new user
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, firstname, lastname } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this phone number already exists' });
    }

    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
    }

    const user = await User.create({
      name: name || `User ${phone}`,
      phone,
      email,
      firstname,
      lastname
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id - Update a user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, firstname, lastname } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (phone && phone !== user.phone) {
      const existingUser = await User.findOne({ where: { phone } });
      if (existingUser) {
        return res.status(409).json({ error: 'User with this phone number already exists' });
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
    }

    await user.update({
      name: name || user.name,
      phone: phone || user.phone,
      email: email || user.email,
      firstname: firstname !== undefined ? firstname : user.firstname,
      lastname: lastname !== undefined ? lastname : user.lastname
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /api/users/:id/chats - Get all chats for a specific user
router.get('/:id/chats', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const chats = await Chat.findAndCountAll({
      where: { user_id: id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
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
    console.error('Error fetching user chats:', error);
    res.status(500).json({ error: 'Failed to fetch user chats' });
  }
});

export default router;
