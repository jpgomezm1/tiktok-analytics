import { Video } from '@/hooks/useVideos';

export interface ContentPattern {
  type: 'theme' | 'cta' | 'editing_style' | 'hook_type';
  value: string;
  avgEngagement: number;
  avgViews: number;
  videoCount: number;
  improvementPct?: number;
}

export interface PerformanceScore {
  contentQuality: number;
  viralPotential: number;
  monetizationReadiness: number;
  overallGrowth: number;
}

export interface AIInsight {
  id: string;
  type: 'pattern' | 'recommendation' | 'opportunity' | 'strategy';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  metrics?: {
    improvement: string;
    baseline: string;
  };
}

export class AnalyticsEngine {
  private videos: Video[];

  constructor(videos: Video[]) {
    this.videos = videos.filter(v => v.views > 0); // Filter out videos with no data
  }

  // Analyze content patterns
  analyzeContentPatterns(): ContentPattern[] {
    const patterns: ContentPattern[] = [];

    // Analyze video themes
    const themeGroups = this.groupByField('video_theme');
    patterns.push(...this.calculatePatternMetrics(themeGroups, 'theme'));

    // Analyze CTA types
    const ctaGroups = this.groupByField('cta_type');
    patterns.push(...this.calculatePatternMetrics(ctaGroups, 'cta'));

    // Analyze editing styles
    const editingGroups = this.groupByField('editing_style');
    patterns.push(...this.calculatePatternMetrics(editingGroups, 'editing_style'));

    // Analyze hook patterns (first word analysis)
    const hookGroups = this.analyzeHookPatterns();
    patterns.push(...this.calculatePatternMetrics(hookGroups, 'hook_type'));

    return patterns.sort((a, b) => b.avgEngagement - a.avgEngagement);
  }

  // Calculate performance scores
  calculatePerformanceScores(): PerformanceScore {
    if (this.videos.length === 0) {
      return { contentQuality: 0, viralPotential: 0, monetizationReadiness: 0, overallGrowth: 0 };
    }

    // Content Quality Score (0-100)
    const avgEngagement = this.videos.reduce((sum, v) => sum + (v.engagement_rate || 0), 0) / this.videos.length;
    const avgWatchTime = this.videos.reduce((sum, v) => sum + (v.avg_time_watched || 0), 0) / this.videos.length;
    const contentQuality = Math.min(100, (avgEngagement * 50) + (avgWatchTime / 30 * 50));

    // Viral Potential Score (0-100)
    const recentVideos = this.videos.slice(0, 10);
    const viralCount = recentVideos.filter(v => (v.views || 0) > 50000).length;
    const avgViralViews = recentVideos.reduce((sum, v) => sum + Math.min(v.views || 0, 1000000), 0) / recentVideos.length;
    const viralPotential = Math.min(100, (viralCount / recentVideos.length * 40) + (avgViralViews / 10000 * 60));

    // Monetization Readiness Score (0-100)
    const avgSaves = this.videos.reduce((sum, v) => sum + (v.saves || 0), 0) / this.videos.length;
    const profileTraffic = this.videos.reduce((sum, v) => sum + (v.traffic_profile || 0), 0);
    const totalTraffic = this.videos.reduce((sum, v) => 
      sum + (v.traffic_for_you || 0) + (v.traffic_follow || 0) + (v.traffic_hashtag || 0) + 
      (v.traffic_sound || 0) + (v.traffic_profile || 0) + (v.traffic_search || 0), 0);
    const profileTrafficPct = totalTraffic > 0 ? (profileTraffic / totalTraffic) * 100 : 0;
    const monetizationReadiness = Math.min(100, (avgSaves / 100 * 40) + (profileTrafficPct * 60));

    // Overall Growth Score (weighted average)
    const overallGrowth = (contentQuality * 0.3) + (viralPotential * 0.4) + (monetizationReadiness * 0.3);

    return {
      contentQuality: Math.round(contentQuality),
      viralPotential: Math.round(viralPotential),
      monetizationReadiness: Math.round(monetizationReadiness),
      overallGrowth: Math.round(overallGrowth)
    };
  }

  // Generate comprehensive AI insights and recommendations
  generateInsights(): AIInsight[] {
    const insights: AIInsight[] = [];
    const patterns = this.analyzeContentPatterns();
    const scores = this.calculatePerformanceScores();
    const overallMetrics = this.calculateOverallMetrics();

    // Always generate basic performance insights
    this.generatePerformanceInsights(insights, scores, overallMetrics);
    
    // Content pattern insights
    this.generateContentPatternInsights(insights, patterns);
    
    // Engagement and growth insights
    this.generateEngagementInsights(insights, overallMetrics);
    
    // Optimization opportunities
    this.generateOptimizationInsights(insights, scores);
    
    // Viral potential insights
    this.generateViralInsights(insights);
    
    // Duration and timing insights
    this.generateTimingInsights(insights);

    return insights.slice(0, 8); // Return top 8 insights
  }

