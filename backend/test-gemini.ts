import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function run() {
  try {
    const response = await ai.models.generateContent({
        model: "gemini-pro",
        contents: "Hello",
    });
    console.log("Success pro:", response.text);
  } catch(err: any) {
    console.error("Error pro:", err.status, err.message);
  }
}
run();
