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
    console.log('=== Account Context Function Started ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('ERROR: No authorization header');
      throw new Error('No authorization header');
    }

    console.log('Attempting to get user...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError) {
      console.log('Auth error:', authError);
      throw new Error('Auth error: ' + authError.message);
    }
    
    if (!user) {
      console.log('ERROR: No user found');
      throw new Error('Invalid user');
    }
    
    console.log('User authenticated:', user.id);

    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body parsed:', JSON.stringify(requestBody, null, 2));
    } catch (jsonError) {
      console.log('JSON parsing error:', jsonError);
      throw new Error('Invalid JSON in request body');
    }

    const { action, context } = requestBody;

    if (action === 'save') {
      console.log('=== SAVE ACTION STARTED ===');
      console.log('Saving context for user:', user.id);
      
      // TEMPORARY: Skip embedding generation completely
      console.log('Attempting to save context to database (WITHOUT embedding)...');
      
      // Create a clean context object with only the fields we need
      const cleanContext = {
        user_id: user.id,
        mission: context?.mission || null,
        brand_pillars: context?.brand_pillars || null,
        positioning: context?.positioning || null,
        audience_personas: context?.audience_personas || null,
        do_not_do: context?.do_not_do || null,
        tone_guide: context?.tone_guide || null,
        content_themes: context?.content_themes || null,
        north_star_metric: context?.north_star_metric || null,
        secondary_metrics: context?.secondary_metrics || null,
        strategic_bets: context?.strategic_bets || null,
        negative_keywords: context?.negative_keywords || null,
        weights: context?.weights || null,
        updated_at: new Date().toISOString()
      };
      
      console.log('Clean context to save:', JSON.stringify(cleanContext, null, 2));
      
      const { data: contextData, error: contextError } = await supabase
        .from('tiktok_account_contexts')
        .upsert(cleanContext, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (contextError) {
        console.error('Context save error:', contextError);
        console.error('Context error details:', JSON.stringify(contextError, null, 2));
        throw new Error(`Error saving context: ${contextError.message}`);
      }

      console.log('Context saved successfully!');
      console.log('Saved data:', JSON.stringify(contextData, null, 2));
      
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
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      details: error.stack || 'No stack trace available'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});