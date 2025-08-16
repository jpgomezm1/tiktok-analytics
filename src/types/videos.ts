export interface VideoFilters {
  theme?: string;
  cta_type?: string;
  editing_style?: string;
  hook_type?: string;
  date_range?: string;
}

export interface SavedView {
  id: string;
  name: string;
  filters: VideoFilters;
  sort_by: string;
  normalize_by_1k: boolean;
  created_at: string;
}

export type SortOption = 
  | 'saves_per_1k_desc'
  | 'engagement_rate_desc'
  | 'speed_2h_desc'
  | 'performance_score_desc'
  | 'views_desc'
  | 'published_date_desc';

export type HookType = 'pregunta' | 'numero' | 'como' | 'all';

export interface PerformanceBadge {
  emoji: string;
  label: string;
  color: string;
  percentile: number;
}