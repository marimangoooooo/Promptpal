# PromptPal

PromptPal is a prompt-refinement studio for AI coding projects built around existing, thought-through ideas.

The user starts with an existing product brief or messy base prompt. PromptPal then suggests the best coding agent, stack, and database, asks focused clarifying questions, and keeps a live build prompt updated in the background.

The product is designed for people with little to medium technical knowledge. Users do not need to decide their own stack before the brief is understood, but they should already know what they want to build. PromptPal is not meant for open-ended idea exploration.

## What The Product Does

- Starts from the user's existing product brief instead of a setup form
- Requires a substantial first brief with a `120`-word minimum before chat begins
- Lets the user choose prompt depth from broad cleanup to exhaustive refinement
- Suggests a coding agent, primary database, and supporting stack
- Asks one clarifying question at a time
- Updates a live prompt draft after every answer
- Shows a prominent recommended setup panel in chat
- Supports manual setup overrides after AI recommendations appear
- Exports the final prompt as Markdown

## Current UX

### Homepage

- Left side: brand, positioning, and quick feature summary
- Full-page animated topology background with static fallback styling
- Right side: prompt-depth control, process preview, and primary `Get started` CTA
- The example process shows:
  - share the brief
  - get AI setup suggestions
  - refine the live prompt

### Chat Workspace

- Left sidebar:
  - prompt depth
  - highlighted recommended setup panel
  - progress tracker
  - export button
- Main area:
  - live draft summary bar
  - brief intake card before the first message
  - first message requires at least `120` words
  - one-question-at-a-time chat flow
  - bottom composer fixed flush to the workspace
- Optional right drawer:
  - full live draft viewer

## Product Flow

1. The user chooses a prompt depth on the homepage.
2. The user opens chat and shares a thought-through project brief or base prompt with at least `120` words.
3. xAI Grok researches the idea and infers a recommended coding agent, database, and stack.
4. PromptPal asks a focused follow-up question.
5. The live prompt, recommendation state, and session state update on every turn.
6. The user can manually override the suggested setup if needed.
7. The final prompt can be reviewed, copied, or exported.

## Runtime Model Note

PromptPal is powered by **xAI Grok** through the xAI API.

The selectable or suggested tools in the UI are **target execution workflows**, not the backend model provider.

- `xAI Grok` is the runtime used by this app.
- labels like `Cursor`, `Codex CLI`, or `Claude Code` describe the recommended environment for executing the final prompt.

This project does **not** use Anthropic Claude as its backend model.

## How The Chat Contract Works

The `/api/chat` route instructs xAI Grok to:

- treat the user's first message as the base brief
- stay in refinement mode for an existing idea instead of exploring what to build
- ask one visible question at a time
- infer the best setup for the project
- keep prompt generation and setup reasoning inside hidden blocks
- respect manual overrides as hard constraints

Each assistant response includes:

- `PROMPT_STATE`
- `RECOMMENDATION_STATE`
- `SESSION_STATE`

The frontend parses those hidden blocks to drive:

- the live prompt draft
- the recommended setup panel
- the question counter and progress tracker
- the final prompt readiness state

## Main Features

- brief-first interview flow
- `120`-word minimum intake gate on the first message
- prompt-depth slider
- animated topology landing background with reduced-motion/data-saving fallback
- highlighted recommendation panel
- live draft drawer
- full prompt modal
- adaptive progress tracker
- markdown prompt export
- desktop/mobile responsive chat workspace

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Vanta Topology + p5.js for the landing-page background, loaded on demand
- shadcn/ui primitives
- AI SDK: `ai`, `@ai-sdk/react`, `@ai-sdk/openai`
- xAI API via OpenAI-compatible transport
- React Markdown + GFM for prompt rendering

## Project Structure

```text
app/
  api/chat/route.ts            xAI Grok route and system instructions
  chat/page.tsx                main brief-first interview workspace
  components/
    ChatMessage.tsx            visible chat messages and final prompt preview card
    ProgressTracker.tsx        question/progress UI
    PromptPanel.tsx            live draft drawer content
    PromptModal.tsx            expanded prompt reading view
    RecommendationPanel.tsx    highlighted setup recommendations and overrides
    StackSelector.tsx          stack override UI and preset catalog
    TopologyBackground.tsx     landing-page Vanta topology background with cleanup
    ToolSelector.tsx           coding-agent override UI and preset catalog
  globals.css                  global theme and shared styling
  layout.tsx                   root layout and metadata
  page.tsx                     landing page with topology background and process preview
components/ui/                 shared UI primitives
lib/
  prompt-state.ts              hidden block parsing and recommendation/session types
  utils.ts                     shared utility helpers
```

## Supported Coding-Agent Presets

- Cursor
- Antigravity
- Claude Code
- Codex CLI
- Windsurf
- GitHub Copilot
- Aider

These are suggestion targets, not model providers.

## Supported Stack Categories

- Framework
- Backend
- Database
- Styling
- Auth
- DevOps
- Deploy
- Payments
- Language
- API

Examples include Next.js, React, Vue, Node.js, Supabase, PostgreSQL, Tailwind CSS, shadcn/ui, Clerk, Docker, Vercel, Stripe, TypeScript, GraphQL, and tRPC.

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment variables

Create `.env.local` in the project root:

```env
XAI_API_KEY=your_xai_api_key
GROK_MODEL=grok-4-1-fast-non-reasoning
```

`GROK_MODEL` is optional. If omitted, the app falls back to `grok-4-1-fast-non-reasoning`.

### 3. Start the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

If PowerShell blocks `npm.ps1` on Windows, run:

```bash
cmd /c npm run dev
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Useful validation commands:

```bash
npm exec -- tsc --noEmit
npm exec -- eslint app components lib --ext .ts,.tsx
```

On restricted Windows PowerShell setups:

```bash
cmd /c npm run lint
cmd /c npm exec -- tsc --noEmit
```

## UX Notes

- The chat starts with an intake card, not a forced setup form.
- The first intake message is blocked until it reaches `120` words.
- Recommendations become visually prominent as soon as the model has enough signal.
- Draft generation happens in the background on every turn.
- The homepage animation is decorative only, pointer-pass-through, and falls back gracefully when disabled.
- Large prompts can be reviewed in the live draft drawer or full prompt modal.
- Manual overrides are available from the recommendation panel, not from the landing page.

## Current Scope

This project currently focuses on prompt creation and interview orchestration. It does not include:

- user accounts
- persistent session storage
- analytics
- database-backed project history

State is primarily browser-side plus streamed hidden prompt/recommendation/session metadata from model responses.

## Why This Project Exists

Many users know what they want to build but do not know how to describe it clearly enough for an AI coding agent. PromptPal fills that gap by starting from an existing brief, inferring the likely build setup, and turning incomplete descriptions into implementation-ready prompts.
