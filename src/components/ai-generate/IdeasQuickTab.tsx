import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Lightbulb, FileText, Download, Heart, RefreshCw, Brain } from 'lucide-react';
import { useAIGenerate } from '@/hooks/useAIGenerate';
import { HistoricalData } from '@/hooks/useHistoricalData';
import { useToast } from '@/hooks/use-toast';

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
            title: "Ideas generadas",
            description: `${parsed.ideas?.length || 0} ideas creadas con Claude`,
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
      title: "CSV exportado",
      description: `${ideas.length} ideas exportadas correctamente`
    });
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Genera Ideas con Claude
          </CardTitle>
          <CardDescription className="text-text-secondary">
            {useBrain 
              ? 'Claude usará tu TikTok Brain para generar ideas basadas en tus patrones exitosos'
              : hasData 
                ? 'Claude usará tus datos históricos para generar ideas personalizadas'
                : 'Claude generará ideas generales de TikTok'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="count">Número de ideas</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="10"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="topic">Tema o foco (opcional)</Label>
              <Input
                id="topic"
                placeholder="ej: educación, fitness, entretenimiento"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-text-primary">
                  Usar mi TikTok Brain
                </p>
                <p className="text-sm text-text-muted">
                  Ideas basadas en tus patrones exitosos reales
                </p>
              </div>
            </div>
            <Switch
              checked={useBrain}
              onCheckedChange={setUseBrain}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generando con Claude...
              </>
            ) : (
              <>
                {useBrain ? <Brain className="w-4 h-4 mr-2" /> : <Lightbulb className="w-4 h-4 mr-2" />}
                {useBrain ? 'Generar con TikTok Brain' : 'Generar Ideas con AI (Claude)'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {ideas.length > 0 && (
        <>
          {/* Actions */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">
              {ideas.length} Ideas Generadas
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>

          {/* Ideas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map((idea, index) => (
              <Card key={index} className="bg-card border-border shadow-card hover:shadow-purple transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-text-primary text-base leading-tight">
                      {idea.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(idea.title)}
                      className={`ml-2 ${favorites.includes(idea.title) ? 'text-red-500' : 'text-text-muted'}`}
                    >
                      <Heart 
                        className={`w-4 h-4 ${favorites.includes(idea.title) ? 'fill-current' : ''}`}
                      />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-text-secondary">
                    {idea.description}
                  </p>
                  
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${useBrain ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
                  >
                    {useBrain && <Brain className="w-3 h-3 mr-1" />}
                    {idea.pattern_used}
                  </Badge>
                  
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-text-muted">
                      <strong>Por qué funcionaría:</strong> {idea.reason}
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => {
                      // TODO: Navigate to script generator with this idea
                      toast({
                        title: "Próximamente",
                        description: "Envío a generador de guiones (próxima funcionalidad)"
                      });
                    }}
                  >
                    <FileText className="w-4 h-4" />
                    Detallar en guion
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {ideas.length === 0 && !loading && (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-12 text-center">
            <Lightbulb className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Genera Ideas Creativas
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Pide a Claude que genere ideas para ti. {hasData 
                ? 'Con tus datos cargados, Claude se basará en tus patrones reales para proponer las más efectivas.'
                : 'Si cargas datos de tus videos, Claude se basará en tus patrones reales para proponer las más efectivas.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};