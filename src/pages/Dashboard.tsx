import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/MetricCard';
import { VideoCard } from '@/components/VideoCard';
import { CSVImportModal } from '@/components/CSVImportModal';
import { useVideos } from '@/hooks/useVideos';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Eye, 
  Heart, 
  TrendingUp, 
  Plus, 
  BarChart3, 
  Settings,
  LogOut,
  Upload,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const { analytics, loading, videos, addVideo } = useVideos();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-bright border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              TikTok Analytics
            </h1>
            <div className="h-6 w-px bg-border" />
            <p className="text-text-secondary">
              Welcome back, {user?.user_metadata?.display_name || user?.email}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddVideo(true)}
              className="text-text-secondary border-border hover:bg-muted"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCSVImport(true)}
              className="text-text-secondary border-border hover:bg-muted"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-text-secondary"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-text-secondary"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {!analytics || analytics.totalVideos === 0 ? (
          // Empty state
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Ready to Analyze Your TikTok Performance?
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Start by adding your first video or importing your existing TikTok data to unlock powerful insights and growth opportunities.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => setShowAddVideo(true)}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Video
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCSVImport(true)}
                className="border-border text-text-secondary"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV Data
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Followers"
                value={15847}
                change="+8.5% this month"
                changeType="increase"
                icon={<Users />}
              />
              <MetricCard
                title="Avg Views"
                value={analytics.avgViews}
                change="+11.2% vs last month"
                changeType="increase"
                icon={<Eye />}
              />
              <MetricCard
                title="Engagement Rate"
                value={`${analytics.avgEngagementRate.toFixed(1)}%`}
                change="-2.1% vs last month"
                changeType="decrease"
                icon={<Heart />}
              />
              <MetricCard
                title="Viral Videos"
                value={analytics.viralCount}
                change="This month"
                changeType="neutral"
                icon={<TrendingUp />}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Growth Chart */}
              <Card className="bg-card border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-text-primary flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Overview
                  </CardTitle>
                  <CardDescription className="text-text-secondary">
                    Last 30 days performance trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="w-8 h-8 text-purple-bright mx-auto mb-2" />
                      <p className="text-text-muted">Chart coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className="bg-card border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-text-primary">Top Performers</CardTitle>
                  <CardDescription className="text-text-secondary">
                    Your best performing videos this month
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics.topPerformers.length > 0 ? (
                    analytics.topPerformers.slice(0, 3).map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="w-8 h-8 text-text-muted mx-auto mb-2" />
                      <p className="text-text-muted">No top performers yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Videos */}
            <Card className="bg-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-text-primary">Recent Videos</CardTitle>
                <CardDescription className="text-text-secondary">
                  Your latest content performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.recentVideos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.recentVideos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Plus className="w-8 h-8 text-text-muted mx-auto mb-2" />
                    <p className="text-text-muted">No videos added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <CSVImportModal
        open={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        onImport={async (videosData) => {
          for (const video of videosData) {
            await addVideo(video);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;