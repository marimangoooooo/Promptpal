"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressTrackerProps {
  currentQuestion: number;
  totalQuestions: number;
  phase: "discovery" | "definition" | "experience" | "delivery" | "finalizing";
}

function buildSegments(totalQuestions: number) {
  const safeTotal = Math.max(totalQuestions, 4);
  const discoveryEnd = Math.max(3, Math.round(safeTotal * 0.24));
  const definitionEnd = Math.max(discoveryEnd + 3, Math.round(safeTotal * 0.5));
  const experienceEnd = Math.max(definitionEnd + 2, Math.round(safeTotal * 0.72));

  return [
    { id: "discovery", label: "Idea and audience", start: 1, end: discoveryEnd },
    { id: "definition", label: "Features and flows", start: discoveryEnd + 1, end: definitionEnd },
    { id: "experience", label: "UI and product feel", start: definitionEnd + 1, end: experienceEnd },
    { id: "delivery", label: "Implementation details", start: experienceEnd + 1, end: safeTotal },
  ];
}

export default function ProgressTracker({
  currentQuestion,
  totalQuestions,
  phase,
}: ProgressTrackerProps) {
  const hasStarted = currentQuestion > 0;
  const boundedQuestion = hasStarted
    ? Math.min(Math.max(currentQuestion, 1), Math.max(totalQuestions, 1))
    : 0;
  const progress = hasStarted
    ? Math.min(100, (boundedQuestion / Math.max(totalQuestions, 1)) * 100)
    : 0;
  const segments = buildSegments(totalQuestions);

  return (
    <div className="rounded-[1.5rem] border border-slate-900/[0.08] bg-white/80 p-4 shadow-sm">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Progress
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
            Prompt shaping
          </h3>
        </div>
        <div className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-3 py-1 text-xs font-semibold text-slate-700">
          {hasStarted ? `Q${boundedQuestion}/${totalQuestions}` : "Ready to start"}
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className="h-full rounded-full bg-slate-900 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!hasStarted && (
        <div className="mt-4 rounded-[1rem] border border-dashed border-slate-900/[0.12] bg-[#fbf7f1] px-3 py-3">
          <p className="text-sm font-semibold tracking-tight text-slate-900">
            Intake first
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Share the rough idea. PromptPal will turn it into question one,
            suggest the setup, and keep the live draft moving.
          </p>
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        {segments.map((segment) => {
          const isActive =
            (hasStarted && phase === segment.id) ||
            (boundedQuestion >= segment.start && boundedQuestion <= segment.end);
          const isComplete = hasStarted && boundedQuestion > segment.end;

          return (
            <div
              key={segment.id}
              className={cn(
                "flex items-center gap-3 rounded-[1rem] px-3 py-3 transition-colors",
                isActive && "bg-[#f6efe4]",
                isComplete && "bg-emerald-50/75"
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isComplete && "bg-emerald-600 text-white",
                  isActive && "bg-slate-900 text-white",
                  !isComplete && !isActive && "border border-slate-900/10 bg-white text-slate-500"
                )}
              >
                {isComplete ? <Check className="size-4" /> : segment.start}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight text-slate-900">
                  {segment.label}
                </p>
                <p className="text-xs text-slate-500">
                  Q{segment.start}-Q{segment.end}
                </p>
              </div>
            </div>
          );
        })}

        <div
          className={cn(
            "flex items-center gap-3 rounded-[1rem] px-3 py-3",
            hasStarted && phase === "finalizing" && "bg-[#f6efe4]"
          )}
        >
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              hasStarted && phase === "finalizing"
                ? "bg-slate-900 text-white"
                : "border border-slate-900/10 bg-white text-slate-500"
            )}
          >
            F
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">
              Final prompt
            </p>
            <p className="text-xs text-slate-500">Last refinement pass</p>
          </div>
        </div>
      </div>
    </div>
  );
}
