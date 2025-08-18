import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUpDown, ArrowUp, ArrowDown, Play, ExternalLink, Eye, Clock, TrendingUp, Heart, Zap, Users, Target } from 'lucide-react';
import { VideoExplorerData } from '@/hooks/useVideoExplorer';
import { cn } from '@/lib/utils';

type SortField = 'title' | 'views' | 'engagement_rate' | 'retention_rate' | 'saves_per_1k' | 'for_you_percentage' | 'viral_index';
type SortDirection = 'asc' | 'desc';

interface VideoListViewProps {
  videos: VideoExplorerData[];
  selectedVideos: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  showSelection?: boolean;
}

export const VideoListView = ({ 
  videos, 
  selectedVideos, 
  onSelectionChange, 
  showSelection = false 
}: VideoListViewProps) => {
  const [sortField, setSortField] = useState<SortField>('views');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedVideos = [...videos].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(videos.map(v => v.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectVideo = (videoId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedVideos, videoId]);
    } else {
      onSelectionChange(selectedVideos.filter(id => id !== videoId));
    }
  };

  const formatMetric = (value: number, type: 'percentage' | 'decimal' | 'number') => {
    if (value === 0) return '—';
    if (type === 'percentage') return `${value.toFixed(1)}%`;
    if (type === 'decimal') return value.toFixed(1);
    return value.toLocaleString();
  };

  const getPerformanceBadge = (percentile: number) => {
    if (percentile >= 90) return { 
      icon: '🔥', 
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    };
    if (percentile >= 70) return { 
      icon: '✅', 
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    };
    if (percentile >= 40) return { 
      icon: '🔸', 
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    };
    return { 
      icon: '❌', 
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    };
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'engagement': return <TrendingUp className="w-4 h-4" />;
      case 'retention': return <Clock className="w-4 h-4" />;
      case 'saves': return <Heart className="w-4 h-4" />;
      case 'foryou': return <Zap className="w-4 h-4" />;
      case 'viral': return <Target className="w-4 h-4" />;
      default: return null;
    }
  };

  // Función para truncar título
  const truncateTitle = (title: string, maxLength: number = 50) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const SortableHeader = ({ field, children, icon }: { field: SortField; children: React.ReactNode; icon?: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer select-none hover:bg-muted/30 transition-colors duration-200" 
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2 py-2">
        {icon}
        <span className="font-semibold">{children}</span>
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="w-4 h-4 text-purple-bright" />
          ) : (
            <ArrowDown className="w-4 h-4 text-purple-bright" />
          )
        ) : (
          <ArrowUpDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50 bg-muted/20">
              {showSelection && (
                <TableHead className="w-12 sticky left-0 bg-muted/20 backdrop-blur-sm border-r border-border/30">
                  <Checkbox
                    checked={selectedVideos.length === videos.length && videos.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=checked]:bg-purple-bright data-[state=checked]:border-purple-bright"
                  />
                </TableHead>
              )}
              
              <TableHead className="w-20 sticky left-12 bg-muted/20 backdrop-blur-sm border-r border-border/30">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  <span className="font-semibold">Video</span>
                </div>
              </TableHead>
              
              {/* TÍTULO CON ANCHO FIJO */}
              <TableHead className="w-80 min-w-80 max-w-80">
                <div 
                  className="flex items-center gap-2 py-2 cursor-pointer select-none hover:bg-muted/30 transition-colors duration-200"
                  onClick={() => handleSort('title')}
                >
                  <span className="font-semibold">Título</span>
                  {sortField === 'title' ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="w-4 h-4 text-purple-bright" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-purple-bright" />
                    )
                  ) : (
                    <ArrowUpDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
                  )}
                </div>
              </TableHead>
              
              <TableHead className="min-w-[200px]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Hook</span>
                </div>
              </TableHead>
              
              <SortableHeader field="views" icon={<Eye className="w-4 h-4 text-blue-500" />}>
                Vistas
              </SortableHeader>
              
              <SortableHeader field="engagement_rate" icon={getMetricIcon('engagement')}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="text-orange-500">Engagement</TooltipTrigger>
                    <TooltipContent>
                      <p>Engagement Rate: (likes + comments + shares) / views × 100</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </SortableHeader>
              
              <SortableHeader field="retention_rate" icon={getMetricIcon('retention')}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="text-green-500">Retención</TooltipTrigger>
                    <TooltipContent>
                      <p>Retención: tiempo promedio visto / duración total × 100</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </SortableHeader>
              
              <SortableHeader field="saves_per_1k" icon={getMetricIcon('saves')}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="text-purple-500">Saves/1k</TooltipTrigger>
                    <TooltipContent>
                      <p>Saves por 1K vistas: saves / views × 1000</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </SortableHeader>
              
              <SortableHeader field="for_you_percentage" icon={getMetricIcon('foryou')}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="text-blue-500">% For You</TooltipTrigger>
                    <TooltipContent>
                      <p>% For You: tráfico del feed principal / views × 100</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </SortableHeader>
              
              <SortableHeader field="viral_index" icon={getMetricIcon('viral')}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="text-pink-500">Viral Index</TooltipTrigger>
                    <TooltipContent>
                      <p>Índice de viralidad: combinación ponderada de métricas (0-10)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </SortableHeader>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {sortedVideos.map((video, index) => {
              const isSelected = selectedVideos.includes(video.id);
              const overallPerformance = Math.max(
                video.retention_percentile,
                video.saves_percentile,
                video.for_you_percentile,
                video.engagement_percentile
              );
              const performanceBadge = getPerformanceBadge(overallPerformance);

              return (
                <TableRow
                  key={video.id}
                  className={cn(
                    "border-border/50 hover:bg-muted/30 transition-colors duration-200 group",
                    isSelected && "bg-purple-bright/10 border-purple-bright/30"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {showSelection && (
                    <TableCell className="sticky left-0 bg-card/80 backdrop-blur-sm border-r border-border/30">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectVideo(video.id, checked as boolean)}
                        className="data-[state=checked]:bg-purple-bright data-[state=checked]:border-purple-bright"
                      />
                    </TableCell>
                  )}
                  
                  <TableCell className="sticky left-12 bg-card/80 backdrop-blur-sm border-r border-border/30">
                    <div className="relative w-16 h-12 bg-muted rounded-lg overflow-hidden flex items-center justify-center group/thumb shadow-sm">
                      {video.image_url ? (
                        <img
                          src={video.image_url}
                          alt=""
                          className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-bright/20 to-purple-dark/10 flex items-center justify-center">
                          <Play className="w-4 h-4 text-purple-light" />
                        </div>
                      )}
                      
                      {video.video_url && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-all duration-200 flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-white hover:text-white hover:bg-white/20"
                            onClick={() => window.open(video.video_url, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Duration badge */}
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                        {video.duration_seconds}s
                      </div>
                    </div>
                  </TableCell>

                  {/* TÍTULO CON ANCHO FIJO Y TRUNCAMIENTO */}
                  <TableCell className="w-80 min-w-80 max-w-80">
                    <Link to={`/videos/${video.id}`} className="block hover:text-purple-bright transition-colors duration-200">
                      <div className="space-y-2">
                        {/* Título truncado */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="font-semibold text-text-primary group-hover:text-purple-light transition-colors duration-200 leading-tight">
                                {truncateTitle(video.title, 60)}
                              </p>
                            </TooltipTrigger>
                            {video.title.length > 60 && (
                              <TooltipContent className="max-w-md">
                                <p>{video.title}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                        
                        {/* Badges y duración */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {video.is_viral && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5">
                              🚀 Viral
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-xs text-text-muted">
                            <Clock className="w-3 h-3" />
                            <span>{video.duration_seconds}s</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </TableCell>

                  <TableCell className="min-w-[200px]">
                    {video.hook && (
                      <div className="bg-muted/30 rounded-lg px-3 py-2 border border-border/30">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed cursor-help">
                                "{video.hook.substring(0, 50)}{video.hook.length > 50 ? '...' : ''}"
                              </p>
                            </TooltipTrigger>
                            {video.hook.length > 50 && (
                              <TooltipContent className="max-w-md">
                                <p>"{video.hook}"</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="min-w-[100px]">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span className="text-text-primary font-semibold">
                        {formatMetric(video.views, 'number')}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="min-w-[120px]">
                    <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-orange-400 font-semibold">
                          {formatMetric(video.engagement_rate, 'percentage')}
                        </span>
                        <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/30">
                          p{video.engagement_percentile}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="min-w-[120px]">
                    <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 font-semibold">
                          {formatMetric(video.retention_rate, 'percentage')}
                        </span>
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                          p{video.retention_percentile}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="min-w-[120px]">
                    <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400 font-semibold">
                          {formatMetric(video.saves_per_1k, 'decimal')}
                        </span>
                        <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/30">
                          p{video.saves_percentile}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="min-w-[120px]">
                    <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-400 font-semibold">
                          {formatMetric(video.for_you_percentage, 'percentage')}
                        </span>
                        <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30">
                          p{video.for_you_percentile}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="min-w-[120px]">
                    <div className={cn(
                      "rounded-lg p-2 border",
                      performanceBadge.bgColor,
                      performanceBadge.borderColor
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className={performanceBadge.color} style={{ fontSize: '14px' }}>
                            {performanceBadge.icon}
                          </span>
                          <span className="text-text-primary font-semibold">
                            {formatMetric(video.viral_index, 'decimal')}
                          </span>
                        </div>
                        {overallPerformance >= 80 && (
                          <Badge variant="outline" className="text-xs bg-yellow-400/20 text-yellow-600 border-yellow-500/30">
                            Top
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {sortedVideos.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Play className="w-8 h-8 text-text-muted" />
          </div>
          <div>
            <p className="text-text-primary font-medium">No se encontraron videos</p>
            <p className="text-text-muted text-sm">Ajusta los filtros para ver más resultados</p>
          </div>
        </div>
      )}
    </div>
  );
};