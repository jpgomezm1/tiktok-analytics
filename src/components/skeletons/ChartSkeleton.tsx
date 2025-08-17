import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const LineChartSkeleton = () => {
  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-muted animate-pulse rounded"></div>
          <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 relative">
          {/* Chart area */}
          <div className="absolute inset-0 bg-muted/20 rounded animate-pulse"></div>
          
          {/* Mock data points */}
          <div className="absolute inset-4 flex items-end justify-between">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className="w-2 bg-muted animate-pulse rounded-t"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              ></div>
            ))}
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-3 w-8 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
          
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-4 right-4 flex justify-between">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-3 w-6 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const PieChartSkeleton = () => {
  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-muted animate-pulse rounded"></div>
          <div className="h-5 w-28 bg-muted animate-pulse rounded"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border-8 border-muted animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export const BarChartSkeleton = () => {
  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-muted animate-pulse rounded"></div>
          <div className="h-5 w-36 bg-muted animate-pulse rounded"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 relative">
          <div className="absolute inset-0 flex items-end justify-center gap-2 p-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i} 
                className="flex-1 bg-muted animate-pulse rounded-t max-w-8"
                style={{ height: `${Math.random() * 70 + 10}%` }}
              ></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};