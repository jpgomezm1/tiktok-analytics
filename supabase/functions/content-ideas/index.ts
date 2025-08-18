import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface GenerateIdeasParams {
  query?: string;
  type: 'hook' | 'guion' | 'cta';
  topK?: number;
  mode?: 'exploit' | 'explore' | 'mixed';
}

interface ContentIdea {
  id: string;
  text: string;
  justification: string;
  mode: 'exploit' | 'explore';
  confidence: number;
  examples: Array<{
    content: string;
    video_id: string;
    metrics: {
      saves_per_1k: number;
      f_per_1k: number;
      retention_pct: number;
      views: number;
    };
  }>;
}

interface GenerateIdeasResponse {
  ideas: ContentIdea[];
  facets: {
    themes: string[];
    cta_types: string[];
    editing_styles: string[];
  };
  total_generated: number;
  generation_time_ms: number;
}

// Get learning data from feedback history
async function getLearningData(userId: string, type: string): Promise<any> {
  const { data: feedback } = await supabase
    .from('content_ideas_feedback')
    .select('*')
    .eq('user_id', userId)
    .eq('idea_type', type)
    .order('created_at', { ascending: false })
    .limit(50);

  const successfulPatterns = feedback?.filter(f => f.outcome === 'success') || [];
  const failedPatterns = feedback?.filter(f => f.outcome === 'failure') || [];

  return { successfulPatterns, failedPatterns };
}

// Get high-performing examples from brain vectors
async function getHighPerformingExamples(userId: string, type: string, query?: string): Promise<any[]> {
  // Map type to content_type
  const contentTypeMap = {
    'hook': 'hook',
    'guion': 'content',
    'cta': 'cta'
  };

  const contentType = contentTypeMap[type as keyof typeof contentTypeMap];
  
  let sql = `
    SELECT 
      video_id,
      content,
      saves_per_1k,
      f_per_1k,
      retention_pct,
      views,
      video_theme,
      cta_type,
      editing_style
    FROM tiktok_brain_vectors
    WHERE user_id = $1
      AND content_type = $2
      AND is_duplicate = false
      AND saves_per_1k > 1.5
    ORDER BY 
      (COALESCE(saves_per_1k, 0) + COALESCE(f_per_1k, 0) + COALESCE(retention_pct, 0)/10) DESC
    LIMIT 20
  `;

  const { data: examples } = await supabase.rpc('exec_sql', {
    sql,
    params: [userId, contentType]
  });

  return examples || [];
}

// Generate ideas using OpenAI with enhanced context integration
async function generateIdeasWithAI(
  userId: string,
  params: GenerateIdeasParams,
  accountContext: any,
  examples: any[],
  learningData: any
): Promise<ContentIdea[]> {
  
  const systemPrompt = `Eres un experto en creación de contenido viral para TikTok especializado en el contexto de esta cuenta específica. Tu trabajo es generar ideas ${params.type} que:

1. ESTÉN PERFECTAMENTE ALINEADAS con el contexto de la cuenta:
   - Misión: ${accountContext?.mission || 'No definida'}
   - Pilares de marca: ${accountContext?.brand_pillars?.join(', ') || 'No definidos'}
   - Posicionamiento: ${accountContext?.positioning || 'No definido'}
   - Temas de contenido: ${accountContext?.content_themes?.join(', ') || 'Generales'}
   - Guía de tono: ${accountContext?.tone_guide || 'Profesional pero accesible'}
   - Métrica principal: ${accountContext?.north_star_metric || 'engagement'}
   - Apuestas estratégicas: ${accountContext?.strategic_bets?.join(', ') || 'No definidas'}
   - NUNCA uses estas palabras/conceptos: ${accountContext?.negative_keywords?.join(', ') || 'Ninguna restricción'}
   - NO hacer: ${accountContext?.do_not_do?.join(', ') || 'Nada específico'}

2. Se basen en patrones exitosos de ejemplos reales con alto engagement.

3. Sean categorizadas como:
   - EXPLOIT: Basadas en patrones ya probados y exitosos
   - EXPLORE: Nuevos ángulos o enfoques experimentales

4. Incluyan justificación clara del por qué pueden funcionar.

Ejemplos de alto rendimiento disponibles:
${examples.map(ex => `- "${ex.content}" (saves: ${ex.saves_per_1k}/1k, follows: ${ex.f_per_1k}/1k)`).join('\n')}

${learningData.successfulPatterns.length > 0 ? 
  `Patrones exitosos previos: ${learningData.successfulPatterns.map(p => p.idea_text).join('; ')}` : 
  ''}

Responde SOLO con un JSON válido en este formato:
{
  "ideas": [
    {
      "text": "Texto del ${params.type}",
      "justification": "Explicación de por qué puede funcionar",
      "mode": "exploit" o "explore",
      "confidence": número entre 0.0 y 1.0
    }
  ]
}`;

  const userMessage = params.query ? 
    `Genera 5 ideas de ${params.type} sobre: ${params.query}` :
    `Genera 5 ideas de ${params.type} basadas en el contexto y patrones exitosos de la cuenta`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 2000,
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(aiResponse);
    return parsed.ideas.map((idea: any, index: number) => ({
      id: `idea_${Date.now()}_${index}`,
      text: idea.text,
      justification: idea.justification,
      mode: idea.mode,
      confidence: idea.confidence || 0.7,
      examples: []
    }));
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return [];
  }
}

