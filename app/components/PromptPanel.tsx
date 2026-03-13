"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Copy, FileText, PanelRightOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";

interface PromptPanelProps {
  prompt: string;
  isStreaming: boolean;
  onOpenFullPrompt: () => void;
}

export default function PromptPanel({
  prompt,
  isStreaming,
  onOpenFullPrompt,
}: PromptPanelProps) {
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasPrompt = prompt.trim().length > 0;
  const promptLineCount = prompt.split("\n").length;
  const isLongPrompt = prompt.length > 3200 || promptLineCount > 70;

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [prompt]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden rounded-[1.6rem] border border-slate-900/[0.08] bg-white/90 shadow-[0_18px_40px_rgba(29,39,53,0.08)]">
      <div className="flex flex-col gap-3 border-b border-slate-900/[0.08] px-5 py-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-[0.9rem] bg-slate-900 text-white">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Live Draft
              </p>
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                Working prompt
              </h2>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end">
          <div
            className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] ${
              isStreaming ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {isStreaming ? "Updating" : "Stable"}
          </div>

          {hasPrompt && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-slate-900/10 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={handleCopy}
            >
              {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          )}

          {hasPrompt && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-slate-900/10 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={onOpenFullPrompt}
            >
              <PanelRightOpen className="size-3.5" />
              Show full prompt
            </Button>
          )}
        </div>
      </div>

      <div ref={contentRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-auto px-5 py-5">
        {hasPrompt ? (
          <div
            className={`markdown-content prompt-content max-w-none ${
              isLongPrompt ? "[mask-image:linear-gradient(180deg,#000_78%,transparent)]" : ""
            }`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{prompt}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-[1.2rem] border border-dashed border-slate-900/[0.12] bg-[#fbf7f1] px-6 py-8 text-center">
            <p className="text-base font-semibold tracking-tight text-slate-900">
              The draft appears as soon as your idea lands.
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
              Share the rough concept, then PromptPal will keep refining the
              working brief while it asks follow-up questions.
            </p>
          </div>
        )}
        {hasPrompt && isLongPrompt && (
          <div className="mt-4 rounded-[1rem] border border-slate-900/[0.08] bg-[#fbf7f1] px-4 py-3 text-sm text-slate-600">
            This draft is long. Use <span className="font-semibold text-slate-900">Show full prompt</span> for the full-width reading view.
          </div>
        )}
      </div>
    </div>
  );
}