  private generatePerformanceInsights(insights: AIInsight[], scores: PerformanceScore, overallMetrics: any) {
    // Overall performance assessment
    if (scores.overallGrowth >= 75) {
      insights.push({
        id: 'high-performance',
        type: 'pattern',
        title: 'Excelente rendimiento general',
        description: `Tu contenido mantiene un alto nivel de calidad con ${scores.overallGrowth}% de score general. Continúa con esta estrategia.`,
        impact: 'high',
        confidence: 90,
        metrics: {
          improvement: 'Mantener nivel',
          baseline: `${scores.overallGrowth}% score`
        }
      });
    } else if (scores.overallGrowth >= 50) {
      insights.push({
        id: 'moderate-performance',
        type: 'opportunity',
        title: 'Oportunidad de crecimiento',
        description: `Con ${scores.overallGrowth}% de score general, hay margen para optimización. Enfócate en mejorar engagement y retención.`,
        impact: 'medium',
        confidence: 85,
        metrics: {
          improvement: `+${Math.round((75 - scores.overallGrowth) * 0.8)}% potencial`,
          baseline: `${scores.overallGrowth}% actual`
        }
      });
    } else {
      insights.push({
        id: 'improvement-needed',
        type: 'strategy',
        title: 'Requiere optimización urgente',
        description: `Score de ${scores.overallGrowth}% indica necesidad de cambios estratégicos en tu contenido.`,
        impact: 'high',
        confidence: 90,
        metrics: {
          improvement: `+${Math.round((60 - scores.overallGrowth) * 1.2)}% objetivo`,
          baseline: `${scores.overallGrowth}% actual`
        }
      });
    }
  }

  private generateContentPatternInsights(insights: AIInsight[], patterns: ContentPattern[]) {
    const bestTheme = patterns.find(p => p.type === 'theme' && p.videoCount >= 2);
    const bestCTA = patterns.find(p => p.type === 'cta' && p.videoCount >= 2);
    const bestHook = patterns.find(p => p.type === 'hook_type' && p.videoCount >= 2);

    if (bestTheme) {
      insights.push({
        id: 'best-theme',
        type: 'pattern',
        title: `${bestTheme.value} es tu mejor temática`,
        description: `Tus videos de ${bestTheme.value.toLowerCase()} obtienen ${bestTheme.avgEngagement.toFixed(1)}% de engagement, superando el promedio en ${Math.round(Math.abs(bestTheme.improvementPct || 0))}%.`,
        impact: 'high',
        confidence: Math.min(95, bestTheme.videoCount * 15),
        metrics: {
          improvement: `+${Math.round(Math.abs(bestTheme.improvementPct || 0))}%`,
          baseline: `${bestTheme.avgEngagement.toFixed(1)}% engagement`
        }
      });
    }

    if (bestCTA) {
      insights.push({
        id: 'best-cta',
        type: 'recommendation',
        title: `CTA "${bestCTA.value}" genera más interacción`,
        description: `Los videos con "${bestCTA.value}" como call-to-action obtienen ${bestCTA.avgViews.toLocaleString()} views promedio.`,
        impact: 'medium',
        confidence: Math.min(85, bestCTA.videoCount * 12),
        metrics: {
          improvement: `+${Math.round(Math.abs(bestCTA.improvementPct || 0))}%`,
          baseline: `${bestCTA.avgViews.toLocaleString()} views`
        }
      });
    }

    if (bestHook) {
      insights.push({
        id: 'best-hook',
        type: 'recommendation', 
        title: `Hooks tipo "${bestHook.value}" funcionan mejor`,
        description: `Este tipo de apertura genera ${bestHook.avgEngagement.toFixed(1)}% de engagement en promedio.`,
        impact: 'medium',
        confidence: Math.min(80, bestHook.videoCount * 10),
        metrics: {
          improvement: `+${Math.round(Math.abs(bestHook.improvementPct || 0))}%`,
          baseline: `${bestHook.avgEngagement.toFixed(1)}% engagement`
        }
      });
    }
  }

