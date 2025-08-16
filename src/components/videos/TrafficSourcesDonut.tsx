import { useMemo } from 'react';
import { ProcessedVideo } from '@/types/dashboard';

interface TrafficSourcesDonutProps {
  video: ProcessedVideo;
  size?: 'sm' | 'md';
}

export const TrafficSourcesDonut = ({ video, size = 'md' }: TrafficSourcesDonutProps) => {
  const data = useMemo(() => {
    const total = (video.traffic_for_you || 0) + 
                  (video.traffic_follow || 0) + 
                  (video.traffic_hashtag || 0) + 
                  (video.traffic_sound || 0) + 
                  (video.traffic_profile || 0) + 
                  (video.traffic_search || 0);

    if (total === 0) return [];

    const sources = [
      { 
        name: 'For You', 
        value: video.traffic_for_you || 0, 
        color: '#8b5cf6',
        percentage: ((video.traffic_for_you || 0) / total) * 100 
      },
      { 
        name: 'Follow', 
        value: video.traffic_follow || 0, 
        color: '#06b6d4',
        percentage: ((video.traffic_follow || 0) / total) * 100 
      },
      { 
        name: 'Hashtag', 
        value: video.traffic_hashtag || 0, 
        color: '#10b981',
        percentage: ((video.traffic_hashtag || 0) / total) * 100 
      },
      { 
        name: 'Sound', 
        value: video.traffic_sound || 0, 
        color: '#f59e0b',
        percentage: ((video.traffic_sound || 0) / total) * 100 
      },
      { 
        name: 'Profile', 
        value: video.traffic_profile || 0, 
        color: '#ef4444',
        percentage: ((video.traffic_profile || 0) / total) * 100 
      },
      { 
        name: 'Search', 
        value: video.traffic_search || 0, 
        color: '#6366f1',
        percentage: ((video.traffic_search || 0) / total) * 100 
      },
    ].filter(source => source.value > 0);

    return sources;
  }, [video]);

  const dimension = size === 'sm' ? 32 : 48;
  const strokeWidth = size === 'sm' ? 3 : 4;
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (data.length === 0) {
    return (
      <div className={`${size === 'sm' ? 'w-8 h-8' : 'w-12 h-12'} flex items-center justify-center`}>
        <div className="text-xs text-text-muted">—</div>
      </div>
    );
  }

  let accumulatedPercentage = 0;

  return (
    <div className={`relative ${size === 'sm' ? 'w-8 h-8' : 'w-12 h-12'}`}>
      <svg
        width={dimension}
        height={dimension}
        className="transform -rotate-90"
      >
        {data.map((source, index) => {
          const dashArray = (source.percentage / 100) * circumference;
          const dashOffset = circumference - (accumulatedPercentage / 100) * circumference;
          
          accumulatedPercentage += source.percentage;
          
          return (
            <circle
              key={source.name}
              cx={dimension / 2}
              cy={dimension / 2}
              r={radius}
              fill="none"
              stroke={source.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashArray} ${circumference}`}
              strokeDashoffset={-dashOffset}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
      
      {/* Center text showing dominant source */}
      {size === 'md' && data.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs font-medium text-text-primary">
              {data[0].name.slice(0, 3)}
            </div>
            <div className="text-xs text-text-muted">
              {data[0].percentage.toFixed(0)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};