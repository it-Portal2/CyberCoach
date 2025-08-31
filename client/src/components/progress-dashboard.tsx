import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useProgress } from '@/hooks/use-progress';
import { jobRoles } from '@/lib/job-roles';
import { storage } from '@/lib/storage';

// Helper function to format timestamps
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export function ProgressDashboard() {
  const { overallStats, getRoleProgress } = useProgress();

  // Get real-time activities from storage safely
  let realActivities: any[] = [];
  try {
    realActivities = storage.getRecentActivities(4);
  } catch (error) {
    console.warn('Could not load activities:', error);
  }
  
  // Default activities if no real activities exist
  const defaultActivities = [
    {
      id: 1,
      type: 'completion',
      title: 'Completed: Red Team Methodology',
      timeAgo: '2 hours ago',
      xp: 150,
      color: 'text-accent'
    },
    {
      id: 2,
      type: 'practice',
      title: 'Practice: SOC Alert Analysis',
      timeAgo: '5 hours ago',
      xp: 85,
      color: 'text-blue-400'
    },
    {
      id: 3,
      type: 'quiz',
      title: 'Quiz: Network Security',
      timeAgo: '1 day ago',
      xp: 120,
      color: 'text-yellow-400'
    },
    {
      id: 4,
      type: 'case-study',
      title: 'Case Study: Advanced Persistent Threat',
      timeAgo: '2 days ago',
      xp: 200,
      color: 'text-purple-400'
    }
  ];

  const recentActivities = realActivities.length > 0 ? realActivities : defaultActivities;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Progress Chart */}
      <Card className="tool-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-chart-line text-primary mr-2"></i>
            Skill Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobRoles.slice(0, 4).map((role) => {
              const progress = getRoleProgress(role.id);
              const colors = role.color === 'red' ? 'text-red-400' : 
                           role.color === 'blue' ? 'text-blue-400' :
                           role.color === 'yellow' ? 'text-yellow-400' :
                           role.color === 'purple' ? 'text-purple-400' :
                           'text-primary';
              
              return (
                <div key={role.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{role.name}</span>
                    <span className={`text-sm ${colors}`}>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="tool-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-clock text-primary mr-2"></i>
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              // Format timestamp for real activities
              const timeAgo = activity.timestamp 
                ? formatTimeAgo(activity.timestamp)
                : activity.timeAgo;
              
              // Get appropriate color based on activity type
              const getActivityColor = (type: string) => {
                switch (type) {
                  case 'practice': return 'bg-blue-400';
                  case 'assessment': return 'bg-yellow-400';
                  case 'chat': return 'bg-green-400';
                  case 'scenario': return 'bg-purple-400';
                  case 'completion': return 'bg-accent';
                  default: return 'bg-primary';
                }
              };

              const colorClass = activity.color 
                ? activity.color.replace('text-', 'bg-') 
                : getActivityColor(activity.type);

              return (
                <div 
                  key={activity.id}
                  className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg"
                  data-testid={`activity-${activity.type}-${activity.id}`}
                >
                  <div className={`w-2 h-2 ${colorClass} rounded-full`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{activity.title}</div>
                    <div className="text-xs text-muted-foreground">{timeAgo}</div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`bg-primary/20 text-primary border-primary text-xs font-semibold`}
                  >
                    +{activity.xp} XP
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
