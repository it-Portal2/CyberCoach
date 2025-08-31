import { MentorRequest, MentorResponse } from "@shared/schema";

export class MentorAI {
  private getBaseUrl(): string {
    if (typeof window !== "undefined") {
      if (
        window.location.hostname.includes("vercel.app") ||
        window.location.hostname !== "localhost"
      ) {
        return ""; // Production: same origin
      }
      return "http://localhost:3000"; // Development
    }
    return process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";
  }

  private async makeRequest(endpoint: string, data: any) {
    const baseUrl = this.getBaseUrl();
    const fullUrl = `${baseUrl}${endpoint}`;

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return await response.json();
  }
  async askMentor(request: MentorRequest): Promise<MentorResponse> {
    return await this.makeRequest("/api/mentor/chat", request);
  }

  async generatePractice(jobRole: string, difficulty: string, topic: string) {
    return await this.makeRequest("/api/mentor/generate-practice", {
      jobRole,
      difficulty,
      topic,
    });
  }

  async generateAssessment(
    jobRole: string,
    topic: string,
    questionCount: number = 5
  ) {
    return await this.makeRequest("/api/mentor/generate-assessment", {
      jobRole,
      topic,
      questionCount,
    });
  }

  // Helper method to create contextual requests
  createContextualRequest(
    message: string,
    jobRole?: string,
    context?: string,
    sessionId?: string
  ): MentorRequest {
    return {
      message,
      jobRole,
      context,
      sessionId,
    };
  }

  // Common mentor interactions
  async askForGuidance(message: string, jobRole?: string) {
    return this.askMentor(
      this.createContextualRequest(message, jobRole, "seeking guidance")
    );
  }

  async requestMethodology(task: string, jobRole: string) {
    return this.askMentor(
      this.createContextualRequest(
        `Please provide a detailed methodology for: ${task}`,
        jobRole,
        "methodology request"
      )
    );
  }

  async askForHints(problem: string, jobRole?: string) {
    return this.askMentor(
      this.createContextualRequest(
        `I'm stuck on this problem: ${problem}. Can you provide some hints?`,
        jobRole,
        "hint request"
      )
    );
  }

  async requestCareerAdvice(currentLevel: string, targetRole: string) {
    return this.askMentor(
      this.createContextualRequest(
        `I'm currently at ${currentLevel} level and want to become a ${targetRole}. What should be my next steps?`,
        targetRole,
        "career advice"
      )
    );
  }
}

export const mentorAI = new MentorAI();
