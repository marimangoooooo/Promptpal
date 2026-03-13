"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  ArrowLeft,
  Download,
  FileText,
  PanelRightClose,
  PanelRightOpen,
  Send,
  X,
} from "lucide-react";
import ChatMessage from "../components/ChatMessage";
import PromptModal from "../components/PromptModal";
import ProgressTracker from "../components/ProgressTracker";
import PromptPanel from "../components/PromptPanel";
import { TOOLS } from "../components/ToolSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type SessionPhase = "discovery" | "definition" | "experience" | "delivery" | "finalizing";

interface SessionState {
  phase: SessionPhase;
  currentQuestion: number;
  plannedQuestionCount: number;
  advancedOffered: boolean;
  advancedAccepted: boolean;
  awaitingChoice: boolean;
}

const DEFAULT_SESSION_STATE: SessionState = {
  phase: "discovery",
  currentQuestion: 1,
  plannedQuestionCount: 22,
  advancedOffered: false,
  advancedAccepted: false,
  awaitingChoice: false,
};

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

function stripHiddenBlocks(content: string): string {
  return content
    .replace(/<!-- PROMPT_STATE -->[\s\S]*?<!-- \/PROMPT_STATE -->/g, "")
    .replace(/<!-- SESSION_STATE -->[\s\S]*?<!-- \/SESSION_STATE -->/g, "")
    .replace(/<!-- PROMPT_STATE -->[\s\S]*$/g, "")
    .replace(/<!-- SESSION_STATE -->[\s\S]*$/g, "")
    .trim();
}

function getMessageText(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text ?? "")
    .join("");
}

function extractPromptState(
  messages: Array<{ role: string; parts: Array<{ type: string; text?: string }> }>
): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role === "assistant") {
      const text = getMessageText(message.parts);
      const match = text.match(/<!-- PROMPT_STATE -->([\s\S]*?)<!-- \/PROMPT_STATE -->/);

      if (match) {
        return match[1].trim();
      }
    }
  }

  return "";
}

function detectQuestionNumber(
  messages: Array<{ role: string; parts: Array<{ type: string; text?: string }> }>
): number {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role === "assistant") {
      const text = stripHiddenBlocks(getMessageText(message.parts));
      const match = text.match(/(?:^|\n)\s*Q(\d+):/);

      if (match) {
        return Number.parseInt(match[1], 10);
      }
    }
  }

  return 1;
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

