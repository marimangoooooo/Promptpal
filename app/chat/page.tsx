"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Download,
  FileText,
  LayoutTemplate,
  Palette,
  PanelRightClose,
  PanelRightOpen,
  Send,
  Settings2,
} from "lucide-react";
import ChatMessage from "../components/ChatMessage";
import LayoutSelector from "../components/LayoutSelector";
import PromptModal from "../components/PromptModal";
import PromptPanel from "../components/PromptPanel";
import RecommendationPanel from "../components/RecommendationPanel";
import ResearchPanel from "../components/ResearchPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { findLayoutPreset, findStackPreset, findToolPreset } from "@/lib/prompt-catalog";
import {
  EMPTY_RECOMMENDATION_STATE,
  EMPTY_RESEARCH_STATE,
  extractVisibleSuggestedReplies,
  extractPromptState,
  extractRecommendationState,
  extractResearchState,
  extractSessionState,
  getMessageText,
  HiddenBlockMessage,
  LayoutRecommendation,
  RecommendationChip,
  RecommendationEntity,
  ResearchQuestionBatchItem,
  SessionState,
  stripHiddenBlocks,
} from "@/lib/prompt-state";
import {
  FALLBACK_QUESTION_BUDGET_MAX,
  MIN_INITIAL_RESEARCH_QUESTIONS,
  QUESTION_FOCUS_SEQUENCE,
} from "@/lib/research-config";
import { cn } from "@/lib/utils";

const MODEL_DISPLAY_NAME = "xAI Grok 4.20";
const DEFAULT_RESEARCH_DEPTH = 4;

type WorkspacePage = "research" | "ui" | "config" | "prompt";
type UiStackId = "shadcn" | "daisyui" | "radix" | "mantine";
type Option = { id: string; label: string; description: string };
type DesignOption = Option & { weights: Partial<Record<UiStackId, number>> };
type StoredResearchBatch = {
  id: string;
  label: string;
  questions: ResearchQuestionBatchItem[];
  answers: Record<number, string>;
};

const LOGO_OPTIONS: Option[] = [
  { id: "top-left", label: "Top left", description: "Classic header placement." },
  { id: "centered", label: "Centered", description: "Brand-first editorial feel." },
  { id: "sidebar", label: "Sidebar header", description: "Works for dashboards." },
  { id: "floating", label: "Floating mark", description: "Minimal shell." },
];
const PRIMARY_ACTION_OPTIONS: Option[] = [
  { id: "top-right", label: "Top right CTA", description: "The main call-to-action stays visible in the header at all times." },
  { id: "hero", label: "Hero center", description: "A prominent action centered in the hero section, ideal for landing pages." },
  { id: "sticky-rail", label: "Sticky side rail", description: "A persistent side button for frequent actions like 'Add to cart' or 'Book now'." },
  { id: "card-header", label: "Card header", description: "Action button inside each content card, close to the relevant item." },
];
const FOLLOW_OPTIONS: Option[] = [
  { id: "profile-hero", label: "Profile hero", description: "On the user's profile page as a prominent follow or save button." },
  { id: "sticky-header", label: "Sticky header", description: "Follows the user on scroll so it's always accessible." },
  { id: "right-column", label: "Right column", description: "Placed in a sidebar column, visible but not dominant." },
  { id: "listing-card", label: "Listing card", description: "Attached to each item card in browse and discovery views." },
];
const NAV_OPTIONS: Option[] = [
  { id: "top-nav", label: "Top navigation", description: "Simpler shell." },
  { id: "left-rail", label: "Left rail", description: "Feature-rich app shell." },
  { id: "split-pane", label: "Split pane", description: "Operational workflow." },
  { id: "hybrid", label: "Hybrid", description: "Top nav plus contextual controls." },
];
const DESIGN_OPTIONS: DesignOption[] = [
  { id: "minimalistic", label: "Minimalistic", description: "Low-noise.", weights: { shadcn: 3, radix: 2 } },
  { id: "playful", label: "Playful", description: "Friendly and bright.", weights: { daisyui: 3, mantine: 1 } },
  { id: "cute", label: "Cute", description: "Soft and charming.", weights: { daisyui: 3, mantine: 2 } },
  { id: "premium", label: "Premium", description: "Polished and restrained.", weights: { shadcn: 2, radix: 2 } },
  { id: "editorial", label: "Editorial", description: "Content-led.", weights: { shadcn: 2, mantine: 1 } },
  { id: "bold", label: "Bold", description: "High contrast.", weights: { daisyui: 2, shadcn: 1 } },
  { id: "futuristic", label: "Futuristic", description: "System-like.", weights: { radix: 2, shadcn: 2 } },
  { id: "enterprise", label: "Enterprise", description: "Structured.", weights: { shadcn: 3, radix: 2 } },
  { id: "luxurious", label: "Luxurious", description: "Elegant.", weights: { shadcn: 2, mantine: 2 } },
  { id: "cozy", label: "Cozy", description: "Warm and approachable.", weights: { mantine: 2, daisyui: 2 } },
  { id: "data-dense", label: "Data-dense", description: "High scanning efficiency.", weights: { shadcn: 3, radix: 2 } },
  { id: "airy", label: "Airy", description: "Open spacing.", weights: { mantine: 2, shadcn: 1 } },
  { id: "accessibility-first", label: "Accessibility-first", description: "Dependable primitives.", weights: { radix: 3, shadcn: 1 } },
  { id: "conversion-focused", label: "Conversion-focused", description: "CTA clarity.", weights: { shadcn: 2, daisyui: 1 } },
  { id: "community-driven", label: "Community-driven", description: "Social loops.", weights: { daisyui: 2, mantine: 1 } },
  { id: "creator-led", label: "Creator-led", description: "Identity-forward.", weights: { mantine: 2, daisyui: 1 } },
  { id: "mobile-first", label: "Mobile-first", description: "Touch-friendly.", weights: { mantine: 2, shadcn: 1 } },
  { id: "trustworthy", label: "Trustworthy", description: "Stable and credible.", weights: { shadcn: 2, radix: 1 } },
  { id: "elegant", label: "Elegant", description: "Balanced and refined.", weights: { shadcn: 2, mantine: 1 } },
  { id: "experimental", label: "Experimental", description: "More expressive.", weights: { daisyui: 2, radix: 2 } },
];
const UI_STACK_LABELS: Record<UiStackId, string> = {
  shadcn: "shadcn/ui + Tailwind",
  daisyui: "daisyUI + Tailwind",
  radix: "Radix UI + Tailwind",
  mantine: "Mantine",
};

function detectQuestionNumber(messages: HiddenBlockMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role !== "assistant") continue;

    const matches = Array.from(
      stripHiddenBlocks(getMessageText(message.parts)).matchAll(/(?:^|\n)\s*Q(\d+):/g),
      (match) => Number.parseInt(match[1], 10)
    ).filter((value) => Number.isFinite(value));
    if (matches.length > 0) return matches[matches.length - 1];
  }

  return 0;
}

function detectAnsweredQuestionNumber(messages: HiddenBlockMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role !== "user") continue;

    const matches = Array.from(
      getMessageText(message.parts).matchAll(/(?:^|\n)\s*Q(\d+):/g),
      (match) => Number.parseInt(match[1], 10)
    ).filter((value) => Number.isFinite(value));
    if (matches.length > 0) return matches[matches.length - 1];
  }

  return 0;
}

function getReplyQuestionNumber(value: string) {
  const match = value.match(/^Q(\d+):/i);
  return match ? Number.parseInt(match[1], 10) : null;
}

function sortReplySegments(segments: string[]) {
  return [...segments].sort((left, right) => {
    const leftNumber = getReplyQuestionNumber(left);
    const rightNumber = getReplyQuestionNumber(right);

    if (leftNumber !== null && rightNumber !== null) {
      return leftNumber - rightNumber;
    }

    if (leftNumber !== null) {
      return -1;
    }

    if (rightNumber !== null) {
      return 1;
    }

    return left.localeCompare(right);
  });
}

function buildResearchBatchId(questions: ResearchQuestionBatchItem[]) {
  return questions.map((item) => `${item.number}-${item.topicId}`).join(",");
}

function buildResearchBatchLabel(questions: ResearchQuestionBatchItem[]) {
  if (questions.length === 0) return "Saved answers";
  if (questions.length === 1) return `Q${questions[0].number}`;
  return `Q${questions[0].number}-${questions[questions.length - 1].number}`;
}

function buildManualAgents(toolIds: string[]): RecommendationEntity[] {
  return toolIds.map((toolId) => {
    const matched = findToolPreset(toolId);
    return { id: toolId, label: matched?.name ?? toolId, source: "preset" as const };
  });
}

