import { useAuth } from '@/hooks/useAuth';
import { useVideos } from '@/hooks/useVideos';
import { MetricCard } from '@/components/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Eye, Heart, MessageCircle, Share2, Users, Target, Zap } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Analytics = () => {
  const { user, loading: authLoading } = useAuth();
  const { analytics, loading } = useVideos();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-bright border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Analytics Dashboard</h1>
          <p className="text-text-secondary">Deep insights into your TikTok performance and growth patterns</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-bright border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Performance Metrics */}
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">Performance Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Views"
                  value={analytics?.totalViews || 0}
                  change="+12.5% vs last month"
                  changeType="increase"
                  icon={<Eye />}
                />
                <MetricCard
                  title="Total Likes"
                  value={analytics?.totalLikes || 0}
                  change="+8.3% vs last month"
                  changeType="increase"
                  icon={<Heart />}
                />
                <MetricCard
                  title="Total Comments"
                  value={analytics?.totalComments || 0}
                  change="+15.7% vs last month"
                  changeType="increase"
                  icon={<MessageCircle />}
                />
                <MetricCard
                  title="Avg Engagement Rate"
                  value={`${analytics?.avgEngagementRate?.toFixed(1) || 0}%`}
                  change="-2.1% vs last month"
                  changeType="decrease"
                  icon={<TrendingUp />}
                />
              </div>
            </section>

            {/* Growth Insights */}
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">Growth Insights</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-text-primary">
                      <Target className="w-5 h-5" />
                      Top Performing Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-text-secondary">Short-form tutorials</span>
                        <span className="text-success">+24% engagement</span>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-text-secondary">Behind-the-scenes</span>
                        <span className="text-success">+18% engagement</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Trending challenges</span>
                        <span className="text-success">+12% engagement</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-text-primary">
                      <Users className="w-5 h-5" />
                      Audience Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-text-secondary">Peak activity</span>
                        <span className="text-text-primary">7-9 PM</span>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-text-secondary">Best posting day</span>
                        <span className="text-text-primary">Friday</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Avg watch time</span>
                        <span className="text-text-primary">18.5s</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-text-primary">
                      <Zap className="w-5 h-5" />
                      Optimization Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div className="p-2 bg-purple-dark/20 rounded">
                        <span className="text-text-primary">Hook optimization: First 3 seconds are critical</span>
                      </div>
                      <div className="p-2 bg-purple-dark/20 rounded">
                        <span className="text-text-primary">Optimal length: 15-25 seconds for max completion</span>
                      </div>
                      <div className="p-2 bg-purple-dark/20 rounded">
                        <span className="text-text-primary">Trending sounds boost discovery by 40%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Performance Chart Placeholder */}
            <section>
              <h2 className="text-xl font-semibold text-text-primary mb-4">Performance Timeline</h2>
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <p className="text-text-secondary">Performance chart will be implemented here</p>
                  <p className="text-sm text-text-muted mt-1">Shows views, engagement, and growth over time</p>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;