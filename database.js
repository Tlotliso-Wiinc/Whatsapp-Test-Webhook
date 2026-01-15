import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
const dbPath = path.join(__dirname, 'whatsapp.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
    // Create conversations table
    db.exec(`
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone_number TEXT NOT NULL UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create messages table
    db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            message_text TEXT NOT NULL,
            is_from_user BOOLEAN NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        )
    `);

    // Create index for faster lookups
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_messages_conversation 
        ON messages(conversation_id)
    `);

    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_conversations_phone 
        ON conversations(phone_number)
    `);

    console.log('Database initialized successfully');
}

// Initialize the database
initializeDatabase();

// Helper functions for database operations
export const dbOperations = {
    // Get or create a conversation
    getOrCreateConversation: (phoneNumber) => {
        const stmt = db.prepare('SELECT * FROM conversations WHERE phone_number = ?');
        let conversation = stmt.get(phoneNumber);

        if (!conversation) {
            const insert = db.prepare('INSERT INTO conversations (phone_number) VALUES (?)');
            const result = insert.run(phoneNumber);
            conversation = stmt.get(phoneNumber);
        }

        return conversation;
    },

    // Save a message
    saveMessage: (phoneNumber, messageText, isFromUser) => {
        const conversation = dbOperations.getOrCreateConversation(phoneNumber);

        const stmt = db.prepare(`
            INSERT INTO messages (conversation_id, message_text, is_from_user) 
            VALUES (?, ?, ?)
        `);

        const result = stmt.run(conversation.id, messageText, isFromUser ? 1 : 0);

        // Update conversation timestamp
        const updateStmt = db.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        updateStmt.run(conversation.id);

        return result;
    },

    // Get conversation history
    getConversationHistory: (phoneNumber, limit = 50) => {
        const conversation = dbOperations.getOrCreateConversation(phoneNumber);

        const stmt = db.prepare(`
            SELECT message_text, is_from_user, created_at 
            FROM messages 
            WHERE conversation_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        `);

        return stmt.all(conversation.id, limit).reverse();
    },

    // Get all conversations
    getAllConversations: () => {
        const stmt = db.prepare(`
            SELECT c.*, 
                   (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count
            FROM conversations c
            ORDER BY c.updated_at DESC
        `);

        return stmt.all();
    },

    // Delete a conversation and all its messages
    deleteConversation: (phoneNumber) => {
        const stmt = db.prepare('DELETE FROM conversations WHERE phone_number = ?');
        return stmt.run(phoneNumber);
    }
};

export default db;
