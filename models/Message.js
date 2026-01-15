import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Message extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // Define association: Message belongs to Chat
            Message.belongsTo(models.Chat, {
                foreignKey: 'chat_id',
                as: 'chat'
            });

            // Define association: Message belongs to User
            Message.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
        }
    }

    Message.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            chat_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'chats',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'Foreign key to Chat'
            },
            type: {
                type: DataTypes.ENUM('human', 'ai'),
                allowNull: false,
                defaultValue: 'human',
                validate: {
                    isIn: [['human', 'ai']]
                },
                comment: 'Type of message: human or ai'
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                comment: 'Message content'
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                comment: 'Foreign key to User (optional)'
            }
        },
        {
            sequelize,
            modelName: 'Message',
            tableName: 'messages',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    fields: ['chat_id']
                },
                {
                    fields: ['user_id']
                },
                {
                    fields: ['type']
                }
            ]
        }
    );

    return Message;
};
