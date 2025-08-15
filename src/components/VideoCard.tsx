import { Video } from '@/hooks/useVideos';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, MessageCircle, Share, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: Video;
  className?: string;
}

export const VideoCard = ({ video, className }: VideoCardProps) => {
  const getPerformanceBadge = (score?: number) => {
    if (!score) return { label: 'N/A', variant: 'secondary' as const };
    
    if (score >= 8) return { label: 'Viral', variant: 'destructive' as const };
    if (score >= 5) return { label: 'Good', variant: 'default' as const };
    if (score >= 2) return { label: 'Average', variant: 'secondary' as const };
    return { label: 'Poor', variant: 'outline' as const };
  };

  const performance = getPerformanceBadge(video.performance_score);
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <Card className={cn("bg-card border-border shadow-card hover:shadow-purple transition-all duration-300 cursor-pointer group", className)}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Video Thumbnail */}
          <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
            {video.image_url ? (
              <img 
                src={video.image_url} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-medium text-text-primary truncate group-hover:text-purple-light transition-colors">
                {video.title}
              </h3>
              <Badge variant={performance.variant} className="flex-shrink-0 text-xs">
                {performance.label}
              </Badge>
            </div>

            {video.hook && (
              <p className="text-xs text-text-muted mb-2 line-clamp-1">
                {video.hook}
              </p>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-text-secondary">
                <Eye className="w-3 h-3" />
                <span>{formatNumber(video.views || 0)}</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary">
                <Heart className="w-3 h-3" />
                <span>{formatNumber(video.likes || 0)}</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary">
                <MessageCircle className="w-3 h-3" />
                <span>{formatNumber(video.comments || 0)}</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary">
                <Share className="w-3 h-3" />
                <span>{formatNumber(video.shares || 0)}</span>
              </div>
            </div>

            {/* Engagement Rate */}
            {video.engagement_rate && (
              <div className="mt-2 pt-2 border-t border-border">
                <div className="text-xs text-text-muted">
                  Engagement: <span className="text-purple-light font-medium">{video.engagement_rate.toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};