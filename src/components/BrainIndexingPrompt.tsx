import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTikTokBrain } from '@/hooks/useTikTokBrain';
import { useState, useEffect } from 'react';
import { 
  Brain, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Sparkles,
  BarChart3
} from 'lucide-react';

interface BrainIndexingPromptProps {
  videoCount: number;
  onIndexingComplete?: () => void;
}

export const BrainIndexingPrompt = ({ videoCount, onIndexingComplete }: BrainIndexingPromptProps) => {
  const { reindexAllContent, indexing } = useTikTokBrain();
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [indexingComplete, setIndexingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartIndexing = async () => {
    setError(null);
    setIndexingProgress(0);
    
    try {
      // Simulate progress updates (real implementation would track actual progress)
      const progressInterval = setInterval(() => {
        setIndexingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 1000);

      const result = await reindexAllContent();
      
      clearInterval(progressInterval);
      setIndexingProgress(100);
      
      if (result.success) {
        setIndexingComplete(true);
        setTimeout(() => {
          onIndexingComplete?.();
        }, 2000);
      } else {
        setError('Error durante la indexación. Verifica tu configuración de OpenAI.');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
      setIndexingProgress(0);
    }
  };

  if (indexingComplete) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="py-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              ¡Indexación Completada!
            </h3>
            <p className="text-text-secondary mb-4">
              Se procesaron {videoCount} videos. Los analytics avanzados ya están disponibles.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-green-600 hover:bg-green-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ver Analytics Avanzados
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (indexing || indexingProgress > 0) {
    return (
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="py-8">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-blue-600 mb-2">
              Procesando Contenido con IA
            </h3>
            <p className="text-text-secondary mb-4">
              Generando embeddings y análisis para {videoCount} videos...
            </p>
            <div className="max-w-md mx-auto">
              <Progress value={indexingProgress} className="h-3 mb-2" />
              <p className="text-xs text-text-muted">
                {indexingProgress.toFixed(0)}% completado • Esto puede tomar varios minutos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-500/30 bg-orange-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <Brain className="w-5 h-5" />
          Analytics Avanzados No Disponibles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert className="border-orange-500/30 bg-orange-500/10">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-orange-700">
              Para activar los analytics avanzados con IA, necesitas indexar tu contenido primero. 
              Este proceso analiza tus videos y genera insights predictivos.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="text-center p-4 bg-white/50 rounded-lg border border-orange-200">
              <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-text-primary mb-1">
                Predicciones Virales
              </div>
              <div className="text-xs text-text-muted">
                Identifica videos con potencial viral
              </div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg border border-orange-200">
              <BarChart3 className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-text-primary mb-1">
                Clustering de Contenido
              </div>
              <div className="text-xs text-text-muted">
                Agrupa contenido similar automáticamente
              </div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg border border-orange-200">
              <Sparkles className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-text-primary mb-1">
                Insights Automáticos
              </div>
              <div className="text-xs text-text-muted">
                Recomendaciones basadas en IA
              </div>
            </div>
          </div>

          {error && (
            <Alert className="border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <Button 
              onClick={handleStartIndexing}
              disabled={indexing}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
            >
              {indexing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Activar Analytics Avanzados ({videoCount} videos)
                </>
              )}
            </Button>
            <p className="text-xs text-text-muted mt-2">
              Este proceso puede tomar 3-5 minutos para analizar todo tu contenido
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};