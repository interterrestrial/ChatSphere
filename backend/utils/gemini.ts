import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateWithRetry = async (
    ai: GoogleGenAI,
    model: string,
    contents: string,
    retries = MAX_RETRIES
): Promise<string> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await ai.models.generateContent({ model, contents });
            return (response.text ?? "").trim();
        } catch (err: any) {
            const isRateLimit = err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED');
            if (isRateLimit && attempt < retries) {
                console.warn(`Gemini rate limited, retrying in ${RETRY_DELAY_MS}ms (attempt ${attempt + 1}/${retries})...`);
                await sleep(RETRY_DELAY_MS);
                continue;
            }
            throw err;
        }
    }
    throw new Error("Max retries exceeded");
};

export const generateSmartReply = async (messageContent: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "";
    try {
        const text = await generateWithRetry(
            ai,
            "gemini-2.0-flash",
            `You are a helpful chat assistant. Generate exactly 1 short, natural, friendly reply (max 15 words) to this chat message. Return ONLY the reply text, no quotes, no prefix:\n\n"${messageContent}"`
        );
        // Strip wrapping quotes if model returns them
        return text.replace(/^["']|["']$/g, '');
    } catch (err) {
        console.error("Gemini Smart Reply Error:", err);
        return "";
    }
};

export const generateSmartReplies = async (messageContent: string): Promise<string[]> => {
    const ai = getClient();
    if (!ai) return [];
    try {
        let text = await generateWithRetry(
            ai,
            "gemini-2.0-flash",
            `You are a helpful chat assistant. Generate exactly 3 short, natural, friendly reply options (each max 12 words) to this chat message. Return ONLY a JSON array of 3 strings, nothing else. Example format: ["reply1", "reply2", "reply3"]\n\nMessage: "${messageContent}"`
        );
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
    const ai = getClient();
    if (!ai) throw new Error("Gemini API key not configured");
    if (messages.length === 0) return "No messages to summarize.";
    try {
        const transcript = messages
            .map(m => `${m.sender}: ${m.content}`)
            .join("\n");

        const text = await generateWithRetry(
            ai,
            "gemini-2.0-flash",
            `You are an AI assistant. Summarize this chat conversation in 2-4 concise bullet points. Focus on key topics discussed, decisions made, and action items. Use "•" for bullets. Keep it under 100 words.\n\n${transcript}`
        );
        return text;
    } catch (err: any) {
        console.error("Gemini Summarize Error:", err);
        const isRateLimit = err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED');
        if (isRateLimit) {
            throw new Error("Gemini API quota exceeded. Please try again later or upgrade your API plan.");
        }
        throw err;
    }
};
