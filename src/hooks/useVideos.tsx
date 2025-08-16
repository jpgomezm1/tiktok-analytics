import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Video {
  id: string;
  user_id: string;
  title: string;
  image_url?: string;
  video_url?: string;
  published_date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_rate?: number;
  performance_score?: number;
  duration_seconds?: number;
  hook?: string;
  guion?: string;
  traffic_for_you?: number;
  traffic_follow?: number;
  traffic_hashtag?: number;
  traffic_sound?: number;
  traffic_profile?: number;
  traffic_search?: number;
  saves?: number;
  new_followers?: number;
  video_theme?: string;
  cta_type?: string;
  editing_style?: string;
  avg_time_watched?: number;
  created_at: string;
  updated_at: string;
}

export interface VideoAnalytics {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagementRate: number;
  avgViews: number;
  viralCount: number;
  topPerformers: Video[];
  recentVideos: Video[];
}

export const useVideos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('published_date', { ascending: false });

      if (error) throw error;

      const videosData = data || [];
      setVideos(videosData);

      // Calculate analytics
      if (videosData.length > 0) {
        const totalViews = videosData.reduce((sum, v) => sum + (v.views || 0), 0);
        const totalLikes = videosData.reduce((sum, v) => sum + (v.likes || 0), 0);
        const totalComments = videosData.reduce((sum, v) => sum + (v.comments || 0), 0);
        const totalShares = videosData.reduce((sum, v) => sum + (v.shares || 0), 0);
        
        const avgViews = Math.round(totalViews / videosData.length);
        const avgEngagementRate = videosData.reduce((sum, v) => sum + (v.engagement_rate || 0), 0) / videosData.length;
        const viralCount = videosData.filter(v => (v.views || 0) >= 100000).length;
        
        const topPerformers = [...videosData]
          .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
          .slice(0, 5);
        
        const recentVideos = videosData.slice(0, 5);

        setAnalytics({
          totalVideos: videosData.length,
          totalViews,
          totalLikes,
          totalComments,
          totalShares,
          avgEngagementRate,
          avgViews,
          viralCount,
          topPerformers,
          recentVideos
        });
      } else {
        setAnalytics({
          totalVideos: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          avgEngagementRate: 0,
          avgViews: 0,
          viralCount: 0,
          topPerformers: [],
          recentVideos: []
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addVideo = async (videoData: Omit<Video, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('videos')
        .insert([{ ...videoData, user_id: user.id }]);

      if (error) throw error;

      await fetchVideos(); // Refresh the list
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateVideo = async (id: string, videoData: Partial<Video>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('videos')
        .update(videoData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchVideos(); // Refresh the list
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const deleteVideo = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchVideos(); // Refresh the list
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [user]);

  return {
    videos,
    analytics,
    loading,
    error,
    addVideo,
    updateVideo,
    deleteVideo,
    refetch: fetchVideos
  };
};