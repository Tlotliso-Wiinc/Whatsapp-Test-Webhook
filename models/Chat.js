import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Chat extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // Define association: Chat belongs to User
            Chat.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });

            // Define association: Chat has many Messages
            Chat.hasMany(models.Message, {
                foreignKey: 'chat_id',
                as: 'messages'
            });
        }
    }

    Chat.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'Foreign key to User'
            },
            uuid: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                defaultValue: DataTypes.UUIDV4,
                comment: 'Unique identifier for the chat'
            },
            title: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Title of the chat'
            },
            summary: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Summary of the chat conversation'
            }
        },
        {
            sequelize,
            modelName: 'Chat',
            tableName: 'chats',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    unique: true,
                    fields: ['uuid']
                },
                {
                    fields: ['user_id']
                }
            ]
        }
    );

    return Chat;
};
