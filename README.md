# PromptPal

PromptPal is a research-first prompt studio for software projects. A user starts with an existing idea, PromptPal runs a deeper clarification pass, moves into UI direction, recommends a technical setup, and keeps a build-ready master prompt updated in the background.

It is designed for people who already know roughly what they want to build, but need help turning that into a strong implementation prompt and a sensible stack.

## What It Does

- requires a meaningful first brief before the interview begins
- runs a `20+` adaptive research pass and shows one question at a time
- supports review and editing of saved research answers
- separates research, UI, configuration, and final prompt stages
- keeps a live master prompt updated through the whole flow
- recommends stack and execution options from the researched product
- lets users override recommendations in configuration
- shows a final prompt preview directly on the prompt page
- opens the full prompt in a dedicated full-screen view
- exports the final prompt as Markdown

## Workspace Flow

1. The user opens the chat workspace and submits a substantial project brief.
2. PromptPal runs a research interview and prepares a large question batch behind the scenes.
3. Research questions are shown one at a time, while the prompt updates continuously.
4. After research is complete, the user moves into the UI stage to choose layout and design direction.
5. In configuration, PromptPal recommends build agents and stack options, while the user can still select their own choices.
6. The final prompt stage shows a prompt preview, full prompt view, and export actions.

## Current Product Behavior

### Research

- first message requires at least `60` words
- initial research batch is at least `20` questions
- questions use stable `topicId` metadata internally
- food and recipe briefs trigger extra leftover-first research and ranking guardrails
- saved research answers can be reviewed and edited later

### UI Stage

- recommended layout drafts are shown before implementation choices
- users can refine logo placement, action placement, navigation, and design preferences
- UI direction can be locked into the master prompt before moving on

### Configuration Stage

- PromptPal recommends the implementation setup after research and UI direction
- recommended options appear on the left with per-option hover explanations
- alternate options appear separately on the right
- users can select multiple configuration choices if they want to override the defaults
- the top summary reflects what the user has actually selected

### Prompt Stage

- the final page shows a direct prompt preview
- `Open full prompt` opens the complete document in a dedicated modal view
- the prompt can be exported without opening the live drawer

## Runtime Model Note

PromptPal currently uses **xAI Grok 4.20 non-reasoning** through the xAI API.

The selectable tools shown in configuration, such as `Codex CLI`, `Cursor`, or `Claude Code`, are target execution workflows. They are not the backend runtime model used by this app.

## Hidden State Contract

The `/api/chat` route returns visible chat text plus hidden metadata blocks that drive the workspace.

The frontend parses:

- `PROMPT_STATE`
- `RECOMMENDATION_STATE`
- `SESSION_STATE`

Those hidden blocks power:

- the live prompt draft
- research progress and question sequencing
- recommendation rendering
- UI/configuration unlocking
- final prompt readiness

## Freshness and Recommendation Rules

- PromptPal uses maintained latest-stable defaults for framework and model examples
- older defaults should not be emitted unless the user explicitly asks for them
- research does not ask the user to choose a database vendor or hosting vendor directly
- configuration recommendations are inferred from the researched product instead

## Tech Stack

- Next.js `16.1.6`
- React `19`
- TypeScript
- Tailwind CSS `4`
- shadcn/ui primitives
- AI SDK: `ai`, `@ai-sdk/react`, `@ai-sdk/openai`
- xAI API via OpenAI-compatible transport
- React Markdown + GFM for prompt rendering

## Project Structure

```text
app/
  api/chat/route.ts            chat route, system prompt, hidden-state contract
  chat/page.tsx                main multi-stage workspace
  components/
    ChatMessage.tsx            visible chat messages
    LayoutSelector.tsx         UI layout selection
    PromptModal.tsx            full prompt reading view
    PromptPanel.tsx            live prompt drawer
    ProgressTracker.tsx        progress UI
    RecommendationPanel.tsx    configuration recommendations and overrides
    ResearchPanel.tsx          compact research summary
    StackSelector.tsx          stack-related selection helpers
    ToolSelector.tsx           coding-agent selection helpers
    TopologyBackground.tsx     landing-page background
  globals.css                  global styles
  layout.tsx                   root layout
  page.tsx                     landing page
components/ui/                 shared UI primitives
lib/
  current-defaults.ts          maintained framework and model defaults
  prompt-catalog.ts            supported tool, stack, and layout presets
  prompt-state.ts              hidden-state types and parsing
  research-config.ts           quotas, budgets, and domain packs
  utils.ts                     shared helpers
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

`GROK_MODEL` is optional. If omitted, the app falls back to `grok-4.20-0309-non-reasoning`.

### 3. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

On restricted Windows PowerShell setups:

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

Windows fallback:

```bash
cmd /c npm exec -- tsc --noEmit
cmd /c npm run build
```

## Current Scope

PromptPal currently focuses on prompt creation and interview orchestration. It does not currently include:

- user accounts
- persistent server-side project storage
- analytics
- long-term project history

Most state is browser-side plus streamed hidden metadata from model responses.
