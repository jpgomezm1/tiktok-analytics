-- Create content ideas feedback table
CREATE TABLE public.content_ideas_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  idea_id UUID NOT NULL,
  idea_text TEXT NOT NULL,
  idea_type TEXT NOT NULL CHECK (idea_type IN ('hook', 'guion', 'cta')),
  idea_mode TEXT NOT NULL CHECK (idea_mode IN ('exploit', 'explore')),
  published_video_id UUID REFERENCES public.videos(id),
  expected_metrics JSONB,
  actual_metrics JSONB,
  outcome TEXT CHECK (outcome IN ('success', 'failure', 'neutral')),
  feedback_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.content_ideas_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own content ideas feedback"
  ON public.content_ideas_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content ideas feedback"
  ON public.content_ideas_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content ideas feedback"
  ON public.content_ideas_feedback
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content ideas feedback"
  ON public.content_ideas_feedback
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_content_ideas_feedback_user_id ON public.content_ideas_feedback(user_id);
CREATE INDEX idx_content_ideas_feedback_idea_type ON public.content_ideas_feedback(idea_type);
CREATE INDEX idx_content_ideas_feedback_outcome ON public.content_ideas_feedback(outcome);

-- Create trigger for updated_at
CREATE TRIGGER update_content_ideas_feedback_updated_at
  BEFORE UPDATE ON public.content_ideas_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();