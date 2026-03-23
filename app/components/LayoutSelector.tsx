"use client";

import React from "react";
import { Check, LayoutTemplate, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LAYOUT_PRESETS } from "@/lib/prompt-catalog";
import { LayoutRecommendation } from "@/lib/prompt-state";
import { cn } from "@/lib/utils";

interface LayoutSelectorProps {
  selected: string | null;
  recommendations: LayoutRecommendation[];
  onSelect: (layoutId: string) => void;
}

function LayoutPreview({
  layoutId,
  isSelected,
}: {
  layoutId: string;
  isSelected: boolean;
}) {
  const frameClass = isSelected
    ? "border-white/14 bg-slate-950/30"
    : "border-slate-900/[0.08] bg-[#fbf7f1]";
  const chromeClass = isSelected ? "bg-white/12" : "bg-white";
  const accentClass = isSelected ? "bg-emerald-300/70" : "bg-[#d07b49]";
  const mutedClass = isSelected ? "bg-white/20" : "bg-slate-200";
  const mutedSoftClass = isSelected ? "bg-white/12" : "bg-slate-100";
  const labelClass = isSelected ? "text-white/72" : "text-slate-500";

  const tag = (label: string, extraClass?: string) => (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[0.54rem] font-semibold uppercase tracking-[0.16em]",
        isSelected ? "bg-white/12 text-white/74" : "bg-white text-slate-500",
        extraClass
      )}
    >
      {label}
    </span>
  );

  if (layoutId === "saas-command-center") {
    return (
      <div className={cn("relative h-40 overflow-hidden rounded-[1.15rem] border p-3", frameClass)}>
        <div className="flex h-full gap-3">
          <div className={cn("flex w-12 flex-col gap-2 rounded-[0.9rem] p-2", chromeClass)}>
            <div className={cn("h-3 rounded-full", accentClass)} />
            <div className={cn("h-2 rounded-full", mutedClass)} />
            <div className={cn("h-2 rounded-full", mutedClass)} />
            <div className={cn("mt-auto h-6 rounded-[0.7rem]", mutedSoftClass)} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className={cn("flex h-8 items-center justify-between rounded-[0.9rem] px-3", chromeClass)}>
              <span className={cn("text-[0.56rem] font-semibold uppercase tracking-[0.16em]", labelClass)}>
                KPI bar
              </span>
              {tag("CTA")}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((item) => (
                <div key={item} className={cn("h-12 rounded-[0.9rem]", chromeClass)} />
              ))}
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-[1.2fr_0.8fr] gap-2">
              <div className={cn("rounded-[1rem] p-3", chromeClass)}>
                <div className={cn("h-2 rounded-full", mutedClass)} />
                <div className={cn("mt-2 h-2 w-4/5 rounded-full", mutedSoftClass)} />
                <div className={cn("mt-4 h-12 rounded-[0.8rem]", mutedSoftClass)} />
              </div>
              <div className="flex flex-col gap-2">
                <div className={cn("h-10 rounded-[0.9rem]", chromeClass)} />
                <div className={cn("flex-1 rounded-[0.9rem]", chromeClass)} />
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3">{tag("Sidebar")}</div>
      </div>
    );
  }

  if (layoutId === "conversion-funnel") {
    return (
      <div className={cn("relative h-40 overflow-hidden rounded-[1.15rem] border p-3", frameClass)}>
        <div className={cn("rounded-[1rem] p-3", chromeClass)}>
          <div className="flex items-center justify-between">
            {tag("Logo")}
            {tag("Get started")}
          </div>
          <div className={cn("mt-3 h-3 w-3/5 rounded-full", accentClass)} />
          <div className={cn("mt-2 h-2 w-4/5 rounded-full", mutedClass)} />
          <div className={cn("mt-2 h-2 w-2/3 rounded-full", mutedSoftClass)} />
          <div className="mt-4 grid grid-cols-[1.1fr_0.9fr] gap-3">
            <div className={cn("rounded-[0.95rem] p-3", mutedSoftClass)}>
              <div className={cn("h-9 rounded-[0.8rem]", chromeClass)} />
              <div className={cn("mt-2 h-7 w-2/3 rounded-full", accentClass)} />
            </div>
            <div className={cn("rounded-[0.95rem]", mutedClass)} />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((item) => (
            <div key={item} className={cn("h-8 rounded-[0.8rem]", chromeClass)} />
          ))}
        </div>
      </div>
    );
  }

  if (layoutId === "premium-marketplace") {
    return (
      <div className={cn("relative h-40 overflow-hidden rounded-[1.15rem] border p-3", frameClass)}>
        <div className={cn("flex h-8 items-center justify-between rounded-[0.9rem] px-3", chromeClass)}>
          {tag("Logo")}
          {tag("Search")}
        </div>
        <div className="mt-3 grid h-[calc(100%-2.75rem)] grid-cols-[0.75fr_1.25fr] gap-2">
          <div className={cn("rounded-[1rem] p-3", chromeClass)}>
            <div className={cn("h-2 rounded-full", mutedClass)} />
            <div className={cn("mt-2 h-2 w-4/5 rounded-full", mutedClass)} />
            <div className={cn("mt-2 h-2 w-3/5 rounded-full", mutedSoftClass)} />
            <div className={cn("mt-3 h-8 rounded-[0.8rem]", mutedSoftClass)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className={cn("rounded-[0.95rem] p-2", chromeClass)}>
                <div className={cn("h-7 rounded-[0.7rem]", mutedSoftClass)} />
                <div className={cn("mt-2 h-2 rounded-full", mutedClass)} />
                <div className={cn("mt-1.5 h-2 w-2/3 rounded-full", mutedSoftClass)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (layoutId === "service-booking") {
    return (
      <div className={cn("relative h-40 overflow-hidden rounded-[1.15rem] border p-3", frameClass)}>
        <div className="grid h-full grid-cols-[1fr_0.92fr] gap-3">
          <div className={cn("rounded-[1rem] p-3", chromeClass)}>
            {tag("Logo")}
            <div className={cn("mt-3 h-3 w-4/5 rounded-full", accentClass)} />
            <div className={cn("mt-2 h-2 w-3/5 rounded-full", mutedClass)} />
            <div className={cn("mt-4 h-8 w-1/2 rounded-full", accentClass)} />
            <div className={cn("mt-3 h-7 rounded-[0.8rem]", mutedSoftClass)} />
          </div>
          <div className="flex flex-col gap-2">
            <div className={cn("h-14 rounded-[1rem] p-3", chromeClass)}>
              <div className={cn("h-2 rounded-full", mutedClass)} />
              <div className={cn("mt-2 h-6 rounded-[0.75rem]", mutedSoftClass)} />
            </div>
            <div className={cn("flex-1 rounded-[1rem] p-3", chromeClass)}>
              <div className={cn("h-2 rounded-full", mutedClass)} />
              <div className={cn("mt-2 h-2 w-4/5 rounded-full", mutedSoftClass)} />
              <div className={cn("mt-3 h-7 rounded-[0.8rem]", mutedSoftClass)} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (layoutId === "community-editorial") {
    return (
      <div className={cn("relative h-40 overflow-hidden rounded-[1.15rem] border p-3", frameClass)}>
        <div className={cn("flex h-8 items-center justify-between rounded-[0.9rem] px-3", chromeClass)}>
          {tag("Logo")}
          {tag("Community")}
        </div>
        <div className="mt-3 grid h-[calc(100%-2.75rem)] grid-cols-[1.15fr_0.85fr] gap-2">
          <div className="flex flex-col gap-2">
            <div className={cn("rounded-[1rem] p-3", chromeClass)}>
              <div className={cn("h-10 rounded-[0.85rem]", mutedSoftClass)} />
              <div className={cn("mt-2 h-2 rounded-full", mutedClass)} />
              <div className={cn("mt-1.5 h-2 w-4/5 rounded-full", mutedSoftClass)} />
            </div>
            <div className={cn("flex-1 rounded-[1rem] p-3", chromeClass)}>
              <div className={cn("h-2 rounded-full", mutedClass)} />
              <div className={cn("mt-2 h-2 w-2/3 rounded-full", mutedSoftClass)} />
              <div className={cn("mt-3 h-7 rounded-[0.85rem]", mutedSoftClass)} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className={cn("h-16 rounded-[1rem]", chromeClass)} />
            <div className={cn("flex-1 rounded-[1rem]", chromeClass)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative h-40 overflow-hidden rounded-[1.15rem] border p-3", frameClass)}>
      <div className={cn("flex h-8 items-center justify-between rounded-[0.9rem] px-3", chromeClass)}>
        {tag("Logo")}
        {tag("Actions")}
      </div>
      <div className="mt-3 grid h-[calc(100%-2.75rem)] grid-cols-[0.78fr_1.22fr] gap-2">
        <div className="flex flex-col gap-2">
          <div className={cn("h-10 rounded-[0.95rem]", chromeClass)} />
          <div className={cn("flex-1 rounded-[0.95rem]", chromeClass)} />
        </div>
        <div className={cn("rounded-[1rem] p-3", chromeClass)}>
          <div className="grid grid-cols-2 gap-2">
            <div className={cn("h-7 rounded-[0.8rem]", mutedSoftClass)} />
            <div className={cn("h-7 rounded-[0.8rem]", accentClass)} />
          </div>
          <div className="mt-3 grid h-[calc(100%-2.5rem)] grid-cols-[0.78fr_1.22fr] gap-2">
            <div className={cn("rounded-[0.85rem]", mutedSoftClass)} />
            <div className={cn("rounded-[0.85rem]", mutedClass)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LayoutSelector({
  selected,
  recommendations,
  onSelect,
}: LayoutSelectorProps) {
  const recommendedById = new Map(
    recommendations
      .filter((layout) => layout.id)
      .map((layout) => [layout.id as string, layout.summary])
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {LAYOUT_PRESETS.map((layout) => {
        const isSelected = selected === layout.id;
        const recommendationSummary = recommendedById.get(layout.id);

        return (
          <button
            key={layout.id}
            type="button"
            onClick={() => onSelect(layout.id)}
            className={cn(
              "group rounded-[1.55rem] border p-4 text-left transition-all duration-300",
              isSelected
                ? "border-slate-900 bg-slate-900 text-white shadow-[0_22px_55px_rgba(29,39,53,0.22)]"
                : "border-slate-900/[0.08] bg-white hover:-translate-y-1 hover:border-slate-900/[0.16] hover:shadow-[0_18px_42px_rgba(29,39,53,0.08)]"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold tracking-tight">
                {layout.name}
              </h3>

              <div className="flex items-center gap-2">
                {recommendationSummary && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-full border px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em]",
                      isSelected
                        ? "border-white/14 bg-white/10 text-white"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    )}
                  >
                    <Sparkles className="mr-1 size-3.5" />
                    AI pick
                  </Badge>
                )}
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border",
                    isSelected
                      ? "border-white/20 bg-white/12 text-white"
                      : "border-slate-900/10 bg-white text-slate-400"
                  )}
                >
                  {isSelected ? (
                    <Check className="size-3.5" />
                  ) : (
                    <span className="size-2 rounded-full bg-current" />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <LayoutPreview layoutId={layout.id} isSelected={isSelected} />
            </div>

            <div className="mt-3 space-y-3">
              <p
                className={cn(
                  "text-sm leading-6",
                  isSelected ? "text-white/84" : "text-slate-600"
                )}
              >
                {recommendationSummary ?? layout.summary}
              </p>

              <div className="flex flex-wrap gap-2">
                {layout.highlights.map((item) => (
                  <span
                    key={item}
                    className={cn(
                      "rounded-full px-3 py-1 text-[0.68rem] font-medium",
                      isSelected
                        ? "bg-white/12 text-white"
                        : "border border-slate-900/[0.08] bg-white text-slate-700"
                    )}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
