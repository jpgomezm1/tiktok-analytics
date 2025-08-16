import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { useT } from '@/i18n';

interface Video {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  published_date: string;
}

interface PerformanceTrendsChartProps {
  videos: Video[];
}

interface ChartDataPoint {
  date: string;
  formattedDate: string;
  views: number;
  engagementRate: number;
}

export const PerformanceTrendsChart = ({ videos }: PerformanceTrendsChartProps) => {
  const t = useT;
  const chartData = useMemo(() => {
    if (!videos || videos.length === 0) return [];

    // Generate last 30 days
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 29);
    const days: ChartDataPoint[] = [];
    
    for (let i = 0; i < 30; i++) {
      const currentDay = subDays(today, 29 - i);
      const dateKey = format(currentDay, 'yyyy-MM-dd');
      const formattedDate = format(currentDay, 'MMM dd');
      
      // Filter videos published on this day
      const videosFromDay = videos.filter(video => {
        const videoDate = new Date(video.published_date);
        return isSameDay(videoDate, currentDay);
      });
      
      if (videosFromDay.length > 0) {
        const totalViews = videosFromDay.reduce((sum, video) => sum + video.views, 0);
        const totalEngagement = videosFromDay.reduce(
          (sum, video) => sum + video.likes + video.comments + video.shares, 
          0
        );
        
        const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;
        
        days.push({
          date: dateKey,
          formattedDate,
          views: totalViews,
          engagementRate: Number(engagementRate.toFixed(1))
        });
      } else {
        // Include days with no videos as 0 values for continuity
        days.push({
          date: dateKey,
          formattedDate,
          views: 0,
          engagementRate: 0
        });
      }
    }
    
    return days;
  }, [videos]);

  // Check if we have meaningful data (at least one day with views > 0)
  const hasData = chartData.some(day => day.views > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-center">
        <div>
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            📊
          </div>
          <p className="text-text-muted">{t('chart.noData')}</p>
          <p className="text-text-muted text-sm mt-1">Agrega videos de los últimos 30 días</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-card">
          <p className="text-text-primary font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'views' ? t('chart.views') : t('chart.engagementRate')}: {' '}
              {entry.dataKey === 'engagementRate' ? `${entry.value}%` : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="formattedDate" 
            stroke="hsl(var(--text-muted))"
            fontSize={12}
            tick={{ fill: 'hsl(var(--text-muted))' }}
          />
          <YAxis 
            yAxisId="views"
            stroke="hsl(var(--purple-bright))"
            fontSize={12}
            tick={{ fill: 'hsl(var(--text-muted))' }}
          />
          <YAxis 
            yAxisId="engagement"
            orientation="right"
            stroke="hsl(var(--success))"
            fontSize={12}
            tick={{ fill: 'hsl(var(--text-muted))' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              color: 'hsl(var(--text-secondary))',
              fontSize: '14px'
            }}
          />
          <Line
            yAxisId="views"
            type="monotone"
            dataKey="views"
            stroke="hsl(var(--purple-bright))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--purple-bright))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--purple-bright))', strokeWidth: 2 }}
            name={t('chart.views')}
          />
          <Line
            yAxisId="engagement"
            type="monotone"
            dataKey="engagementRate"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--success))', strokeWidth: 2 }}
            name={t('chart.engagementRate')}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};