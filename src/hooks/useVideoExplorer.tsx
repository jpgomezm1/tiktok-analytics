import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface VideoExplorerData {
  id: string;
  title: string;
  image_url?: string;
  video_url?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  new_followers: number;
  avg_time_watched: number;
  duration_seconds: number;
  traffic_for_you: number;
  traffic_profile: number;
  traffic_hashtag: number;
  traffic_sound: number;
  traffic_search: number;
  published_date: string;
  hook?: string;
  guion?: string;
  video_type?: string;
  // Calculated metrics
  engagement_rate: number;
  retention_rate: number;
  saves_per_1k: number;
  for_you_percentage: number;
  f_per_1k: number;
  performance_score: number;
  // Percentiles
  retention_percentile: number;
  saves_percentile: number;
  for_you_percentile: number;
  engagement_percentile: number;
  f_per_1k_percentile: number;
}

export interface VideoFilters {
  dateRange: {
    start: Date | null;
    end: Date | null;
    preset: '7d' | '30d' | 'custom' | null;
  };
  duration: ('short' | 'medium' | 'long')[];
  videoType?: string;
  signals: {
    topRetention: boolean;
    topSaves: boolean;
    highForYou: boolean;
    topF1k: boolean;
    highVelocity: boolean;
  };
  search: string;
}

export interface Percentiles {
  retention: { p10: number; p50: number; p90: number };
  saves_per_1k: { p10: number; p50: number; p90: number };
  for_you_percentage: { p10: number; p50: number; p90: number };
  engagement_rate: { p10: number; p50: number; p90: number };
  f_per_1k: { p10: number; p50: number; p90: number };
}

export interface ComparisonData {
  groupA: VideoExplorerData[];
  groupB: VideoExplorerData[];
  averages: {
    groupA: {
      retention: number;
      saves_per_1k: number;
      for_you_percentage: number;
      engagement_rate: number;
      f_per_1k: number;
    };
    groupB: {
      retention: number;
      saves_per_1k: number;
      for_you_percentage: number;
      engagement_rate: number;
      f_per_1k: number;
    };
  };
  deltas: {
    retention: { absolute: number; relative: number };
    saves_per_1k: { absolute: number; relative: number };
    for_you_percentage: { absolute: number; relative: number };
    engagement_rate: { absolute: number; relative: number };
    f_per_1k: { absolute: number; relative: number };
  };
}

