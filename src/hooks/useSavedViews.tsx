import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { SavedView, VideoFilters, SortOption } from '@/types/videos';
import { useToast } from './use-toast';

export const useSavedViews = () => {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load saved views
  const loadSavedViews = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_views')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedViews(data || []);
    } catch (error) {
      console.error('Error loading saved views:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las vistas guardadas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save a new view
  const saveView = async (
    name: string, 
    filters: VideoFilters, 
    sortBy: SortOption, 
    normalizeBy1K: boolean
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_views')
        .insert({
          user_id: user.id,
          name,
          filters,
          sort_by: sortBy,
          normalize_by_1k: normalizeBy1K,
        })
        .select()
        .single();

      if (error) throw error;

      setSavedViews(prev => [data, ...prev]);
      toast({
        title: "Vista guardada",
        description: `La vista "${name}" se guardó correctamente ✅`,
      });

      return data;
    } catch (error) {
      console.error('Error saving view:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la vista, intenta de nuevo",
        variant: "destructive",
      });
    }
  };

  // Delete a view
  const deleteView = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_views')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedViews(prev => prev.filter(view => view.id !== id));
      toast({
        title: "Vista eliminada",
        description: "La vista se eliminó correctamente ✅",
      });
    } catch (error) {
      console.error('Error deleting view:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la vista",
        variant: "destructive",
      });
    }
  };

  // Rename a view
  const renameView = async (id: string, newName: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_views')
        .update({ name: newName })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSavedViews(prev => prev.map(view => 
        view.id === id ? { ...view, name: newName } : view
      ));

      toast({
        title: "Vista renombrada",
        description: `La vista se renombró a "${newName}" ✅`,
      });

      return data;
    } catch (error) {
      console.error('Error renaming view:', error);
      toast({
        title: "Error",
        description: "No se pudo renombrar la vista",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadSavedViews();
  }, [user]);

  return {
    savedViews,
    loading,
    saveView,
    deleteView,
    renameView,
    refreshViews: loadSavedViews,
  };
};