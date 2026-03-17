"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  ArrowLeft,
  Download,
  FileText,
  Lightbulb,
  PanelRightClose,
  PanelRightOpen,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import ChatMessage from "../components/ChatMessage";
import ProgressTracker from "../components/ProgressTracker";
import PromptModal from "../components/PromptModal";
import PromptPanel from "../components/PromptPanel";
import RecommendationPanel from "../components/RecommendationPanel";
import { STACKS } from "../components/StackSelector";
import { TOOLS } from "../components/ToolSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  EMPTY_RECOMMENDATION_STATE,
  extractPromptState,
  extractRecommendationState,
  extractSessionState,
  getMessageText,
  HiddenBlockMessage,
  RecommendationChip,
  RecommendationEntity,
  SessionState,
  stripHiddenBlocks,
} from "@/lib/prompt-state";
import { cn } from "@/lib/utils";

const DETAIL_LABELS: Record<number, string> = {
  1: "Broad",
  2: "Guided",
  3: "Balanced",
  4: "Specific",
  5: "Exhaustive",
};

const QUESTION_TARGETS: Record<number, number> = {
  1: 15,
  2: 18,
  3: 22,
  4: 26,
  5: 30,
};

const MODEL_DISPLAY_NAME = "xAI Grok";
const MIN_INITIAL_BRIEF_WORDS = 120;

function detectQuestionNumber(messages: HiddenBlockMessage[]): number {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role !== "assistant") {
      continue;
    }

    const text = stripHiddenBlocks(getMessageText(message.parts));
    const match = text.match(/(?:^|\n)\s*Q(\d+):/);

    if (match) {
      return Number.parseInt(match[1], 10);
    }
  }

  return 0;
}

function hasFinalPromptSignal(text: string): boolean {
  const normalized = text.toLowerCase();

  return [
    "prompt is ready",
    "your prompt is ready",
    "your prompt is now ready",
    "copy the full prompt",
    "open the full prompt",
    "see full prompt",
    "show full prompt",
    "review the live preview",
    "optimized prompt",
    "full prompt below",
    "prompt preview",
  ].some((phrase) => normalized.includes(phrase));
}

function getWordCount(value: string): number {
  const normalized = value.trim();

  if (!normalized) {
    return 0;
  }

  return normalized.split(/\s+/).length;
}

function buildManualAgent(toolId: string | null): RecommendationEntity | null {
  if (!toolId) {
    return null;
  }

  const matchedTool = TOOLS.find((tool) => tool.id === toolId);

  return {
    id: toolId,
    label: matchedTool?.name ?? toolId,
    source: "preset",
  };
}

function buildManualStack(stackIds: string[]): RecommendationChip[] {
  return stackIds
    .map((stackId) => STACKS.find((item) => item.id === stackId))
    .filter((item): item is (typeof STACKS)[number] => Boolean(item))
    .map((item) => ({
      id: item.id,
      label: item.name,
      category: item.category,
      source: "preset",
    }));
}

