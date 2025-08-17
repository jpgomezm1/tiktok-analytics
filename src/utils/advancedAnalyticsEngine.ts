import { supabase } from '@/integrations/supabase/client';
import { Video } from '@/hooks/useVideos';

export interface ClusterAnalysis {
  cluster_id: string;
  cluster_name: string;
  avg_performance: number;
  vector_count: number;
  content_type: string;
  top_videos: Array<{
    video_id: string;
    title: string;
    views: number;
    retention_pct: number;
    saves_per_1k: number;
  }>;
  performance_trend: 'improving' | 'declining' | 'stable';
  optimization_score: number;
}

export interface ViralPrediction {
  video_id: string;
  title: string;
  viral_probability: number;
  predicted_views: number;
  confidence_score: number;
  similar_successful_videos: string[];
  key_factors: string[];
}

export interface ContentSimilarity {
  video_id: string;
  title: string;
  similarity_score: number;
  shared_themes: string[];
  performance_comparison: {
    target_performance: number;
    similar_avg_performance: number;
    improvement_potential: number;
  };
}

export interface AdvancedInsight {
  id: string;
  type: 'cluster_opportunity' | 'viral_prediction' | 'content_gap' | 'performance_anomaly';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  action_items: string[];
  data_source: 'brain_vectors' | 'growth_insights' | 'clustering' | 'similarity_analysis';
  affected_videos?: string[];
  potential_impact: string;
}

export interface TimingAnalysis {
  optimal_hours: Array<{
    hour: number;
    avg_performance: number;
    video_count: number;
    confidence: number;
  }>;
  day_of_week_analysis: Array<{
    day: string;
    avg_views: number;
    avg_engagement: number;
    video_count: number;
  }>;
  publishing_velocity_analysis: {
    optimal_frequency: number;
    current_frequency: number;
    recommendation: string;
  };
}

