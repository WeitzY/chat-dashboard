# Guest Chat (Portfolio)

👉 **[💬 Live Guest Chat](https://chat-dashboard-tau-seven.vercel.app/)**

👉 **[📂 Chat Repo](https://github.com/WeitzY/chat-dashboard)**

👉 **[📂 Functions Repo](https://github.com/WeitzY/core-dashboard-staff)**

---

## About

Mobile-first **Next.js app** where hotel guests chat with an AI concierge.
Each message is **stateless** by design:
Guest message → AI answers from FAQs/items → optional request created.
*(No long context/history for simplicity in demo scope.)*

---

## What this showcases

* **Modern stack**: Next.js 15, React 19, Tailwind v4, TypeScript
* **UI/UX focus**: Mobile-first layout with Shadcn primitives
* **Supabase**: Anonymous Auth, guests persisted for 1h via cookie
* **Edge Function ready**: Hook integration for AI responses
* **Language support**: Language switcher with mobile-friendly abbreviations

---

## Current features

* Onboarding overlay → collects name, room, language, inserts into `guests` table
* Guest session with Supabase anon auth (cookie persisted 1h)
* AI chat: per-message replies via Edge Function endpoint
* Simple, production-like data access rules (RLS enforced)

---

## Notes & trade-offs

* Stateless per message (no persistent thread memory)
* No server-side chat history yet
* Public hotel fields controlled via RLS / policy (see `guest-chat.md`)

---

## Tech

* Next.js 15, React 19, Tailwind v4, TypeScript
* Supabase v2 (Anonymous Auth only)
* Shadcn UI primitives

---

## Structure

```
src/app/        → Layout, globals, signup overlay + chat
src/components/ → Chat UI, signup UI, UI wrappers
src/lib/        → Supabase client, cookie helpers
src/utils/      → Languages, translations
```

---

## License

Personal **portfolio project**.
Not for production use without review.

Do you want me to also prepare a **short LinkedIn-style project summary** (3 bullets + link) so you can drop it directly under “Projects” in your profile without overwhelming detail?
