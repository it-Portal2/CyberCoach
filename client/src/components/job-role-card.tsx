import { Link } from 'wouter';
import { JobRole, getCategoryColors } from '@/lib/job-roles';
import { useProgress } from '@/hooks/use-progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface JobRoleCardProps {
  role: JobRole;
}

export function JobRoleCard({ role }: JobRoleCardProps) {
  const { getRoleProgress } = useProgress();
  const progress = getRoleProgress(role.id);
  const colors = getCategoryColors(role.category);

  return (
    <Link href={`/role/${role.id}`}>
      <Card className="tool-card rounded-xl group cursor-pointer h-full" data-testid={`card-job-role-${role.id}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 ${colors.bg} rounded-lg`}>
              <i className={`${role.icon} ${colors.text} text-2xl`}></i>
            </div>
            <Badge variant="outline" className={`${colors.bg} ${colors.text} border-current`}>
              {role.category}
            </Badge>
          </div>
          
          <h3 className={`text-xl font-bold mb-2 ${colors.text}`}>
            {role.name}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {role.description}
          </p>

          {progress > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground">
              {role.concepts} concepts • {role.scenarios} scenarios
            </span>
            <Badge variant="secondary" className="text-xs">
              {role.difficulty}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center flex-wrap gap-1">
              {role.skills.slice(0, 2).map((skill, index) => (
                <span key={index} className="text-xs bg-secondary/50 px-2 py-1 rounded text-muted-foreground">
                  {skill}
                </span>
              ))}
              {role.skills.length > 2 && (
                <span className="text-xs text-muted-foreground">+{role.skills.length - 2}</span>
              )}
            </div>
            <i className={`fas fa-arrow-right ${colors.text} group-hover:translate-x-1 transition-transform`}></i>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