export interface PerformanceMatrix {
  retention_vs_saves: Array<{
    retention: number;
    saves_per_1k: number;
    views: number;
    title: string;
    quadrant: 'high_retention_high_saves' | 'high_retention_low_saves' | 'low_retention_high_saves' | 'low_retention_low_saves';
  }>;
  duration_sweet_spot: {
    optimal_range: { min: number; max: number };
    current_avg: number;
    performance_by_duration: Array<{
      duration_range: string;
      avg_performance: number;
      video_count: number;
    }>;
  };
  content_theme_performance: Array<{
    theme: string;
    avg_views: number;
    avg_retention: number;
    avg_saves_per_1k: number;
    video_count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export class AdvancedAnalyticsEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getClusterAnalysis(): Promise<ClusterAnalysis[]> {
    const { data: clusters, error } = await supabase
      .from('tiktok_brain_clusters')
      .select(`
        id,
        cluster_name,
        avg_performance,
        vector_count,
        content_type,
        created_at,
        updated_at
      `)
      .eq('user_id', this.userId)
      .order('avg_performance', { ascending: false });

    if (error) throw error;

    const analysis: ClusterAnalysis[] = [];

    for (const cluster of clusters || []) {
      // Get top videos from this cluster
      const { data: clusterVideos } = await supabase
        .from('tiktok_brain_vectors')
        .select(`
          video_id,
          content,
          views,
          retention_pct,
          saves_per_1k,
          published_date
        `)
        .eq('cluster_id', cluster.id)
        .eq('user_id', this.userId)
        .order('views', { ascending: false })
        .limit(5);

      // Calculate performance trend
      const sortedByDate = (clusterVideos || [])
        .sort((a, b) => new Date(a.published_date || '').getTime() - new Date(b.published_date || '').getTime());
      
      const firstHalf = sortedByDate.slice(0, Math.ceil(sortedByDate.length / 2));
      const secondHalf = sortedByDate.slice(Math.ceil(sortedByDate.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, v) => sum + (v.views || 0), 0) / Math.max(firstHalf.length, 1);
      const secondHalfAvg = secondHalf.reduce((sum, v) => sum + (v.views || 0), 0) / Math.max(secondHalf.length, 1);
      
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (secondHalfAvg > firstHalfAvg * 1.1) trend = 'improving';
      else if (secondHalfAvg < firstHalfAvg * 0.9) trend = 'declining';

      // Calculate optimization score
      const avgRetention = (clusterVideos || []).reduce((sum, v) => sum + (v.retention_pct || 0), 0) / Math.max((clusterVideos || []).length, 1);
      const avgSaves = (clusterVideos || []).reduce((sum, v) => sum + (v.saves_per_1k || 0), 0) / Math.max((clusterVideos || []).length, 1);
      const optimizationScore = Math.min(100, (avgRetention * 0.6) + (avgSaves * 0.4));

      analysis.push({
        cluster_id: cluster.id,
        cluster_name: cluster.cluster_name || `Cluster ${cluster.id.slice(0, 8)}`,
        avg_performance: cluster.avg_performance || 0,
        vector_count: cluster.vector_count || 0,
        content_type: cluster.content_type || 'unknown',
        top_videos: (clusterVideos || []).map(v => ({
          video_id: v.video_id,
          title: v.content.substring(0, 50) + '...',
          views: v.views || 0,
          retention_pct: v.retention_pct || 0,
          saves_per_1k: v.saves_per_1k || 0
        })),
        performance_trend: trend,
        optimization_score: optimizationScore
      });
    }

    return analysis;
  }

  async getViralPredictions(videos: Video[]): Promise<ViralPrediction[]> {
    const predictions: ViralPrediction[] = [];

    // Get successful patterns from brain vectors
    const { data: successfulVectors } = await supabase
      .from('tiktok_brain_vectors')
      .select(`
        video_id,
        content,
        views,
        retention_pct,
        saves_per_1k,
        for_you_pct,
        video_theme,
        cta_type,
        editing_style,
        tone_style
      `)
      .eq('user_id', this.userId)
      .gte('views', 50000)
      .order('views', { ascending: false })
      .limit(20);

    for (const video of videos.slice(0, 10)) {
      // Find similar successful content
      const { data: similarVectors } = await supabase
        .from('tiktok_brain_vectors')
        .select(`
          video_id,
          content,
          views,
          similarity_score,
          video_theme,
          cta_type,
          editing_style
        `)
        .eq('user_id', this.userId)
        .eq('video_id', video.id)
        .limit(1);

      if (similarVectors && similarVectors.length > 0) {
        const vector = similarVectors[0];
        
        // Find similar successful videos by theme, CTA, and editing style
        const similarSuccessful = (successfulVectors || []).filter(sv => 
          sv.video_theme === vector.video_theme ||
          sv.cta_type === vector.cta_type ||
          sv.editing_style === vector.editing_style
        );

        if (similarSuccessful.length > 0) {
          const avgSuccessfulViews = similarSuccessful.reduce((sum, sv) => sum + (sv.views || 0), 0) / similarSuccessful.length;
          const avgSuccessfulRetention = similarSuccessful.reduce((sum, sv) => sum + (sv.retention_pct || 0), 0) / similarSuccessful.length;
          
          // Calculate viral probability based on content similarity and current performance
          const currentViews = video.views || 0;
          const currentRetention = video.duration_seconds > 0 ? (video.avg_time_watched / video.duration_seconds) * 100 : 0;
          
          const viewsScore = Math.min(100, (currentViews / avgSuccessfulViews) * 100);
          const retentionScore = avgSuccessfulRetention > 0 ? (currentRetention / avgSuccessfulRetention) * 100 : 50;
          const themeMatch = similarSuccessful.filter(sv => sv.video_theme === vector.video_theme).length;
          const ctaMatch = similarSuccessful.filter(sv => sv.cta_type === vector.cta_type).length;
          
          const viralProbability = Math.min(100, 
            (viewsScore * 0.4) + 
            (retentionScore * 0.3) + 
            (themeMatch > 0 ? 25 : 0) + 
            (ctaMatch > 0 ? 25 : 0)
          ) / 100;

          const predictedViews = currentViews < 10000 ? avgSuccessfulViews * viralProbability : currentViews * 1.5;
          const confidence = Math.min(95, similarSuccessful.length * 15);

          const keyFactors = [];
          if (themeMatch > 0) keyFactors.push(`Tema exitoso: ${vector.video_theme}`);
          if (ctaMatch > 0) keyFactors.push(`CTA efectivo: ${vector.cta_type}`);
          if (retentionScore > 80) keyFactors.push('Alta retención');
          if (currentViews > avgSuccessfulViews * 0.5) keyFactors.push('Tracción inicial fuerte');

          predictions.push({
            video_id: video.id,
            title: video.title,
            viral_probability: viralProbability,
            predicted_views: Math.round(predictedViews),
            confidence_score: confidence,
            similar_successful_videos: similarSuccessful.slice(0, 3).map(sv => sv.video_id),
            key_factors: keyFactors
          });
        }
      }
    }

    return predictions.sort((a, b) => b.viral_probability - a.viral_probability);
  }

  async getContentSimilarityAnalysis(targetVideoId: string): Promise<ContentSimilarity[]> {
    // Get the target video's brain vector
    const { data: targetVector } = await supabase
      .from('tiktok_brain_vectors')
      .select('*')
      .eq('video_id', targetVideoId)
      .eq('user_id', this.userId)
      .maybeSingle();

    if (!targetVector) return [];

    // Find similar videos based on themes, CTA, and editing style
    const { data: similarVectors } = await supabase
      .from('tiktok_brain_vectors')
      .select(`
        video_id,
        content,
        views,
        retention_pct,
        saves_per_1k,
        video_theme,
        cta_type,
        editing_style,
        tone_style
      `)
      .eq('user_id', this.userId)
      .neq('video_id', targetVideoId)
      .order('views', { ascending: false });

    const similarities: ContentSimilarity[] = [];

    for (const vector of similarVectors || []) {
      let similarityScore = 0;
      const sharedThemes: string[] = [];

      // Calculate similarity based on content attributes
      if (vector.video_theme === targetVector.video_theme && vector.video_theme) {
        similarityScore += 30;
        sharedThemes.push(`Tema: ${vector.video_theme}`);
      }
      
      if (vector.cta_type === targetVector.cta_type && vector.cta_type) {
        similarityScore += 25;
        sharedThemes.push(`CTA: ${vector.cta_type}`);
      }
      
      if (vector.editing_style === targetVector.editing_style && vector.editing_style) {
        similarityScore += 25;
        sharedThemes.push(`Edición: ${vector.editing_style}`);
      }
      
      if (vector.tone_style === targetVector.tone_style && vector.tone_style) {
        similarityScore += 20;
        sharedThemes.push(`Tono: ${vector.tone_style}`);
      }

      // Only include videos with meaningful similarity
      if (similarityScore >= 25 && sharedThemes.length > 0) {
        const targetPerformance = (targetVector.views || 0);
        const similarPerformance = (vector.views || 0);
        const improvementPotential = similarPerformance > targetPerformance 
          ? ((similarPerformance - targetPerformance) / targetPerformance) * 100 
          : 0;

        similarities.push({
          video_id: vector.video_id,
          title: vector.content.substring(0, 60) + '...',
          similarity_score: similarityScore,
          shared_themes: sharedThemes,
          performance_comparison: {
            target_performance: targetPerformance,
            similar_avg_performance: similarPerformance,
            improvement_potential: Math.round(improvementPotential)
          }
        });
      }
    }

    return similarities
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, 10);
  }

