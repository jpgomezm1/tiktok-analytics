import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, RefreshCw, TrendingUp, Target, Zap } from 'lucide-react';

interface ContentIdea {
  topic: string;
  hook: string;
  cta: string;
  expectedPerformance: string;
  confidence: number;
}

interface AIContentSuggestionsProps {
  className?: string;
}

export const AIContentSuggestions = ({ className }: AIContentSuggestionsProps) => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-analysis', {
        body: { type: 'content_ideas' }
      });

      if (error) throw error;

      // Parse AI response to extract content ideas
      const ideas = parseContentIdeas(data.analysis);
      setSuggestions(ideas);

      toast({
        title: "Content ideas generated",
        description: `Generated ${ideas.length} AI-powered content suggestions.`,
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate content suggestions. Please try again.",
        variant: "destructive",
      });
      
      // Fallback suggestions
      setSuggestions([
        {
          topic: "Tutorial: Quick AI Tool Demo",
          hook: "This AI tool changed everything...",
          cta: "Comment 'TOOL' for the link",
          expectedPerformance: "High engagement based on tutorial pattern",
          confidence: 85
        },
        {
          topic: "Behind-the-scenes: Content Creation",
          hook: "Here's how I create viral content",
          cta: "Follow for more insider tips",
          expectedPerformance: "Strong saves and profile visits",
          confidence: 78
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const parseContentIdeas = (analysis: string): ContentIdea[] => {
    // Simple parsing logic - in production, you'd want more sophisticated parsing
    const ideas: ContentIdea[] = [];
    const lines = analysis.split('\n');
    
    let currentIdea: Partial<ContentIdea> = {};
    
    lines.forEach(line => {
      const lower = line.toLowerCase();
      
      if (lower.includes('topic:') || lower.includes('idea:')) {
        if (currentIdea.topic) {
          ideas.push(currentIdea as ContentIdea);
          currentIdea = {};
        }
        currentIdea.topic = line.replace(/^.*?:\s*/, '').trim();
      } else if (lower.includes('hook:')) {
        currentIdea.hook = line.replace(/^.*?:\s*/, '').trim();
      } else if (lower.includes('cta:') || lower.includes('call to action:')) {
        currentIdea.cta = line.replace(/^.*?:\s*/, '').trim();
      } else if (lower.includes('performance:') || lower.includes('expected:')) {
        currentIdea.expectedPerformance = line.replace(/^.*?:\s*/, '').trim();
        currentIdea.confidence = 80; // Default confidence
      }
    });
    
    if (currentIdea.topic) {
      ideas.push(currentIdea as ContentIdea);
    }
    
    return ideas.filter(idea => idea.topic && idea.hook);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-text-primary">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            AI Content Ideas
          </CardTitle>
          <Button
            onClick={generateSuggestions}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {loading ? 'Generating...' : 'Generate Ideas'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">Click "Generate Ideas" to get AI-powered content suggestions</p>
            <p className="text-sm text-text-muted mt-1">Based on your best-performing content patterns</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((idea, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg bg-muted/5 hover:bg-muted/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-medium text-text-primary">{idea.topic}</h4>
                  <Badge variant="outline" className="text-xs">
                    {idea.confidence}% confidence
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Zap className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-text-muted font-medium">Hook: </span>
                      <span className="text-text-primary">{idea.hook}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Target className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-text-muted font-medium">CTA: </span>
                      <span className="text-text-primary">{idea.cta}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-text-muted font-medium">Expected: </span>
                      <span className="text-text-primary">{idea.expectedPerformance}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};