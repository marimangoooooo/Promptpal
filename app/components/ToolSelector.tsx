"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Braces,
  Check,
  Code2,
  Cpu,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Tool {
  id: string;
  name: string;
  description: string;
  label: string;
  icon: LucideIcon;
  accentClass: string;
  iconClass: string;
}

export const TOOLS: Tool[] = [
  {
    id: "cursor",
    name: "Cursor",
    description: "Agentic editor for long-running code changes",
    label: "Editor",
    icon: Code2,
    accentClass: "from-sky-500/[0.15] via-sky-500/5 to-transparent",
    iconClass: "bg-sky-500/[0.12] text-sky-700",
  },
  {
    id: "antigravity",
    name: "Antigravity",
    description: "Research-heavy DeepMind workflow",
    label: "Research",
    icon: Sparkles,
    accentClass: "from-emerald-500/[0.15] via-emerald-500/5 to-transparent",
    iconClass: "bg-emerald-500/[0.12] text-emerald-700",
  },
  {
    id: "claude-code",
    name: "Claude Code",
    description: "CLI agent for structured implementation work",
    label: "Terminal",
    icon: Terminal,
    accentClass: "from-amber-500/[0.15] via-amber-500/5 to-transparent",
    iconClass: "bg-amber-500/[0.12] text-amber-700",
  },
  {
    id: "codex",
    name: "Codex CLI",
    description: "OpenAI agent built for code execution",
    label: "CLI",
    icon: Bot,
    accentClass: "from-teal-500/[0.15] via-teal-500/5 to-transparent",
    iconClass: "bg-teal-500/[0.12] text-teal-700",
  },
  {
    id: "windsurf",
    name: "Windsurf",
    description: "Fast IDE workflow with embedded chat",
    label: "IDE",
    icon: Zap,
    accentClass: "from-rose-500/[0.15] via-rose-500/5 to-transparent",
    iconClass: "bg-rose-500/[0.12] text-rose-700",
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    description: "Inline assistant for code-first teams",
    label: "Pairing",
    icon: Cpu,
    accentClass: "from-cyan-500/[0.15] via-cyan-500/5 to-transparent",
    iconClass: "bg-cyan-500/[0.12] text-cyan-700",
  },
  {
    id: "aider",
    name: "Aider",
    description: "Diff-oriented terminal collaboration",
    label: "Diffs",
    icon: Braces,
    accentClass: "from-orange-500/[0.15] via-orange-500/5 to-transparent",
    iconClass: "bg-orange-500/[0.12] text-orange-700",
  },
];

interface ToolSelectorProps {
  selected: string | null;
  onSelect: (toolId: string) => void;
}

export default function ToolSelector({ selected, onSelect }: ToolSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        const isSelected = selected === tool.id;

        return (
          <Card
            key={tool.id}
            className={cn(
              "group relative overflow-hidden rounded-[1.5rem] border p-0 shadow-none transition duration-300",
              isSelected
                ? "border-slate-900/[0.18] bg-white shadow-[0_20px_45px_rgba(29,39,53,0.1)]"
                : "border-slate-900/[0.08] bg-white/[0.72] hover:-translate-y-1 hover:border-slate-900/[0.14] hover:bg-white hover:shadow-[0_18px_40px_rgba(29,39,53,0.08)]"
            )}
          >
            <button
              type="button"
              className="relative flex h-full min-h-[124px] w-full flex-col items-start gap-3.5 p-4 text-left"
              onClick={() => onSelect(tool.id)}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                  tool.accentClass,
                  isSelected && "opacity-100"
                )}
              />

              <div className="relative flex w-full items-start justify-between gap-4">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-[0.95rem] border border-white/80 shadow-sm",
                    tool.iconClass
                  )}
                >
                  <Icon className="size-[18px]" />
                </div>

                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border text-slate-400 transition-colors",
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-900/[0.12] bg-white/80"
                  )}
                >
                  {isSelected ? <Check className="size-3.5" /> : <span className="size-2 rounded-full bg-current" />}
                </div>
              </div>

              <div className="relative space-y-1.5">
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {tool.label}
                </p>
                <div className="space-y-0.5">
                  <h3 className="text-base font-semibold tracking-tight text-slate-900">
                    {tool.name}
                  </h3>
                  <p className="text-xs leading-5 text-slate-600">
                    {tool.description}
                  </p>
                </div>
              </div>
            </button>
          </Card>
        );
      })}
    </div>
  );
}