  private generateEngagementInsights(insights: AIInsight[], overallMetrics: any) {
    const avgSaveRate = this.videos.reduce((sum, v) => {
      return sum + (v.views > 0 ? (v.saves || 0) / v.views * 1000 : 0);
    }, 0) / Math.max(1, this.videos.length);

    const avgCommentRate = this.videos.reduce((sum, v) => {
      return sum + (v.views > 0 ? (v.comments || 0) / v.views * 100 : 0);
    }, 0) / Math.max(1, this.videos.length);

    // Save rate insights
    if (avgSaveRate >= 15) {
      insights.push({
        id: 'high-save-rate',
        type: 'pattern',
        title: 'Excelente tasa de guardados',
        description: `Con ${avgSaveRate.toFixed(1)} saves por 1K views, tu contenido tiene alto valor percibido por la audiencia.`,
        impact: 'high',
        confidence: 90,
        metrics: {
          improvement: 'Mantener calidad',
          baseline: `${avgSaveRate.toFixed(1)}/1K saves`
        }
      });
    } else if (avgSaveRate < 8) {
      insights.push({
        id: 'low-save-rate',
        type: 'opportunity',
        title: 'Mejorar contenido guardable',
        description: `Con ${avgSaveRate.toFixed(1)} saves por 1K, crear más contenido de valor duradero como tutoriales o tips.`,
        impact: 'medium',
        confidence: 85,
        metrics: {
          improvement: '+50% objetivo',
          baseline: `${avgSaveRate.toFixed(1)}/1K actual`
        }
      });
    }

    // Comment rate insights
    if (avgCommentRate >= 2) {
      insights.push({
        id: 'high-comment-rate',
        type: 'pattern',
        title: 'Gran generación de conversación',
        description: `${avgCommentRate.toFixed(1)}% de comment rate indica que tu contenido motiva interacción activa.`,
        impact: 'high',
        confidence: 88
      });
    }
  }

  private generateOptimizationInsights(insights: AIInsight[], scores: PerformanceScore) {
    // Monetization readiness
    if (scores.monetizationReadiness < 50) {
      insights.push({
        id: 'monetization-opportunity',
        type: 'strategy',
        title: 'Optimizar para monetización',
        description: 'Crear contenido que dirija tráfico a tu perfil y genere más saves para aumentar potencial de ingresos.',
        impact: 'high',
        confidence: 85,
        metrics: {
          improvement: `+${Math.round((70 - scores.monetizationReadiness) * 0.9)}%`,
          baseline: `${scores.monetizationReadiness}% actual`
        }
      });
    }

    // Viral potential optimization
    if (scores.viralPotential < 60) {
      insights.push({
        id: 'viral-optimization',
        type: 'opportunity',
        title: 'Incrementar potencial viral',
        description: 'Enfócate en hooks más impactantes y contenido con mayor shareabilidad para aumentar alcance orgánico.',
        impact: 'high',
        confidence: 80,
        metrics: {
          improvement: `+${Math.round((75 - scores.viralPotential) * 0.7)}%`,
          baseline: `${scores.viralPotential}% actual`
        }
      });
    }
  }

  private generateViralInsights(insights: AIInsight[]) {
    const viralVideos = this.videos.filter(v => (v.views || 0) > 50000);
    const highEngagementVideos = this.videos.filter(v => (v.engagement_rate || 0) > 5);
    
    if (viralVideos.length > 0) {
      const viralRate = (viralVideos.length / this.videos.length) * 100;
      const commonTheme = this.getMostCommonValue(viralVideos, 'video_theme');
      
      if (commonTheme) {
        insights.push({
          id: 'viral-pattern',
          type: 'strategy',
          title: `${commonTheme} tiene potencial viral demostrado`,
          description: `${viralRate.toFixed(1)}% de tus videos virales son de ${commonTheme.toLowerCase()}. Duplica esta estrategia.`,
          impact: 'high',
          confidence: 85,
          metrics: {
            improvement: `${viralVideos.length}/${this.videos.length} videos`,
            baseline: `${viralRate.toFixed(1)}% viral rate`
          }
        });
      }
    } else if (highEngagementVideos.length > 0) {
      insights.push({
        id: 'engagement-to-viral',
        type: 'opportunity',
        title: 'Convertir engagement en views',
        description: `Tienes ${highEngagementVideos.length} videos con alto engagement. Optimiza hooks para aumentar alcance.`,
        impact: 'medium',
        confidence: 75
      });
    }
  }