export const useVideoExplorer = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<VideoExplorerData[]>([]);
  const [percentiles, setPercentiles] = useState<Percentiles | null>(null);

  const calculatePercentile = (value: number, values: number[]): number => {
    const sorted = values.slice().sort((a, b) => a - b);
    const rank = sorted.filter(v => v <= value).length;
    return Math.round((rank / sorted.length) * 100);
  };

  const calculateMetrics = (rawVideos: any[]): VideoExplorerData[] => {
    return rawVideos.map(video => {
      const views = video.views || 0;
      const engagement_rate = views > 0 
        ? ((video.likes + video.comments + video.shares) / views) * 100 
        : 0;
      const retention_rate = video.duration_seconds > 0 
        ? (video.avg_time_watched / video.duration_seconds) * 100 
        : 0;
      const saves_per_1k = views > 0 
        ? (video.saves / views) * 1000 
        : 0;
      const for_you_percentage = views > 0 
        ? (video.traffic_for_you / views) * 100 
        : 0;
      const f_per_1k = views > 0 
        ? (video.new_followers / views) * 1000 
        : 0;
      
      // Enhanced performance score including F/1k
      const performance_score = (engagement_rate + retention_rate + saves_per_1k + for_you_percentage + f_per_1k) / 5;

      return {
        ...video,
        engagement_rate,
        retention_rate,
        saves_per_1k,
        for_you_percentage,
        f_per_1k,
        performance_score,
        retention_percentile: 0, // Will be calculated later
        saves_percentile: 0,
        for_you_percentile: 0,
        engagement_percentile: 0,
        f_per_1k_percentile: 0
      };
    });
  };

  const calculatePercentiles = (videos: VideoExplorerData[]): Percentiles => {
    const retentions = videos.map(v => v.retention_rate);
    const saves = videos.map(v => v.saves_per_1k);
    const forYou = videos.map(v => v.for_you_percentage);
    const engagement = videos.map(v => v.engagement_rate);
    const f1k = videos.map(v => v.f_per_1k);

    const getPercentileValues = (values: number[]) => {
      const sorted = values.slice().sort((a, b) => a - b);
      return {
        p10: sorted[Math.floor(sorted.length * 0.1)] || 0,
        p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
        p90: sorted[Math.floor(sorted.length * 0.9)] || 0
      };
    };

    return {
      retention: getPercentileValues(retentions),
      saves_per_1k: getPercentileValues(saves),
      for_you_percentage: getPercentileValues(forYou),
      engagement_rate: getPercentileValues(engagement),
      f_per_1k: getPercentileValues(f1k)
    };
  };

  const loadVideos = async () => {
    if (!user) return;

    setLoading(true);
    try {
        const { data, error } = await (supabase as any)
        .from('videos')
        .select(`
          id, title, image_url, video_url, views, likes, comments, shares, saves, new_followers,
          avg_time_watched, duration_seconds, traffic_for_you, traffic_profile,
          traffic_hashtag, traffic_sound, traffic_search, published_date,
          hook, guion, video_type
        `)
        .eq('user_id', user.id)
        .order('published_date', { ascending: false });

      if (error) throw error;

      const processedVideos = calculateMetrics(data || []);
      const calculatedPercentiles = calculatePercentiles(processedVideos);
      
      // Add percentiles to videos
      const videosWithPercentiles = processedVideos.map(video => ({
        ...video,
        retention_percentile: calculatePercentile(video.retention_rate, processedVideos.map(v => v.retention_rate)),
        saves_percentile: calculatePercentile(video.saves_per_1k, processedVideos.map(v => v.saves_per_1k)),
        for_you_percentile: calculatePercentile(video.for_you_percentage, processedVideos.map(v => v.for_you_percentage)),
        engagement_percentile: calculatePercentile(video.engagement_rate, processedVideos.map(v => v.engagement_rate)),
        f_per_1k_percentile: calculatePercentile(video.f_per_1k, processedVideos.map(v => v.f_per_1k))
      }));

      setVideos(videosWithPercentiles);
      setPercentiles(calculatedPercentiles);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVideos = (filters: VideoFilters): VideoExplorerData[] => {
    return videos.filter(video => {
      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const videoDate = new Date(video.published_date);
        if (filters.dateRange.start && videoDate < filters.dateRange.start) return false;
        if (filters.dateRange.end && videoDate > filters.dateRange.end) return false;
      }

      // Duration filter
      if (filters.duration.length > 0) {
        const duration = video.duration_seconds;
        const matchesDuration = filters.duration.some(d => {
          if (d === 'short') return duration < 20;
          if (d === 'medium') return duration >= 20 && duration <= 40;
          if (d === 'long') return duration > 40;
          return false;
        });
        if (!matchesDuration) return false;
      }

      // Video type filter
      if (filters.videoType && video.video_type !== filters.videoType) {
        return false;
      }

      // Signals filter
      if (filters.signals.topRetention && video.retention_percentile < 90) return false;
      if (filters.signals.topSaves && video.saves_percentile < 90) return false;
      if (filters.signals.highForYou && video.for_you_percentile < 75) return false;
      if (filters.signals.topF1k && video.f_per_1k_percentile < 90) return false;
      // Note: highVelocity is not implemented yet

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          video.title.toLowerCase().includes(searchLower) ||
          (video.hook && video.hook.toLowerCase().includes(searchLower)) ||
          (video.guion && video.guion.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      return true;
    });
  };

  const getComparison = (groupA: VideoExplorerData[], groupB: VideoExplorerData[]): ComparisonData => {
    const calculateAverage = (videos: VideoExplorerData[], metric: keyof VideoExplorerData): number => {
      if (videos.length === 0) return 0;
      const sum = videos.reduce((acc, video) => acc + (video[metric] as number), 0);
      return sum / videos.length;
    };

    const avgA = {
      retention: calculateAverage(groupA, 'retention_rate'),
      saves_per_1k: calculateAverage(groupA, 'saves_per_1k'),
      for_you_percentage: calculateAverage(groupA, 'for_you_percentage'),
      engagement_rate: calculateAverage(groupA, 'engagement_rate'),
      f_per_1k: calculateAverage(groupA, 'f_per_1k')
    };

    const avgB = {
      retention: calculateAverage(groupB, 'retention_rate'),
      saves_per_1k: calculateAverage(groupB, 'saves_per_1k'),
      for_you_percentage: calculateAverage(groupB, 'for_you_percentage'),
      engagement_rate: calculateAverage(groupB, 'engagement_rate'),
      f_per_1k: calculateAverage(groupB, 'f_per_1k')
    };

    const deltas = {
      retention: {
        absolute: avgA.retention - avgB.retention,
        relative: avgB.retention > 0 ? ((avgA.retention - avgB.retention) / avgB.retention) * 100 : 0
      },
      saves_per_1k: {
        absolute: avgA.saves_per_1k - avgB.saves_per_1k,
        relative: avgB.saves_per_1k > 0 ? ((avgA.saves_per_1k - avgB.saves_per_1k) / avgB.saves_per_1k) * 100 : 0
      },
      for_you_percentage: {
        absolute: avgA.for_you_percentage - avgB.for_you_percentage,
        relative: avgB.for_you_percentage > 0 ? ((avgA.for_you_percentage - avgB.for_you_percentage) / avgB.for_you_percentage) * 100 : 0
      },
      engagement_rate: {
        absolute: avgA.engagement_rate - avgB.engagement_rate,
        relative: avgB.engagement_rate > 0 ? ((avgA.engagement_rate - avgB.engagement_rate) / avgB.engagement_rate) * 100 : 0
      },
      f_per_1k: {
        absolute: avgA.f_per_1k - avgB.f_per_1k,
        relative: avgB.f_per_1k > 0 ? ((avgA.f_per_1k - avgB.f_per_1k) / avgB.f_per_1k) * 100 : 0
      }
    };

    return {
      groupA,
      groupB,
      averages: { groupA: avgA, groupB: avgB },
      deltas
    };
  };

  const getPercentiles = (): Percentiles | null => {
    return percentiles;
  };

  useEffect(() => {
    loadVideos();
  }, [user]);

  return {
    loading,
    videos,
    getVideos,
    getPercentiles,
    getComparison,
    refreshVideos: loadVideos
  };
};