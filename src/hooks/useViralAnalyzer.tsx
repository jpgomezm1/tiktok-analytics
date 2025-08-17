import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ViralAnalysisParams {
  content: string;
  content_type: 'hook' | 'guion' | 'cta';
}

export interface ViralAnalysisResult {
  input: string;
  analysis: {
    probabilities: {
      P_top10_views: number;
      P_saves_p90: number;
      P_follow_p90: number;
    };
    positives: string[];
    risks: string[];
    neighbors_used: Array<{
      content: string;
      metrics: {
        saves_per_1k: number;
        f_per_1k: number;
        retention_pct: number;
        views: number;
      };
    }>;
  };
  variants: Array<{
    version: 'clickbait' | 'benefit_led' | 'contrarian';
    text: string;
    recommended: 'exploit' | 'explore';
    why_variant: string;
  }>;
  guardrail_adjusted: boolean;
}

export function useViralAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ViralAnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeContent = async (params: ViralAnalysisParams): Promise<ViralAnalysisResult | null> => {
    if (!params.content?.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa contenido para analizar",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('viral-analyzer', {
        body: params
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const result = data as ViralAnalysisResult;
      setAnalysis(result);

      toast({
        title: "Análisis completado",
        description: "Se ha generado el análisis de potencial viral",
      });

      return result;
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast({
        title: "Error en el análisis",
        description: error instanceof Error ? error.message : "Error inesperado",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
  };

  return {
    loading,
    analysis,
    analyzeContent,
    clearAnalysis
  };
}