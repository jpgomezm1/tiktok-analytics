import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVideos } from '@/hooks/useVideos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, Heart, MessageCircle, Share2, Clock, TrendingUp, ExternalLink } from 'lucide-react';

const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { videos, loading } = useVideos();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-bright border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const video = videos.find(v => v.id === id);

  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Video Not Found</h1>
            <p className="text-text-secondary mb-6">The video you're looking for doesn't exist.</p>
            <Link to="/videos">
              <Button className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Videos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const engagementRate = video.views > 0 ? ((video.likes + video.comments + video.shares) / video.views * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Link to="/videos">
            <Button variant="outline" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Videos
            </Button>
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">{video.title}</h1>
              <p className="text-text-secondary">Published on {new Date(video.published_date).toLocaleDateString()}</p>
            </div>
            {video.video_url && (
              <Button variant="outline" className="gap-2 mt-4 lg:mt-0" asChild>
                <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  View Video
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Preview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-text-primary">Video Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {video.image_url ? (
                  <img 
                    src={video.image_url} 
                    alt={video.title}
                    className="w-full aspect-[9/16] object-cover rounded-lg bg-card-muted"
                  />
                ) : (
                  <div className="w-full aspect-[9/16] bg-card-muted rounded-lg flex items-center justify-center">
                    <p className="text-text-muted">No preview available</p>
                  </div>
                )}
                
                {video.hook && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-text-primary mb-2">Hook</h3>
                    <p className="text-sm text-text-secondary bg-card-muted p-3 rounded">{video.hook}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-text-primary">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-dark/20 rounded-full mx-auto mb-2">
                      <Eye className="w-6 h-6 text-purple-bright" />
                    </div>
                    <div className="text-2xl font-bold text-text-primary">{video.views.toLocaleString()}</div>
                    <div className="text-sm text-text-secondary">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-dark/20 rounded-full mx-auto mb-2">
                      <Heart className="w-6 h-6 text-purple-bright" />
                    </div>
                    <div className="text-2xl font-bold text-text-primary">{video.likes.toLocaleString()}</div>
                    <div className="text-sm text-text-secondary">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-dark/20 rounded-full mx-auto mb-2">
                      <MessageCircle className="w-6 h-6 text-purple-bright" />
                    </div>
                    <div className="text-2xl font-bold text-text-primary">{video.comments.toLocaleString()}</div>
                    <div className="text-sm text-text-secondary">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-dark/20 rounded-full mx-auto mb-2">
                      <Share2 className="w-6 h-6 text-purple-bright" />
                    </div>
                    <div className="text-2xl font-bold text-text-primary">{video.shares.toLocaleString()}</div>
                    <div className="text-sm text-text-secondary">Shares</div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Engagement Rate</span>
                    <Badge variant={engagementRate > 5 ? 'default' : engagementRate > 2 ? 'secondary' : 'outline'}>
                      {engagementRate.toFixed(1)}%
                    </Badge>
                  </div>
                  {video.duration_seconds && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-text-secondary">Duration</span>
                      <span className="text-text-primary">{video.duration_seconds}s</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-text-primary">Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'For You Page', value: video.traffic_for_you, color: 'bg-purple-bright' },
                    { label: 'Following', value: video.traffic_follow, color: 'bg-blue-500' },
                    { label: 'Hashtags', value: video.traffic_hashtag, color: 'bg-green-500' },
                    { label: 'Sounds', value: video.traffic_sound, color: 'bg-yellow-500' },
                    { label: 'Profile', value: video.traffic_profile, color: 'bg-red-500' },
                    { label: 'Search', value: video.traffic_search, color: 'bg-indigo-500' },
                  ].map((source) => {
                    const percentage = video.views > 0 ? (source.value / video.views * 100) : 0;
                    return (
                      <div key={source.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
                          <span className="text-text-secondary">{source.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-text-primary font-medium">{source.value.toLocaleString()}</div>
                          <div className="text-xs text-text-muted">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            {video.guion && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-text-primary">Script/Guion</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary whitespace-pre-wrap">{video.guion}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;