"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Database,
  Layers3,
  MessageSquareQuote,
  Sparkles,
  TerminalSquare,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import TopologyBackground from "./components/TopologyBackground";

const FEATURE_STRIPS = [
  "Built for existing ideas, not blank-page ideation",
  "AI suggests agents, databases, and tooling",
  "Live prompt updates after every answer",
];

const QUESTION_TARGETS: Record<number, number> = {
  1: 15,
  2: 18,
  3: 22,
  4: 26,
  5: 30,
};

const DEPTH_COPY: Record<number, { label: string; description: string }> = {
  1: {
    label: "Broad",
    description: "Light cleanup with fewer follow-up questions and faster assumptions.",
  },
  2: {
    label: "Guided",
    description: "A short improvement pass with a handful of focused corrections.",
  },
  3: {
    label: "Balanced",
    description: "A practical middle ground between speed, research, and specificity.",
  },
  4: {
    label: "Specific",
    description: "More clarifying questions and tighter implementation guidance.",
  },
  5: {
    label: "Exhaustive",
    description: "Deep prompt refinement with many corrections and implementation details.",
  },
};

const SAMPLE_RECOMMENDATIONS = [
  {
    title: "Coding agent",
    value: "Codex CLI",
    icon: TerminalSquare,
    accent: "bg-teal-500/[0.12] text-teal-800",
  },
  {
    title: "Database",
    value: "Supabase",
    icon: Database,
    accent: "bg-emerald-500/[0.12] text-emerald-800",
  },
  {
    title: "Stack",
    value: "Next.js, shadcn/ui, Stripe",
    icon: Layers3,
    accent: "bg-amber-500/[0.12] text-amber-800",
  },
];

const SAMPLE_PROMPT_LINES = [
  "- Refine the product brief the user already defined.",
  "- Use a fast app stack with built-in auth and data.",
  "- Ask only one clarification at a time.",
];

