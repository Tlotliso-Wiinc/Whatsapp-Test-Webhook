import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // Define associations here
            // User has many Chats
            User.hasMany(models.Chat, {
                foreignKey: 'user_id',
                as: 'chats'
            });

            // User has many Messages
            User.hasMany(models.Message, {
                foreignKey: 'user_id',
                as: 'messages'
            });
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Full name of the user'
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true
                },
                comment: 'Phone number (unique identifier)'
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
                validate: {
                    isEmail: true
                },
                comment: 'Email address'
            },
            firstname: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'First name of the user'
            },
            lastname: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Last name of the user'
            }
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'users',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    unique: true,
                    fields: ['phone']
                },
                {
                    unique: true,
                    fields: ['email']
                }
            ]
        }
    );

    return User;
};
