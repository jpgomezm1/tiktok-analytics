import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
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

    const sign = isPositive ? '+' : '-';

    return (
      <div className={cn("flex items-center gap-1", color)}>
        {icon}
        <span>
          {sign}{formatMetric(absValue, type)} ({sign}{relValue.toFixed(1)}%)
        </span>
      </div>
    );
  };

  const MetricComparison = ({ 
    title, 
    valueA, 
    valueB, 
    delta, 
    type, 
    color 
  }: {
    title: string;
    valueA: number;
    valueB: number;
    delta: { absolute: number; relative: number };
    type: 'percentage' | 'decimal';
    color: string;
  }) => (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-text-secondary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <Badge variant="outline" className="mb-1">Grupo A</Badge>
            <p className={cn("text-lg font-semibold", color)}>
              {formatMetric(valueA, type)}
            </p>
            <p className="text-xs text-text-muted">
              {comparisonData.groupA.length} videos
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-text-muted mb-1">vs</p>
            {getDeltaDisplay(delta, type)}
          </div>
          
          <div className="text-center">
            <Badge variant="outline" className="mb-1">Grupo B</Badge>
            <p className={cn("text-lg font-semibold", color)}>
              {formatMetric(valueB, type)}
            </p>
            <p className="text-xs text-text-muted">
              {comparisonData.groupB.length} videos
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comparación A/B de Videos</DialogTitle>
          <DialogDescription>
            Análisis comparativo entre dos grupos de videos seleccionados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-primary">Grupo A</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-text-primary">
                  {comparisonData.groupA.length}
                </p>
                <p className="text-sm text-text-muted">videos seleccionados</p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/5 border-secondary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-secondary">Grupo B</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-text-primary">
                  {comparisonData.groupB.length}
                </p>
                <p className="text-sm text-text-muted">videos seleccionados</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Metrics Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricComparison
              title="Retención Media"
              valueA={comparisonData.averages.groupA.retention}
              valueB={comparisonData.averages.groupB.retention}
              delta={comparisonData.deltas.retention}
              type="percentage"
              color="text-green-400"
            />

            <MetricComparison
              title="Saves por 1K Vistas"
              valueA={comparisonData.averages.groupA.saves_per_1k}
              valueB={comparisonData.averages.groupB.saves_per_1k}
              delta={comparisonData.deltas.saves_per_1k}
              type="decimal"
              color="text-purple-400"
            />

            <MetricComparison
              title="% For You"
              valueA={comparisonData.averages.groupA.for_you_percentage}
              valueB={comparisonData.averages.groupB.for_you_percentage}
              delta={comparisonData.deltas.for_you_percentage}
              type="percentage"
              color="text-blue-400"
            />

            <MetricComparison
              title="Engagement Rate"
              valueA={comparisonData.averages.groupA.engagement_rate}
              valueB={comparisonData.averages.groupB.engagement_rate}
              delta={comparisonData.deltas.engagement_rate}
              type="percentage"
              color="text-orange-400"
            />
          </div>

          {/* Insights */}
          <Card className="bg-muted/30 border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-text-primary">
                Insights de la Comparación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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

                return (
                  <p key={metric} className="text-sm text-text-secondary">
                    • El Grupo A tiene {improvement.toFixed(1)}% {isPositive ? 'mejor' : 'peor'} {metricNames[metric as keyof typeof metricNames]} que el Grupo B
                  </p>
                );
              })}
              
              {Object.values(comparisonData.deltas).every(d => Math.abs(d.relative) < 5) && (
                <p className="text-sm text-text-muted italic">
                  Los grupos muestran métricas similares (diferencias menores al 5%)
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};