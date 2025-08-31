import { type Progress, type ChatSession, type AssessmentResult } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for cybersecurity mentoring platform
export interface IStorage {
  // Progress tracking
  getProgress(userId: string, jobRole: string): Promise<Progress | undefined>;
  updateProgress(progress: Progress): Promise<Progress>;
  
  // Chat sessions
  getChatSession(sessionId: string): Promise<ChatSession | undefined>;
  saveChatSession(session: ChatSession): Promise<ChatSession>;
  
  // Assessment results
  saveAssessmentResult(result: AssessmentResult): Promise<AssessmentResult>;
  getAssessmentResults(userId: string, jobRole?: string): Promise<AssessmentResult[]>;
}

export class MemStorage implements IStorage {
  private progress: Map<string, Progress> = new Map();
  private chatSessions: Map<string, ChatSession> = new Map();
  private assessmentResults: Map<string, AssessmentResult> = new Map();

  constructor() {
    // Initialize empty storage
  }

  async getProgress(userId: string, jobRole: string): Promise<Progress | undefined> {
    const key = `${userId}-${jobRole}`;
    return this.progress.get(key);
  }

  async updateProgress(progressData: Progress): Promise<Progress> {
    const key = `${progressData.userId}-${progressData.jobRole}`;
    this.progress.set(key, progressData);
    return progressData;
  }

  async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(sessionId);
  }

  async saveChatSession(session: ChatSession): Promise<ChatSession> {
    this.chatSessions.set(session.id, session);
    return session;
  }

  async saveAssessmentResult(result: AssessmentResult): Promise<AssessmentResult> {
    this.assessmentResults.set(result.id, result);
    return result;
  }

  async getAssessmentResults(userId: string, jobRole?: string): Promise<AssessmentResult[]> {
    const results = Array.from(this.assessmentResults.values()).filter(
      result => result.userId === userId && (!jobRole || result.jobRole === jobRole)
    );
    return results;
  }
}

export const storage = new MemStorage();
