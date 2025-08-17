import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, PlayCircle, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NoVideosStateProps {
  title?: string;
  subtitle?: string;
  showImportButton?: boolean;
  showExampleButton?: boolean;
}

export const NoVideosState = ({ 
  title = "No hay videos aún",
  subtitle = "Importa tus videos de TikTok para comenzar a analizar tu contenido",
  showImportButton = true,
  showExampleButton = false
}: NoVideosStateProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-dashed border-2 border-border bg-muted/10">
      <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="relative mb-8">
          {/* Animated background circles */}
          <div className="absolute inset-0 -m-4">
            <div className="w-20 h-20 bg-purple-bright/10 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute inset-0 -m-2 animate-pulse delay-75">
            <div className="w-16 h-16 bg-purple-bright/20 rounded-full"></div>
          </div>
          
          {/* Main icon */}
          <div className="relative z-10 w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <PlayCircle className="w-6 h-6 text-white" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-text-primary mb-sm">{title}</h3>
        <p className="text-text-secondary mb-xl max-w-md leading-relaxed">{subtitle}</p>

        <div className="flex flex-col sm:flex-row gap-md">
          {showImportButton && (
            <Button 
              onClick={() => navigate('/videos')}
              className="bg-gradient-primary hover:shadow-glow transition-smooth"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar Videos
            </Button>
          )}
          
          {showExampleButton && (
            <Button 
              variant="outline"
              onClick={() => {/* TODO: Load demo data */}}
              className="border-purple-bright/30 text-purple-light hover:bg-purple-bright/10"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ver Ejemplo
            </Button>
          )}
        </div>

        {/* Feature preview */}
        <div className="mt-xl pt-xl border-t border-border w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg text-center">
            <div className="space-y-sm">
              <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <h4 className="text-sm font-medium text-text-primary">Analytics</h4>
              <p className="text-xs text-text-muted">Métricas detalladas</p>
            </div>
            <div className="space-y-sm">
              <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center mx-auto">
                <Sparkles className="w-4 h-4 text-warning" />
              </div>
              <h4 className="text-sm font-medium text-text-primary">AI Insights</h4>
              <p className="text-xs text-text-muted">Recomendaciones IA</p>
            </div>
            <div className="space-y-sm">
              <div className="w-8 h-8 bg-info/20 rounded-lg flex items-center justify-center mx-auto">
                <PlayCircle className="w-4 h-4 text-info" />
              </div>
              <h4 className="text-sm font-medium text-text-primary">Patterns</h4>
              <p className="text-xs text-text-muted">Patrones exitosos</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};