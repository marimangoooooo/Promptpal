"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Check, Copy, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PromptModalProps {
  prompt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PromptModal({ prompt, isOpen, onClose }: PromptModalProps) {
  const [copied, setCopied] = useState(false);

  const handleClose = useCallback(() => {
    setCopied(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose, isOpen]);

  if (!isOpen || !prompt.trim()) {
    return null;
  }

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
    <div
      className="fixed inset-0 z-[120] bg-slate-900/[0.38] p-3 backdrop-blur-sm md:p-4"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Full prompt preview"
        className="relative mx-auto flex h-[calc(100dvh-1.5rem)] w-[min(1760px,calc(100vw-1.5rem))] max-w-none flex-col overflow-hidden rounded-[1.8rem] border border-slate-900/[0.08] bg-[#fbf7f1] shadow-[0_30px_80px_rgba(29,39,53,0.22)] md:h-[calc(100dvh-2rem)] md:w-[min(1760px,calc(100vw-2rem))]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute right-4 top-4 z-10 flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-full border-slate-900/10 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            onClick={handleCopy}
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-full border-slate-900/10 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            onClick={handleClose}
          >
            <X className="size-3.5" />
            Close
          </Button>
        </div>

        <div className="shrink-0 border-b border-slate-900/[0.08] px-5 py-5 pr-36 md:px-6 md:py-6 md:pr-44">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Expanded draft
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
              Full prompt preview
            </h3>
          </div>
        </div>

        <div className="min-h-0 flex-1 px-3 pb-3 pt-3 md:px-4 md:pb-4">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.35rem] border border-slate-900/[0.08] bg-white/82">
            <div className="shrink-0 border-b border-slate-900/[0.08] px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FileText className="size-4" />
                Full prompt document
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
              <div className="min-h-full min-w-max px-5 py-5">
                <pre className="w-max min-w-full whitespace-pre font-mono text-[0.95rem] leading-8 text-slate-700">
                  {prompt}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
