"use client";

import React from "react";
import { Check } from "lucide-react";
import { STACK_PRESETS } from "@/lib/prompt-catalog";
import { cn } from "@/lib/utils";

export interface StackItem {
  id: string;
  name: string;
  category: string;
  dotClass: string;
}

const CATEGORY_DOT_CLASS: Record<string, string> = {
  Framework: "bg-slate-900",
  Backend: "bg-emerald-600",
  Database: "bg-sky-500",
  UI: "bg-rose-500",
  Auth: "bg-violet-500",
  DevOps: "bg-cyan-500",
  Hosting: "bg-amber-500",
  Payments: "bg-indigo-500",
  Language: "bg-blue-500",
  API: "bg-fuchsia-500",
};

export const STACKS: StackItem[] = STACK_PRESETS.map((stack) => ({
  ...stack,
  dotClass: CATEGORY_DOT_CLASS[stack.category] ?? "bg-slate-500",
}));

const CATEGORY_STYLES: Record<string, string> = {
  Framework: "bg-amber-50/80",
  Backend: "bg-emerald-50/80",
  Database: "bg-sky-50/80",
  UI: "bg-rose-50/80",
  Auth: "bg-violet-50/80",
  DevOps: "bg-cyan-50/80",
  Hosting: "bg-orange-50/80",
  Payments: "bg-indigo-50/80",
  Language: "bg-blue-50/80",
  API: "bg-fuchsia-50/80",
};

interface StackSelectorProps {
  selected: string[];
  onToggle: (stackId: string) => void;
}

export default function StackSelector({ selected, onToggle }: StackSelectorProps) {
  const categories = Array.from(new Set(STACKS.map((stack) => stack.category)));

  return (
    <div className="grid gap-4">
      {categories.map((category) => {
        const items = STACKS.filter((stack) => stack.category === category);
        const selectedCount = items.filter((stack) => selected.includes(stack.id)).length;

        return (
          <section
            key={category}
            className={cn(
              "rounded-[1.4rem] border border-slate-900/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
              CATEGORY_STYLES[category] ?? "bg-white/70"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold tracking-tight text-slate-900">
                  {category}
                </p>
                <p className="text-xs text-slate-500">
                  {items.length} options available
                </p>
              </div>
              <div className="rounded-full border border-slate-900/10 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">
                {selectedCount} selected
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {items.map((item) => {
                const isSelected = selected.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onToggle(item.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200",
                      isSelected
                        ? "border-slate-900 bg-slate-900 text-white shadow-[0_10px_24px_rgba(29,39,53,0.18)]"
                        : "border-slate-900/10 bg-white/80 text-slate-700 hover:border-slate-900/20 hover:bg-white"
                    )}
                  >
                    <span
                      className={cn(
                        "size-2.5 rounded-full",
                        isSelected ? "bg-white" : item.dotClass
                      )}
                    />
                    <span>{item.name}</span>
                    {isSelected && <Check className="size-3.5" />}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
