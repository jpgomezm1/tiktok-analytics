import { useVideos } from '@/hooks/useVideos';
import { MetricCard } from '@/components/MetricCard';
import { InsightCard } from '@/components/InsightCard';
import { ScoreCard } from '@/components/ScoreCard';
import { AIContentSuggestions } from '@/components/AIContentSuggestions';
import { ViralPotentialAnalyzer } from '@/components/ViralPotentialAnalyzer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalyticsEngine } from '@/utils/analyticsEngine';
import { useMemo } from 'react';
import { TrendingUp, Eye, Heart, MessageCircle, Brain, Lightbulb, Target, DollarSign, BarChart3, Sparkles, Calendar, Users, BookmarkPlus, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const { videos, analytics, loading } = useVideos();
  
  const aiEngine = useMemo(() => new AnalyticsEngine(videos), [videos]);
  const performanceScores = useMemo(() => aiEngine.calculatePerformanceScores(), [aiEngine]);
  const insights = useMemo(() => aiEngine.generateInsights(), [aiEngine]);
  const patterns = useMemo(() => aiEngine.analyzeContentPatterns(), [aiEngine]);

  // Calculate 30-day KPIs
  const thirtyDaysKPIs = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const last30DaysVideos = videos.filter(video => {
      const videoDate = new Date(video.published_date);
      return videoDate >= thirtyDaysAgo;
    });

    const allTimeVideos = videos.filter(video => {
      const videoDate = new Date(video.published_date);
      return videoDate < thirtyDaysAgo;
    });

    if (last30DaysVideos.length === 0) {
      return {
        totalViews: 0,
        engagementRate: 0,
        savesPer1K: 0,
        newFollowers: 0,
        comparisons: { totalViews: 0, engagementRate: 0, savesPer1K: 0, newFollowers: 0 }
      };
    }

    const totalViews30D = last30DaysVideos.reduce((sum, video) => sum + (video.views || 0), 0);
    const totalLikes30D = last30DaysVideos.reduce((sum, video) => sum + (video.likes || 0), 0);
    const totalComments30D = last30DaysVideos.reduce((sum, video) => sum + (video.comments || 0), 0);
    const totalShares30D = last30DaysVideos.reduce((sum, video) => sum + (video.shares || 0), 0);
    const totalSaves30D = last30DaysVideos.reduce((sum, video) => sum + (video.saves || 0), 0);
    const totalFollowers30D = last30DaysVideos.reduce((sum, video) => sum + (video.new_followers || 0), 0);

    const engagementRate30D = totalViews30D > 0 ? ((totalLikes30D + totalComments30D + totalShares30D) / totalViews30D) * 100 : 0;
    const savesPer1K30D = totalViews30D > 0 ? (totalSaves30D / totalViews30D) * 1000 : 0;

    // Calculate historical averages for comparison
    let comparisons = { totalViews: 0, engagementRate: 0, savesPer1K: 0, newFollowers: 0 };
    
    if (allTimeVideos.length > 0) {
      const avgViewsHistorical = allTimeVideos.reduce((sum, video) => sum + (video.views || 0), 0) / allTimeVideos.length;
      const totalLikesHistorical = allTimeVideos.reduce((sum, video) => sum + (video.likes || 0), 0);
      const totalCommentsHistorical = allTimeVideos.reduce((sum, video) => sum + (video.comments || 0), 0);
      const totalSharesHistorical = allTimeVideos.reduce((sum, video) => sum + (video.shares || 0), 0);
      const totalViewsHistorical = allTimeVideos.reduce((sum, video) => sum + (video.views || 0), 0);
      const totalSavesHistorical = allTimeVideos.reduce((sum, video) => sum + (video.saves || 0), 0);
      const totalFollowersHistorical = allTimeVideos.reduce((sum, video) => sum + (video.new_followers || 0), 0);

      const avgViews30D = totalViews30D / last30DaysVideos.length;
      const erHistorical = totalViewsHistorical > 0 ? ((totalLikesHistorical + totalCommentsHistorical + totalSharesHistorical) / totalViewsHistorical) * 100 : 0;
      const savesPer1KHistorical = totalViewsHistorical > 0 ? (totalSavesHistorical / totalViewsHistorical) * 1000 : 0;
      const avgFollowersHistorical = totalFollowersHistorical / allTimeVideos.length;

      comparisons = {
        totalViews: avgViews30D - avgViewsHistorical,
        engagementRate: engagementRate30D - erHistorical,
        savesPer1K: savesPer1K30D - savesPer1KHistorical,
        newFollowers: (totalFollowers30D / last30DaysVideos.length) - avgFollowersHistorical
      };
    }

    return {
      totalViews: totalViews30D,
      engagementRate: engagementRate30D,
      savesPer1K: savesPer1K30D,
      newFollowers: totalFollowers30D,
      comparisons
    };
  }, [videos]);

  // Calculate timeline data for chart
  const timelineData = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyData = new Map();
    
    // Initialize all 30 days with 0 values
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData.set(dateStr, { date: dateStr, views: 0, er: 0, totalEngagement: 0, totalViews: 0 });
    }

    // Aggregate data by day
    videos.forEach(video => {
      const videoDate = new Date(video.published_date);
      if (videoDate >= thirtyDaysAgo) {
        const dateStr = videoDate.toISOString().split('T')[0];
        if (dailyData.has(dateStr)) {
          const dayData = dailyData.get(dateStr);
          dayData.views += video.views || 0;
          dayData.totalEngagement += (video.likes || 0) + (video.comments || 0) + (video.shares || 0);
          dayData.totalViews += video.views || 0;
        }
      }
    });

    // Calculate ER for each day
    dailyData.forEach((dayData, date) => {
      if (dayData.totalViews > 0) {
        dayData.er = (dayData.totalEngagement / dayData.totalViews) * 100;
      }
    });

    return Array.from(dailyData.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(d => ({
        date: new Date(d.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        views: d.views,
        er: Number(d.er.toFixed(2))
      }));
  }, [videos]);

  // Generate action items from insights and patterns
  const actionItems = useMemo(() => {
    const repeat = [];
    const avoid = [];

    // From patterns - what's working
    const topThemes = patterns.filter(p => p.type === 'theme').slice(0, 2);
    const topCTAs = patterns.filter(p => p.type === 'cta').slice(0, 1);
    const topEditing = patterns.filter(p => p.type === 'editing_style').slice(0, 1);

    topThemes.forEach(theme => {
      repeat.push(`Más contenido sobre "${theme.value}" (${theme.avgEngagement.toFixed(1)}% ER)`);
    });
    
    if (topCTAs.length > 0) {
      repeat.push(`Usar CTA "${topCTAs[0].value}" (${topCTAs[0].avgViews.toLocaleString()} views promedio)`);
    }
    
    if (topEditing.length > 0) {
      repeat.push(`Mantener estilo "${topEditing[0].value}" (${topEditing[0].avgEngagement.toFixed(1)}% ER)`);
    }

    // From insights - what to avoid or improve
    insights.forEach(insight => {
      if ((insight.type === 'recommendation' || insight.type === 'strategy') && avoid.length < 3) {
        avoid.push(insight.description.split('.')[0]);
      }
    });

    // Fill with generic advice if needed
    while (repeat.length < 3) {
      if (repeat.length === 0) repeat.push('Publicar consistentemente en horarios de mayor actividad');
      if (repeat.length === 1) repeat.push('Usar hooks fuertes en los primeros 3 segundos');
      if (repeat.length === 2) repeat.push('Interactuar activamente con comentarios');
    }

    while (avoid.length < 3) {
      if (avoid.length === 0) avoid.push('Videos muy largos sin engagement temprano');
      if (avoid.length === 1) avoid.push('CTAs débiles o confusos');
      if (avoid.length === 2) avoid.push('Contenido sin valor claro para la audiencia');
    }

    return { repeat: repeat.slice(0, 3), avoid: avoid.slice(0, 3) };
  }, [insights, patterns]);

  return (
    <div className="p-6 space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-text-primary">AI Content Insights</h1>
          </div>
          <p className="text-text-secondary">AI-powered analysis of your content performance with actionable growth recommendations</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-bright border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Account KPIs (30 days) */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-text-primary">Account KPIs (30 días)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Views (30D)"
                  value={thirtyDaysKPIs.totalViews}
                  change={
                    thirtyDaysKPIs.comparisons.totalViews !== 0 
                      ? `${thirtyDaysKPIs.comparisons.totalViews > 0 ? '↑' : '↓'} vs promedio 30D`
                      : "—"
                  }
                  changeType={
                    thirtyDaysKPIs.comparisons.totalViews > 0 ? 'increase' : 
                    thirtyDaysKPIs.comparisons.totalViews < 0 ? 'decrease' : 'neutral'
                  }
                  icon={<Eye />}
                />
                <MetricCard
                  title="Engagement Rate (30D)"
                  value={`${thirtyDaysKPIs.engagementRate.toFixed(2)}%`}
                  change={
                    thirtyDaysKPIs.comparisons.engagementRate !== 0 
                      ? `${thirtyDaysKPIs.comparisons.engagementRate > 0 ? '↑' : '↓'} vs promedio 30D`
                      : "—"
                  }
                  changeType={
                    thirtyDaysKPIs.comparisons.engagementRate > 0 ? 'increase' : 
                    thirtyDaysKPIs.comparisons.engagementRate < 0 ? 'decrease' : 'neutral'
                  }
                  icon={<Heart />}
                />
                <MetricCard
                  title="Saves por 1K Views (30D)"
                  value={thirtyDaysKPIs.savesPer1K.toFixed(1)}
                  change={
                    thirtyDaysKPIs.comparisons.savesPer1K !== 0 
                      ? `${thirtyDaysKPIs.comparisons.savesPer1K > 0 ? '↑' : '↓'} vs promedio 30D`
                      : "—"
                  }
                  changeType={
                    thirtyDaysKPIs.comparisons.savesPer1K > 0 ? 'increase' : 
                    thirtyDaysKPIs.comparisons.savesPer1K < 0 ? 'decrease' : 'neutral'
                  }
                  icon={<BookmarkPlus />}
                />
                <MetricCard
                  title="New Followers (30D)"
                  value={thirtyDaysKPIs.newFollowers || "—"}
                  change={
                    thirtyDaysKPIs.comparisons.newFollowers !== 0 
                      ? `${thirtyDaysKPIs.comparisons.newFollowers > 0 ? '↑' : '↓'} vs promedio 30D`
                      : "—"
                  }
                  changeType={
                    thirtyDaysKPIs.comparisons.newFollowers > 0 ? 'increase' : 
                    thirtyDaysKPIs.comparisons.newFollowers < 0 ? 'decrease' : 'neutral'
                  }
                  icon={<Users />}
                />
              </div>
            </section>

            {/* Growth Timeline + Action Panel */}
            <section>
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                {/* Timeline Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-text-primary flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      Growth Timeline (30D)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timelineData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="date" 
                            stroke="hsl(var(--text-muted))"
                            fontSize={12}
                          />
                          <YAxis 
                            yAxisId="views"
                            orientation="left"
                            stroke="hsl(var(--text-muted))"
                            fontSize={12}
                          />
                          <YAxis 
                            yAxisId="er"
                            orientation="right"
                            stroke="hsl(var(--text-muted))"
                            fontSize={12}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              color: 'hsl(var(--text-primary))'
                            }}
                            formatter={(value, name) => [
                              name === 'views' ? value.toLocaleString() : `${value}%`,
                              name === 'views' ? 'Views' : 'Engagement Rate'
                            ]}
                          />
                          <Legend />
                          <Line 
                            yAxisId="views"
                            type="monotone" 
                            dataKey="views" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            name="Views"
                            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                          />
                          <Line 
                            yAxisId="er"
                            type="monotone" 
                            dataKey="er" 
                            stroke="hsl(var(--accent))" 
                            strokeWidth={2}
                            name="Engagement Rate (%)"
                            dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Panel */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-text-primary text-base flex items-center gap-2">
                        <ArrowUp className="w-4 h-4 text-green-400" />
                        Qué repetir esta semana
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {actionItems.repeat.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-text-secondary leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-text-primary text-base flex items-center gap-2">
                        <ArrowDown className="w-4 h-4 text-red-400" />
                        Qué evitar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {actionItems.avoid.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-text-secondary leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {videos.length < 5 && (
                    <Card className="border-dashed">
                      <CardContent className="py-4 text-center">
                        <Sparkles className="w-8 h-8 text-text-muted mx-auto mb-2" />
                        <p className="text-xs text-text-muted">Sube más videos para ver patrones confiables</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </section>

            {/* Performance Scores */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-text-primary">Performance Scores</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ScoreCard
                  title="Content Quality"
                  score={performanceScores.contentQuality}
                  description="Based on engagement rate and watch time metrics"
                  color="blue"
                />
                <ScoreCard
                  title="Viral Potential"
                  score={performanceScores.viralPotential}
                  description="Likelihood of content reaching viral status"
                  color="green"
                />
                <ScoreCard
                  title="Monetization Ready"
                  score={performanceScores.monetizationReadiness}
                  description="Potential for generating revenue and conversions"
                  color="orange"
                />
                <ScoreCard
                  title="Overall Growth"
                  score={performanceScores.overallGrowth}
                  description="Combined score across all performance metrics"
                  color="purple"
                />
              </div>
            </section>

            {/* AI Insights */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-semibold text-text-primary">AI-Generated Insights</h2>
              </div>
              {insights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {insights.map((insight) => (
                    <InsightCard
                      key={insight.id}
                      title={insight.title}
                      description={insight.description}
                      type={insight.type}
                      impact={insight.impact}
                      confidence={insight.confidence}
                      metrics={insight.metrics}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Sparkles className="w-16 h-16 text-text-muted mx-auto mb-4" />
                    <p className="text-text-secondary">Add more videos to unlock AI insights</p>
                    <p className="text-sm text-text-muted mt-1">We need at least 5 videos to generate meaningful patterns</p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* AI-Powered Tools */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-text-primary">AI-Powered Tools</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AIContentSuggestions />
                <ViralPotentialAnalyzer />
              </div>
            </section>

            {/* Content Performance Breakdown */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-text-primary">Content Pattern Analysis</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Themes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-text-primary text-base">Top Performing Themes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patterns.filter(p => p.type === 'theme').slice(0, 5).map((pattern, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                            <span className="text-sm text-text-secondary">{pattern.value}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-text-primary">{pattern.avgEngagement.toFixed(1)}%</div>
                            <div className="text-xs text-text-muted">{pattern.videoCount} videos</div>
                          </div>
                        </div>
                      ))}
                      {patterns.filter(p => p.type === 'theme').length === 0 && (
                        <p className="text-sm text-text-muted">Add theme data to see patterns</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Best CTAs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-text-primary text-base">Most Effective CTAs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patterns.filter(p => p.type === 'cta').slice(0, 5).map((pattern, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                            <span className="text-sm text-text-secondary">{pattern.value}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-text-primary">{pattern.avgViews.toLocaleString()}</div>
                            <div className="text-xs text-text-muted">avg views</div>
                          </div>
                        </div>
                      ))}
                      {patterns.filter(p => p.type === 'cta').length === 0 && (
                        <p className="text-sm text-text-muted">Add CTA data to see patterns</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Editing Styles */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-text-primary text-base">Top Editing Styles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patterns.filter(p => p.type === 'editing_style').slice(0, 5).map((pattern, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                            <span className="text-sm text-text-secondary">{pattern.value}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-text-primary">{pattern.avgEngagement.toFixed(1)}%</div>
                            <div className="text-xs text-text-muted">{pattern.videoCount} videos</div>
                          </div>
                        </div>
                      ))}
                      {patterns.filter(p => p.type === 'editing_style').length === 0 && (
                        <p className="text-sm text-text-muted">Add editing style data to see patterns</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Overview Metrics */}
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">Overview Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Views"
                  value={analytics?.totalViews || 0}
                  change={`${analytics?.totalVideos || 0} videos`}
                  changeType="neutral"
                  icon={<Eye />}
                />
                <MetricCard
                  title="Total Likes"
                  value={analytics?.totalLikes || 0}
                  change={`${analytics?.avgEngagementRate?.toFixed(1) || 0}% avg engagement`}
                  changeType="neutral"
                  icon={<Heart />}
                />
                <MetricCard
                  title="Total Comments"
                  value={analytics?.totalComments || 0}
                  change={`${analytics?.viralCount || 0} viral videos`}
                  changeType="neutral"
                  icon={<MessageCircle />}
                />
                <MetricCard
                  title="Avg Views"
                  value={analytics?.avgViews || 0}
                  change={`per video`}
                  changeType="neutral"
                  icon={<TrendingUp />}
                />
              </div>
            </section>
          </div>
        )}
    </div>
  );
};

export default Analytics;