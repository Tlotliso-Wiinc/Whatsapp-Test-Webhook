import OpenAI from "openai";
const client = new OpenAI();

const response = await client.chat.completions.create({
    model: "gpt-5-nano",
    messages: [
        { role: "system", content: "You are a helpful customer service assistant." },
        { role: "user", content: "Hello, how are you?" }
    ]
});

console.log(response.choices[0].message.content);