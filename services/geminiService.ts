
import { GoogleGenAI, Modality } from '@google/genai';
import { Message, AttachedFile } from '../types';
import { fileToGenerativePart } from '../utils/fileUtils';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const sendMessageToGemini = async (prompt: string, file: AttachedFile | null): Promise<Message> => {
  const model = ai.models['gemini-2.5-flash'];

  const parts: any[] = [];
  if (prompt) {
    parts.push({ text: prompt });
  }

  if (file) {
    if (file.isText) {
        // Prepend file content to the prompt for context
        const fileContent = `\n\n--- File Content: ${file.name} ---\n${file.content}`;
        if(parts.length > 0 && parts[0].text) {
             parts[0].text += fileContent;
        } else {
             parts.push({ text: fileContent });
        }
    } else {
      const filePart = await fileToGenerativePart(file);
      parts.push(filePart);
    }
  }

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: parts }
    });

    return {
      role: 'model',
      parts: [{ type: 'text', content: response.text }],
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get response from Gemini.");
  }
};

export const generateImageWithGemini = async (prompt: string): Promise<Message> => {
    if (!prompt) {
        throw new Error("A prompt is required for image generation.");
    }
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.[0];
        if (imagePart && imagePart.inlineData) {
            const base64Image = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType;
            return {
                role: 'model',
                parts: [{
                    type: 'image',
                    url: `data:${mimeType};base64,${base64Image}`,
                    alt: prompt,
                }],
            };
        } else {
            throw new Error("No image was generated. The model may have refused the prompt.");
        }
    } catch (error) {
        console.error("Gemini Image Generation Error:", error);
        throw new Error("Failed to generate image.");
    }
};
