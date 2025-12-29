
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message } from "../types";

// Standard client for most tasks
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const chatService = {
  async sendMessage(
    message: string, 
    history: Message[], 
    imagePart?: { data: string, mimeType: string }
  ) {
    const ai = getClient();
    
    const parts: any[] = [{ text: message }];
    if (imagePart) {
      parts.push({
        inlineData: imagePart
      });
    }

    // Using gemini-flash-lite-latest for low-latency responses as requested
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      text: response.text || "I'm sorry, I couldn't process that.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  }
};

export const imageService = {
  async generateImage(prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1") {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: { aspectRatio }
      }
    });

    let imageUrl = '';
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return imageUrl;
  }
};

export const audioUtils = {
  encode: (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  },
  decode: (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  },
  decodeAudioData: async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
};
