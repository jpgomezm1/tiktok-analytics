import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Minus, GitCompare, Clock, Heart, Zap, Target, BarChart3, Users } from 'lucide-react';
import { ComparisonData } from '@/hooks/useVideoExplorer';
import { cn } from '@/lib/utils';

interface VideoComparisonModalProps {
  open: boolean;
  onClose: () => void;
  comparisonData: ComparisonData | null;
}

export const VideoComparisonModal = ({ open, onClose, comparisonData }: VideoComparisonModalProps) => {
  if (!comparisonData) return null;

  const formatMetric = (value: number, type: 'percentage' | 'decimal') => {
    if (type === 'percentage') return `${value.toFixed(1)}%`;
    return value.toFixed(1);
  };

  const getDeltaDisplay = (delta: { absolute: number; relative: number }, type: 'percentage' | 'decimal') => {
    const absValue = Math.abs(delta.absolute);
    const relValue = Math.abs(delta.relative);
    const isPositive = delta.absolute > 0;
    const isNeutral = Math.abs(delta.relative) < 0.1;

    const icon = isNeutral ? (
      <Minus className="w-4 h-4" />
    ) : isPositive ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );

    const color = isNeutral 
      ? 'text-text-muted' 
      : isPositive 
        ? 'text-success' 
        : 'text-error';

    const bgColor = isNeutral
      ? 'bg-muted/30'
      : isPositive
        ? 'bg-success/10'
        : 'bg-error/10';

    const borderColor = isNeutral
      ? 'border-muted/30'
      : isPositive
        ? 'border-success/30'
        : 'border-error/30';

    const sign = isPositive ? '+' : '-';

    return (
      <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm", color, bgColor, borderColor)}>
        {icon}
        <div className="text-center">
          <div className="font-semibold text-sm">
            {sign}{formatMetric(absValue, type)}
          </div>
          <div className="text-xs opacity-80">
            ({sign}{relValue.toFixed(1)}%)
          </div>
        </div>
      </div>
    );
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'retention': return <Clock className="w-5 h-5" />;
      case 'saves': return <Heart className="w-5 h-5" />;
      case 'foryou': return <Zap className="w-5 h-5" />;
      case 'engagement': return <BarChart3 className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'retention': return 'text-green-500';
      case 'saves': return 'text-purple-500';
      case 'foryou': return 'text-blue-500';
      case 'engagement': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getMetricGradient = (metric: string) => {
    switch (metric) {
      case 'retention': return 'from-green-500/10 to-green-600/5';
      case 'saves': return 'from-purple-500/10 to-purple-600/5';
      case 'foryou': return 'from-blue-500/10 to-blue-600/5';
      case 'engagement': return 'from-orange-500/10 to-orange-600/5';
      default: return 'from-gray-500/10 to-gray-600/5';
    }
  };

  const MetricComparison = ({ 
    title, 
    valueA, 
    valueB, 
    delta, 
    type, 
    metric,
    icon
  }: {
    title: string;
    valueA: number;
    valueB: number;
    delta: { absolute: number; relative: number };
    type: 'percentage' | 'decimal';
    metric: string;
    icon: React.ReactNode;
  }) => (
    <Card className={cn("bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-lg hover:shadow-xl transition-all duration-300")}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl bg-gradient-to-br", getMetricGradient(metric), "border border-border/30")}>
            <div className={getMetricColor(metric)}>
              {icon}
            </div>
          </div>
          <CardTitle className="text-sm font-semibold text-text-primary">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Grupo A */}
          <div className="text-center space-y-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
              Grupo A
            </Badge>
            <div className={cn("text-xl font-bold", getMetricColor(metric))}>
              {formatMetric(valueA, type)}
            </div>
            <p className="text-xs text-text-muted">
              {comparisonData.groupA.length} videos
            </p>
          </div>
          
          {/* Delta */}
          <div className="flex justify-center">
            {getDeltaDisplay(delta, type)}
          </div>
          
          {/* Grupo B */}
          <div className="text-center space-y-2">
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
              Grupo B
            </Badge>
            <div className={cn("text-xl font-bold", getMetricColor(metric))}>
              {formatMetric(valueB, type)}
            </div>
            <p className="text-xs text-text-muted">
              {comparisonData.groupB.length} videos
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getInsightEmoji = (improvement: number) => {
    if (improvement >= 20) return '🚀';
    if (improvement >= 10) return '📈';
    if (improvement >= 5) return '✅';
    return '📊';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
        <DialogHeader className="space-y-4 pb-6 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-bright to-purple-dark rounded-xl shadow-lg">
              <GitCompare className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-text-primary to-purple-light bg-clip-text text-transparent">
                Comparación A/B de Videos
              </DialogTitle>
              <DialogDescription className="text-text-secondary">
                Análisis comparativo entre dos grupos de videos seleccionados
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Enhanced Summary */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-400">Grupo A</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-text-primary">
                    {comparisonData.groupA.length}
                  </p>
                  <p className="text-sm text-text-muted">videos seleccionados</p>
                  <div className="mt-3 p-2 bg-blue-500/10 rounded-lg">
                    <p className="text-xs text-blue-400 font-medium">Primera mitad de selección</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <CardTitle className="text-lg font-bold text-purple-400">Grupo B</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-text-primary">
                    {comparisonData.groupB.length}
                  </p>
                  <p className="text-sm text-text-muted">videos seleccionados</p>
                  <div className="mt-3 p-2 bg-purple-500/10 rounded-lg">
                    <p className="text-xs text-purple-400 font-medium">Segunda mitad de selección</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="border-border/30" />

          {/* Enhanced Metrics Comparison */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-purple-bright" />
              <h3 className="text-xl font-bold text-text-primary">Comparación de Métricas</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricComparison
                title="Retención Media"
                valueA={comparisonData.averages.groupA.retention}
                valueB={comparisonData.averages.groupB.retention}
                delta={comparisonData.deltas.retention}
                type="percentage"
                metric="retention"
                icon={getMetricIcon('retention')}
              />

              <MetricComparison
                title="Saves por 1K Vistas"
                valueA={comparisonData.averages.groupA.saves_per_1k}
                valueB={comparisonData.averages.groupB.saves_per_1k}
                delta={comparisonData.deltas.saves_per_1k}
                type="decimal"
                metric="saves"
                icon={getMetricIcon('saves')}
              />

              <MetricComparison
                title="% For You"
                valueA={comparisonData.averages.groupA.for_you_percentage}
                valueB={comparisonData.averages.groupB.for_you_percentage}
                delta={comparisonData.deltas.for_you_percentage}
                type="percentage"
                metric="foryou"
                icon={getMetricIcon('foryou')}
              />

              <MetricComparison
                title="Engagement Rate"
                valueA={comparisonData.averages.groupA.engagement_rate}
                valueB={comparisonData.averages.groupB.engagement_rate}
                delta={comparisonData.deltas.engagement_rate}
                type="percentage"
                metric="engagement"
                icon={getMetricIcon('engagement')}
              />
            </div>
          </div>

          {/* Enhanced Insights */}
          <Card className="bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm border border-border/50 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-yellow-500" />
                </div>
                <CardTitle className="text-lg font-bold text-text-primary">
                  Insights de la Comparación
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {Object.entries(comparisonData.deltas).map(([metric, delta]) => {
                  const metricNames = {
                    retention: 'Retención',
                    saves_per_1k: 'Saves/1k',
                    for_you_percentage: '% For You',
                    engagement_rate: 'Engagement'
                  };

                  if (Math.abs(delta.relative) < 5) return null;

                  const isPositive = delta.relative > 0;
                  const improvement = Math.abs(delta.relative);
                  const emoji = getInsightEmoji(improvement);

                  return (
                    <div key={metric} className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border",
                      isPositive ? "bg-success/10 border-success/20" : "bg-error/10 border-error/20"
                    )}>
                      <span className="text-lg">{emoji}</span>
                      <p className="text-sm text-text-secondary flex-1">
                        <span className="font-medium">Grupo A</span> tiene{' '}
                        <span className={cn("font-bold", isPositive ? "text-success" : "text-error")}>
                          {improvement.toFixed(1)}% {isPositive ? 'mejor' : 'peor'}
                        </span>{' '}
                        <span className="font-medium">{metricNames[metric as keyof typeof metricNames]}</span> que Grupo B
                      </p>
                    </div>
                  );
                })}
              </div>
              
              {Object.values(comparisonData.deltas).every(d => Math.abs(d.relative) < 5) && (
                <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <span className="text-lg">⚖️</span>
                  <p className="text-sm text-blue-400 italic">
                    Los grupos muestran métricas similares (diferencias menores al 5%). 
                    Considera probar con grupos más diferenciados para obtener insights más claros.
                  </p>
                </div>
              )}

              {/* Recommendation section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                  💡 Recomendación
                </h4>
                <p className="text-sm text-text-secondary">
                  {Object.values(comparisonData.deltas).some(d => Math.abs(d.relative) >= 10) 
                    ? "Se detectaron diferencias significativas. Analiza qué elementos específicos de los videos del grupo con mejor rendimiento podrías aplicar al otro grupo."
                    : "Las diferencias son menores. Considera comparar videos con características más distintivas (diferentes tipos de contenido, duración, etc.) para obtener insights más actionables."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};