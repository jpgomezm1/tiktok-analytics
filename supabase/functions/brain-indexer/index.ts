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

// Language detection using simple heuristics
function detectLanguage(text: string): string {
  const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'está', 'una', 'su', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas', 'algo', 'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'tu', 'tus', 'ellas', 'nosotras', 'vosotros', 'vosotras', 'os', 'mío', 'mía', 'míos', 'mías', 'tuyo', 'tuya', 'tuyos', 'tuyas', 'suyo', 'suya', 'suyos', 'suyas', 'nuestro', 'nuestra', 'nuestros', 'nuestras', 'vuestro', 'vuestra', 'vuestros', 'vuestras', 'esos', 'esas'];
  
  const words = text.toLowerCase().split(/\s+/);
  const spanishCount = words.filter(word => spanishWords.includes(word)).length;
  const spanishRatio = spanishCount / words.length;
  
  return spanishRatio > 0.1 ? 'es' : 'en';
}

// Enhanced content chunking with semantic analysis
function extractContentChunks(video: any): Array<{type: string, content: string, section_tag: string}> {
  const chunks: Array<{type: string, content: string, section_tag: string}> = [];
  
  // Extract hook (first 3 seconds / opening lines)
  if (video.hook && video.hook.trim()) {
    chunks.push({
      type: 'hook',
      content: video.hook.trim(),
      section_tag: 'hook_0_3s'
    });
  }
  
  // Extract and chunk the main script (guion)
  if (video.guion && video.guion.trim()) {
    const script = video.guion.trim();
    const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 15);
    
    if (sentences.length > 0) {
      // First part as setup
      const setupSentences = sentences.slice(0, Math.ceil(sentences.length * 0.4));
      if (setupSentences.length > 0) {
        chunks.push({
          type: 'guion',
          content: setupSentences.join('. ').trim() + '.',
          section_tag: 'setup'
        });
      }
      
      // Middle part as proof/development
      if (sentences.length > 2) {
        const proofStart = Math.ceil(sentences.length * 0.4);
        const proofEnd = Math.ceil(sentences.length * 0.8);
        const proofSentences = sentences.slice(proofStart, proofEnd);
        
        if (proofSentences.length > 0) {
          chunks.push({
            type: 'guion',
            content: proofSentences.join('. ').trim() + '.',
            section_tag: 'proof'
          });
        }
      }
    }
  }
  
  // Extract CTA if present
  if (video.cta_type && video.cta_type !== 'none') {
    // Try to extract CTA from the end of the script
    const script = video.guion || '';
    const lastSentences = script.split(/[.!?]+/).slice(-2).join('. ').trim();
    
    if (lastSentences.length > 15) {
      chunks.push({
        type: 'cta',
        content: lastSentences,
        section_tag: 'cta_strong'
      });
    }
  }
  
  return chunks;
}

