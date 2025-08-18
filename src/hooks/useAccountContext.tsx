import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AudiencePersona {
  persona: string;
  pains: string[];
  desires: string[];
}

export interface AccountContext {
  mission?: string;
  brand_pillars?: string[];
  positioning?: string;
  audience_personas?: AudiencePersona[];
  do_not_do?: string[];
  tone_guide?: string;
  content_themes?: string[];
  north_star_metric?: string;
  secondary_metrics?: string[];
  strategic_bets?: string[];
  negative_keywords?: string[];
  weights?: {
    retention: number;
    saves: number;
    follows: number;
  };
}

export function useAccountContext() {
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<AccountContext | null>(null);
  const { toast } = useToast();

  const saveContext = async (contextData: AccountContext): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('account-context', {
        body: {
          action: 'save',
          context: contextData
        }
      });

      if (error) throw error;

      if (data?.success) {
        setContext(data.context);
        toast({
          title: "Contexto guardado",
          description: "El contexto de tu cuenta se ha guardado exitosamente",
        });
        return true;
      } else {
        throw new Error(data?.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error saving context:', error);
      console.error('Full error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Extract more specific error information
      let errorMessage = "Error al guardar el contexto";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        if ('details' in error) {
          errorMessage += `: ${error.details}`;
        }
        if ('message' in error) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getContext = async (): Promise<AccountContext | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('account-context', {
        body: {
          action: 'get'
        }
      });

      if (error) throw error;

      if (data?.success) {
        setContext(data.context);
        return data.context;
      } else {
        throw new Error(data?.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error fetching context:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al obtener el contexto",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    context,
    loading,
    saveContext,
    getContext
  };
}