import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const KPISkeleton = () => {
  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
          <div className="h-3 w-3 bg-muted animate-pulse rounded-full"></div>
        </div>
        <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="space-y-2">
            <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 bg-muted animate-pulse rounded"></div>
              <div className="h-3 w-12 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const KPIGridSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
      {Array.from({ length: count }).map((_, i) => (
        <KPISkeleton key={i} />
      ))}
    </div>
  );
};