  private generateTimingInsights(insights: AIInsight[]) {
    // Duration analysis
    const shortVideos = this.videos.filter(v => (v.duration_seconds || 0) < 30);
    const longVideos = this.videos.filter(v => (v.duration_seconds || 0) > 60);
    
    if (shortVideos.length > 0 && longVideos.length > 0) {
      const shortAvgViews = shortVideos.reduce((sum, v) => sum + (v.views || 0), 0) / shortVideos.length;
      const longAvgViews = longVideos.reduce((sum, v) => sum + (v.views || 0), 0) / longVideos.length;
      
      if (shortAvgViews > longAvgViews * 1.2) {
        insights.push({
          id: 'duration-insight',
          type: 'recommendation',
          title: 'Videos cortos performan mejor',
          description: `Tus videos <30s obtienen ${Math.round((shortAvgViews / longAvgViews) * 100 - 100)}% más views que los largos.`,
          impact: 'medium',
          confidence: 75,
          metrics: {
            improvement: `${Math.round((shortAvgViews / longAvgViews) * 100 - 100)}% más views`,
            baseline: 'Videos <30s vs >60s'
          }
        });
      } else if (longAvgViews > shortAvgViews * 1.2) {
        insights.push({
          id: 'duration-insight',
          type: 'recommendation',
          title: 'Contenido largo genera más views',
          description: `Videos >60s obtienen ${Math.round((longAvgViews / shortAvgViews) * 100 - 100)}% más views. Desarrolla más contenido extenso.`,
          impact: 'medium',
          confidence: 75,
          metrics: {
            improvement: `${Math.round((longAvgViews / shortAvgViews) * 100 - 100)}% más views`,
            baseline: 'Videos >60s vs <30s'
          }
        });
      }
    }
  }

  // Helper methods
  private groupByField(field: string): { [key: string]: Video[] } {
    return this.videos.reduce((groups, video) => {
      const value = (video as any)[field];
      if (value && typeof value === 'string') {
        if (!groups[value]) groups[value] = [];
        groups[value].push(video);
      }
      return groups;
    }, {} as { [key: string]: Video[] });
  }

  private calculatePatternMetrics(groups: { [key: string]: Video[] }, type: ContentPattern['type']): ContentPattern[] {
    const overall = this.calculateOverallMetrics();
    
    return Object.entries(groups)
      .filter(([_, videos]) => videos.length >= 2) // Only include patterns with 2+ videos
      .map(([value, videos]) => {
        const avgEngagement = videos.reduce((sum, v) => sum + (v.engagement_rate || 0), 0) / videos.length;
        const avgViews = videos.reduce((sum, v) => sum + (v.views || 0), 0) / videos.length;
        const improvementPct = overall.avgEngagement > 0 ? 
          ((avgEngagement - overall.avgEngagement) / overall.avgEngagement) * 100 : 0;

        return {
          type,
          value,
          avgEngagement,
          avgViews,
          videoCount: videos.length,
          improvementPct
        };
      });
  }

  private analyzeHookPatterns(): { [key: string]: Video[] } {
    const groups: { [key: string]: Video[] } = {};
    
    this.videos.forEach(video => {
      if (video.hook) {
        const firstWord = video.hook.split(' ')[0].toLowerCase();
        const hookType = this.categorizeHook(firstWord, video.hook);
        if (!groups[hookType]) groups[hookType] = [];
        groups[hookType].push(video);
      }
    });

    return groups;
  }

  private categorizeHook(firstWord: string, fullHook: string): string {
    if (['how', 'tutorial', 'learn'].some(w => fullHook.toLowerCase().includes(w))) return 'How-to/Tutorial';
    if (['what', 'why', 'when', 'where', 'who'].includes(firstWord)) return 'Question Hook';
    if (['don\'t', 'never', 'stop', 'avoid'].some(w => fullHook.toLowerCase().includes(w))) return 'Negative Hook';
    if (['did', 'can', 'will', 'are'].includes(firstWord)) return 'Direct Question';
    if (['this', 'here', 'check'].includes(firstWord)) return 'Demonstrative';
    return 'Statement Hook';
  }

  private calculateOverallMetrics() {
    const totalVideos = Math.max(1, this.videos.length);
    return {
      avgEngagement: this.videos.reduce((sum, v) => sum + (v.engagement_rate || 0), 0) / totalVideos,
      avgViews: this.videos.reduce((sum, v) => sum + (v.views || 0), 0) / totalVideos,
      avgSaves: this.videos.reduce((sum, v) => sum + (v.saves || 0), 0) / totalVideos,
      avgComments: this.videos.reduce((sum, v) => sum + (v.comments || 0), 0) / totalVideos,
      avgShares: this.videos.reduce((sum, v) => sum + (v.shares || 0), 0) / totalVideos,
      avgDuration: this.videos.reduce((sum, v) => sum + (v.duration_seconds || 0), 0) / totalVideos,
      avgRetention: this.videos.reduce((sum, v) => {
        const duration = v.duration_seconds || 1;
        const watched = v.avg_time_watched || 0;
        return sum + (watched / duration) * 100;
      }, 0) / totalVideos
    };
  }

  private getMostCommonValue(videos: Video[], field: string): string | null {
    const counts: { [key: string]: number } = {};
    videos.forEach(video => {
      const value = (video as any)[field];
      if (value && typeof value === 'string') {
        counts[value] = (counts[value] || 0) + 1;
      }
    });
    
    const sorted = Object.entries(counts).sort(([,a], [,b]) => b - a);
    return sorted.length > 0 ? sorted[0][0] : null;
  }
}