import { useMemo } from 'react';
import { useFollowersHistory } from '@/hooks/useFollowersHistory';

interface Video {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  published_date: string;
  performance_score?: number;
}

interface NormalizedMetrics {
  views_norm: number;
  engagement_norm: number;
  viral_threshold: number;
  has_sufficient_data: boolean;
  followers_at_post_time: number;
}

interface MetricNormalizationHook {
  loading: boolean;
  normalizeVideo: (video: Video) => Promise<NormalizedMetrics>;
  getViralityStatus: (video: Video, normalized: NormalizedMetrics) => {
    is_viral: boolean;
    performance_tier: 'viral' | 'good' | 'medium' | 'low';
    badge_text: string;
  };
}

export const useMetricNormalization = (): MetricNormalizationHook => {
  const { getCountOn, loading } = useFollowersHistory();

  const normalizeVideo = async (video: Video): Promise<NormalizedMetrics> => {
    // Get followers count at the time of posting
    const followers_at_post_time = await getCountOn(video.published_date);
    
    // Calculate normalized metrics
    const views_norm = video.views / Math.max(followers_at_post_time, 1);
    const total_engagement = video.likes + video.comments + video.shares;
    const engagement_norm = total_engagement / Math.max(followers_at_post_time, 1);
    
    // Determine if we have sufficient data (at least 7 days of follower history)
    const has_sufficient_data = followers_at_post_time > 0;
    
    // Set viral threshold based on normalized views
    // These are rough estimates that can be fine-tuned based on your data
    const viral_threshold = has_sufficient_data ? 0.1 : 0; // 10% of follower base viewing = viral potential
    
    return {
      views_norm,
      engagement_norm,
      viral_threshold,
      has_sufficient_data,
      followers_at_post_time
    };
  };

  const getViralityStatus = (video: Video, normalized: NormalizedMetrics) => {
    if (!normalized.has_sufficient_data) {
      return {
        is_viral: false,
        performance_tier: 'medium' as const,
        badge_text: 'Sin historial de seguidores para esta fecha'
      };
    }

    const { views_norm } = normalized;
    
    // Define performance tiers based on normalized views
    if (views_norm >= 0.08) { // 8%+ of followers viewed = viral
      return {
        is_viral: true,
        performance_tier: 'viral' as const,
        badge_text: '🔥 Viral'
      };
    } else if (views_norm >= 0.04) { // 4-8% = good performance
      return {
        is_viral: false,
        performance_tier: 'good' as const,
        badge_text: '✅ Bueno'
      };
    } else if (views_norm >= 0.02) { // 2-4% = medium performance
      return {
        is_viral: false,
        performance_tier: 'medium' as const,
        badge_text: '🔸 Medio'
      };
    } else { // <2% = low performance
      return {
        is_viral: false,
        performance_tier: 'low' as const,
        badge_text: '❌ Bajo'
      };
    }
  };

  return {
    loading,
    normalizeVideo,
    getViralityStatus
  };
};