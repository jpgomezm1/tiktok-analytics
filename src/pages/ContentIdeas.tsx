import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Lightbulb, Target, Zap, TrendingUp, Copy, ThumbsUp, ThumbsDown, Play } from 'lucide-react';
import { useContentIdeas, GenerateIdeasParams, ContentIdea, IdeaFeedback } from '@/hooks/useContentIdeas';
import { useToast } from '@/hooks/use-toast';

export default function ContentIdeas() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'hook' | 'guion' | 'cta'>('hook');
  const [selectedMode, setSelectedMode] = useState<'exploit' | 'explore' | 'mixed'>('mixed');
  const [showExploitOnly, setShowExploitOnly] = useState(false);
  const [recipeBuilder, setRecipeBuilder] = useState({
    hook: '',
    guion: '',
    cta: ''
  });
  const [feedbackDialog, setFeedbackDialog] = useState<{ open: boolean; idea: ContentIdea | null }>({
    open: false,
    idea: null
  });
  
  const { loading, ideas, generateIdeas, submitFeedback } = useContentIdeas();
  const { toast } = useToast();

  const handleGenerateIdeas = async () => {
    const params: GenerateIdeasParams = {
      query: searchQuery.trim() || undefined,
      type: selectedType,
      topK: 8,
      mode: selectedMode
    };

    await generateIdeas(params);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles"
    });
  };

  const handleAddToRecipe = (idea: ContentIdea, type: 'hook' | 'guion' | 'cta') => {
    setRecipeBuilder(prev => ({
      ...prev,
      [type]: idea.text
    }));
    toast({
      title: "Agregado al Recipe Builder",
      description: `${type} agregado exitosamente`
    });
  };

  const handleFeedback = async (idea: ContentIdea, outcome: 'success' | 'failure') => {
    const feedback: IdeaFeedback = {
      idea_id: idea.id,
      idea_text: idea.text,
      idea_type: selectedType,
      idea_mode: idea.mode,
      outcome,
      feedback_notes: `User marked as ${outcome}`
    };

    await submitFeedback(feedback);
    setFeedbackDialog({ open: false, idea: null });
  };

  const generateScript = () => {
    const { hook, guion, cta } = recipeBuilder;
    if (!hook && !guion && !cta) return '';
    
    return `${hook ? `🎯 HOOK:\n${hook}\n\n` : ''}${guion ? `📝 GUIÓN:\n${guion}\n\n` : ''}${cta ? `✨ CTA:\n${cta}` : ''}`;
  };

  const filteredIdeas = ideas?.ideas.filter(idea => 
    !showExploitOnly || idea.mode === 'exploit'
  ) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generador de Ideas</h1>
          <p className="text-muted-foreground">
            Genera hooks, guiones y CTAs basados en tu TikTok Brain
          </p>
        </div>
      </div>

      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Configuración de Generación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-query">Consulta (opcional)</Label>
              <Input
                id="search-query"
                placeholder="ej: hooks sobre productividad"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content-type">Tipo de Contenido</Label>
              <Select value={selectedType} onValueChange={(value: 'hook' | 'guion' | 'cta') => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hook">Hook</SelectItem>
                  <SelectItem value="guion">Guión</SelectItem>
                  <SelectItem value="cta">CTA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="generation-mode">Modo</Label>
              <Select value={selectedMode} onValueChange={(value: 'exploit' | 'explore' | 'mixed') => setSelectedMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Mixto</SelectItem>
                  <SelectItem value="exploit">Exploit (Probado)</SelectItem>
                  <SelectItem value="explore">Explore (Experimental)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleGenerateIdeas} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Generando...' : 'Generar Ideas'}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={showExploitOnly}
              onCheckedChange={setShowExploitOnly}
            />
            <Label htmlFor="exploit-filter">Solo mostrar ideas Exploit (probadas)</Label>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ideas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ideas" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Ideas Generadas
          </TabsTrigger>
          <TabsTrigger value="recipe" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Recipe Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ideas" className="space-y-4">
          {ideas && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ideas */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {filteredIdeas.length} Ideas {selectedType}
                  </h3>
                  {ideas.facets.themes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {ideas.facets.themes.slice(0, 3).map(theme => (
                        <Badge key={theme} variant="secondary" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredIdeas.map((idea) => (
                    <Card key={idea.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={idea.mode === 'exploit' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {idea.mode === 'exploit' ? '🎯 Exploit' : '🔬 Explore'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(idea.confidence * 100)}% confianza
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="font-medium text-sm leading-relaxed">{idea.text}</p>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{idea.justification}</p>
                        
                        {idea.examples.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Ejemplos similares:</p>
                            {idea.examples.map((example, idx) => (
                              <div key={idx} className="bg-background border rounded p-2 text-xs">
                                <p className="mb-1">"{example.content.substring(0, 80)}..."</p>
                                <div className="flex gap-3 text-muted-foreground">
                                  <span>💾 {example.metrics.saves_per_1k.toFixed(1)}/1k</span>
                                  <span>👥 {example.metrics.f_per_1k.toFixed(1)}/1k</span>
                                  <span>⏱️ {example.metrics.retention_pct.toFixed(0)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyToClipboard(idea.text)}
                            className="flex-1"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copiar
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddToRecipe(idea, selectedType)}
                            className="flex-1"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            + Recipe
                          </Button>
                          
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFeedback(idea, 'success')}
                              className="p-2"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFeedback(idea, 'failure')}
                              className="p-2"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Facets Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Facetas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {ideas.facets.themes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Temas</h4>
                        <div className="flex flex-wrap gap-1">
                          {ideas.facets.themes.map(theme => (
                            <Badge key={theme} variant="secondary" className="text-xs">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {ideas.facets.cta_types.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Tipos de CTA</h4>
                        <div className="flex flex-wrap gap-1">
                          {ideas.facets.cta_types.map(type => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {ideas.facets.editing_styles.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Estilos</h4>
                        <div className="flex flex-wrap gap-1">
                          {ideas.facets.editing_styles.map(style => (
                            <Badge key={style} variant="outline" className="text-xs">
                              {style}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Estadísticas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Ideas generadas:</span>
                      <span className="font-medium">{ideas.total_generated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiempo de generación:</span>
                      <span className="font-medium">{ideas.generation_time_ms}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exploit vs Explore:</span>
                      <span className="font-medium">
                        {ideas.ideas.filter(i => i.mode === 'exploit').length}:{ideas.ideas.filter(i => i.mode === 'explore').length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {!ideas && !loading && (
            <Card>
              <CardContent className="py-8 text-center">
                <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Genera ideas de contenido basadas en tu TikTok Brain
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recipe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Recipe Builder
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Combina diferentes elementos para crear tu guión completo
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe-hook">Hook</Label>
                  <Textarea
                    id="recipe-hook"
                    placeholder="Selecciona un hook o escribe el tuyo..."
                    value={recipeBuilder.hook}
                    onChange={(e) => setRecipeBuilder(prev => ({ ...prev, hook: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipe-guion">Guión</Label>
                  <Textarea
                    id="recipe-guion"
                    placeholder="Selecciona un guión o escribe el tuyo..."
                    value={recipeBuilder.guion}
                    onChange={(e) => setRecipeBuilder(prev => ({ ...prev, guion: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipe-cta">CTA</Label>
                  <Textarea
                    id="recipe-cta"
                    placeholder="Selecciona un CTA o escribe el tuyo..."
                    value={recipeBuilder.cta}
                    onChange={(e) => setRecipeBuilder(prev => ({ ...prev, cta: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Guión Completo</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyToClipboard(generateScript())}
                    disabled={!generateScript()}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar Guión
                  </Button>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg min-h-[120px] whitespace-pre-line">
                  {generateScript() || (
                    <span className="text-muted-foreground">
                      Tu guión completo aparecerá aquí cuando agregues elementos...
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}