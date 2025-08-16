import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  type: 'viral_patterns' | 'content_ideas' | 'monetization' | 'improvements' | 'performance_prediction';
  data?: any;
}

interface Video {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  engagement_rate?: number;
  video_theme?: string;
  cta_type?: string;
  editing_style?: string;
  hook?: string;
  performance_score?: number;
  published_date: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!claudeApiKey) {
      throw new Error('CLAUDE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { type, data }: AnalysisRequest = await req.json();

    // Fetch user's videos
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('published_date', { ascending: false });

    if (videosError) {
      throw new Error(`Failed to fetch videos: ${videosError.message}`);
    }

    if (!videos || videos.length === 0) {
      return new Response(JSON.stringify({
        analysis: "No videos found. Please add video data to get AI insights.",
        recommendations: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare data for Claude analysis
    const analysisData = prepareAnalysisData(videos, type);
    const prompt = generatePrompt(type, analysisData);

    console.log('Sending request to Claude API for analysis type:', type);

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API Error:', errorData);
      throw new Error(`Claude API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const analysis = result.content[0].text;

    // Parse and structure the response
    const structuredResponse = structureAnalysis(type, analysis);

    console.log('AI Analysis completed successfully');

    return new Response(JSON.stringify(structuredResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to analyze content',
      analysis: "Unable to generate AI insights at this time. Please try again later.",
      recommendations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function prepareAnalysisData(videos: Video[], type: string): any {
  // Sort videos by performance
  const sortedVideos = videos.sort((a, b) => (b.views || 0) - (a.views || 0));
  
  const topPerformers = sortedVideos.slice(0, 5);
  const poorPerformers = sortedVideos.slice(-3);
  
  // Calculate averages
  const avgViews = videos.reduce((sum, v) => sum + (v.views || 0), 0) / videos.length;
  const avgEngagement = videos.reduce((sum, v) => sum + (v.engagement_rate || 0), 0) / videos.length;
  
  // Group by attributes
  const themeGroups = groupBy(videos, 'video_theme');
  const ctaGroups = groupBy(videos, 'cta_type');
  const styleGroups = groupBy(videos, 'editing_style');

  return {
    totalVideos: videos.length,
    avgViews,
    avgEngagement,
    topPerformers: topPerformers.map(v => ({
      title: v.title,
      views: v.views,
      likes: v.likes,
      engagement_rate: v.engagement_rate,
      video_theme: v.video_theme,
      cta_type: v.cta_type,
      editing_style: v.editing_style,
      hook: v.hook?.substring(0, 100)
    })),
    poorPerformers: poorPerformers.map(v => ({
      title: v.title,
      views: v.views,
      engagement_rate: v.engagement_rate,
      video_theme: v.video_theme
    })),
    themePerformance: Object.entries(themeGroups).map(([theme, vids]) => ({
      theme,
      count: vids.length,
      avgViews: vids.reduce((sum, v) => sum + (v.views || 0), 0) / vids.length,
      avgEngagement: vids.reduce((sum, v) => sum + (v.engagement_rate || 0), 0) / vids.length
    })).filter(t => t.theme && t.theme !== 'null'),
    ctaPerformance: Object.entries(ctaGroups).map(([cta, vids]) => ({
      cta,
      count: vids.length,
      avgViews: vids.reduce((sum, v) => sum + (v.views || 0), 0) / vids.length
    })).filter(c => c.cta && c.cta !== 'null'),
    stylePerformance: Object.entries(styleGroups).map(([style, vids]) => ({
      style,
      count: vids.length,
      avgViews: vids.reduce((sum, v) => sum + (v.views || 0), 0) / vids.length
    })).filter(s => s.style && s.style !== 'null')
  };
}

function generatePrompt(type: string, data: any): string {
  const baseContext = `
You are an expert TikTok content strategist analyzing performance data. 
Data: ${data.totalVideos} videos, avg ${Math.round(data.avgViews)} views, ${data.avgEngagement.toFixed(1)}% engagement rate.

Top performers: ${JSON.stringify(data.topPerformers)}
Theme performance: ${JSON.stringify(data.themePerformance)}
CTA performance: ${JSON.stringify(data.ctaPerformance)}
Style performance: ${JSON.stringify(data.stylePerformance)}
`;

  switch (type) {
    case 'viral_patterns':
      return `${baseContext}
Analyze this TikTok performance data and identify the top 3 patterns for content that goes viral. 
Focus on specific, actionable patterns in themes, hooks, timing, and engagement strategies.
Provide percentage improvements and concrete examples.`;

    case 'content_ideas':
      return `${baseContext}
Based on this performance data, suggest 5 specific content ideas that would likely perform well.
Each idea should include: topic, hook strategy, CTA, and expected performance reasoning.
Make suggestions based on what's actually working in the data.`;

    case 'monetization':
      return `${baseContext}
What monetization strategies should this creator focus on given these metrics?
Analyze saves, profile visits, and engagement patterns to suggest revenue opportunities.
Provide specific, actionable monetization tactics.`;

    case 'improvements':
      return `${baseContext}
Poor performers: ${JSON.stringify(data.poorPerformers)}
Identify underperforming content patterns and suggest specific improvements.
Compare poor performers to top performers and provide concrete optimization steps.`;

    case 'performance_prediction':
      return `${baseContext}
Based on historical patterns, predict performance factors for new content.
What elements (themes, hooks, CTAs, styles) are most likely to drive high engagement?
Provide a scoring framework for new content evaluation.`;

    default:
      return `${baseContext}
Provide general insights and recommendations for improving content performance.`;
  }
}

function structureAnalysis(type: string, analysis: string): any {
  // Extract key insights and format for frontend
  const lines = analysis.split('\n').filter(line => line.trim());
  
  // Try to extract structured recommendations
  const recommendations = lines
    .filter(line => line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('2.'))
    .slice(0, 5)
    .map(line => line.replace(/^[•\-\d\.]\s*/, '').trim());

  return {
    type,
    analysis: analysis,
    recommendations: recommendations.length > 0 ? recommendations : [
      "Continue creating content that resonates with your audience",
      "Focus on proven themes and hooks that drive engagement",
      "Optimize posting timing based on audience activity patterns"
    ],
    confidence: 85,
    timestamp: new Date().toISOString()
  };
}

function groupBy(array: any[], key: string): { [key: string]: any[] } {
  return array.reduce((groups, item) => {
    const value = item[key] || 'unknown';
    if (!groups[value]) groups[value] = [];
    groups[value].push(item);
    return groups;
  }, {});
}