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
import { TrendingUp, Eye, Heart, MessageCircle, Brain, Lightbulb, Target, DollarSign, BarChart3, Sparkles } from 'lucide-react';

const Analytics = () => {
  const { videos, analytics, loading } = useVideos();
  
  const aiEngine = useMemo(() => new AnalyticsEngine(videos), [videos]);
  const performanceScores = useMemo(() => aiEngine.calculatePerformanceScores(), [aiEngine]);
  const insights = useMemo(() => aiEngine.generateInsights(), [aiEngine]);
  const patterns = useMemo(() => aiEngine.analyzeContentPatterns(), [aiEngine]);

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