"use client";

import React, { useMemo } from "react";
import { CircleHelp, RotateCcw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RecommendationChip,
  RecommendationEntity,
  RecommendationState,
} from "@/lib/prompt-state";
import { STACK_PRESETS, TOOL_PRESETS, findStackPreset, findToolPreset } from "@/lib/prompt-catalog";
import { cn } from "@/lib/utils";

interface RecommendationPanelProps {
  recommendation: RecommendationState;
  manualAgent: RecommendationEntity | null;
  manualDatabase: RecommendationEntity | null;
  manualHosting: RecommendationEntity | null;
  manualStack: RecommendationChip[];
  selectedTools: string[];
  selectedStack: string[];
  onToolSelect: (toolId: string) => void;
  onStackToggle: (stackId: string) => void;
  onResetOverrides: () => void;
  projectSummary?: string;
  layoutLabel?: string | null;
  designSignals?: string[];
}

type RecommendationEntry = {
  id: string;
  label: string;
  reason: string;
};

type ControlRow = {
  category: string;
  options: Array<{ id: string; label: string }>;
  recommendedEntries: RecommendationEntry[];
};

const CATEGORY_ORDER = [
  "Framework",
  "Language",
  "Backend",
  "API",
  "Database",
  "Auth",
  "UI",
  "Payments",
  "Hosting",
  "DevOps",
];

const DEFAULT_CONTROL_CATEGORIES = [
  "Framework",
  "Language",
  "Backend",
  "Database",
  "Auth",
  "UI",
  "Hosting",
  "DevOps",
];

const AGENT_FALLBACKS: Record<string, string[]> = {
  codex: ["codex", "cursor", "claude-code"],
  cursor: ["cursor", "codex", "windsurf"],
  "claude-code": ["claude-code", "codex", "cursor"],
  windsurf: ["windsurf", "cursor", "codex"],
  aider: ["aider", "codex", "claude-code"],
  antigravity: ["antigravity", "codex", "cursor"],
  copilot: ["copilot", "cursor", "codex"],
  default: ["codex", "cursor", "claude-code"],
};

const STACK_FALLBACKS: Record<string, string[]> = {
  Framework: ["nextjs", "react", "astro"],
  Language: ["typescript", "python"],
  Backend: ["nodejs", "nestjs", "fastapi"],
  API: ["trpc", "rest", "graphql"],
  Database: ["postgres", "neon", "supabase"],
  Auth: ["clerk", "nextauth", "auth0"],
  UI: ["tailwind", "shadcn", "mantine"],
  Payments: ["stripe", "lemonsqueezy"],
  Hosting: ["vercel", "cloudflare", "railway"],
  DevOps: ["docker"],
};

