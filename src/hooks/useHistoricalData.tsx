import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface VideoData {
  id: string;
  title: string;
  hook?: string;
  guion?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  new_followers: number;
  avg_time_watched: number;
  duration_seconds: number;
  traffic_for_you: number;
  retention_rate: number;
  saves_per_1k: number;
  f_per_1k: number;
  for_you_percentage: number;
  engagement_rate: number;
  video_type?: string;
  published_date: string;
}

export interface GrowthInsight {
  id: string;
  title: string;
  description: string;
  insight_type: string;
  confidence_score: number;
  date_generated: string;
}

export interface HistoricalData {
  videos: VideoData[];
  insights: GrowthInsight[];
  metrics: {
    avg_retention: number;
    avg_saves_per_1k: number;
    avg_f_per_1k: number;
    avg_for_you_percentage: number;
    avg_engagement_rate: number;
    total_views: number;
    total_new_followers: number;
    video_count: number;
  };
  patterns: {
    best_hook_types: string[];
    optimal_duration_range: { min: number; max: number };
    top_performing_times: string[];
    effective_cta_types: string[];
  };
}

export const useHistoricalData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HistoricalData | null>(null);

  const loadHistoricalData = async () => {
    if (!user) return null;

    setLoading(true);
    try {
      // Load videos
      const { data: videosData, error: videosError } = await (supabase as any)
        .from('videos')
        .select(`
          id, title, hook, guion, views, likes, comments, shares, saves, new_followers,
          avg_time_watched, duration_seconds, traffic_for_you, traffic_profile,
          traffic_hashtag, traffic_sound, traffic_search, video_type, published_date
        `)
        .eq('user_id', user.id)
        .order('published_date', { ascending: false });

      if (videosError) throw videosError;

      // Load growth insights
      const { data: insightsData, error: insightsError } = await (supabase as any)
        .from('growth_insights')
        .select('id, title, description, insight_type, confidence_score, date_generated')
        .eq('user_id', user.id)
        .order('date_generated', { ascending: false })
        .limit(10);

      if (insightsError) throw insightsError;

      // Process videos to calculate derived metrics
      const processedVideos: VideoData[] = (videosData || []).map(video => {
        const views = video.views || 0;
        const retention_rate = video.duration_seconds > 0 
          ? (video.avg_time_watched / video.duration_seconds) * 100 
          : 0;
        const saves_per_1k = views > 0 ? (video.saves / views) * 1000 : 0;
        const f_per_1k = views > 0 ? (video.new_followers / views) * 1000 : 0;
        const for_you_percentage = views > 0 ? (video.traffic_for_you / views) * 100 : 0;
        const engagement_rate = views > 0 
          ? ((video.likes + video.comments + video.shares) / views) * 100 
          : 0;

        return {
          ...video,
          retention_rate,
          saves_per_1k,
          f_per_1k,
          for_you_percentage,
          engagement_rate
        };
      });

      // Calculate aggregated metrics
      const totalVideos = processedVideos.length;
      const metrics = {
        avg_retention: totalVideos > 0 
          ? processedVideos.reduce((acc, v) => acc + v.retention_rate, 0) / totalVideos 
          : 0,
        avg_saves_per_1k: totalVideos > 0 
          ? processedVideos.reduce((acc, v) => acc + v.saves_per_1k, 0) / totalVideos 
          : 0,
        avg_f_per_1k: totalVideos > 0 
          ? processedVideos.reduce((acc, v) => acc + v.f_per_1k, 0) / totalVideos 
          : 0,
        avg_for_you_percentage: totalVideos > 0 
          ? processedVideos.reduce((acc, v) => acc + v.for_you_percentage, 0) / totalVideos 
          : 0,
        avg_engagement_rate: totalVideos > 0 
          ? processedVideos.reduce((acc, v) => acc + v.engagement_rate, 0) / totalVideos 
          : 0,
        total_views: processedVideos.reduce((acc, v) => acc + v.views, 0),
        total_new_followers: processedVideos.reduce((acc, v) => acc + v.new_followers, 0),
        video_count: totalVideos
      };

      // Identify patterns
      const topPerformers = processedVideos
        .filter(v => v.f_per_1k > metrics.avg_f_per_1k)
        .sort((a, b) => b.f_per_1k - a.f_per_1k)
        .slice(0, 10);

      const patterns = {
        best_hook_types: [...new Set(topPerformers.map(v => v.hook?.substring(0, 20) || 'Sin hook').filter(Boolean))],
        optimal_duration_range: {
          min: Math.min(...topPerformers.map(v => v.duration_seconds).filter(d => d > 0)) || 15,
          max: Math.max(...topPerformers.map(v => v.duration_seconds).filter(d => d > 0)) || 60
        },
        top_performing_times: ['19:00-21:00', '12:00-14:00'], // Placeholder - would need hour data
        effective_cta_types: ['follow', 'save', 'share'] // Placeholder - would need CTA analysis
      };

      const historicalData: HistoricalData = {
        videos: processedVideos,
        insights: insightsData || [],
        metrics,
        patterns
      };

      setData(historicalData);
      return historicalData;
    } catch (error) {
      console.error('Error loading historical data:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistoricalData();
  }, [user]);

  return {
    data,
    loading,
    refresh: loadHistoricalData
  };
};