# PromptPal

PromptPal is a research-first prompt studio for software projects.

Instead of asking for a vague one-line idea and jumping straight into code, PromptPal turns a rough product brief into a stronger build-ready prompt through a staged workflow:

1. research the product
2. shape the UI direction
3. lock the implementation setup
4. export the final prompt

The app is built with Next.js, React, TypeScript, Tailwind CSS, and the Vercel AI SDK, and it currently runs on xAI's Grok models through an OpenAI-compatible endpoint.

## What PromptPal Does

- accepts a meaningful product brief from the user
- generates a full research batch up front, then presents questions one at a time
- keeps a live master prompt updated as the conversation evolves
- separates the workflow into Research, UI, Configuration, and Prompt stages
- recommends layouts, technical stack choices, and build paths from the research context
- lets users override recommendations without losing the reasoning behind them
- supports reviewing and editing saved research answers
- shows a live prompt view plus a larger full-prompt modal
- exports the final prompt as Markdown

## Product Flow

### 1. Landing page

The home page introduces PromptPal and rotates through sample project ideas to show how a rough brief can become a sharper implementation prompt.

### 2. Research workspace

The `/chat` route is the main workspace.

Users start by describing the product idea. PromptPal then:

- prepares a research batch
- asks questions one at a time
- tracks progress internally through hidden state
- determines when enough context exists to move into UI work

The research stage is intentionally separated from visual and technical implementation decisions.

### 3. UI stage

Once research is complete, PromptPal helps define:

- layout direction
- logo placement
- primary action placement
- navigation style
- design preferences

Those UI choices can then be locked into the evolving prompt.

### 4. Configuration stage

After the UI direction is set, PromptPal recommends implementation choices such as:

- execution agent
- stack additions
- database direction
- hosting direction

Users can accept or override those recommendations before committing them into the final prompt.

### 5. Final prompt stage

The prompt stage gives users:

- an inline preview
- a larger prompt modal
- a live side drawer
- direct Markdown export

## Architecture Overview

PromptPal uses a split between visible chat text and hidden structured metadata.

The `/api/chat` route returns assistant output that includes hidden state blocks. The frontend parses those blocks to drive the workspace.

### Hidden state blocks

- `PROMPT_STATE`
- `RECOMMENDATION_STATE`
- `SESSION_STATE`

These blocks power:

- prompt drafting
- question sequencing
- stage unlocking
- recommendation rendering
- prompt readiness and export state

## Runtime Model

PromptPal currently connects to xAI through the AI SDK:

- provider base URL: `https://api.x.ai/v1`
- required API key env var: `XAI_API_KEY`
- default model: `grok-4.20-0309-non-reasoning`
- optional model override env var: `GROK_MODEL`

The selectable agents shown in the Configuration stage, such as Codex CLI or other build tools, are output recommendations for the final prompt. They are not the backend model running the app itself.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui primitives
- Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`)
- React Markdown with `remark-gfm`
- Lucide React icons

## Project Structure

```text
app/
  page.tsx                 landing page
  layout.tsx               app shell and metadata
  globals.css              global styles
  chat/page.tsx            main multi-stage workspace
  api/chat/route.ts        model orchestration and hidden-state contract
  components/              chat, layout, prompt, and recommendation UI

components/ui/
  ...                      shared shadcn/ui primitives

lib/
  current-defaults.ts      maintained default framework/model guidance
  prompt-catalog.ts        tool, stack, and layout presets
  prompt-state.ts          hidden-state types and parsing
  research-config.ts       research quotas and domain packs
  utils.ts                 shared helpers

public/
  ...                      static assets
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

```env
XAI_API_KEY=your_xai_api_key
GROK_MODEL=grok-4.20-0309-non-reasoning
```

`GROK_MODEL` is optional. If omitted, PromptPal falls back to `grok-4.20-0309-non-reasoning`.

### 3. Start the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

If PowerShell policy or shell behavior gets in the way on Windows, this fallback also works:

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
npm run build
npm run lint
npm exec -- tsc --noEmit
```

Windows fallback examples:

```bash
cmd /c npm run build
cmd /c npm run lint
cmd /c npm exec -- tsc --noEmit
```

## Current Behavior Notes

- Research is batch-first: the backend prepares a full question batch, while the frontend reveals it one question at a time.
- PromptPal keeps the final prompt live throughout the workflow instead of generating it only at the end.
- Research avoids asking UI styling or vendor-picking questions too early; those are intentionally deferred to later stages.
- The app includes domain-aware research behavior for food and recipe-style products.

## Current Scope

This repository is focused on prompt-building workflow and agent orchestration. It does not currently include:

- user accounts
- persistent server-side project storage
- long-term project history
- analytics dashboards
- multi-user collaboration

Most state is kept in the client plus streamed hidden metadata from the chat route.

## Recommended Reading Order In The Codebase

If you are new to the project, start here:

1. `app/page.tsx` for the landing experience
2. `app/chat/page.tsx` for the main workspace
3. `app/api/chat/route.ts` for orchestration, prompt policy, and model calls
4. `lib/prompt-state.ts` for the hidden-state contract
5. `lib/prompt-catalog.ts` and `lib/research-config.ts` for presets and interview rules