const OPTION_REASON_OVERRIDES: Record<string, string> = {
  codex: "Strong if you want direct repo-level implementation in a terminal-first workflow.",
  cursor: "Best if you want long-running product work inside the editor with fast iteration.",
  antigravity: "Useful if the project still needs heavier research before implementation locks.",
  "claude-code": "Good if you want a CLI agent with a more structured implementation loop.",
  windsurf: "Useful if you prefer an IDE-first workflow with embedded chat and code actions.",
  copilot: "Best when the team mainly wants inline assistance inside the editor.",
  aider: "Useful for diff-oriented patching when you want a terminal workflow over a full IDE.",
  nextjs: "Strongest fit for a routed web app with dynamic screens and full-stack product flows.",
  react: "Good if you want more flexibility and less framework opinion around the app shell.",
  vue: "Useful if you prefer a lighter component model and a Vue-centered frontend stack.",
  sveltekit: "Good if you want a leaner reactive stack with full-app capabilities.",
  nuxt: "Useful if the product should stay in the Vue ecosystem with batteries included.",
  remix: "Good when nested routing and server-driven web fundamentals matter more than conventions.",
  astro: "Useful if the product becomes more content-led or lighter on app-like interactions.",
  typescript: "Best fit for typed product work across frontend, backend, and prompt-generated code.",
  python: "Useful if the stack shifts toward backend-heavy or AI-heavy implementation work.",
  nodejs: "Strong fit when the product stays JavaScript or TypeScript end to end.",
  express: "Useful if you want a minimal backend layer with fewer framework rules.",
  nestjs: "Good if you want more structure as the backend surface grows.",
  fastapi: "Useful if the backend becomes more API-centric or Python-heavy.",
  django: "Good if the project grows toward a more traditional backend with many built-ins.",
  postgres: "Strong default for relational data, clear querying, and predictable growth.",
  neon: "Good if you want managed Postgres with lighter operational overhead.",
  supabase: "Useful if you want database, auth, and storage bundled into one managed layer.",
  mongodb: "Useful when the data model is more document-shaped and less relational.",
  mysql: "Good if you prefer a classic relational setup outside the Postgres ecosystem.",
  firebase: "Useful if you want a more managed real-time style backend with less server setup.",
  redis: "Useful as a sidecar for caching, queues, or fast transient data.",
  tailwind: "Best for moving fast while keeping a custom UI consistent across screens.",
  shadcn: "Good if you want production-ready primitives without locking the design system.",
  daisyui: "Useful if you want faster UI assembly with more pre-styled component patterns.",
  radix: "Good if accessibility and low-level interaction primitives matter most.",
  mantine: "Useful if you want a larger ready-made component surface out of the box.",
  clerk: "Fastest path for polished auth flows without building the whole identity layer yourself.",
  nextauth: "Good if you want auth to stay close to the app stack with more control.",
  auth0: "Useful when auth needs might become more enterprise-heavy over time.",
  "supabase-auth": "Useful if the app already leans toward Supabase-managed infrastructure.",
  docker: "Useful when the project benefits from a repeatable local and deployment environment.",
  vercel: "Fastest path for modern web app deployment with a tight frontend loop.",
  aws: "Useful when the project needs broader infrastructure control and managed services.",
  gcp: "Good if the stack leans toward Google services or heavier cloud integration.",
  cloudflare: "Useful if edge delivery and low-latency global routing matter more.",
  railway: "Good if you want a simpler managed platform for app and backend services.",
  render: "Useful if you want straightforward managed hosting across web services and jobs.",
  stripe: "Best if billing becomes part of the product and you want the widest integration surface.",
  lemonsqueezy: "Useful if you want a lighter-weight billing path for a small SaaS footprint.",
  graphql: "Useful when the product may need more flexible data querying across clients.",
  trpc: "Best when frontend and backend live together and end-to-end typing matters.",
  rest: "Good if you want a simpler, more universal API contract.",
};

function ChoiceChip({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone: "default" | "recommended" | "selected";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
        tone === "selected"
          ? "border-slate-900 bg-slate-900 text-white shadow-[0_10px_22px_rgba(29,39,53,0.16)]"
          : tone === "recommended"
            ? "border-[#d07b49]/25 bg-[#fff7f1] text-slate-800 hover:border-[#d07b49]/40"
            : "border-slate-900/[0.08] bg-white text-slate-700 hover:border-slate-900/[0.16] hover:bg-slate-50"
      )}
    >
      {label}
    </button>
  );
}

function HintBubble({ text }: { text: string }) {
  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        aria-label="Why this is recommended"
        className="inline-flex size-5 items-center justify-center rounded-full border border-slate-900/10 bg-white text-slate-400 transition-colors hover:border-slate-900/20 hover:text-slate-700"
      >
        <CircleHelp className="size-3.5" />
      </button>
      <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-[280px] rounded-[0.9rem] bg-slate-900 px-3 py-2 text-xs leading-5 text-white shadow-[0_18px_40px_rgba(29,39,53,0.22)] group-hover:block group-focus-within:block">
        {text}
      </div>
    </div>
  );
}

function RecommendedEntryChip({
  label,
  reason,
  active,
  onClick,
}: {
  label: string;
  reason: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-1 py-1 text-xs font-semibold transition-all",
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-[0_10px_22px_rgba(29,39,53,0.16)]"
          : "border-slate-900/[0.08] bg-white text-slate-700"
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="rounded-full px-1.5 py-0.5 text-left"
      >
        {label}
      </button>
      <HintBubble text={reason} />
    </div>
  );
}

function uniqueIds(ids: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];

  ids.forEach((id) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    result.push(id);
  });

  return result;
}

function compactSummary(value: string) {
  const firstSentence = value
    .trim()
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)[0]
    ?.replace(/[.!?]+$/, "");

  if (!firstSentence) return "";
  if (firstSentence.length <= 140) return firstSentence;

  return `${firstSentence.slice(0, 137).trimEnd()}...`;
}

function compactSentence(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return "";
  const firstSentence = normalized.split(/(?<=[.!?])\s+/)[0] ?? normalized;
  return firstSentence.endsWith(".") ? firstSentence : `${firstSentence}.`;
}

