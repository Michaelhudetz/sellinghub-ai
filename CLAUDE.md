# Real Estate AI Chatbot

Czech real estate agent course chatbot that generates ready-to-send formal letters (physical letter copywriting). Custom Next.js frontend on Vercel, Dify workflow backend on Hetzner. Embedded via iframe in the course platform.

## Architecture

```
[Course Platform] --iframe--> [Next.js Frontend on Vercel] --API--> [Dify on Hetzner]
```

- **Frontend**: Next.js App Router (`/app`), React, Tailwind CSS, TypeScript
- **Backend**: Dify (open-source, self-hosted on Hetzner via Docker) — DO NOT modify Dify's Docker/server config
- **Hosting**: Vercel (frontend), Hetzner (Dify)
- **Auth**: SSO via JWT issued by the course platform (implementation in progress)

## Dify Integration

Dify is an open-source LLM orchestration platform. Our app uses the **Workflow API**.

- Dify manages all AI logic, prompt chains, model selection, and knowledge bases
- All API keys and AI config live inside Dify's visual editor — NOT in this codebase
- This app only stores the Dify API URL and API key in `.env`
- API endpoint: `POST {DIFY_API_URL}/v1/workflows/run`
- Auth header: `Authorization: Bearer {DIFY_API_KEY}`
- Dify identifies workflows by the API key — each key maps to one workflow
- Response mode can be `blocking` (wait for full response) or `streaming` (SSE)
- Dify may track conversations via `conversation_id` — check if the current implementation passes this
- Dify docs: https://docs.dify.ai

### What you CAN do:
- Modify Next.js frontend code (components, API routes, styles)
- Add/edit Next.js API routes in `/app/api/` to proxy Dify calls or handle auth
- Change how the frontend sends requests to Dify

### What you CANNOT do:
- Modify Dify's Docker configuration, server files, or internal code
- Access Dify's database directly
- Change Dify workflow logic (that's done in Dify's web editor)

## Folder Structure

```
/app
  /api          — Next.js API routes (proxy to Dify, future auth endpoints)
  /components   — React UI components (chat interface, forms, etc.)
  /styles       — CSS/Tailwind styles
  layout.tsx    — Root layout
  page.tsx      — Main page
.env.local      — DIFY_API_URL, DIFY_API_KEY, future JWT_SECRET
```

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — ESLint check
- `npm run fix` — ESLint auto-fix

## Current Features

- AI chat interface with streaming responses
- Image paste (Cmd+V) support
- Contact/input form
- No authentication yet (open to anyone with the URL)

## User Profile & Letter Generation

The chatbot's primary output is ready-to-send formal Czech letters for real estate agents. Each letter needs the user's contact details (name, firm, email, phone) in the header/signature.

### Profile Data Flow

```
JWT (name, email) --> Pre-fill profile --> User edits/adds (firm, phone) --> Saved in session
                                                                                  |
User sends message --> /app/api/chat proxy --> injects profile as Dify input vars --> Dify workflow
                                                                                  |
                                                                          Dify generates letter
                                                                          with user's contact info
```

### Implementation Details

1. **Initial data from JWT**: When SSO token is verified, extract `name` and `email` from JWT payload
2. **Profile form UI**: Show an editable profile card (pre-filled from JWT) where user can add/edit:
   - Full name (`user_name`)
   - Firm/company (`user_firm`)
   - Email (`user_email`)  
   - Phone (`user_phone`)
3. **Persistence**: Store profile in an HTTP-only cookie (same mechanism as auth session) so it survives iframe reloads. NO localStorage (iframe restrictions + XSS risk).
4. **Injection into Dify**: On every `/app/api/` call to Dify, the proxy route reads the profile from the session cookie and passes it as workflow input variables:
   ```json
   {
     "inputs": {
       "user_name": "Jan Novák",
       "user_firm": "RE/MAX Česko",
       "user_email": "jan@remax.cz",
       "user_phone": "+420 777 123 456",
       "query": "<user's actual message>"
     },
     "response_mode": "streaming",
     "user": "<userId from JWT>"
   }
   ```
