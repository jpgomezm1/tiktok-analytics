import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IdeaOutcome {
  idea_id: string;
  idea_text: string;
  idea_type: 'hook' | 'guion' | 'cta';
  idea_mode: 'exploit' | 'explore';
  published_video_id?: string;
  expected_metrics?: {
    saves_per_1k?: number;
    f_per_1k?: number;
    retention_pct?: number;
    views?: number;
  };
  actual_metrics?: {
    saves_per_1k?: number;
    f_per_1k?: number;
    retention_pct?: number;
    views?: number;
  };
  outcome: 'win' | 'loss' | 'neutral';
  feedback_notes?: string;
}

export function useIdeaFeedback() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const recordOutcome = async (outcome: IdeaOutcome): Promise<boolean> => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Insert feedback record
      const { error: feedbackError } = await supabase
        .from('content_ideas_feedback')
        .insert([{
          user_id: user.user.id,
          idea_id: outcome.idea_id,
          idea_text: outcome.idea_text,
          idea_type: outcome.idea_type,
          idea_mode: outcome.idea_mode,
          published_video_id: outcome.published_video_id,
          expected_metrics: outcome.expected_metrics,
          actual_metrics: outcome.actual_metrics,
          outcome: outcome.outcome,
          feedback_notes: outcome.feedback_notes
        }]);

      if (feedbackError) {
        throw feedbackError;
      }

      // Update account context weights based on outcome
      if (outcome.outcome === 'win' && outcome.actual_metrics) {
        await updateContextWeights(user.user.id, outcome);
      }

      toast({
        title: "Feedback registrado",
        description: "Tu feedback ayudará a mejorar futuras sugerencias",
      });

      return true;
    } catch (error) {
      console.error('Error recording feedback:', error);
      toast({
        title: "Error al registrar feedback",
        description: error instanceof Error ? error.message : "Error inesperado",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update context weights based on successful outcomes
  const updateContextWeights = async (userId: string, outcome: IdeaOutcome) => {
    try {
      // Get current context
      const { data: context } = await supabase
        .from('tiktok_account_contexts')
        .select('weights')
        .eq('user_id', userId)
        .maybeSingle();

      if (!context || !outcome.actual_metrics) return;

      const currentWeights = (context.weights as any) || {
        retention: 0.3,
        saves: 0.5,
        follows: 0.2,
        fyp: 0.0
      };

      // Small learning rate for weight adjustments
      const learningRate = 0.05;
      const newWeights = { 
        retention: currentWeights.retention || 0.3,
        saves: currentWeights.saves || 0.5,
        follows: currentWeights.follows || 0.2,
        fyp: currentWeights.fyp || 0.0
      };

      // Increase weights for metrics that performed well
      if (outcome.actual_metrics.saves_per_1k && outcome.actual_metrics.saves_per_1k > 2) {
        newWeights.saves = Math.min(1.0, newWeights.saves + learningRate);
      }
      
      if (outcome.actual_metrics.f_per_1k && outcome.actual_metrics.f_per_1k > 1) {
        newWeights.follows = Math.min(1.0, newWeights.follows + learningRate);
      }

      if (outcome.actual_metrics.retention_pct && outcome.actual_metrics.retention_pct > 70) {
        newWeights.retention = Math.min(1.0, newWeights.retention + learningRate);
      }

      // Normalize weights to sum to 1
      const totalWeight = newWeights.retention + newWeights.saves + newWeights.follows + newWeights.fyp;
      if (totalWeight > 0) {
        newWeights.retention /= totalWeight;
        newWeights.saves /= totalWeight;
        newWeights.follows /= totalWeight;
        newWeights.fyp /= totalWeight;
      }

      // Update context with new weights
      await supabase
        .from('tiktok_account_contexts')
        .update({ weights: newWeights })
        .eq('user_id', userId);

    } catch (error) {
      console.error('Error updating weights:', error);
    }
  };

  const getFeedbackHistory = async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('content_ideas_feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching feedback history:', error);
      return [];
    }
  };

  return {
    loading,
    recordOutcome,
    getFeedbackHistory
  };
}