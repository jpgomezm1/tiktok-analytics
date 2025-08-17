import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlayCircle, 
  BarChart3, 
  Sparkles,
  Search,
  Lightbulb,
  TrendingUp,
  Target,
  Settings
} from 'lucide-react';

const pageInfo: Record<string, { title: string; description: string; icon: React.ElementType; color: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'KPIs accionables para impulsar tu crecimiento',
    icon: LayoutDashboard,
    color: 'text-purple-bright'
  },
  '/videos': {
    title: 'Explorador de Videos',
    description: 'Encuentra patrones usando señales fuertes y ranking por percentiles',
    icon: PlayCircle,
    color: 'text-blue-400'
  },
  '/analytics': {
    title: 'AI Content Insights',
    description: 'AI-powered analysis of your content performance with actionable growth recommendations',
    icon: BarChart3,
    color: 'text-green-400'
  },
  '/ai-generate': {
    title: 'AI Generate',
    description: 'Copiloto creativo con Claude & TikTok Brain - Ideas, guiones e insights basados en tus datos',
    icon: Sparkles,
    color: 'text-yellow-400'
  },
  '/brain-search': {
    title: 'Brain Search',
    description: 'Búsqueda semántica en tu contenido histórico',
    icon: Search,
    color: 'text-cyan-400'
  },
  '/content-ideas': {
    title: 'Content Ideas',
    description: 'Generador de ideas basado en tus patrones exitosos',
    icon: Lightbulb,
    color: 'text-orange-400'
  },
  '/viral-analyzer': {
    title: 'Analizador Viral',
    description: 'Predice el potencial viral de tu contenido',
    icon: TrendingUp,
    color: 'text-pink-400'
  },
  '/context': {
    title: 'Contexto de Cuenta',
    description: 'Configura tu perfil y contexto para AI personalizado',
    icon: Target,
    color: 'text-indigo-400'
  },
  '/settings': {
    title: 'Settings',
    description: 'Configuración de la aplicación y preferencias',
    icon: Settings,
    color: 'text-gray-400'
  }
};

export const PageHeader = () => {
  const location = useLocation();
  
  // Handle video detail pages
  const isVideoDetail = location.pathname.startsWith('/videos/') && location.pathname !== '/videos';
  const currentPath = isVideoDetail ? '/videos' : location.pathname;
  
  const currentPage = pageInfo[currentPath];
  
  if (!currentPage) return null;

  const IconComponent = currentPage.icon;

  return (
    <div className="mb-xl">
      <div className="flex items-center gap-lg mb-sm">
        <div className={`w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow`}>
          <IconComponent className={`w-6 h-6 ${currentPage.color}`} />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-text-primary">
            {isVideoDetail ? 'Video Detail' : currentPage.title}
          </h1>
          <p className="text-text-secondary mt-xs">
            {isVideoDetail ? 'Análisis detallado del rendimiento del video' : currentPage.description}
          </p>
        </div>
      </div>
    </div>
  );
};