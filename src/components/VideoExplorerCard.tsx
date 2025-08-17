import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Play, ExternalLink, Info } from 'lucide-react';
import { VideoExplorerData } from '@/hooks/useVideoExplorer';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: VideoExplorerData;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  showSelection?: boolean;
}

export const VideoExplorerCard = ({ 
  video, 
  isSelected = false, 
  onSelect, 
  showSelection = false 
}: VideoCardProps) => {
  const [imageError, setImageError] = useState(false);

  const getPerformanceBadge = (percentile: number) => {
    if (percentile >= 90) return { icon: '🔥', variant: 'default' as const, label: 'Excelente' };
    if (percentile >= 70) return { icon: '✅', variant: 'secondary' as const, label: 'Bueno' };
    if (percentile >= 40) return { icon: '🔸', variant: 'outline' as const, label: 'Regular' };
    return { icon: '❌', variant: 'destructive' as const, label: 'Bajo' };
  };

  const formatMetric = (value: number, type: 'percentage' | 'decimal' | 'number') => {
    if (type === 'percentage') return `${value.toFixed(1)}%`;
    if (type === 'decimal') return value.toFixed(1);
    return value.toLocaleString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const overallPerformance = Math.max(
    video.retention_percentile,
    video.saves_percentile,
    video.for_you_percentile,
    video.engagement_percentile,
    video.f_per_1k_percentile
  );

  const performanceBadge = getPerformanceBadge(overallPerformance);

  return (
    <Card className={cn(
      "bg-card border-border shadow-card hover:shadow-purple transition-all duration-300 group cursor-pointer",
      isSelected && "ring-2 ring-primary"
    )}>
      <Link to={`/videos/${video.id}`} className="block">
        <CardContent className="p-4">
          {/* Header with selection and performance */}
          <div className="flex items-start justify-between mb-3">
            {showSelection && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            
            <div className="flex gap-2 ml-auto">
              {video.is_viral && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="default"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      >
                        🚀 Viral
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-semibold mb-1">Video Viral</p>
                        <p className="text-xs mb-2">Índice: {video.viral_index.toFixed(1)}/10</p>
                        <p className="text-xs text-muted-foreground">
                          Un video es viral cuando combina un alto volumen de views 
                          (mínimo 10K) con métricas de retención, saves y follows 
                          dentro del top 7% histórico.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              <Badge 
                variant={performanceBadge.variant}
              >
                {performanceBadge.icon} {performanceBadge.label}
              </Badge>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="relative mb-3 aspect-video bg-muted rounded-lg overflow-hidden">
            {video.image_url && !imageError ? (
              <img
                src={video.image_url}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted">
                <Play className="w-8 h-8" />
              </div>
            )}
            
            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {video.video_url && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(video.video_url, '_blank');
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

        {/* Title */}
        <h3 className="font-semibold text-text-primary mb-2 line-clamp-2 min-h-[2.5rem]">
          {video.title}
        </h3>

        {/* Hook */}
        {video.hook && (
          <p className="text-sm text-text-secondary mb-3 line-clamp-1">
            <span className="font-medium">Hook:</span> {truncateText(video.hook, 60)}
          </p>
        )}

        {/* Metrics chips */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {/* Engagement Rate */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="text-xs gap-1 bg-orange-500/10 border-orange-500/20 text-orange-400"
                  >
                    Engagement {formatMetric(video.engagement_rate, 'percentage')}
                    <span className="text-text-muted">| p{video.engagement_percentile}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Engagement Rate: (likes + comments + shares) / views × 100</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Retention */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="text-xs gap-1 bg-green-500/10 border-green-500/20 text-green-400"
                  >
                    Retención {formatMetric(video.retention_rate, 'percentage')}
                    <span className="text-text-muted">| p{video.retention_percentile}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Retención: tiempo promedio visto / duración total × 100</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* F/1k */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="text-xs gap-1 bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                  >
                    F/1k {formatMetric(video.f_per_1k, 'decimal')}
                    <span className="text-text-muted">| p{video.f_per_1k_percentile}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Seguidores por 1K vistas: new_followers / views × 1000</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex flex-wrap gap-1">
            {/* Saves per 1k */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="text-xs gap-1 bg-purple-500/10 border-purple-500/20 text-purple-400"
                  >
                    Saves/1k {formatMetric(video.saves_per_1k, 'decimal')}
                    <span className="text-text-muted">| p{video.saves_percentile}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Saves por 1K vistas: saves / views × 1000</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* For You percentage */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="text-xs gap-1 bg-blue-500/10 border-blue-500/20 text-blue-400"
                  >
                    For You {formatMetric(video.for_you_percentage, 'percentage')}
                    <span className="text-text-muted">| p{video.for_you_percentile}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>% For You: tráfico del feed principal / views × 100</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Basic stats */}
        <div className="mt-3 pt-3 border-t border-border text-xs text-text-muted flex justify-between">
          <span>{video.views.toLocaleString()} vistas</span>
          <span>{video.duration_seconds}s</span>
        </div>
      </CardContent>
    </Link>
    </Card>
  );
};