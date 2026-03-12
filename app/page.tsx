"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import StackSelector, { STACKS } from "./components/StackSelector";
import ToolSelector, { TOOLS } from "./components/ToolSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURE_STRIPS = [
  "Beginner-friendly interview flow",
  "Depth slider from 15 to 30 questions",
  "Live prompt draft for your chosen tool",
];

export default function Home() {
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedStack, setSelectedStack] = useState<string[]>([]);
  const [detailLevel, setDetailLevel] = useState(3);
  const [step, setStep] = useState<1 | 2>(1);

  const selectedToolData = TOOLS.find((tool) => tool.id === selectedTool) ?? null;
  const selectedStackNames = useMemo(
    () =>
      STACKS.filter((stack) => selectedStack.includes(stack.id))
        .slice(0, 4)
        .map((stack) => stack.name),
    [selectedStack]
  );

  const handleStackToggle = (stackId: string) => {
    setSelectedStack((prev) =>
      prev.includes(stackId)
        ? prev.filter((item) => item !== stackId)
        : [...prev, stackId]
    );
  };

  const handleStart = () => {
    const params = new URLSearchParams();

    if (selectedTool) {
      params.set("tool", selectedTool);
    }

    if (selectedStack.length > 0) {
      params.set("stack", selectedStack.join(","));
    }

    params.set("detail", String(detailLevel));

    router.push(`/chat?${params.toString()}`);
  };

  const canAdvance = step === 1 ? Boolean(selectedTool) : selectedStack.length > 0;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div className="grid gap-6 xl:grid-cols-[0.92fr_minmax(420px,1.08fr)] xl:items-start">
        <section className="space-y-5 pt-2 lg:pt-6">
          <div className="animate-rise-in space-y-4">
            <Badge
              variant="secondary"
              className="w-fit rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-700"
            >
              <Sparkles className="mr-2 size-3.5" />
              Editorial Prompt Studio
            </Badge>

            <div className="space-y-3">
              <p className="eyebrow">PromptPal</p>
              <h1 className="display-title max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-5xl lg:text-[4.3rem] lg:leading-[0.95]">
                Build a sharper brief for your AI coding agent.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Turn rough product ideas into an agent-ready build brief with the
                right level of guidance, clarity, and implementation detail.
              </p>
            </div>
          </div>

          <div
            className="grid gap-2.5 sm:grid-cols-3 animate-rise-in"
            style={{ animationDelay: "120ms" }}
          >
            {FEATURE_STRIPS.map((item) => (
              <div
                key={item}
                className="rounded-[1.25rem] border border-slate-900/[0.08] bg-white/75 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>

          <Card
            className="surface-panel animate-rise-in rounded-[1.75rem] border-none px-5 py-5 lg:px-6"
            style={{ animationDelay: "220ms" }}
          >
            <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-2">
                <p className="eyebrow">What changes here</p>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  A tighter setup, a cleaner workspace, and a less intimidating interview.
                </h2>
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <div className="min-w-[112px] rounded-[1rem] border border-slate-900/[0.08] bg-white/[0.85] px-3 py-3">
                  <p className="text-lg font-semibold tracking-tight text-slate-900">8</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
                    tool presets
                  </p>
                </div>
                <div className="min-w-[112px] rounded-[1rem] border border-slate-900/[0.08] bg-white/[0.85] px-3 py-3">
                  <p className="text-lg font-semibold tracking-tight text-slate-900">15-30</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
                    guided questions
                  </p>
                </div>
                <div className="min-w-[112px] rounded-[1rem] border border-slate-900/[0.08] bg-white/[0.85] px-3 py-3">
                  <p className="text-lg font-semibold tracking-tight text-slate-900">Live</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
                    prompt depth
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section
          className="animate-rise-in xl:sticky xl:top-6"
          style={{ animationDelay: "160ms" }}
        >
          <Card className="surface-panel-strong rounded-[1.9rem] border-none p-0">
            <div className="border-b border-slate-900/[0.08] px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="eyebrow">Setup</p>
                  <h2 className="text-[1.7rem] font-semibold tracking-tight text-slate-900">
                    Build the prompt foundation
                  </h2>
                  <p className="max-w-xl text-sm leading-6 text-slate-600">
                    Start with the tool. Then add the technologies the interview
                    should account for.
                  </p>

                  <div className="mt-4 max-w-md rounded-[1.15rem] border border-slate-900/[0.08] bg-white/75 p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Prompt depth
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {detailLevel === 1 && "Broad"}
                          {detailLevel === 2 && "Guided"}
                          {detailLevel === 3 && "Balanced"}
                          {detailLevel === 4 && "Specific"}
                          {detailLevel === 5 && "Exhaustive"}
                        </p>
                      </div>
                      <div className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-3 py-1 text-xs font-semibold text-slate-700">
                        {detailLevel === 1 && "~15 q"}
                        {detailLevel === 2 && "~18 q"}
                        {detailLevel === 3 && "~22 q"}
                        {detailLevel === 4 && "~26 q"}
                        {detailLevel === 5 && "~30 q"}
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
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
                        <span>Vague</span>
                        <span>Detailed</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden rounded-full border border-slate-900/[0.08] bg-white/[0.85] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:block">
                  Step {step} / 2
                </div>
              </div>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  className={cn(
                    "rounded-[1.15rem] border px-4 py-3 text-left transition-all",
                    step === 1
                      ? "border-slate-900 bg-slate-900 text-white shadow-[0_14px_30px_rgba(29,39,53,0.16)]"
                      : "border-slate-900/10 bg-white/[0.85] text-slate-700 hover:border-slate-900/[0.18] hover:bg-white"
                  )}
                  onClick={() => setStep(1)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                      Step 1
                    </span>
                    {selectedTool && step !== 1 && <Check className="size-4 text-emerald-500" />}
                  </div>
                  <p className="mt-2 text-sm font-semibold">Choose your tool</p>
                  <p className={cn("mt-1 text-xs leading-5", step === 1 ? "text-white/70" : "text-slate-500")}>
                    {selectedToolData?.name ?? "Set the target environment first."}
                  </p>
                </button>

                <button
                  type="button"
                  className={cn(
                    "rounded-[1.15rem] border px-4 py-3 text-left transition-all",
                    step === 2
                      ? "border-slate-900 bg-slate-900 text-white shadow-[0_14px_30px_rgba(29,39,53,0.16)]"
                      : "border-slate-900/10 bg-white/[0.85] text-slate-700 hover:border-slate-900/[0.18] hover:bg-white",
                    !selectedTool && "cursor-not-allowed opacity-[0.55] hover:border-slate-900/10 hover:bg-white/[0.85]"
                  )}
                  onClick={() => selectedTool && setStep(2)}
                  disabled={!selectedTool}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                      Step 2
                    </span>
                    {selectedStack.length > 0 && step !== 2 && <Check className="size-4 text-emerald-500" />}
                  </div>
                  <p className="mt-2 text-sm font-semibold">Select your stack</p>
                  <p className={cn("mt-1 text-xs leading-5", step === 2 ? "text-white/70" : "text-slate-500")}>
                    {selectedStack.length > 0
                      ? `${selectedStack.length} technologies selected`
                      : "Add the technologies the agent should optimize for."}
                  </p>
                </button>
              </div>
            </div>

            <div className="px-5 py-5 sm:px-6">
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="eyebrow">Tooling</p>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                      Which AI environment will execute this prompt?
                    </h3>
                  </div>
                  <ToolSelector selected={selectedTool} onSelect={setSelectedTool} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="eyebrow">Stack</p>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                      Select the technologies this project relies on.
                    </h3>
                    <p className="text-sm leading-6 text-slate-600">
                      Select only what matters. The interview will stay simple by default.
                    </p>
                  </div>
                  <StackSelector selected={selectedStack} onToggle={handleStackToggle} />
                </div>
              )}
            </div>

            <div className="border-t border-slate-900/[0.08] bg-white/60 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">Current brief snapshot</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedToolData ? (
                      <span className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                        {selectedToolData.name}
                      </span>
                    ) : (
                      <span className="rounded-full border border-dashed border-slate-900/[0.16] px-3 py-1 text-xs text-slate-500">
                        No tool selected yet
                      </span>
                    )}
                    {selectedStack.length > 0 ? (
                      <>
                        {selectedStackNames.map((name) => (
                          <span
                            key={name}
                            className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                          >
                            {name}
                          </span>
                        ))}
                        {selectedStack.length > selectedStackNames.length && (
                          <span className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                            +{selectedStack.length - selectedStackNames.length} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="rounded-full border border-dashed border-slate-900/[0.16] px-3 py-1 text-xs text-slate-500">
                        No stack selected yet
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 sm:flex-row">
                  {step === 2 && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-10 rounded-full border-slate-900/[0.12] bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                  )}

                  <Button
                    size="lg"
                    className={cn(
                      "h-10 rounded-full px-4 text-sm font-semibold shadow-none transition-all",
                      canAdvance
                        ? "bg-slate-900 text-white hover:-translate-y-0.5 hover:bg-slate-800"
                        : "bg-slate-300 text-slate-500"
                    )}
                    disabled={!canAdvance}
                    onClick={step === 1 ? () => setStep(2) : handleStart}
                  >
                    {step === 1 ? "Continue to Stack" : "Start Prompt Session"}
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
