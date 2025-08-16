import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BrainSearchParams {
  query: string;
  topK?: number;
  filter?: {
    contentTypes?: Array<'hook'|'cta'|'guion'>;
    dateFrom?: string;
    dateTo?: string;
    minViews?: number;
    vertical?: string;
  }
}

export interface BrainHit {
  id: string;
  video_id: string;
  content_type: 'hook'|'cta'|'guion';
  content: string;
  score: number;
  metrics: {
    retention_pct?: number;
    saves_per_1k?: number;
    f_per_1k?: number;
    for_you_pct?: number;
    views?: number;
    duration_seconds?: number;
    video_type?: string;
    published_date?: string;
  }
}

export interface BrainFacets {
  topHookPatterns: Array<{pattern: string; count: number; avgF1k: number}>;
  topCtaPatterns: Array<{pattern: string; count: number; avgF1k: number}>;
  durationBuckets: Array<{bucket: '<20s'|'20-40s'|'>40s'; avgRetention: number; avgF1k: number}>;
}

export const useTikTokBrain = () => {
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);

  const searchBrain = async (params: BrainSearchParams): Promise<BrainHit[]> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('brain-search', {
        body: {
          userId: user.id,
          ...params
        }
      });

      if (error) throw error;
      return data?.hits || [];
    } catch (error) {
      console.error('Error searching brain:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const indexVideo = async (videoId: string): Promise<boolean> => {
    setIndexing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('brain-indexer', {
        body: {
          videoId,
          userId: user.id
        }
      });

      if (error) throw error;
      return data?.success || false;
    } catch (error) {
      console.error('Error indexing video:', error);
      return false;
    } finally {
      setIndexing(false);
    }
  };

  const reindexAllContent = async (): Promise<{ success: boolean; indexedCount?: number }> => {
    setIndexing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('brain-indexer', {
        body: {
          userId: user.id,
          reindexAll: true
        }
      });

      if (error) throw error;
      return { 
        success: data?.success || false, 
        indexedCount: data?.indexedCount 
      };
    } catch (error) {
      console.error('Error reindexing content:', error);
      return { success: false };
    } finally {
      setIndexing(false);
    }
  };

  const getBrainFacets = async (dateRange?: {from?: string; to?: string}): Promise<BrainFacets> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get content patterns from vectors
      let query = supabase
        .from('tiktok_brain_vectors')
        .select('content_type, content, f_per_1k, retention_pct, duration_seconds')
        .eq('user_id', user.id);

      if (dateRange?.from) {
        query = query.gte('published_date', dateRange.from);
      }
      if (dateRange?.to) {
        query = query.lte('published_date', dateRange.to);
      }

      const { data: vectors, error } = await query;
      if (error) throw error;

      // Analyze patterns
      const hookPatterns = new Map<string, {count: number, f1kSum: number}>();
      const ctaPatterns = new Map<string, {count: number, f1kSum: number}>();
      const durationBuckets = new Map<string, {retentionSum: number, f1kSum: number, count: number}>();

      (vectors || []).forEach(vector => {
        const f1k = vector.f_per_1k || 0;
        const retention = vector.retention_pct || 0;
        const duration = vector.duration_seconds || 0;

        // Pattern analysis (simplified)
        if (vector.content_type === 'hook') {
          const pattern = vector.content.toLowerCase().includes('?') ? 'Pregunta' : 
                         vector.content.toLowerCase().includes('cómo') ? 'Tutorial' : 'Directo';
          const existing = hookPatterns.get(pattern) || {count: 0, f1kSum: 0};
          hookPatterns.set(pattern, {
            count: existing.count + 1,
            f1kSum: existing.f1kSum + f1k
          });
        }

        if (vector.content_type === 'cta') {
          const pattern = vector.content.toLowerCase().includes('sígueme') ? 'Follow directo' :
                         vector.content.toLowerCase().includes('comenta') ? 'Engagement' : 'Otro';
          const existing = ctaPatterns.get(pattern) || {count: 0, f1kSum: 0};
          ctaPatterns.set(pattern, {
            count: existing.count + 1,
            f1kSum: existing.f1kSum + f1k
          });
        }

        // Duration buckets
        const bucket = duration < 20 ? '<20s' : duration <= 40 ? '20-40s' : '>40s';
        const existing = durationBuckets.get(bucket) || {retentionSum: 0, f1kSum: 0, count: 0};
        durationBuckets.set(bucket, {
          retentionSum: existing.retentionSum + retention,
          f1kSum: existing.f1kSum + f1k,
          count: existing.count + 1
        });
      });

      return {
        topHookPatterns: Array.from(hookPatterns.entries()).map(([pattern, data]) => ({
          pattern,
          count: data.count,
          avgF1k: data.count > 0 ? data.f1kSum / data.count : 0
        })).sort((a, b) => b.avgF1k - a.avgF1k).slice(0, 5),

        topCtaPatterns: Array.from(ctaPatterns.entries()).map(([pattern, data]) => ({
          pattern,
          count: data.count,
          avgF1k: data.count > 0 ? data.f1kSum / data.count : 0
        })).sort((a, b) => b.avgF1k - a.avgF1k).slice(0, 5),

        durationBuckets: Array.from(durationBuckets.entries()).map(([bucket, data]) => ({
          bucket: bucket as '<20s'|'20-40s'|'>40s',
          avgRetention: data.count > 0 ? data.retentionSum / data.count : 0,
          avgF1k: data.count > 0 ? data.f1kSum / data.count : 0
        }))
      };
    } catch (error) {
      console.error('Error getting brain facets:', error);
      return {
        topHookPatterns: [],
        topCtaPatterns: [],
        durationBuckets: []
      };
    }
  };

  return {
    loading,
    indexing,
    searchBrain,
    indexVideo,
    reindexAllContent,
    getBrainFacets
  };
};