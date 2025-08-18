import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  className?: string;
  icon?: React.ReactNode;
}

const colorConfig = {
  blue: {
    text: 'text-blue-400',
    bg: 'from-blue-500/10 to-blue-600/5',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/20'
  },
  green: {
    text: 'text-green-400',
    bg: 'from-green-500/10 to-green-600/5',
    border: 'border-green-500/20',
    iconBg: 'bg-green-500/20'
  },
  purple: {
    text: 'text-purple-400',
    bg: 'from-purple-500/10 to-purple-600/5',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/20'
  },
  orange: {
    text: 'text-orange-400',
    bg: 'from-orange-500/10 to-orange-600/5',
    border: 'border-orange-500/20',
    iconBg: 'bg-orange-500/20'
  }
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

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bueno';
  if (score >= 40) return 'Regular';
  return 'Mejorable';
};

export const ScoreCard = ({ 
  title, 
  score, 
  description, 
  color = 'blue', 
  className,
  icon
}: ScoreCardProps) => {
  const config = colorConfig[color];
  
  return (
    <Card className={cn(
      "bg-gradient-to-br",
      config.bg,
      config.border,
      "hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden",
      "min-w-0", // Prevent overflow
      className
    )}>
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {icon && (
              <div className={cn("p-1.5 rounded-lg flex-shrink-0", config.iconBg)}>
                {icon}
              </div>
            )}
            <span className={cn(
              "text-sm font-semibold truncate",
              config.text
            )}>
              {title}
            </span>
          </div>
          <div className="flex-shrink-0">
            <span className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              score >= 80 ? "bg-green-500/20 text-green-600" :
              score >= 60 ? "bg-yellow-500/20 text-yellow-600" :
              score >= 40 ? "bg-orange-500/20 text-orange-600" :
              "bg-red-500/20 text-red-600"
            )}>
              {getScoreLabel(score)}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 pb-4">
        <div className="space-y-4">
          {/* Score Display */}
          <div className="flex items-end justify-center">
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className={cn("text-3xl font-bold", getScoreColor(score))}>
                  {score}
                </span>
                <span className="text-lg text-text-muted font-medium">/100</span>
              </div>
              <div className="text-xs text-text-muted mt-1">
                Score de performance
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted">Progreso</span>
              <span className={cn("font-medium", getScoreColor(score))}>
                {score}%
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={score} 
                className="h-2 bg-background/50"
              />
              <div 
                className={cn(
                  "absolute top-0 left-0 h-2 rounded-full transition-all duration-1000",
                  getProgressColor(score)
                )}
                style={{ width: `${Math.min(100, score)}%` }}
              />
            </div>
          </div>
          
          {/* Description */}
          <div className="pt-1">
            <p className="text-xs text-text-secondary leading-relaxed break-words">
              {description}
            </p>
          </div>
          
          {/* Additional Score Breakdown */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30">
            <div className="text-center">
              <div className={cn("text-xs font-semibold", config.text)}>
                {score >= 80 ? '🏆' : score >= 60 ? '📈' : score >= 40 ? '⚡' : '🎯'}
              </div>
              <div className="text-xs text-text-muted mt-1">
                {score >= 80 ? 'Top' : score >= 60 ? 'Sólido' : score >= 40 ? 'Activo' : 'Mejora'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-text-primary">
                {Math.round(score / 20)}★
              </div>
              <div className="text-xs text-text-muted mt-1">
                Rating
              </div>
            </div>
            <div className="text-center">
              <div className={cn("text-xs font-semibold", getScoreColor(score))}>
                {score >= 80 ? '+15%' : score >= 60 ? '+8%' : score >= 40 ? '+3%' : '0%'}
              </div>
              <div className="text-xs text-text-muted mt-1">
                Boost
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};