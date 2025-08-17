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
  const getPerformanceChip = (score?: number) => {
    if (!score) return { 
      emoji: '❓', 
      label: 'N/A', 
      bgColor: 'bg-muted', 
      textColor: 'text-text-muted' 
    };
    
    if (score >= 8.0) return { 
      emoji: '🔥', 
      label: 'Viral', 
      bgColor: 'bg-purple-600/20', 
      textColor: 'text-purple-400' 
    };
    if (score >= 6.0) return { 
      emoji: '✅', 
      label: 'Bueno', 
      bgColor: 'bg-green-600/20', 
      textColor: 'text-green-400' 
    };
    if (score >= 4.0) return { 
      emoji: '🔸', 
      label: 'Medio', 
      bgColor: 'bg-orange-600/20', 
      textColor: 'text-orange-400' 
    };
    return { 
      emoji: '❌', 
      label: 'Bajo', 
      bgColor: 'bg-red-600/20', 
      textColor: 'text-red-400' 
    };
  };

  const performanceChip = getPerformanceChip(video.performance_score);
  
  // Calculate derived metrics
  const views = video.views || 0;
  const saves = video.saves || 0;
  const likes = video.likes || 0;
  const comments = video.comments || 0;
  const shares = video.shares || 0;
  
  const savesPer1K = views > 0 ? (saves / views) * 1000 : 0;
  const engagementRate = views > 0 ? ((likes + comments + shares) / views) * 100 : 0;
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <Card className={cn("bg-card border-border shadow-card hover:shadow-hover transition-smooth cursor-pointer group hover:border-purple-bright/30 hover:bg-card/90 transform hover:scale-[1.02]", className)}>
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
              <h3 className="text-sm font-medium text-text-primary truncate group-hover:text-purple-light transition-fast">
                {video.title}
              </h3>
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0",
                performanceChip.bgColor,
                performanceChip.textColor
              )}>
                <span>{performanceChip.emoji}</span>
                <span>{performanceChip.label}</span>
              </div>
            </div>

            {video.hook && (
              <p className="text-xs text-text-muted mb-2 line-clamp-1">
                {video.hook}
              </p>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs group-hover:text-text-secondary transition-fast">
              <div className="flex items-center gap-1 text-text-secondary group-hover:text-text-primary transition-fast">
                <Eye className="w-3 h-3 group-hover:text-info transition-fast" />
                <span>{formatNumber(video.views || 0)}</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary group-hover:text-text-primary transition-fast">
                <Heart className="w-3 h-3 group-hover:text-error transition-fast" />
                <span>{formatNumber(video.likes || 0)}</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary group-hover:text-text-primary transition-fast">
                <MessageCircle className="w-3 h-3 group-hover:text-info transition-fast" />
                <span>{formatNumber(video.comments || 0)}</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary group-hover:text-text-primary transition-fast">
                <Share className="w-3 h-3 group-hover:text-success transition-fast" />
                <span>{formatNumber(video.shares || 0)}</span>
              </div>
            </div>

            {/* Enhanced Metrics */}
            <div className="mt-2 pt-2 border-t border-border">
              <div className="grid grid-cols-2 gap-1 text-xs text-text-muted">
                <div>
                  ER: <span className="text-purple-light font-medium">{engagementRate.toFixed(1)}%</span>
                </div>
                <div>
                  Saves/1K: <span className="text-blue-400 font-medium">{savesPer1K.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};