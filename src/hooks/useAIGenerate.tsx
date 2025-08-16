import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HistoricalData } from '@/hooks/useHistoricalData';
import { useTikTokBrain, BrainHit } from '@/hooks/useTikTokBrain';

export interface AIRequest {
  prompt: string;
  data?: any; // Can be HistoricalData or enhanced with brainContext
  useHistoricalData?: boolean;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export const useAIGenerate = () => {
  const [loading, setLoading] = useState(false);
  const { searchBrain } = useTikTokBrain();

  const generateContent = async (request: AIRequest): Promise<AIResponse> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate', {
        body: {
          prompt: request.prompt,
          data: request.useHistoricalData ? request.data : null
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate content');
      }

      return data;
    } catch (error) {
      console.error('Error generating AI content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      setLoading(false);
    }
  };

  const generateIdeas = async (
    count: number = 5, 
    topic: string = '', 
    historicalData?: HistoricalData,
    useBrain: boolean = false
  ): Promise<AIResponse> => {
    let prompt = `Genera ${count} ideas creativas para videos de TikTok`;
    
    if (topic) {
      prompt += ` sobre el tema: "${topic}"`;
    }

    // Use TikTok Brain if requested
    let brainContext: BrainHit[] = [];
    if (useBrain) {
      try {
        const searchQuery = `ideas para ${topic || 'contenido viral'} basadas en hooks de mayor retención y alto F/1k`;
        brainContext = await searchBrain({
          query: searchQuery,
          topK: 8,
          filter: {
            contentTypes: ['hook', 'guion'],
            dateFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Last 90 days
          }
        });
      } catch (error) {
        console.error('Error searching brain:', error);
      }
    }

    if (brainContext.length > 0) {
      prompt += `\n\nUSA ESTOS PATRONES EXITOSOS DE TU TIKTOK BRAIN:

${brainContext.map((hit, i) => `
${i+1}. ${hit.content_type.toUpperCase()}: "${hit.content.substring(0, 100)}..."
   - F/1k: ${hit.metrics.f_per_1k?.toFixed(1) || 'N/A'}
   - Retención: ${hit.metrics.retention_pct?.toFixed(1) || 'N/A'}%
   - Tipo: ${hit.metrics.video_type || 'N/A'}
   - Score: ${(hit.score * 100).toFixed(1)}%
`).join('\n')}

IMPORTANTE: Cada idea debe inspirarse en estos patrones exitosos y incluir:`;
    } else if (historicalData && historicalData.videos.length > 0) {
      prompt += `\n\nBASE TUS SUGERENCIAS EN ESTOS DATOS HISTÓRICOS REALES:
      
Métricas promedio del usuario:
- Retención promedio: ${historicalData.metrics.avg_retention.toFixed(1)}%
- Saves por 1K vistas: ${historicalData.metrics.avg_saves_per_1k.toFixed(1)}
- Seguidores por 1K vistas (F/1k): ${historicalData.metrics.avg_f_per_1k.toFixed(1)}
- % For You promedio: ${historicalData.metrics.avg_for_you_percentage.toFixed(1)}%
- Engagement promedio: ${historicalData.metrics.avg_engagement_rate.toFixed(1)}%

Videos top performers (F/1k más alto):
${historicalData.videos
  .sort((a, b) => b.f_per_1k - a.f_per_1k)
  .slice(0, 3)
  .map(v => `- "${v.title}" (F/1k: ${v.f_per_1k.toFixed(1)}, Retención: ${v.retention_rate.toFixed(1)}%)`)
  .join('\n')}

Patrones detectados:
- Duración óptima: ${historicalData.patterns.optimal_duration_range.min}-${historicalData.patterns.optimal_duration_range.max} segundos
- Mejores hooks: ${historicalData.patterns.best_hook_types.join(', ')}

IMPORTANTE: Cada idea debe incluir:
1. Título del video
2. Descripción breve (2-3 líneas)
3. Badge explicando qué patrón histórico usaste
4. Por qué crees que funcionará basado en los datos

Formato de respuesta en JSON:
{
  "ideas": [
    {
      "title": "Título del video",
      "description": "Descripción breve del contenido",
      "pattern_used": "Patrón histórico aplicado",
      "reason": "Por qué debería funcionar según los datos"
    }
  ]
}`;
    } else {
      prompt += `\n\nNo tienes datos históricos disponibles, así que genera ideas generales pero efectivas para TikTok.

Formato de respuesta en JSON:
{
  "ideas": [
    {
      "title": "Título del video",
      "description": "Descripción breve del contenido", 
      "pattern_used": "Sugerencia general",
      "reason": "Por qué podría funcionar en TikTok"
    }
  ]
}`;
    }

    return generateContent({ 
      prompt, 
      data: brainContext.length > 0 ? { brainContext, historicalData } : historicalData, 
      useHistoricalData: !!historicalData || brainContext.length > 0 
    });
  };

