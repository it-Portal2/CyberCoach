import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';

export function useProgress(roleId?: string) {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [overallStats, setOverallStats] = useState({
    totalConceptsCompleted: 0,
    averageProgress: 0,
    totalAssessments: 0,
    totalChatMessages: 0,
    activeRoles: 0
  });

  useEffect(() => {
    // Load initial progress data
    const stats = storage.getOverallStats();
    setOverallStats(stats);

    if (roleId) {
      const roleProgress = storage.getProgress(roleId);
      setProgress(prev => ({ ...prev, [roleId]: roleProgress }));
    }
  }, [roleId]);

  const updateRoleProgress = (role: string, value: number) => {
    storage.updateProgress(role, value);
    setProgress(prev => ({ ...prev, [role]: value }));
    
    // Update overall stats
    const newStats = storage.getOverallStats();
    setOverallStats(newStats);
  };

  const markConceptComplete = (conceptId: string) => {
    storage.markConceptComplete(conceptId);
    const newStats = storage.getOverallStats();
    setOverallStats(newStats);
  };

  const getRoleProgress = (role: string): number => {
    return progress[role] || storage.getProgress(role);
  };
  return {
    progress,
    overallStats,
    updateRoleProgress,
    markConceptComplete,
    getRoleProgress,
    isConceptComplete: storage.isConceptComplete.bind(storage)
  };
}
