import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Lightbulb, FileText, Download, Heart, RefreshCw, Brain, Sparkles, Target, Zap, Star } from 'lucide-react';
import { useAIGenerate } from '@/hooks/useAIGenerate';
import { HistoricalData } from '@/hooks/useHistoricalData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface IdeasQuickTabProps {
  historicalData: HistoricalData | null;
  hasData: boolean;
}

interface GeneratedIdea {
  title: string;
  description: string;
  pattern_used: string;
  reason: string;
}

export const IdeasQuickTab = ({ historicalData, hasData }: IdeasQuickTabProps) => {
  const [count, setCount] = useState(5);
  const [topic, setTopic] = useState('');
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [useBrain, setUseBrain] = useState(true);
  
  const { generateIdeas, loading } = useAIGenerate();
  const { toast } = useToast();

  const handleGenerate = async () => {
    try {
      const response = await generateIdeas(count, topic, historicalData || undefined, useBrain);
      
      if (response.success && response.content) {
        try {
          // Clean and parse the JSON response
          let cleanedContent = response.content.trim();
          
          // Remove any markdown code block wrappers
          cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          
          // Parse JSON response
          const parsed = JSON.parse(cleanedContent);
          setIdeas(parsed.ideas || []);
          
          toast({
            title: "🎉 Ideas generadas",
            description: `${parsed.ideas?.length || 0} ideas creativas listas para usar`,
          });
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          console.error('Response content:', response.content);
          throw new Error('La respuesta de Claude no tiene el formato correcto');
        }
      } else {
        throw new Error(response.error || 'No se pudieron generar ideas');
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast({
        title: "Error",
        description: "No pudimos conectar con AI. Intenta de nuevo en unos minutos.",
        variant: "destructive"
      });
    }
  };

  const toggleFavorite = (ideaTitle: string) => {
    setFavorites(prev => 
      prev.includes(ideaTitle) 
        ? prev.filter(t => t !== ideaTitle)
        : [...prev, ideaTitle]
    );
  };

  const exportToCSV = () => {
    const csvContent = [
      'Título,Descripción,Patrón Usado,Razón,Favorito',
      ...ideas.map(idea => 
        `"${idea.title}","${idea.description}","${idea.pattern_used}","${idea.reason}","${favorites.includes(idea.title) ? 'Sí' : 'No'}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ideas-tiktok-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "📥 CSV exportado",
      description: `${ideas.length} ideas exportadas correctamente`
    });
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Input Form */}
      <Card className="bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-text-primary">
                Genera Ideas con Claude
              </CardTitle>
              <CardDescription className="text-text-secondary">
                {useBrain 
                  ? '🧠 Claude usará tu TikTok Brain para generar ideas basadas en tus patrones exitosos'
                  : hasData 
                    ? '📊 Claude usará tus datos históricos para generar ideas personalizadas'
                    : '✨ Claude generará ideas generales de TikTok'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="count" className="text-sm font-semibold text-text-primary">
                Número de ideas
              </Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="10"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                className="bg-background/60 border-border/60 focus:border-purple-bright/50 transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-semibold text-text-primary">
                Tema o foco (opcional)
              </Label>
              <Input
                id="topic"
                placeholder="ej: educación, fitness, entretenimiento"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-background/60 border-border/60 focus:border-purple-bright/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Enhanced Brain Toggle */}
          <div className="bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl p-4 border border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                  <Brain className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary flex items-center gap-2">
                    Usar mi TikTok Brain
                    {useBrain && <Sparkles className="w-4 h-4 text-yellow-500" />}
                  </p>
                  <p className="text-sm text-text-muted">
                    Ideas basadas en tus patrones exitosos reales
                  </p>
                </div>
              </div>
              <Switch
                checked={useBrain}
                onCheckedChange={setUseBrain}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-bright data-[state=checked]:to-blue-500"
              />
            </div>
            
            {useBrain && hasData && (
              <div className="mt-3 p-3 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-2 text-success text-sm font-medium">
                  <Target className="w-4 h-4" />
                  Brain activado - Analizando {historicalData?.metrics?.video_count || 0} videos
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className={cn(
              "w-full py-3 text-lg font-semibold shadow-lg transition-all duration-200",
              useBrain 
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" 
                : "bg-gradient-primary hover:opacity-90"
            )}
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generando con Claude...
              </>
            ) : (
              <>
                {useBrain ? <Brain className="w-5 h-5 mr-2" /> : <Lightbulb className="w-5 h-5 mr-2" />}
                {useBrain ? 'Generar con TikTok Brain' : 'Generar Ideas con AI (Claude)'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Enhanced Results */}
      {ideas.length > 0 && (
        <>
          {/* Enhanced Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-success/10 to-green-600/10 rounded-xl p-4 border border-success/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  {ideas.length} Ideas Generadas
                </h3>
                <p className="text-sm text-success">
                  ¡Listas para crear contenido viral!
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="gap-2 hover:border-success/30 hover:text-success transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>

          {/* Enhanced Ideas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ideas.map((idea, index) => (
              <Card 
                key={index} 
                className={cn(
                  "bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border border-border/60 shadow-lg hover:shadow-2xl transition-all duration-300 group",
                  favorites.includes(idea.title) && "ring-2 ring-red-500/30 border-red-500/30"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-text-primary text-lg leading-tight group-hover:text-purple-light transition-colors duration-200">
                        {idea.title}
                      </CardTitle>
                      {favorites.includes(idea.title) && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium text-yellow-600">Favorito</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(idea.title)}
                      className={cn(
                        "transition-all duration-200 hover:scale-110",
                        favorites.includes(idea.title) 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-text-muted hover:text-red-500'
                      )}
                    >
                      <Heart 
                        className={cn(
                          "w-5 h-5 transition-all duration-200",
                          favorites.includes(idea.title) && 'fill-current'
                        )}
                      />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {idea.description}
                  </p>
                  
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs transition-all duration-200",
                      useBrain 
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20' 
                        : 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20'
                    )}
                  >
                    {useBrain && <Brain className="w-3 h-3 mr-1" />}
                    {idea.pattern_used}
                  </Badge>
                  
                  <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg p-3 border border-border/30">
                    <p className="text-xs text-text-muted leading-relaxed">
                      <span className="font-semibold text-yellow-600">💡 Por qué funcionaría:</span><br />
                      {idea.reason}
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 hover:border-blue-500/30 hover:text-blue-500 transition-all duration-200 group/btn"
                    onClick={() => {
                      // Navigate to script generator with this idea
                      const searchParams = new URLSearchParams(window.location.search);
                      searchParams.set('tab', 'scripts');
                      searchParams.set('idea', idea.title);
                      searchParams.set('description', idea.description);
                      
                      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
                      window.history.pushState({}, '', newUrl);
                      
                      // Trigger tab change
                      const tabTrigger = document.querySelector('[data-state="active"]')?.parentElement?.querySelector('[value="scripts"]') as HTMLElement;
                      if (tabTrigger) {
                        tabTrigger.click();
                      }
                      
                      toast({
                        title: "🎬 Enviado al generador",
                        description: "Idea transferida para crear guion detallado"
                      });
                    }}
                  >
                    <FileText className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
                    Detallar en guion
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Enhanced Empty State */}
      {ideas.length === 0 && !loading && (
        <Card className="border-dashed border-2 border-border/50 bg-gradient-to-br from-muted/20 to-muted/10">
          <CardContent className="py-16 text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-bright/20 to-purple-dark/10 rounded-2xl flex items-center justify-center mx-auto">
                <Lightbulb className="w-10 h-10 text-purple-light" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-text-primary">
                Genera Ideas Creativas
              </h3>
              <p className="text-text-secondary max-w-lg mx-auto leading-relaxed">
                Pide a Claude que genere ideas para ti. {hasData 
                  ? 'Con tus datos cargados, Claude se basará en tus patrones reales para proponer las más efectivas.'
                  : 'Si cargas datos de tus videos, Claude se basará en tus patrones reales para proponer las más efectivas.'
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto text-sm">
              <div className="flex flex-col items-center gap-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <Brain className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-purple-400">IA Personalizada</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Zap className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-blue-400">Análisis de Patrones</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <Target className="w-5 h-5 text-green-400" />
                <span className="font-medium text-green-400">Ideas Efectivas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};