export default function Home() {
  const router = useRouter();
  const [detailLevel, setDetailLevel] = useState(3);

  const detailCopy = useMemo(() => DEPTH_COPY[detailLevel], [detailLevel]);
  const questionTarget = QUESTION_TARGETS[detailLevel];

  useEffect(() => {
    document.body.dataset.homepage = "true";

    return () => {
      delete document.body.dataset.homepage;
    };
  }, []);

  return (
    <main className="relative isolate min-h-screen overflow-x-clip">
      <TopologyBackground />
      <div className="relative z-10 mx-auto max-w-[1380px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] xl:items-start">
            <div className="min-w-0 space-y-5 pt-2 lg:pt-6">
              <div className="animate-rise-in space-y-4">
                <Badge
                  variant="secondary"
                  className="w-fit rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-700"
                >
                  <Sparkles className="mr-2 size-3.5" />
                  Idea-first prompt studio
                </Badge>

                <div className="space-y-3">
                  <p className="eyebrow text-white/72">PromptPal</p>
                  <h1 className="display-title max-w-[7.5ch] text-[clamp(2.7rem,5.6vw,4.95rem)] font-semibold leading-[0.92] tracking-[-0.05em] text-white">
                    Your PromptPal.
                  </h1>
                  <p className="max-w-xl text-base leading-7 text-white/82 sm:text-lg">
                    Because your idea deserves better than a bad prompt.
                  </p>
                </div>
              </div>

              <div
                className="grid gap-2.5 md:grid-cols-3 animate-rise-in"
                style={{ animationDelay: "100ms" }}
              >
                {FEATURE_STRIPS.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.2rem] border border-slate-900/[0.08] bg-white/78 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <Card
                className="surface-panel animate-rise-in rounded-[1.6rem] border-none px-5 py-5"
                style={{ animationDelay: "180ms" }}
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(220px,0.8fr)]">
                  <div className="space-y-2">
                    <p className="eyebrow">What changes here</p>
                    <h2 className="max-w-[16ch] text-[1.45rem] font-semibold tracking-tight text-slate-900 sm:text-[1.85rem] sm:leading-[1.08]">
                      The user brings the brief. PromptPal brings the workflow,
                      recommendations, and corrections.
                    </h2>
                    <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                      PromptPal is for refining an existing product direction into
                      a stronger build prompt. It is not meant to help users
                      discover what to build from scratch.
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                    <div className="rounded-[1rem] border border-slate-900/[0.08] bg-white/[0.85] px-4 py-4">
                      <p className="text-lg font-semibold tracking-tight text-slate-900">Live</p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
                        prompt draft
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-slate-900/[0.08] bg-white/[0.85] px-4 py-4">
                      <p className="text-lg font-semibold tracking-tight text-slate-900">AI</p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
                        setup suggestions
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-slate-900/[0.08] bg-white/[0.85] px-4 py-4">
                      <p className="text-lg font-semibold tracking-tight text-slate-900">
                        {questionTarget}
                      </p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
                        max follow-ups
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card
              className="surface-panel-strong min-w-0 animate-rise-in rounded-[1.9rem] border-none p-0"
              style={{ animationDelay: "140ms" }}
            >
              <div className="border-b border-slate-900/[0.08] px-5 py-4 sm:px-6 sm:py-4">
                <div className="space-y-2">
                  <p className="eyebrow">Prompt depth</p>
                  <h2 className="max-w-[20ch] text-[1.05rem] font-semibold tracking-tight text-slate-900 sm:text-[1.28rem] sm:leading-[1.14]">
                    Choose how hard PromptPal should refine your brief.
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                    More depth means more follow-up questions, more corrections,
                    and a tighter implementation prompt.
                  </p>
                </div>

                <div className="mt-2 rounded-[1.25rem] border border-slate-900/[0.08] bg-white/78 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Current mode
                      </p>
                      <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                        {detailCopy.label}
                      </p>
                    </div>
                    <div className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-3 py-1 text-xs font-semibold text-slate-700">
                      Up to {questionTarget} questions
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={detailLevel}
                      onChange={(event) => setDetailLevel(Number(event.target.value))}
                      className="w-full accent-slate-900"
                    />
                    <div className="flex justify-between text-[0.72rem] font-medium text-slate-500">
                      <span>Broad improvement</span>
                      <span>Deep refinement</span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
                    {detailCopy.description}
                  </p>
                </div>
              </div>

              <div className="border-b border-slate-900/[0.08] px-5 pb-1 pt-0 sm:px-6 sm:pb-2 sm:pt-1">
                <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-2">
                    <p className="eyebrow">Example process</p>
                    <h3 className="max-w-[14ch] text-[1.65rem] font-semibold tracking-tight text-slate-900 sm:text-[2rem] sm:leading-[1.04]">
                      How the prompt gets better
                    </h3>
                    <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                      Share an existing product brief, get AI suggestions, and
                      keep a live build prompt evolving in the same flow.
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="h-11 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white shadow-none transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                    onClick={() => router.push(`/chat?detail=${detailLevel}`)}
                  >
                    Get started
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="px-5 py-5 sm:px-6">
                <div className="grid gap-3 xl:grid-cols-3">
                  <div className="rounded-[1.35rem] border border-slate-900/[0.08] bg-[#f8efe2] p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <MessageSquareQuote className="size-4 text-[#d07b49]" />
                      Share your existing brief
                    </div>
                    <div className="mt-4 rounded-[1rem] border border-slate-900/[0.08] bg-white/90 p-3">
                      <p className="text-sm leading-6 text-slate-600 sm:text-base">
                        Build a marketplace for vintage cameras with listings,
                        offers, and verified seller profiles. It should feel
                        premium, easy to trust, and simple for a small team to
                        manage.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-slate-900/[0.08] bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Sparkles className="size-4 text-[#d07b49]" />
                      AI suggests the setup
                    </div>
                    <div className="mt-4 space-y-2.5">
                      {SAMPLE_RECOMMENDATIONS.map((item) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.title}
                            className="rounded-[1rem] border border-slate-900/[0.08] bg-[#fbf7f1] p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex size-9 shrink-0 items-center justify-center rounded-[0.9rem] ${item.accent}`}
                              >
                                <Icon className="size-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                  {item.title}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
                                  {item.value}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-slate-900/[0.08] bg-[#f5f0e7] p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Wand2 className="size-4 text-[#d07b49]" />
                      Live prompt keeps improving
                    </div>
                    <div className="mt-4 rounded-[1rem] border border-slate-900/[0.08] bg-slate-900 p-3 font-mono text-[0.75rem] leading-6 text-slate-100">
                      <div className="mb-3 text-slate-400">Production Build Prompt</div>
                      <div className="space-y-1 text-slate-300">
                        {SAMPLE_PROMPT_LINES.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
