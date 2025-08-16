import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, Lightbulb, Target, Zap } from 'lucide-react';

interface InsightCardProps {
  title: string;
  description: string;
  type: 'pattern' | 'recommendation' | 'opportunity' | 'strategy';
  impact: 'high' | 'medium' | 'low';
  confidence?: number;
  metrics?: {
    improvement: string;
    baseline: string;
  };
  className?: string;
}

const typeConfig = {
  pattern: { icon: TrendingUp, label: 'Pattern', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  recommendation: { icon: Lightbulb, label: 'Recommendation', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  opportunity: { icon: Target, label: 'Opportunity', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  strategy: { icon: Zap, label: 'Strategy', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
};

const impactConfig = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  low: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
};

export const InsightCard = ({ 
  title, 
  description, 
  type, 
  impact, 
  confidence, 
  metrics, 
  className 
}: InsightCardProps) => {
  const TypeIcon = typeConfig[type].icon;

  return (
    <Card className={cn("bg-card border-border hover:shadow-lg transition-all duration-300", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <TypeIcon className="w-4 h-4 text-text-muted" />
            <Badge variant="outline" className={cn("text-xs", typeConfig[type].color)}>
              {typeConfig[type].label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", impactConfig[impact])}>
              {impact.toUpperCase()}
            </Badge>
            {confidence && (
              <span className="text-xs text-text-muted">{confidence}%</span>
            )}
          </div>
        </div>
        <CardTitle className="text-sm font-medium text-text-primary leading-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-text-secondary mb-3 leading-relaxed">
          {description}
        </p>
        {metrics && (
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-text-muted">Improvement:</span>
              <span className="text-success font-medium">{metrics.improvement}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-text-muted">Baseline:</span>
              <span className="text-text-primary font-medium">{metrics.baseline}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};