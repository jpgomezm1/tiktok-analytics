import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, Eye, Heart, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ProcessedVideo } from '@/types/dashboard';

interface VideoExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  videos: ProcessedVideo[];
  type: 'top' | 'bottom';
}

export const VideoExamplesModal = ({
  isOpen,
  onClose,
  videos,
  type
}: VideoExamplesModalProps) => {
  const typeConfig = {
    top: {
      title: 'Ejemplos Top 10%',
      description: 'Videos con mejor rendimiento - patrones a replicar',
      badgeClass: 'bg-green-600/20 text-green-400 border-green-600/20',
      emoji: '🔥'
    },
    bottom: {
      title: 'Ejemplos Bottom 10%',
      description: 'Videos con menor rendimiento - patrones a evitar',
      badgeClass: 'bg-red-600/20 text-red-400 border-red-600/20',
      emoji: '❌'
    }
  };

  const config = typeConfig[type];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-text-primary flex items-center gap-2">
            <span>{config.emoji}</span>
            {config.title}
          </DialogTitle>
          <p className="text-text-secondary">{config.description}</p>
        </DialogHeader>

        <div className="space-y-4">
          {videos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-muted">No hay videos en esta categoría</p>
            </div>
          ) : (
            videos.map((video) => (
              <div
                key={video.id}
                className="p-4 border border-border rounded-lg bg-muted/10 space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-primary truncate">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-text-muted" />
                      <span className="text-xs text-text-muted">
                        {format(new Date(video.published_date), 'dd MMM yyyy', { locale: es })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={config.badgeClass}>
                      {config.emoji} {type === 'top' ? 'Top' : 'Bottom'}
                    </Badge>
                    {video.video_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(video.video_url, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Eye className="w-3 h-3" />
                      <span>Views</span>
                    </div>
                    <div className="text-sm font-medium text-text-primary">
                      {formatNumber(video.views)}
                    </div>
                    <div className="text-xs text-purple-400">
                      Norm: {video.views_norm.toFixed(3)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Heart className="w-3 h-3" />
                      <span>ER</span>
                    </div>
                    <div className="text-sm font-medium text-text-primary">
                      {video.engagement_rate.toFixed(1)}%
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Bookmark className="w-3 h-3" />
                      <span>Saves/1K</span>
                    </div>
                    <div className="text-sm font-medium text-text-primary">
                      {video.saves_per_1k.toFixed(1)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-text-muted">Finalización</div>
                    <div className="text-sm font-medium text-text-primary">
                      {video.completion_rate.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Performance Bar */}
                <div className="space-y-2">
                  <div className="text-xs text-text-muted">Rendimiento relativo</div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        type === 'top' 
                          ? 'bg-gradient-to-r from-green-600 to-green-400' 
                          : 'bg-gradient-to-r from-red-600 to-red-400'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(10, video.views_norm * 1000))}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};