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

  // Generate AI insights and recommendations
  generateInsights(): AIInsight[] {
    const insights: AIInsight[] = [];
    const patterns = this.analyzeContentPatterns();

    // Pattern-based insights
    const bestTheme = patterns.find(p => p.type === 'theme');
    if (bestTheme && bestTheme.videoCount >= 2) {
      insights.push({
        id: 'best-theme',
        type: 'pattern',
        title: `${bestTheme.value} content performs best`,
        description: `Your ${bestTheme.value.toLowerCase()} videos get ${bestTheme.avgEngagement.toFixed(1)}% engagement rate - ${Math.round((bestTheme.improvementPct || 0))}% above average.`,
        impact: 'high',
        confidence: Math.min(95, bestTheme.videoCount * 15),
        metrics: {
          improvement: `+${Math.round(bestTheme.improvementPct || 0)}%`,
          baseline: `${bestTheme.avgEngagement.toFixed(1)}% engagement`
        }
      });
    }

    const bestCTA = patterns.find(p => p.type === 'cta');
    if (bestCTA && bestCTA.videoCount >= 2) {
      insights.push({
        id: 'best-cta',
        type: 'recommendation',
        title: `"${bestCTA.value}" CTA drives most engagement`,
        description: `Videos with "${bestCTA.value}" call-to-action get ${bestCTA.avgViews.toLocaleString()} average views.`,
        impact: 'medium',
        confidence: Math.min(90, bestCTA.videoCount * 12),
        metrics: {
          improvement: `+${Math.round(bestCTA.improvementPct || 0)}%`,
          baseline: `${bestCTA.avgViews.toLocaleString()} avg views`
        }
      });
    }

    // Monetization opportunities
    const scores = this.calculatePerformanceScores();
    if (scores.monetizationReadiness < 60) {
      insights.push({
        id: 'monetization-opportunity',
        type: 'opportunity',
        title: 'Improve monetization readiness',
        description: 'Focus on content that drives profile visits and saves to increase monetization potential.',
        impact: 'high',
        confidence: 85
      });
    }

    // Growth strategy insights
    const viralVideos = this.videos.filter(v => (v.views || 0) > 100000);
    if (viralVideos.length > 0) {
      const commonTheme = this.getMostCommonValue(viralVideos, 'video_theme');
      if (commonTheme) {
        insights.push({
          id: 'viral-pattern',
          type: 'strategy',
          title: `${commonTheme} content has viral potential`,
          description: `${Math.round((viralVideos.length / this.videos.length) * 100)}% of your viral videos are ${commonTheme.toLowerCase()}-themed.`,
          impact: 'high',
          confidence: 80
        });
      }
    }

    return insights.slice(0, 6); // Return top 6 insights
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
    return {
      avgEngagement: this.videos.reduce((sum, v) => sum + (v.engagement_rate || 0), 0) / this.videos.length,
      avgViews: this.videos.reduce((sum, v) => sum + (v.views || 0), 0) / this.videos.length
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