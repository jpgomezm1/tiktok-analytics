import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Save, Settings, Target, Users, Shield, Palette } from 'lucide-react';
import { useAccountContext, type AccountContext, type AudiencePersona } from '@/hooks/useAccountContext';
import { useToast } from '@/hooks/use-toast';

const METRIC_OPTIONS = [
  { value: 'follows_per_1k', label: 'Follows per 1K views' },
  { value: 'saves_per_1k', label: 'Saves per 1K views' },
  { value: 'retention_pct', label: 'Retention %' },
  { value: 'engagement_rate', label: 'Engagement Rate' },
  { value: 'views', label: 'Total Views' },
  { value: 'reach', label: 'Reach' },
];

export default function AccountContext() {
  const { context, loading, saveContext, getContext } = useAccountContext();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<AccountContext>({
    mission: '',
    brand_pillars: [],
    positioning: '',
    audience_personas: [],
    do_not_do: [],
    tone_guide: '',
    content_themes: [],
    north_star_metric: '',
    secondary_metrics: [],
    strategic_bets: [],
    negative_keywords: [],
    weights: { retention: 0.3, saves: 0.4, follows: 0.3 }
  });

  // Load existing context on mount
  useEffect(() => {
    getContext();
  }, []);

  // Update form when context is loaded
  useEffect(() => {
    if (context) {
      setFormData({
        mission: context.mission || '',
        brand_pillars: context.brand_pillars || [],
        positioning: context.positioning || '',
        audience_personas: context.audience_personas || [],
        do_not_do: context.do_not_do || [],
        tone_guide: context.tone_guide || '',
        content_themes: context.content_themes || [],
        north_star_metric: context.north_star_metric || '',
        secondary_metrics: context.secondary_metrics || [],
        strategic_bets: context.strategic_bets || [],
        negative_keywords: context.negative_keywords || [],
        weights: context.weights || { retention: 0.3, saves: 0.4, follows: 0.3 }
      });
    }
  }, [context]);

  const addStringArrayItem = (field: keyof AccountContext, value: string) => {
    if (!value.trim()) return;
    
    const currentArray = (formData[field] as string[]) || [];
    if (!currentArray.includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...currentArray, value.trim()]
      }));
    }
  };

  const removeStringArrayItem = (field: keyof AccountContext, index: number) => {
    const currentArray = (formData[field] as string[]) || [];
    setFormData(prev => ({
      ...prev,
      [field]: currentArray.filter((_, i) => i !== index)
    }));
  };

  const addAudiencePersona = () => {
    const newPersona: AudiencePersona = {
      persona: '',
      pains: [],
      desires: []
    };
    
    setFormData(prev => ({
      ...prev,
      audience_personas: [...(prev.audience_personas || []), newPersona]
    }));
  };

  const updateAudiencePersona = (index: number, field: keyof AudiencePersona, value: any) => {
    setFormData(prev => ({
      ...prev,
      audience_personas: (prev.audience_personas || []).map((persona, i) => 
        i === index ? { ...persona, [field]: value } : persona
      )
    }));
  };

  const removeAudiencePersona = (index: number) => {
    setFormData(prev => ({
      ...prev,
      audience_personas: (prev.audience_personas || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    const success = await saveContext(formData);
    if (success) {
      toast({
        title: "Contexto guardado",
        description: "Tu contexto de cuenta se ha actualizado correctamente",
      });
    }
  };

  const ArrayInputField = ({ 
    label, 
    field, 
    placeholder, 
    icon 
  }: { 
    label: string; 
    field: keyof AccountContext; 
    placeholder: string;
    icon?: React.ReactNode;
  }) => {
    const [inputValue, setInputValue] = useState('');
    
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {icon}
          {label}
        </Label>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addStringArrayItem(field, inputValue);
                setInputValue('');
              }
            }}
          />
          <Button 
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              addStringArrayItem(field, inputValue);
              setInputValue('');
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {((formData[field] as string[]) || []).map((item, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {item}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeStringArrayItem(field, index)}
              />
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contexto de Cuenta</h1>
        <p className="text-muted-foreground">
          Define la identidad y objetivos estratégicos de tu cuenta de TikTok para personalizar todas las recomendaciones del TikTok Brain.
        </p>
      </div>

      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="identity" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Identidad
          </TabsTrigger>
          <TabsTrigger value="audience" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Audiencia
          </TabsTrigger>
          <TabsTrigger value="guardrails" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Guardrails
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Métricas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Identidad de Marca
              </CardTitle>
              <CardDescription>
                Define la misión, posicionamiento y pilares fundamentales de tu marca.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Misión</Label>
                <Textarea
                  value={formData.mission}
                  onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                  placeholder="Ej: Lograr que irrelevant sea viral en TikTok para bajar tráfico al funnel"
                  className="h-24"
                />
              </div>

              <ArrayInputField
                label="Pilares de Marca"
                field="brand_pillars"
                placeholder="Ej: IA aplicada a negocios"
                icon={<Palette className="h-4 w-4" />}
              />

              <div className="space-y-2">
                <Label>Posicionamiento</Label>
                <Textarea
                  value={formData.positioning}
                  onChange={(e) => setFormData(prev => ({ ...prev, positioning: e.target.value }))}
                  placeholder="Ej: Estilo irreverente, directo y sin filtro"
                  className="h-24"
                />
              </div>

              <div className="space-y-2">
                <Label>Guía de Tono</Label>
                <Textarea
                  value={formData.tone_guide}
                  onChange={(e) => setFormData(prev => ({ ...prev, tone_guide: e.target.value }))}
                  placeholder="Describe el tono de voz que debe usar tu marca"
                  className="h-24"
                />
              </div>

              <ArrayInputField
                label="Temas de Contenido"
                field="content_themes"
                placeholder="Ej: Automatización"
              />

              <ArrayInputField
                label="Apuestas Estratégicas"
                field="strategic_bets"
                placeholder="Ej: Contenido educativo viral"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Audiencia y Personas
              </CardTitle>
              <CardDescription>
                Define los diferentes tipos de audiencia y sus características.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(formData.audience_personas || []).map((persona, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Persona {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAudiencePersona(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Descripción de la Persona</Label>
                      <Input
                        value={persona.persona}
                        onChange={(e) => updateAudiencePersona(index, 'persona', e.target.value)}
                        placeholder="Ej: Emprendedores tech de 25-40 años"
                      />
                    </div>
                    
                    <div>
                      <Label>Pain Points</Label>
                      <Input
                        placeholder="Agrega un pain point y presiona Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const value = (e.target as HTMLInputElement).value.trim();
                            if (value) {
                              updateAudiencePersona(index, 'pains', [...persona.pains, value]);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {persona.pains.map((pain, painIndex) => (
                          <Badge key={painIndex} variant="destructive" className="flex items-center gap-1">
                            {pain}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => {
                                const newPains = persona.pains.filter((_, i) => i !== painIndex);
                                updateAudiencePersona(index, 'pains', newPains);
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Deseos</Label>
                      <Input
                        placeholder="Agrega un deseo y presiona Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const value = (e.target as HTMLInputElement).value.trim();
                            if (value) {
                              updateAudiencePersona(index, 'desires', [...persona.desires, value]);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {persona.desires.map((desire, desireIndex) => (
                          <Badge key={desireIndex} variant="default" className="flex items-center gap-1">
                            {desire}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => {
                                const newDesires = persona.desires.filter((_, i) => i !== desireIndex);
                                updateAudiencePersona(index, 'desires', newDesires);
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addAudiencePersona}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Persona
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guardrails" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Guardrails y Restricciones
              </CardTitle>
              <CardDescription>
                Define qué no debe hacer tu marca y palabras clave a evitar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ArrayInputField
                label="Lista de No-Go"
                field="do_not_do"
                placeholder="Ej: no contenido político"
                icon={<Shield className="h-4 w-4" />}
              />

              <ArrayInputField
                label="Palabras Clave Negativas"
                field="negative_keywords"
                placeholder="Ej: técnico pesado"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Métricas y Pesos
              </CardTitle>
              <CardDescription>
                Define tu métrica estrella y cómo ponderar diferentes indicadores.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Métrica Estrella (North Star)</Label>
                <Select
                  value={formData.north_star_metric}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, north_star_metric: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu métrica principal" />
                  </SelectTrigger>
                  <SelectContent>
                    {METRIC_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Pesos por Métrica</Label>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Retención</Label>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((formData.weights?.retention || 0.3) * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[formData.weights?.retention || 0.3]}
                      onValueChange={([value]) => 
                        setFormData(prev => ({
                          ...prev,
                          weights: { ...prev.weights!, retention: value }
                        }))
                      }
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Saves</Label>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((formData.weights?.saves || 0.4) * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[formData.weights?.saves || 0.4]}
                      onValueChange={([value]) => 
                        setFormData(prev => ({
                          ...prev,
                          weights: { ...prev.weights!, saves: value }
                        }))
                      }
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Follows</Label>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((formData.weights?.follows || 0.3) * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[formData.weights?.follows || 0.3]}
                      onValueChange={([value]) => 
                        setFormData(prev => ({
                          ...prev,
                          weights: { ...prev.weights!, follows: value }
                        }))
                      }
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator className="my-8" />

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          size="lg"
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Guardando...' : 'Guardar Contexto'}
        </Button>
      </div>
    </div>
  );
}