import { useState, useEffect } from 'react';
import { Video } from '@/hooks/useVideos';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMetricNormalization } from '@/hooks/useMetricNormalization';
import { Eye, Heart, MessageCircle, Share, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedVideoCardProps {
  video: Video;
  className?: string;
}

export const EnhancedVideoCard = ({ video, className }: EnhancedVideoCardProps) => {
  const { normalizeVideo, getViralityStatus, loading } = useMetricNormalization();
  const [normalized, setNormalized] = useState<any>(null);
  const [viralityStatus, setViralityStatus] = useState<any>(null);

  useEffect(() => {
    const loadNormalizedData = async () => {
      try {
        const normalizedMetrics = await normalizeVideo(video);
        const status = getViralityStatus(video, normalizedMetrics);
        setNormalized(normalizedMetrics);
        setViralityStatus(status);
      } catch (error) {
        console.error('Error normalizing video metrics:', error);
      }
    };

    loadNormalizedData();
  }, [video, normalizeVideo, getViralityStatus]);

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

  // Get performance chip based on virality status or fallback to score
  const getPerformanceChip = () => {
    if (viralityStatus) {
      const tierColors = {
        viral: { bgColor: 'bg-purple-600/20', textColor: 'text-purple-400' },
        good: { bgColor: 'bg-green-600/20', textColor: 'text-green-400' },
        medium: { bgColor: 'bg-orange-600/20', textColor: 'text-orange-400' },
        low: { bgColor: 'bg-red-600/20', textColor: 'text-red-400' }
      };
      
      const colors = tierColors[viralityStatus.performance_tier];
      return {
        label: viralityStatus.badge_text,
        ...colors,
        hasFollowerData: normalized?.has_sufficient_data || false
      };
    }

    // Fallback to original performance score logic
    const score = video.performance_score;
    if (!score) return { 
      label: '❓ N/A', 
      bgColor: 'bg-muted', 
      textColor: 'text-text-muted',
      hasFollowerData: false
    };
    
    if (score >= 8.0) return { 
      label: '🔥 Viral', 
      bgColor: 'bg-purple-600/20', 
      textColor: 'text-purple-400',
      hasFollowerData: false
    };
    if (score >= 6.0) return { 
      label: '✅ Bueno', 
      bgColor: 'bg-green-600/20', 
      textColor: 'text-green-400',
      hasFollowerData: false
    };
    if (score >= 4.0) return { 
      label: '🔸 Medio', 
      bgColor: 'bg-orange-600/20', 
      textColor: 'text-orange-400',
      hasFollowerData: false
    };
    return { 
      label: '❌ Bajo', 
      bgColor: 'bg-red-600/20', 
      textColor: 'text-red-400',
      hasFollowerData: false
    };
  };

  const performanceChip = getPerformanceChip();

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
              <div className="flex flex-col items-end gap-1">
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0",
                  performanceChip.bgColor,
                  performanceChip.textColor
                )}>
                  <span>{performanceChip.label}</span>
                </div>
                {!performanceChip.hasFollowerData && normalized && (
                  <div className="flex items-center gap-1 text-xs text-text-muted" title="Sin historial de seguidores para esta fecha">
                    <Info className="w-3 h-3" />
                    <span>Sin datos</span>
                  </div>
                )}
              </div>
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
              {normalized && normalized.has_sufficient_data && (
                <div className="grid grid-cols-2 gap-1 text-xs text-text-muted mt-1">
                  <div>
                    Views norm: <span className="text-green-400 font-medium">{(normalized.views_norm * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    Seguidores: <span className="text-blue-400 font-medium">{formatNumber(normalized.followers_at_post_time)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};