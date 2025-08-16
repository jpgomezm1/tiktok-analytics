import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricTooltip } from './MetricTooltip';
import { TrendingUp, TrendingDown, Target, Zap, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardsProps {
  overallGrowthScore: number;
  growthTrend: { direction: 'up' | 'down' | 'neutral'; percentage: number };
  hitRate: number;
  speed2hStatus: { emoji: string; label: string; color: string };
  savesPer1K: number;
  loading: boolean;
}

export const KPICards = ({
  overallGrowthScore,
  growthTrend,
  hitRate,
  speed2hStatus,
  savesPer1K,
  loading
}: KPICardsProps) => {
  const TrendIcon = growthTrend.direction === 'up' ? TrendingUp : 
                   growthTrend.direction === 'down' ? TrendingDown : 
                   null;

  const trendColor = growthTrend.direction === 'up' ? 'text-green-400' :
                    growthTrend.direction === 'down' ? 'text-red-400' :
                    'text-text-muted';

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-8 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Growth Score */}
      <Card className="bg-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
            Puntuación de Crecimiento
            <MetricTooltip
              label="Puntuación General de Crecimiento"
              formula="(ER × 0.4) + (Saves/1K × 0.3) + (Finalización × 0.3)"
              why="Índice compuesto de rendimiento que pondera engagement, guardados y finalización para medir la calidad general del contenido."
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">
                {overallGrowthScore}/100
              </div>
              <div className={cn("text-sm flex items-center gap-1", trendColor)}>
                {TrendIcon && <TrendIcon className="w-4 h-4" />}
                <span>Tendencia 7 días: {growthTrend.percentage}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hit Rate */}
      <Card className="bg-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
            Tasa de Acierto (30 días)
            <MetricTooltip
              label="Tasa de Acierto"
              formula="(Videos ≥ P75 / Total videos) × 100"
              why="Porcentaje de videos que superan el percentil 75 normalizado. Indica consistencia en crear contenido exitoso."
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{hitRate}%</div>
              <div className="text-sm text-text-muted">de videos exitosos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Speed 2h */}
      <Card className="bg-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
            Velocidad 2h
            <MetricTooltip
              label="Velocidad en 2 Horas"
              formula="Vistas 2h / Mediana histórica 2h"
              why="Qué tan fuerte arranca tu último video comparado con la mediana histórica. Indica el momentum inicial del contenido."
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <div className={cn("text-2xl font-bold flex items-center gap-2", speed2hStatus.color)}>
                <span>{speed2hStatus.emoji}</span>
                <span>{speed2hStatus.label}</span>
              </div>
              <div className="text-sm text-text-muted">vs mediana histórica</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saves per 1K */}
      <Card className="bg-card border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
            Saves por 1K (30 días)
            <MetricTooltip
              label="Guardados por 1K Vistas"
              formula="(Saves / Views) × 1000"
              why="Guardados normalizados por 1.000 vistas. Mide la calidad y valor percibido del contenido por la audiencia."
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">
                {savesPer1K.toFixed(1)}
              </div>
              <div className="text-sm text-text-muted">saves por 1K vistas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};