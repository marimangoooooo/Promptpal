# PromptPal

PromptPal is a guided prompt-building workspace for AI coding projects. It helps a user start with a rough product idea, choose a target coding environment, mark the relevant stack, and answer a structured interview that turns into a production-ready build brief.

The app is designed for people with little to medium technical knowledge. The interview starts simple, gets more specific only when useful, and continuously refines a live draft in the background.

## What It Does

- Lets the user choose a target tool preset such as Cursor, Codex CLI, Windsurf, Aider, or Claude Code.
- Lets the user mark the project stack from categories like framework, backend, database, styling, auth, deploy, payments, API, and language.
- Uses a prompt-depth slider to control how broad or detailed the interview becomes.
- Runs an adaptive question flow that can range from roughly 15 to 30 questions.
- Updates a live prompt draft after every answer.
- Shows interview progress, section phases, and a final prompt preview with a full reading view.
- Exports the generated prompt as Markdown.

## Important Runtime Note

PromptPal is powered by **xAI Grok** through the xAI API.

The selectable tools in the UI are **target environments**, not the model provider. In other words:

- `xAI Grok` is the actual model/runtime used by this project.
- tool presets like `Cursor`, `Codex CLI`, or `Claude Code` are only used to shape the final prompt for the environment the user wants to paste it into.

This project does **not** use Anthropic Claude as its backend model.

## Product Flow

1. The user selects a target environment.
2. The user selects the relevant stack.
3. The user chooses a detail level from broad to exhaustive.
4. PromptPal starts a guided interview in the chat workspace.
5. xAI Grok updates hidden prompt state and session state on every turn.
6. The UI renders visible questions only, while the live draft keeps evolving in the background.
7. The user reviews or exports the final prompt.

## Main Features

- Beginner-first interview flow
- adaptive question depth
- live draft drawer
- full prompt reading modal
- dynamic progress tracker
- markdown prompt export
- polished desktop/mobile chat workspace

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui primitives
- AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`)
- xAI API via OpenAI-compatible transport
- React Markdown + GFM for prompt rendering

## Project Structure

```text
app/
  api/chat/route.ts        xAI Grok chat route and system instructions
  chat/page.tsx            main interview workspace
  components/
    ChatMessage.tsx        visible chat messages and final prompt preview card
    ProgressTracker.tsx    dynamic interview progress UI
    PromptPanel.tsx        live draft drawer and expanded prompt modal
    StackSelector.tsx      stack selection UI and supported stack presets
    ToolSelector.tsx       target tool presets
  globals.css              global theme, markdown styling, prompt viewer styling
  layout.tsx               root layout and metadata
  page.tsx                 setup/landing page
components/ui/             shared UI primitives
lib/                       utility helpers
```

## How The Interview Works

The `/api/chat` route sends a system prompt to xAI Grok that tells the model to:

- ask one visible question at a time
- keep draft generation inside hidden blocks
- research and reason after every user answer
- ask focused clarifications only when important details are missing
- treat the selected tool as a background constraint
- keep the final prompt tool-neutral by default unless a tool-specific reference is genuinely useful

Each assistant response includes:

- `PROMPT_STATE`: the latest working prompt
- `SESSION_STATE`: the current phase, question number, and planned question count

The frontend parses those hidden blocks to drive:

- the live draft
- the progress tracker
- the question counter
- the final prompt preview state

## Supported Target Tool Presets

- Cursor
- Antigravity
- Claude Code
- Codex CLI
- Windsurf
- GitHub Copilot
- Bolt.new
- Aider

Again: these are prompt targets, not backend model providers.

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

Create a `.env.local` file in the project root with:

```env
XAI_API_KEY=your_xai_api_key
GROK_MODEL=grok-4-1-fast-non-reasoning
```

`GROK_MODEL` is optional. If omitted, the app falls back to `grok-4-1-fast-non-reasoning`.

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

For local validation during development:

```bash
npm exec -- tsc --noEmit
npm exec -- eslint app components --ext .ts,.tsx
```

## UX Notes

- The chat only shows visible questions and user-facing summaries.
- Draft generation happens in the background.
- Large prompts can be reviewed in the live draft drawer or the full prompt modal.
- The final prompt can be exported as a Markdown file.

## Current Scope

This project is focused on prompt creation and interview orchestration. It does not currently include:

- user accounts
- persistent session storage
- analytics
- a database-backed project history

State is primarily handled in the browser plus streamed hidden prompt/session metadata from the model responses.

## Why This Project Exists

Many users know what they want to build but do not know how to describe it clearly enough for an AI coding agent. PromptPal fills that gap by turning incomplete ideas into implementation-ready prompts without forcing the user to understand every technical detail upfront.
