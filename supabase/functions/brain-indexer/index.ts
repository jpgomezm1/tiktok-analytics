import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate embeddings using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Extract content from video
function extractContent(video: any): Array<{type: string, content: string}> {
  const extractions: Array<{type: string, content: string}> = [];
  
  // Extract hook (first 10-20 words from hook field or guion)
  if (video.hook && video.hook.trim()) {
    extractions.push({
      type: 'hook',
      content: video.hook.trim()
    });
  } else if (video.guion && video.guion.trim()) {
    const words = video.guion.trim().split(/\s+/).slice(0, 20).join(' ');
    if (words) {
      extractions.push({
        type: 'hook',
        content: words
      });
    }
  }

  // Extract full guion if available
  if (video.guion && video.guion.trim()) {
    extractions.push({
      type: 'guion',
      content: video.guion.trim()
    });
  }

  // Extract CTA from end of guion (look for keywords)
  if (video.guion && video.guion.trim()) {
    const lines = video.guion.trim().split('\n');
    const lastLines = lines.slice(-3).join(' ').toLowerCase();
    
    if (lastLines.includes('sígueme') || lastLines.includes('comenta') || 
        lastLines.includes('link') || lastLines.includes('suscribe') ||
        lastLines.includes('follow') || lastLines.includes('like')) {
      extractions.push({
        type: 'cta',
        content: lines.slice(-2).join(' ').trim()
      });
    }
  }

  return extractions;
}

// Calculate metrics
function calculateMetrics(video: any) {
  const retention_pct = video.duration_seconds && video.avg_time_watched 
    ? (video.avg_time_watched / video.duration_seconds) * 100 
    : null;
  
  const saves_per_1k = video.views > 0 ? (video.saves / video.views) * 1000 : null;
  const f_per_1k = video.views > 0 ? (video.new_followers / video.views) * 1000 : null;
  const for_you_pct = video.views > 0 ? (video.traffic_for_you / video.views) * 100 : null;

  return {
    retention_pct,
    saves_per_1k,
    f_per_1k,
    for_you_pct,
    views: video.views,
    duration_seconds: video.duration_seconds,
    video_type: video.video_type,
    published_date: video.published_date,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, userId, reindexAll } = await req.json();

    console.log('Brain indexer called with:', { videoId, userId, reindexAll });

    if (reindexAll && userId) {
      // Reindex all user content
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId);

      if (videosError) {
        throw new Error(`Error fetching videos: ${videosError.message}`);
      }

      let indexedCount = 0;
      
      for (const video of videos || []) {
        try {
          await indexVideo(video);
          indexedCount++;
        } catch (error) {
          console.error(`Error indexing video ${video.id}:`, error);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Reindexed ${indexedCount} videos`,
          indexedCount 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (videoId) {
      // Index single video
      const { data: video, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (videoError) {
        throw new Error(`Error fetching video: ${videoError.message}`);
      }

      await indexVideo(video);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Video indexed successfully' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Either videoId or userId with reindexAll=true is required');

  } catch (error) {
    console.error('Error in brain indexer:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function indexVideo(video: any) {
  console.log(`Indexing video: ${video.id}`);
  
  // Delete existing vectors for this video
  await supabase
    .from('tiktok_brain_vectors')
    .delete()
    .eq('video_id', video.id);

  // Extract content
  const extractions = extractContent(video);
  const metrics = calculateMetrics(video);

  // Generate embeddings and store
  for (const extraction of extractions) {
    try {
      const embedding = await generateEmbedding(extraction.content);
      
      const { error: insertError } = await supabase
        .from('tiktok_brain_vectors')
        .insert({
          user_id: video.user_id,
          video_id: video.id,
          content_type: extraction.type,
          content: extraction.content,
          embedding: JSON.stringify(embedding),
          ...metrics
        });

      if (insertError) {
        console.error(`Error inserting vector for ${extraction.type}:`, insertError);
      } else {
        console.log(`Indexed ${extraction.type} for video ${video.id}`);
      }
    } catch (error) {
      console.error(`Error generating embedding for ${extraction.type}:`, error);
    }
  }
}