function buildManualStack(stackIds: string[]): RecommendationChip[] {
  return stackIds
    .map((stackId) => findStackPreset(stackId))
    .filter((item): item is NonNullable<ReturnType<typeof findStackPreset>> => Boolean(item))
    .map((item) => ({ id: item.id, label: item.name, category: item.category, source: "preset" }));
}

function buildManualCategoryEntity(stackIds: string[], category: string): RecommendationEntity | null {
  const matched = [...stackIds]
    .reverse()
    .map((stackId) => findStackPreset(stackId))
    .find((item) => item?.category === category);

  if (!matched) return null;
  return { id: matched.id, label: matched.name, source: "preset" };
}

function buildManualLayout(layoutId: string | null): LayoutRecommendation | null {
  if (!layoutId) return null;
  const matched = findLayoutPreset(layoutId);
  if (!matched) return null;
  return { id: matched.id, label: matched.name, summary: matched.summary, source: "preset" };
}

function inferUiStackFromText(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("shadcn")) return "shadcn" as UiStackId;
  if (normalized.includes("daisy")) return "daisyui" as UiStackId;
  if (normalized.includes("radix")) return "radix" as UiStackId;
  if (normalized.includes("mantine")) return "mantine" as UiStackId;
  return null;
}

function buildUiStackRecommendation(
  recommendation: ReturnType<typeof extractRecommendationState>,
  research: ReturnType<typeof extractResearchState>,
  selectedPreferences: string[],
  selectedLayoutId: string | null
) {
  const scores: Record<UiStackId, number> = { shadcn: 0, daisyui: 0, radix: 0, mantine: 0 };
  const reasons: string[] = [];

  recommendation.stack.forEach((item) => {
    const match = inferUiStackFromText(item.id ?? item.label);
    if (match) {
      scores[match] += 4;
      reasons.push(`Research already leaned toward ${UI_STACK_LABELS[match]}.`);
    }
  });

  research.decisions.forEach((decision) => {
    const match = inferUiStackFromText(`${decision.topic} ${decision.winner}`);
    if (match) {
      scores[match] += 3;
      reasons.push(`${decision.topic} comparison favored ${UI_STACK_LABELS[match]}.`);
    }
  });

  selectedPreferences.forEach((preferenceId) => {
    const matched = DESIGN_OPTIONS.find((item) => item.id === preferenceId);
    if (!matched) return;

    Object.entries(matched.weights).forEach(([stackId, weight]) => {
      if (weight) scores[stackId as UiStackId] += weight;
    });
  });

  if (selectedLayoutId === "saas-command-center" || selectedLayoutId === "operator-workspace") {
    scores.shadcn += 2;
    scores.radix += 2;
    reasons.push("The selected layout wants structured components and strong interaction primitives.");
  }

  if (selectedLayoutId === "conversion-funnel") {
    scores.shadcn += 2;
    scores.daisyui += 1;
    reasons.push("The selected layout is CTA-heavy and benefits from sharper conversion surfaces.");
  }

  if (selectedLayoutId === "premium-marketplace") {
    scores.mantine += 2;
    scores.shadcn += 1;
    reasons.push("The selected layout benefits from polished browse surfaces and rich cards.");
  }

  if (Object.values(scores).every((score) => score === 0)) {
    scores.shadcn = 2;
    scores.radix = 1;
    reasons.push("No hard UI signal is locked yet, so the safest default stays clean and production-oriented.");
  }

  const sorted = (Object.entries(scores) as Array<[UiStackId, number]>)
    .sort((left, right) => right[1] - left[1])
    .map(([stackId]) => stackId);

  return { primary: sorted[0], alternatives: sorted.slice(1, 3), reasons: Array.from(new Set(reasons)).slice(0, 3) };
}

