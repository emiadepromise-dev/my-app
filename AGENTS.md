<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# CyberYoshi — Agent Rules

This document defines the mandatory rules for any AI agent working on the CyberYoshi codebase. Follow these rules exactly. Do not deviate.


## PROJECT OVERVIEW

CyberYoshi is a lightweight cybersecurity toolkit built with Next.js. It provides practical security tools: website scanning, port scanning, file hashing, password generation, and security utilities.

- **No user accounts** — MVP has zero auth. No login, no signup, no sessions.
- **Local data only** — scan history stored in SQLite via Prisma. No cloud sync.
- **Client-first** — most pages are interactive tools. Use Client Components (`"use client"`) for anything with state, events, or browser APIs.


## TECH STACK (DO NOT CHANGE)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| UI Components | Shadcn/UI (base-nova style) |
| Styling | Tailwind CSS v4 + CSS variables |
| Icons | Lucide React |
| Database | SQLite |
| ORM | Prisma (prisma-client-js generator) |
| Validation | Zod |
| Forms | React Hook Form + @hookform/resolvers |
| Utilities | clsx, tailwind-merge, class-variance-authority |

Do NOT install additional UI libraries, state management libraries, animation libraries, or CSS-in-JS solutions. The stack is fixed.


## RULES — DO

### Code Style
- Use TypeScript for all files. No `.js`, `.jsx` files.
- Use `"use client"` directive only when the component needs state, event handlers, or browser APIs. Default to Server Components.
- Use `@/` path alias for all imports (e.g., `@/components/...`, `@/lib/...`).
- Use `cn()` from `@/lib/utils` for conditional class names. Never use template literals for className.
- Use Shadcn components from `@/components/ui/`. Do not create custom button, input, card, or other primitive components when Shadcn provides them.
- Use Lucide icons from `lucide-react`. Do not install other icon libraries.
- Use `export default function ComponentName()` for page components.
- Name files using `kebab-case.tsx` (e.g., `page.tsx`, `app-sidebar.tsx`).

### File Organization
- Pages go in `app/<route>/page.tsx`.
- Shared components go in `components/` (top-level, not nested).
- UI primitives from Shadcn go in `components/ui/`.
- Utility functions go in `lib/`.
- Database schema goes in `prisma/schema.prisma`.
- Never create files outside these directories.

### Database
- Import Prisma client from `@/prisma/client` using the singleton pattern in `lib/prisma.ts`.
- Never instantiate `PrismaClient` directly outside of `lib/prisma.ts`.
- Run `npx prisma generate` after any schema change.
- Run `npx prisma migrate dev --name <description>` to create migrations.
- Never commit `dev.db` or `*.db` files.

### Validation
- Use Zod schemas from `lib/validation.ts` for all user input.
- Use `@hookform/resolvers` to connect Zod to React Hook Form.
- Validate on the client before submitting. Never trust client input on the server.

### Security
- Never expose API keys, tokens, or secrets in client-side code.
- Never store passwords or credentials in localStorage.
- Never log sensitive data.
- Never use `eval()`, `dangerouslySetInnerHTML`, or `innerHTML`.
- Sanitize all user inputs before processing.
- Use `NEXT_PUBLIC_` prefix only for variables intentionally exposed to the client.

### Git
- Never commit `.env`, `dev.db`, `node_modules/`, `.next/`, or `lib/generated/`.
- Write clear, concise commit messages.


## RULES — DO NOT

- Do NOT install new npm packages without being asked. If you think a package is needed, state why and wait for approval.
- Do NOT use `any` type. Use proper TypeScript types.
- Do NOT add comments to code unless explicitly asked.
- Do NOT create documentation files (README, CHANGELOG, etc.) unless asked.
- Do NOT modify `globals.css` theme variables unless asked.
- Do NOT modify `components.json` unless asked.
- Do NOT modify `tsconfig.json` unless asked.
- Do NOT modify `eslint.config.mjs` unless asked.
- Do NOT use `console.log` in production code. Use proper error handling.
- Do NOT use CSS modules, styled-components, or inline styles. Use Tailwind classes only.
- Do NOT hardcode values that should come from user input or configuration.
- Do NOT create files that are not part of the current task.
- Do NOT refactor code that is not related to the current task.
- Do NOT skip error handling. Every async operation needs error handling.
- Do NOT use `window`, `document`, or `localStorage` directly in Server Components.
- Do NOT create API routes (`app/api/`) unless the task specifically requires server-side logic.
- Do NOT implement features from the "Future Features" section of the PRD. MVP only.


## COMPONENT PATTERNS

### Page Component (Client)
```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ToolPage() {
  const [value, setValue] = useState("");

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Tool Name</h1>
      <p className="text-muted-foreground">Description.</p>
      {/* tool content */}
    </div>
  );
}
```

### Page Component (Server — placeholder)
```tsx
import { SomeIcon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function ToolPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Tool Name</h1>
      <p className="text-muted-foreground mb-8">Description.</p>
      <EmptyState
        icon={SomeIcon}
        title="Tool Name"
        description="What this tool does."
      />
    </div>
  );
}
```

### Form with React Hook Form + Zod
```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

type FormData = z.infer<typeof schema>;

export default function FormExample() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={form.handleSubmit((data) => { /* ... */ })}>
      {/* form fields */}
    </form>
  );
}
```


## LAYOUT STRUCTURE

```
app/
├── layout.tsx          ← Root layout: <html> + <body> + <AppSidebar> + <main>{children}</main>
├── page.tsx            ← Dashboard (/)
├── error.tsx           ← Global error boundary
├── website-scanner/    ← /website-scanner
├── port-scanner/       ← /port-scanner
├── file-hashing/       ← /file-hashing
├── password-generator/ ← /password-generator
├── security-toolkit/   ← /security-toolkit
├── scan-history/       ← /scan-history
└── settings/           ← /settings
```

The sidebar (`components/app-sidebar.tsx`) is always visible. Navigation is in `components/sidebar-nav.tsx`. Settings is separated at the bottom.


## SEVERITY LEVELS (for security tools)

When implementing security findings, use these levels:
- **Critical** — Immediate risk, must fix
- **High** — Significant risk, should fix soon
- **Medium** — Moderate risk, should fix
- **Low** — Minor risk, recommended to fix
- **Informational** — No risk, FYI only


## BEFORE SUBMITTING CHANGES

1. Run `npm run lint` — must pass with 0 errors.
2. Run `npm run build` — must pass without type errors.
3. Verify no new warnings.
4. Check that no sensitive data is exposed.
5. Verify the change matches the PRD requirements.