function findRelevantNote(notes: string[], category: string) {
  const keywords: Record<string, string[]> = {
    "Build agent": ["implementation", "execution", "agent", "build"],
    Framework: ["framework", "app router", "frontend", "web"],
    Language: ["typescript", "python", "language"],
    Backend: ["backend", "server", "api"],
    API: ["api", "trpc", "graphql", "rest"],
    Database: ["database", "data", "storage", "persistence"],
    Auth: ["auth", "login", "account", "identity"],
    UI: ["ui", "design", "layout", "component"],
    Payments: ["billing", "payments", "checkout"],
    Hosting: ["hosting", "deployment", "vercel", "cloudflare"],
    DevOps: ["docker", "devops", "infra"],
  };

  const match = notes.find((note) =>
    (keywords[category] ?? []).some((keyword) => note.toLowerCase().includes(keyword))
  );

  return match ?? notes[0] ?? "";
}

function resolveToolId(entity: RecommendationEntity | null) {
  if (!entity) return null;
  if (entity.id && findToolPreset(entity.id)) return entity.id;

  const normalized = entity.label.trim().toLowerCase();
  return TOOL_PRESETS.find((tool) => tool.name.toLowerCase() === normalized)?.id ?? null;
}

function resolveStackPreset(
  entity: Pick<RecommendationEntity, "id" | "label"> | null,
  category?: string
) {
  if (!entity) return null;

  if (entity.id) {
    const byId = findStackPreset(entity.id);
    if (byId && (!category || byId.category === category)) return byId;
  }

  const normalized = entity.label.trim().toLowerCase();
  return (
    STACK_PRESETS.find(
      (item) =>
        item.name.toLowerCase() === normalized &&
        (!category || item.category === category)
    ) ?? null
  );
}

function buildEntryReason({
  category,
  id,
  projectSummary,
  layoutLabel,
  designSignals,
  note,
}: {
  category: string;
  id: string;
  projectSummary: string;
  layoutLabel: string | null;
  designSignals: string[];
  note?: string;
}) {
  const baseReason =
    OPTION_REASON_OVERRIDES[id] ??
    (category === "Database"
      ? "Fits the current data and persistence needs without adding unnecessary complexity."
      : category === "UI"
        ? "Fits the current interface direction and component needs."
        : category === "Hosting"
          ? "Fits the current deployment shape and operational needs."
          : "Fits the current project direction based on the researched requirements.");

  const projectLead = projectSummary ? `${compactSentence(projectSummary)} ` : "";
  const uiLead =
    (category === "UI" || category === "Framework") && layoutLabel
      ? `UI direction is leaning ${layoutLabel}. `
      : "";
  const designLead =
    category === "UI" && designSignals.length > 0
      ? `Design signals lean ${designSignals.slice(0, 2).join(" and ")}. `
      : "";
  const noteSentence = note ? compactSentence(note) : "";

  return `${projectLead}${uiLead}${designLead}${baseReason}${noteSentence ? ` ${noteSentence}` : ""}`
    .replace(/\s+/g, " ")
    .trim();
}

