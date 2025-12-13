
/**
 * AI Service for analyzing drawings
 * Uses Google Gemini Pro Vision API
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // User needs to set this in .env

export async function analyzeDrawing(imageBase64, targetWord) {
    if (!API_KEY) {
        console.warn("No Gemini API Key found. Returning mock response.");
        // Mock response for testing without key
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    isMatch: true,
                    feedback: `(테스트) 와! "${targetWord}"의 느낌을 정말 잘 표현하셨네요! 멋집니다!`,
                    confidence: 0.95
                });
            }, 1500);
        });
    }

    try {
        // Remove header from base64 if present
        const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Look at this drawing. The user was trying to draw "${targetWord}". 
                         1. Does this drawing reasonably represent "${targetWord}" OR is it the word "${targetWord}" written out?
                         2. Give a short 1-sentence encouraging feedback in Korean (한국어).
                         
                         Return JSON: { "isMatch": boolean, "feedback": string }`
                                },
                                {
                                    inline_data: {
                                        mime_type: "image/png",
                                        data: base64Data
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        response_mime_type: "application/json"
                    }
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const resultText = data.candidates[0].content.parts[0].text;
        return JSON.parse(resultText);

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        return {
            isMatch: false,
            feedback: "Could not analyze drawing at the moment.",
            error: true
        };
    }
}
