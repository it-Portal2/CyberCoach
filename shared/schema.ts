import { z } from "zod";

// Progress tracking schema
export const progressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  jobRole: z.string(),
  conceptId: z.string(),
  skillLevel: z.number().min(0).max(100),
  completedAt: z.date(),
  score: z.number().min(0).max(100).optional(),
  timeSpent: z.number().min(0), // in minutes
});

export const insertProgressSchema = progressSchema.omit({ id: true });

// Chat session schema
export const chatSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  messages: z.array(z.object({
    role: z.enum(['user', 'mentor']),
    content: z.string(),
    timestamp: z.date(),
  })),
  jobRole: z.string().optional(),
  topic: z.string().optional(),
  createdAt: z.date(),
});

export const insertChatSessionSchema = chatSessionSchema.omit({ id: true });

// Assessment result schema
export const assessmentResultSchema = z.object({
  id: z.string(),
  userId: z.string(),
  jobRole: z.string(),
  assessmentType: z.enum(['knowledge-check', 'practice', 'quiz']),
  questions: z.array(z.object({
    question: z.string(),
    userAnswer: z.string(),
    correctAnswer: z.string().optional(),
    score: z.number().min(0).max(100),
    feedback: z.string(),
  })),
  totalScore: z.number().min(0).max(100),
  completedAt: z.date(),
});

export const insertAssessmentResultSchema = assessmentResultSchema.omit({ id: true });

// Mentor request/response schema
export const mentorRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  jobRole: z.string().optional(),
  context: z.string().optional(),
  sessionId: z.string().optional(),
});

export const mentorResponseSchema = z.object({
  summary: z.string(),
  response: z.string(),
  methodology: z.array(z.string()).optional(),
  examples: z.array(z.string()).optional(),
  practiceTask: z.string().optional(),
  hints: z.array(z.string()).optional(),
  confidence: z.enum(['High', 'Medium', 'Low']),
  kpis: z.array(z.string()).optional(),
  followUpQuestions: z.array(z.string()).optional(),
});

export type Progress = z.infer<typeof progressSchema>;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type ChatSession = z.infer<typeof chatSessionSchema>;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type AssessmentResult = z.infer<typeof assessmentResultSchema>;
export type InsertAssessmentResult = z.infer<typeof insertAssessmentResultSchema>;
export type MentorRequest = z.infer<typeof mentorRequestSchema>;
export type MentorResponse = z.infer<typeof mentorResponseSchema>;
