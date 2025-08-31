interface StorageData {
  progress: Record<string, number>;
  completedConcepts: string[];
  assessmentResults: any[];
  chatHistory: any[];
  activities: any[];
  userPreferences: {
    selectedRole?: string;
    darkMode: boolean;
    notifications: boolean;
  };
}

class LocalStorageManager {
  private storageKey = 'ai-cyber-mentor';

  private getStorageData(): StorageData {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : this.getDefaultData();
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return this.getDefaultData();
    }
  }

  private getDefaultData(): StorageData {
    return {
      progress: {},
      completedConcepts: [],
      assessmentResults: [],
      chatHistory: [],
      activities: [],
      userPreferences: {
        darkMode: true,
        notifications: true
      }
    };
  }

  private saveStorageData(data: StorageData): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Progress management
  getProgress(roleId: string): number {
    const data = this.getStorageData();
    return data.progress[roleId] || 0;
  }

  updateProgress(roleId: string, progress: number): void {
    const data = this.getStorageData();
    data.progress[roleId] = Math.max(0, Math.min(100, progress));
    this.saveStorageData(data);
  }

  // Concept completion
  markConceptComplete(conceptId: string): void {
    const data = this.getStorageData();
    if (!data.completedConcepts.includes(conceptId)) {
      data.completedConcepts.push(conceptId);
      this.saveStorageData(data);
    }
  }

  isConceptComplete(conceptId: string): boolean {
    const data = this.getStorageData();
    return data.completedConcepts.includes(conceptId);
  }

  // Assessment results
  saveAssessmentResult(result: any): void {
    const data = this.getStorageData();
    data.assessmentResults.push({
      ...result,
      timestamp: new Date().toISOString()
    });
    this.saveStorageData(data);
  }

  getAssessmentResults(roleId?: string): any[] {
    const data = this.getStorageData();
    return roleId 
      ? data.assessmentResults.filter(result => result.jobRole === roleId)
      : data.assessmentResults;
  }

  // Chat history
  saveChatMessage(message: any): void {
    const data = this.getStorageData();
    data.chatHistory.push({
      ...message,
      timestamp: new Date().toISOString()
    });
    // Keep only last 100 messages
    if (data.chatHistory.length > 100) {
      data.chatHistory = data.chatHistory.slice(-100);
    }
    this.saveStorageData(data);
  }

  getChatHistory(): any[] {
    const data = this.getStorageData();
    return data.chatHistory;
  }

  clearChatHistory(): void {
    const data = this.getStorageData();
    data.chatHistory = [];
    this.saveStorageData(data);
  }

  // User preferences
  updatePreferences(preferences: Partial<StorageData['userPreferences']>): void {
    const data = this.getStorageData();
    data.userPreferences = { ...data.userPreferences, ...preferences };
    this.saveStorageData(data);
  }

  getPreferences(): StorageData['userPreferences'] {
    const data = this.getStorageData();
    return data.userPreferences;
  }

  // Activity tracking
  addActivity(activity: any): void {
    const data = this.getStorageData();
    const newActivity = {
      ...activity,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    data.activities.unshift(newActivity);
    // Keep only last 50 activities
    if (data.activities.length > 50) {
      data.activities = data.activities.slice(0, 50);
    }
    this.saveStorageData(data);
  }

  getRecentActivities(limit: number = 10): any[] {
    const data = this.getStorageData();
    return data.activities.slice(0, limit);
  }

  // Overall stats
  getOverallStats() {
    const data = this.getStorageData();
    const totalProgress = Object.values(data.progress).reduce((sum, prog) => sum + prog, 0);
    const avgProgress = Object.keys(data.progress).length > 0 
      ? totalProgress / Object.keys(data.progress).length 
      : 0;

    return {
      totalConceptsCompleted: data.completedConcepts.length,
      averageProgress: Math.round(avgProgress),
      totalAssessments: data.assessmentResults.length,
      totalChatMessages: data.chatHistory.length,
      activeRoles: Object.keys(data.progress).length
    };
  }

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const storage = new LocalStorageManager();
