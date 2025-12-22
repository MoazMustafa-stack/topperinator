# AI Coding Agent Instructions for Topper-inator

## Project Overview
Topper-inator is a Next.js 16 application for extracting YouTube transcripts at scale. Built with React 19, TypeScript, Supabase for auth/database, and Tailwind CSS with shadcn/ui components.

## Architecture
- **Frontend**: Next.js App Router with client/server components
- **Auth**: Supabase Auth with protected routes (middleware redirects unauthenticated users from `/dashboard` to `/sign-in`)
- **Database**: Supabase PostgreSQL with RLS policies (users table only)
- **Transcript Extraction**: Client-side API calls to `/api/extract` using `youtube-transcript` library
- **Styling**: Tailwind with custom green theme (#c4ff0e), monospace fonts, uppercase text, and "scanline-bg" background pattern

## Key Components Structure
- `src/app/`: App Router pages (extractor, auth, dashboard)
- `src/components/`: Reusable UI components (shadcn/ui based)
- `src/components/extractor/`: Transcript extraction UI modules
- `supabase/`: Local Supabase config, migrations, and client setup

## Development Workflow
- **Start dev server**: `npm run dev` (requires local Supabase running)
- **Local Supabase**: Run `supabase start` in project root (not in package.json scripts)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (ESLint only, no Prettier)
- **Environment**: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Code Patterns
- **Auth**: Use server actions in `src/app/actions.ts` for sign-up/sign-in
- **API Routes**: Place in `src/app/api/` with proper error handling
- **Types**: Define interfaces in page files (e.g., `TranscriptResult` in extractor/page.tsx)
- **Styling**: Use `font-mono`, `uppercase`, `tracking-wide` classes for consistent UI
- **Components**: Client components for interactive features, server for static content
- **Imports**: Use `@/` alias for src directory

## Common Tasks
- **Add new extractor feature**: Create component in `src/components/extractor/`, integrate in page.tsx
- **Add auth-protected page**: Add to middleware matcher, check session in component
- **Database changes**: Create migration in `supabase/migrations/`, update types in `src/types/supabase.ts`
- **UI components**: Use shadcn/ui from `src/components/ui/`, customize with Tailwind classes

## File Examples
- **New extractor component**: Follow `InputModule.tsx` pattern with props interface and client directive
- **API route**: See `/api/extract/route.ts` for POST handling with try/catch
- **Server action**: See `signUpAction` in `actions.ts` for Supabase operations and redirects</content>
<parameter name="filePath">/home/moazmustafa/Desktop/Project/topperinator/.github/copilot-instructions.md