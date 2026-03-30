"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopologyBackground from "./components/TopologyBackground";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    document.body.dataset.homepage = "true";

    return () => {
      delete document.body.dataset.homepage;
    };
  }, []);

  return (
    <main className="relative isolate min-h-screen overflow-x-clip">
      <TopologyBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1280px] items-center px-4 py-4 sm:px-6 lg:px-8">
        <section className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div className="min-w-0 space-y-5">
            <div className="space-y-3">
              <h1 className="display-title max-w-[7.2ch] text-[clamp(3rem,5.6vw,5.1rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-white">
                Your PromptPal.
              </h1>
              <p className="max-w-xl text-[1rem] leading-7 text-white/84 sm:text-[1.08rem]">
                Because your idea deserves better than a badly written prompt.
              </p>
              <div className="max-w-[420px] rounded-[0.9rem] border border-white/18 bg-black/74 px-3 py-2 shadow-[0_22px_60px_rgba(0,0,0,0.32)] backdrop-blur-sm sm:px-3 sm:py-2.5">
                <p className="text-[0.8rem] leading-5 text-white/78 sm:text-[0.84rem]">
                  PromptPal is an AI-powered prompt studio that refines and improves a user&apos;s initial
                  idea by asking targeted follow-up questions based on research. It also guides users
                  toward the right UI and tech stack decisions, turning a rough concept into a
                  well-defined, actionable plan.
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-[220px] items-center justify-center">
            <Button
              size="lg"
              className="h-11 w-full max-w-[220px] rounded-full border border-white/20 bg-white px-5 text-sm font-semibold text-slate-900 shadow-[0_18px_40px_rgba(255,255,255,0.16)] transition-all hover:-translate-y-0.5 hover:bg-white/95"
              onClick={() => router.push("/chat")}
            >
              Get started
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
