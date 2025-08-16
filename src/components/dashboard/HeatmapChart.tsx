import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MetricTooltip } from './MetricTooltip';
import { ChartMetric, DateRange } from '@/hooks/useDashboardState';
import { Calendar } from 'lucide-react';

interface ProcessedVideo {
  published_date: string;
  engagement_rate: number;
  saves_per_1k: number;
  completion_rate: number;
  views_norm: number;
}

interface HeatmapChartProps {
  videos: ProcessedVideo[];
  selectedMetric: ChartMetric;
  dateRange: DateRange;
  onMetricChange: (metric: ChartMetric) => void;
  onRangeChange: (range: DateRange) => void;
  loading: boolean;
}

export const HeatmapChart = ({
  videos,
  selectedMetric,
  dateRange,
  onMetricChange,
  onRangeChange,
  loading
}: HeatmapChartProps) => {
  const metricLabels = {
    engagement_rate: 'Engagement Rate',
    saves_per_1k: 'Saves/1K',
    completion_rate: 'Finalización 100%',
    views_norm: 'Views Normalizadas'
  };

  const dateRangeLabels = {
    '7d': '7 días',
    '14d': '14 días', 
    '30d': '30 días',
    '90d': '90 días'
  };

  // Process data for heatmap (Day of week × Hour)
  const heatmapData = videos.reduce((acc, video) => {
    const date = new Date(video.published_date);
    const dayOfWeek = date.getDay(); // 0 = Sunday
    const hour = date.getHours();
    const key = `${dayOfWeek}-${hour}`;
    
    if (!acc[key]) {
      acc[key] = {
        dayOfWeek,
        hour,
        values: [],
        average: 0
      };
    }
    
    const value = video[selectedMetric] || 0;
    acc[key].values.push(value);
    acc[key].average = acc[key].values.reduce((sum, v) => sum + v, 0) / acc[key].values.length;
    
    return acc;
  }, {} as Record<string, any>);

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const maxValue = Math.max(...Object.values(heatmapData).map((d: any) => d.average));

  if (loading) {
    return (
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary">Heatmap Día × Hora</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = Object.keys(heatmapData).length > 0;

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-text-primary flex items-center gap-2">
            Heatmap Día × Hora
            <MetricTooltip
              label="Heatmap de Rendimiento"
              formula="Métrica promedio por día de semana y hora"
              why="Cruce de rendimiento por día de la semana y franja horaria; útil para planificar horarios de publicación óptimos."
            />
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select value={selectedMetric} onValueChange={onMetricChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {Object.entries(metricLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={onRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {Object.entries(dateRangeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-64 flex items-center justify-center text-center">
            <div>
              <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">Aún no hay suficientes datos para este rango</p>
              <p className="text-sm text-text-muted mt-2">Sube más videos para ver patrones de horarios</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
              <div className="grid grid-cols-25 gap-1 min-w-[800px]">
                {/* Header with hours */}
                <div></div>
                {hours.map(hour => (
                  <div key={hour} className="text-xs text-text-muted text-center p-1">
                    {hour}h
                  </div>
                ))}
                
                {/* Rows for each day */}
                {dayNames.map((day, dayIndex) => (
                  <>
                    <div key={`day-${dayIndex}`} className="text-xs text-text-muted flex items-center pr-2">
                      {day}
                    </div>
                    {hours.map(hour => {
                      const cellData = heatmapData[`${dayIndex}-${hour}`];
                      const intensity = cellData ? (cellData.average / maxValue) : 0;
                      const opacity = Math.max(0.1, intensity);
                      
                      return (
                        <div
                          key={`${dayIndex}-${hour}`}
                          className="w-6 h-6 rounded border border-border/20 flex items-center justify-center"
                          style={{
                            backgroundColor: `hsl(var(--purple-bright) / ${opacity})`,
                          }}
                          title={cellData ? `${day} ${hour}:00 - ${cellData.average.toFixed(1)}` : 'Sin datos'}
                        >
                          {cellData && (
                            <span className="text-xs text-white font-medium">
                              {cellData.values.length}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span>Menos</span>
              <div className="flex gap-1">
                {[0.1, 0.3, 0.5, 0.7, 1.0].map(opacity => (
                  <div
                    key={opacity}
                    className="w-3 h-3 rounded border border-border/20"
                    style={{
                      backgroundColor: `hsl(var(--purple-bright) / ${opacity})`,
                    }}
                  />
                ))}
              </div>
              <span>Más</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};