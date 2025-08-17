import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Lightbulb,
  BarChart3,
  Clock
} from 'lucide-react';

interface ContentOpportunity {
  type: 'high_potential_underexplored' | 'high_potential_inconsistent' | 'oversaturated_low_performance' | 'engagement_goldmine';
  theme: string;
  score: number;
  videoCount: number;
  avgViews: number;
  avgRetention: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

interface ContentOpportunityCardProps {
  opportunities: ContentOpportunity[];
  onOpportunityClick?: (opportunity: ContentOpportunity) => void;
}

export const ContentOpportunityCard = ({ opportunities, onOpportunityClick }: ContentOpportunityCardProps) => {
  const getOpportunityIcon = (type: ContentOpportunity['type']) => {
    switch (type) {
      case 'high_potential_underexplored': return <Target className="w-4 h-4 text-green-500" />;
      case 'high_potential_inconsistent': return <BarChart3 className="w-4 h-4 text-yellow-500" />;
      case 'oversaturated_low_performance': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'engagement_goldmine': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getOpportunityLabel = (type: ContentOpportunity['type']) => {
    switch (type) {
      case 'high_potential_underexplored': return 'Alto Potencial - Poco Explorado';
      case 'high_potential_inconsistent': return 'Alto Potencial - Inconsistente';
      case 'oversaturated_low_performance': return 'Sobresaturado - Bajo Performance';
      case 'engagement_goldmine': return 'Mina de Oro - Engagement';
      default: return 'Oportunidad';
    }
  };

  const getPriorityColor = (priority: ContentOpportunity['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getRecommendationAction = (type: ContentOpportunity['type']) => {
    switch (type) {
      case 'high_potential_underexplored': return 'Crear más contenido';
      case 'high_potential_inconsistent': return 'Estandarizar approach';
      case 'oversaturated_low_performance': return 'Pausar y optimizar';
      case 'engagement_goldmine': return 'Replicar elementos';
      default: return 'Analizar';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          Oportunidades de Contenido
          <Badge variant="outline" className="ml-auto">
            {opportunities.filter(o => o.priority === 'high').length} alta prioridad
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {opportunities.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No hay oportunidades detectadas</p>
              <p className="text-xs text-text-muted mt-1">
                Necesitas más videos para detectar patterns
              </p>
            </div>
          ) : (
            opportunities.map((opportunity, index) => (
              <div
                key={`${opportunity.theme}-${opportunity.type}`}
                className="group border border-border/50 rounded-lg p-4 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => onOpportunityClick?.(opportunity)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-muted/30">
                      {getOpportunityIcon(opportunity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-text-primary text-sm mb-1 truncate group-hover:text-primary transition-colors">
                        {opportunity.theme}
                      </h4>
                      <p className="text-xs text-text-muted">
                        {getOpportunityLabel(opportunity.type)}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-xs ${getPriorityColor(opportunity.priority)}`}>
                    {opportunity.priority}
                  </Badge>
                </div>

                {/* Opportunity Score */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-text-secondary">Opportunity Score</span>
                    <span className="text-sm font-bold text-text-primary">
                      {opportunity.score}/100
                    </span>
                  </div>
                  <Progress value={opportunity.score} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-sm font-bold text-text-primary">
                      {opportunity.videoCount}
                    </div>
                    <div className="text-xs text-text-muted">Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-text-primary">
                      {(opportunity.avgViews / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-text-muted">Avg Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-text-primary">
                      {opportunity.avgRetention.toFixed(0)}%
                    </div>
                    <div className="text-xs text-text-muted">Retención</div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                  <div className="flex-1">
                    <p className="text-xs text-text-secondary">
                      {opportunity.recommendation}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs ml-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle action click
                    }}
                  >
                    {getRecommendationAction(opportunity.type)}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};