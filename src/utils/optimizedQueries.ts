import { supabase } from '@/integrations/supabase/client';

export interface OptimizedMetrics {
  viral_score: number;
  content_consistency_score: number;
  growth_velocity: number;
  monetization_readiness: number;
  audience_retention_quality: number;
}

export interface ContentPerformanceAnalysis {
  top_performing_content_types: Array<{
    content_type: string;
    avg_performance: number;
    video_count: number;
    growth_rate: number;
  }>;
  underperforming_opportunities: Array<{
    content_type: string;
    current_performance: number;
    potential_improvement: number;
    suggested_action: string;
  }>;
  seasonal_patterns: Array<{
    month: string;
    avg_views: number;
    avg_engagement: number;
    best_content_type: string;
  }>;
}

export interface PredictiveAnalytics {
  next_viral_probability: number;
  recommended_content_themes: string[];
  optimal_posting_schedule: Array<{
    day_of_week: string;
    optimal_hour: number;
    expected_performance_boost: number;
  }>;
  content_saturation_analysis: Array<{
    theme: string;
    saturation_level: number;
    recommendation: 'expand' | 'maintain' | 'reduce' | 'pivot';
  }>;
}

export class OptimizedAnalyticsService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getOptimizedMetrics(): Promise<OptimizedMetrics> {
    const sql = `
      WITH recent_videos AS (
        SELECT 
          v.*,
          bv.retention_pct,
          bv.saves_per_1k,
          bv.for_you_pct,
          EXTRACT(EPOCH FROM (NOW() - v.published_date::timestamp)) / 86400 as days_since_published
        FROM videos v
        LEFT JOIN tiktok_brain_vectors bv ON v.id = bv.video_id
        WHERE v.user_id = $1
          AND v.published_date >= (CURRENT_DATE - INTERVAL '90 days')
          AND v.views > 0
      ),
      viral_analysis AS (
        SELECT 
          COUNT(CASE WHEN views > 100000 THEN 1 END)::float / NULLIF(COUNT(*), 0) * 100 as viral_rate,
          AVG(CASE WHEN views > 50000 THEN retention_pct ELSE NULL END) as viral_retention,
          AVG(CASE WHEN views > 50000 THEN saves_per_1k ELSE NULL END) as viral_saves
        FROM recent_videos
      ),
      consistency_analysis AS (
        SELECT 
          STDDEV(views) / NULLIF(AVG(views), 0) * 100 as view_consistency,
          STDDEV(retention_pct) / NULLIF(AVG(retention_pct), 0) * 100 as retention_consistency
        FROM recent_videos
        WHERE retention_pct IS NOT NULL
      ),
      growth_analysis AS (
        SELECT 
          (SUM(CASE WHEN days_since_published <= 30 THEN views ELSE 0 END)::float / 
           NULLIF(SUM(CASE WHEN days_since_published > 30 AND days_since_published <= 60 THEN views ELSE 0 END), 0) - 1) * 100 as growth_velocity
        FROM recent_videos
      )
      SELECT 
        COALESCE(va.viral_rate, 0) as viral_score,
        GREATEST(0, 100 - COALESCE(ca.view_consistency, 100)) as content_consistency_score,
        COALESCE(ga.growth_velocity, 0) as growth_velocity,
        LEAST(100, 
          (COALESCE(va.viral_saves, 0) * 2) + 
          (COALESCE(va.viral_retention, 0) * 0.8)
        ) as monetization_readiness,
        COALESCE(AVG(rv.retention_pct), 0) as audience_retention_quality
      FROM viral_analysis va
      CROSS JOIN consistency_analysis ca
      CROSS JOIN growth_analysis ga
      CROSS JOIN recent_videos rv
      GROUP BY va.viral_rate, ca.view_consistency, ga.growth_velocity, va.viral_saves, va.viral_retention;
    `;

    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql, 
        params: { '1': this.userId } 
      });
      
      if (error) throw error;
      
      const result = data?.[0] || {};
      return {
        viral_score: Math.round((result as any).viral_score || 0),
        content_consistency_score: Math.round((result as any).content_consistency_score || 0),
        growth_velocity: Math.round((result as any).growth_velocity || 0),
        monetization_readiness: Math.round((result as any).monetization_readiness || 0),
        audience_retention_quality: Math.round((result as any).audience_retention_quality || 0)
      };
    } catch (error) {
      console.error('Error getting optimized metrics:', error);
      return {
        viral_score: 0,
        content_consistency_score: 0,
        growth_velocity: 0,
        monetization_readiness: 0,
        audience_retention_quality: 0
      };
    }
  }

  async getContentPerformanceAnalysis(): Promise<ContentPerformanceAnalysis> {
    const sql = `
      WITH content_performance AS (
        SELECT 
          COALESCE(bv.video_theme, v.video_type, 'Uncategorized') as content_type,
          AVG(v.views) as avg_views,
          AVG(bv.retention_pct) as avg_retention,
          AVG(bv.saves_per_1k) as avg_saves,
          COUNT(*) as video_count,
          AVG((v.likes + v.comments + v.shares)::float / NULLIF(v.views, 0) * 100) as avg_engagement,
          EXTRACT(MONTH FROM v.published_date::date) as month
        FROM videos v
        LEFT JOIN tiktok_brain_vectors bv ON v.id = bv.video_id
        WHERE v.user_id = $1
          AND v.published_date >= (CURRENT_DATE - INTERVAL '180 days')
          AND v.views > 0
        GROUP BY content_type, month
      ),
      performance_scores AS (
        SELECT 
          content_type,
          AVG((avg_views/1000 + avg_retention + avg_saves + avg_engagement) / 4) as performance_score,
          SUM(video_count) as total_videos,
          AVG(avg_views) as overall_avg_views,
          (MAX(avg_views) - MIN(avg_views)) / NULLIF(MIN(avg_views), 0) * 100 as growth_rate
        FROM content_performance
        WHERE video_count >= 2
        GROUP BY content_type
      )
      SELECT 
        content_type,
        performance_score,
        total_videos,
        overall_avg_views,
        COALESCE(growth_rate, 0) as growth_rate
      FROM performance_scores
      ORDER BY performance_score DESC;
    `;

    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql, 
        params: { '1': this.userId } 
      });
      
      if (error) throw error;

      const results = data || [];
      
      const top_performing = results.slice(0, 5).map((item: any) => ({
        content_type: item.content_type,
        avg_performance: Math.round(item.performance_score || 0),
        video_count: item.total_videos || 0,
        growth_rate: Math.round(item.growth_rate || 0)
      }));

      const underperforming = results
        .filter((item: any) => (item.performance_score || 0) < 50 && (item.total_videos || 0) >= 3)
        .slice(0, 3)
        .map((item: any) => ({
          content_type: item.content_type,
          current_performance: Math.round(item.performance_score || 0),
          potential_improvement: Math.round(Math.max(0, 70 - (item.performance_score || 0))),
          suggested_action: (item.performance_score || 0) < 30 ? 'Pausar y analizar' : 'Optimizar approach'
        }));

      return {
        top_performing_content_types: top_performing,
        underperforming_opportunities: underperforming,
        seasonal_patterns: [] // Simplified for now
      };
    } catch (error) {
      console.error('Error getting content performance analysis:', error);
      return {
        top_performing_content_types: [],
        underperforming_opportunities: [],
        seasonal_patterns: []
      };
    }
  }

  async getPredictiveAnalytics(): Promise<PredictiveAnalytics> {
    const sql = `
      WITH recent_performance AS (
        SELECT 
          v.*,
          bv.video_theme,
          bv.retention_pct,
          bv.saves_per_1k,
          EXTRACT(DOW FROM v.published_date::date) as day_of_week,
          EXTRACT(HOUR FROM v.created_at) as publish_hour,
          ROW_NUMBER() OVER (ORDER BY v.published_date DESC) as recency_rank
        FROM videos v
        LEFT JOIN tiktok_brain_vectors bv ON v.id = bv.video_id
        WHERE v.user_id = $1
          AND v.published_date >= (CURRENT_DATE - INTERVAL '60 days')
          AND v.views > 100
      ),
      viral_patterns AS (
        SELECT 
          video_theme,
          COUNT(*) as theme_count,
          AVG(views) as avg_views,
          AVG(retention_pct) as avg_retention,
          COUNT(CASE WHEN views > 50000 THEN 1 END)::float / COUNT(*) as viral_rate
        FROM recent_performance
        WHERE video_theme IS NOT NULL
        GROUP BY video_theme
        HAVING COUNT(*) >= 2
      ),
      timing_patterns AS (
        SELECT 
          day_of_week,
          publish_hour,
          AVG(views) as avg_views,
          COUNT(*) as video_count,
          AVG((likes + comments + shares)::float / NULLIF(views, 0) * 100) as avg_engagement
        FROM recent_performance
        GROUP BY day_of_week, publish_hour
        HAVING COUNT(*) >= 2
      ),
      theme_saturation AS (
        SELECT 
          video_theme,
          COUNT(*) as total_videos,
          AVG(CASE WHEN recency_rank <= 10 THEN views ELSE NULL END) as recent_avg_views,
          AVG(CASE WHEN recency_rank > 10 THEN views ELSE NULL END) as older_avg_views
        FROM recent_performance
        WHERE video_theme IS NOT NULL
        GROUP BY video_theme
        HAVING COUNT(*) >= 3
      )
      SELECT 
        'prediction_data' as query_type,
        json_build_object(
          'viral_themes', (
            SELECT json_agg(json_build_object(
              'theme', video_theme,
              'viral_rate', viral_rate,
              'avg_views', avg_views
            ))
            FROM viral_patterns
            ORDER BY viral_rate DESC
            LIMIT 5
          ),
          'optimal_timing', (
            SELECT json_agg(json_build_object(
              'day_of_week', day_of_week,
              'hour', publish_hour,
              'performance_boost', (avg_engagement - 3.5) * 10
            ))
            FROM timing_patterns
            WHERE avg_engagement > 3.5
            ORDER BY avg_engagement DESC
            LIMIT 7
          ),
          'theme_saturation', (
            SELECT json_agg(json_build_object(
              'theme', video_theme,
              'saturation_level', 
                CASE 
                  WHEN recent_avg_views < older_avg_views * 0.8 THEN 80
                  WHEN recent_avg_views > older_avg_views * 1.2 THEN 20
                  ELSE 50
                END,
              'recommendation', 
                CASE 
                  WHEN recent_avg_views < older_avg_views * 0.8 THEN 'reduce'
                  WHEN recent_avg_views > older_avg_views * 1.2 THEN 'expand'
                  ELSE 'maintain'
                END
            ))
            FROM theme_saturation
          )
        ) as analysis_data;
    `;

    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql, 
        params: { '1': this.userId } 
      });
      
      if (error) throw error;

      const result = data?.[0] || {};
      const viralThemes = (result as any).viral_themes || [];
      const optimalTiming = (result as any).optimal_timing || [];
      const themeSaturation = (result as any).theme_saturation || [];

      // Calculate next viral probability based on recent patterns
      const viralRate = viralThemes.length > 0 
        ? viralThemes.reduce((sum: number, theme: any) => sum + theme.viral_rate, 0) / viralThemes.length
        : 0;

      return {
        next_viral_probability: Math.round(viralRate),
        recommended_content_themes: viralThemes
          .filter((theme: any) => theme.viral_rate > 10)
          .map((theme: any) => theme.theme)
          .slice(0, 5),
        optimal_posting_schedule: optimalTiming
          .map((timing: any) => ({
            day_of_week: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][timing.day_of_week],
            optimal_hour: timing.hour,
            expected_performance_boost: Math.round(timing.performance_boost || 0)
          }))
          .filter((timing: any) => timing.expected_performance_boost > 5),
        content_saturation_analysis: themeSaturation.map((theme: any) => ({
          theme: theme.theme,
          saturation_level: theme.saturation_level,
          recommendation: theme.recommendation as 'expand' | 'maintain' | 'reduce' | 'pivot'
        }))
      };
    } catch (error) {
      console.error('Error getting predictive analytics:', error);
      return {
        next_viral_probability: 0,
        recommended_content_themes: [],
        optimal_posting_schedule: [],
        content_saturation_analysis: []
      };
    }
  }

  async getAdvancedGrowthInsights(): Promise<any[]> {
    const sql = `
      WITH performance_trends AS (
        SELECT 
          v.id as video_id,
          v.title,
          v.views,
          v.published_date,
          bv.video_theme,
          bv.cta_type,
          bv.retention_pct,
          bv.saves_per_1k,
          LAG(v.views) OVER (PARTITION BY bv.video_theme ORDER BY v.published_date) as prev_theme_views,
          AVG(v.views) OVER (PARTITION BY bv.video_theme) as theme_avg_views,
          PERCENT_RANK() OVER (ORDER BY v.views) as view_percentile
        FROM videos v
        LEFT JOIN tiktok_brain_vectors bv ON v.id = bv.video_id
        WHERE v.user_id = $1
          AND v.published_date >= (CURRENT_DATE - INTERVAL '45 days')
          AND v.views > 0
      ),
      anomaly_detection AS (
        SELECT 
          video_id,
          title,
          views,
          video_theme,
          retention_pct,
          saves_per_1k,
          view_percentile,
          CASE 
            WHEN views > theme_avg_views * 2 THEN 'outlier_high'
            WHEN views < theme_avg_views * 0.5 AND view_percentile > 0.3 THEN 'outlier_low'
            WHEN retention_pct > 80 AND saves_per_1k > 30 THEN 'engagement_champion'
            WHEN retention_pct < 30 OR saves_per_1k < 5 THEN 'needs_optimization'
            ELSE 'normal'
          END as performance_category
        FROM performance_trends
        WHERE video_theme IS NOT NULL
      )
      SELECT 
        performance_category,
        COUNT(*) as video_count,
        AVG(views) as avg_views,
        AVG(retention_pct) as avg_retention,
        AVG(saves_per_1k) as avg_saves,
        json_agg(
          json_build_object(
            'video_id', video_id,
            'title', SUBSTRING(title, 1, 50),
            'views', views,
            'theme', video_theme
          )
          ORDER BY views DESC
        ) FILTER (WHERE performance_category != 'normal') as example_videos
      FROM anomaly_detection
      WHERE performance_category != 'normal'
      GROUP BY performance_category
      ORDER BY 
        CASE performance_category
          WHEN 'engagement_champion' THEN 1
          WHEN 'outlier_high' THEN 2
          WHEN 'outlier_low' THEN 3
          WHEN 'needs_optimization' THEN 4
          ELSE 5
        END;
    `;

    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql, 
        params: { '1': this.userId } 
      });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting advanced growth insights:', error);
      return [];
    }
  }

  async getContentOpportunityMatrix(): Promise<any> {
    const sql = `
      WITH theme_performance AS (
        SELECT 
          bv.video_theme,
          COUNT(*) as video_count,
          AVG(v.views) as avg_views,
          AVG(bv.retention_pct) as avg_retention,
          AVG(bv.saves_per_1k) as avg_saves,
          STDDEV(v.views) / NULLIF(AVG(v.views), 0) as consistency,
          MAX(v.views) as best_performance,
          MIN(v.published_date) as first_video_date,
          MAX(v.published_date) as last_video_date
        FROM videos v
        JOIN tiktok_brain_vectors bv ON v.id = bv.video_id
        WHERE v.user_id = $1
          AND v.published_date >= (CURRENT_DATE - INTERVAL '90 days')
          AND bv.video_theme IS NOT NULL
          AND v.views > 0
        GROUP BY bv.video_theme
        HAVING COUNT(*) >= 2
      ),
      opportunity_analysis AS (
        SELECT 
          video_theme,
          video_count,
          avg_views,
          avg_retention,
          avg_saves,
          consistency,
          best_performance,
          CASE 
            WHEN avg_views > 25000 AND video_count <= 3 THEN 'high_potential_underexplored'
            WHEN avg_views > 10000 AND consistency < 0.5 THEN 'high_potential_inconsistent'
            WHEN video_count >= 8 AND avg_views < 5000 THEN 'oversaturated_low_performance'
            WHEN avg_retention > 70 AND avg_saves > 20 THEN 'engagement_goldmine'
            ELSE 'stable'
          END as opportunity_type,
          CASE 
            WHEN avg_views > 25000 AND video_count <= 3 THEN 95
            WHEN avg_views > 10000 AND consistency < 0.5 THEN 80
            WHEN video_count >= 8 AND avg_views < 5000 THEN 70
            WHEN avg_retention > 70 AND avg_saves > 20 THEN 90
            ELSE 40
          END as opportunity_score
        FROM theme_performance
      )
      SELECT *
      FROM opportunity_analysis
      WHERE opportunity_type != 'stable'
      ORDER BY opportunity_score DESC;
    `;

    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql, 
        params: { '1': this.userId } 
      });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting content opportunity matrix:', error);
      return [];
    }
  }

  async getWeeklyInsightsGeneration(): Promise<void> {
    const insights = await this.getAdvancedGrowthInsights();
    const opportunities = await this.getContentOpportunityMatrix();
    
    // Auto-generate growth insights
    for (const insight of insights) {
      if (insight.video_count >= 2) {
        try {
          await supabase
            .from('growth_insights')
            .insert({
              user_id: this.userId,
              insight_type: insight.performance_category,
              title: this.generateInsightTitle(insight),
              description: this.generateInsightDescription(insight),
              confidence_score: this.calculateConfidenceScore(insight),
              metric_impact: Math.round((insight.avg_views || 0) / 1000),
              affected_video_ids: (insight.example_videos || []).map((v: any) => v.video_id),
              is_active: true,
              date_generated: new Date().toISOString()
            });
        } catch (error) {
          console.error('Error inserting growth insight:', error);
        }
      }
    }
  }

  private generateInsightTitle(insight: any): string {
    switch (insight.performance_category) {
      case 'engagement_champion':
        return `Contenido excepcional detectado: ${insight.avg_retention}% retención`;
      case 'outlier_high':
        return `Video viral detectado: ${Math.round(insight.avg_views / 1000)}K views`;
      case 'outlier_low':
        return `Oportunidad de mejora: Performance bajo lo esperado`;
      case 'needs_optimization':
        return `Optimización requerida: Baja retención y saves`;
      default:
        return 'Insight generado automáticamente';
    }
  }

  private generateInsightDescription(insight: any): string {
    const exampleVideo = insight.example_videos?.[0];
    switch (insight.performance_category) {
      case 'engagement_champion':
        return `Has creado contenido con ${insight.avg_retention}% de retención y ${insight.avg_saves} saves/1K. Replica estos elementos en contenido futuro.`;
      case 'outlier_high':
        return `Tu video "${exampleVideo?.title || 'contenido'}" superó expectativas con ${Math.round(insight.avg_views / 1000)}K views. Analiza qué lo hizo especial.`;
      case 'outlier_low':
        return `${insight.video_count} videos recientes han tenido performance inferior. Revisa los elementos que pueden estar afectando el alcance.`;
      case 'needs_optimization':
        return `Videos con ${insight.avg_retention}% retención promedio necesitan mejoras en hooks y estructura narrativa.`;
      default:
        return 'Análisis automático basado en patrones de performance.';
    }
  }

  private calculateConfidenceScore(insight: any): number {
    const baseScore = Math.min(90, (insight.video_count || 1) * 15);
    const viewsWeight = Math.min(20, (insight.avg_views || 0) / 5000);
    return Math.round(baseScore + viewsWeight);
  }
}