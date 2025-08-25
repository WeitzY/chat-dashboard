# Guest Chat – Cursor Context

This is the authoritative context file for automated edits. Keep it accurate. The app is a mobile-first, guest-facing chat for hotels with a simplified stateless chat flow.

## Core behavior
- On first load, a signup overlay collects: language, name, room number
- Anonymous user is created with Supabase; a `guests` row is inserted
- The overlay closes; chat renders a greeting and a disclaimer
- Each new guest message is handled independently: the Edge Function answers from FAQs/items and may create a request; no chat history is considered

## Data model assumptions (Supabase)
- `public.hotels`: `id`, `name`, `languages[]`, `default_language`
- `public.guests`: `id`, `user_id`, `hotel_id`, `room_number`, `last_name`, `language`
- Active hotel comes from `NEXT_PUBLIC_TEST_HOTEL_ID` (dev). In prod, derive from subdomain.

## Security and exposure
- Enable RLS on `public.hotels` and allow public read of only the columns used by signup
```sql
alter table public.hotels enable row level security;
drop policy if exists "Public can read hotel rows" on public.hotels;
create policy "Public can read hotel rows" on public.hotels for select to anon, authenticated using (true);
revoke select on table public.hotels from anon, authenticated;
grant select (id, name, languages, default_language) on table public.hotels to anon, authenticated;
```

## Tech and constraints
- Next.js 15 (App Router), React 19, Tailwind v4
- Supabase JS v2, Anonymous Auth only
- UI built with Shadcn primitives under `src/components/ui/*` (do not modify primitives; style at call sites)
- Mobile-first: safe-area utils in `globals.css`

## Files of interest
- `src/app/page.tsx`: renders chat + signup overlay, manages cookie bootstrap
- `src/components/SignupForm.tsx` + `signup/*`: fetch hotel, validate form (zod), sign in anonymously, insert guest
- `src/components/ChatInterface.tsx` + `chat/*`: header with language switch, messages list, input, disclaimer
- `src/lib/supabase.ts`: client; needs env `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_TEST_HOTEL_ID`
- `src/lib/cookies.ts`: helpers for `guest_info` cookie (1-hour TTL) and consent
- `src/utils/languages.ts`: supported languages, flags, translations

## Message sending (Edge Function)
The hook `useGuestChat` posts to `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat-handler` with:
```json
{
  "message": string,
  "hotelId": string,
  "lastName": string,
  "roomNumber": string,
  "language": string,
  "sessionCode": string | undefined,
  "guestId": string | undefined
}
```
Response should include `guestResponse` (or `message`). Append to messages as AI.

## Cookies and session
- `guest_info` stores minimal guest data for 1 hour
- If cookie is missing, we sign out of Supabase on load to avoid auto-restoring old sessions
- Respect `cookie_consent` before setting cookies

## UI rules
- Use Tailwind utility classes; keep mobile-first (`sm:` for larger)
- Keep interactive elements with `cursor-pointer` at usage sites
- On mobile, language selector shows abbreviated labels (e.g., EN, ES) with flags

## Roadmap (scoped)
- Persist chat history or stream from the function (optional)
- Derive `hotel_id` from subdomain in prod

This file is the single source of truth for automated refactors in this repo.