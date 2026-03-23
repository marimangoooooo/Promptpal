"use client";

import React from "react";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { stripHiddenBlocks, stripSuggestedRepliesText } from "@/lib/prompt-state";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  promptPreview?: string;
  onOpenPrompt?: () => void;
  questionFocus?: string;
  sanitizeCurrentQuestion?: boolean;
}

function sanitizeQuestionForFocus(content: string, questionFocus?: string) {
  if (!questionFocus) {
    return content;
  }

  const questionCount = Array.from(content.matchAll(/(?:^|\n)\s*Q\d+:/g)).length;
  if (questionCount > 1) {
    return content;
  }

  if (questionFocus === "product_and_primary_users") {
    return content
      .replace(
        /([?!.])\s+(?:And\s+)?(?:do|does|would|should).*(?:account|accounts|registration|sign[\s-]?up|login|guest access).*$/i,
        "$1"
      )
      .replace(
        /(,\s*(?:and\s+)?(?:do|does|would|should).*(?:account|accounts|registration|sign[\s-]?up|login|guest access).*)$/i,
        ""
      )
      .trim();
  }

  if (questionFocus === "accounts_and_roles") {
    const accountStart = content.match(
      /Q\d+:\s*(?:Do|Does|Should|Will|Would|Can).*(?:account|accounts|registration|sign[\s-]?up|login|guest access)/i
    );

    if (accountStart) {
      return accountStart[0].trim();
    }
  }

  return content;
}

export default function ChatMessage({
  role,
  content,
  isStreaming = false,
  promptPreview,
  onOpenPrompt,
  questionFocus,
  sanitizeCurrentQuestion = false,
}: ChatMessageProps) {
  const cleanedContent =
    role === "assistant"
      ? stripSuggestedRepliesText(stripHiddenBlocks(content))
      : content;
  const displayContent =
    role === "assistant" && sanitizeCurrentQuestion
      ? sanitizeQuestionForFocus(cleanedContent, questionFocus)
      : cleanedContent;
  const hasPromptPreview = role === "assistant" && Boolean(promptPreview?.trim());

  if (!displayContent && role === "assistant") {
    return null;
  }

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {role === "assistant" && (
        <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-[1rem] bg-slate-900 text-white shadow-sm">
          <Bot className="size-[18px]" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[92%] rounded-[1.35rem] px-4 py-3.5 sm:max-w-[78%]",
          role === "assistant"
            ? "border border-slate-900/[0.08] bg-white text-slate-700 shadow-[0_14px_36px_rgba(29,39,53,0.06)]"
            : "bg-slate-900 text-white shadow-[0_16px_34px_rgba(29,39,53,0.16)]"
        )}
      >
        {role === "assistant" && (
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <Bot className="size-3.5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Prompt Agent
            </p>
          </div>
        )}

        {role === "assistant" ? (
          <div className="space-y-4">
            <div className="markdown-content text-sm leading-7">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
              {isStreaming && (
                <span className="mt-3 inline-flex items-center gap-2 align-middle text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <span>Researching and refining</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="size-1.5 animate-pulse rounded-full bg-[#d07b49]" />
                    <span className="size-1.5 animate-pulse rounded-full bg-[#d07b49] [animation-delay:180ms]" />
                    <span className="size-1.5 animate-pulse rounded-full bg-[#d07b49] [animation-delay:360ms]" />
                  </span>
                </span>
              )}
            </div>

            {hasPromptPreview && (
              <div className="rounded-[1.15rem] border border-slate-900/[0.08] bg-[#fbf7f1] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Prompt preview
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      Current master prompt
                    </p>
                  </div>
                  {onOpenPrompt && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full border-slate-900/10 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={onOpenPrompt}
                    >
                      See full prompt
                    </Button>
                  )}
                </div>

                <div className="mt-3 max-h-60 overflow-hidden rounded-[1rem] border border-slate-900/[0.06] bg-white/80 px-4 py-3">
                  <div className="markdown-content prompt-content max-w-none text-sm [mask-image:linear-gradient(180deg,#000_78%,transparent)]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {promptPreview}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-7 text-white">{displayContent}</p>
        )}
      </div>

    </div>
  );
}
