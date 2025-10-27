# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pulse News Aggregator** is a modern, AI-powered news aggregation platform built with Next.js 15 that collects, categorizes, and summarizes news from multiple international and domestic (Korean) sources. It features AI-powered summaries using OpenAI GPT-4o-mini, bilingual search with automatic translation, scheduled email subscriptions, and user analytics.

## Development Commands

### Local Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

**Note**: The project uses both `npm` and `pnpm` (check `pnpm-lock.yaml` presence). For consistency, use the package manager with existing lock files.

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript 5 (strict mode, path alias `@/*`)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **AI**: OpenAI GPT-4o-mini for summaries and keyword analysis
- **Email**: Resend with scheduled sending support
- **Translation**: Naver Papago API (Korean ↔ English)
- **Styling**: Tailwind CSS 4.1.9 + Radix UI components
- **Cron**: Vercel Cron Jobs (2 schedules in `vercel.json`)

### Data Flow Architecture

#### News Aggregation Flow
1. RSS Fetcher (`lib/news/rss-fetcher.ts`) + Naver News API (`lib/news/naver-news-fetcher.ts`)
2. Auto-categorization via `lib/news/categorizer.ts` (keyword-based)
3. Deduplication using URL-based hashing (`lib/utils/hash.ts`)
4. Rendering via `NewsCard` (Grid/List/Compact layouts)

#### AI Summarization Flow
1. User clicks "AI 요약" → `useArticleSummary` hook
2. Check Supabase `news_summaries` table for cached summary by `news_id`
3. If not cached: Crawl full article (`/api/crawl`) → OpenAI → Cache in Supabase
4. Track analytics in `news_summary_analytics` table
5. Return summary + key points with view count

#### Search Flow
1. User enters query → `SearchKeywordAPI` analyzes with OpenAI (keyword separation)
2. Korean detection via regex → Papago translation if needed
3. Search both Naver News (Korean) and cached articles
4. Save to `search_keyword_analytics` for trending keywords

#### Email Subscription System (Scheduled Delivery)
**Cron Schedule** (1 hour before delivery):
- KST 5AM, 11AM, 5PM (UTC 8PM, 2AM, 8AM) → See `vercel.json`
- Note: Only 2 crons configured (Vercel free plan constraint)

**Processing Flow**:
1. Cron hits `/api/cron/send-daily-digest` (orchestrator)
2. Calculate `targetDeliveryHour = currentHour + 1` (e.g., 5AM cron → 6AM delivery)
3. Filter subscribers: `enabled=true`, `delivery_days` includes current day, `delivery_hour = targetDeliveryHour`
4. For each subscriber: Call `/api/email/send-digest` with `scheduledDeliveryHour` param
5. Collect news matching subscribed keywords (last 24h, max 10 articles)
6. Generate HTML email template
7. Schedule via Resend API with `scheduledAt` (KST → UTC ISO 8601)
8. Log to `email_delivery_logs` table

**Delivery times**: KST 6AM, 12PM, 6PM (radio button selection only)

### Key Implementation Patterns

#### Supabase Client Usage
- **Server Components/API Routes**: Use `lib/supabase/server-client.ts` (cookie-based auth)
- **Client Components**: Use `lib/supabase/browser-client.ts`
- **Middleware**: Creates server client inline with cookie handling
- All tables have RLS enabled; most allow public read, authenticated write

#### Authentication
- Google OAuth via Supabase Auth
- Middleware (`middleware.ts`) manages session cookies on all routes except static files
- Auth callback: `/auth/callback/route.ts`
- User state tracked in hooks: `hooks/useAuth.ts`

#### State Management
- **No global state library**: Uses React hooks exclusively
- `useNewsFilters`: Category, region, search query, time range (1-48h)
- `useLayoutMode`: Grid/List/Compact (localStorage persistence)
- `useRecentArticles`: Session storage (max 5 articles)

#### Image Handling Strategy
Three-tier fallback in `NewsCard` components:
1. Original article image
2. Retry with `?retry=1` param on error
3. Fallback to source logo from `lib/utils/news-logos.ts`

#### TypeScript Paths
Import alias configured: `@/*` → project root (see `tsconfig.json` paths)