function ChoiceGroup({
  title,
  description,
  options,
  selected,
  onSelect,
}: {
  title: string;
  description: string;
  options: Option[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <section className="rounded-[1.25rem] border border-slate-900/[0.08] bg-white p-4">
      <p className="text-sm font-semibold tracking-tight text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selected === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={cn(
                "rounded-[1rem] border px-4 py-3 text-left transition-all",
                isSelected
                  ? "border-slate-900 bg-slate-900 text-white shadow-[0_18px_40px_rgba(29,39,53,0.16)]"
                  : "border-slate-900/[0.08] bg-[#fbf7f1] text-slate-800 hover:-translate-y-0.5 hover:border-slate-900/[0.16]"
              )}
            >
              <p className="text-sm font-semibold tracking-tight">{option.label}</p>
              <p className={cn("mt-1 text-sm leading-6", isSelected ? "text-white/82" : "text-slate-600")}>
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PreferenceGrid({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <section className="rounded-[1.25rem] border border-slate-900/[0.08] bg-white p-4">
      <p className="text-sm font-semibold tracking-tight text-slate-900">Design preferences</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Pick the traits that should influence the UI recommendation.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {DESIGN_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              className={cn(
                "rounded-[1rem] border px-4 py-3 text-left transition-all",
                isSelected
                  ? "border-slate-900 bg-slate-900 text-white shadow-[0_18px_40px_rgba(29,39,53,0.16)]"
                  : "border-slate-900/[0.08] bg-[#fbf7f1] text-slate-800 hover:-translate-y-0.5 hover:border-slate-900/[0.16]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold tracking-tight">{option.label}</p>
                  <p className={cn("mt-1 text-sm leading-6", isSelected ? "text-white/82" : "text-slate-600")}>
                    {option.description}
                  </p>
                </div>
                <div
                  className={cn(
                    "mt-0.5 flex size-6 items-center justify-center rounded-full border text-xs font-semibold",
                    isSelected
                      ? "border-white/20 bg-white/12 text-white"
                      : "border-slate-900/10 bg-white text-transparent"
                  )}
                >
                  {isSelected ? "✓" : ""}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ChatContent() {
  const [activePage, setActivePage] = useState<WorkspacePage>("research");
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isPromptDrawerOpen, setIsPromptDrawerOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(true);
  const [selectedToolOverride, setSelectedToolOverride] = useState<string[]>([]);
  const [selectedStackOverride, setSelectedStackOverride] = useState<string[]>([]);
  const [selectedLayoutOverride, setSelectedLayoutOverride] = useState<string | null>(null);
  const [logoPlacement, setLogoPlacement] = useState<string | null>(null);
  const [primaryActionPlacement, setPrimaryActionPlacement] = useState<string | null>(null);
  const [followButtonPlacement, setFollowButtonPlacement] = useState<string | null>(null);
  const [navigationStyle, setNavigationStyle] = useState<string | null>(null);
  const [selectedDesignPreferences, setSelectedDesignPreferences] = useState<string[]>([]);
  const [uiDirectionCommitted, setUiDirectionCommitted] = useState(false);
  const [configurationCommitted, setConfigurationCommitted] = useState(false);
  const [uiStep, setUiStep] = useState<"layout" | "details">("layout");
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [batchAnswers, setBatchAnswers] = useState<Record<number, string>>({});
  const [storedResearchBatches, setStoredResearchBatches] = useState<StoredResearchBatch[]>([]);
  const [selectedResearchBatchId, setSelectedResearchBatchId] = useState<string | null>(null);
  const [editingResearchQuestionNumber, setEditingResearchQuestionNumber] = useState<number | null>(null);
  const [editingResearchDraft, setEditingResearchDraft] = useState("");
  const [researchEditError, setResearchEditError] = useState<string | null>(null);
  const [activeBatchKey, setActiveBatchKey] = useState("");
  const [pendingResearchQuestionNumber, setPendingResearchQuestionNumber] = useState<number | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultSessionState: SessionState = useMemo(
    () => ({
      phase: "intake",
      currentQuestion: 0,
      plannedQuestionCount: FALLBACK_QUESTION_BUDGET_MAX,
      questionBudgetMax: FALLBACK_QUESTION_BUDGET_MAX,
      researchComplete: false,
      readyForUiPage: false,
      readyForConfigPage: false,
      readyForFinalPrompt: false,
      questionFocus: "",
      coveredAreas: [],
      suggestedReplies: [],
      questionBatch: [],
      allowCustomReply: true,
    }),
    []
  );

  const manualAgents = useMemo(() => buildManualAgents(selectedToolOverride), [selectedToolOverride]);
  const manualAgent = manualAgents[0] ?? null;
  const manualStack = useMemo(() => buildManualStack(selectedStackOverride), [selectedStackOverride]);
  const manualDatabase = useMemo(() => buildManualCategoryEntity(selectedStackOverride, "Database"), [selectedStackOverride]);
  const manualHosting = useMemo(() => buildManualCategoryEntity(selectedStackOverride, "Hosting"), [selectedStackOverride]);
  const manualLayout = useMemo(() => buildManualLayout(selectedLayoutOverride), [selectedLayoutOverride]);

  const manualSetupOverride = useMemo(() => {
    if (!manualAgent && !manualDatabase && !manualHosting && manualStack.length === 0 && !manualLayout) return undefined;
    return { agent: manualAgent, agents: manualAgents, database: manualDatabase, hosting: manualHosting, stack: manualStack, layout: manualLayout };
  }, [manualAgent, manualAgents, manualDatabase, manualHosting, manualLayout, manualStack]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { researchDepth: DEFAULT_RESEARCH_DEPTH, manualSetupOverride, workspaceStage: activePage },
      }),
    [activePage, manualSetupOverride]
  );

  const { messages, sendMessage, status } = useChat({ transport });
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    const container = messagesScrollRef.current;
    if (!container) return;
    const frame = window.requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: messages.length > 2 ? "smooth" : "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isLoading, isWorkspaceExpanded, messages]);

  useEffect(() => {
    if (storedResearchBatches.length === 0) {
      setSelectedResearchBatchId(null);
      setEditingResearchQuestionNumber(null);
      setEditingResearchDraft("");
      setResearchEditError(null);
      return;
    }

    if (
      !selectedResearchBatchId ||
      !storedResearchBatches.some((batch) => batch.id === selectedResearchBatchId)
    ) {
      setSelectedResearchBatchId(storedResearchBatches[storedResearchBatches.length - 1].id);
    }
  }, [selectedResearchBatchId, storedResearchBatches]);

  const typedMessages = messages as HiddenBlockMessage[];
  const currentPrompt = extractPromptState(typedMessages);
  const researchState = extractResearchState(typedMessages, EMPTY_RESEARCH_STATE);
  const sessionState = extractSessionState(typedMessages, defaultSessionState);
  const recommendationState = extractRecommendationState(typedMessages, EMPTY_RECOMMENDATION_STATE);

  const renderableMessages = messages.filter((message) => {
    if (message.role !== "assistant") return true;
    return stripHiddenBlocks(getMessageText(message.parts as HiddenBlockMessage["parts"])).length > 0;
  });

  const latestAssistantMessage = [...renderableMessages].reverse().find((message) => message.role === "assistant");
  const latestAssistantVisibleText =
    latestAssistantMessage?.role === "assistant"
      ? stripHiddenBlocks(getMessageText(latestAssistantMessage.parts as HiddenBlockMessage["parts"]))
      : "";
  const hasVisibleMessages = renderableMessages.length > 0;
  const isFirstTurn = !hasVisibleMessages;
  const detectedQuestion = detectQuestionNumber(renderableMessages as HiddenBlockMessage[]);
  const answeredQuestion = detectAnsweredQuestionNumber(renderableMessages as HiddenBlockMessage[]);
  const questionBudgetMax = sessionState.questionBudgetMax || FALLBACK_QUESTION_BUDGET_MAX;
  const plannedQuestionCount = sessionState.plannedQuestionCount || questionBudgetMax;
  const currentQuestion =
    latestAssistantMessage || sessionState.currentQuestion > 0
      ? Math.min(
          plannedQuestionCount,
          Math.max(sessionState.currentQuestion, detectedQuestion, answeredQuestion)
        )
      : 0;
  const questionBatch = sessionState.questionBatch
    .filter((item) => item.question.trim().length > 0)
    .sort((left, right) => left.number - right.number);

  const batchKey = questionBatch.map((item) => `${item.number}-${item.topicId}`).join(",");
  const hasFreshBatch = Boolean(batchKey) && batchKey !== activeBatchKey;

  const isInBatchMode = questionBatch.length > 1 && !isLoading;
  const resolvedBatchIndex = hasFreshBatch ? 0 : currentBatchIndex;
  const resolvedBatchAnswers = hasFreshBatch ? {} : batchAnswers;
  const currentBatchQuestion = isInBatchMode ? questionBatch[resolvedBatchIndex] : null;
  const displayedQuestionNumber =
    isLoading && pendingResearchQuestionNumber !== null
      ? pendingResearchQuestionNumber
      : currentBatchQuestion?.number ?? currentQuestion;
  const displayedQuestionLabel =
    displayedQuestionNumber > 0 ? `Q${displayedQuestionNumber}/${plannedQuestionCount}` : `Up to ${questionBudgetMax} questions`;

  const hasStartedResearchInterview =
    currentQuestion > 0 || detectedQuestion > 0 || questionBatch.length > 0;
  const hasUiTransitionCue = latestAssistantVisibleText.includes("Okay, I understood. Let's go to the UI next.");
  const coveredFocusCount = new Set(sessionState.coveredAreas).size;
  const hasResearchCompletionFallback =
    !isLoading &&
    latestAssistantVisibleText.trim().length > 0 &&
    questionBatch.length === 0 &&
    answeredQuestion >= Math.min(MIN_INITIAL_RESEARCH_QUESTIONS, plannedQuestionCount) &&
    coveredFocusCount >= Math.max(5, QUESTION_FOCUS_SEQUENCE.length - 1);
  const trimmedInput = input.trim();

  const canOpenUiPage =
    (sessionState.readyForUiPage ||
      sessionState.readyForConfigPage ||
      sessionState.readyForFinalPrompt ||
      sessionState.researchComplete ||
      hasUiTransitionCue ||
      hasResearchCompletionFallback) &&
    (hasStartedResearchInterview || sessionState.researchComplete);
  const isResearchReadyForUi = !isLoading && questionBatch.length === 0 && canOpenUiPage;
  const hasUiSelections =
    Boolean(selectedLayoutOverride) ||
    Boolean(logoPlacement) ||
    Boolean(primaryActionPlacement) ||
    Boolean(followButtonPlacement) ||
    Boolean(navigationStyle) ||
    selectedDesignPreferences.length > 0;
  const canOpenConfigPage =
    sessionState.readyForConfigPage ||
    sessionState.readyForFinalPrompt ||
    uiDirectionCommitted ||
    (canOpenUiPage && hasUiSelections);
  const canOpenPromptPage =
    Boolean(currentPrompt.trim()) &&
    (sessionState.readyForFinalPrompt || configurationCommitted || canOpenConfigPage);

  const chosenLayout = manualLayout ?? recommendationState.layouts[0] ?? null;
  const effectiveAgent = manualAgent ?? recommendationState.agent;
  const effectiveDatabase = manualDatabase ?? recommendationState.database;
  const effectiveHosting = manualHosting ?? recommendationState.hosting;
  const uiStackRecommendation = useMemo(
    () =>
      buildUiStackRecommendation(
        recommendationState,
        researchState,
        selectedDesignPreferences,
        selectedLayoutOverride ?? chosenLayout?.id ?? null
      ),
    [chosenLayout?.id, recommendationState, researchState, selectedDesignPreferences, selectedLayoutOverride]
  );
  const promptLineCount = currentPrompt.trim() ? currentPrompt.split("\n").length : 0;
  const promptPreview = currentPrompt.trim()
    ? currentPrompt.split("\n").slice(0, 18).join("\n")
    : "";
  const hasPromptPreviewOverflow = currentPrompt.trim() && currentPrompt !== promptPreview;
  const suggestedReplies = sessionState.suggestedReplies.slice(0, 5);
  const fallbackSuggestedReplies =
    latestAssistantMessage?.role === "assistant"
      ? extractVisibleSuggestedReplies(
          getMessageText(latestAssistantMessage.parts as HiddenBlockMessage["parts"])
        )
      : [];
  const visibleSuggestedReplies =
    suggestedReplies.length > 0 ? suggestedReplies : fallbackSuggestedReplies;

  const resolvedActivePage: WorkspacePage =
    activePage === "prompt" && !canOpenPromptPage
      ? canOpenConfigPage
        ? "config"
        : canOpenUiPage
          ? "ui"
          : "research"
      : activePage === "config" && !canOpenConfigPage
        ? canOpenUiPage
          ? "ui"
          : "research"
      : activePage === "ui" && !canOpenUiPage
          ? "research"
          : activePage;
  const selectedResearchBatch =
    storedResearchBatches.find((batch) => batch.id === selectedResearchBatchId) ??
    storedResearchBatches[storedResearchBatches.length - 1] ??
    null;
  const editingResearchQuestion =
    selectedResearchBatch?.questions.find((item) => item.number === editingResearchQuestionNumber) ??
    null;
  const canReviewResearchAnswers =
    resolvedActivePage === "research" &&
    questionBatch.length === 0 &&
    storedResearchBatches.length > 0;

  useEffect(() => {
    if (resolvedActivePage === "research") {
      setIsWorkspaceExpanded(true);
      return;
    }

    setIsWorkspaceExpanded(false);
  }, [resolvedActivePage]);

  const useMultilineInput = isFirstTurn || (resolvedActivePage === "research" && questionBatch.length > 1);
  const suggestedReplyGroups =
    isInBatchMode && currentBatchQuestion
      ? [
          {
            key: `question-${currentBatchQuestion.number}`,
            question: currentBatchQuestion.question,
            replies: currentBatchQuestion.suggestedReplies.slice(0, 5).map((reply) => ({
              key: `question-${currentBatchQuestion.number}-${reply}`,
              label: reply,
              value: reply,
            })),
          },
        ]
      : questionBatch.length === 1
        ? [
            {
              key: `question-${questionBatch[0].number}`,
              question: questionBatch[0].question,
              replies: questionBatch[0].suggestedReplies.slice(0, 5).map((reply) => ({
                key: `question-${questionBatch[0].number}-${reply}`,
                label: reply,
                value: reply,
              })),
            },
          ]
        : visibleSuggestedReplies.length > 0
          ? [
              {
                key: "fallback",
                question: "",
                replies: visibleSuggestedReplies.map((reply) => ({
                  key: reply,
                  label: reply,
                  value: reply,
                })),
              },
            ]
          : [];

  const path = [
    {
      key: "idea",
      label: "Your Idea",
      helper: hasVisibleMessages ? "Brief captured" : "Start here",
      page: "research" as const,
      enabled: true,
      active: !hasVisibleMessages,
      complete: hasVisibleMessages,
    },
    {
      key: "research",
      label: "Research Agent",
      helper: canOpenUiPage ? "Enough context gathered" : hasVisibleMessages ? "Clarifying what matters" : "Waiting for your brief",
      page: "research" as const,
      enabled: hasVisibleMessages,
      active: hasVisibleMessages && !canOpenUiPage && resolvedActivePage === "research",
      complete: canOpenUiPage,
    },
    {
      key: "ui",
      label: "UI Agent",
      helper: chosenLayout ? chosenLayout.label : canOpenUiPage ? "Shape the interface" : "Unlocks after research",
      page: "ui" as const,
      enabled: canOpenUiPage,
      active: resolvedActivePage === "ui",
      complete: canOpenConfigPage,
    },
    {
      key: "config",
      label: "Configuration",
      helper: effectiveAgent?.label ?? (canOpenConfigPage ? "Lock the build path" : "Unlocks after UI"),
      page: "config" as const,
      enabled: canOpenConfigPage,
      active: resolvedActivePage === "config",
      complete: canOpenPromptPage,
    },
    {
      key: "prompt",
      label: "Your Prompt",
      helper: sessionState.readyForFinalPrompt ? "Ready to export" : canOpenPromptPage ? "Draft available" : "Building in the background",
      page: "prompt" as const,
      enabled: canOpenPromptPage,
      active: resolvedActivePage === "prompt",
      complete: sessionState.readyForFinalPrompt,
    },
  ];

  const upsertStoredResearchBatch = (
    questions: ResearchQuestionBatchItem[],
    answers: Record<number, string>
  ) => {
    if (questions.length === 0) return;

    const id = buildResearchBatchId(questions);
    const snapshot: StoredResearchBatch = {
      id,
      label: buildResearchBatchLabel(questions),
      questions,
      answers,
    };

    setStoredResearchBatches((previous) => {
      const existingIndex = previous.findIndex((item) => item.id === id);
      if (existingIndex === -1) {
        return [...previous, snapshot];
      }

      return previous.map((item, index) => (index === existingIndex ? snapshot : item));
    });
    setSelectedResearchBatchId(id);
  };

  const buildStoredResearchBatchesForSubmit = () => {
    if (!selectedResearchBatch || !editingResearchQuestion) {
      return storedResearchBatches;
    }

    const normalizedDraft = editingResearchDraft.trim();
    if (!normalizedDraft) {
      return storedResearchBatches;
    }

    return storedResearchBatches.map((batch) =>
      batch.id === selectedResearchBatch.id
        ? {
            ...batch,
            answers: {
              ...batch.answers,
              [editingResearchQuestion.number]: normalizedDraft,
            },
          }
        : batch
    );
  };

  const compileStoredResearchAnswers = (batches: StoredResearchBatch[]) => {
    const orderedAnswers = new Map<number, string>();

    batches.forEach((batch) => {
      batch.questions
        .slice()
        .sort((left, right) => left.number - right.number)
        .forEach((question) => {
          orderedAnswers.set(question.number, batch.answers[question.number] || "(skipped)");
        });
    });

    return [...orderedAnswers.entries()]
      .sort((left, right) => left[0] - right[0])
      .map(([number, answer]) => `Q${number}: ${answer}`)
      .join("\n");
  };

  const handleResearchBatchSelect = (batchId: string) => {
    setSelectedResearchBatchId(batchId);
    setEditingResearchQuestionNumber(null);
    setEditingResearchDraft("");
    setResearchEditError(null);
  };

  const handleStartResearchAnswerEdit = (question: ResearchQuestionBatchItem) => {
    if (!selectedResearchBatch) return;
    setEditingResearchQuestionNumber(question.number);
    setEditingResearchDraft(selectedResearchBatch.answers[question.number] ?? "");
    setResearchEditError(null);
  };

  const handleSaveResearchAnswerEdit = () => {
    if (!selectedResearchBatch || !editingResearchQuestion) return;

    const normalizedDraft = editingResearchDraft.trim();
    if (!normalizedDraft) {
      setResearchEditError("Add an updated answer before saving.");
      return;
    }

    setStoredResearchBatches((previous) =>
      previous.map((batch) =>
        batch.id === selectedResearchBatch.id
          ? {
              ...batch,
              answers: {
                ...batch.answers,
                [editingResearchQuestion.number]: normalizedDraft,
              },
            }
          : batch
      )
    );
    setEditingResearchQuestionNumber(null);
    setEditingResearchDraft("");
    setResearchEditError(null);
  };

  const handleApplyResearchChanges = () => {
    if (isLoading || storedResearchBatches.length === 0) return;

    if (editingResearchQuestion && !editingResearchDraft.trim()) {
      setResearchEditError("Add an updated answer before applying the research changes.");
      return;
    }

    const batchesToSubmit = buildStoredResearchBatchesForSubmit();
    const compiledAnswers = compileStoredResearchAnswers(batchesToSubmit);
    if (!compiledAnswers.trim()) return;

    setStoredResearchBatches(batchesToSubmit);
    setUiDirectionCommitted(false);
    setConfigurationCommitted(false);
    setPendingResearchQuestionNumber(
      Math.max(
        0,
        ...batchesToSubmit.flatMap((batch) => batch.questions.map((question) => question.number))
      )
    );
    setEditingResearchQuestionNumber(null);
    setEditingResearchDraft("");
    setResearchEditError(null);
    setActivePage("research");
    sendMessage({ text: compiledAnswers });
  };

  const submitBatchAnswer = (answerText: string) => {
    if (!currentBatchQuestion) return;

    if (batchKey) {
      setActiveBatchKey(batchKey);
    }

    const questionNumber = currentBatchQuestion.number;
    const replyText = answerText.replace(/^Q\d+:\s*/i, "").trim();
    if (!replyText) return;

    const newAnswers = { ...resolvedBatchAnswers, [questionNumber]: replyText };
    setBatchAnswers(newAnswers);
    setInput("");
    setInputError(null);

    if (resolvedBatchIndex < questionBatch.length - 1) {
      setCurrentBatchIndex(resolvedBatchIndex + 1);
      setPendingResearchQuestionNumber(null);
      return;
    }

    const allAnswers = questionBatch
      .map((q) => {
        const answer = q.number === questionNumber ? replyText : newAnswers[q.number];
        return `Q${q.number}: ${answer || "(skipped)"}`;
      })
      .join("\n");

    upsertStoredResearchBatch(questionBatch, newAnswers);
    setPendingResearchQuestionNumber(questionNumber);
    sendMessage({ text: allAnswers });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!trimmedInput || isLoading) return;

    if (isInBatchMode && currentBatchQuestion) {
      submitBatchAnswer(trimmedInput);
      return;
    }

    if (resolvedActivePage === "research" && currentQuestion > 0) {
      setPendingResearchQuestionNumber(currentQuestion);
    } else {
      setPendingResearchQuestionNumber(null);
    }

    sendMessage({ text: trimmedInput });
    setInput("");
    setInputError(null);
  };

  const handleSuggestedReply = (value: string) => {
    if (!value.trim() || isLoading) return;

    // In batch mode: store answer locally and advance to next question
    if (isInBatchMode && currentBatchQuestion) {
      submitBatchAnswer(value);
      return;

      if (batchKey) {
        setActiveBatchKey(batchKey);
      }

      const questionNumber = currentBatchQuestion!.number;
      const replyText = value.replace(/^Q\d+:\s*/, ""); // Strip Q prefix if present
      const newAnswers = { ...resolvedBatchAnswers, [questionNumber]: replyText };
      setBatchAnswers(newAnswers);

      if (resolvedBatchIndex < questionBatch.length - 1) {
        // More questions to go — advance locally
        setCurrentBatchIndex(resolvedBatchIndex + 1);
      } else {
        // Last question answered — compile all answers and send
        const allAnswers = questionBatch
          .map((q) => {
            const answer = q.number === questionNumber ? replyText : newAnswers[q.number];
            return `Q${q.number}: ${answer || "(skipped)"}`;
          })
          .join("\n");
        sendMessage({ text: allAnswers });
        setInput("");
        setInputError(null);
      }
      return;
    }

    // Non-batch mode: original behavior
    const segments = input
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    const hasValue = segments.includes(value);
    const replyQuestionNumber = getReplyQuestionNumber(value);
    const nextSegments = hasValue
      ? segments.filter((item) => item !== value)
      : replyQuestionNumber !== null
        ? [
            ...segments.filter((item) => getReplyQuestionNumber(item) !== replyQuestionNumber),
            value,
          ]
        : [...segments, value];

    setInput(sortReplySegments(nextSegments).join("\n"));
    setInputError(null);
  };

  const focusCustomReply = () => {
    const target = textareaRef.current ?? inputRef.current;
    target?.focus();
  };

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();

    const form = event.currentTarget.form;
    form?.requestSubmit();
  };

  const isSuggestedReplySelected = (value: string) =>
    input
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .includes(value);

  const handleExport = () => {
    if (!currentPrompt) return;
    const blob = new Blob([currentPrompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "promptpal-build-prompt.md";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenPromptModal = () => {
    if (!currentPrompt.trim()) return;
    setIsPromptModalOpen(true);
  };

  const handleToolSelect = (toolId: string) => {
    setSelectedToolOverride((previous) =>
      previous.includes(toolId) ? previous.filter((item) => item !== toolId) : [...previous, toolId]
    );
  };

  const handleStackToggle = (stackId: string) => {
    setSelectedStackOverride((previous) =>
      previous.includes(stackId) ? previous.filter((item) => item !== stackId) : [...previous, stackId]
    );
  };

  const handleLayoutSelect = (layoutId: string) => {
    setSelectedLayoutOverride((previous) => (previous === layoutId ? null : layoutId));
  };

  const handleTogglePreference = (preferenceId: string) => {
    setSelectedDesignPreferences((previous) =>
      previous.includes(preferenceId) ? previous.filter((item) => item !== preferenceId) : [...previous, preferenceId]
    );
  };

  const handleResetOverrides = () => {
    setSelectedToolOverride([]);
    setSelectedStackOverride([]);
  };

  const handleApplyUiDirection = () => {
    if (!hasVisibleMessages || isLoading) return;
    const lines = ["Lock this UI direction into the master build prompt:"];

    if (chosenLayout) lines.push(`- Layout: ${chosenLayout.label} - ${chosenLayout.summary}`);
    if (logoPlacement) lines.push(`- Logo placement: ${LOGO_OPTIONS.find((item) => item.id === logoPlacement)?.label ?? logoPlacement}`);
    if (primaryActionPlacement) lines.push(`- Primary action: ${PRIMARY_ACTION_OPTIONS.find((item) => item.id === primaryActionPlacement)?.label ?? primaryActionPlacement}`);
    if (followButtonPlacement) lines.push(`- Follow or save action: ${FOLLOW_OPTIONS.find((item) => item.id === followButtonPlacement)?.label ?? followButtonPlacement}`);
    if (navigationStyle) lines.push(`- Navigation: ${NAV_OPTIONS.find((item) => item.id === navigationStyle)?.label ?? navigationStyle}`);
    if (selectedDesignPreferences.length > 0) {
      lines.push(`- Design preferences: ${selectedDesignPreferences.map((item) => DESIGN_OPTIONS.find((option) => option.id === item)?.label ?? item).join(", ")}`);
    }
    lines.push(`- Recommended UI stack: ${UI_STACK_LABELS[uiStackRecommendation.primary]}`);
    sendMessage({ text: lines.join("\n") });
    setUiDirectionCommitted(true);
  };

  const handleApplyConfiguration = () => {
    if (!hasVisibleMessages || isLoading) return;
    const lines = ["Lock this implementation configuration into the master build prompt:"];

    if (manualAgents.length > 0) {
      lines.push(`- Build agents: ${manualAgents.map((item) => item.label).join(", ")}`);
    } else if (effectiveAgent) {
      lines.push(`- Build agent: ${effectiveAgent.label}`);
    }
    if (effectiveDatabase) lines.push(`- Database: ${effectiveDatabase.label}`);
    if (effectiveHosting) lines.push(`- Hosting: ${effectiveHosting.label}`);
    if (manualStack.length > 0) {
      lines.push(`- Supporting technologies: ${manualStack.map((item) => item.label).join(", ")}`);
    } else if (recommendationState.stack.length > 0) {
      lines.push(`- Keep the researched stack direction: ${recommendationState.stack.map((item) => item.label).join(", ")}`);
    }

    sendMessage({ text: lines.join("\n") });
    setConfigurationCommitted(true);
  };

  const placeholder = isFirstTurn
    ? "Describe the product idea, who it serves, the main workflow, and the outcome you want..."
    : resolvedActivePage === "research" && questionBatch.length > 1
      ? "Answer the current research question. Use a suggestion or type your own answer."
      : resolvedActivePage === "research" && canOpenUiPage
        ? "Revise any research decision or sharpen the brief before moving forward..."
      : resolvedActivePage === "ui"
      ? "Tell PromptPal what UI direction should be locked into the prompt..."
      : resolvedActivePage === "config"
        ? "Tighten frontend, backend, database, hosting, and tooling choices..."
        : resolvedActivePage === "prompt"
          ? "Request one final prompt change..."
          : "Answer the current question or sharpen the brief...";
  const useWorkspaceScroll = resolvedActivePage !== "research";

  return (
    <div className="h-[100dvh] overflow-hidden px-3 py-3 md:px-4 md:py-4">
      <div className="mx-auto flex h-full max-w-[1920px] flex-col overflow-hidden rounded-[2rem] border border-slate-900/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,240,229,0.92))] shadow-[0_28px_80px_rgba(29,39,53,0.08)] xl:flex-row">
        <aside className="w-full shrink-0 overflow-y-auto border-b border-slate-900/[0.08] bg-[linear-gradient(180deg,rgba(250,244,235,0.92),rgba(255,255,255,0.82))] p-4 sm:p-5 xl:w-[350px] xl:border-b-0 xl:border-r">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>

          <div className="mt-4 space-y-4">
            <div className="rounded-[1.6rem] border border-slate-900/[0.08] bg-white/85 p-4 shadow-[0_18px_40px_rgba(29,39,53,0.06)]">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Agentic build path
              </p>
              <div className="mt-4 space-y-3">
                {path.map((step, index) => {
                  const isClickable = step.page === "research" || step.enabled;
                  const StepIcon = step.complete ? CheckCircle2 : Circle;

                  return (
                    <button
                      key={step.key}
                      type="button"
                      disabled={!isClickable}
                      onClick={() => setActivePage(step.page)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-[1.15rem] border px-4 py-3 text-left transition-all",
                        step.active
                          ? "border-slate-900 bg-slate-900 text-white shadow-[0_18px_40px_rgba(29,39,53,0.14)]"
                          : step.complete
                            ? "border-emerald-200 bg-emerald-50 text-slate-900"
                            : isClickable
                              ? "border-slate-900/[0.08] bg-white text-slate-800 hover:-translate-y-0.5"
                              : "border-slate-900/[0.06] bg-white text-slate-400"
                      )}
                    >
                      <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", step.active ? "bg-white/12" : step.complete ? "bg-white" : "bg-[#fbf7f1]")}>
                        {step.active ? (
                          <div className="size-3 rounded-full bg-white" />
                        ) : (
                          <StepIcon className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold tracking-tight">
                          {index + 1}. {step.label}
                        </p>
                        <p className={cn("mt-1 text-sm leading-6", step.active ? "text-white/82" : "text-current/85")}>
                          {step.helper}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button variant="outline" className="h-11 w-full rounded-full border-slate-900/10 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50" disabled={!currentPrompt} onClick={handleExport}>
              <Download className="size-4" />
              Export prompt
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden p-4 sm:p-5">
          <div className="flex h-full gap-4">
            <div
              className={cn(
                "min-w-0 flex flex-1 flex-col gap-4",
                useWorkspaceScroll ? "overflow-y-auto pr-1" : "overflow-hidden"
              )}
            >
              <header className="border-b border-slate-900/[0.08] pb-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-slate-900 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white">
                      {MODEL_DISPLAY_NAME}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {resolvedActivePage !== "research" && hasVisibleMessages && (
                      <Button
                        variant="outline"
                        className="h-10 rounded-full border-slate-900/20 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                        disabled={isLoading}
                        onClick={() => setActivePage("research")}
                      >
                        <ArrowLeft className="size-4" />
                        Back to Research Agent
                      </Button>
                    )}
                    <Button variant="outline" className="h-10 rounded-full border-slate-900/10 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50" disabled={!currentPrompt} onClick={() => setIsPromptDrawerOpen((value) => !value)}>
                      {isPromptDrawerOpen ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
                      {isPromptDrawerOpen ? "Hide live view" : "Open live view"}
                    </Button>
                  </div>
                </div>
              </header>

              {resolvedActivePage === "ui" && (
                <section className="space-y-4">
                  <ResearchPanel research={researchState} isLoading={isLoading} />

                  <div className="rounded-[1.7rem] border border-slate-900/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,240,229,0.92))] p-5 shadow-[0_24px_60px_rgba(29,39,53,0.08)]">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <Badge variant="secondary" className="rounded-full border border-slate-900/[0.08] bg-white px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-slate-600">
                          <LayoutTemplate className="mr-1.5 size-3.5" />
                          UI agent
                        </Badge>
                        <h2 className="mt-3 text-[1.15rem] font-semibold tracking-tight text-slate-900 sm:text-[1.35rem]">
                          Visualize the product before it gets built
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="rounded-full border border-slate-900/[0.08] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                          {uiStep === "layout" ? "Step 1 - Choose a layout" : "Step 2 - Refine details"}
                        </div>
                      </div>
                    </div>

                    {uiStep === "layout" ? (
                      <>
                        <div className="mt-5">
                          <LayoutSelector selected={selectedLayoutOverride} recommendations={recommendationState.layouts} onSelect={handleLayoutSelect} />
                        </div>

                        <div className="mt-5 flex justify-center">
                          <Button
                            className="h-11 rounded-full bg-slate-900 px-7 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(29,39,53,0.14)] hover:bg-slate-800"
                            disabled={!selectedLayoutOverride}
                            onClick={() => setUiStep("details")}
                          >
                            Next
                            <ArrowRight className="ml-1 size-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mt-5 grid gap-4 xl:grid-cols-2">
                          <ChoiceGroup title="Logo placement" description="Where should the brand live?" options={LOGO_OPTIONS} selected={logoPlacement} onSelect={setLogoPlacement} />
                          <ChoiceGroup title="Primary action placement" description="Where should the main call-to-action button sit?" options={PRIMARY_ACTION_OPTIONS} selected={primaryActionPlacement} onSelect={setPrimaryActionPlacement} />
                          <ChoiceGroup title="Follow / Save placement" description="Where should the follow or save action appear?" options={FOLLOW_OPTIONS} selected={followButtonPlacement} onSelect={setFollowButtonPlacement} />
                          <ChoiceGroup title="Navigation model" description="What should anchor the shell?" options={NAV_OPTIONS} selected={navigationStyle} onSelect={setNavigationStyle} />
                        </div>

                        <div className="mt-5">
                          <PreferenceGrid selected={selectedDesignPreferences} onToggle={handleTogglePreference} />
                        </div>

                        <div className="mt-5 rounded-[1.25rem] border border-slate-900/[0.08] bg-white p-4 shadow-sm">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <Badge variant="secondary" className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-slate-600">
                                <Palette className="mr-1.5 size-3.5" />
                                UI stack recommendation
                              </Badge>
                              <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                                {UI_STACK_LABELS[uiStackRecommendation.primary]}
                              </h3>
                            </div>
                            <div className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                              {uiStackRecommendation.alternatives.length > 0
                                ? `Alternatives: ${uiStackRecommendation.alternatives.map((item) => UI_STACK_LABELS[item]).join(", ")}`
                                : "Primary recommendation ready"}
                            </div>
                          </div>

                          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
                            <div className="rounded-[1.05rem] border border-slate-900/[0.08] bg-[#fbf7f1] p-4">
                              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Why it fits</p>
                              <div className="mt-3 space-y-2">
                                {uiStackRecommendation.reasons.map((reason) => (
                                  <p key={reason} className="text-sm leading-6 text-slate-600">
                                    {reason}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div className="rounded-[1.05rem] border border-slate-900/[0.08] bg-white p-4">
                              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Locked design signals</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {(selectedDesignPreferences.length > 0
                                  ? selectedDesignPreferences.map((item) => DESIGN_OPTIONS.find((option) => option.id === item)?.label ?? item)
                                  : ["No design preferences selected yet"]
                                ).map((item) => (
                                  <span key={item} className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-3 py-1 text-[0.72rem] font-medium text-slate-700">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 rounded-[1.2rem] border border-slate-900/[0.08] bg-[#fbf7f1] p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold tracking-tight text-slate-900">Lock the UI direction into the prompt</p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">The master prompt updates around the chosen layout, placements, and UI stack.</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button variant="outline" className="h-10 rounded-full border-slate-900/20 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50" onClick={() => setUiStep("layout")}>
                              <ArrowLeft className="size-4" />
                              Back to layouts
                            </Button>
                            <Button className="h-10 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(29,39,53,0.14)] hover:bg-slate-800" disabled={!canOpenConfigPage && !hasUiSelections} onClick={() => setActivePage("config")}>
                              Next
                              <ArrowRight className="size-4" />
                            </Button>
                            <Button className="h-10 rounded-full bg-[#d07b49] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(208,123,73,0.22)] hover:bg-[#bf6d3d]" disabled={!hasVisibleMessages || isLoading} onClick={handleApplyUiDirection}>
                              Lock into prompt
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              )}

              {resolvedActivePage === "config" && (
                <section className="space-y-4">
                  <div className="rounded-[1.2rem] border border-slate-900/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,240,229,0.92))] p-3.5 shadow-[0_18px_36px_rgba(29,39,53,0.05)]">
                    <Badge variant="secondary" className="rounded-full border border-slate-900/[0.08] bg-white px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-slate-600">
                      <Settings2 className="mr-1.5 size-3.5" />
                      Configuration
                    </Badge>
                    <h2 className="mt-2 text-[0.96rem] font-semibold tracking-tight text-slate-900">
                      Finalize the build setup
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      PromptPal now surfaces the best-fit build recommendations after the research and UI stages.
                    </p>
                  </div>

                  <RecommendationPanel recommendation={recommendationState} manualAgent={manualAgent} manualDatabase={manualDatabase} manualHosting={manualHosting} manualStack={manualStack} selectedTools={selectedToolOverride} selectedStack={selectedStackOverride} onToolSelect={handleToolSelect} onStackToggle={handleStackToggle} onResetOverrides={handleResetOverrides} projectSummary={researchState.summary} layoutLabel={chosenLayout?.label ?? null} designSignals={selectedDesignPreferences.map((item) => DESIGN_OPTIONS.find((option) => option.id === item)?.label ?? item)} />

                  <div className="rounded-[1rem] border border-slate-900/[0.08] bg-[#fbf7f1] p-3.5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold tracking-tight text-slate-900">Move this setup into the final prompt</p>
                        <p className="mt-1 text-sm leading-5 text-slate-600">If you want a different technical direction, ask for it in the message box below before continuing.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          className="h-10 rounded-full border-slate-900/20 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                          onClick={() => setActivePage("ui")}
                        >
                          <ArrowLeft className="size-4" />
                          Back to UI
                        </Button>
                        <Button className="h-10 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(29,39,53,0.14)] hover:bg-slate-800" onClick={() => setActivePage("prompt")} disabled={!canOpenPromptPage && !hasVisibleMessages}>
                          Next
                          <ArrowRight className="size-4" />
                        </Button>
                        <Button className="h-10 rounded-full bg-[#d07b49] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(208,123,73,0.22)] hover:bg-[#bf6d3d]" disabled={!hasVisibleMessages || isLoading} onClick={handleApplyConfiguration}>
                          Lock into prompt
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {resolvedActivePage === "prompt" && (
                <section className="rounded-[1.7rem] border border-slate-900/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,240,229,0.92))] p-5 shadow-[0_24px_60px_rgba(29,39,53,0.08)]">
                  <Badge variant="secondary" className="rounded-full border border-slate-900/[0.08] bg-white px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-slate-600">
                    <FileText className="mr-1.5 size-3.5" />
                    Your prompt
                  </Badge>
                  <h2 className="mt-3 text-[1.15rem] font-semibold tracking-tight text-slate-900 sm:text-[1.35rem]">
                    Review the final direction
                  </h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[1rem] border border-slate-900/[0.08] bg-white px-4 py-3"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Questions used</p><p className="mt-1 text-base font-semibold text-slate-900">{displayedQuestionNumber > 0 ? displayedQuestionLabel : "Not started"}</p></div>
                    <div className="rounded-[1rem] border border-slate-900/[0.08] bg-white px-4 py-3"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Build agent</p><p className="mt-1 text-base font-semibold text-slate-900">{effectiveAgent?.label ?? "TBD"}</p></div>
                    <div className="rounded-[1rem] border border-slate-900/[0.08] bg-white px-4 py-3"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Layout</p><p className="mt-1 text-base font-semibold text-slate-900">{chosenLayout?.label ?? "TBD"}</p></div>
                    <div className="rounded-[1rem] border border-slate-900/[0.08] bg-white px-4 py-3"><p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Prompt lines</p><p className="mt-1 text-base font-semibold text-slate-900">{promptLineCount}</p></div>
                  </div>
                  <div className="mt-5 rounded-[1.15rem] border border-slate-900/[0.08] bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold tracking-tight text-slate-900">Here is your prompt</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Click below to open the full prompt view.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="h-10 rounded-full border-slate-900/10 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        disabled={!currentPrompt}
                        onClick={handleOpenPromptModal}
                      >
                        Open full prompt
                      </Button>
                    </div>

                    {currentPrompt.trim() ? (
                      <div className="mt-4 rounded-[1rem] border border-slate-900/[0.08] bg-[#fbf7f1] p-4">
                        <pre className="max-h-[320px] overflow-hidden whitespace-pre-wrap font-mono text-[0.82rem] leading-6 text-slate-700">
                          {promptPreview}
                        </pre>
                        {hasPromptPreviewOverflow && (
                          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Preview truncated. Open full prompt to read the entire document.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-[1rem] border border-dashed border-slate-900/[0.12] bg-[#fbf7f1] px-4 py-4">
                        <p className="text-sm leading-6 text-slate-600">
                          The final prompt will appear here as soon as the last draft is ready.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Button variant="outline" className="h-10 rounded-full border-slate-900/10 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setActivePage("config")} disabled={!canOpenConfigPage}>Back to configuration</Button>
                    <Button className="h-10 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white shadow-none hover:bg-slate-800" disabled={!currentPrompt} onClick={handleExport}>Export prompt</Button>
                  </div>
                </section>
              )}

              <section
                className={cn(
                  "rounded-[1.8rem] border border-slate-900/[0.08] bg-white/[0.82] p-4 shadow-[0_24px_60px_rgba(29,39,53,0.06)]",
                  useWorkspaceScroll ? "flex flex-col" : "flex min-h-0 flex-1 flex-col overflow-hidden"
                )}
              >
                {resolvedActivePage !== "research" && !isWorkspaceExpanded ? (
                  <button
                    type="button"
                    onClick={() => setIsWorkspaceExpanded(true)}
                    className="flex w-full items-center justify-between gap-4 rounded-[1.2rem] border border-slate-900/[0.08] bg-[#fbf7f1] px-4 py-3 text-left transition-all hover:border-slate-900/[0.16] hover:bg-white"
                  >
                    <div className="min-w-0">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Main agent workspace
                      </p>
                      <p className="mt-1 text-sm font-semibold tracking-tight text-slate-900">
                        Click to open the main agent workspace
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Reopen the full chat if you want to review or refine the live conversation.
                      </p>
                    </div>
                    <ChevronDown className="size-5 shrink-0 text-slate-500" />
                  </button>
                ) : (
                  <>
                    <div className="flex flex-col gap-3">
                      {resolvedActivePage !== "research" && (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            className="h-10 rounded-full border-slate-900/10 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => setIsWorkspaceExpanded(false)}
                          >
                            Close Workspace
                            <ChevronUp className="size-4" />
                          </Button>
                        </div>
                      )}

                      <div className="flex flex-col items-center gap-4 text-center">
                      <div className="max-w-3xl">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Main agent workspace</p>
                        <h2 className="mt-2 text-[1.45rem] font-semibold tracking-tight text-slate-900 sm:text-[1.8rem]">What is your idea?</h2>
                        <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">PromptPal researches the product properly, asks what still changes the build, then hands you into UI and configuration so the final prompt arrives closer to implementation-ready.</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <div className="rounded-full border border-slate-900/[0.08] bg-[#fbf7f1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">{isLoading ? "Updating prompt" : hasVisibleMessages ? "Live session" : "Ready for idea"}</div>
                        {resolvedActivePage === "research" && (
                          <div className="rounded-full border border-slate-900/[0.08] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                            {displayedQuestionLabel}
                          </div>
                        )}
                        {resolvedActivePage === "research" && canOpenUiPage && (
                          <Button
                            className="h-12 rounded-full bg-slate-900 px-8 text-base font-semibold text-white shadow-[0_18px_40px_rgba(29,39,53,0.18)] transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_22px_50px_rgba(29,39,53,0.24)]"
                            onClick={() => setActivePage("ui")}
                          >
                            Next: UI Agent
                            <ArrowRight className="size-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    </div>

                    <div
                      ref={messagesScrollRef}
                      className={cn(
                        "mt-5 flex flex-col gap-4 pr-1",
                        useWorkspaceScroll ? "max-h-[42vh] overflow-y-auto" : "min-h-0 flex-1 overflow-y-auto"
                      )}
                    >
                  {renderableMessages.map((message, index) => (
                    <ChatMessage
                      key={message.id || index}
                      role={message.role as "user" | "assistant"}
                      content={getMessageText(message.parts as HiddenBlockMessage["parts"])}
                      questionFocus={
                        message === latestAssistantMessage && questionBatch.length <= 1
                          ? sessionState.questionFocus
                          : undefined
                      }
                      sanitizeCurrentQuestion={
                        message === latestAssistantMessage && questionBatch.length <= 1
                      }
                      isStreaming={isLoading && index === renderableMessages.length - 1 && message.role === "assistant"}
                      promptPreview={sessionState.readyForFinalPrompt && index === renderableMessages.length - 1 ? currentPrompt : undefined}
                      onOpenPrompt={sessionState.readyForFinalPrompt && index === renderableMessages.length - 1 ? handleOpenPromptModal : undefined}
                    />
                  ))}

                  {isLoading &&
                    (renderableMessages.length === 0 || renderableMessages[renderableMessages.length - 1]?.role !== "assistant") && (
                      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="rounded-[1.2rem] border border-slate-900/[0.08] bg-white p-4 shadow-[0_14px_36px_rgba(29,39,53,0.06)]">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-900">
                              <span className="inline-flex items-center gap-0.5">
                                <span className="size-1.5 animate-pulse rounded-full bg-white" />
                                <span className="size-1.5 animate-pulse rounded-full bg-white [animation-delay:180ms]" />
                                <span className="size-1.5 animate-pulse rounded-full bg-white [animation-delay:360ms]" />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold tracking-tight text-slate-900">Grok is thinking…</p>
                              <p className="mt-0.5 text-xs text-slate-500">Researching your project and preparing the next question</p>
                              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Research can take up to a minute</p>
                            </div>
                          </div>
                          <div className="thinking-bar mt-3 h-1.5 w-full" />
                        </div>
                      </div>
                    )}
                    </div>

                    {resolvedActivePage === "research" && canOpenUiPage && (
                      <div className="mt-5 rounded-[1.2rem] border border-emerald-200 bg-emerald-50/90 p-4 shadow-[0_16px_34px_rgba(29,39,53,0.08)]">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-left">
                            <p className="text-sm font-semibold tracking-tight text-emerald-950">Research is complete</p>
                            <p className="mt-1 text-sm leading-6 text-emerald-900/80">Click Next to go to the UI Agent and continue with layout and interface decisions.</p>
                          </div>
                          <Button
                            className="h-11 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white shadow-none hover:bg-slate-800"
                            onClick={() => setActivePage("ui")}
                          >
                            Next: UI Agent
                            <ArrowRight className="size-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {canReviewResearchAnswers && selectedResearchBatch && (
                      <div className="mt-5 rounded-[1.25rem] border border-slate-900/[0.08] bg-white p-4 shadow-[0_16px_34px_rgba(29,39,53,0.06)]">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="text-left">
                        <p className="text-sm font-semibold tracking-tight text-slate-900">Review research answers</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Change any specific answer below, then apply the updated research without repeating the full interview.
                        </p>
                      </div>
                      <Button
                        className="h-10 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(29,39,53,0.14)] hover:bg-slate-800"
                        disabled={isLoading}
                        onClick={handleApplyResearchChanges}
                      >
                        Apply research changes
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>

                    {storedResearchBatches.length > 1 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {storedResearchBatches.map((batch) => (
                          <button
                            key={batch.id}
                            type="button"
                            onClick={() => handleResearchBatchSelect(batch.id)}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all",
                              batch.id === selectedResearchBatch.id
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-900/[0.08] bg-[#fbf7f1] text-slate-700 hover:border-slate-900/[0.16]"
                            )}
                          >
                            {batch.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {editingResearchQuestion && (
                      <div className="mt-4 rounded-[1.1rem] border border-slate-900/[0.08] bg-[#fbf7f1] p-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Editing Q{editingResearchQuestion.number}
                        </p>
                        <p className="mt-2 text-sm font-semibold tracking-tight text-slate-900">
                          {editingResearchQuestion.question}
                        </p>

                        {editingResearchQuestion.suggestedReplies.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {editingResearchQuestion.suggestedReplies.map((reply) => {
                              const normalizedReply = reply.replace(/^Q\d+:\s*/i, "").trim();
                              const isSelected = editingResearchDraft.trim() === normalizedReply;

                              return (
                                <button
                                  key={reply}
                                  type="button"
                                  onClick={() => {
                                    setEditingResearchDraft(normalizedReply);
                                    setResearchEditError(null);
                                  }}
                                  className={cn(
                                    "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                                    isSelected
                                      ? "border-slate-900 bg-slate-900 text-white shadow-[0_12px_28px_rgba(29,39,53,0.16)]"
                                      : "border-slate-900/[0.08] bg-white text-slate-700 hover:border-slate-900/[0.16]"
                                  )}
                                >
                                  {reply}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <div className="mt-3 rounded-[1rem] border border-slate-900/[0.08] bg-white">
                          <textarea
                            value={editingResearchDraft}
                            onChange={(event) => {
                              setEditingResearchDraft(event.target.value);
                              if (researchEditError) setResearchEditError(null);
                            }}
                            className="min-h-[120px] w-full resize-none rounded-[1rem] border-0 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            placeholder="Update the answer for this research question..."
                            rows={4}
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            className="h-10 rounded-full border-slate-900/20 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                            onClick={() => {
                              setEditingResearchQuestionNumber(null);
                              setEditingResearchDraft("");
                              setResearchEditError(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="h-10 rounded-full bg-[#d07b49] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(208,123,73,0.22)] hover:bg-[#bf6d3d]"
                            onClick={handleSaveResearchAnswerEdit}
                          >
                            Save answer
                          </Button>
                        </div>

                        {researchEditError && (
                          <p className="mt-3 text-xs font-semibold text-rose-600">{researchEditError}</p>
                        )}
                      </div>
                    )}

                    <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
                      {selectedResearchBatch.questions.map((question) => (
                        <div
                          key={question.topicId}
                          className="rounded-[1rem] border border-slate-900/[0.08] bg-[#fbf7f1] p-3"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 text-left">
                              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Q{question.number}
                              </p>
                              <p className="mt-1 text-sm font-semibold tracking-tight text-slate-900">
                                {question.question}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {selectedResearchBatch.answers[question.number] || "(skipped)"}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              className="h-9 rounded-full border-slate-900/20 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                              onClick={() => handleStartResearchAnswerEdit(question)}
                            >
                              Edit answer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                      </div>
                    )}

                    {suggestedReplyGroups.length > 0 && !isLoading && (
                      <div className="mt-5 rounded-[1.2rem] border border-slate-900/[0.08] bg-[#fbf7f1] p-4">
                    <div className="space-y-4">
                      {suggestedReplyGroups.map((group) => (
                        <div
                          key={group.key}
                          className={cn(
                            "rounded-[1rem] border border-slate-900/[0.08] p-3",
                            group.question ? "bg-white" : "border-0 bg-transparent p-0"
                          )}
                        >
                          {group.question && (
                            <p className="text-sm font-semibold tracking-tight text-slate-900">
                              {group.question}
                            </p>
                          )}
                          <div className={cn("flex flex-wrap gap-2", group.question ? "mt-3" : "")}>
                            {group.replies.map((reply) => (
                              <button
                                key={reply.key}
                                type="button"
                                onClick={() => handleSuggestedReply(reply.value)}
                                className={cn(
                                  "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                                  isSuggestedReplySelected(reply.value)
                                    ? "border-slate-900 bg-slate-900 text-white shadow-[0_12px_28px_rgba(29,39,53,0.16)]"
                                    : "border-slate-900/[0.08] bg-white text-slate-700 hover:-translate-y-0.5 hover:border-slate-900/[0.16]"
                                )}
                              >
                                {reply.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      {sessionState.allowCustomReply && (
                        <button type="button" onClick={focusCustomReply} className="rounded-full border border-dashed border-slate-900/[0.16] px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-slate-900/[0.28] hover:bg-white">
                          Add your own...
                        </button>
                      )}
                    </div>
                      </div>
                    )}

                    <div className="mt-5 rounded-[1.35rem] border border-slate-900/[0.08] bg-[#fbf7f1] p-3 sm:p-4">
                      <form className="flex w-full items-end gap-3" onSubmit={handleSubmit}>
                        <div className="flex-1 rounded-[1.35rem] border border-slate-900/10 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                          {useMultilineInput ? (
                            <textarea
                              ref={textareaRef}
                              value={input}
                              onKeyDown={handleTextareaKeyDown}
                              onChange={(event) => {
                                setInput(event.target.value);
                                if (inputError) setInputError(null);
                              }}
                              placeholder={placeholder}
                              className="min-h-[156px] w-full resize-none rounded-[1.35rem] border-0 bg-transparent px-5 py-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                              disabled={isLoading}
                              rows={isFirstTurn ? 6 : 5}
                              autoFocus
                            />
                          ) : (
                            <Input
                              ref={inputRef}
                              type="text"
                              value={input}
                              onChange={(event) => {
                                setInput(event.target.value);
                                if (inputError) setInputError(null);
                              }}
                              placeholder={placeholder}
                              className="h-[52px] rounded-[1.35rem] border-0 bg-transparent px-5 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-0"
                              disabled={isLoading}
                              autoFocus
                            />
                          )}
                        </div>

                        <Button type="submit" size="icon" className={cn("size-[52px] rounded-[1.35rem] shadow-none transition-all", trimmedInput && !isLoading ? "bg-slate-900 text-white hover:-translate-y-0.5 hover:bg-slate-800" : "bg-slate-300 text-slate-500")} disabled={isLoading || !trimmedInput}>
                          <Send className="size-5" />
                        </Button>
                      </form>

                      {inputError && <p className="mt-2 px-1 text-xs font-semibold text-rose-600">{inputError}</p>}
                    </div>
                  </>
                )}
              </section>
            </div>

            <aside className={cn("hidden xl:block shrink-0 overflow-hidden transition-[width,opacity] duration-300", isPromptDrawerOpen ? "w-[480px] opacity-100" : "w-0 opacity-0")}>
              <div className={cn("sticky top-0 h-[calc(100vh-2rem)] min-h-[720px] transition-transform duration-300", isPromptDrawerOpen ? "translate-x-0" : "translate-x-8")}>
                <PromptPanel prompt={currentPrompt} isStreaming={isLoading} onOpenFullPrompt={handleOpenPromptModal} onHide={() => setIsPromptDrawerOpen(false)} />
              </div>
            </aside>
          </div>
        </main>
      </div>

      <div className={cn("fixed inset-y-3 right-3 z-[80] w-[min(92vw,460px)] xl:hidden transition-transform duration-300", isPromptDrawerOpen ? "translate-x-0" : "pointer-events-none translate-x-[108%]")}>
        <PromptPanel prompt={currentPrompt} isStreaming={isLoading} onOpenFullPrompt={handleOpenPromptModal} onHide={() => setIsPromptDrawerOpen(false)} />
      </div>

      <PromptModal prompt={currentPrompt} isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} />
    </div>
  );
}

export default function ChatPage() {
  return <ChatContent />;
}
