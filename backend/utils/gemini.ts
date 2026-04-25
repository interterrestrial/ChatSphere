import { GoogleGenerativeAI } from "@google/generative-ai";

const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenerativeAI(apiKey);
};

export const generateSmartReply = async (messageContent: string): Promise<string> => {
    const genAI = getGenAI();
    if (!genAI) return "";
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(
            `You are a helpful chat assistant. Generate exactly 1 short, natural, friendly reply (max 15 words) to this chat message. Return ONLY the reply text, no quotes, no prefix:\n\n"${messageContent}"`
        );
        const text = result.response.text().trim();
        // Strip wrapping quotes if model returns them
        return text.replace(/^["']|["']$/g, '');
    } catch (err) {
        console.error("Gemini Smart Reply Error:", err);
        return "";
    }
};

export const generateSmartReplies = async (messageContent: string): Promise<string[]> => {
    const genAI = getGenAI();
    if (!genAI) return [];
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(
            `You are a helpful chat assistant. Generate exactly 3 short, natural, friendly reply options (each max 12 words) to this chat message. Return ONLY a JSON array of 3 strings, nothing else. Example format: ["reply1", "reply2", "reply3"]\n\nMessage: "${messageContent}"`
        );
        let text = result.response.text().trim();
        // Remove markdown formatting if present
        text = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
        // Parse the JSON array
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.slice(0, 3).map((r: string) => r.trim());
        }
        return [];
    } catch (err) {
        console.error("Gemini Smart Replies Error:", err);
        return [];
    }
};

export const summarizeConversation = async (messages: { sender: string; content: string }[]): Promise<string> => {
    const genAI = getGenAI();
    if (!genAI) return "";
    if (messages.length === 0) return "No messages to summarize.";
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const transcript = messages
            .map(m => `${m.sender}: ${m.content}`)
            .join("\n");

        const result = await model.generateContent(
            `You are an AI assistant. Summarize this chat conversation in 2-4 concise bullet points. Focus on key topics discussed, decisions made, and action items. Use "•" for bullets. Keep it under 100 words.\n\n${transcript}`
        );
        return result.response.text().trim();
    } catch (err) {
        console.error("Gemini Summarize Error:", err);
        return "";
    }
};
