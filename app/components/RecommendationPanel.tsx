"use client";

import React, { useMemo, useState } from "react";
import { Layers3, RotateCcw, Settings2, Sparkles, Wand2 } from "lucide-react";
import StackSelector from "./StackSelector";
import ToolSelector, { TOOLS } from "./ToolSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RecommendationChip,
  RecommendationEntity,
  RecommendationState,
} from "@/lib/prompt-state";

interface RecommendationPanelProps {
  recommendation: RecommendationState;
  manualAgent: RecommendationEntity | null;
  manualDatabase: RecommendationEntity | null;
  manualStack: RecommendationChip[];
  selectedTool: string | null;
  selectedStack: string[];
  onToolSelect: (toolId: string) => void;
  onStackToggle: (stackId: string) => void;
  onResetOverrides: () => void;
}

function SourceBadge({ source }: { source: "preset" | "custom" | "manual" }) {
  const styles =
    source === "manual"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : source === "custom"
        ? "border-sky-200 bg-sky-50 text-sky-800"
        : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] ${styles}`}
    >
      {source}
    </span>
  );
}

function RecommendationCard({
  title,
  value,
  source,
}: {
  title: string;
  value: string;
  source: "preset" | "custom" | "manual";
}) {
  const cardStyles =
    source === "manual"
      ? "border-amber-300/40 bg-[linear-gradient(180deg,rgba(255,251,244,0.98),rgba(255,243,224,0.92))] shadow-[0_12px_26px_rgba(217,119,6,0.12)]"
      : source === "custom"
        ? "border-sky-300/40 bg-[linear-gradient(180deg,rgba(248,252,255,0.98),rgba(235,246,255,0.92))] shadow-[0_12px_26px_rgba(14,165,233,0.1)]"
        : "border-emerald-300/35 bg-[linear-gradient(180deg,rgba(250,255,252,0.98),rgba(236,250,244,0.92))] shadow-[0_12px_26px_rgba(16,185,129,0.1)]";

  return (
    <div className={`relative overflow-hidden rounded-[1.2rem] border p-3.5 ${cardStyles}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(208,123,73,0.9),rgba(24,79,73,0.4),transparent)]" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {title}
          </p>
          <p className="mt-1.5 text-[1rem] font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <SourceBadge source={source} />
      </div>
    </div>
  );
}

