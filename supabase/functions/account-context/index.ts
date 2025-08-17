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

async function generateContextEmbedding(context: any): Promise<number[]> {
  // Create a comprehensive text representation of the context
  const contextText = [
    `Misión: ${context.mission || ''}`,
    `Pilares de marca: ${context.brand_pillars?.join(', ') || ''}`,
    `Posicionamiento: ${context.positioning || ''}`,
    `Guía de tono: ${context.tone_guide || ''}`,
    `Temas de contenido: ${context.content_themes?.join(', ') || ''}`,
    `Métrica estrella: ${context.north_star_metric || ''}`,
    `Apuestas estratégicas: ${context.strategic_bets?.join(', ') || ''}`,
    `No hacer: ${context.do_not_do?.join(', ') || ''}`,
    `Palabras negativas: ${context.negative_keywords?.join(', ') || ''}`
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-large',
      input: contextText,
      dimensions: 3072
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
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

    const { action, context } = await req.json();

    if (action === 'save') {
      console.log('Saving context for user:', user.id);
      
      // Generate embedding for the context
      const embedding = await generateContextEmbedding(context);
      
      // Save or update the context
      const { data: contextData, error: contextError } = await supabase
        .from('tiktok_account_contexts')
        .upsert({
          user_id: user.id,
          ...context,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (contextError) {
        console.error('Context save error:', contextError);
        throw new Error(`Error saving context: ${contextError.message}`);
      }

      // Save or update the embedding
      const { error: embeddingError } = await supabase
        .from('tiktok_account_context_embeddings')
        .upsert({
          user_id: user.id,
          embedding: `[${embedding.join(',')}]`,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (embeddingError) {
        console.error('Embedding save error:', embeddingError);
        throw new Error(`Error saving embedding: ${embeddingError.message}`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        context: contextData 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'get') {
      console.log('Getting context for user:', user.id);
      
      const { data: contextData, error: contextError } = await supabase
        .from('tiktok_account_contexts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (contextError) {
        console.error('Context fetch error:', contextError);
        throw new Error(`Error fetching context: ${contextError.message}`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        context: contextData || null 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in account-context function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});