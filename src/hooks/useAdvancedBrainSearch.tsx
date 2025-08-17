import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BrainSearchParams {
  query: string;
  topK?: number;
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    minViews?: number;
    contentTypes?: string[];
    video_theme?: string;
    cta_type?: string;
    editing_style?: string;
    durationBuckets?: string[];
  };
  language?: 'es' | 'en';
  diversityBoost?: boolean;
}

export interface BrainSearchResult {
  video_id: string;
  section_tag: string;
  content: string;
  metrics: {
    views: number;
    retention_pct: number;
    saves_per_1k: number;
    f_per_1k: number;
    for_you_pct: number;
    duration_seconds: number;
    published_date: string;
  };
  score: {
    sim_final: number;
    z_ret: number;
    z_saves: number;
    z_follows: number;
    z_fyp: number;
    time_decay: number;
    final_score: number;
  };
  why_this: string;
  video_theme?: string;
  cta_type?: string;
  editing_style?: string;
  tone_style?: string;
}

export interface BrainSearchResponse {
  results: BrainSearchResult[];
  facets: {
    video_themes: Array<{ value: string; count: number; percentage: number }>;
    cta_types: Array<{ value: string; count: number; percentage: number }>;
    editing_styles: Array<{ value: string; count: number; percentage: number }>;
    duration_buckets: Array<{ range: string; count: number; avg_performance: number }>;
    metrics_percentiles: {
      retention_pct: { p50: number; p75: number; p90: number };
      saves_per_1k: { p50: number; p75: number; p90: number };
      f_per_1k: { p50: number; p75: number; p90: number };
    };
  };
  filters_applied: any;
  total_results: number;
  search_time_ms: number;
}

export function useAdvancedBrainSearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BrainSearchResponse | null>(null);
  const { toast } = useToast();

  const searchBrain = async (params: BrainSearchParams): Promise<BrainSearchResponse | null> => {
    if (!params.query?.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una consulta de búsqueda",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('brain-search', {
        body: params
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const searchResults = data as BrainSearchResponse;
      setResults(searchResults);

      if (searchResults.results.length === 0) {
        toast({
          title: "Sin resultados",
          description: "No se encontraron contenidos que coincidan con tu búsqueda. Intenta con términos diferentes.",
        });
      } else {
        toast({
          title: "Búsqueda completada",
          description: `Se encontraron ${searchResults.results.length} resultados en ${searchResults.search_time_ms}ms`,
        });
      }

      return searchResults;
    } catch (error) {
      console.error('Error searching brain:', error);
      toast({
        title: "Error en la búsqueda",
        description: error instanceof Error ? error.message : "Error inesperado al buscar",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
  };

  return {
    loading,
    results,
    searchBrain,
    clearResults
  };
}