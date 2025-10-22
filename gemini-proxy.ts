import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

const handler: Handler = async (event: HandlerEvent) => {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { GEMINI_API_KEY } = process.env;

    if (!GEMINI_API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: "API key is not configured." }) };
    }

    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const body = JSON.parse(event.body || "{}");
        const { action, prompt, file } = body;

        let responseText: string;

        if (action === 'generateLyrics') {
            if (!prompt) return { statusCode: 400, body: JSON.stringify({ error: "Prompt is required." }) };
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    systemInstruction: "You are a creative, professional, and versatile lyricist capable of writing in multiple languages and adapting complex lyrical structures."
                }
            });
            responseText = response.text;

        } else if (action === 'generateImageDescription') {
            if (!file || !file.data || !file.mimeType) {
                return { statusCode: 400, body: JSON.stringify({ error: "File data for image description is required." }) };
            }
            
            const imagePart = { inlineData: { data: file.data, mimeType: file.mimeType } };
            const textPart = { text: "Describe this image in a way that could inspire a song. Focus on the mood, emotions, and potential stories within the scene. Be poetic and evocative." };
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ parts: [imagePart, textPart] }],
            });
            responseText = response.text;
        
        } else {
            return { statusCode: 400, body: JSON.stringify({ error: "Invalid action specified." }) };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result: responseText }),
        };

    } catch (error) {
        console.error("Error in Netlify function:", error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: "An internal error occurred while contacting the Gemini API." }),
        };
    }
};

export { handler };
