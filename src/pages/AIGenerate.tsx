import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lightbulb, FileText, Brain, AlertCircle, Bot, Zap, Database, TrendingUp } from 'lucide-react';
import { IdeasQuickTab } from '@/components/ai-generate/IdeasQuickTab';
import { ScriptGeneratorTab } from '@/components/ai-generate/ScriptGeneratorTab';
import { StrategicInsightsTab } from '@/components/ai-generate/StrategicInsightsTab';
import { useHistoricalData } from '@/hooks/useHistoricalData';
import { cn } from '@/lib/utils';

const AIGenerate = () => {
  const { data: historicalData, loading } = useHistoricalData();
  const [activeTab, setActiveTab] = useState('ideas');

  // Check URL for tab parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['ideas', 'scripts', 'insights'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const hasData = historicalData && historicalData.videos.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-bright/30 border-t-purple-bright rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-bright/10 rounded-full mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-text-primary">Cargando TikTok Brain...</p>
            <p className="text-text-secondary">Analizando tus datos históricos</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-purple-bright to-purple-dark rounded-2xl shadow-xl">
                  <Bot className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-text-primary to-purple-light bg-clip-text text-transparent">
                  AI Content Generator
                </h1>
                <p className="text-lg text-text-secondary">
                  Potenciado por Claude AI + TikTok Brain
                </p>
              </div>
            </div>
            
            <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Genera contenido viral basado en tus patrones de éxito. Nuestro motor de IA analiza tu histórico 
              para crear ideas, guiones e insights personalizados.
            </p>
          </div>

          {/* Enhanced Status Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              {hasData ? (
                <>
                  <Badge className="bg-gradient-to-r from-success/20 to-green-600/20 text-success border-success/40 px-4 py-2 text-sm font-semibold">
                    <Database className="w-4 h-4 mr-2" />
                    {historicalData.metrics.video_count} videos cargados
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-400 px-3 py-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Brain activo
                  </Badge>
                </>
              ) : (
                <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/20 text-yellow-600 px-4 py-2">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Sin datos históricos
                </Badge>
              )}
            </div>

            {/* AI Features Preview */}
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-purple-bright" />
                <span>IA Generativa</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4 text-blue-500" />
                <span>Análisis Semántico</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>Insights Personalizados</span>
              </div>
            </div>
          </div>

          {/* Enhanced Data Status Banner */}
          {!hasData && (
            <Card className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-500/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        🚀 Obtén insights personalizados
                      </h3>
                      <p className="text-text-secondary leading-relaxed">
                        Claude puede generar contenido general, pero <span className="font-semibold text-purple-light">TikTok Brain</span> necesita 
                        tus datos históricos para análisis específicos basados en tus patrones de éxito. 
                      </p>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Database className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-blue-400 font-medium">
                        Importa tus datos desde la sección de Videos para desbloquear el poder completo de la IA
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Main Tabs */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex justify-center">
                <TabsList className="grid grid-cols-3 bg-muted/50 backdrop-blur-sm p-1 rounded-xl shadow-lg">
                  <TabsTrigger 
                    value="ideas" 
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200",
                      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                    )}
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span className="font-medium">Ideas Rápidas</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="scripts" 
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200",
                      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                    )}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">Generador de Guiones</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="insights" 
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200",
                      "data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                    )}
                  >
                    <Brain className="w-4 h-4" />
                    <span className="font-medium">Insights Estratégicos</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="ideas" className="space-y-6">
                <div className="transform transition-all duration-300 animate-in fade-in-50">
                  <IdeasQuickTab historicalData={historicalData} hasData={hasData} />
                </div>
              </TabsContent>

              <TabsContent value="scripts" className="space-y-6">
                <div className="transform transition-all duration-300 animate-in fade-in-50">
                  <ScriptGeneratorTab historicalData={historicalData} hasData={hasData} />
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="transform transition-all duration-300 animate-in fade-in-50">
                  <StrategicInsightsTab historicalData={historicalData} hasData={hasData} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Enhanced Footer Info */}
          <Card className="bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-primary rounded-xl shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-text-primary">
                      Potenciado por Claude AI + TikTok Brain
                    </p>
                    <p className="text-sm text-text-muted">
                      Vector knowledge engine con análisis semántico de tus patrones exitosos
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <Bot className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <div className="text-xs font-medium text-purple-400">Claude AI</div>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Brain className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <div className="text-xs font-medium text-blue-400">TikTok Brain</div>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <Zap className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <div className="text-xs font-medium text-green-400">Vector Search</div>
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <Sparkles className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                    <div className="text-xs font-medium text-yellow-600">Semantic Analysis</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIGenerate;