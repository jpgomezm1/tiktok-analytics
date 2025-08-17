import { Card, CardContent } from '@/components/ui/card';

export const VideoCardSkeleton = () => {
  return (
    <Card className="bg-card border-border shadow-card">
      <CardContent className="p-lg">
        <div className="flex gap-md">
          {/* Video Thumbnail Skeleton */}
          <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 animate-pulse"></div>

          {/* Video Info Skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
              <div className="h-6 w-16 bg-muted animate-pulse rounded-full"></div>
            </div>

            <div className="h-3 w-1/2 bg-muted animate-pulse rounded"></div>

            {/* Metrics Skeleton */}
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-muted animate-pulse rounded"></div>
                  <div className="h-3 w-8 bg-muted animate-pulse rounded"></div>
                </div>
              ))}
            </div>

            {/* Enhanced Metrics Skeleton */}
            <div className="pt-2 border-t border-border">
              <div className="grid grid-cols-2 gap-1">
                <div className="h-3 w-12 bg-muted animate-pulse rounded"></div>
                <div className="h-3 w-14 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const VideoGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-xl">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
};