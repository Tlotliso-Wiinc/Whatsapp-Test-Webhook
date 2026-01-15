import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/database.js';
import UserModel from './User.js';
import ChatModel from './Chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig);

// Initialize models
const User = UserModel(sequelize, Sequelize.DataTypes);
const Chat = ChatModel(sequelize, Sequelize.DataTypes);

// Define associations
const models = { User, Chat };
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// Sync database (create tables if they don't exist)
const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Sync all models
        await sequelize.sync({ alter: false });
        console.log('All models synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

// Export models and sequelize instance
export { sequelize, User, Chat, initializeDatabase };
export default { sequelize, User, Chat, initializeDatabase };
