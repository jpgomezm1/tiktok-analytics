import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  Users,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';

interface ExecutiveSummaryData {
  viralReadiness: number;
  contentDiversity: number;
  optimizationOpportunities: number;
  topClusters: number;
  highPotentialVideos: number;
  criticalInsights: number;
  optimalHours: number;
  contentGaps: number;
}

interface ExecutiveSummaryCardProps {
  data: ExecutiveSummaryData;
  isLoading?: boolean;
}

export const ExecutiveSummaryCard = ({ data, isLoading }: ExecutiveSummaryCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Necesita Mejora';
  };

  const getOverallHealthScore = () => {
    const scores = [
      data.viralReadiness,
      data.contentDiversity,
      Math.min(100, data.optimizationOpportunities * 20), // Convert count to percentage
      Math.min(100, data.topClusters * 25) // Convert count to percentage
    ];
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const overallScore = getOverallHealthScore();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Resumen Ejecutivo de Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded"></div>
            <div className="h-20 bg-muted animate-pulse rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-muted animate-pulse rounded"></div>
              <div className="h-16 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Resumen Ejecutivo de Analytics
          <Badge variant="outline" className="ml-auto">
            Score General: {overallScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Health Score */}
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-text-primary">Health Score General</h3>
              <span className={`text-xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </span>
            </div>
            <Progress value={overallScore} className="h-3 mb-2" />
            <p className="text-sm text-text-secondary">
              {getScoreStatus(overallScore)} - Basado en viralidad, diversidad de contenido y oportunidades de IA
            </p>
          </div>

          {/* Key Insights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Zap className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(data.viralReadiness)}`} />
              <div className={`text-lg font-bold ${getScoreColor(data.viralReadiness)}`}>
                {data.viralReadiness}%
              </div>
              <div className="text-xs text-text-muted">Viral Readiness</div>
            </div>

            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Layers className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(data.contentDiversity)}`} />
              <div className={`text-lg font-bold ${getScoreColor(data.contentDiversity)}`}>
                {data.contentDiversity}%
              </div>
              <div className="text-xs text-text-muted">Content Diversity</div>
            </div>

            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Target className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <div className="text-lg font-bold text-text-primary">
                {data.optimizationOpportunities}
              </div>
              <div className="text-xs text-text-muted">Oportunidades</div>
            </div>

            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-lg font-bold text-text-primary">
                {data.topClusters}
              </div>
              <div className="text-xs text-text-muted">Top Clusters</div>
            </div>
          </div>

          {/* Action Items */}
          <div className="space-y-3">
            <h4 className="font-medium text-text-primary flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Próximas Acciones Recomendadas
            </h4>
            
            <div className="space-y-2">
              {data.criticalInsights > 0 && (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-600">
                      {data.criticalInsights} insights críticos requieren atención
                    </p>
                    <p className="text-xs text-red-500/80">
                      Revisa la tab "AI Insights" para details
                    </p>
                  </div>
                </div>
              )}

              {data.highPotentialVideos > 0 && (
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-600">
                      {data.highPotentialVideos} videos con alto potencial viral
                    </p>
                    <p className="text-xs text-green-500/80">
                      Considera promocionar estos videos
                    </p>
                  </div>
                </div>
              )}

              {data.contentGaps > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Target className="w-4 h-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-600">
                      {data.contentGaps} gaps de contenido identificados
                    </p>
                    <p className="text-xs text-blue-500/80">
                      Oportunidades para expandir temas exitosos
                    </p>
                  </div>
                </div>
              )}

              {data.optimalHours > 0 && (
                <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-600">
                      {data.optimalHours} horarios óptimos identificados
                    </p>
                    <p className="text-xs text-purple-500/80">
                      Optimiza tu calendario de publicación
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/30">
            <div className="text-center">
              <div className="text-xs text-text-muted mb-1">CLUSTERS ACTIVOS</div>
              <div className="text-2xl font-bold text-primary">{data.topClusters}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-text-muted mb-1">VIRAL READINESS</div>
              <div className={`text-2xl font-bold ${getScoreColor(data.viralReadiness)}`}>
                {data.viralReadiness}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-text-muted mb-1">DIVERSIDAD</div>
              <div className={`text-2xl font-bold ${getScoreColor(data.contentDiversity)}`}>
                {data.contentDiversity}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};