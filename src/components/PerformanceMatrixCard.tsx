import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PerformanceMatrix } from '@/utils/advancedAnalyticsEngine';
import { 
  Grid3X3, 
  Clock, 
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Play,
  BookmarkPlus,
  Activity
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface PerformanceMatrixCardProps {
  matrix: PerformanceMatrix;
}

export const PerformanceMatrixCard = ({ matrix }: PerformanceMatrixCardProps) => {
  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'high_retention_high_saves': return '#22c55e'; // green
      case 'high_retention_low_saves': return '#3b82f6';  // blue
      case 'low_retention_high_saves': return '#f59e0b';  // yellow
      case 'low_retention_low_saves': return '#ef4444';   // red
      default: return '#6b7280';
    }
  };

  const getQuadrantLabel = (quadrant: string) => {
    switch (quadrant) {
      case 'high_retention_high_saves': return 'Óptimo';
      case 'high_retention_low_saves': return 'Buena Retención';
      case 'low_retention_high_saves': return 'Alto Engagement';
      case 'low_retention_low_saves': return 'Necesita Mejora';
      default: return 'Desconocido';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />;
      case 'stable': return <Minus className="w-3 h-3 text-text-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Retention vs Saves Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-purple-500" />
            Matriz: Retención vs Saves
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={matrix.retention_vs_saves}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="retention" 
                  stroke="hsl(var(--text-muted))" 
                  fontSize={11}
                  name="Retención (%)"
                  domain={[0, 100]}
                />
                <YAxis 
                  dataKey="saves_per_1k" 
                  stroke="hsl(var(--text-muted))" 
                  fontSize={11}
                  name="Saves per 1K"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  formatter={(value, name, props) => [
                    name === 'retention' ? `${value}%` : value,
                    name === 'retention' ? 'Retención' : 'Saves/1K'
                  ]}
                  labelFormatter={(label) => `Video: ${label}`}
                />
                <Scatter 
                  dataKey="saves_per_1k" 
                  fill={(entry) => getQuadrantColor(entry.payload?.quadrant || '')}
                />
                {matrix.retention_vs_saves.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getQuadrantColor(entry.quadrant)} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          {/* Quadrant Legend */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {['high_retention_high_saves', 'high_retention_low_saves', 'low_retention_high_saves', 'low_retention_low_saves'].map(quadrant => {
              const count = matrix.retention_vs_saves.filter(item => item.quadrant === quadrant).length;
              return (
                <div key={quadrant} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: getQuadrantColor(quadrant) }}
                  />
                  <span className="text-text-secondary">
                    {getQuadrantLabel(quadrant)} ({count})
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Duration Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Performance por Duración
            <Badge variant="outline" className="ml-auto">
              Optimal: {matrix.duration_sweet_spot.optimal_range.min}-{matrix.duration_sweet_spot.optimal_range.max}s
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matrix.duration_sweet_spot.performance_by_duration}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="duration_range" 
                  stroke="hsl(var(--text-muted))" 
                  fontSize={11} 
                />
                <YAxis 
                  stroke="hsl(var(--text-muted))" 
                  fontSize={11}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="avg_performance" 
                  fill="hsl(var(--primary))" 
                  name="Performance Score"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-muted/20 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Tu duración promedio actual:</span>
              <span className="font-medium text-text-primary">
                {matrix.duration_sweet_spot.current_avg}s
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Theme Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-green-500" />
            Performance por Tema de Contenido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {matrix.content_theme_performance.slice(0, 8).map((theme, index) => (
              <div
                key={theme.theme}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-primary text-sm truncate">
                      {theme.theme}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {theme.avg_views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {theme.avg_retention.toFixed(0)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <BookmarkPlus className="w-3 h-3" />
                        {theme.avg_saves_per_1k.toFixed(1)}/1K
                      </span>
                      <span>{theme.video_count} videos</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getTrendIcon(theme.trend)}
                  <div className="text-right">
                    <div className="text-sm font-bold text-text-primary">
                      {((theme.avg_views / 1000) + theme.avg_retention + theme.avg_saves_per_1k).toFixed(0)}
                    </div>
                    <div className="text-xs text-text-muted">score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};