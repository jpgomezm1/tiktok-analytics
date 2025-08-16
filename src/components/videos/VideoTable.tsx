import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PerformanceBadge } from './PerformanceBadge';
import { TrafficSourcesDonut } from './TrafficSourcesDonut';
import { MetricTooltip } from '@/components/dashboard/MetricTooltip';
import { ProcessedVideo } from '@/types/dashboard';
import { PerformanceBadge as PerformanceBadgeType } from '@/types/videos';
import { ExternalLink, Calendar, Eye, Heart, MessageCircle, Share } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface VideoTableProps {
  videos: ProcessedVideo[];
  calculatePerformanceBadge: (video: ProcessedVideo) => PerformanceBadgeType;
  normalizeBy1K: boolean;
  viewMode: 'table' | 'cards';
}

export const VideoTable = ({ 
  videos, 
  calculatePerformanceBadge, 
  normalizeBy1K,
  viewMode 
}: VideoTableProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getDisplayValue = (value: number, per1K = false) => {
    if (normalizeBy1K && per1K) {
      return value.toFixed(1);
    }
    return formatNumber(value);
  };

  if (viewMode === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => {
          const badge = calculatePerformanceBadge(video);
          return (
            <Card key={video.id} className="p-4 bg-card border-border space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text-primary line-clamp-2 text-sm">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3 text-text-muted" />
                    <span className="text-xs text-text-muted">
                      {format(new Date(video.published_date), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <PerformanceBadge badge={badge} size="sm" />
                  {video.video_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(video.video_url, '_blank')}
                      className="h-7 w-7 p-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
                    <Eye className="w-3 h-3" />
                    Vistas
                  </div>
                  <div className="font-medium text-text-primary">
                    {getDisplayValue(video.views || 0)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-text-muted mb-1">ER</div>
                  <div className="font-medium text-text-primary">
                    {(video.engagement_rate || 0).toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div className="text-xs text-text-muted mb-1">Saves/1K</div>
                  <div className="font-medium text-text-primary">
                    {(video.saves_per_1k || 0).toFixed(1)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-text-muted mb-1">P.Score</div>
                  <div className="font-medium text-text-primary">
                    {(video.performance_score || 0).toFixed(0)}
                  </div>
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="pt-2 border-t border-border">
                <TrafficSourcesDonut video={video} size="sm" />
              </div>

              {/* Tags */}
              {(video.video_theme || video.cta_type || video.editing_style) && (
                <div className="flex flex-wrap gap-1">
                  {video.video_theme && (
                    <Badge variant="outline" className="text-xs">
                      {video.video_theme}
                    </Badge>
                  )}
                  {video.cta_type && (
                    <Badge variant="outline" className="text-xs">
                      {video.cta_type}
                    </Badge>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 border-border">
            <TableHead className="text-text-primary">
              <div className="flex items-center gap-2">
                Video
                <MetricTooltip
                  label="Video"
                  formula="Título + fecha de publicación"
                  why="Información básica del contenido"
                />
              </div>
            </TableHead>
            <TableHead className="text-text-primary">
              <div className="flex items-center gap-2">
                Performance
                <MetricTooltip
                  label="Performance"
                  formula="Composite: ER + Saves/1K + Finalización"
                  why="Índice general del rendimiento del video"
                />
              </div>
            </TableHead>
            <TableHead className="text-text-primary text-right">
              <div className="flex items-center gap-2 justify-end">
                Vistas
                <MetricTooltip
                  label="Vistas"
                  formula={normalizeBy1K ? "Vistas / 1000" : "Total de visualizaciones"}
                  why="Alcance del contenido"
                />
              </div>
            </TableHead>
            <TableHead className="text-text-primary text-right">
              <div className="flex items-center gap-2 justify-end">
                ER
                <MetricTooltip
                  label="Engagement Rate"
                  formula="(Likes + Comments + Shares) / Vistas × 100"
                  why="Porcentaje de interacción con el contenido"
                />
              </div>
            </TableHead>
            <TableHead className="text-text-primary text-right">
              <div className="flex items-center gap-2 justify-end">
                Saves/1K
                <MetricTooltip
                  label="Saves por 1K"
                  formula="(Saves / Vistas) × 1000"
                  why="Valor percibido del contenido normalizado"
                />
              </div>
            </TableHead>
            <TableHead className="text-text-primary text-right">
              <div className="flex items-center gap-2 justify-end">
                Velocidad 2h
                <MetricTooltip
                  label="Velocidad 2h"
                  formula="Vistas en las primeras 2 horas"
                  why="Velocidad inicial de difusión del contenido"
                />
              </div>
            </TableHead>
            <TableHead className="text-text-primary text-right">
              <div className="flex items-center gap-2 justify-end">
                P.Score
                <MetricTooltip
                  label="Performance Score"
                  formula="Índice compuesto de métricas normalizadas"
                  why="Puntuación general del rendimiento (0-100)"
                />
              </div>
            </TableHead>
            <TableHead className="text-text-primary">Tráfico</TableHead>
            <TableHead className="text-text-primary w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video) => {
            const badge = calculatePerformanceBadge(video);
            return (
              <TableRow key={video.id} className="border-border hover:bg-muted/30">
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <div className="text-sm text-text-primary line-clamp-2">
                      {video.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(video.published_date), 'dd MMM yyyy', { locale: es })}
                    </div>
                    {(video.video_theme || video.cta_type) && (
                      <div className="flex gap-1">
                        {video.video_theme && (
                          <Badge variant="outline" className="text-xs">
                            {video.video_theme}
                          </Badge>
                        )}
                        {video.cta_type && (
                          <Badge variant="outline" className="text-xs">
                            {video.cta_type}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <PerformanceBadge badge={badge} size="sm" />
                </TableCell>
                <TableCell className="text-right font-medium text-text-primary">
                  {getDisplayValue(video.views || 0)}
                </TableCell>
                <TableCell className="text-right text-text-primary">
                  {(video.engagement_rate || 0).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right text-text-primary">
                  {(video.saves_per_1k || 0).toFixed(1)}
                </TableCell>
                <TableCell className="text-right text-text-primary">
                  {getDisplayValue(video.speed_2h || 0)}
                </TableCell>
                <TableCell className="text-right font-medium text-text-primary">
                  {(video.performance_score || 0).toFixed(0)}
                </TableCell>
                <TableCell>
                  <TrafficSourcesDonut video={video} size="sm" />
                </TableCell>
                <TableCell>
                  {video.video_url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(video.video_url, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};