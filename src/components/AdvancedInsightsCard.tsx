import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdvancedInsight } from '@/utils/advancedAnalyticsEngine';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  ChevronRight,
  Lightbulb,
  BarChart3,
  Zap
} from 'lucide-react';

interface AdvancedInsightsCardProps {
  insights: AdvancedInsight[];
  onInsightClick?: (insight: AdvancedInsight) => void;
}

export const AdvancedInsightsCard = ({ insights, onInsightClick }: AdvancedInsightsCardProps) => {
  const getInsightIcon = (type: AdvancedInsight['type']) => {
    switch (type) {
      case 'cluster_opportunity': return <Target className="w-4 h-4" />;
      case 'viral_prediction': return <TrendingUp className="w-4 h-4" />;
      case 'content_gap': return <Lightbulb className="w-4 h-4" />;
      case 'performance_anomaly': return <AlertTriangle className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: AdvancedInsight['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getTypeLabel = (type: AdvancedInsight['type']) => {
    switch (type) {
      case 'cluster_opportunity': return 'Oportunidad de Cluster';
      case 'viral_prediction': return 'Predicción Viral';
      case 'content_gap': return 'Gap de Contenido';
      case 'performance_anomaly': return 'Anomalía de Performance';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Advanced Insights
          <Badge variant="outline" className="ml-auto">
            {insights.length} insights
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">Procesando insights avanzados...</p>
              <p className="text-xs text-text-muted mt-1">
                Necesitas al menos 5 videos con brain vectors
              </p>
            </div>
          ) : (
            insights.map((insight) => (
              <div
                key={insight.id}
                className="group border border-border/50 rounded-lg p-4 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => onInsightClick?.(insight)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${getPriorityColor(insight.priority)}`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary text-sm group-hover:text-primary transition-colors">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-text-muted">
                        {getTypeLabel(insight.type)} • {insight.confidence}% confianza
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                </div>

                <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                  {insight.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {insight.data_source.replace('_', ' ')}
                    </Badge>
                    {insight.affected_videos && insight.affected_videos.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {insight.affected_videos.length} videos
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-text-muted">
                    {insight.potential_impact}
                  </div>
                </div>

                {insight.action_items && insight.action_items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <p className="text-xs text-text-muted mb-2">Acciones recomendadas:</p>
                    <ul className="space-y-1">
                      {insight.action_items.slice(0, 2).map((action, index) => (
                        <li key={index} className="text-xs text-text-secondary flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};