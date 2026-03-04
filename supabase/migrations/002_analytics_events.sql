-- Analytics events table — stores custom events from the marketing website.
-- Populated by the analytics Edge Function (public endpoint, no auth).

CREATE TABLE IF NOT EXISTS analytics_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name text NOT NULL,
    page_path text,
    properties jsonb DEFAULT '{}',
    session_id text,
    referrer text,
    created_at timestamptz DEFAULT now()
);

-- Fast lookups by event name + time range
CREATE INDEX idx_analytics_events_name_date ON analytics_events (event_name, created_at DESC);

-- Fast lookups by page path
CREATE INDEX idx_analytics_events_path ON analytics_events (page_path, created_at DESC);

-- Content changelog — tracks title/meta changes across deployments.
-- Populated by scripts/snapshot-content.mjs at build time.

CREATE TABLE IF NOT EXISTS content_changelog (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    page_path text NOT NULL,
    field text NOT NULL,
    old_value text,
    new_value text,
    created_at timestamptz DEFAULT now()
);