// Match examples to ideas based on similarity
function matchExamplesToIdeas(ideas: ContentIdea[], examples: any[]): ContentIdea[] {
  return ideas.map(idea => {
    // Simple keyword-based matching for now
    const matchedExamples = examples
      .filter(example => {
        const ideaWords = idea.text.toLowerCase().split(' ');
        const exampleWords = example.content.toLowerCase().split(' ');
        const commonWords = ideaWords.filter(word => 
          word.length > 3 && exampleWords.some(ew => ew.includes(word))
        );
        return commonWords.length > 0;
      })
      .slice(0, 3)
      .map(example => ({
        content: example.content,
        video_id: example.video_id,
        metrics: {
          saves_per_1k: example.saves_per_1k || 0,
          f_per_1k: example.f_per_1k || 0,
          retention_pct: example.retention_pct || 0,
          views: example.views || 0
        }
      }));

    return {
      ...idea,
      examples: matchedExamples
    };
  });
}

// Generate facets from examples
function generateFacets(examples: any[]): any {
  const themes = [...new Set(examples.map(ex => ex.video_theme).filter(Boolean))];
  const ctaTypes = [...new Set(examples.map(ex => ex.cta_type).filter(Boolean))];
  const editingStyles = [...new Set(examples.map(ex => ex.editing_style).filter(Boolean))];

  return {
    themes: themes.slice(0, 10),
    cta_types: ctaTypes.slice(0, 5),
    editing_styles: editingStyles.slice(0, 5)
  };
}

// Main function to generate content ideas
async function generateContentIdeas(userId: string, params: GenerateIdeasParams): Promise<GenerateIdeasResponse> {
  const startTime = Date.now();

  try {
    // Get account context
    const { data: accountContext } = await supabase
      .from('tiktok_account_contexts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Get learning data from previous feedback
    const learningData = await getLearningData(userId, params.type);

    // Get high-performing examples
    const examples = await getHighPerformingExamples(userId, params.type, params.query);

    // Generate ideas using AI
    let ideas = await generateIdeasWithAI(userId, params, accountContext, examples, learningData);

    // Filter by mode if specified
    if (params.mode && params.mode !== 'mixed') {
      ideas = ideas.filter(idea => idea.mode === params.mode);
    }

    // Limit results
    if (params.topK) {
      ideas = ideas.slice(0, params.topK);
    }

    // Match examples to ideas
    ideas = matchExamplesToIdeas(ideas, examples);

    // Generate facets
    const facets = generateFacets(examples);

    return {
      ideas,
      facets,
      total_generated: ideas.length,
      generation_time_ms: Date.now() - startTime
    };

  } catch (error) {
    console.error('Error generating content ideas:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid user');
    }

    const params: GenerateIdeasParams = await req.json();
    
    if (!params.type || !['hook', 'guion', 'cta'].includes(params.type)) {
      throw new Error('Invalid or missing type parameter');
    }

    const results = await generateContentIdeas(user.id, params);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in content-ideas function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      ideas: [],
      facets: { themes: [], cta_types: [], editing_styles: [] },
      total_generated: 0,
      generation_time_ms: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});