"use client";

import React from "react";
import { Orbit, Search, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResearchState } from "@/lib/prompt-state";

interface ResearchPanelProps {
  research: ResearchState;
  isLoading: boolean;
}

export default function ResearchPanel({ research, isLoading }: ResearchPanelProps) {
  const hasResearch =
    Boolean(research.summary) || research.decisions.length > 0 || research.focusAreas.length > 0;
  const visibleFocusAreas = research.focusAreas.slice(0, 3);
  const hiddenFocusCount = Math.max(research.focusAreas.length - visibleFocusAreas.length, 0);
  const visibleDecisions = research.decisions.slice(0, 2);
  const visibleOpenQuestions = research.openQuestions.slice(0, 1);

  return (
    <div className="rounded-[1.2rem] border border-slate-900/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,241,232,0.92))] p-3.5 shadow-[0_16px_34px_rgba(29,39,53,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full border border-slate-900/[0.08] bg-white px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-slate-600"
          >
            <Search className="mr-1.5 size-3.5" />
            Research agent
          </Badge>
          <h2 className="text-[0.95rem] font-semibold tracking-tight text-slate-900">
            Project Overview
          </h2>
        </div>

        <div className="rounded-full border border-slate-900/[0.08] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
          {isLoading ? "Researching" : hasResearch ? "Research loaded" : "Waiting for idea"}
        </div>
      </div>

      {!hasResearch ? (
        <div className="mt-3 rounded-[0.95rem] border border-dashed border-slate-900/[0.12] bg-[#fbf7f1] px-3.5 py-3">
          <p className="text-sm font-semibold tracking-tight text-slate-900">
            The research pass starts after the first idea.
          </p>
          <p className="mt-1 text-[13px] leading-5 text-slate-600">
            PromptPal will summarize the key product decisions here.
          </p>
        </div>
      ) : (
        <div className="mt-3 grid gap-2.5 xl:grid-cols-[minmax(0,1.25fr)_minmax(250px,0.75fr)]">
          <div className="rounded-[0.95rem] border border-slate-900/[0.08] bg-white p-3">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
              <Orbit className="size-4 text-[#d07b49]" />
              Research summary
            </div>
            <div className="mt-2 max-h-16 overflow-y-auto pr-1">
              <p className="text-[13px] leading-5 text-slate-600">{research.summary}</p>
            </div>

            {visibleFocusAreas.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {visibleFocusAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-2.5 py-1 text-[0.64rem] font-medium text-slate-700"
                  >
                    {area}
                  </span>
                ))}
                {hiddenFocusCount > 0 && (
                  <span className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-2.5 py-1 text-[0.64rem] font-medium text-slate-700">
                    +{hiddenFocusCount} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <div className="rounded-[1.1rem] border border-slate-900/[0.08] bg-white p-3.5">
              <p className="text-[13px] font-semibold tracking-tight text-slate-900">
                Key picks
              </p>
              <div className="mt-2 space-y-1.5">
                {visibleDecisions.map((decision) => (
                  <div key={`${decision.topic}-${decision.winner}`} className="rounded-[0.9rem] border border-slate-900/[0.08] bg-[#fbf7f1] px-3 py-2">
                    <p className="text-[12px] leading-5 text-slate-700">
                      <span className="font-semibold text-slate-900">{decision.topic}:</span>{" "}
                      {decision.winner}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {visibleOpenQuestions.length > 0 && (
              <div className="rounded-[0.95rem] border border-amber-200 bg-amber-50/90 p-3">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-amber-900">
                  <ShieldAlert className="size-4" />
                  Watchout
                </div>
                <div className="mt-1.5 space-y-1">
                  {visibleOpenQuestions.map((item) => (
                    <p key={item} className="text-[13px] leading-5 text-amber-900/80">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
