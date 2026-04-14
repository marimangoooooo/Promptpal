"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopologyBackground from "./components/TopologyBackground";

const demoExamples = [
  {
    label: "Social App",
    prompt: "I want to build a social media app where users can share short video clips with their friends and discover trending content.",
    refined: "Build a TikTok-style short-video social platform with user auth, video upload/compression, algorithmic feed, likes/comments, follow system, and trending discovery page. Tech: Next.js + React Native, Supabase, Cloudflare Stream.",
  },
  {
    label: "SaaS Dashboard",
    prompt: "I need a dashboard for my SaaS product that shows analytics and lets users manage their subscriptions.",
    refined: "Full-stack SaaS analytics dashboard with real-time metrics (MRR, churn, LTV), interactive charts, Stripe-integrated subscription management, role-based access, and CSV/PDF export. Tech: Next.js, Prisma, PostgreSQL, Recharts.",
  },
  {
    label: "AI Chatbot",
    prompt: "I want to create an AI chatbot that can answer questions about my company's documentation.",
    refined: "RAG-powered AI chatbot with document ingestion pipeline (PDF, Markdown, HTML), vector search via embeddings, conversational memory, citation linking, and admin panel for knowledge base management. Tech: Next.js, LangChain, Pinecone, OpenAI API.",
  },
  {
    label: "E-Commerce",
    prompt: "I want to make an online store for selling handmade jewelry with payments.",
    refined: "Artisan e-commerce platform with product catalog, image galleries, size/variant selectors, cart & checkout via Stripe, order tracking, inventory management, and SEO-optimized product pages. Tech: Next.js, Medusa.js, PostgreSQL, Cloudinary.",
  },
  {
    label: "Fitness Tracker",
    prompt: "I want an app to track my workouts and see my progress over time.",
    refined: "Personal fitness tracker with workout logging, exercise library, progress charts (weight, reps, volume), streak tracking, rest timer, and Apple Health / Google Fit sync. Tech: React Native, Supabase, D3.js, Expo.",
  },
];

export default function Home() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    document.body.dataset.homepage = "true";

    return () => {
      delete document.body.dataset.homepage;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % demoExamples.length);
        setFade(true);
      }, 400);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const current = demoExamples[activeIndex];

  return (
    <main className="relative isolate min-h-screen overflow-x-clip">
      <TopologyBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1280px] items-center px-4 py-4 sm:px-6 lg:px-8">
        <section className="grid w-full gap-10 xl:grid-cols-[minmax(0,1fr)_480px] xl:items-center">
          {/* Left side — Hero */}
          <div className="min-w-0 space-y-7">
            <h1 className="display-title max-w-[7.2ch] text-[clamp(3rem,5.6vw,5.1rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-white">
              Your PromptPal.
            </h1>
            <p className="max-w-xl text-[1rem] leading-7 text-white/84 sm:text-[1.08rem]">
              Because your idea deserves better than a badly written prompt.
            </p>
            <Button
              size="lg"
              className="h-12 w-full max-w-[220px] rounded-full border border-white/20 bg-white px-6 text-sm font-semibold text-slate-900 shadow-[0_18px_40px_rgba(255,255,255,0.16)] transition-all hover:-translate-y-0.5 hover:bg-white/95"
              onClick={() => router.push("/chat")}
            >
              Get started
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* Right side — Demo showcase */}
          <div className="flex items-center justify-center">
            <div
              className="w-full max-w-[480px] rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-md transition-opacity duration-400 ease-in-out"
              style={{ opacity: fade ? 1 : 0 }}
            >
              {/* Header */}
              <div className="mb-4 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400/60" />
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-400/60" />
                </div>
                <span className="ml-2 text-[0.7rem] font-medium tracking-wide text-white/40 uppercase">
                  {current.label}
                </span>
              </div>

              {/* User prompt */}
              <div className="mb-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <p className="mb-1 text-[0.65rem] font-semibold tracking-widest text-white/30 uppercase">
                  Your idea
                </p>
                <p className="text-[0.84rem] leading-relaxed text-white/70">
                  {current.prompt}
                </p>
              </div>

              {/* Refined output */}
              <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] px-4 py-3">
                <p className="mb-1 text-[0.65rem] font-semibold tracking-widest text-emerald-400/50 uppercase">
                  Refined by PromptPal
                </p>
                <p className="text-[0.84rem] leading-relaxed text-emerald-200/80">
                  {current.refined}
                </p>
              </div>

              {/* Dots indicator */}
              <div className="mt-4 flex justify-center gap-1.5">
                {demoExamples.map((_, i) => (
                  <span
                    key={i}
                    className="inline-block h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === activeIndex ? 18 : 6,
                      backgroundColor:
                        i === activeIndex
                          ? "rgba(255,255,255,0.6)"
                          : "rgba(255,255,255,0.15)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
