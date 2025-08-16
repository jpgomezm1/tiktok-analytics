import { ProcessedVideo } from '@/types/dashboard';

export const exportToCSV = (videos: ProcessedVideo[], filename?: string) => {
  // Define columns to export
  const columns = [
    { key: 'title', label: 'Título' },
    { key: 'published_date', label: 'Fecha de publicación' },
    { key: 'views', label: 'Vistas' },
    { key: 'likes', label: 'Likes' },
    { key: 'comments', label: 'Comentarios' },
    { key: 'shares', label: 'Compartidos' },
    { key: 'saves', label: 'Guardados' },
    { key: 'engagement_rate', label: 'Engagement Rate (%)' },
    { key: 'saves_per_1k', label: 'Saves por 1K' },
    { key: 'performance_score', label: 'Performance Score' },
    { key: 'speed_2h', label: 'Velocidad 2h' },
    { key: 'video_theme', label: 'Tema' },
    { key: 'cta_type', label: 'Tipo de CTA' },
    { key: 'editing_style', label: 'Estilo de edición' },
    { key: 'hook', label: 'Hook' },
    { key: 'duration_seconds', label: 'Duración (segundos)' },
    { key: 'traffic_for_you', label: 'Tráfico For You' },
    { key: 'traffic_follow', label: 'Tráfico Follow' },
    { key: 'traffic_hashtag', label: 'Tráfico Hashtag' },
    { key: 'traffic_sound', label: 'Tráfico Sound' },
    { key: 'traffic_profile', label: 'Tráfico Profile' },
    { key: 'traffic_search', label: 'Tráfico Search' },
  ];

  // Create CSV header
  const header = columns.map(col => col.label).join(',');

  // Create CSV rows
  const rows = videos.map(video => {
    return columns.map(col => {
      let value = (video as any)[col.key];
      
      // Handle special formatting
      if (col.key === 'engagement_rate' && typeof value === 'number') {
        value = value.toFixed(2);
      } else if (col.key === 'saves_per_1k' && typeof value === 'number') {
        value = value.toFixed(1);
      } else if (col.key === 'performance_score' && typeof value === 'number') {
        value = value.toFixed(0);
      } else if (typeof value === 'string' && value.includes(',')) {
        // Escape commas in strings
        value = `"${value}"`;
      } else if (value === null || value === undefined) {
        value = '';
      }
      
      return value;
    }).join(',');
  });

  // Combine header and rows
  const csvContent = [header, ...rows].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `videos_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};