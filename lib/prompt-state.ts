export type SessionPhase =
  | "intake"
  | "research"
  | "clarifying"
  | "ui"
  | "config"
  | "finalizing";

export interface SessionState {
  phase: SessionPhase;
  currentQuestion: number;
  plannedQuestionCount: number;
  questionBudgetMax: number;
  researchComplete: boolean;
  readyForUiPage: boolean;
  readyForConfigPage: boolean;
  readyForFinalPrompt: boolean;
  questionFocus: string;
  coveredAreas: string[];
  suggestedReplies: string[];
  questionBatch: ResearchQuestionBatchItem[];
  allowCustomReply: boolean;
}

export interface ResearchQuestionBatchItem {
  number: number;
  focusId: string;
  topicId: string;
  question: string;
  suggestedReplies: string[];
}

export type RecommendationSource = "preset" | "custom";

export interface RecommendationEntity {
  id?: string;
  label: string;
  source: RecommendationSource;
}

export interface RecommendationChip extends RecommendationEntity {
  category: string;
}

export interface LayoutRecommendation extends RecommendationEntity {
  summary: string;
}

export interface RecommendationState {
  agent: RecommendationEntity | null;
  database: RecommendationEntity | null;
  hosting: RecommendationEntity | null;
  stack: RecommendationChip[];
  layouts: LayoutRecommendation[];
  notes: string[];
}

export interface ResearchDecision {
  topic: string;
  winner: string;
  reason: string;
  alternatives: string[];
}

export interface ResearchState {
  summary: string;
  focusAreas: string[];
  decisions: ResearchDecision[];
  openQuestions: string[];
}

export interface HiddenBlockMessagePart {
  type: string;
  text?: string;
}

export interface HiddenBlockMessage {
  role: string;
  parts: HiddenBlockMessagePart[];
}

export const EMPTY_RECOMMENDATION_STATE: RecommendationState = {
  agent: null,
  database: null,
  hosting: null,
  stack: [],
  layouts: [],
  notes: [],
};

export const EMPTY_RESEARCH_STATE: ResearchState = {
  summary: "",
  focusAreas: [],
  decisions: [],
  openQuestions: [],
};

export function getMessageText(parts: HiddenBlockMessagePart[]): string {
  return parts
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text ?? "")
    .join("");
}

export function stripHiddenBlocks(content: string): string {
  return content
    .replace(/<!-- PROMPT_STATE -->[\s\S]*?<!-- \/PROMPT_STATE -->/g, "")
    .replace(/<!-- RESEARCH_STATE -->[\s\S]*?<!-- \/RESEARCH_STATE -->/g, "")
    .replace(/<!-- RECOMMENDATION_STATE -->[\s\S]*?<!-- \/RECOMMENDATION_STATE -->/g, "")
    .replace(/<!-- SESSION_STATE -->[\s\S]*?<!-- \/SESSION_STATE -->/g, "")
    .replace(/<!-- PROMPT_STATE -->[\s\S]*$/g, "")
    .replace(/<!-- RESEARCH_STATE -->[\s\S]*$/g, "")
    .replace(/<!-- RECOMMENDATION_STATE -->[\s\S]*$/g, "")
    .replace(/<!-- SESSION_STATE -->[\s\S]*$/g, "")
    .trim();
}

export function stripSuggestedRepliesText(content: string): string {
  return content
    .replace(
      /(?:^|\n)\s*(?:Suggested replies|Reply options)(?:\s*\([^)]*\))?\s*:\s*[\s\S]*$/i,
      ""
    )
    .trim();
}

export function extractVisibleSuggestedReplies(content: string): string[] {
  const visibleContent = stripHiddenBlocks(content);
  const match = visibleContent.match(
    /(?:^|\n)\s*(?:Suggested replies|Reply options)(?:\s*\([^)]*\))?\s*:\s*([\s\S]*)$/i
  );

  if (!match?.[1]) {
    return [];
  }

  return match[1]
    .split(/\n+/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
}

function extractHiddenBlock(content: string, key: string): string | null {
  const pattern = new RegExp(`<!-- ${key} -->([\\s\\S]*?)<!-- \\/${key} -->`);
  const match = content.match(pattern);
  return match ? match[1].trim() : null;
}

function parseEntity(entity: unknown): RecommendationEntity | null {
  if (!entity || typeof entity !== "object") {
    return null;
  }

  const candidate = entity as Partial<RecommendationEntity>;

  if (typeof candidate.label !== "string" || candidate.label.trim().length === 0) {
    return null;
  }

  return {
    id: typeof candidate.id === "string" ? candidate.id : undefined,
    label: candidate.label,
    source: candidate.source === "custom" ? "custom" : "preset",
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isQuestionBatchItem(value: unknown): value is ResearchQuestionBatchItem {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as ResearchQuestionBatchItem).number === "number" &&
      Number.isFinite((value as ResearchQuestionBatchItem).number) &&
      typeof (value as ResearchQuestionBatchItem).focusId === "string" &&
      (typeof (value as Partial<ResearchQuestionBatchItem>).topicId === "string" ||
        typeof (value as Partial<ResearchQuestionBatchItem>).topicId === "undefined") &&
      typeof (value as ResearchQuestionBatchItem).question === "string" &&
      isStringArray((value as ResearchQuestionBatchItem).suggestedReplies)
  );
}

export function extractPromptState(messages: HiddenBlockMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role !== "assistant") {
      continue;
    }

    const promptState = extractHiddenBlock(getMessageText(message.parts), "PROMPT_STATE");

    if (promptState) {
      return promptState;
    }
  }

  return "";
}

