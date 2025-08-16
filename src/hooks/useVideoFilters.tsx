import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useVideos } from './useVideos';
import { useMetricNormalization } from './useMetricNormalization';
import { VideoFilters, SortOption, HookType, PerformanceBadge } from '@/types/videos';
import { ProcessedVideo } from '@/types/dashboard';

export const useVideoFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { videos, loading } = useVideos();
  const { normalizeVideo } = useMetricNormalization();

  // Get filters from URL
  const filters: VideoFilters = {
    theme: searchParams.get('theme') || undefined,
    cta_type: searchParams.get('cta_type') || undefined,
    editing_style: searchParams.get('editing_style') || undefined,
    hook_type: searchParams.get('hook_type') || undefined,
    date_range: searchParams.get('date_range') || '30d',
  };

  const sortBy = (searchParams.get('sort') as SortOption) || 'published_date_desc';
  const normalizeBy1K = searchParams.get('normalize') === 'true';

  // Update URL when filters change
  const updateFilters = useCallback((newFilters: Partial<VideoFilters>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const updateSort = useCallback((sort: SortOption) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const updateNormalize = useCallback((normalize: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (normalize) {
      params.set('normalize', 'true');
    } else {
      params.delete('normalize');
    }
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Hook detection logic
  const detectHookType = (hook: string): HookType[] => {
    if (!hook) return [];
    
    const types: HookType[] = [];
    const lowerHook = hook.toLowerCase();
    
    // Pregunta - detect question marks or question words
    if (lowerHook.includes('?') || 
        lowerHook.includes('¿cómo') || 
        lowerHook.includes('¿qué') || 
        lowerHook.includes('¿por qué') ||
        lowerHook.includes('¿cuál')) {
      types.push('pregunta');
    }
    
    // Número - detect if starts with numbers
    if (/^\d+\s/.test(lowerHook) || 
        lowerHook.includes('top ') || 
        lowerHook.includes(' formas') ||
        lowerHook.includes(' pasos') ||
        lowerHook.includes(' tips')) {
      types.push('numero');
    }
    
    // Cómo - detect how-to patterns
    if (lowerHook.includes('cómo') || 
        lowerHook.includes('how to') ||
        lowerHook.startsWith('aprende') ||
        lowerHook.startsWith('descubre')) {
      types.push('como');
    }
    
    return types;
  };

  // Process and filter videos
  const processedVideos = useMemo(() => {
    if (!videos) return [];

    return videos.map(video => {
      // Calculate basic metrics
      const views = video.views || 0;
      const likes = video.likes || 0;
      const comments = video.comments || 0;
      const shares = video.shares || 0;
      const saves = video.saves || 0;

      // Calculate saves per 1K
      const saves_per_1k = views > 0 ? (saves / views) * 1000 : 0;

      // Calculate engagement rate
      const engagement_rate = views > 0
        ? ((likes + comments + shares) / views) * 100
        : 0;

      // Speed 2h (simplified - would need actual 2h data)
      const speed_2h = views;

      // Performance score (composite)
      const performance_score = Math.min(100, 
        (engagement_rate * 0.4) + (saves_per_1k * 0.3) + ((video.avg_time_watched || 0) * 0.3)
      );

      // Basic normalization (simplified since normalizeVideo returns Promise)
      const completion_rate = video.avg_time_watched || 0;
      const views_norm = views; // Simplified - would use actual normalization
      const followers_at_post_time = 1; // Simplified

      return {
        ...video,
        saves_per_1k,
        engagement_rate,
        speed_2h,
        performance_score,
        completion_rate,
        views_norm,
        followers_at_post_time,
        hook_types: detectHookType(video.hook || ''),
      } as ProcessedVideo & { hook_types: HookType[] };
    });
  }, [videos]);

  // Filter videos based on current filters
  const filteredVideos = useMemo(() => {
    let filtered = [...processedVideos];

    // Apply theme filter
    if (filters.theme) {
      filtered = filtered.filter(video => video.video_theme === filters.theme);
    }

    // Apply CTA filter
    if (filters.cta_type) {
      filtered = filtered.filter(video => video.cta_type === filters.cta_type);
    }

    // Apply editing style filter
    if (filters.editing_style) {
      filtered = filtered.filter(video => video.editing_style === filters.editing_style);
    }

    // Apply hook type filter
    if (filters.hook_type && filters.hook_type !== 'all') {
      filtered = filtered.filter(video => 
        (video as any).hook_types.includes(filters.hook_type)
      );
    }

    // Apply date range filter
    if (filters.date_range) {
      const now = new Date();
      const daysBack = parseInt(filters.date_range.replace('d', ''));
      const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(video => 
        new Date(video.published_date) >= cutoffDate
      );
    }

    return filtered;
  }, [processedVideos, filters]);

  // Sort videos
  const sortedVideos = useMemo(() => {
    const sorted = [...filteredVideos];
    
    switch (sortBy) {
      case 'saves_per_1k_desc':
        return sorted.sort((a, b) => (b.saves_per_1k || 0) - (a.saves_per_1k || 0));
      case 'engagement_rate_desc':
        return sorted.sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0));
      case 'speed_2h_desc':
        return sorted.sort((a, b) => (b.speed_2h || 0) - (a.speed_2h || 0));
      case 'performance_score_desc':
        return sorted.sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0));
      case 'views_desc':
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'published_date_desc':
      default:
        return sorted.sort((a, b) => 
          new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
        );
    }
  }, [filteredVideos, sortBy]);

  // Calculate performance badges
  const calculatePerformanceBadge = (video: ProcessedVideo): PerformanceBadge => {
    const scores = processedVideos.map(v => v.performance_score || 0).sort((a, b) => b - a);
    const p90 = scores[Math.floor(scores.length * 0.1)] || 0;
    const p70 = scores[Math.floor(scores.length * 0.3)] || 0;
    const p40 = scores[Math.floor(scores.length * 0.6)] || 0;
    
    const score = video.performance_score || 0;
    
    if (score >= p90) {
      return { emoji: '🔥', label: 'Top 10%', color: 'text-red-400', percentile: 90 };
    } else if (score >= p70) {
      return { emoji: '✅', label: 'Bueno', color: 'text-green-400', percentile: 70 };
    } else if (score >= p40) {
      return { emoji: '🟠', label: 'Promedio', color: 'text-orange-400', percentile: 40 };
    } else {
      return { emoji: '❌', label: 'Bajo', color: 'text-red-400', percentile: 0 };
    }
  };

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    if (!videos) return { themes: [], ctaTypes: [], editingStyles: [] };
    
    const themes = [...new Set(videos.map(v => v.video_theme).filter(Boolean))].sort();
    const ctaTypes = [...new Set(videos.map(v => v.cta_type).filter(Boolean))].sort();
    const editingStyles = [...new Set(videos.map(v => v.editing_style).filter(Boolean))].sort();
    
    return { themes, ctaTypes, editingStyles };
  }, [videos]);

  return {
    filters,
    sortBy,
    normalizeBy1K,
    updateFilters,
    updateSort,
    updateNormalize,
    filteredVideos: sortedVideos,
    calculatePerformanceBadge,
    filterOptions,
    loading,
  };
};