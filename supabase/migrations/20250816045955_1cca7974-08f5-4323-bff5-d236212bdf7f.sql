-- Create saved_views table for storing user's custom filter combinations
create table if not exists saved_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  filters jsonb not null,
  sort_by text not null,
  normalize_by_1k boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table saved_views enable row level security;

-- Create policies
create policy "Users can view their own saved views" 
on saved_views for select 
using (auth.uid() = user_id);

create policy "Users can create their own saved views" 
on saved_views for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own saved views" 
on saved_views for update 
using (auth.uid() = user_id);

create policy "Users can delete their own saved views" 
on saved_views for delete 
using (auth.uid() = user_id);

-- Create index for performance
create index if not exists idx_saved_views_user_id on saved_views(user_id);

-- Create trigger for updated_at
create trigger update_saved_views_updated_at
  before update on saved_views
  for each row
  execute function update_updated_at_column();