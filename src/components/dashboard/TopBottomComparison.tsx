import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricTooltip } from './MetricTooltip';
import { VideoExamplesModal } from './VideoExamplesModal';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ProcessedVideo {
  id: string;
  title: string;
  published_date: string;
  views_norm: number;
  engagement_rate: number;
  saves_per_1k: number;
  completion_rate: number;
}

interface TopBottomComparisonProps {
  topPerformers: ProcessedVideo[];
  bottomPerformers: ProcessedVideo[];
  loading: boolean;
}

export const TopBottomComparison = ({
  topPerformers,
  bottomPerformers,
  loading
}: TopBottomComparisonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'top' | 'bottom'>('top');

  // Calculate averages for comparison
  const calculateAverages = (videos: ProcessedVideo[]) => {
    if (videos.length === 0) return { er: 0, completion: 0, saves: 0, ctr: 0 };
    
    return {
      er: videos.reduce((sum, v) => sum + v.engagement_rate, 0) / videos.length,
      completion: videos.reduce((sum, v) => sum + v.completion_rate, 0) / videos.length,
      saves: videos.reduce((sum, v) => sum + v.saves_per_1k, 0) / videos.length,
      ctr: 0 // Would need profile click data
    };
  };

  const topAvg = calculateAverages(topPerformers);
  const bottomAvg = calculateAverages(bottomPerformers);

  const metrics = [
    { 
      label: 'Engagement Rate', 
      top: topAvg.er, 
      bottom: bottomAvg.er, 
      unit: '%',
      tooltip: "Porcentaje de interacciones (likes + comments + shares) sobre vistas totales"
    },
    { 
      label: 'Finalización 100%', 
      top: topAvg.completion, 
      bottom: bottomAvg.completion, 
      unit: '%',
      tooltip: "Porcentaje de usuarios que ven el video completo hasta el final"
    },
    { 
      label: 'Saves/1K', 
      top: topAvg.saves, 
      bottom: bottomAvg.saves, 
      unit: '',
      tooltip: "Guardados normalizados por 1.000 vistas - indica valor percibido del contenido"
    },
    { 
      label: 'CTR a Perfil', 
      top: topAvg.ctr, 
      bottom: bottomAvg.ctr, 
      unit: '%',
      tooltip: "Clics al perfil desde el video - mide el interés en conocer más del creador"
    }
  ];

  const handleShowExamples = (type: 'top' | 'bottom') => {
    setModalType(type);
    setShowModal(true);
  };

  if (loading) {
    return (
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary">Top 10% vs Bottom 10%</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = topPerformers.length > 0 || bottomPerformers.length > 0;

  return (
    <>
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary flex items-center gap-2">
            Top 10% vs Bottom 10%
            <MetricTooltip
              label="Comparación de Extremos"
              formula="Promedio de métricas del 10% mejor vs 10% peor"
              why="Comparación de extremos para entender qué patrones replicar o evitar en tu contenido."
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="h-64 flex items-center justify-center text-center">
              <div>
                <TrendingUp className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted">No hay suficientes videos para comparar</p>
                <p className="text-sm text-text-muted mt-2">Necesitas al menos 10 videos para esta vista</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Metrics Comparison */}
              <div className="space-y-4">
                {metrics.map((metric, index) => {
                  const improvement = metric.top - metric.bottom;
                  const improvementPercentage = metric.bottom > 0 
                    ? ((improvement / metric.bottom) * 100) 
                    : 0;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">
                            {metric.label}
                          </span>
                          <MetricTooltip
                            label={metric.label}
                            formula={`Promedio de ${metric.label} por grupo`}
                            why={metric.tooltip}
                          />
                        </div>
                        {improvement > 0 && (
                          <Badge variant="outline" className="text-green-400 border-green-400/20">
                            +{improvementPercentage.toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {/* Top 10% */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-600/20 text-green-400 border-green-600/20">
                              🔥 Top 10%
                            </Badge>
                          </div>
                          <div className="h-8 bg-muted/20 rounded overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-600 to-green-400 flex items-center justify-center"
                              style={{ 
                                width: `${Math.min(100, (metric.top / Math.max(metric.top, metric.bottom)) * 100)}%` 
                              }}
                            >
                              <span className="text-sm font-medium text-white">
                                {metric.top.toFixed(1)}{metric.unit}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom 10% */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-600/20 text-red-400 border-red-600/20">
                              ❌ Bottom 10%
                            </Badge>
                          </div>
                          <div className="h-8 bg-muted/20 rounded overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-600 to-red-400 flex items-center justify-center"
                              style={{ 
                                width: `${Math.min(100, (metric.bottom / Math.max(metric.top, metric.bottom)) * 100)}%` 
                              }}
                            >
                              <span className="text-sm font-medium text-white">
                                {metric.bottom.toFixed(1)}{metric.unit}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => handleShowExamples('top')}
                  className="gap-2 text-green-400 border-green-400/20 hover:bg-green-400/10"
                  disabled={topPerformers.length === 0}
                >
                  <TrendingUp className="w-4 h-4" />
                  Ver ejemplos top ({topPerformers.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShowExamples('bottom')}
                  className="gap-2 text-red-400 border-red-400/20 hover:bg-red-400/10"
                  disabled={bottomPerformers.length === 0}
                >
                  <TrendingDown className="w-4 h-4" />
                  Ver ejemplos bottom ({bottomPerformers.length})
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <VideoExamplesModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        videos={modalType === 'top' ? topPerformers : bottomPerformers}
        type={modalType}
      />
    </>
  );
};