// AI-powered metadata extraction
async function extractMetadata(content: string, video: any): Promise<{
  video_theme?: string;
  cta_type?: string;
  editing_style?: string;
  tone_style?: string;
}> {
  try {
    const prompt = `Analyze this TikTok content and extract metadata. Return ONLY a JSON object with these fields:
{
  "video_theme": "main topic/theme (e.g., 'IA aplicada a negocios', 'emprendimiento', 'marketing digital')",
  "cta_type": "call to action type (e.g., 'follow', 'comentario', 'compra', 'none')",
  "editing_style": "editing/format style (e.g., 'storytelling', 'walk & talk', 'text overlay', 'talking head')",
  "tone_style": "tone of voice (e.g., 'humorístico', 'serio', 'irreverente', 'educativo', 'motivacional')"
}

Content to analyze:
Hook: ${video.hook || 'N/A'}
Script: ${content}
CTA Type: ${video.cta_type || 'N/A'}
Video Type: ${video.video_type || 'N/A'}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      console.error('OpenAI metadata extraction failed:', response.statusText);
      return {};
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
      video_theme: result.video_theme || video.video_theme,
      cta_type: result.cta_type || video.cta_type,
      editing_style: result.editing_style || video.editing_style,
      tone_style: result.tone_style
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {
      video_theme: video.video_theme,
      cta_type: video.cta_type,
      editing_style: video.editing_style
    };
  }
}

// Generate embeddings with bilingual support
async function generateBilingualEmbeddings(text: string): Promise<{
  embedding_es: number[];
  embedding_en: number[];
}> {
  try {
    // Generate Spanish embedding
    const esResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small', // Using 1536 dimensions
        input: text,
      }),
    });

    if (!esResponse.ok) {
      throw new Error(`Spanish embedding failed: ${esResponse.statusText}`);
    }

    const esData = await esResponse.json();
    const embedding_es = esData.data[0].embedding;

    // Translate to English first
    const translateResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Translate the following text to English. Preserve the meaning and tone. Return only the translation.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      }),
    });

    let translatedText = text; // fallback
    if (translateResponse.ok) {
      const translateData = await translateResponse.json();
      translatedText = translateData.choices[0].message.content.trim();
    }

    // Generate English embedding
    const enResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: translatedText,
      }),
    });

    if (!enResponse.ok) {
      throw new Error(`English embedding failed: ${enResponse.statusText}`);
    }

    const enData = await enResponse.json();
    const embedding_en = enData.data[0].embedding;

    return { embedding_es, embedding_en };
  } catch (error) {
    console.error('Error generating bilingual embeddings:', error);
    throw error;
  }
}

// Calculate performance metrics
function calculateMetrics(video: any) {
  const views = video.views || 1;
  return {
    retention_pct: video.full_video_watch_rate || 0,
    saves_per_1k: views > 0 ? (video.saves || 0) * 1000 / views : 0,
    f_per_1k: views > 0 ? (video.new_followers || 0) * 1000 / views : 0,
    for_you_pct: views > 0 ? (video.traffic_for_you || 0) * 100 / views : 0,
  };
}

// Check for duplicate content
async function checkForDuplicates(userId: string, content: string, embedding: number[]): Promise<{
  isDuplicate: boolean;
  similarityScore: number;
  duplicateId?: string;
}> {
  try {
    // Query for similar content
    const { data: similarChunks, error } = await supabase
      .from('tiktok_brain_vectors')
      .select('id, content, similarity_score')
      .eq('user_id', userId)
      .eq('is_duplicate', false)
      .limit(5);

    if (error || !similarChunks || similarChunks.length === 0) {
      return { isDuplicate: false, similarityScore: 0 };
    }

    // For now, use simple text similarity as a fallback
    // In production, you'd want to use proper vector similarity
    for (const chunk of similarChunks) {
      const similarity = calculateTextSimilarity(content, chunk.content);
      if (similarity > 0.95) {
        return {
          isDuplicate: true,
          similarityScore: similarity,
          duplicateId: chunk.id
        };
      }
    }

    return { isDuplicate: false, similarityScore: 0 };
  } catch (error) {
    console.error('Error checking duplicates:', error);
    return { isDuplicate: false, similarityScore: 0 };
  }
}

// Simple text similarity calculation
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// Main indexing function
async function indexVideo(video: any): Promise<void> {
  console.log(`Starting enhanced indexing for video: ${video.id}`);
  
  try {
    // Delete existing vectors for this video to ensure idempotency
    const { error: deleteError } = await supabase
      .from('tiktok_brain_vectors')
      .delete()
      .eq('video_id', video.id)
      .eq('user_id', video.user_id);

    if (deleteError) {
      console.error('Error deleting existing vectors:', deleteError);
    }

    // Extract content chunks
    const chunks = extractContentChunks(video);
    console.log(`Extracted ${chunks.length} chunks for video ${video.id}`);

    if (chunks.length === 0) {
      console.log(`No valid chunks found for video ${video.id}`);
      return;
    }

    // Calculate metrics once
    const metrics = calculateMetrics(video);

    // Process each chunk
    for (const chunk of chunks) {
      if (chunk.content.length < 15) {
        console.log(`Skipping short chunk: "${chunk.content}"`);
        continue;
      }

      try {
        // Detect language
        const language = detectLanguage(chunk.content);
        
        // Extract enhanced metadata
        const metadata = await extractMetadata(chunk.content, video);
        
        // Generate bilingual embeddings
        const { embedding_es, embedding_en } = await generateBilingualEmbeddings(chunk.content);
        
        // Check for duplicates
        const duplicateCheck = await checkForDuplicates(video.user_id, chunk.content, embedding_es);
        
        // Insert the vector
        const vectorData = {
          user_id: video.user_id,
          video_id: video.id,
          section_tag: chunk.section_tag,
          content_type: chunk.type,
          content: chunk.content,
          embedding_es: `[${embedding_es.join(',')}]`,
          embedding_en: `[${embedding_en.join(',')}]`,
          language,
          is_duplicate: duplicateCheck.isDuplicate,
          similarity_score: duplicateCheck.similarityScore,
          needs_review: false,
          
          // Enhanced metadata
          video_theme: metadata.video_theme,
          cta_type: metadata.cta_type,
          editing_style: metadata.editing_style,
          tone_style: metadata.tone_style,
          
          // Video metrics
          views: video.views,
          likes: video.likes,
          comments: video.comments,
          shares: video.shares,
          retention_pct: metrics.retention_pct,
          saves_per_1k: metrics.saves_per_1k,
          f_per_1k: metrics.f_per_1k,
          for_you_pct: metrics.for_you_pct,
          duration_seconds: video.duration_seconds,
          published_date: video.published_date,
        };

        const { error: insertError } = await supabase
          .from('tiktok_brain_vectors')
          .insert(vectorData);

        if (insertError) {
          console.error(`Error inserting vector for chunk "${chunk.content.substring(0, 50)}...":`, insertError);
          
          // Mark as needs review
          vectorData.needs_review = true;
          await supabase
            .from('tiktok_brain_vectors')
            .insert(vectorData);
        } else {
          console.log(`Successfully indexed chunk: ${chunk.section_tag} - ${chunk.type}`);
        }

      } catch (chunkError) {
        console.error(`Error processing chunk "${chunk.content.substring(0, 50)}...":`, chunkError);
        
        // Insert a basic version for manual review
        await supabase
          .from('tiktok_brain_vectors')
          .insert({
            user_id: video.user_id,
            video_id: video.id,
            section_tag: chunk.section_tag,
            content_type: chunk.type,
            content: chunk.content,
            language: detectLanguage(chunk.content),
            needs_review: true,
            views: video.views,
            retention_pct: metrics.retention_pct,
            saves_per_1k: metrics.saves_per_1k,
            f_per_1k: metrics.f_per_1k,
            published_date: video.published_date,
          });
      }
    }

    console.log(`Completed enhanced indexing for video: ${video.id}`);
  } catch (error) {
    console.error(`Fatal error indexing video ${video.id}:`, error);
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

    const { videoId, userId, reindexAll } = await req.json();

    if (reindexAll && userId) {
      console.log('Starting complete reindexing for user:', userId);
      
      // Fetch all videos for the user
      const { data: videos, error: fetchError } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) {
        throw new Error(`Error fetching videos: ${fetchError.message}`);
      }

      let indexedCount = 0;
      for (const video of videos || []) {
        try {
          await indexVideo(video);
          indexedCount++;
        } catch (error) {
          console.error(`Failed to index video ${video.id}:`, error);
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Reindexed ${indexedCount} videos`,
        indexedCount 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (videoId) {
      console.log('Indexing single video:', videoId);
      
      // Fetch the specific video
      const { data: video, error: fetchError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !video) {
        throw new Error(`Video not found: ${fetchError?.message}`);
      }

      await indexVideo(video);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Video indexed successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid request: provide either videoId or reindexAll=true');

  } catch (error) {
    console.error('Error in enhanced brain-indexer:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});