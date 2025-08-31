import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
// Import with fallback for Vercel deployment
let mentorRequestSchema: any, mentorResponseSchema: any;
try {
  const schema = require("../shared/schema.js");
  mentorRequestSchema = schema.mentorRequestSchema;
  mentorResponseSchema = schema.mentorResponseSchema;
} catch (error) {
  console.warn("Could not load schema, using basic validation");
  // Basic fallback validation
  mentorRequestSchema = {
    parse: (data: any) => {
      if (!data.message) throw new Error("Message is required");
      return data;
    }
  };
  mentorResponseSchema = {
    parse: (data: any) => data
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Parse JSON and URL encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// ✅ CORS middleware - handles preflight OPTIONS requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ✅ Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      if (req.path.startsWith("/api")) {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
      }
    });
    next();
  });
}

// ✅ Initialize AI
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

// ✅ API Routes with proper method handling
app.route("/api/mentor/chat")
  .post(async (req, res) => {
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
  })
  .all((req, res) => {
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  });

app.route("/api/mentor/generate-practice")
  .post(async (req, res) => {
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
  })
  .all((req, res) => {
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  });

app.route("/api/mentor/generate-assessment")
  .post(async (req, res) => {
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
  })
  .all((req, res) => {
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  });

// ✅ Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ Production: Serve React build files (only in non-serverless environments)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const distPath = path.resolve(__dirname, '..');
  
  console.log(`[Production] Serving static files from: ${distPath}`);
  
  // Serve static files (CSS, JS, images)
  app.use(express.static(distPath));
  
  // Catch-all handler: send back React's index.html file for client-side routing
  app.get('*', (req, res) => {
    const indexPath = path.resolve(distPath, 'index.html');
    console.log(`[Production] Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath);
  });
}

// ✅ Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error('Server error:', err);
  res.status(status).json({ 
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ✅ Start server (only when not in Vercel environment)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 AI API Key: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing'}`);
  });
}

// ✅ Export for Vercel
export default app;