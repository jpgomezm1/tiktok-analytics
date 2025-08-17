import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  AdvancedAnalyticsEngine, 
  ClusterAnalysis, 
  ViralPrediction, 
  ContentSimilarity, 
  AdvancedInsight,
  TimingAnalysis,
  PerformanceMatrix
} from '@/utils/advancedAnalyticsEngine';
import { Video } from '@/hooks/useVideos';

export const useAdvancedAnalytics = (videos: Video[]) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clusterAnalysis, setClusterAnalysis] = useState<ClusterAnalysis[]>([]);
  const [viralPredictions, setViralPredictions] = useState<ViralPrediction[]>([]);
  const [advancedInsights, setAdvancedInsights] = useState<AdvancedInsight[]>([]);
  const [timingAnalysis, setTimingAnalysis] = useState<TimingAnalysis | null>(null);
  const [performanceMatrix, setPerformanceMatrix] = useState<PerformanceMatrix | null>(null);
  const [hasBrainVectors, setHasBrainVectors] = useState<boolean | null>(null);

  const engine = user ? new AdvancedAnalyticsEngine(user.id) : null;

  const checkBrainVectors = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tiktok_brain_vectors')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (error) throw error;
      setHasBrainVectors((data || []).length > 0);
    } catch (error) {
      console.error('Error checking brain vectors:', error);
      setHasBrainVectors(false);
    }
  };

  const loadAdvancedAnalytics = async () => {
    if (!engine || !user || videos.length === 0) return;

    setLoading(true);
    try {
      // First check if we have brain vectors
      await checkBrainVectors();
      
      // Only load advanced analytics if we have brain vectors
      if (hasBrainVectors) {
        const [
          clusters,
          predictions,
          insights,
          timing,
          matrix
        ] = await Promise.all([
          engine.getClusterAnalysis(),
          engine.getViralPredictions(videos),
          engine.generateAdvancedInsights(),
          engine.getTimingAnalysis(),
          engine.getPerformanceMatrix()
        ]);

        setClusterAnalysis(clusters);
        setViralPredictions(predictions);
        setAdvancedInsights(insights);
        setTimingAnalysis(timing);
        setPerformanceMatrix(matrix);
      } else {
        // Reset to empty states if no brain vectors
        setClusterAnalysis([]);
        setViralPredictions([]);
        setAdvancedInsights([]);
        setTimingAnalysis(null);
        setPerformanceMatrix(null);
      }
    } catch (error) {
      console.error('Error loading advanced analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContentSimilarity = async (videoId: string): Promise<ContentSimilarity[]> => {
    if (!engine) return [];
    try {
      return await engine.getContentSimilarityAnalysis(videoId);
    } catch (error) {
      console.error('Error getting content similarity:', error);
      return [];
    }
  };

  const getTopClusters = (limit: number = 5) => {
    return clusterAnalysis
      .filter(c => c.vector_count >= 3)
      .sort((a, b) => b.optimization_score - a.optimization_score)
      .slice(0, limit);
  };

  const getHighPotentialVideos = (limit: number = 5) => {
    return viralPredictions
      .filter(p => p.confidence_score >= 60)
      .slice(0, limit);
  };

  const getCriticalInsights = () => {
    return advancedInsights
      .filter(i => i.priority === 'high' && i.confidence >= 75)
      .slice(0, 3);
  };

  const getContentGaps = () => {
    return advancedInsights
      .filter(i => i.type === 'content_gap')
      .slice(0, 3);
  };

  const getOptimalPublishingHours = () => {
    return timingAnalysis?.optimal_hours
      .filter(h => h.confidence >= 50)
      .slice(0, 3) || [];
  };

  const getBestPerformingContentTypes = () => {
    return performanceMatrix?.content_theme_performance
      .filter(t => t.video_count >= 2)
      .sort((a, b) => b.avg_views - a.avg_views)
      .slice(0, 5) || [];
  };

  // Advanced metrics calculations with fallbacks
  const getViralReadinessScore = () => {
    if (hasBrainVectors === false) {
      // Fallback calculation based on regular video data
      const viralVideos = videos.filter(v => (v.views || 0) > 50000);
      const viralRate = videos.length > 0 ? (viralVideos.length / videos.length) * 100 : 0;
      const avgEngagement = videos.length > 0 
        ? videos.reduce((sum, v) => sum + (v.engagement_rate || 0), 0) / videos.length 
        : 0;
      return Math.round((viralRate * 0.6) + (avgEngagement * 0.4));
    }
    
    if (viralPredictions.length === 0) return 0;
    
    const avgProbability = viralPredictions.reduce((sum, p) => sum + p.viral_probability, 0) / viralPredictions.length;
    const highConfidenceCount = viralPredictions.filter(p => p.confidence_score >= 70).length;
    const readinessScore = (avgProbability * 0.7) + ((highConfidenceCount / viralPredictions.length) * 30);
    
    return Math.round(readinessScore);
  };

  const getContentDiversityScore = () => {
    if (hasBrainVectors === false) {
      // Fallback calculation based on video types and themes
      const uniqueTypes = new Set(videos.map(v => v.video_type).filter(Boolean));
      const uniqueThemes = new Set(videos.map(v => v.video_theme).filter(Boolean));
      const typeScore = Math.min(40, uniqueTypes.size * 10);
      const themeScore = Math.min(40, uniqueThemes.size * 8);
      const volumeScore = Math.min(20, videos.length * 2);
      return Math.round(typeScore + themeScore + volumeScore);
    }
    
    if (clusterAnalysis.length === 0) return 0;
    
    const activeViewers = clusterAnalysis.reduce((sum, c) => sum + c.vector_count, 0);
    const clusterBalance = clusterAnalysis.length >= 3 ? 25 : (clusterAnalysis.length * 8);
    const performanceBalance = clusterAnalysis.filter(c => c.optimization_score >= 70).length * 15;
    
    return Math.min(100, clusterBalance + performanceBalance + (activeViewers > 20 ? 25 : activeViewers));
  };

  const getOptimizationOpportunities = () => {
    const opportunities = [];
    
    // Cluster optimization opportunities
    const lowPerformingClusters = clusterAnalysis.filter(c => 
      c.optimization_score < 60 && c.vector_count >= 3
    );
    
    opportunities.push(...lowPerformingClusters.map(cluster => ({
      type: 'cluster_optimization',
      title: `Optimizar cluster "${cluster.cluster_name}"`,
      description: `${cluster.vector_count} videos con potencial de mejora`,
      priority: 'medium' as const,
      potential_improvement: `+${Math.round((70 - cluster.optimization_score) * 0.8)}% performance`
    })));

    // Viral prediction opportunities
    const nearViralVideos = viralPredictions.filter(p => 
      p.viral_probability >= 0.6 && p.confidence_score >= 65
    );
    
    opportunities.push(...nearViralVideos.map(prediction => ({
      type: 'viral_opportunity',
      title: `Boost viral potential: "${prediction.title.substring(0, 30)}..."`,
      description: `${Math.round(prediction.viral_probability * 100)}% probabilidad viral`,
      priority: 'high' as const,
      potential_improvement: `${prediction.predicted_views.toLocaleString()} views estimadas`
    })));

    return opportunities.slice(0, 8);
  };

  useEffect(() => {
    if (user && videos.length > 0) {
      loadAdvancedAnalytics();
    }
  }, [user, videos.length]);

  return {
    loading,
    hasBrainVectors,
    clusterAnalysis,
    viralPredictions,
    advancedInsights,
    timingAnalysis,
    performanceMatrix,
    
    // Convenience methods
    getContentSimilarity,
    getTopClusters,
    getHighPotentialVideos,
    getCriticalInsights,
    getContentGaps,
    getOptimalPublishingHours,
    getBestPerformingContentTypes,
    
    // Advanced metrics
    getViralReadinessScore,
    getContentDiversityScore,
    getOptimizationOpportunities,
    
    // Refresh function
    refreshAnalytics: loadAdvancedAnalytics
  };
};