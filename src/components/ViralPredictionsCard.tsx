import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ViralPrediction } from '@/utils/advancedAnalyticsEngine';
import { 
  Zap, 
  Eye, 
  TrendingUp, 
  Star,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface ViralPredictionsCardProps {
  predictions: ViralPrediction[];
  onPredictionClick?: (prediction: ViralPrediction) => void;
}

export const ViralPredictionsCard = ({ predictions, onPredictionClick }: ViralPredictionsCardProps) => {
  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.8) return 'text-green-500';
    if (probability >= 0.6) return 'text-yellow-500';
    if (probability >= 0.4) return 'text-orange-500';
    return 'text-red-500';
  };

  const getConfidenceLevel = (score: number) => {
    if (score >= 80) return { label: 'Alta', color: 'text-green-500' };
    if (score >= 60) return { label: 'Media', color: 'text-yellow-500' };
    return { label: 'Baja', color: 'text-red-500' };
  };

  const formatPredictedViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
    return views.toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          Predicciones de Viralidad
          <Badge variant="outline" className="ml-auto">
            {predictions.filter(p => p.viral_probability >= 0.6).length} alta probabilidad
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No hay predicciones disponibles</p>
              <p className="text-xs text-text-muted mt-1">
                Necesitas más data histórica para predicciones
              </p>
            </div>
          ) : (
            predictions.slice(0, 5).map((prediction) => {
              const confidence = getConfidenceLevel(prediction.confidence_score);
              
              return (
                <div
                  key={prediction.video_id}
                  className="group border border-border/50 rounded-lg p-4 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => onPredictionClick?.(prediction)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-text-primary text-sm mb-1 truncate group-hover:text-primary transition-colors">
                        {prediction.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Confianza {confidence.label}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatPredictedViews(prediction.predicted_views)} pred.
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                  </div>

                  {/* Viral Probability */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-text-secondary">Probabilidad Viral</span>
                      <span className={`text-sm font-bold ${getProbabilityColor(prediction.viral_probability)}`}>
                        {Math.round(prediction.viral_probability * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={prediction.viral_probability * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Key Factors */}
                  {prediction.key_factors.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-text-muted mb-2">Factores clave:</p>
                      <div className="flex flex-wrap gap-1">
                        {prediction.key_factors.slice(0, 3).map((factor, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Similar Videos */}
                  {prediction.similar_successful_videos.length > 0 && (
                    <div className="pt-3 border-t border-border/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">
                          {prediction.similar_successful_videos.length} videos similares exitosos
                        </span>
                        <span className={`text-xs font-medium ${confidence.color}`}>
                          {prediction.confidence_score}% confianza
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};