  async generateAdvancedInsights(): Promise<AdvancedInsight[]> {
    const insights: AdvancedInsight[] = [];

    // 1. Cluster Opportunity Analysis
    const clusters = await this.getClusterAnalysis();
    const topCluster = clusters.find(c => c.avg_performance > 80 && c.vector_count >= 3);
    
    if (topCluster) {
      insights.push({
        id: 'cluster-opportunity-' + topCluster.cluster_id,
        type: 'cluster_opportunity',
        title: `Duplicar contenido del cluster "${topCluster.cluster_name}"`,
        description: `Este cluster tiene ${topCluster.vector_count} videos con ${topCluster.avg_performance.toFixed(1)}% de performance promedio.`,
        priority: 'high',
        confidence: Math.min(95, topCluster.vector_count * 10),
        action_items: [
          `Crear más contenido similar al cluster "${topCluster.cluster_name}"`,
          `Analizar los elementos comunes en los top videos del cluster`,
          `Implementar el mismo estilo de edición y tono`
        ],
        data_source: 'clustering',
        affected_videos: topCluster.top_videos.map(v => v.video_id),
        potential_impact: `Potencial aumento de ${Math.round(topCluster.avg_performance * 0.8)}% en views`
      });
    }

    // 2. Content Gap Analysis
    const { data: themePerformance } = await supabase
      .from('tiktok_brain_vectors')
      .select('video_theme, views, retention_pct')
      .eq('user_id', this.userId)
      .not('video_theme', 'is', null);

    const themeGroups = (themePerformance || []).reduce((acc, vector) => {
      const theme = vector.video_theme || 'unknown';
      if (!acc[theme]) acc[theme] = [];
      acc[theme].push(vector);
      return acc;
    }, {} as Record<string, any[]>);

    const themeStats = Object.entries(themeGroups).map(([theme, vectors]) => ({
      theme,
      count: vectors.length,
      avgViews: vectors.reduce((sum, v) => sum + (v.views || 0), 0) / vectors.length,
      avgRetention: vectors.reduce((sum, v) => sum + (v.retention_pct || 0), 0) / vectors.length
    }));

    const underExploredThemes = themeStats
      .filter(t => t.count <= 2 && t.avgViews > 10000)
      .sort((a, b) => b.avgViews - a.avgViews);

    if (underExploredThemes.length > 0) {
      const theme = underExploredThemes[0];
      insights.push({
        id: 'content-gap-' + theme.theme,
        type: 'content_gap',
        title: `Explorar más contenido de "${theme.theme}"`,
        description: `Solo tienes ${theme.count} videos de este tema, pero obtienen ${theme.avgViews.toLocaleString()} views promedio.`,
        priority: 'medium',
        confidence: 75,
        action_items: [
          `Crear 3-5 videos más del tema "${theme.theme}"`,
          'Analizar qué elementos específicos funcionan en este tema',
          'Experimentar con diferentes CTAs para este tipo de contenido'
        ],
        data_source: 'brain_vectors',
        potential_impact: `Potencial de ${Math.round(theme.avgViews * theme.count * 0.5).toLocaleString()} views adicionales`
      });
    }

    // 3. Performance Anomaly Detection
    const { data: recentGrowthInsights } = await supabase
      .from('growth_insights')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_active', true)
      .gte('date_generated', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('confidence_score', { ascending: false })
      .limit(3);

    for (const insight of recentGrowthInsights || []) {
      if (insight.confidence_score && insight.confidence_score > 70) {
        insights.push({
          id: 'growth-insight-' + insight.id,
          type: 'performance_anomaly',
          title: insight.title,
          description: insight.description || '',
          priority: insight.metric_impact && insight.metric_impact > 20 ? 'high' : 'medium',
          confidence: insight.confidence_score,
          action_items: [
            'Revisar los videos afectados por este insight',
            'Implementar las recomendaciones sugeridas',
            'Monitorear el impacto de los cambios'
          ],
          data_source: 'growth_insights',
          affected_videos: insight.affected_video_ids || [],
          potential_impact: insight.metric_impact ? `${insight.metric_impact}% mejora estimada` : 'Impacto por determinar'
        });
      }
    }

    return insights.slice(0, 8);
  }

  async getTimingAnalysis(): Promise<TimingAnalysis> {
    // Get video performance by publish time patterns
    const { data: vectors } = await supabase
      .from('tiktok_brain_vectors')
      .select(`
        published_date,
        views,
        retention_pct,
        saves_per_1k,
        comments,
        likes,
        shares
      `)
      .eq('user_id', this.userId)
      .not('published_date', 'is', null)
      .gte('views', 100);

    const hourlyData: Record<number, { views: number[]; engagement: number[]; count: number }> = {};
    const dailyData: Record<string, { views: number[]; engagement: number[]; count: number }> = {};

    for (const vector of vectors || []) {
      const date = new Date(vector.published_date!);
      const hour = date.getHours();
      const dayOfWeek = date.toLocaleDateString('es-ES', { weekday: 'long' });
      
      const views = vector.views || 0;
      const engagement = views > 0 ? ((vector.likes + vector.comments + vector.shares) / views) * 100 : 0;

      // Hourly analysis
      if (!hourlyData[hour]) hourlyData[hour] = { views: [], engagement: [], count: 0 };
      hourlyData[hour].views.push(views);
      hourlyData[hour].engagement.push(engagement);
      hourlyData[hour].count++;

      // Daily analysis
      if (!dailyData[dayOfWeek]) dailyData[dayOfWeek] = { views: [], engagement: [], count: 0 };
      dailyData[dayOfWeek].views.push(views);
      dailyData[dayOfWeek].engagement.push(engagement);
      dailyData[dayOfWeek].count++;
    }

    // Calculate optimal hours
    const optimal_hours = Object.entries(hourlyData)
      .filter(([_, data]) => data.count >= 2)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        avg_performance: (
          data.views.reduce((sum, v) => sum + v, 0) / data.views.length +
          data.engagement.reduce((sum, e) => sum + e, 0) / data.engagement.length
        ) / 2,
        video_count: data.count,
        confidence: Math.min(90, data.count * 20)
      }))
      .sort((a, b) => b.avg_performance - a.avg_performance);

    // Calculate day of week analysis
    const day_of_week_analysis = Object.entries(dailyData)
      .map(([day, data]) => ({
        day,
        avg_views: data.views.reduce((sum, v) => sum + v, 0) / data.views.length,
        avg_engagement: data.engagement.reduce((sum, e) => sum + e, 0) / data.engagement.length,
        video_count: data.count
      }))
      .sort((a, b) => b.avg_views - a.avg_views);

    // Calculate publishing frequency
    const { data: recentVideos } = await supabase
      .from('videos')
      .select('published_date')
      .eq('user_id', this.userId)
      .gte('published_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('published_date', { ascending: false });

    const currentFrequency = (recentVideos || []).length / 30;
    const optimalFrequency = currentFrequency < 1 ? 1 : Math.min(2, currentFrequency * 1.2);

    return {
      optimal_hours: optimal_hours.slice(0, 6),
      day_of_week_analysis,
      publishing_velocity_analysis: {
        optimal_frequency: Math.round(optimalFrequency * 10) / 10,
        current_frequency: Math.round(currentFrequency * 10) / 10,
        recommendation: currentFrequency < 0.8 
          ? 'Aumentar frecuencia de publicación'
          : currentFrequency > 2 
          ? 'Reducir frecuencia y enfocar en calidad'
          : 'Mantener frecuencia actual'
      }
    };
  }

  async getPerformanceMatrix(): Promise<PerformanceMatrix> {
    const { data: vectors } = await supabase
      .from('tiktok_brain_vectors')
      .select(`
        video_id,
        content,
        views,
        retention_pct,
        saves_per_1k,
        duration_seconds,
        video_theme,
        published_date
      `)
      .eq('user_id', this.userId)
      .gte('views', 100)
      .not('retention_pct', 'is', null)
      .not('saves_per_1k', 'is', null);

    // Retention vs Saves Matrix
    const retentionSavesData = (vectors || []).map(vector => {
      const retention = vector.retention_pct || 0;
      const saves = vector.saves_per_1k || 0;
      
      let quadrant: 'high_retention_high_saves' | 'high_retention_low_saves' | 'low_retention_high_saves' | 'low_retention_low_saves';
      
      if (retention >= 60 && saves >= 20) quadrant = 'high_retention_high_saves';
      else if (retention >= 60 && saves < 20) quadrant = 'high_retention_low_saves';
      else if (retention < 60 && saves >= 20) quadrant = 'low_retention_high_saves';
      else quadrant = 'low_retention_low_saves';

      return {
        retention,
        saves_per_1k: saves,
        views: vector.views || 0,
        title: vector.content.substring(0, 40) + '...',
        quadrant
      };
    });

    // Duration Analysis
    const durationData = (vectors || [])
      .filter(v => v.duration_seconds && v.duration_seconds > 0)
      .map(v => ({
        duration: v.duration_seconds!,
        views: v.views || 0,
        retention: v.retention_pct || 0
      }));

    const durationRanges = [
      { min: 0, max: 15, label: '0-15s' },
      { min: 15, max: 30, label: '15-30s' },
      { min: 30, max: 60, label: '30-60s' },
      { min: 60, max: 120, label: '1-2min' },
      { min: 120, max: 300, label: '2-5min' }
    ];

    const performance_by_duration = durationRanges.map(range => {
      const rangeVideos = durationData.filter(v => v.duration >= range.min && v.duration < range.max);
      const avgPerformance = rangeVideos.length > 0 
        ? rangeVideos.reduce((sum, v) => sum + ((v.views / 1000) + v.retention), 0) / rangeVideos.length
        : 0;

      return {
        duration_range: range.label,
        avg_performance: Math.round(avgPerformance),
        video_count: rangeVideos.length
      };
    }).filter(r => r.video_count > 0);

    const bestRange = performance_by_duration.reduce((best, current) => 
      current.avg_performance > best.avg_performance ? current : best, 
      performance_by_duration[0] || { duration_range: '15-30s', avg_performance: 0, video_count: 0 }
    );

    // Content Theme Performance with Trends
    const themeGroups = (vectors || []).reduce((acc, vector) => {
      const theme = vector.video_theme || 'Sin tema';
      if (!acc[theme]) acc[theme] = [];
      acc[theme].push({
        views: vector.views || 0,
        retention: vector.retention_pct || 0,
        saves: vector.saves_per_1k || 0,
        date: vector.published_date || ''
      });
      return acc;
    }, {} as Record<string, any[]>);

    const content_theme_performance = Object.entries(themeGroups)
      .filter(([_, videos]) => videos.length >= 2)
      .map(([theme, videos]) => {
        const sortedByDate = videos.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const recentVideos = sortedByDate.slice(-Math.ceil(videos.length / 2));
        const olderVideos = sortedByDate.slice(0, Math.floor(videos.length / 2));

        const recentAvgViews = recentVideos.reduce((sum, v) => sum + v.views, 0) / recentVideos.length;
        const olderAvgViews = olderVideos.length > 0 ? olderVideos.reduce((sum, v) => sum + v.views, 0) / olderVideos.length : recentAvgViews;

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (recentAvgViews > olderAvgViews * 1.15) trend = 'up';
        else if (recentAvgViews < olderAvgViews * 0.85) trend = 'down';

        return {
          theme,
          avg_views: videos.reduce((sum, v) => sum + v.views, 0) / videos.length,
          avg_retention: videos.reduce((sum, v) => sum + v.retention, 0) / videos.length,
          avg_saves_per_1k: videos.reduce((sum, v) => sum + v.saves, 0) / videos.length,
          video_count: videos.length,
          trend
        };
      })
      .sort((a, b) => b.avg_views - a.avg_views);

    // 3. Performance Anomaly Detection
    const declining_themes = content_theme_performance.filter(t => t.trend === 'down' && t.video_count >= 3);
    
    if (declining_themes.length > 0) {
      const theme = declining_themes[0];
      insights.push({
        id: 'performance-anomaly-' + theme.theme,
        type: 'performance_anomaly',
        title: `Declive en performance: "${theme.theme}"`,
        description: `Este tema está perdiendo tracción. Considera pivotear o refrescar el approach.`,
        priority: 'medium',
        confidence: 80,
        action_items: [
          `Analizar qué cambió en los videos recientes de "${theme.theme}"`,
          'Experimentar con nuevos angles para este tema',
          'Considerar pausar temporalmente este tipo de contenido'
        ],
        data_source: 'similarity_analysis',
        potential_impact: 'Prevenir pérdida adicional de engagement'
      });
    }

    return insights.slice(0, 6);
  }

  // Utility method to execute complex SQL queries
  async executeAdvancedQuery(sql: string, params?: any): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql, 
        params: params || {} 
      });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Advanced query failed:', error);
      return [];
    }
  }
}