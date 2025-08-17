import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContentIdea {
  id: string;
  text: string;
  justification: string;
  mode: 'exploit' | 'explore';
  confidence: number;
  examples: Array<{
    content: string;
    video_id: string;
    metrics: {
      saves_per_1k: number;
      f_per_1k: number;
      retention_pct: number;
      views: number;
    };
  }>;
}

export interface ContentIdeasResponse {
  ideas: ContentIdea[];
  facets: {
    themes: string[];
    cta_types: string[];
    editing_styles: string[];
  };
  total_generated: number;
  generation_time_ms: number;
}

export interface GenerateIdeasParams {
  query?: string;
  type: 'hook' | 'guion' | 'cta';
  topK?: number;
  mode?: 'exploit' | 'explore' | 'mixed';
}

export interface IdeaFeedback {
  idea_id: string;
  idea_text: string;
  idea_type: 'hook' | 'guion' | 'cta';
  idea_mode: 'exploit' | 'explore';
  published_video_id?: string;
  expected_metrics?: any;
  actual_metrics?: any;
  outcome: 'success' | 'failure' | 'neutral';
  feedback_notes?: string;
}

export function useContentIdeas() {
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ContentIdeasResponse | null>(null);
  const { toast } = useToast();

  const generateIdeas = async (params: GenerateIdeasParams): Promise<ContentIdeasResponse | null> => {
    if (!params.type) {
      toast({
        title: "Error",
        description: "Tipo de contenido requerido",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('content-ideas', {
        body: params
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const response = data as ContentIdeasResponse;
      setIdeas(response);

      toast({
        title: "Ideas generadas",
        description: `Se generaron ${response.ideas.length} ideas en ${response.generation_time_ms}ms`,
      });

      return response;
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast({
        title: "Error al generar ideas",
        description: error instanceof Error ? error.message : "Error inesperado",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (feedback: IdeaFeedback): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('content_ideas_feedback')
        .insert([{ ...feedback, user_id: user.user.id }]);

      if (error) {
        throw error;
      }

      toast({
        title: "Feedback guardado",
        description: "Tu feedback ayudará a mejorar futuras sugerencias",
      });

      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error al guardar feedback",
        description: error instanceof Error ? error.message : "Error inesperado",
        variant: "destructive"
      });
      return false;
    }
  };

  const getFeedbackHistory = async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('content_ideas_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching feedback history:', error);
      return [];
    }
  };

  const clearIdeas = () => {
    setIdeas(null);
  };

  return {
    loading,
    ideas,
    generateIdeas,
    submitFeedback,
    getFeedbackHistory,
    clearIdeas
  };
}