# Supabase Database Setup for Human Counter AI

To ensure your **Human Counter AI** reports are saved correctly, you must set up a `reports` table in your Supabase project.

## Table: `reports`

| Column | Type | Default |
| --- | --- | --- |
| `id` | `uuid` | `gen_random_uuid()` |
| `created_at` | `timestamptz` | `now()` |
| `men` | `int4` | `0` |
| `women` | `int4` | `0` |
| `children` | `int4` | `0` |
| `total` | `int4` | `0` |
| `duration_seconds` | `int4` | `0` |

## SQL Migration
Run the following SQL in your **Supabase SQL Editor**:

```sql
create table reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  men int4 default 0,
  women int4 default 0,
  children int4 default 0,
  total int4 default 0,
  duration_seconds int4 default 0
);

-- Enable Row Level Security (optional but recommended)
-- alter table reports enable row level security;
```

## Environment Variables
Ensure your Expo environment variables are set in a `.env` file within the root directory:

```bash
EXPO_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```