## Database Schema (Supabase)

### Core Tables
- **news_summaries**: Cached AI summaries, key_points[], view_count, category
  - Indexed: `news_url`, `key_points` (GIN), `category`, `created_at DESC`
- **news_summary_analytics**: User-level stats (summary_request_count, link_click_count)
  - Unique constraint: `(user_id, news_id)`
- **search_keyword_analytics**: Keyword search counts for trending queries
- **email_subscription_settings**: User settings (enabled, email, delivery_days[], delivery_hour)
  - Constraint: `delivery_hour IN (6, 12, 18)`
- **subscribed_keywords**: User keywords (max 3 per user, UI enforced)
- **email_delivery_logs**: Send logs (status: success/failed/pending)
- **bookmarks**: User-saved articles

### Triggers
- `update_updated_at_column()`: Auto-updates `updated_at` on news_summaries

## API Endpoints Reference

### Core APIs
- `GET /api/news` - Aggregate RSS + Naver News, returns stats (total, duplicatesRemoved)
- `GET /api/search?q=...&region=all|domestic|international` - Bilingual search with translation
- `POST /api/summarize` - Generate AI summary (checks cache first)
- `GET /api/summary/[newsId]` - Fetch existing summary by ID
- `POST /api/crawl` - Extract full article content (Cheerio-based)

### Analytics
- `POST /api/analytics/link-click` - Track article clicks
- `POST /api/analytics/search-keyword` - Process keywords with OpenAI, dedupe, save
- `GET /api/trending?range=1h|24h|7d` - Popular search keywords

### Email Subscription
- `GET/POST/DELETE /api/subscriptions/keywords` - Manage subscribed keywords
- `GET/POST/DELETE /api/subscriptions/email-settings` - Manage email preferences
- `POST /api/email/send-digest` - Send to user (immediate or scheduled with `scheduledDeliveryHour`)
- `GET /api/cron/send-daily-digest` - Cron orchestrator (filters & batches subscribers)

### User
- `GET /api/mypage` - Fetch user stats (summary usage, clicks, searches)
- `GET/POST/DELETE /api/bookmarks` - Bookmark management

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# OpenAI
OPENAI_API_KEY=

# Naver Cloud Platform (Papago Translation)
NAVER_CLOUD_CLIENT_ID=
NAVER_CLOUD_CLIENT_SECRET=

# Naver Developers (News Search API)
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# Resend (Email)
RESEND_API_KEY=

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional: Cron security
CRON_SECRET=
```

## Important Implementation Notes

### News Categorization (`lib/news/categorizer.ts`)
Uses keyword matching for categories:
- **Politics**: 정치, 국회, 선거, 대통령, parliament, election, senate
- **Sports**: KBO, MLB, NBA, Premier League, Champions League, Olympics
- **Entertainment**: SM, JYP, HYBE, YG, Disney, Netflix, Marvel, Oscar
- Falls back to "all" if no match

### Bilingual Search Logic
1. Detect Korean using regex: `/[가-힣]/`
2. If Korean: Search Naver News directly
3. Attempt Papago translation (Korean → English)
4. Search international RSS sources with English query
5. Merge and deduplicate results

### Cron Job Constraints
- Vercel free plan: Only 2 cron schedules allowed
- Current setup covers 2 of 3 time slots (5AM & 5PM crons)
- Missing: 11AM cron for 12PM delivery (noted in `EMAIL_SUBSCRIPTION_GUIDE.md`)
- To add 11AM slot: Requires Vercel Pro or consolidate schedules

### Next.js Config Notes
- `ignoreDuringBuilds: true` for ESLint and TypeScript (fast builds, but use caution)
- `images.unoptimized: true` - All images bypass Next.js optimization
- Extensive `remotePatterns` for news source images (BBC, CNN, NYT, Naver, etc.)

### Middleware Behavior
- Runs on all routes except `_next/static`, `_next/image`, `favicon.ico`, and static assets
- Initializes Supabase server client with cookie sync
- No route protection logic active (commented out template code exists)

## Component Architecture

### Layout Modes
Three rendering modes (toggle in `LayoutSwitcher`):
- **Grid**: Default card layout (`NewsCard`)
- **List**: Horizontal layout, thumbnail left (`NewsCardList`)
- **Compact**: Minimal info, high density (`NewsCardCompact`)

### Filter System
Filters managed by `useNewsFilters` hook:
- **Category**: all, world, politics, business, technology, science, health, sports, entertainment
- **Region**: all, domestic, international
- **Time Range**: 1-48 hours (slider component)
- **Search Mode**: Dynamically enables/disables category filters based on available results

### Sidebar Components
- **TrendingKeywords**: Shows top searches by time range (1h/24h/7d tabs)
- **RecentArticles**: Session-stored history (max 5), displays relative time

## Testing and Debugging

### Local Email Testing
```bash
# Immediate send
curl -X POST http://localhost:3000/api/email/send-digest \
  -H "Content-Type: application/json" \
  -d '{"userId": "uuid"}'