function extractSessionState(
  messages: Array<{ role: string; parts: Array<{ type: string; text?: string }> }>
): SessionState {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role === "assistant") {
      const text = getMessageText(message.parts);
      const match = text.match(/<!-- SESSION_STATE -->([\s\S]*?)<!-- \/SESSION_STATE -->/);

      if (match) {
        try {
          const parsed = JSON.parse(match[1].trim()) as Partial<SessionState>;
          return {
            phase: parsed.phase ?? DEFAULT_SESSION_STATE.phase,
            currentQuestion: parsed.currentQuestion ?? DEFAULT_SESSION_STATE.currentQuestion,
            plannedQuestionCount:
              parsed.plannedQuestionCount ?? DEFAULT_SESSION_STATE.plannedQuestionCount,
            advancedOffered:
              parsed.advancedOffered ?? DEFAULT_SESSION_STATE.advancedOffered,
            advancedAccepted:
              parsed.advancedAccepted ?? DEFAULT_SESSION_STATE.advancedAccepted,
            awaitingChoice: parsed.awaitingChoice ?? DEFAULT_SESSION_STATE.awaitingChoice,
          };
        } catch {
          return DEFAULT_SESSION_STATE;
        }
      }
    }
  }

  return DEFAULT_SESSION_STATE;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const tool = useMemo(() => searchParams.get("tool") || "cursor", [searchParams]);
  const stack = useMemo(
    () => searchParams.get("stack")?.split(",").filter(Boolean) || [],
    [searchParams]
  );

  const [input, setInput] = useState("");
  const [isPromptDrawerOpen, setIsPromptDrawerOpen] = useState(false);
  const [isFullPromptOpen, setIsFullPromptOpen] = useState(false);
  const [detailLevel, setDetailLevel] = useState(() => {
    const initial = Number(searchParams.get("detail") || 3);
    return Math.min(5, Math.max(1, initial || 3));
  });
  const hasAutoStartedRef = useRef(false);
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { tool, stack, detailLevel },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (hasAutoStartedRef.current) {
      return;
    }

    hasAutoStartedRef.current = true;
    sendMessage({
      text: `I'm ready to build my prompt. My target environment is "${tool}" and my tech stack includes: ${
        stack.join(", ") || "not specified yet"
      }. I want a detail level of ${detailLevel} out of 5. Let's begin!`,
    });
  }, [detailLevel, sendMessage, stack, tool]);

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

  const currentPrompt = extractPromptState(
    messages as Array<{ role: string; parts: Array<{ type: string; text?: string }> }>
  );
  const sessionState = extractSessionState(
    messages as Array<{ role: string; parts: Array<{ type: string; text?: string }> }>
  );

  const displayMessages = messages.filter(
    (message, index) =>
      !(
        index === 0 &&
        message.role === "user" &&
        getMessageText(message.parts).includes("I'm ready to build my prompt")
      )
  );

  const renderableMessages = displayMessages.filter((message) => {
    if (message.role !== "assistant") {
      return true;
    }

    return stripHiddenBlocks(getMessageText(message.parts)).length > 0;
  });
  const lastAssistantMessageIndex = renderableMessages.reduce((lastIndex, message, index) => {
    return message.role === "assistant" ? index : lastIndex;
  }, -1);
  const latestAssistantMessage =
    lastAssistantMessageIndex >= 0 ? renderableMessages[lastAssistantMessageIndex] : null;
  const latestAssistantText = latestAssistantMessage
    ? stripHiddenBlocks(getMessageText(latestAssistantMessage.parts))
    : "";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!input.trim() || isLoading) {
      return;
    }

    sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleExport = useCallback(() => {
    if (!currentPrompt) {
      return;
    }

    const blob = new Blob([currentPrompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `promptpal-${tool}-prompt.md`;
    link.click();
    URL.revokeObjectURL(url);
  }, [currentPrompt, tool]);

  const compactToolName = tool.replace(/-/g, " ");
  const selectedToolData = TOOLS.find((item) => item.id === tool) ?? null;
  const selectedToolName = selectedToolData?.name ?? compactToolName;
  const draftLineCount = currentPrompt ? currentPrompt.split("\n").length : 0;
  const targetQuestionCount = QUESTION_TARGETS[detailLevel];
  const totalQuestionCount = targetQuestionCount;
  const detectedQuestion = detectQuestionNumber(
    renderableMessages as Array<{ role: string; parts: Array<{ type: string; text?: string }> }>
  );
  const currentQuestion = Math.min(
    totalQuestionCount,
    Math.max(sessionState.currentQuestion, detectedQuestion)
  );
  const reachedQuestionBudget = currentQuestion >= totalQuestionCount;
  const isFinalPromptReady =
    !isLoading &&
    Boolean(currentPrompt.trim()) &&
    Boolean(latestAssistantText.trim()) &&
    reachedQuestionBudget &&
    hasFinalPromptSignal(latestAssistantText);
  const currentPhase = isFinalPromptReady ? "finalizing" : sessionState.phase;
  const hasVisibleMessages = renderableMessages.length > 0;
  const visibleStackBadges = stack.slice(0, 4);
  const hiddenStackCount = Math.max(0, stack.length - visibleStackBadges.length);
  const promptPreview = currentPrompt
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");

  return (
    <div className="fixed inset-0 overflow-hidden p-2 md:p-3">
      <div className="mx-auto flex h-full max-w-[1480px] overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white/[0.72] shadow-[0_35px_90px_rgba(29,39,53,0.14)] backdrop-blur-xl md:rounded-[2rem]">
        <aside className="hidden w-[248px] shrink-0 border-r border-slate-900/[0.08] bg-[#f5efe4]/[0.82] lg:flex lg:flex-col">
          <div className="border-b border-slate-900/[0.08] px-5 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="size-4" />
              Back to setup
            </Link>
          </div>

          <ScrollArea className="min-h-0 flex-1 px-3 py-3">
            <div className="space-y-3">
              <div className="rounded-[1.2rem] border border-slate-900/[0.08] bg-white/75 p-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Target environment
                </p>
                <p className="mt-1.5 text-base font-semibold capitalize tracking-tight text-slate-900">
                  {selectedToolName}
                </p>
                {stack.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {visibleStackBadges.map((item) => (
                      <Badge
                        key={item}
                        variant="secondary"
                        className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-2 py-0.5 text-[0.68rem] font-medium capitalize text-slate-700"
                      >
                        {item}
                      </Badge>
                    ))}
                    {hiddenStackCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-2 py-0.5 text-[0.68rem] font-medium text-slate-700"
                      >
                        +{hiddenStackCount} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

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
          <main className="grid min-w-0 flex-1 grid-rows-[auto_auto_minmax(0,1fr)_auto] overflow-hidden bg-white/[0.14]">
            <header className="border-b border-slate-900/[0.08] px-3.5 py-2 md:px-4">
              <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 lg:hidden"
                    >
                      <ArrowLeft className="size-4" />
                      Setup
                    </Link>
                    <Badge className="rounded-full bg-slate-900 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white capitalize">
                      {MODEL_DISPLAY_NAME}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-slate-900/[0.08] bg-white px-3 py-1 text-[0.72rem] font-medium text-slate-700"
                    >
                      Target {selectedToolName}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-slate-900/[0.08] bg-white px-3 py-1 text-[0.72rem] font-medium text-slate-700"
                    >
                      Draft {draftLineCount || 0} lines
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-slate-900/[0.08] bg-white px-3 py-1 text-[0.72rem] font-medium text-slate-700"
                    >
                      Q{currentQuestion}/{totalQuestionCount}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-3 lg:hidden">
                    <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Depth
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={detailLevel}
                      onChange={(event) => setDetailLevel(Number(event.target.value))}
                      className="w-32 accent-slate-900"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {DETAIL_LABELS[detailLevel]}
                    </span>
                  </div>
                  {stack.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 lg:hidden">
                      {stack.slice(0, 3).map((item) => (
                        <Badge
                          key={item}
                          variant="secondary"
                          className="rounded-full border border-slate-900/[0.08] bg-white px-2.5 py-1 text-[0.72rem] font-medium capitalize text-slate-700"
                        >
                          {item}
                        </Badge>
                      ))}
                      {stack.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="rounded-full border border-slate-900/[0.08] bg-white px-2.5 py-1 text-[0.72rem] font-medium text-slate-700"
                        >
                          +{stack.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
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

            <div className="border-b border-slate-900/[0.08] bg-white/40 px-3.5 py-2 md:px-4">
              <div className="mx-auto w-full max-w-5xl">
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
                          "Your working draft will appear here as soon as PromptPal starts shaping the brief."}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {isLoading ? "Updating in background" : "Background draft"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-0 overflow-hidden px-3.5 py-3 md:px-4 md:py-3.5">
              <div
                ref={messagesScrollRef}
                className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4 overflow-y-auto pr-1"
              >

                {displayMessages.length === 0 && isLoading && (
                  <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-900/[0.12] bg-white/60 px-6 text-center">
                    <div className="flex gap-2">
                      <span className="size-2 rounded-full bg-slate-900 animate-pulse" />
                      <span className="size-2 rounded-full bg-[#d07b49] animate-pulse [animation-delay:180ms]" />
                      <span className="size-2 rounded-full bg-slate-900 animate-pulse [animation-delay:360ms]" />
                    </div>
                    <p className="mt-4 text-base font-semibold tracking-tight text-slate-900">
                      Preparing your beginner-friendly interview
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                      PromptPal is using your tool and stack to shape the first
                      question and the initial draft.
                    </p>
                  </div>
                )}

                {!hasVisibleMessages && !isLoading && (
                  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-900/[0.12] bg-white/60 px-6 text-center">
                    <p className="text-base font-semibold tracking-tight text-slate-900">
                      PromptPal is preparing your first visible question.
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                      If the draft updated but no question appeared yet, send a short
                      answer about your project and the interview will continue normally.
                    </p>
                  </div>
                )}

                {renderableMessages.map((message, index) => (
                  <ChatMessage
                    key={message.id || index}
                    role={message.role as "user" | "assistant"}
                    content={getMessageText(message.parts)}
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

            <div className="border-t border-slate-900/[0.08] bg-white/60 px-3.5 py-2.5 md:px-4">
              <form className="mx-auto flex w-full max-w-5xl items-end gap-3" onSubmit={handleSubmit}>
                <div className="flex-1 rounded-[1.35rem] border border-slate-900/10 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                  <Input
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Answer the current question..."
                    className="h-[52px] rounded-[1.35rem] border-0 bg-transparent px-5 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-0"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  size="icon"
                  className={cn(
                    "size-[52px] rounded-[1.35rem] shadow-none transition-all",
                    input.trim() && !isLoading
                      ? "bg-slate-900 text-white hover:-translate-y-0.5 hover:bg-slate-800"
                      : "bg-slate-300 text-slate-500"
                  )}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="size-5" />
                </Button>
              </form>
            </div>
          </main>

          {isPromptDrawerOpen && (
            <aside className="hidden h-full w-[clamp(420px,34vw,600px)] shrink-0 border-l border-slate-900/[0.08] bg-[#f7f2e9]/95 p-4 lg:flex">
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
