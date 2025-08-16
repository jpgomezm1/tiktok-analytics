export interface ProcessedVideo {
  id: string;
  title: string;
  published_date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  duration_seconds?: number;
  traffic_for_you?: number;
  traffic_follow?: number;
  traffic_hashtag?: number;
  traffic_sound?: number;
  traffic_profile?: number;
  traffic_search?: number;
  video_url?: string;
  // Calculated metrics
  engagement_rate: number;
  saves_per_1k: number;
  completion_rate: number;
  views_norm: number;
  followers_at_post_time: number;
  speed_2h?: number;
}

export interface DashboardMetrics {
  overallGrowthScore: number;
  growthTrend: { direction: 'up' | 'down' | 'neutral'; percentage: number };
  hitRate: number;
  speed2hStatus: { emoji: string; label: string; color: string };
  savesPer1K: number;
  processedVideos: ProcessedVideo[];
  topPerformers: ProcessedVideo[];
  bottomPerformers: ProcessedVideo[];
  loading: boolean;
}