import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/MetricCard';
import { VideoCard } from '@/components/VideoCard';
import { CSVImportModal } from '@/components/CSVImportModal';
import { useVideos } from '@/hooks/useVideos';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/i18n';
import { 
  Users, 
  Eye, 
  Heart, 
  TrendingUp, 
  Plus, 
  BarChart3, 
  Upload,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceTrendsChart } from '@/components/PerformanceTrendsChart';

const Dashboard = () => {
  const { analytics, loading, videos, addVideo } = useVideos();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const t = useT;
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
          <p className="text-text-secondary">{t('dashboard.loadingAnalytics')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">{t('dashboard.title')}</h1>
          <p className="text-text-secondary">
            {t('dashboard.welcomeBack')}, {user?.user_metadata?.display_name || user?.email}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddVideo(true)}
            className="text-text-secondary border-border hover:bg-muted"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t('dashboard.addVideo')}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCSVImport(true)}
            className="text-text-secondary border-border hover:bg-muted"
          >
            <Upload className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t('dashboard.importData')}</span>
          </Button>
        </div>
      </div>
            {!analytics || analytics.totalVideos === 0 ? (
              // Empty state
              <div className="max-w-2xl mx-auto text-center py-12">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-text-primary mb-4">
                  {t('dashboard.emptyTitle')}
                </h2>
                <p className="text-lg text-text-secondary mb-8">
                  {t('dashboard.emptyDescription')}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => setShowAddVideo(true)}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('dashboard.addFirstVideo')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCSVImport(true)}
                    className="border-border text-text-secondary"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t('dashboard.importCSVData')}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title={t('metrics.totalFollowers')}
                    value={15847}
                    change={`+8.5% ${t('metrics.thisMonth')}`}
                    changeType="increase"
                    icon={<Users />}
                  />
                  <MetricCard
                    title={t('metrics.avgViews')}
                    value={analytics.avgViews}
                    change={`+11.2% ${t('metrics.vsLastMonth')}`}
                    changeType="increase"
                    icon={<Eye />}
                  />
                  <MetricCard
                    title={t('metrics.engagementRate')}
                    value={`${analytics.avgEngagementRate.toFixed(1)}%`}
                    change={`-2.1% ${t('metrics.vsLastMonth')}`}
                    changeType="decrease"
                    icon={<Heart />}
                  />
                  <MetricCard
                    title={t('metrics.viralVideos')}
                    value={analytics.viralCount}
                    change={t('metrics.thisMonth')}
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
                        {t('dashboard.performanceOverview')}
                      </CardTitle>
                      <CardDescription className="text-text-secondary">
                        {t('dashboard.last30Days')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PerformanceTrendsChart videos={videos} />
                    </CardContent>
                  </Card>

                  {/* Top Performers */}
                  <Card className="bg-card border-border shadow-card">
                    <CardHeader>
                      <CardTitle className="text-text-primary">{t('dashboard.topPerformers')}</CardTitle>
                      <CardDescription className="text-text-secondary">
                        {t('dashboard.topPerformersDesc')}
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
                          <p className="text-text-muted">{t('dashboard.noTopPerformers')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Videos */}
                <Card className="bg-card border-border shadow-card">
                  <CardHeader>
                    <CardTitle className="text-text-primary">{t('dashboard.recentVideos')}</CardTitle>
                    <CardDescription className="text-text-secondary">
                      {t('dashboard.recentVideosDesc')}
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
                        <p className="text-text-muted">{t('dashboard.noVideos')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

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