import { User, initializeDatabase } from './models/index.js';

// Initialize the database
await initializeDatabase();

// Example: Create a new user
async function createUser() {
    try {
        const newUser = await User.create({
            phone: '+1234567890',
            email: 'john.doe@example.com',
            firstname: 'John',
            lastname: 'Doe',
            name: 'John Doe'
        });

        console.log('User created:', newUser.toJSON());
        return newUser;
    } catch (error) {
        console.error('Error creating user:', error.message);
    }
}

// Example: Find a user by phone
async function findUserByPhone(phone) {
    try {
        const user = await User.findOne({ where: { phone } });

        if (user) {
            console.log('User found:', user.toJSON());
        } else {
            console.log('User not found');
        }

        return user;
    } catch (error) {
        console.error('Error finding user:', error.message);
    }
}

// Example: Update a user
async function updateUser(phone, updates) {
    try {
        const user = await User.findOne({ where: { phone } });

        if (user) {
            await user.update(updates);
            console.log('User updated:', user.toJSON());
            return user;
        } else {
            console.log('User not found');
            return null;
        }
    } catch (error) {
        console.error('Error updating user:', error.message);
    }
}

// Example: Get all users
async function getAllUsers() {
    try {
        const users = await User.findAll();
        console.log(`Found ${users.length} users`);
        return users;
    } catch (error) {
        console.error('Error getting users:', error.message);
    }
}

// Example: Delete a user
async function deleteUser(phone) {
    try {
        const result = await User.destroy({ where: { phone } });

        if (result > 0) {
            console.log('User deleted successfully');
        } else {
            console.log('User not found');
        }

        return result;
    } catch (error) {
        console.error('Error deleting user:', error.message);
    }
}

// Run examples
console.log('=== Sequelize User Model Examples ===\n');

// Uncomment to test:
//await createUser();
//await findUserByPhone('+1234567890');
const users = await getAllUsers();
console.log(users);
// await updateUser('+1234567890', { firstname: 'Jane' });
// await deleteUser('+1234567890');

export { createUser, findUserByPhone, updateUser, getAllUsers, deleteUser };
