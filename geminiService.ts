import type { FormData } from '../types';

// The new endpoint for our secure Netlify Function
const PROXY_ENDPOINT = '/.netlify/functions/gemini-proxy';

// This helper function builds the prompt on the client-side
const buildPrompt = (formData: FormData): string => {
    const { theme, language, genre, mood, audience, rhyme, artistStyle, additionalNotes } = formData;

    let prompt = `You are a professional lyricist. Write a complete song based on the following instructions.

Target Language: ${language}
Main Theme/Story/Emotion: "${theme}"

The output MUST contain the following sections, clearly labeled with their names: INTRO, VERSE 1, CHORUS, VERSE 2, BRIDGE, and OUTRO.

Crucial Instruction: Use different, suitable rhyme schemes or lyrical styles for each of the required sections (INTRO, VERSE 1, CHORUS, VERSE 2, BRIDGE, OUTRO) to enhance musicality, while respecting the overall preferred rhyme scheme if specified.

The final output must be a single block of text with no introductory or concluding commentary, just the formatted lyrics.

--- Optional Details ---
`;

    if (genre) prompt += `Genre Preference: ${genre}\n`;
    if (mood) prompt += `Mood/Tone: ${mood}\n`;
    if (audience) prompt += `Target Audience: ${audience}\n`;
    if (rhyme) prompt += `Overall Rhyme Scheme Preference (Use different schemes per section while aligning to this overall feel): ${rhyme}\n`;
    if (artistStyle) prompt += `Artist Style/Inspiration: ${artistStyle}\n`;
    if (additionalNotes) prompt += `Specific Instructions/Notes: ${additionalNotes}\n`;

    return prompt;
};

// Helper to convert a File object to a base64 string for JSON transport
const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});


export const generateLyrics = async (formData: FormData): Promise<string> => {
    const prompt = buildPrompt(formData);

    const response = await fetch(PROXY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generateLyrics', prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("API Proxy Error:", data.error);
        throw new Error(data.error || "Failed to generate lyrics via proxy.");
    }
    
    if (!data.result) {
        throw new Error("The model did not return any lyrics. Please try again with a different theme.");
    }

    return data.result;
};

export const generateImageDescription = async (file: File): Promise<string> => {
    const base64Data = await fileToBase64(file);

    const response = await fetch(PROXY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'generateImageDescription',
            file: { data: base64Data, mimeType: file.type }
        }),
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error("API Proxy Error:", data.error);
        throw new Error(data.error || "Failed to generate image description via proxy.");
    }
    
    if (!data.result) {
        throw new Error("The model could not describe the image.");
    }

    return data.result;
};
