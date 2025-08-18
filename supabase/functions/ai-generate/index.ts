import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get account context for enhanced prompts
async function getAccountContext(userId: string): Promise<any> {
  try {
    const { data: context } = await supabase
      .from('tiktok_account_contexts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    return context;
  } catch (error) {
    console.error('Error getting account context:', error);
    return null;
  }
}

// Get brain vectors for enhanced context
async function getBrainContext(userId: string, query: string, limit: number = 10): Promise<any[]> {
  try {
    // Search for relevant brain vectors based on query
    const searchQuery = `
      SELECT 
        content,
        content_type,
        saves_per_1k,
        f_per_1k,
        retention_pct,
        views,
        duration_seconds,
        video_type
      FROM tiktok_brain_vectors 
      WHERE user_id = $1 
        AND content IS NOT NULL
        AND (
          content ILIKE '%' || $2 || '%' 
          OR content_type ILIKE '%' || $2 || '%'
        )
      ORDER BY 
        (COALESCE(saves_per_1k, 0) + COALESCE(f_per_1k, 0) + COALESCE(retention_pct, 0)/10) DESC
      LIMIT $3
    `;
    
    const { data: brainData } = await supabase.rpc('exec_sql', {
      sql: searchQuery,
      params: [userId, query, limit]
    });
    
    return brainData || [];
  } catch (error) {
    console.error('Error getting brain context:', error);
    return [];
  }
}

// Enhanced prompt builder with context integration
function buildEnhancedPrompt(
  originalPrompt: string, 
  accountContext: any, 
  brainContext: any[], 
  historicalData: any
): string {
  let enhancedPrompt = originalPrompt;
  
  // Add account context if available
  if (accountContext) {
    enhancedPrompt += `\n\n=== CONTEXTO DE LA CUENTA (CRÍTICO) ===
Misión: ${accountContext.mission || 'No definida'}
Pilares de marca: ${accountContext.brand_pillars?.join(', ') || 'No definidos'}
Posicionamiento: ${accountContext.positioning || 'No definido'}
Audiencia objetivo: ${accountContext.audience_personas?.map((p: any) => `${p.persona} (dolores: ${p.pains?.join(', ')}, deseos: ${p.desires?.join(', ')})`).join(' | ') || 'No definida'}
Temas de contenido: ${accountContext.content_themes?.join(', ') || 'Generales'}
Guía de tono: ${accountContext.tone_guide || 'Profesional pero accesible'}
Métrica principal: ${accountContext.north_star_metric || 'engagement'}
Métricas secundarias: ${accountContext.secondary_metrics?.join(', ') || 'No definidas'}
Apuestas estratégicas: ${accountContext.strategic_bets?.join(', ') || 'No definidas'}

CRÍTICO - NUNCA uses estas palabras/conceptos: ${accountContext.negative_keywords?.join(', ') || 'Ninguna restricción'}
CRÍTICO - NO hagas: ${accountContext.do_not_do?.join(', ') || 'Nada específico'}

Pesos de métricas:
- Retención: ${accountContext.weights?.retention || 100}%
- Saves: ${accountContext.weights?.saves || 100}%
- Follows: ${accountContext.weights?.follows || 100}%`;
  }
  
  // Add brain context if available
  if (brainContext && brainContext.length > 0) {
    enhancedPrompt += `\n\n=== TIKTOK BRAIN - PATRONES EXITOSOS REALES ===
Tu contenido de mayor rendimiento:

${brainContext.slice(0, 8).map((item, i) => `
${i+1}. TIPO: ${item.content_type?.toUpperCase() || 'CONTENIDO'}
   TEXTO: "${item.content?.substring(0, 120) || 'Sin contenido'}..."
   MÉTRICAS: F/1k: ${item.f_per_1k?.toFixed(1) || 'N/A'} | Retención: ${item.retention_pct?.toFixed(1) || 'N/A'}% | Saves/1k: ${item.saves_per_1k?.toFixed(1) || 'N/A'}
   DURACIÓN: ${item.duration_seconds || 'N/A'}s | TIPO VIDEO: ${item.video_type || 'N/A'}
`).join('\n')}

IMPORTANTE: Usa estos patrones exitosos como referencia para mantener la consistencia con lo que ya funciona para esta cuenta específica.`;
  }
  
  // Add historical data summary if available
  if (historicalData && historicalData.metrics) {
    enhancedPrompt += `\n\n=== RESUMEN DE DATOS HISTÓRICOS ===
- ${historicalData.metrics.video_count} videos analizados
- Retención promedio: ${historicalData.metrics.avg_retention?.toFixed(1) || 'N/A'}%
- F/1k promedio: ${historicalData.metrics.avg_f_per_1k?.toFixed(1) || 'N/A'}
- Saves/1k promedio: ${historicalData.metrics.avg_saves_per_1k?.toFixed(1) || 'N/A'}
- For You % promedio: ${historicalData.metrics.avg_for_you_percentage?.toFixed(1) || 'N/A'}%`;
  }

  enhancedPrompt += `\n\n=== INSTRUCCIONES FINALES ===
1. SIEMPRE respeta el contexto de la cuenta y los patrones exitosos
2. NUNCA uses palabras/conceptos de la lista negativa
3. Mantén el tono definido en la guía
4. Optimiza para las métricas priorizadas
5. Basate en los patrones de contenido que han funcionado bien`;

  return enhancedPrompt;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    // Get user ID if authenticated
    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        userId = user?.id || null;
      } catch (error) {
        console.log('Auth error (non-critical):', error);
      }
    }

    const { prompt, data } = await req.json();
    
    const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
    if (!CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is not set');
    }

    // Get enhanced context if user is authenticated
    let enhancedPrompt = prompt;
    if (userId) {
      try {
        console.log('Enhancing prompt with account context and brain data...');
        
        // Get account context
        const accountContext = await getAccountContext(userId);
        console.log('Account context loaded:', !!accountContext);
        
        // Extract search terms from prompt for brain search
        const searchTerms = prompt.toLowerCase().match(/ideas? para?|guion|hook|cta|contenido|viral|tiktok/g)?.join(' ') || 'contenido viral';
        
        // Get brain context
        const brainContext = await getBrainContext(userId, searchTerms, 12);
        console.log('Brain context loaded:', brainContext.length, 'entries');
        
        // Build enhanced prompt
        enhancedPrompt = buildEnhancedPrompt(prompt, accountContext, brainContext, data?.historicalData);
        
        console.log('Prompt enhanced successfully. Original length:', prompt.length, 'Enhanced length:', enhancedPrompt.length);
      } catch (error) {
        console.error('Error enhancing prompt (continuing with original):', error);
        // Continue with original prompt if enhancement fails
      }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLAUDE_API_KEY}`,
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const responseData = await response.json();
    let generatedContent = responseData.content[0].text;
    
    // Clean the content to ensure it's JSON-safe
    generatedContent = generatedContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
    
    console.log('Generated content preview:', generatedContent.substring(0, 200));

    return new Response(JSON.stringify({ 
      success: true,
      content: generatedContent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-generate function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});