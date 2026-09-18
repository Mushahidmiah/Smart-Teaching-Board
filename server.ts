import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.post('/api/recognize-handwriting', async (req, res) => {
  try {
    const { image } = req.body; // base64 image data URL

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });
    }

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Extract base64 part
    const base64Data = image.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

    const systemInstruction = `You are a handwriting recognition assistant.
Your task is to transcribe handwriting into clean digital text.
Supported languages: Arabic, Bangla, English.
Keep Arabic in proper RTL format. Keep Bangla and English in proper Unicode text.
Return ONLY the transcribed text. Do NOT add any conversational filler, markdown formatting, or explanations. If you are extremely uncertain, return the closest guess, but prefer exact transcription. If the image is completely blank or contains no text, return an empty string.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        {
          inlineData: {
             data: base64Data,
             mimeType: "image/png"
          }
        },
        "Transcribe the handwritten text in this image."
      ],
      config: {
        systemInstruction,
      }
    });

    res.json({ text: response.text?.trim() || '' });
  } catch (error: any) {
    console.error('Handwriting API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to recognize handwriting' });
  }
});

app.post('/api/ai-assistant', async (req, res) => {
  try {
    const { studentLevel, age, currentLesson, prompt } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });
    }

    const systemInstruction = `You are an expert AI Quran and Tajweed Teacher Assistant.
You assist a qualified human Quran teacher. Keep your output concise and actionable.
Your responses should be suitable for a Quran teacher, respecting Islamic guidelines.
Note: You are an assistant, not a replacement for qualified instruction.
`;

    const userPrompt = `
Context:
Student Age: ${age || 'Unknown'}
Student Level: ${studentLevel || 'Unknown'}
Current Lesson: ${currentLesson || 'Unknown'}

Teacher's Request / Student's Issue:
${prompt}

Based on this context, provide:
1. A simple teaching explanation.
2. A short lesson plan to address the issue.
3. Relevant practice examples (include Arabic if applicable).
4. Recommended homework.
5. 5 simple quiz questions.
6. Teacher notes.
7. A short progress message to send to the guardian/parents.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING, description: "Simple teaching explanation" },
            lessonPlan: { type: Type.STRING, description: "Short lesson plan" },
            examples: { type: Type.STRING, description: "Practice examples (include Arabic)" },
            homework: { type: Type.STRING, description: "Recommended homework" },
            quiz: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "5 simple quiz questions" 
            },
            teacherNotes: { type: Type.STRING, description: "Private notes for the teacher" },
            guardianMessage: { type: Type.STRING, description: "Message to the student's guardian/parents" }
          },
          required: ["explanation", "lessonPlan", "examples", "homework", "quiz", "teacherNotes", "guardianMessage"]
        }
      }
    });

    const output = response.text;
    res.json(JSON.parse(output));

  } catch (error: any) {
    console.error('AI API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
