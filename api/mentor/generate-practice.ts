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
    const { jobRole, difficulty, topic } = req.body;
    
    const systemPrompt = `You are Jit Banerjee, generating a practice scenario for a ${jobRole} student. 
    
    Create a realistic, hands-on practice exercise that:
    - Is appropriate for ${difficulty} level
    - Focuses on ${topic}
    - Can be completed in a safe, sandboxed environment
    - Includes clear objectives and success criteria
    - Provides step-by-step guidance without giving away answers
    
    Return JSON with: scenario, objectives[], steps[], hints[], expectedOutcome, safetyNotes[]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: `Generate a practice scenario for ${jobRole} focusing on ${topic} at ${difficulty} level`,
    });

    const practiceScenario = JSON.parse(response.text || '{}');
    res.json(practiceScenario);
  } catch (error) {
    console.error('Practice generation error:', error);
    res.status(500).json({ error: "Failed to generate practice scenario" });
  }
}