# Scheduled send (1h later)
curl -X POST http://localhost:3000/api/email/send-digest \
  -H "Content-Type: application/json" \
  -d '{"userId": "uuid", "scheduledDeliveryHour": 12}'

# Trigger cron manually
curl http://localhost:3000/api/cron/send-daily-digest
```

### Vercel Cron Testing
In Vercel dashboard → Cron Jobs tab → Click "Trigger" button

### Database Queries for Debugging
```sql
-- Check email logs
SELECT * FROM email_delivery_logs ORDER BY sent_at DESC LIMIT 10;

-- View trending keywords
SELECT keyword, search_count FROM search_keyword_analytics
ORDER BY last_searched_at DESC LIMIT 20;

-- Check summary cache hits
SELECT news_id, view_count, created_at FROM news_summaries
WHERE view_count > 5 ORDER BY view_count DESC;
```

## Code Style and Conventions

- **TypeScript**: Strict mode enabled, always define types for props/returns
- **API Routes**: Return JSON with consistent error structure `{ error: string }`
- **Error Handling**: Try-catch in API routes, return 500 with error message
- **Logging**: Use `console.log` for debugging, `console.error` for errors
- **Comments**: Korean comments in components, English in library functions
- **Naming**: Kebab-case for files, PascalCase for components, camelCase for functions

## Known Issues and TODOs

### Current Limitations
1. **No API Client Layer**: Components directly use `fetch` (consider adding `lib/api/client.ts`)
2. **No Tests**: Zero test coverage (unit tests needed for utils and categorizer)
3. **No Error Boundaries**: Client-side errors crash entire page
4. **Translation Failures**: Papago errors are logged but don't block search
5. **Cron Limitation**: Only 2/3 time slots configured (missing 11AM/12PM slot)

### Potential Improvements
- Add React Query for server state management and automatic caching
- Implement error boundaries at page and component levels
- Add retry logic for external API calls (OpenAI, Naver, Resend)
- Create API client abstraction layer to centralize fetch logic
- Add logging service integration (e.g., Sentry, LogRocket)

## Security Considerations

- **RLS Policies**: All tables enforce row-level security
- **Cron Secret**: Optional Bearer token validation via `CRON_SECRET` env var
- **API Keys**: Server-side only (never exposed to client)
- **XSS Protection**: All user inputs sanitized before rendering
- **Email Validation**: Format checked before saving subscription settings

## Useful File References

- **RSS Feed Config**: `lib/news/feeds.ts` - Add/remove news sources here
- **Category Keywords**: `lib/news/categorizer.ts` - Modify classification logic
- **Email Template**: `app/api/email/send-digest/route.ts` - HTML structure inline
- **Database Schema**: `supabase/schema.sql` - Full table definitions with comments
- **Project Structure**: `STRUCTURE.md` - Detailed Korean documentation
- **Subscription Guide**: `EMAIL_SUBSCRIPTION_GUIDE.md` - Email feature deep dive

## Deployment Checklist

1. Set all environment variables in Vercel dashboard
2. Run `supabase/schema.sql` in Supabase SQL Editor
3. Configure Resend domain and verify sender email
4. Verify cron schedules in `vercel.json` match desired times (UTC conversion)
5. Test email delivery with manual trigger before enabling subscriptions
6. Enable Vercel Analytics (already integrated via `@vercel/analytics`)
