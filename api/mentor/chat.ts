import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import { mentorRequestSchema, mentorResponseSchema } from "../../shared/schema.js";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    console.log('POST /api/mentor/chat - Received body:', req.body);
    
    const validatedRequest = mentorRequestSchema.parse(req.body);
    
    const systemPrompt = `You are "Jit Banerjee", an AI cybersecurity mentor with 20+ years of experience in penetration testing, red teaming, SOC analysis, incident response, and cybersecurity training. You are mentoring students through the AI Cyber Mentor platform powered by Cedar Pro Academy.

PERSONALITY AND APPROACH:
- Act as an experienced, patient, and encouraging mentor
- Ask clarifying questions before providing solutions
- Use real-world examples from your extensive field experience
- Provide structured, actionable guidance
- Never provide step-by-step exploit code for unauthorized targets
- Always emphasize ethics, authorization, and responsible disclosure
- Include confidence scores and measurable KPIs in responses

RESPONSE FORMAT:
Always respond with structured JSON containing:
- summary: Brief explanation of the topic/question
- response: Detailed mentor guidance and explanation
- methodology: Array of step-by-step approach (when applicable)
- examples: Real-world examples or analogies
- practiceTask: Suggested hands-on exercise (when applicable)
- hints: Progressive hints to guide learning
- confidence: Your confidence level (High/Medium/Low)
- kpis: Measurable metrics for success
- followUpQuestions: Questions to deepen understanding

SAFETY GUARDRAILS:
- Require proper authorization before discussing attack techniques
- Refuse to provide exploit code for non-sandboxed environments
- Emphasize legal and ethical considerations
- Redirect harmful requests to educational alternatives

Job role context: ${validatedRequest.jobRole || 'General Cybersecurity'}
Additional context: ${validatedRequest.context || 'None provided'}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            response: { type: "string" },
            methodology: { 
              type: "array", 
              items: { type: "string" } 
            },
            examples: { 
              type: "array", 
              items: { type: "string" } 
            },
            practiceTask: { type: "string" },
            hints: { 
              type: "array", 
              items: { type: "string" } 
            },
            confidence: { 
              type: "string",
              enum: ["High", "Medium", "Low"]
            },
            kpis: { 
              type: "array", 
              items: { type: "string" } 
            },
            followUpQuestions: { 
              type: "array", 
              items: { type: "string" } 
            }
          },
          required: ["summary", "response", "confidence"]
        },
      },
      contents: validatedRequest.message,
    });

    const mentorResponse = JSON.parse(response.text || '{}');
    const validatedResponse = mentorResponseSchema.parse(mentorResponse);
    
    console.log('Sending response:', validatedResponse);
    res.json(validatedResponse);
  } catch (error) {
    console.error('Mentor chat error:', error);
    res.status(500).json({ 
      error: "I'm temporarily unavailable. Please try again in a moment.",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}