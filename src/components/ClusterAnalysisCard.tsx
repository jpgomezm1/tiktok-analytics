import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ClusterAnalysis } from '@/utils/advancedAnalyticsEngine';
import { 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Users,
  BarChart3,
  Eye,
  Target
} from 'lucide-react';

interface ClusterAnalysisCardProps {
  clusters: ClusterAnalysis[];
  onClusterClick?: (cluster: ClusterAnalysis) => void;
}

export const ClusterAnalysisCard = ({ clusters, onClusterClick }: ClusterAnalysisCardProps) => {
  const getTrendIcon = (trend: ClusterAnalysis['performance_trend']) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'declining': return <TrendingDown className="w-3 h-3 text-red-500" />;
      case 'stable': return <Minus className="w-3 h-3 text-text-muted" />;
    }
  };

  const getTrendColor = (trend: ClusterAnalysis['performance_trend']) => {
    switch (trend) {
      case 'improving': return 'text-green-500';
      case 'declining': return 'text-red-500';
      case 'stable': return 'text-text-muted';
    }
  };

  const getOptimizationColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-500" />
          Análisis de Clusters de Contenido
          <Badge variant="outline" className="ml-auto">
            {clusters.length} clusters
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clusters.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No hay clusters de contenido</p>
              <p className="text-xs text-text-muted mt-1">
                Se crean automáticamente con más videos
              </p>
            </div>
          ) : (
            clusters.slice(0, 6).map((cluster) => (
              <div
                key={cluster.cluster_id}
                className="group border border-border/50 rounded-lg p-4 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => onClusterClick?.(cluster)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-primary text-sm mb-1 truncate group-hover:text-primary transition-colors">
                      {cluster.cluster_name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {cluster.vector_count} videos
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {cluster.content_type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(cluster.performance_trend)}
                    <span className={`text-xs font-medium ${getTrendColor(cluster.performance_trend)}`}>
                      {cluster.performance_trend === 'improving' ? 'Mejorando' : 
                       cluster.performance_trend === 'declining' ? 'Bajando' : 'Estable'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Performance Score */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-text-secondary">Performance Score</span>
                      <span className={`text-sm font-bold ${getOptimizationColor(cluster.optimization_score)}`}>
                        {cluster.optimization_score.toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={cluster.optimization_score} 
                      className="h-2"
                    />
                  </div>

                  {/* Top Videos Preview */}
                  {cluster.top_videos.length > 0 && (
                    <div>
                      <p className="text-xs text-text-muted mb-2">Top videos:</p>
                      <div className="space-y-2">
                        {cluster.top_videos.slice(0, 2).map((video, index) => (
                          <div key={video.video_id} className="flex items-center justify-between bg-muted/20 rounded px-3 py-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-text-secondary truncate">
                                {video.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-text-muted">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {video.views.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {video.retention_pct.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Avg Performance */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <span className="text-xs text-text-muted">Avg Performance</span>
                    <span className="text-sm font-medium text-text-primary">
                      {cluster.avg_performance.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {clusters.length > 6 && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <Button variant="outline" className="w-full text-sm">
              Ver todos los clusters ({clusters.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};