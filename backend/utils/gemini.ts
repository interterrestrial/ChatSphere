import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const generateSmartReply = async (messageContent: string) => {
    if (!apiKey) return "";
    try {
        // gemini-pro is legacy, use gemini-1.5-flash
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(`Generate a very short, friendly, one sentence reply to this message: "${messageContent}"`);
        return result.response.text();
    } catch (err) {
        console.error("Gemini Error:", err);
        return "";
    }
};