export default function RecommendationPanel({
  recommendation,
  manualAgent,
  manualDatabase,
  manualStack,
  selectedTool,
  selectedStack,
  onToolSelect,
  onStackToggle,
  onResetOverrides,
}: RecommendationPanelProps) {
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);

  const effectiveAgent = manualAgent ?? recommendation.agent;
  const effectiveDatabase = manualDatabase ?? recommendation.database;
  const effectiveStack = manualStack.length > 0 ? manualStack : recommendation.stack;
  const effectiveNotes = recommendation.notes;

  const visibleStack = useMemo(() => {
    return effectiveStack.filter((item) => {
      if (item.category !== "Database") {
        return true;
      }

      return item.label !== effectiveDatabase?.label;
    });
  }, [effectiveDatabase?.label, effectiveStack]);

  const groupedStack = useMemo(() => {
    return visibleStack.reduce<Record<string, RecommendationChip[]>>((groups, item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }

      groups[item.category].push(item);
      return groups;
    }, {});
  }, [visibleStack]);

  const hasRecommendation =
    Boolean(recommendation.agent || recommendation.database) ||
    recommendation.stack.length > 0 ||
    recommendation.notes.length > 0;
  const hasManualOverrides = Boolean(manualAgent) || manualStack.length > 0;
  const effectiveStackCount = visibleStack.length;

  return (
    <div className="relative overflow-hidden rounded-[1.6rem] border border-[#d07b49]/30 bg-[radial-gradient(circle_at_top_right,rgba(208,123,73,0.24),transparent_34%),radial-gradient(circle_at_top_left,rgba(24,79,73,0.16),transparent_28%),linear-gradient(180deg,rgba(255,252,247,0.99),rgba(248,236,222,0.96))] p-4 shadow-[0_30px_68px_rgba(208,123,73,0.18)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#d07b49,rgba(24,79,73,0.55),transparent)]" />
      <div className="pointer-events-none absolute -right-12 top-2 size-32 rounded-full bg-[#d07b49]/18 blur-3xl" />
      <div className="pointer-events-none absolute left-2 top-8 size-28 rounded-full bg-[#184f49]/10 blur-3xl" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-[1rem] border border-[#d07b49]/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,242,231,0.95))] text-[#d07b49] shadow-[0_10px_24px_rgba(208,123,73,0.16)]">
            <Sparkles className="size-5" />
          </div>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d07b49]/22 bg-white/88 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
              <Sparkles className="size-3.5 text-[#d07b49]" />
              Recommended setup
            </span>
            <h3 className="mt-3 text-[1.18rem] font-semibold tracking-tight text-slate-900">
              AI-suggested build path
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              This is the strongest current setup PromptPal would use for your
              project right now. It updates live as the brief gets sharper.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-9 shrink-0 rounded-full border-[#d07b49]/18 bg-white/92 px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white"
          disabled={!hasRecommendation}
          onClick={() => setIsOverrideOpen((value) => !value)}
        >
          <Settings2 className="size-3.5" />
          {isOverrideOpen ? "Hide adjust" : "Adjust setup"}
        </Button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-[1rem] border border-white/70 bg-white/76 px-3 py-3 shadow-sm">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Current agent
          </p>
          <p className="mt-1.5 text-sm font-semibold text-slate-900">
            {effectiveAgent?.label ?? "Waiting"}
          </p>
        </div>
        <div className="rounded-[1rem] border border-white/70 bg-white/76 px-3 py-3 shadow-sm">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Database
          </p>
          <p className="mt-1.5 text-sm font-semibold text-slate-900">
            {effectiveDatabase?.label ?? "Optional"}
          </p>
        </div>
        <div className="rounded-[1rem] border border-white/70 bg-white/76 px-3 py-3 shadow-sm">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Stack signals
          </p>
          <p className="mt-1.5 text-sm font-semibold text-slate-900">
            {effectiveStackCount > 0 ? `${effectiveStackCount} live picks` : "Building"}
          </p>
        </div>
      </div>

      {!hasRecommendation ? (
        <div className="mt-4 rounded-[1.25rem] border border-dashed border-[#d07b49]/24 bg-white/78 p-4">
          <div className="grid gap-3">
            <div className="rounded-[1rem] border border-[#d07b49]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(251,247,241,0.86))] p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Sparkles className="size-4 text-[#d07b49]" />
                Waiting for your project idea
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                After your first message, PromptPal will recommend a coding
                agent, database, and implementation stack while the live prompt
                updates in parallel.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1rem] border border-slate-900/[0.08] bg-white/82 p-3">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Agent
                </p>
                <div className="mt-3 h-6 w-28 rounded-full bg-slate-100 animate-pulse" />
              </div>
              <div className="rounded-[1rem] border border-slate-900/[0.08] bg-white/82 p-3">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Database
                </p>
                <div className="mt-3 h-6 w-24 rounded-full bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {effectiveAgent ? (
              <RecommendationCard
                title="Coding agent"
                value={effectiveAgent.label}
                source={manualAgent ? "manual" : effectiveAgent.source}
              />
            ) : (
              <div className="rounded-[1.15rem] border border-dashed border-slate-900/[0.12] bg-[#fbf7f1] p-3">
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Coding agent
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  The model is still deciding the best workflow.
                </p>
              </div>
            )}

            {effectiveDatabase ? (
              <RecommendationCard
                title="Database"
                value={effectiveDatabase.label}
                source={manualDatabase ? "manual" : effectiveDatabase.source}
              />
            ) : (
              <div className="rounded-[1.15rem] border border-dashed border-slate-900/[0.12] bg-[#fbf7f1] p-3">
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Database
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Added when storage becomes relevant for the project.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-[1.2rem] border border-[#d07b49]/16 bg-[linear-gradient(180deg,rgba(255,246,237,0.92),rgba(255,255,255,0.88))] p-4 shadow-[0_14px_28px_rgba(208,123,73,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
              <Layers3 className="size-4 text-slate-700" />
              <p className="text-sm font-semibold tracking-tight text-slate-900">
                Supporting stack
              </p>
              </div>
              <span className="rounded-full border border-[#d07b49]/16 bg-white/80 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Updates live
              </span>
            </div>

            {Object.keys(groupedStack).length > 0 ? (
              <div className="mt-3 space-y-3">
                {Object.entries(groupedStack).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {category}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {items.map((item) => {
                        const source =
                          manualStack.length > 0 ? "manual" : item.source;

                        return (
                          <Badge
                            key={`${category}-${item.label}`}
                            variant="secondary"
                            className="rounded-full border border-[#d07b49]/10 bg-white px-3 py-1 text-[0.72rem] font-medium text-slate-700 shadow-sm"
                          >
                            {item.label}
                            <span className="ml-2 inline-flex">
                              <SourceBadge source={source} />
                            </span>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                PromptPal will add stack details once the product shape is clear.
              </p>
            )}
          </div>

          {effectiveNotes.length > 0 && (
            <div className="mt-4 rounded-[1.2rem] border border-[#184f49]/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(237,248,245,0.94))] p-4 shadow-[0_12px_24px_rgba(24,79,73,0.08)]">
              <div className="flex items-center gap-2">
                <Wand2 className="size-4 text-[#d07b49]" />
                <p className="text-sm font-semibold tracking-tight text-slate-900">
                  Why this setup
                </p>
              </div>
              <div className="mt-3 space-y-2">
                {effectiveNotes.map((note) => (
                  <p key={note} className="text-sm leading-6 text-slate-600">
                    {note}
                  </p>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {isOverrideOpen && hasRecommendation && (
        <div className="mt-4 rounded-[1.25rem] border border-slate-900/[0.08] bg-[linear-gradient(180deg,rgba(248,242,232,0.96),rgba(255,255,255,0.88))] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Advanced override
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Your manual choices become hard constraints on the next AI turn.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hasManualOverrides && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full border-slate-900/10 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={onResetOverrides}
                >
                  <RotateCcw className="size-3.5" />
                  Reset to AI
                </Button>
              )}
              <Badge
                variant="secondary"
                className="rounded-full border border-slate-900/[0.08] bg-white px-3 py-1 text-[0.68rem] font-medium text-slate-700"
              >
                {selectedTool
                  ? `${TOOLS.find((tool) => tool.id === selectedTool)?.name ?? selectedTool} selected`
                  : "No manual agent selected"}
              </Badge>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold tracking-tight text-slate-900">
                Override coding agent
              </p>
              <ToolSelector selected={selectedTool} onSelect={onToolSelect} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold tracking-tight text-slate-900">
                Override technologies
              </p>
              <p className="text-sm leading-6 text-slate-600">
                Choose only the stack constraints you want PromptPal to honor.
                Database picks can stay here too.
              </p>
              <StackSelector selected={selectedStack} onToggle={onStackToggle} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