5. **Dify workflow side**: The workflow's Start node must have matching input variables defined (`user_name`, `user_firm`, `user_email`, `user_phone`). These are used in the letter template. This is configured in Dify's visual editor — not in this codebase.

### Profile UX Rules

- Show profile card on first visit (after SSO) with a prompt to review/complete their info
- Allow editing anytime via a small profile icon in the chat header
- If profile is incomplete (e.g., no firm), still allow chat but show a gentle reminder
- Never block the user from chatting — profile is optional but improves output quality
- Profile changes take effect immediately on the next message (no save-and-reload)

### What the course platform JWT should ideally include

Updated JWT payload request for their developers:
```json
{
  "sub": "<userId>",
  "name": "<full name>",
  "email": "<email>",
  "firm": "<company name, if available>",
  "phone": "<phone, if available>",
  "iat": "<timestamp>",
  "exp": "<timestamp +24h>"
}
```
`firm` and `phone` are optional in the JWT — if not provided, user fills them in the chatbot.

## SSO Implementation (In Progress)

### Flow Overview

The chatbot is embedded in the course platform via iframe. The course platform issues a JWT token for authenticated users. The goal is:

1. Course platform generates a signed JWT containing `{ sub, name, email, firm?, phone?, exp }` 
2. Platform appends token to iframe URL: `https://chatbot.example.com?token=<JWT>`
3. Next.js API route `/api/auth/verify` validates the JWT using a shared secret
4. On success, sets an HTTP-only cookie with a session token
5. All subsequent Dify API calls go through a Next.js API proxy that checks the cookie
6. The `userId` from the JWT is passed to Dify as a `user` parameter for conversation tracking

### iframe + Cookie Constraints

- HTTP-only cookies in iframes require `SameSite=None; Secure` attributes
- The chatbot MUST be served over HTTPS
- Safari and some browsers block third-party cookies in iframes — the fallback is passing the token via `postMessage` from parent window or re-validating from URL param per request
- NEVER store JWT in localStorage or sessionStorage (XSS vulnerable)
- NEVER expose JWT to client-side JavaScript

### What the course platform developers need to implement:

Keep this as simple as possible for them:
1. Generate a JWT signed with HS256 using a shared secret
2. Payload: `{ sub: <userId>, name: <n>, email: <email>, firm?: <company>, phone?: <phone>, iat: <timestamp>, exp: <timestamp +24h> }`
3. `firm` and `phone` are optional — include if available, otherwise user fills them in the chatbot
4. Append to iframe src: `<iframe src="https://chatbot.domain.com?token=<JWT>">`
5. That's it — our Next.js backend handles everything else

## Coding Conventions

- TypeScript strict mode
- Functional components with hooks
- Tailwind CSS for styling — no inline styles, no separate CSS files for components
- API routes handle all sensitive operations (Dify calls, auth) — never call Dify directly from the client
- Use `axios` for HTTP requests (already installed)
- Error responses: `{ error: string, status: number }`
- All user-facing text must support Czech language

## Important Rules

- NEVER expose Dify API key to the client/browser — all Dify calls go through /app/api/ routes
- NEVER modify Dify's Docker/server configuration
- NEVER store secrets in client-side code
- Always validate JWT before processing any authenticated request
- When adding responsive design, test at 375px (mobile), 768px (tablet), and 1024px+ (desktop)
- The app runs inside an iframe — avoid `window.top` references, respect iframe sandboxing
- Czech characters (háčky, čárky) must render correctly everywhere — use UTF-8

## Dependencies (Key Ones)

- `axios` — HTTP client for Dify API calls
- `@headlessui/react` — accessible UI components
- `@heroicons/react` — icon set
- `@remixicon/react` — additional icons
- `@floating-ui/react` — popover/tooltip positioning
- `ahooks` — React hooks library
- `class-variance-authority` — component variant styling

## Lessons Learned

<!-- Add entries here when Claude Code makes mistakes -->