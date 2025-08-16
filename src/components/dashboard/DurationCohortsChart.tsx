import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MetricTooltip } from './MetricTooltip';
import { ChartMetric } from '@/hooks/useDashboardState';
import { BarChart3 } from 'lucide-react';

interface ProcessedVideo {
  duration_seconds?: number;
  engagement_rate: number;
  saves_per_1k: number;
  completion_rate: number;
}

interface DurationCohortsChartProps {
  videos: ProcessedVideo[];
  selectedMetric: ChartMetric;
  onMetricChange: (metric: ChartMetric) => void;
  loading: boolean;
}

export const DurationCohortsChart = ({
  videos,
  selectedMetric,
  onMetricChange,
  loading
}: DurationCohortsChartProps) => {
  const metricLabels = {
    engagement_rate: 'Engagement Rate',
    saves_per_1k: 'Saves/1K', 
    completion_rate: 'Finalización 100%',
    views_norm: 'Views Normalizadas'
  };

  // Define duration buckets
  const buckets = [
    { label: '0-14s', min: 0, max: 14 },
    { label: '15-24s', min: 15, max: 24 },
    { label: '25-35s', min: 25, max: 35 },
    { label: '36s+', min: 36, max: Infinity }
  ];

  const cohortData = useMemo(() => {
    return buckets.map(bucket => {
      const bucketVideos = videos.filter(video => {
        const duration = video.duration_seconds || 0;
        return duration >= bucket.min && duration <= bucket.max;
      });

      if (bucketVideos.length === 0) {
        return {
          label: bucket.label,
          count: 0,
          average: 0,
          median: 0,
          q1: 0,
          q3: 0,
          min: 0,
          max: 0,
          values: []
        };
      }

      const values = bucketVideos.map(video => video[selectedMetric] || 0).sort((a, b) => a - b);
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      const median = values[Math.floor(values.length / 2)];
      const q1 = values[Math.floor(values.length * 0.25)];
      const q3 = values[Math.floor(values.length * 0.75)];

      return {
        label: bucket.label,
        count: bucketVideos.length,
        average,
        median,
        q1,
        q3,
        min: values[0],
        max: values[values.length - 1],
        values
      };
    });
  }, [videos, selectedMetric]);

  const maxValue = Math.max(...cohortData.map(d => d.max));

  if (loading) {
    return (
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary">Cohortes por Duración</CardTitle>
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

  const hasData = cohortData.some(d => d.count > 0);

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-text-primary flex items-center gap-2">
            Cohortes por Duración
            <MetricTooltip
              label="Cohortes por Duración"
              formula="Distribución de métricas por buckets de duración"
              why="Distribución del rendimiento por longitudes de video; encuentra tu 'zona dulce' de duración óptima."
            />
          </CardTitle>
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
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-64 flex items-center justify-center text-center">
            <div>
              <BarChart3 className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">No hay datos de duración disponibles</p>
              <p className="text-sm text-text-muted mt-2">Asegúrate de incluir duration_seconds en tus videos</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Boxplot visualization */}
            <div className="grid grid-cols-4 gap-4 h-64">
              {cohortData.map((cohort, index) => (
                <div key={cohort.label} className="flex flex-col items-center">
                  <div className="text-sm font-medium text-text-primary mb-2">
                    {cohort.label}
                  </div>
                  <div className="text-xs text-text-muted mb-2">
                    ({cohort.count} videos)
                  </div>
                  
                  {cohort.count > 0 ? (
                    <div className="flex-1 relative w-8 bg-muted/20 rounded">
                      {/* Box (Q1 to Q3) */}
                      <div
                        className="absolute w-full bg-gradient-primary/80 border border-purple-bright/50 rounded"
                        style={{
                          bottom: `${(cohort.q1 / maxValue) * 100}%`,
                          height: `${((cohort.q3 - cohort.q1) / maxValue) * 100}%`
                        }}
                      />
                      
                      {/* Median line */}
                      <div
                        className="absolute w-full border-t-2 border-white"
                        style={{
                          bottom: `${(cohort.median / maxValue) * 100}%`
                        }}
                      />
                      
                      {/* Whiskers */}
                      <div
                        className="absolute left-1/2 transform -translate-x-1/2 w-px bg-purple-bright"
                        style={{
                          bottom: `${(cohort.min / maxValue) * 100}%`,
                          height: `${((cohort.q1 - cohort.min) / maxValue) * 100}%`
                        }}
                      />
                      <div
                        className="absolute left-1/2 transform -translate-x-1/2 w-px bg-purple-bright"
                        style={{
                          bottom: `${(cohort.q3 / maxValue) * 100}%`,
                          height: `${((cohort.max - cohort.q3) / maxValue) * 100}%`
                        }}
                      />
                      
                      {/* Min/Max caps */}
                      <div
                        className="absolute left-1/4 right-1/4 border-t border-purple-bright"
                        style={{
                          bottom: `${(cohort.min / maxValue) * 100}%`
                        }}
                      />
                      <div
                        className="absolute left-1/4 right-1/4 border-t border-purple-bright"
                        style={{
                          bottom: `${(cohort.max / maxValue) * 100}%`
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-text-muted text-xs">
                      Sin datos
                    </div>
                  )}
                  
                  {cohort.count > 0 && (
                    <div className="text-xs text-text-muted mt-2 text-center">
                      <div>Med: {cohort.median.toFixed(1)}</div>
                      <div>Avg: {cohort.average.toFixed(1)}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="text-sm text-text-muted">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-gradient-primary rounded" />
                  <span>Q1-Q3 (50% de datos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-px bg-white" />
                  <span>Mediana</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-px h-4 bg-purple-bright" />
                  <span>Min-Max</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};