-- Create followers_history table
create table if not exists public.followers_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  entry_date date not null,
  followers_count bigint not null check (followers_count >= 0),
  created_at timestamptz default now(),
  unique (user_id, entry_date)
);

-- Enable RLS
alter table public.followers_history enable row level security;

-- Create RLS policies
create policy "Users can view their own follower history" 
on public.followers_history 
for select 
using (auth.uid() = user_id);

create policy "Users can insert their own follower history" 
on public.followers_history 
for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own follower history" 
on public.followers_history 
for update 
using (auth.uid() = user_id);

-- Create index for efficient queries
create index if not exists idx_followers_user_entry_date on public.followers_history(user_id, entry_date);

-- Insert initial seed data for current user (this will be handled by the app, but adding as example)
-- Note: This would normally be done in the app when user first loads the system