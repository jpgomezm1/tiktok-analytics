import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Play, ExternalLink, Info, Eye, Clock, TrendingUp, Heart, Users, Zap } from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);

  const getPerformanceBadge = (percentile: number) => {
    if (percentile >= 90) return { 
      icon: '🔥', 
      variant: 'default' as const, 
      label: 'Excelente',
      gradient: 'from-purple-500 to-pink-500',
      glow: 'shadow-purple-500/30'
    };
    if (percentile >= 70) return { 
      icon: '✅', 
      variant: 'secondary' as const, 
      label: 'Bueno',
      gradient: 'from-green-500 to-emerald-500',
      glow: 'shadow-green-500/30'
    };
    if (percentile >= 40) return { 
      icon: '🔸', 
      variant: 'outline' as const, 
      label: 'Regular',
      gradient: 'from-orange-500 to-yellow-500',
      glow: 'shadow-orange-500/30'
    };
    return { 
      icon: '❌', 
      variant: 'destructive' as const, 
      label: 'Bajo',
      gradient: 'from-red-500 to-red-600',
      glow: 'shadow-red-500/30'
    };
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

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'engagement': return <TrendingUp className="w-3 h-3" />;
      case 'retention': return <Clock className="w-3 h-3" />;
      case 'saves': return <Heart className="w-3 h-3" />;
      case 'foryou': return <Zap className="w-3 h-3" />;
      case 'followers': return <Users className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer",
        isSelected && "ring-2 ring-purple-bright shadow-purple-bright/30 border-purple-bright/50",
        "transform hover:scale-[1.02] hover:-translate-y-1"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-bright/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-bright to-pink-500"></div>
      )}

      <Link to={`/videos/${video.id}`} className="block">
        <CardContent className="relative p-5 space-y-4">
          {/* Header with selection and performance */}
          <div className="flex items-start justify-between">
            {showSelection && (
              <div className="relative z-10">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onSelect}
                  className={cn(
                    "data-[state=checked]:bg-purple-bright data-[state=checked]:border-purple-bright transition-all duration-200",
                    "hover:scale-110 transform"
                  )}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            
            <div className="flex gap-2 ml-auto">
              {video.is_viral && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        className={cn(
                          "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg animate-pulse",
                          "hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                        )}
                      >
                        🚀 Viral
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-card/95 backdrop-blur-sm border border-border/50">
                      <div className="text-center space-y-2">
                        <p className="font-semibold">Video Viral</p>
                        <p className="text-sm">Índice: <span className="font-bold text-purple-400">{video.viral_index.toFixed(1)}/10</span></p>
                        <p className="text-xs text-text-muted leading-relaxed">
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
                className={cn(
                  performanceBadge.variant === 'default' && `bg-gradient-to-r ${performanceBadge.gradient} text-white border-0 shadow-lg`,
                  performanceBadge.variant === 'secondary' && `bg-gradient-to-r ${performanceBadge.gradient} text-white border-0 shadow-lg`,
                  "transition-all duration-200 hover:scale-105"
                )}
              >
                <span className="mr-1">{performanceBadge.icon}</span>
                {performanceBadge.label}
              </Badge>
            </div>
          </div>

          {/* Enhanced Thumbnail */}
          <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/70 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
            {video.image_url && !imageError ? (
              <img
                src={video.image_url}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-bright/20 to-purple-dark/10">
                <Play className="w-12 h-12 text-purple-light group-hover:scale-110 transition-transform duration-300" />
              </div>
            )}
            
            {/* Enhanced overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}>
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div className="flex items-center space-x-2 text-white">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">{video.views.toLocaleString()}</span>
                </div>
                {video.video_url && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="backdrop-blur-sm bg-white/20 hover:bg-white/30 border-white/30 text-white"
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

            {/* Duration badge */}
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{video.duration_seconds}s</span>
            </div>
          </div>

          {/* Enhanced Title */}
          <div className="space-y-2">
            <h3 className="font-bold text-text-primary line-clamp-2 min-h-[2.5rem] group-hover:text-purple-light transition-colors duration-200 leading-tight">
              {video.title}
            </h3>

            {/* Hook with better styling */}
            {video.hook && (
              <div className="bg-muted/30 rounded-lg px-3 py-2 border border-border/30">
                <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                  <span className="font-medium text-purple-light">Hook:</span> "{truncateText(video.hook, 80)}"
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Metrics with better visual hierarchy */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {/* Engagement Rate */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-2 hover:border-orange-500/40 transition-all duration-200">
                      <div className="flex items-center space-x-2">
                        {getMetricIcon('engagement')}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-orange-400">Engagement</div>
                          <div className="text-sm font-bold text-text-primary">{formatMetric(video.engagement_rate, 'percentage')}</div>
                          <div className="text-xs text-text-muted">p{video.engagement_percentile}</div>
                        </div>
                      </div>
                    </div>
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
                    <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-2 hover:border-green-500/40 transition-all duration-200">
                      <div className="flex items-center space-x-2">
                        {getMetricIcon('retention')}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-green-400">Retención</div>
                          <div className="text-sm font-bold text-text-primary">{formatMetric(video.retention_rate, 'percentage')}</div>
                          <div className="text-xs text-text-muted">p{video.retention_percentile}</div>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Retención: tiempo promedio visto / duración total × 100</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Saves per 1k */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-2 hover:border-purple-500/40 transition-all duration-200">
                      <div className="flex items-center space-x-2">
                        {getMetricIcon('saves')}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-purple-400">Saves/1k</div>
                          <div className="text-sm font-bold text-text-primary">{formatMetric(video.saves_per_1k, 'decimal')}</div>
                          <div className="text-xs text-text-muted">p{video.saves_percentile}</div>
                        </div>
                      </div>
                    </div>
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
                    <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-2 hover:border-blue-500/40 transition-all duration-200">
                      <div className="flex items-center space-x-2">
                        {getMetricIcon('foryou')}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-blue-400">For You</div>
                          <div className="text-sm font-bold text-text-primary">{formatMetric(video.for_you_percentage, 'percentage')}</div>
                          <div className="text-xs text-text-muted">p{video.for_you_percentile}</div>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>% For You: tráfico del feed principal / views × 100</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* F/1k - Full width if significant */}
            {video.f_per_1k > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-lg p-2 hover:border-cyan-500/40 transition-all duration-200">
                      <div className="flex items-center space-x-2">
                        {getMetricIcon('followers')}
                        <div className="flex-1">
                          <div className="text-xs font-medium text-cyan-400">Seguidores/1k</div>
                          <div className="text-sm font-bold text-text-primary">{formatMetric(video.f_per_1k, 'decimal')}</div>
                          <div className="text-xs text-text-muted">p{video.f_per_1k_percentile}</div>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Seguidores por 1K vistas: new_followers / views × 1000</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Enhanced Footer Stats */}
          <div className="pt-3 border-t border-gradient-to-r from-border via-border/50 to-border">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-4 text-text-muted">
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span className="font-medium">{video.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{video.duration_seconds}s</span>
                </div>
              </div>
              
              {overallPerformance >= 80 && (
                <Badge variant="outline" className="text-xs bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-600 border-yellow-500/30">
                  Top Performer
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};