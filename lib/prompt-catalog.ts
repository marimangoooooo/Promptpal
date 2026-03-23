export type RecommendationSource = "preset" | "custom";

export interface ToolPreset {
  id: string;
  name: string;
  description: string;
  label: string;
}

export interface StackPreset {
  id: string;
  name: string;
  category: string;
}

export interface LayoutPreset {
  id: string;
  name: string;
  summary: string;
  structure: string;
  bestFor: string;
  highlights: string[];
}

export const TOOL_PRESETS: ToolPreset[] = [
  {
    id: "codex",
    name: "Codex CLI",
    description: "Strong default execution agent for production-minded implementation work",
    label: "CLI",
  },
  {
    id: "cursor",
    name: "Cursor",
    description: "Agentic editor for long-running product builds",
    label: "Editor",
  },
  {
    id: "antigravity",
    name: "Antigravity",
    description: "Research-heavy workflow for ambitious product planning",
    label: "Research",
  },
  {
    id: "claude-code",
    name: "Claude Code",
    description: "CLI agent for structured implementation work",
    label: "Terminal",
  },
  {
    id: "windsurf",
    name: "Windsurf",
    description: "Fast IDE workflow with embedded chat",
    label: "IDE",
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    description: "Inline assistant for teams that stay inside the editor",
    label: "Pairing",
  },
  {
    id: "aider",
    name: "Aider",
    description: "Diff-oriented terminal collaboration for existing repos",
    label: "Diffs",
  },
];

export const STACK_PRESETS: StackPreset[] = [
  { id: "nextjs", name: "Next.js", category: "Framework" },
  { id: "react", name: "React", category: "Framework" },
  { id: "vue", name: "Vue.js", category: "Framework" },
  { id: "sveltekit", name: "SvelteKit", category: "Framework" },
  { id: "nuxt", name: "Nuxt", category: "Framework" },
  { id: "remix", name: "Remix", category: "Framework" },
  { id: "astro", name: "Astro", category: "Framework" },
  { id: "nodejs", name: "Node.js", category: "Backend" },
  { id: "express", name: "Express", category: "Backend" },
  { id: "nestjs", name: "NestJS", category: "Backend" },
  { id: "fastapi", name: "FastAPI", category: "Backend" },
  { id: "django", name: "Django", category: "Backend" },
  { id: "supabase", name: "Supabase", category: "Database" },
  { id: "postgres", name: "PostgreSQL", category: "Database" },
  { id: "neon", name: "Neon", category: "Database" },
  { id: "mongodb", name: "MongoDB", category: "Database" },
  { id: "mysql", name: "MySQL", category: "Database" },
  { id: "firebase", name: "Firebase", category: "Database" },
  { id: "redis", name: "Redis", category: "Database" },
  { id: "tailwind", name: "Tailwind CSS", category: "UI" },
  { id: "shadcn", name: "shadcn/ui", category: "UI" },
  { id: "daisyui", name: "daisyUI", category: "UI" },
  { id: "radix", name: "Radix UI", category: "UI" },
  { id: "mantine", name: "Mantine", category: "UI" },
  { id: "clerk", name: "Clerk", category: "Auth" },
  { id: "nextauth", name: "NextAuth", category: "Auth" },
  { id: "auth0", name: "Auth0", category: "Auth" },
  { id: "supabase-auth", name: "Supabase Auth", category: "Auth" },
  { id: "docker", name: "Docker", category: "DevOps" },
  { id: "vercel", name: "Vercel", category: "Hosting" },
  { id: "aws", name: "AWS", category: "Hosting" },
  { id: "gcp", name: "Google Cloud", category: "Hosting" },
  { id: "cloudflare", name: "Cloudflare", category: "Hosting" },
  { id: "railway", name: "Railway", category: "Hosting" },
  { id: "render", name: "Render", category: "Hosting" },
  { id: "stripe", name: "Stripe", category: "Payments" },
  { id: "lemonsqueezy", name: "Lemon Squeezy", category: "Payments" },
  { id: "typescript", name: "TypeScript", category: "Language" },
  { id: "python", name: "Python", category: "Language" },
  { id: "graphql", name: "GraphQL", category: "API" },
  { id: "trpc", name: "tRPC", category: "API" },
  { id: "rest", name: "REST", category: "API" },
];

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "saas-command-center",
    name: "SaaS Command Center",
    summary: "Dense dashboard layout with metrics, recent activity, and clear operational rails.",
    structure: "Sticky side navigation, KPI hero, activity feed, and settings drawers.",
    bestFor: "B2B SaaS, internal tools, and admin-heavy products.",
    highlights: ["high information density", "admin-first", "clear operational hierarchy"],
  },
  {
    id: "conversion-funnel",
    name: "Conversion Funnel",
    summary: "High-conviction marketing-to-signup layout built to explain value and push action.",
    structure: "Narrative landing flow, proof blocks, feature panels, CTA rails, and pricing.",
    bestFor: "Startups, waitlists, lead-gen products, and SaaS launches.",
    highlights: ["clear story arc", "trust and proof sections", "strong CTA rhythm"],
  },
  {
    id: "premium-marketplace",
    name: "Premium Marketplace",
    summary: "Editorial browse experience with strong card systems and trust-heavy listing detail pages.",
    structure: "Discovery grid, rich filters, seller or product profile pages, and checkout rails.",
    bestFor: "Marketplaces, directories, and catalog-heavy commerce products.",
    highlights: ["browse-first", "filters and trust signals", "editorial card design"],
  },
  {
    id: "service-booking",
    name: "Service Booking",
    summary: "Offer-led layout that balances discovery, scheduling, and credibility for service businesses.",
    structure: "Hero offer, booking flow, availability modules, reviews, and account management.",
    bestFor: "Agencies, coaching, booking, and local service products.",
    highlights: ["scheduling-friendly", "service proof", "simple user journey"],
  },
  {
    id: "community-editorial",
    name: "Community Editorial",
    summary: "Content-forward layout with discussion rails, featured posts, and layered navigation.",
    structure: "Magazine hero, feed sections, community highlights, and profile hubs.",
    bestFor: "Communities, media products, creator hubs, and knowledge platforms.",
    highlights: ["content-first", "high readability", "strong browsing loops"],
  },
  {
    id: "operator-workspace",
    name: "Operator Workspace",
    summary: "Split-pane productivity layout for multi-step workflows and tool-heavy products.",
    structure: "Workspace header, pane layout, task list, detail view, and automation panels.",
    bestFor: "Productivity tools, project software, and workflow automation apps.",
    highlights: ["task-oriented", "split views", "automation-friendly"],
  },
];

export function findToolPreset(toolId: string) {
  return TOOL_PRESETS.find((tool) => tool.id === toolId);
}

export function findStackPreset(stackId: string) {
  return STACK_PRESETS.find((stack) => stack.id === stackId);
}

export function findLayoutPreset(layoutId: string) {
  return LAYOUT_PRESETS.find((layout) => layout.id === layoutId);
}
