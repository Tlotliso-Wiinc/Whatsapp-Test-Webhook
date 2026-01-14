// OpenAI Service for WhatsApp Integration
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize OpenAI client
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Get AI response for a user message
 * @param {string} userMessage - The message from the user
 * @param {string} userPhone - The phone number of the user (for context)
 * @returns {Promise<string>} AI-generated response
 */
export async function getAIResponse(userMessage, userPhone = null) {
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini", // Using gpt-4o-mini instead of gpt-5-nano (which doesn't exist)
            messages: [
                {
                    role: "system",
                    content: "You are a helpful customer service assistant for WhatsApp. Keep your responses concise, friendly, and helpful. Respond in a conversational tone suitable for messaging."
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            max_tokens: 500, // Limit response length for WhatsApp
            temperature: 0.7
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error getting AI response:', error);
        // Fallback message if OpenAI fails
        return "I'm sorry, I'm having trouble processing your message right now. Please try again later.";
    }
}

/**
 * Get AI response with conversation history
 * @param {Array} conversationHistory - Array of message objects with role and content
 * @returns {Promise<string>} AI-generated response
 */
export async function getAIResponseWithHistory(conversationHistory) {
    try {
        const systemMessage = {
            role: "system",
            content: "You are a helpful customer service assistant for WhatsApp. Keep your responses concise, friendly, and helpful. Respond in a conversational tone suitable for messaging."
        };

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [systemMessage, ...conversationHistory],
            max_tokens: 500,
            temperature: 0.7
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error getting AI response with history:', error);
        return "I'm sorry, I'm having trouble processing your message right now. Please try again later.";
    }
}
