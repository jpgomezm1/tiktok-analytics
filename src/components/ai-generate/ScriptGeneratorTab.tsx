import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FileText, Download, Copy, RefreshCw } from 'lucide-react';
import { useAIGenerate } from '@/hooks/useAIGenerate';
import { HistoricalData } from '@/hooks/useHistoricalData';
import { useToast } from '@/hooks/use-toast';

interface ScriptGeneratorTabProps {
  historicalData: HistoricalData | null;
  hasData: boolean;
}

interface GeneratedScript {
  hook: string;
  development: string;
  cta: string;
  estimated_duration: string;
  insights: {
    duration_recommendation: string;
    hook_strategy: string;
    expected_f1k: string;
  };
}

export const ScriptGeneratorTab = ({ historicalData, hasData }: ScriptGeneratorTabProps) => {
  const [vertical, setVertical] = useState('');
  const [description, setDescription] = useState('');
  const [useHistoricalData, setUseHistoricalData] = useState(hasData);
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  
  const { generateScript, loading } = useAIGenerate();
  const { toast } = useToast();

  const verticals = [
    { value: 'educacion', label: 'Educación' },
    { value: 'entretenimiento', label: 'Entretenimiento' },
    { value: 'vender', label: 'Vender' },
    { value: 'informativo', label: 'Informativo' },
    { value: 'otro', label: 'Otro' }
  ];

  const handleGenerate = async () => {
    if (!vertical || !description.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor selecciona una vertical y describe el guion",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await generateScript(
        vertical, 
        description, 
        useHistoricalData, 
        historicalData || undefined
      );
      
      if (response.success && response.content) {
        const parsed = JSON.parse(response.content);
        setGeneratedScript(parsed.script);
        
        toast({
          title: "Guion generado",
          description: "Claude ha creado tu guion estructurado",
        });
      } else {
        throw new Error(response.error || 'No se pudo generar el guion');
      }
    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        title: "Error",
        description: "No pudimos conectar con AI. Intenta de nuevo en unos minutos.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles"
    });
  };

  const exportScript = () => {
    if (!generatedScript) return;

    const scriptText = `GUION PARA TIKTOK
Vertical: ${vertical}
Descripción: ${description}

=== HOOK (${generatedScript.estimated_duration}) ===
${generatedScript.hook}

=== DESARROLLO ===
${generatedScript.development}

=== CTA FINAL ===
${generatedScript.cta}

=== INSIGHTS CLAUDE ===
Duración: ${generatedScript.insights.duration_recommendation}
Hook: ${generatedScript.insights.hook_strategy}
F/1k esperado: ${generatedScript.insights.expected_f1k}
`;

    const blob = new Blob([scriptText], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `guion-tiktok-${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Guion exportado",
      description: "Archivo TXT descargado correctamente"
    });
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-text-primary flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Genera Guion Estructurado
          </CardTitle>
          <CardDescription className="text-text-secondary">
            Claude creará un guion con estructura clara optimizada para TikTok
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vertical">Vertical del contenido</Label>
              <Select value={vertical} onValueChange={setVertical}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona una vertical" />
                </SelectTrigger>
                <SelectContent>
                  {verticals.map(v => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasData && (
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="use-data"
                  checked={useHistoricalData}
                  onCheckedChange={setUseHistoricalData}
                />
                <Label htmlFor="use-data" className="text-sm">
                  Usar mis datos históricos
                </Label>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descripción del guion</Label>
            <Textarea
              id="description"
              placeholder="ej: un video corto explicando cómo automatizar procesos con IA"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-[100px]"
            />
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={loading || !vertical || !description.trim()}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generando guion con Claude...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generar Guion con AI (Claude)
              </>
            )}
          </Button>

          {!hasData && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-text-secondary">
                <strong>Tip:</strong> Importa tus datos de TikTok para que Claude genere guiones basados en tus patrones de éxito reales.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Script */}
      {generatedScript && (
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-text-primary">Guion Generado</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${generatedScript.hook}\n\n${generatedScript.development}\n\n${generatedScript.cta}`)}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportScript}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar TXT
                </Button>
              </div>
            </div>
            <CardDescription className="text-text-secondary">
              Estructura optimizada para {generatedScript.estimated_duration}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hook Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 border-green-500/20 text-green-400">
                  HOOK (3-5s)
                </Badge>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-text-secondary whitespace-pre-wrap">
                  {generatedScript.hook}
                </p>
              </div>
            </div>

            {/* Development Section */}
            <div className="space-y-2">
              <Badge className="bg-blue-500/10 border-blue-500/20 text-blue-400">
                DESARROLLO
              </Badge>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-text-secondary whitespace-pre-wrap">
                  {generatedScript.development}
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-2">
              <Badge className="bg-purple-500/10 border-purple-500/20 text-purple-400">
                CTA FINAL
              </Badge>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-text-secondary whitespace-pre-wrap">
                  {generatedScript.cta}
                </p>
              </div>
            </div>

            {/* Mini-insights */}
            <div className="pt-4 border-t border-border">
              <h4 className="font-medium text-text-primary mb-3">Mini-insights de Claude</h4>
              <div className="space-y-3">
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-text-secondary">
                    <strong>Duración recomendada:</strong> {generatedScript.insights.duration_recommendation}
                  </p>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-text-secondary">
                    <strong>Estrategia de hook:</strong> {generatedScript.insights.hook_strategy}
                  </p>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-text-secondary">
                    <strong>F/1k esperado:</strong> {generatedScript.insights.expected_f1k}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!generatedScript && !loading && (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Genera tu Guion Estructurado
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Selecciona una vertical, describe tu idea y Claude creará un guion optimizado para TikTok con hook, desarrollo y CTA.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};