  const generateScript = async (
    vertical: string,
    description: string,
    useBrain: boolean,
    historicalData?: HistoricalData
  ): Promise<AIResponse> => {
    let prompt = `Genera un guion estructurado para TikTok sobre: "${description}"
    
Vertical: ${vertical}
`;

    // Use TikTok Brain if requested
    let brainContext: BrainHit[] = [];
    if (useBrain) {
      try {
        const searchQuery = `${vertical} ${description} hooks efectivos CTA efectivos duración óptima`;
        brainContext = await searchBrain({
          query: searchQuery,
          topK: 10,
          filter: {
            contentTypes: ['hook', 'cta', 'guion'],
            dateFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        });
      } catch (error) {
        console.error('Error searching brain:', error);
      }
    }

    if (brainContext.length > 0) {
      prompt += `\nBASADO EN TU TIKTOK BRAIN - PATRONES EXITOSOS:

${brainContext.slice(0, 6).map((hit, i) => `
${i+1}. ${hit.content_type.toUpperCase()}: "${hit.content.substring(0, 80)}..."
   - F/1k: ${hit.metrics.f_per_1k?.toFixed(1) || 'N/A'} | Retención: ${hit.metrics.retention_pct?.toFixed(1) || 'N/A'}%
   - Duración: ${hit.metrics.duration_seconds || 'N/A'}s | Score: ${(hit.score * 100).toFixed(1)}%
`).join('\n')}

GENERA UN GUION que aplique estos patrones exitosos.`;
    } else if (historicalData && historicalData.videos.length > 0) {
      prompt += `\nBASADO EN ESTOS DATOS HISTÓRICOS REALES:

Métricas promedio:
- Retención: ${historicalData.metrics.avg_retention.toFixed(1)}%
- F/1k: ${historicalData.metrics.avg_f_per_1k.toFixed(1)}
- Duración óptima: ${historicalData.patterns.optimal_duration_range.min}-${historicalData.patterns.optimal_duration_range.max}s

Videos exitosos de referencia:
${historicalData.videos
  .sort((a, b) => b.f_per_1k - a.f_per_1k)
  .slice(0, 2)
  .map(v => `- "${v.title}" (Hook: "${v.hook?.substring(0, 50) || 'Sin hook'}...")`)
  .join('\n')}

GENERA UN GUION que aplique estos patrones exitosos.`;
    }

    prompt += `\n\nEstructura requerida:
1. HOOK (primeros 3-5 segundos) - Debe captar atención inmediatamente
2. DESARROLLO (cuerpo principal) - Mantén ritmo cada 3-5 segundos
3. CTA FINAL - Optimizado para conversión a seguidores

Formato de respuesta en JSON:
{
  "script": {
    "hook": "Hook de 3-5 segundos",
    "development": "Desarrollo principal del contenido", 
    "cta": "CTA final optimizado",
    "estimated_duration": "Duración estimada en segundos",
    "insights": {
      "duration_recommendation": "Por qué esta duración",
      "hook_strategy": "Por qué este tipo de hook",
      "expected_f1k": "F/1k esperado basado en patrones"
    }
  }
}`;

    return generateContent({ 
      prompt, 
      data: brainContext.length > 0 ? { brainContext, historicalData } : historicalData, 
      useHistoricalData: useBrain || !!historicalData 
    });
  };

  const generateStrategicInsights = async (
    question: string,
    historicalData?: HistoricalData,
    useBrain: boolean = true
  ): Promise<AIResponse> => {
    let prompt = `Analiza esta pregunta estratégica sobre TikTok: "${question}"`;

    // Use TikTok Brain if requested
    let brainContext: BrainHit[] = [];
    if (useBrain) {
      try {
        brainContext = await searchBrain({
          query: question,
          topK: 12,
          filter: {
            dateFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        });
      } catch (error) {
        console.error('Error searching brain:', error);
      }
    }

    if (brainContext.length > 0) {
      prompt += `\n\nUSA TU TIKTOK BRAIN - CONTENIDO RELEVANTE ENCONTRADO:

${brainContext.slice(0, 8).map((hit, i) => `
${i+1}. ${hit.content_type.toUpperCase()}: "${hit.content.substring(0, 120)}..."
   - Video: ${hit.metrics.video_type || 'N/A'} | Vistas: ${hit.metrics.views?.toLocaleString() || 'N/A'}
   - F/1k: ${hit.metrics.f_per_1k?.toFixed(1) || 'N/A'} | Retención: ${hit.metrics.retention_pct?.toFixed(1) || 'N/A'}%
   - Relevancia: ${(hit.score * 100).toFixed(1)}%
`).join('\n')}

RESPONDE CON:
1. Análisis claro basado en los patrones encontrados
2. 3-5 recomendaciones accionables específicas  
3. Ejemplos de tu contenido como referencia
4. Experimentos para probar la próxima semana`;
    } else if (historicalData && historicalData.videos.length > 0) {
      prompt += `\n\nUSA ESTOS DATOS HISTÓRICOS REALES PARA TU ANÁLISIS:

Resumen del canal:
- ${historicalData.metrics.video_count} videos publicados
- ${historicalData.metrics.total_views.toLocaleString()} vistas totales
- ${historicalData.metrics.total_new_followers.toLocaleString()} seguidores generados
- Retención promedio: ${historicalData.metrics.avg_retention.toFixed(1)}%
- F/1k promedio: ${historicalData.metrics.avg_f_per_1k.toFixed(1)}

Top 3 videos por F/1k:
${historicalData.videos
  .sort((a, b) => b.f_per_1k - a.f_per_1k)
  .slice(0, 3)
  .map((v, i) => `${i+1}. "${v.title}" - F/1k: ${v.f_per_1k.toFixed(1)}, Retención: ${v.retention_rate.toFixed(1)}%, Vistas: ${v.views.toLocaleString()}`)
  .join('\n')}

Bottom 3 videos por F/1k:
${historicalData.videos
  .sort((a, b) => a.f_per_1k - b.f_per_1k)
  .slice(0, 3)
  .map((v, i) => `${i+1}. "${v.title}" - F/1k: ${v.f_per_1k.toFixed(1)}, Retención: ${v.retention_rate.toFixed(1)}%, Vistas: ${v.views.toLocaleString()}`)
  .join('\n')}

RESPONDE CON:
1. Análisis claro basado en los datos reales
2. 3-5 recomendaciones accionables específicas
3. Ejemplos de videos míos como referencia
4. Métricas clave a seguir

Formato JSON:
{
  "analysis": "Análisis detallado basado en datos",
  "recommendations": [
    "Recomendación 1",
    "Recomendación 2", 
    "Recomendación 3"
  ],
  "video_examples": [
    {
      "title": "Título del video ejemplo",
      "reason": "Por qué es relevante",
      "metrics": "Métricas destacadas"
    }
  ]
}`;
    } else {
      prompt += `\n\nNo hay datos históricos disponibles. Proporciona sugerencias generales pero útiles.

Formato JSON:
{
  "analysis": "Análisis general de la estrategia",
  "recommendations": [
    "Recomendación general 1",
    "Recomendación general 2"
  ],
  "note": "Para análisis más específicos, importa tus datos históricos de TikTok"
}`;
    }

    return generateContent({ 
      prompt, 
      data: brainContext.length > 0 ? { brainContext, historicalData } : historicalData, 
      useHistoricalData: useBrain || !!historicalData 
    });
  };

  return {
    loading,
    generateIdeas,
    generateScript,
    generateStrategicInsights
  };
};