import { Video } from '@/hooks/useVideos';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, MessageCircle, Share, TrendingUp, Clock, Bookmark } from 'lucide-react';
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
      bgColor: 'bg-muted/60', 
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoy';
    if (diffDays === 2) return 'Ayer';
    if (diffDays <= 7) return `${diffDays - 1}d`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)}sem`;
    return `${Math.floor(diffDays / 30)}m`;
  };

  return (
    <Card className={cn(
      "bg-card/90 backdrop-blur-sm border border-border shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group hover:border-purple-bright/30 transform hover:scale-[1.02]",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Video Thumbnail */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <div className="w-full h-full bg-muted rounded-lg overflow-hidden">
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
            
            {/* Duration badge */}
            {video.duration_seconds && (
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-text-primary truncate group-hover:text-purple-light transition-colors">
                  {video.title}
                </h3>
                {video.published_date && (
                  <p className="text-xs text-text-muted mt-0.5">
                    {formatDate(video.published_date)}
                  </p>
                )}
              </div>
              
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0",
                performanceChip.bgColor,
                performanceChip.textColor
              )}>
                <span>{performanceChip.emoji}</span>
                <span>{performanceChip.label}</span>
              </div>
            </div>

            {/* Hook */}
            {video.hook && (
              <p className="text-xs text-text-muted line-clamp-1 italic">
                "{video.hook}"
              </p>
            )}

            {/* Clean Metrics Grid */}
            <div className="grid grid-cols-4 gap-1 text-xs">
              <div className="text-center">
                <Eye className="w-3 h-3 text-blue-400 mx-auto mb-0.5" />
                <div className="font-medium text-text-primary">{formatNumber(views)}</div>
              </div>
              <div className="text-center">
                <Heart className="w-3 h-3 text-red-400 mx-auto mb-0.5" />
                <div className="font-medium text-text-primary">{formatNumber(likes)}</div>
              </div>
              <div className="text-center">
                <MessageCircle className="w-3 h-3 text-green-400 mx-auto mb-0.5" />
                <div className="font-medium text-text-primary">{formatNumber(comments)}</div>
              </div>
              <div className="text-center">
                <Share className="w-3 h-3 text-purple-400 mx-auto mb-0.5" />
                <div className="font-medium text-text-primary">{formatNumber(shares)}</div>
              </div>
            </div>

            {/* Bottom Analytics */}
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <div className="text-xs">
                <span className="text-text-muted">ER: </span>
                <span className="text-purple-light font-semibold">{engagementRate.toFixed(1)}%</span>
              </div>
              <div className="text-xs">
                <span className="text-text-muted">Saves/1K: </span>
                <span className="text-blue-400 font-semibold">{savesPer1K.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};