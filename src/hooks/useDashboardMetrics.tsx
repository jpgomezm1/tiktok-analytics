import { useMemo } from 'react';
import { useVideos } from '@/hooks/useVideos';
import { useFollowersHistory } from '@/hooks/useFollowersHistory';
import { DateRange, ChartMetric } from '@/hooks/useDashboardState';
import { ProcessedVideo, DashboardMetrics } from '@/types/dashboard';

export const useDashboardMetrics = (
  dateRange: DateRange,
  normalizeByAccount: boolean
): DashboardMetrics => {
  const { videos, loading: videosLoading } = useVideos();
  const { getCountOn, loading: followersLoading } = useFollowersHistory();

  const processedVideos = useMemo(() => {
    if (!videos || videos.length === 0) return [];

    return videos.map(video => {
      const views = video.views || 0;
      const likes = video.likes || 0;
      const comments = video.comments || 0;
      const shares = video.shares || 0;
      const saves = video.saves || 0;

      // Calculate metrics
      const engagement_rate = views > 0 ? ((likes + comments + shares) / views) * 100 : 0;
      const saves_per_1k = views > 0 ? (saves / views) * 1000 : 0;
      const completion_rate = video.avg_time_watched || 0; // Use available field
      const followers_at_post_time = 1; // Simplified for now
      const views_norm = normalizeByAccount && followers_at_post_time > 0 
        ? views / followers_at_post_time 
        : views;

      return {
        ...video,
        views,
        likes,
        comments,
        shares,
        saves,
        engagement_rate,
        saves_per_1k,
        completion_rate,
        views_norm,
        followers_at_post_time,
        speed_2h: views // Simplified
      } as ProcessedVideo;
    });
  }, [videos, normalizeByAccount]);

  // Filter videos by date range
  const filteredVideos = useMemo(() => {
    const now = new Date();
    const daysBack = parseInt(dateRange.replace('d', ''));
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    return processedVideos.filter(video => 
      new Date(video.published_date) >= cutoffDate
    );
  }, [processedVideos, dateRange]);

  // Calculate KPI metrics
  const metrics = useMemo(() => {
    if (filteredVideos.length === 0) {
      return {
        overallGrowthScore: 0,
        growthTrend: { direction: 'neutral' as const, percentage: 0 },
        hitRate: 0,
        speed2hStatus: { emoji: '🟡', label: 'Normal', color: 'text-orange-400' },
        savesPer1K: 0,
        topPerformers: [],
        bottomPerformers: []
      };
    }

    // Overall Growth Score (weighted composite)
    const avgER = filteredVideos.reduce((sum, v) => sum + v.engagement_rate, 0) / filteredVideos.length;
    const avgSaves = filteredVideos.reduce((sum, v) => sum + v.saves_per_1k, 0) / filteredVideos.length;
    const avgCompletion = filteredVideos.reduce((sum, v) => sum + v.completion_rate, 0) / filteredVideos.length;
    
    const overallGrowthScore = Math.min(100, Math.round(
      (avgER * 0.4) + (avgSaves * 0.3) + (avgCompletion * 0.3)
    ));

    // Hit Rate (% of videos ≥ p75 in views_norm)
    const sortedByViews = [...filteredVideos].sort((a, b) => b.views_norm - a.views_norm);
    const p75Index = Math.floor(sortedByViews.length * 0.25);
    const p75Threshold = sortedByViews[p75Index]?.views_norm || 0;
    const hitRate = Math.round(
      (filteredVideos.filter(v => v.views_norm >= p75Threshold).length / filteredVideos.length) * 100
    );

    // Speed 2h Status (simplified - would need actual 2h data)
    const latestVideo = filteredVideos[0];
    const medianViews = sortedByViews[Math.floor(sortedByViews.length / 2)]?.views || 0;
    const speed2hRatio = latestVideo && medianViews > 0 ? latestVideo.views / medianViews : 1;
    
    let speed2hStatus;
    if (speed2hRatio >= 1.3) {
      speed2hStatus = { emoji: '🔥', label: 'Rápido', color: 'text-red-400' };
    } else if (speed2hRatio >= 0.8) {
      speed2hStatus = { emoji: '🟡', label: 'Normal', color: 'text-orange-400' };
    } else {
      speed2hStatus = { emoji: '🧊', label: 'Lento', color: 'text-blue-400' };
    }

    // Growth trend (7d vs previous 7d)
    const now = new Date();
    const last7d = filteredVideos.filter(v => 
      new Date(v.published_date) >= new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
    );
    const prev7d = filteredVideos.filter(v => {
      const date = new Date(v.published_date);
      return date >= new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000)) &&
             date < new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    });

    const last7dScore = last7d.length > 0 
      ? last7d.reduce((sum, v) => sum + v.engagement_rate, 0) / last7d.length 
      : 0;
    const prev7dScore = prev7d.length > 0 
      ? prev7d.reduce((sum, v) => sum + v.engagement_rate, 0) / prev7d.length 
      : 0;

    let growthTrend;
    if (prev7dScore === 0) {
      growthTrend = { direction: 'neutral' as const, percentage: 0 };
    } else {
      const change = ((last7dScore - prev7dScore) / prev7dScore) * 100;
      growthTrend = {
        direction: change > 5 ? 'up' as const : change < -5 ? 'down' as const : 'neutral' as const,
        percentage: Math.abs(Math.round(change))
      };
    }

    // Top and Bottom performers (10% each)
    const top10Count = Math.max(1, Math.floor(filteredVideos.length * 0.1));
    const bottom10Count = Math.max(1, Math.floor(filteredVideos.length * 0.1));
    
    const topPerformers = sortedByViews.slice(0, top10Count);
    const bottomPerformers = sortedByViews.slice(-bottom10Count);

    return {
      overallGrowthScore,
      growthTrend,
      hitRate,
      speed2hStatus,
      savesPer1K: avgSaves,
      topPerformers,
      bottomPerformers
    };
  }, [filteredVideos]);

  return {
    ...metrics,
    processedVideos: filteredVideos,
    loading: videosLoading || followersLoading
  };
};