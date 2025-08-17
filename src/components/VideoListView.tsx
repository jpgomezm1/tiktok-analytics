import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUpDown, ArrowUp, ArrowDown, Play, ExternalLink } from 'lucide-react';
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
    if (percentile >= 90) return { icon: '🔥', color: 'text-green-400' };
    if (percentile >= 70) return { icon: '✅', color: 'text-blue-400' };
    if (percentile >= 40) return { icon: '🔸', color: 'text-yellow-400' };
    return { icon: '❌', color: 'text-red-400' };
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => handleSort(field)}>
      <div className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="w-4 h-4" />
          ) : (
            <ArrowDown className="w-4 h-4" />
          )
        ) : (
          <ArrowUpDown className="w-4 h-4 opacity-50" />
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="bg-card border-border border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            {showSelection && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedVideos.length === videos.length && videos.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead className="w-16">Video</TableHead>
            <SortableHeader field="title">Título</SortableHeader>
            <TableHead>Hook</TableHead>
            <SortableHeader field="views">Vistas</SortableHeader>
            <SortableHeader field="engagement_rate">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>Engagement</TooltipTrigger>
                  <TooltipContent>
                    <p>Engagement Rate: (likes + comments + shares) / views × 100</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SortableHeader>
            <SortableHeader field="retention_rate">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>Retención</TooltipTrigger>
                  <TooltipContent>
                    <p>Retención: tiempo promedio visto / duración total × 100</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SortableHeader>
            <SortableHeader field="saves_per_1k">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>Saves/1k</TooltipTrigger>
                  <TooltipContent>
                    <p>Saves por 1K vistas: saves / views × 1000</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SortableHeader>
            <SortableHeader field="for_you_percentage">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>% For You</TooltipTrigger>
                  <TooltipContent>
                    <p>% For You: tráfico del feed principal / views × 100</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SortableHeader>
            <SortableHeader field="viral_index">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>Viral Index</TooltipTrigger>
                  <TooltipContent>
                    <p>Índice de viralidad: combinación ponderada de métricas (0-10)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedVideos.map((video) => {
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
                  "border-border hover:bg-muted/50",
                  isSelected && "bg-primary/10"
                )}
              >
                {showSelection && (
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectVideo(video.id, checked as boolean)}
                    />
                  </TableCell>
                )}
                
                <TableCell>
                  <div className="relative w-12 h-8 bg-muted rounded overflow-hidden flex items-center justify-center group">
                    {video.image_url ? (
                      <img
                        src={video.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Play className="w-3 h-3 text-text-muted" />
                    )}
                    
                    {video.video_url && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => window.open(video.video_url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 text-white" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="font-medium">
                  <Link to={`/videos/${video.id}`} className="block max-w-xs hover:text-primary">
                    <p className="truncate text-text-primary">{video.title}</p>
                    <p className="text-xs text-text-muted">{video.duration_seconds}s</p>
                  </Link>
                </TableCell>

                <TableCell className="max-w-xs">
                  {video.hook && (
                    <p className="text-sm text-text-secondary truncate">
                      {video.hook.substring(0, 50)}...
                    </p>
                  )}
                </TableCell>

                <TableCell className="text-text-primary font-medium">
                  {formatMetric(video.views, 'number')}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-orange-400">
                      {formatMetric(video.engagement_rate, 'percentage')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      p{video.engagement_percentile}
                    </Badge>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-green-400">
                      {formatMetric(video.retention_rate, 'percentage')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      p{video.retention_percentile}
                    </Badge>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-purple-400">
                      {formatMetric(video.saves_per_1k, 'decimal')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      p{video.saves_percentile}
                    </Badge>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400">
                      {formatMetric(video.for_you_percentage, 'percentage')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      p{video.for_you_percentile}
                    </Badge>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className={performanceBadge.color}>
                      {performanceBadge.icon}
                    </span>
                    <span className="text-text-primary">
                      {formatMetric(video.viral_index, 'decimal')}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {sortedVideos.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          <p>No se encontraron videos</p>
        </div>
      )}
    </div>
  );
};