function IdeaStarterCard() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="rounded-[1.6rem] border border-slate-900/[0.08] bg-white px-5 py-5 shadow-[0_18px_40px_rgba(29,39,53,0.08)]">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-[1rem] bg-slate-900 text-white">
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Let&apos;s improve your prompt
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              Start with the brief you already thought through.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              PromptPal is here to sharpen an existing product direction into a
              stronger build prompt. Start with a concrete brief, target user,
              and outcome so the first question can refine the plan instead of
              guessing what you mean.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-3 py-1 text-[0.72rem] font-medium text-slate-700"
              >
                AI setup suggestions
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-3 py-1 text-[0.72rem] font-medium text-slate-700"
              >
                Live prompt draft
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-3 py-1 text-[0.72rem] font-medium text-slate-700"
              >
                One question at a time
              </Badge>
            </div>

            <div className="mt-5 rounded-[1.15rem] border border-slate-900/[0.08] bg-[#fbf7f1] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Lightbulb className="size-4 text-[#d07b49]" />
                Good starting message
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                &quot;I want a platform for local fitness coaches to sell
                memberships, manage recurring classes, and handle client
                waivers online. It should feel premium, work well on mobile,
                and be easy for non-technical staff to update.&quot;
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Aim for a real brief with at least 120 words.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isPromptDrawerOpen, setIsPromptDrawerOpen] = useState(false);
  const [isFullPromptOpen, setIsFullPromptOpen] = useState(false);
  const [selectedToolOverride, setSelectedToolOverride] = useState<string | null>(null);
  const [selectedStackOverride, setSelectedStackOverride] = useState<string[]>([]);
  const [detailLevel, setDetailLevel] = useState(() => {
    const initial = Number(searchParams.get("detail") || 3);
    return Math.min(5, Math.max(1, initial || 3));
  });
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  const defaultSessionState = useMemo<SessionState>(
    () => ({
      phase: "discovery",
      currentQuestion: 0,
      plannedQuestionCount: QUESTION_TARGETS[detailLevel],
      advancedOffered: false,
      advancedAccepted: false,
      awaitingChoice: false,
    }),
    [detailLevel]
  );

  const manualAgent = useMemo(
    () => buildManualAgent(selectedToolOverride),
    [selectedToolOverride]
  );
  const manualStack = useMemo(
    () => buildManualStack(selectedStackOverride),
    [selectedStackOverride]
  );
  const manualDatabase = useMemo<RecommendationEntity | null>(() => {
    const databaseItem = manualStack.find((item) => item.category === "Database");

    if (!databaseItem) {
      return null;
    }

    return {
      id: databaseItem.id,
      label: databaseItem.label,
      source: databaseItem.source,
    };
  }, [manualStack]);

  const manualSetupOverride = useMemo(() => {
    if (!manualAgent && manualStack.length === 0) {
      return undefined;
    }

    return {
      agent: manualAgent,
      database: manualDatabase,
      stack: manualStack,
    };
  }, [manualAgent, manualDatabase, manualStack]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          detailLevel,
          manualSetupOverride,
        },
      }),
    [detailLevel, manualSetupOverride]
  );

  const { messages, sendMessage, status } = useChat({
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    const container = messagesScrollRef.current;

    if (!container) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: messages.length > 2 ? "smooth" : "auto",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [messages]);

  const typedMessages = messages as HiddenBlockMessage[];
  const currentPrompt = extractPromptState(typedMessages);
  const sessionState = extractSessionState(typedMessages, defaultSessionState);
  const recommendationState = extractRecommendationState(
    typedMessages,
    EMPTY_RECOMMENDATION_STATE
  );

  const renderableMessages = messages.filter((message) => {
    if (message.role !== "assistant") {
      return true;
    }

    return stripHiddenBlocks(getMessageText(message.parts as HiddenBlockMessage["parts"])).length > 0;
  });

  const lastAssistantMessageIndex = renderableMessages.reduce((lastIndex, message, index) => {
    return message.role === "assistant" ? index : lastIndex;
  }, -1);

  const latestAssistantMessage =
    lastAssistantMessageIndex >= 0 ? renderableMessages[lastAssistantMessageIndex] : null;
  const latestAssistantText = latestAssistantMessage
    ? stripHiddenBlocks(getMessageText(latestAssistantMessage.parts as HiddenBlockMessage["parts"]))
    : "";

  const detectedQuestion = detectQuestionNumber(renderableMessages as HiddenBlockMessage[]);
  const totalQuestionCount = sessionState.plannedQuestionCount || QUESTION_TARGETS[detailLevel];
  const currentQuestion =
    latestAssistantMessage || sessionState.currentQuestion > 0
      ? Math.min(totalQuestionCount, Math.max(sessionState.currentQuestion, detectedQuestion))
      : 0;
  const reachedQuestionBudget = currentQuestion > 0 && currentQuestion >= totalQuestionCount;
  const isFinalPromptReady =
    !isLoading &&
    Boolean(currentPrompt.trim()) &&
    Boolean(latestAssistantText.trim()) &&
    reachedQuestionBudget &&
    hasFinalPromptSignal(latestAssistantText);
  const currentPhase = isFinalPromptReady ? "finalizing" : sessionState.phase;
  const hasVisibleMessages = renderableMessages.length > 0;
  const isFirstTurn = !hasVisibleMessages;
  const trimmedInput = input.trim();
  const wordCount = getWordCount(input);
  const isInitialBriefTooShort =
    isFirstTurn && wordCount > 0 && wordCount < MIN_INITIAL_BRIEF_WORDS;
  const promptPreview = currentPrompt
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");
  const effectiveAgent = manualAgent ?? recommendationState.agent;
  const effectiveDatabase = manualDatabase ?? recommendationState.database;
  const desktopContentWidthClass = isPromptDrawerOpen
    ? "max-w-[min(1240px,100%)]"
    : "max-w-[min(1480px,100%)]";

  const handleInputChange = (value: string) => {
    setInput(value);

    if (inputError) {
      setInputError(null);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!trimmedInput || isLoading) {
      return;
    }

    if (isFirstTurn && wordCount < MIN_INITIAL_BRIEF_WORDS) {
      setInputError(
        `Start with at least ${MIN_INITIAL_BRIEF_WORDS} words so PromptPal can refine a fully thought-through brief instead of filling in the gaps for you.`
      );
      return;
    }

    sendMessage({ text: trimmedInput });
    setInput("");
    setInputError(null);
  };

  const handleExport = () => {
    if (!currentPrompt) {
      return;
    }

    const blob = new Blob([currentPrompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "promptpal-production-prompt.md";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleToolSelect = (toolId: string) => {
    setSelectedToolOverride((previous) => (previous === toolId ? null : toolId));
  };

  const handleStackToggle = (stackId: string) => {
    setSelectedStackOverride((previous) =>
      previous.includes(stackId)
        ? previous.filter((item) => item !== stackId)
        : [...previous, stackId]
    );
  };

  const handleResetOverrides = () => {
    setSelectedToolOverride(null);
    setSelectedStackOverride([]);
  };

  return (
    <div className="fixed inset-0 overflow-hidden p-2 md:p-3">
      <div className="mx-auto flex h-full w-full max-w-[min(1940px,calc(100vw-1rem))] overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white/[0.72] shadow-[0_35px_90px_rgba(29,39,53,0.14)] backdrop-blur-xl md:max-w-[min(1940px,calc(100vw-1.5rem))] md:rounded-[2rem]">
        <aside className="hidden w-[clamp(320px,21vw,380px)] shrink-0 border-r border-slate-900/[0.08] bg-[#f5efe4]/[0.82] lg:flex lg:flex-col">
          <div className="border-b border-slate-900/[0.08] px-5 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
          </div>

          <ScrollArea className="min-h-0 flex-1 px-3 py-3">
            <div className="space-y-3">
              <div className="rounded-[1.2rem] border border-slate-900/[0.08] bg-white/75 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Prompt depth
                    </p>
                    <p className="mt-1 text-base font-semibold tracking-tight text-slate-900">
                      {DETAIL_LABELS[detailLevel]}
                    </p>
                  </div>
                  <div className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-3 py-1 text-xs font-semibold text-slate-700">
                    ~{QUESTION_TARGETS[detailLevel]} questions
                  </div>
                </div>

                <div className="mt-3 space-y-1.5">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={detailLevel}
                    onChange={(event) => setDetailLevel(Number(event.target.value))}
                    className="w-full accent-slate-900"
                  />
                  <div className="flex justify-between text-[0.68rem] font-medium text-slate-500">
                    <span>Broad</span>
                    <span>Detailed</span>
                  </div>
                </div>
              </div>

              <RecommendationPanel
                recommendation={recommendationState}
                manualAgent={manualAgent}
                manualDatabase={manualDatabase}
                manualStack={manualStack}
                selectedTool={selectedToolOverride}
                selectedStack={selectedStackOverride}
                onToolSelect={handleToolSelect}
                onStackToggle={handleStackToggle}
                onResetOverrides={handleResetOverrides}
              />

              <ProgressTracker
                currentQuestion={currentQuestion}
                totalQuestions={totalQuestionCount}
                phase={currentPhase}
              />
            </div>
          </ScrollArea>

          <div className="border-t border-slate-900/[0.08] px-3.5 py-3.5">
            <Button
              variant="outline"
              className="h-10 w-full rounded-full border-slate-900/10 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
              disabled={!currentPrompt}
              onClick={handleExport}
            >
              <Download className="size-4" />
              Export prompt
            </Button>
          </div>
        </aside>

        <div className="relative flex min-w-0 flex-1 overflow-hidden">
          <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white/[0.14]">
            <header className="shrink-0 border-b border-slate-900/[0.08] px-3.5 py-2 md:px-4">
              <div
                className={cn(
                  "mx-auto flex w-full items-center justify-between gap-3",
                  desktopContentWidthClass
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 lg:hidden"
                    >
                      <ArrowLeft className="size-4" />
                      Home
                    </Link>
                    <Badge className="rounded-full bg-slate-900 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white capitalize">
                      {MODEL_DISPLAY_NAME}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-slate-900/[0.08] bg-white px-3 py-1 text-[0.72rem] font-medium text-slate-700"
                    >
                      Depth {DETAIL_LABELS[detailLevel]}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-slate-900/[0.08] bg-white px-3 py-1 text-[0.72rem] font-medium text-slate-700"
                    >
                      Draft {currentPrompt ? currentPrompt.split("\n").length : 0} lines
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-slate-900/[0.08] bg-white px-3 py-1 text-[0.72rem] font-medium text-slate-700"
                    >
                      {currentQuestion > 0 ? `Q${currentQuestion}/${totalQuestionCount}` : "Intake"}
                    </Badge>
                    {effectiveAgent && (
                      <Badge
                        variant="secondary"
                        className="rounded-full border border-slate-900/[0.08] bg-white px-3 py-1 text-[0.72rem] font-medium text-slate-700"
                      >
                        Suggested {effectiveAgent.label}
                      </Badge>
                    )}
                    {effectiveDatabase && (
                      <Badge
                        variant="secondary"
                        className="rounded-full border border-slate-900/[0.08] bg-white px-3 py-1 text-[0.72rem] font-medium text-slate-700"
                      >
                        Database {effectiveDatabase.label}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-full border-slate-900/10 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => setIsPromptDrawerOpen((value) => !value)}
                  >
                    {isPromptDrawerOpen ? (
                      <PanelRightClose className="size-4" />
                    ) : (
                      <PanelRightOpen className="size-4" />
                    )}
                    {isPromptDrawerOpen ? "Hide live draft" : "View live draft"}
                  </Button>
                </div>
              </div>
            </header>

            <div className="shrink-0 border-b border-slate-900/[0.08] bg-white/40 px-3.5 py-2 md:px-4">
              <div className={cn("mx-auto w-full", desktopContentWidthClass)}>
                <div className="rounded-[1.1rem] border border-slate-900/[0.08] bg-white/78 p-3 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-slate-700" />
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                          Live draft
                        </p>
                      </div>
                      <p className="line-clamp-2 text-sm leading-6 text-slate-700">
                        {promptPreview ||
                          "Your working prompt stays live here while PromptPal studies the idea, recommends the setup, and asks the next best question."}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {isLoading ? "Updating in background" : "Background draft"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-b border-slate-900/[0.08] bg-white/30 px-3.5 py-3 md:px-4 lg:hidden">
              <div className="mx-auto w-full max-w-5xl space-y-3">
                <RecommendationPanel
                  recommendation={recommendationState}
                  manualAgent={manualAgent}
                  manualDatabase={manualDatabase}
                  manualStack={manualStack}
                  selectedTool={selectedToolOverride}
                  selectedStack={selectedStackOverride}
                  onToolSelect={handleToolSelect}
                  onStackToggle={handleStackToggle}
                  onResetOverrides={handleResetOverrides}
                />
                <ProgressTracker
                  currentQuestion={currentQuestion}
                  totalQuestions={totalQuestionCount}
                  phase={currentPhase}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden px-3.5 py-3 md:px-4 md:py-3.5">
              <div
                ref={messagesScrollRef}
                className={cn(
                  "mx-auto flex h-full w-full flex-col gap-4 overflow-y-auto pr-1",
                  desktopContentWidthClass
                )}
              >
                {!hasVisibleMessages && !isLoading && <IdeaStarterCard />}

                {renderableMessages.map((message, index) => (
                  <ChatMessage
                    key={message.id || index}
                    role={message.role as "user" | "assistant"}
                    content={getMessageText(message.parts as HiddenBlockMessage["parts"])}
                    isStreaming={
                      isLoading &&
                      index === renderableMessages.length - 1 &&
                      message.role === "assistant"
                    }
                    promptPreview={
                      isFinalPromptReady && index === lastAssistantMessageIndex
                        ? currentPrompt
                        : undefined
                    }
                    onOpenPrompt={
                      isFinalPromptReady && index === lastAssistantMessageIndex
                        ? () => setIsFullPromptOpen(true)
                        : undefined
                    }
                  />
                ))}

                {isLoading &&
                  (renderableMessages.length === 0 ||
                    renderableMessages[renderableMessages.length - 1]?.role !== "assistant") && (
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
                      <span>Adjusting your prompt</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 animate-pulse rounded-full bg-[#d07b49]" />
                        <span className="size-1.5 animate-pulse rounded-full bg-[#d07b49] [animation-delay:180ms]" />
                        <span className="size-1.5 animate-pulse rounded-full bg-[#d07b49] [animation-delay:360ms]" />
                      </span>
                    </div>
                  )}
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-900/[0.08] bg-white/60 px-3.5 py-2.5 md:px-4">
              <div className={cn("mx-auto w-full", desktopContentWidthClass)}>
                <form className="flex w-full items-end gap-3" onSubmit={handleSubmit}>
                  <div className="flex-1 rounded-[1.35rem] border border-slate-900/10 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    {isFirstTurn ? (
                      <textarea
                        value={input}
                        onChange={(event) => handleInputChange(event.target.value)}
                        placeholder="Write at least 120 words describing the product you already want to build, who it serves, the core workflow, and what success should look like..."
                        className="min-h-[180px] w-full resize-none rounded-[1.35rem] border-0 bg-transparent px-5 py-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        disabled={isLoading}
                        rows={7}
                        autoFocus
                      />
                    ) : (
                      <Input
                        type="text"
                        value={input}
                        onChange={(event) => handleInputChange(event.target.value)}
                        placeholder="Answer the current question or refine the brief..."
                        className="h-[52px] rounded-[1.35rem] border-0 bg-transparent px-5 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-0"
                        disabled={isLoading}
                        autoFocus
                      />
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="icon"
                    className={cn(
                      "size-[52px] rounded-[1.35rem] shadow-none transition-all",
                      trimmedInput && !isLoading && !isInitialBriefTooShort
                        ? "bg-slate-900 text-white hover:-translate-y-0.5 hover:bg-slate-800"
                        : "bg-slate-300 text-slate-500"
                    )}
                    disabled={isLoading || !trimmedInput || isInitialBriefTooShort}
                  >
                    <Send className="size-5" />
                  </Button>
                </form>

                {isFirstTurn && (
                  <div className="mt-2 flex items-start justify-between gap-3 px-1">
                    <p
                      className={cn(
                        "max-w-3xl text-xs leading-5",
                        inputError || isInitialBriefTooShort ? "text-rose-600" : "text-slate-500"
                      )}
                    >
                      {inputError ??
                        `Start with at least ${MIN_INITIAL_BRIEF_WORDS} words. Cover the product, who it is for, the main workflow, and the outcome so PromptPal can refine a real brief.`}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 text-xs font-semibold",
                        inputError || isInitialBriefTooShort ? "text-rose-600" : "text-slate-500"
                      )}
                    >
                      {wordCount}/{MIN_INITIAL_BRIEF_WORDS} words min
                    </span>
                  </div>
                )}
              </div>
            </div>
          </main>

          {isPromptDrawerOpen && (
            <aside className="hidden h-full w-[clamp(420px,27vw,620px)] shrink-0 border-l border-slate-900/[0.08] bg-[#f7f2e9]/95 p-4 lg:flex">
              <div className="flex min-h-0 flex-1 flex-col gap-3">
                <div className="flex items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FileText className="size-4" />
                    Live draft
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full border-slate-900/10 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      disabled={!currentPrompt}
                      onClick={handleExport}
                    >
                      <Download className="size-3.5" />
                      Export
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full text-slate-600 hover:bg-white"
                      onClick={() => setIsPromptDrawerOpen(false)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="min-h-0 flex-1">
                  <PromptPanel
                    prompt={currentPrompt}
                    isStreaming={isLoading}
                    onOpenFullPrompt={() => setIsFullPromptOpen(true)}
                  />
                </div>
              </div>
            </aside>
          )}

          {isPromptDrawerOpen && (
            <div className="absolute inset-0 z-20 bg-slate-900/[0.18] backdrop-blur-[2px] lg:hidden">
              <div
                className="absolute inset-0"
                onClick={() => setIsPromptDrawerOpen(false)}
              />
              <div className="absolute inset-y-0 right-0 flex h-full w-full max-w-[min(820px,100vw)] flex-col border-l border-slate-900/[0.08] bg-[#f7f2e9] p-4 shadow-[0_24px_60px_rgba(29,39,53,0.18)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FileText className="size-4" />
                    Live draft
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full border-slate-900/10 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      disabled={!currentPrompt}
                      onClick={handleExport}
                    >
                      <Download className="size-3.5" />
                      Export
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full text-slate-600 hover:bg-white"
                      onClick={() => setIsPromptDrawerOpen(false)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="min-h-0 flex-1">
                  <PromptPanel
                    prompt={currentPrompt}
                    isStreaming={isLoading}
                    onOpenFullPrompt={() => setIsFullPromptOpen(true)}
                  />
                </div>
              </div>
            </div>
          )}

          <PromptModal
            prompt={currentPrompt}
            isOpen={isFullPromptOpen}
            onClose={() => setIsFullPromptOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-600">
          <div className="flex items-center gap-3 rounded-full border border-slate-900/10 bg-white px-5 py-3 shadow-sm">
            <span className="size-2 animate-pulse rounded-full bg-slate-900" />
            Loading prompt session...
          </div>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
