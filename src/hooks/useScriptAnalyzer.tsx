import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScriptAnalysisParams {
  hook: string;
  script: string;
  cta: string;
}

export interface ScriptImprovement {
  section: 'hook' | 'script' | 'cta';
  current_text: string;
  improved_text: string;
  reason: string;
  impact_score: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ScriptAnalysisResult {
  overall_score: number;
  viral_potential: {
    hook_score: number;
    script_score: number;
    cta_score: number;
    coherence_score: number;
  };
  improvements: ScriptImprovement[];
  strengths: string[];
  risks: string[];
  similar_successful_scripts: Array<{
    hook: string;
    script_excerpt: string;
    cta: string;
    metrics: {
      saves_per_1k: number;
      f_per_1k: number;
      retention_pct: number;
      views: number;
    };
  }>;
  execution_tips: string[];
}

export function useScriptAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ScriptAnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeScript = async (params: ScriptAnalysisParams): Promise<ScriptAnalysisResult | null> => {
    if (!params.hook?.trim() && !params.script?.trim() && !params.cta?.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa al menos un componente del guión",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('script-analyzer', {
        body: params
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const result = data as ScriptAnalysisResult;
      setAnalysis(result);

      toast({
        title: "Análisis completado",
        description: "Se ha generado el análisis completo del guión",
      });

      return result;
    } catch (error) {
      console.error('Error analyzing script:', error);
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
    analyzeScript,
    clearAnalysis
  };
}