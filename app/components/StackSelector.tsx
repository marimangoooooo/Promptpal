"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StackItem {
  id: string;
  name: string;
  category: string;
  dotClass: string;
}

export const STACKS: StackItem[] = [
  { id: "nextjs", name: "Next.js", category: "Framework", dotClass: "bg-slate-900" },
  { id: "react", name: "React", category: "Framework", dotClass: "bg-cyan-500" },
  { id: "vue", name: "Vue.js", category: "Framework", dotClass: "bg-emerald-500" },
  { id: "svelte", name: "Svelte", category: "Framework", dotClass: "bg-orange-500" },
  { id: "nuxt", name: "Nuxt", category: "Framework", dotClass: "bg-green-500" },
  { id: "remix", name: "Remix", category: "Framework", dotClass: "bg-slate-700" },
  { id: "astro", name: "Astro", category: "Framework", dotClass: "bg-fuchsia-500" },
  { id: "nodejs", name: "Node.js", category: "Backend", dotClass: "bg-green-600" },
  { id: "express", name: "Express", category: "Backend", dotClass: "bg-slate-700" },
  { id: "fastapi", name: "FastAPI", category: "Backend", dotClass: "bg-teal-500" },
  { id: "django", name: "Django", category: "Backend", dotClass: "bg-lime-600" },
  { id: "flask", name: "Flask", category: "Backend", dotClass: "bg-zinc-500" },
  { id: "supabase", name: "Supabase", category: "Database", dotClass: "bg-emerald-500" },
  { id: "postgres", name: "PostgreSQL", category: "Database", dotClass: "bg-blue-500" },
  { id: "mongodb", name: "MongoDB", category: "Database", dotClass: "bg-green-500" },
  { id: "mysql", name: "MySQL", category: "Database", dotClass: "bg-sky-500" },
  { id: "prisma", name: "Prisma", category: "Database", dotClass: "bg-violet-500" },
  { id: "drizzle", name: "Drizzle", category: "Database", dotClass: "bg-lime-500" },
  { id: "firebase", name: "Firebase", category: "Database", dotClass: "bg-amber-500" },
  { id: "redis", name: "Redis", category: "Database", dotClass: "bg-red-500" },
  { id: "tailwind", name: "Tailwind CSS", category: "Styling", dotClass: "bg-sky-400" },
  { id: "shadcn", name: "shadcn/ui", category: "Styling", dotClass: "bg-slate-900" },
  { id: "mui", name: "Material UI", category: "Styling", dotClass: "bg-blue-500" },
  { id: "chakra", name: "Chakra UI", category: "Styling", dotClass: "bg-teal-400" },
  { id: "clerk", name: "Clerk", category: "Auth", dotClass: "bg-indigo-500" },
  { id: "nextauth", name: "NextAuth", category: "Auth", dotClass: "bg-purple-500" },
  { id: "auth0", name: "Auth0", category: "Auth", dotClass: "bg-orange-500" },
  { id: "docker", name: "Docker", category: "DevOps", dotClass: "bg-blue-500" },
  { id: "vercel", name: "Vercel", category: "Deploy", dotClass: "bg-slate-900" },
  { id: "aws", name: "AWS", category: "Deploy", dotClass: "bg-amber-500" },
  { id: "stripe", name: "Stripe", category: "Payments", dotClass: "bg-indigo-500" },
  { id: "typescript", name: "TypeScript", category: "Language", dotClass: "bg-blue-500" },
  { id: "python", name: "Python", category: "Language", dotClass: "bg-cyan-500" },
  { id: "graphql", name: "GraphQL", category: "API", dotClass: "bg-pink-500" },
  { id: "trpc", name: "tRPC", category: "API", dotClass: "bg-cyan-500" },
];

const CATEGORY_STYLES: Record<string, string> = {
  Framework: "bg-amber-50/80",
  Backend: "bg-emerald-50/80",
  Database: "bg-sky-50/80",
  Styling: "bg-rose-50/80",
  Auth: "bg-violet-50/80",
  DevOps: "bg-cyan-50/80",
  Deploy: "bg-orange-50/80",
  Payments: "bg-indigo-50/80",
  Language: "bg-blue-50/80",
  API: "bg-fuchsia-50/80",
};

interface StackSelectorProps {
  selected: string[];
  onToggle: (stackId: string) => void;
}

export default function StackSelector({ selected, onToggle }: StackSelectorProps) {
  const categories = Array.from(new Set(STACKS.map((stack) => stack.category)));

  return (
    <div className="grid gap-4">
      {categories.map((category) => {
        const items = STACKS.filter((stack) => stack.category === category);
        const selectedCount = items.filter((stack) => selected.includes(stack.id)).length;

        return (
          <section
            key={category}
            className={cn(
              "rounded-[1.4rem] border border-slate-900/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
              CATEGORY_STYLES[category] ?? "bg-white/70"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold tracking-tight text-slate-900">
                  {category}
                </p>
                <p className="text-xs text-slate-500">
                  {items.length} options available
                </p>
              </div>
              <div className="rounded-full border border-slate-900/10 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">
                {selectedCount} selected
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {items.map((item) => {
                const isSelected = selected.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onToggle(item.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200",
                      isSelected
                        ? "border-slate-900 bg-slate-900 text-white shadow-[0_10px_24px_rgba(29,39,53,0.18)]"
                        : "border-slate-900/10 bg-white/80 text-slate-700 hover:border-slate-900/20 hover:bg-white"
                    )}
                  >
                    <span
                      className={cn(
                        "size-2.5 rounded-full",
                        isSelected ? "bg-white" : item.dotClass
                      )}
                    />
                    <span>{item.name}</span>
                    {isSelected && <Check className="size-3.5" />}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
