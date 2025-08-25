# Guest Chat (Resume Project)

A mobile-first Next.js app where hotel guests chat with an AI concierge. Each message is stateless by design: Guest message → AI answers from FAQs/items → optional request is created. No long context or history.

## Highlights recruiters care about
- Built with Next.js 15 + React 19, Tailwind CSS 4, TypeScript
- Clean, mobile-first UI with Shadcn primitives
- Anonymous auth with Supabase; minimal, production-ready data access
- Edge Function integration ready for AI responses

## What works now
- Onboarding overlay collects name, room, language and creates a `guests` row
- Anonymous session created; guest info persisted via cookie (1 hour)
- Chat UI with greeting, per-message AI replies via Edge Function endpoint hook
- Language switcher; on mobile, language names are abbreviated (EN/ES/…)

## Known trade-offs (intentional for scope)
- Stateless chat: no thread memory between messages
- No server-persisted chat history yet
- Public hotel fields must be granted via RLS/policy (see guest-chat.md)

## Run locally
```bash
npm i
npm run dev
```
Env required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_TEST_HOTEL_ID`

## Tech
- Next.js 15, React 19, TypeScript, Tailwind v4
- Supabase JS v2 (Anonymous Auth only)
- Shadcn UI building blocks

## Structure
```text
src/
  app/            # layout, globals, page (signup overlay + chat)
  components/     # chat UI, signup UI, ui primitives wrappers
  lib/            # supabase client, cookies helpers
  utils/          # languages, translations
```

## License
Personal portfolio project. Not for production use without review.