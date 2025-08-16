import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  className?: string;
}

const colorConfig = {
  blue: 'text-blue-400',
  green: 'text-green-400', 
  purple: 'text-purple-400',
  orange: 'text-orange-400'
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
};

const getProgressColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

export const ScoreCard = ({ 
  title, 
  score, 
  description, 
  color = 'blue', 
  className 
}: ScoreCardProps) => {
  return (
    <Card className={cn("bg-card border-border hover:shadow-lg transition-all duration-300", className)}>
      <CardHeader className="pb-2">
        <CardTitle className={cn("text-sm font-medium", colorConfig[color])}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={cn("text-2xl font-bold", getScoreColor(score))}>
              {score}
            </span>
            <span className="text-sm text-text-muted">/100</span>
          </div>
          
          <Progress 
            value={score} 
            className="h-2"
            style={{
              background: 'hsl(var(--muted))'
            }}
          />
          
          <p className="text-xs text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};