export function extractResearchState(
  messages: HiddenBlockMessage[],
  fallback: ResearchState = EMPTY_RESEARCH_STATE
): ResearchState {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role !== "assistant") {
      continue;
    }

    const researchState = extractHiddenBlock(getMessageText(message.parts), "RESEARCH_STATE");

    if (!researchState) {
      continue;
    }

    try {
      const parsed = JSON.parse(researchState) as Partial<ResearchState>;

      return {
        summary: typeof parsed.summary === "string" ? parsed.summary : fallback.summary,
        focusAreas: isStringArray(parsed.focusAreas) ? parsed.focusAreas : fallback.focusAreas,
        decisions: Array.isArray(parsed.decisions)
          ? parsed.decisions
              .filter(
                (item): item is ResearchDecision =>
                  Boolean(
                    item &&
                      typeof item === "object" &&
                      typeof (item as ResearchDecision).topic === "string" &&
                      typeof (item as ResearchDecision).winner === "string" &&
                      typeof (item as ResearchDecision).reason === "string"
                  )
              )
              .map((item) => ({
                topic: item.topic,
                winner: item.winner,
                reason: item.reason,
                alternatives: isStringArray(item.alternatives) ? item.alternatives : [],
              }))
          : fallback.decisions,
        openQuestions: isStringArray(parsed.openQuestions)
          ? parsed.openQuestions
          : fallback.openQuestions,
      };
    } catch {
      return fallback;
    }
  }

  return fallback;
}

export function extractSessionState(
  messages: HiddenBlockMessage[],
  fallback: SessionState
): SessionState {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role !== "assistant") {
      continue;
    }

    const sessionState = extractHiddenBlock(getMessageText(message.parts), "SESSION_STATE");

    if (!sessionState) {
      continue;
    }

    try {
      const parsed = JSON.parse(sessionState) as Partial<SessionState> & {
        readyForStackPage?: boolean;
      };

      return {
        phase: parsed.phase ?? fallback.phase,
        currentQuestion: parsed.currentQuestion ?? fallback.currentQuestion,
        plannedQuestionCount: parsed.plannedQuestionCount ?? fallback.plannedQuestionCount,
        questionBudgetMax: parsed.questionBudgetMax ?? fallback.questionBudgetMax,
        researchComplete: parsed.researchComplete ?? fallback.researchComplete,
        readyForUiPage:
          parsed.readyForUiPage ??
          parsed.readyForStackPage ??
          fallback.readyForUiPage,
        readyForConfigPage: parsed.readyForConfigPage ?? fallback.readyForConfigPage,
        readyForFinalPrompt: parsed.readyForFinalPrompt ?? fallback.readyForFinalPrompt,
        questionFocus:
          typeof parsed.questionFocus === "string"
            ? parsed.questionFocus
            : fallback.questionFocus,
        coveredAreas: isStringArray(parsed.coveredAreas)
          ? parsed.coveredAreas
          : fallback.coveredAreas,
        suggestedReplies: isStringArray(parsed.suggestedReplies)
          ? parsed.suggestedReplies
          : fallback.suggestedReplies,
        questionBatch: Array.isArray(parsed.questionBatch)
          ? parsed.questionBatch
              .filter(isQuestionBatchItem)
              .map((item) => ({
                number: Math.max(1, Math.floor(item.number)),
                focusId: item.focusId,
                topicId:
                  typeof item.topicId === "string" && item.topicId.trim().length > 0
                    ? item.topicId
                    : `${item.focusId}-${Math.max(1, Math.floor(item.number))}`,
                question: item.question,
                suggestedReplies: item.suggestedReplies.slice(0, 5),
              }))
          : fallback.questionBatch,
        allowCustomReply:
          typeof parsed.allowCustomReply === "boolean"
            ? parsed.allowCustomReply
            : fallback.allowCustomReply,
      };
    } catch {
      return fallback;
    }
  }

  return fallback;
}

export function extractRecommendationState(
  messages: HiddenBlockMessage[],
  fallback: RecommendationState = EMPTY_RECOMMENDATION_STATE
): RecommendationState {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role !== "assistant") {
      continue;
    }

    const recommendationState = extractHiddenBlock(
      getMessageText(message.parts),
      "RECOMMENDATION_STATE"
    );

    if (!recommendationState) {
      continue;
    }

    try {
      const parsed = JSON.parse(recommendationState) as Partial<RecommendationState>;

      return {
        agent: parseEntity(parsed.agent) ?? fallback.agent,
        database: parseEntity(parsed.database) ?? fallback.database,
        hosting: parseEntity(parsed.hosting) ?? fallback.hosting,
        stack: Array.isArray(parsed.stack)
          ? parsed.stack
              .filter(
                (item): item is RecommendationChip =>
                  Boolean(
                    item &&
                      typeof item === "object" &&
                      typeof item.label === "string" &&
                      typeof item.category === "string"
                  )
              )
              .map((item) => ({
                id: item.id,
                label: item.label,
                category: item.category,
                source: item.source === "custom" ? "custom" : "preset",
              }))
          : fallback.stack,
        layouts: Array.isArray(parsed.layouts)
          ? parsed.layouts
              .filter(
                (item): item is LayoutRecommendation =>
                  Boolean(
                    item &&
                      typeof item === "object" &&
                      typeof item.label === "string" &&
                      typeof item.summary === "string"
                  )
              )
              .map((item) => ({
                id: item.id,
                label: item.label,
                summary: item.summary,
                source: item.source === "custom" ? "custom" : "preset",
              }))
          : fallback.layouts,
        notes: isStringArray(parsed.notes) ? parsed.notes : fallback.notes,
      };
    } catch {
      return fallback;
    }
  }

  return fallback;
}
