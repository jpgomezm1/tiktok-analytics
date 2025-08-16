-- Enable pgvector extension
create extension if not exists vector;

-- Create TikTok Brain vectors table
create table if not exists tiktok_brain_vectors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  video_id uuid not null,
  content_type text not null check (content_type in ('hook','cta','guion')),
  content text not null,
  embedding vector(1536) not null,
  -- Metrics snapshot
  retention_pct numeric,
  saves_per_1k numeric,
  f_per_1k numeric,
  for_you_pct numeric,
  views bigint,
  duration_seconds int,
  video_type text,
  published_date date,
  created_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (video_id) references videos(id) on delete cascade
);

-- Create indexes
create index on tiktok_brain_vectors (user_id, content_type);
create index on tiktok_brain_vectors using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Enable RLS
alter table tiktok_brain_vectors enable row level security;

-- RLS policies
create policy "Users can view their own vectors" 
on tiktok_brain_vectors for select 
using (auth.uid() = user_id);

create policy "Users can insert their own vectors" 
on tiktok_brain_vectors for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own vectors" 
on tiktok_brain_vectors for update 
using (auth.uid() = user_id);

create policy "Users can delete their own vectors" 
on tiktok_brain_vectors for delete 
using (auth.uid() = user_id);

-- Create brain queries log table for observability
create table if not exists brain_queries_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  query text not null,
  top_k int not null,
  latency_ms int,
  created_at timestamptz default now()
);

-- Enable RLS for brain queries log
alter table brain_queries_log enable row level security;

create policy "Users can view their own query logs" 
on brain_queries_log for select 
using (auth.uid() = user_id);

create policy "Users can insert their own query logs" 
on brain_queries_log for insert 
with check (auth.uid() = user_id);