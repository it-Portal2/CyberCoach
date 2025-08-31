import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { jobRole, topic, questionCount = 5 } = req.body;
    
    const systemPrompt = `You are Jit Banerjee, creating assessment questions for a ${jobRole} student.
    
    Generate ${questionCount} questions about ${topic} that:
    - Test practical understanding, not just memorization
    - Include scenario-based questions
    - Have clear, unambiguous correct answers
    - Provide educational feedback for both correct and incorrect responses
    
    Return JSON array of questions with: question, options[], correctAnswer, explanation, difficulty, points`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: `Generate ${questionCount} assessment questions for ${jobRole} on ${topic}`,
    });

    const assessmentQuestions = JSON.parse(response.text || '{}');
    res.json(assessmentQuestions);
  } catch (error) {
    console.error('Assessment generation error:', error);
    res.status(500).json({ error: "Failed to generate assessment questions" });
  }
}