export default function RecommendationPanel({
  recommendation,
  manualAgent,
  manualDatabase,
  manualHosting,
  manualStack,
  selectedTools,
  selectedStack,
  onToolSelect,
  onStackToggle,
  onResetOverrides,
  projectSummary = "",
  layoutLabel = null,
  designSignals = [],
}: RecommendationPanelProps) {
  const recommendedAgent = recommendation.agent;
  const recommendedDatabase = recommendation.database;
  const recommendedHosting = recommendation.hosting;
  const recommendedStack = recommendation.stack;
  const recommendedNotes = recommendation.notes;

  const visibleStack = useMemo(() => {
    return recommendedStack.filter((item) => {
      if (item.category === "Database" && item.label === recommendedDatabase?.label) {
        return false;
      }

      if (item.category === "Hosting" && item.label === recommendedHosting?.label) {
        return false;
      }

      return true;
    });
  }, [recommendedDatabase?.label, recommendedHosting?.label, recommendedStack]);

  const groupedRecommendedStack = useMemo(() => {
    return visibleStack.reduce<Record<string, RecommendationChip[]>>((groups, item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }

      groups[item.category].push(item);
      return groups;
    }, {});
  }, [visibleStack]);

  const normalizedProjectSummary = useMemo(() => compactSummary(projectSummary), [projectSummary]);

  const controlCategories = useMemo(() => {
    const categorySet = new Set<string>();

    DEFAULT_CONTROL_CATEGORIES.forEach((category) => categorySet.add(category));
    visibleStack.forEach((item) => categorySet.add(item.category));
    if (recommendedDatabase) categorySet.add("Database");
    if (recommendedHosting) categorySet.add("Hosting");
    selectedStack.forEach((stackId) => {
      const match = findStackPreset(stackId);
      if (match) categorySet.add(match.category);
    });

    return [...categorySet].sort((left, right) => {
      const leftIndex = CATEGORY_ORDER.indexOf(left);
      const rightIndex = CATEGORY_ORDER.indexOf(right);

      if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right);
      if (leftIndex === -1) return 1;
      if (rightIndex === -1) return -1;
      return leftIndex - rightIndex;
    });
  }, [recommendedDatabase, recommendedHosting, visibleStack]);

  const recommendedToolId = useMemo(() => resolveToolId(recommendedAgent), [recommendedAgent]);

  const agentOptions = useMemo(() => {
    const leadingIds = uniqueIds([
      ...selectedTools,
      recommendedToolId,
      ...(AGENT_FALLBACKS[recommendedToolId ?? "default"] ?? AGENT_FALLBACKS.default),
    ]);

    return uniqueIds([...leadingIds, ...TOOL_PRESETS.map((tool) => tool.id)])
      .map((toolId) => findToolPreset(toolId))
      .filter((tool): tool is NonNullable<ReturnType<typeof findToolPreset>> => Boolean(tool));
  }, [recommendedToolId, selectedTools]);

  const agentRecommendedEntries = useMemo<RecommendationEntry[]>(() => {
    const ids = uniqueIds([
      recommendedToolId,
      ...(AGENT_FALLBACKS[recommendedToolId ?? "default"] ?? AGENT_FALLBACKS.default),
    ]).slice(0, 3);

    return ids
      .map((toolId, index) => {
        const tool = findToolPreset(toolId);
        if (!tool) return null;

        return {
          id: tool.id,
          label: tool.name,
          reason: buildEntryReason({
            category: "Build agent",
            id: tool.id,
            projectSummary: normalizedProjectSummary,
            layoutLabel,
            designSignals,
            note: index === 0 ? findRelevantNote(recommendedNotes, "Build agent") : "",
          }),
        };
      })
      .filter((item): item is RecommendationEntry => Boolean(item));
  }, [designSignals, layoutLabel, normalizedProjectSummary, recommendedNotes, recommendedToolId]);

  const controlRows = useMemo<ControlRow[]>(() => {
    return controlCategories
      .map((category) => {
        const directRecommendedPresets = uniqueIds([
          ...(category === "Database"
            ? [resolveStackPreset(recommendedDatabase, "Database")?.id]
            : []),
          ...(category === "Hosting"
            ? [resolveStackPreset(recommendedHosting, "Hosting")?.id]
            : []),
          ...((groupedRecommendedStack[category] ?? []).map((item) => resolveStackPreset(item, category)?.id)),
        ])
          .map((stackId) => findStackPreset(stackId))
          .filter(
            (item): item is NonNullable<ReturnType<typeof findStackPreset>> => Boolean(item)
          );

        const note = findRelevantNote(recommendedNotes, category);
        const recommendedEntries = uniqueIds([
          ...directRecommendedPresets.map((item) => item.id),
          ...(STACK_FALLBACKS[category] ?? []),
        ])
          .slice(0, 3)
          .map((stackId, index) => {
            const preset = findStackPreset(stackId);
            if (!preset) return null;

            return {
              id: preset.id,
              label: preset.name,
              reason: buildEntryReason({
                category,
                id: preset.id,
                projectSummary: normalizedProjectSummary,
                layoutLabel,
                designSignals,
                note: index === 0 ? note : "",
              }),
            };
          })
          .filter((item): item is RecommendationEntry => Boolean(item));

        const options = uniqueIds([
          ...selectedStack.filter((stackId) => findStackPreset(stackId)?.category === category),
          ...directRecommendedPresets.map((item) => item.id),
          ...STACK_PRESETS.filter((item) => item.category === category).map((item) => item.id),
        ])
          .map((stackId) => findStackPreset(stackId))
          .filter(
            (item): item is NonNullable<ReturnType<typeof findStackPreset>> =>
              Boolean(item && item.category === category)
          )
          .map((item) => ({ id: item.id, label: item.name }));

        return {
          category,
          options,
          recommendedEntries,
        };
      })
      .filter((row) => row.options.length > 0);
  }, [
    controlCategories,
    designSignals,
    groupedRecommendedStack,
    layoutLabel,
    normalizedProjectSummary,
    recommendedDatabase,
    recommendedHosting,
    recommendedNotes,
    selectedStack,
  ]);

  const hasRecommendation =
    Boolean(recommendedAgent || recommendedDatabase || recommendedHosting) ||
    visibleStack.length > 0 ||
    recommendedNotes.length > 0;
  const selectedSummaryRows = useMemo(() => {
    const rows: Array<{ label: string; values: string[] }> = [];

    if (selectedTools.length > 0) {
      rows.push({
        label: "Build agent",
        values: selectedTools
          .map((toolId) => findToolPreset(toolId)?.name ?? toolId)
          .filter(Boolean),
      });
    }

    CATEGORY_ORDER.forEach((category) => {
      const values = selectedStack
        .map((stackId) => findStackPreset(stackId))
        .filter((item): item is NonNullable<ReturnType<typeof findStackPreset>> => Boolean(item))
        .filter((item) => item.category === category)
        .map((item) => item.name);

      if (values.length > 0) {
        rows.push({ label: category, values });
      }
    });

    return rows;
  }, [selectedStack, selectedTools]);
  const hasManualOverrides =
    selectedTools.length > 0 ||
    selectedStack.length > 0 ||
    Boolean(manualAgent || manualDatabase || manualHosting || manualStack.length);

  return (
    <div className="rounded-[1.05rem] border border-slate-900/[0.08] bg-white p-3.5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge
            variant="secondary"
            className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-slate-600"
          >
            <Sparkles className="mr-1.5 size-3.5" />
            Recommendations
          </Badge>
          <h2 className="mt-2 text-[0.96rem] font-semibold tracking-tight text-slate-900">
            Best fit after research and UI direction
          </h2>
        </div>

        {hasManualOverrides && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full border-slate-900/10 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onResetOverrides}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        )}
      </div>

      {!hasRecommendation ? (
        <div className="mt-3 rounded-[0.95rem] border border-dashed border-slate-900/[0.12] bg-[#fbf7f1] px-3.5 py-3">
          <p className="text-sm font-semibold tracking-tight text-slate-900">
            Recommendations appear once PromptPal has enough signal.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-3 rounded-[0.95rem] border border-slate-900/[0.08] bg-[#fbf7f1] p-3">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Selected setup
            </p>
            {selectedSummaryRows.length > 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {selectedSummaryRows.map((row) => (
                  <div
                    key={row.label}
                    className="inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-900/[0.08] bg-white px-2.5 py-1.5 text-[0.72rem] text-slate-700"
                  >
                    <span className="font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {row.label}
                    </span>
                    {row.values.map((value) => (
                      <span key={`${row.label}-${value}`} className="font-medium text-slate-900">
                        {value}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm leading-5 text-slate-600">
                No manual selections yet. Use the recommended or alternate options below.
              </p>
            )}
          </div>

          <div className="mt-3 rounded-[0.95rem] border border-slate-900/[0.08] bg-[#fbf7f1] p-3">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Recommendation controls
            </p>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Grok&apos;s picks stay on the left. Your overrides stay on the right.
            </p>

            <div className="mt-3 space-y-3">
              <div className="border-t border-slate-900/[0.08] pt-3 first:border-t-0 first:pt-0">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold tracking-tight text-slate-900">
                        Build agent
                      </p>
                      <span className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Recommended
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {agentRecommendedEntries.length > 0 ? (
                        agentRecommendedEntries.map((entry) => (
                          <RecommendedEntryChip
                            key={entry.id}
                            label={entry.label}
                            reason={entry.reason}
                            active={selectedTools.includes(entry.id)}
                            onClick={() => onToolSelect(entry.id)}
                          />
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">Still deriving.</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:max-w-[52%] lg:justify-end">
                    {agentOptions
                      .filter((tool) => !agentRecommendedEntries.some((entry) => entry.id === tool.id))
                      .map((tool) => (
                      <ChoiceChip
                        key={tool.id}
                        label={tool.name}
                        tone={
                          selectedTools.includes(tool.id)
                            ? "selected"
                            : "default"
                        }
                        onClick={() => onToolSelect(tool.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {controlRows.map((row) => (
                <div
                  key={row.category}
                  className="border-t border-slate-900/[0.08] pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold tracking-tight text-slate-900">
                          {row.category}
                        </p>
                        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Recommended
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {row.recommendedEntries.length > 0 ? (
                          row.recommendedEntries.map((entry) => (
                            <RecommendedEntryChip
                              key={entry.id}
                              label={entry.label}
                              reason={entry.reason}
                              active={selectedStack.includes(entry.id)}
                              onClick={() => onStackToggle(entry.id)}
                            />
                          ))
                        ) : (
                          <p className="text-xs text-slate-500">Still deriving.</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:max-w-[52%] lg:justify-end">
                      {row.options
                        .filter((option) => !row.recommendedEntries.some((entry) => entry.id === option.id))
                        .map((option) => (
                        <ChoiceChip
                          key={option.id}
                          label={option.label}
                          tone={
                            selectedStack.includes(option.id)
                              ? "selected"
                              : "default"
                          }
                          onClick={() => onStackToggle(option.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
