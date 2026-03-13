export type SessionPhase =
  | "discovery"
  | "definition"
  | "experience"
  | "delivery"
  | "finalizing";

export interface SessionState {
  phase: SessionPhase;
  currentQuestion: number;
  plannedQuestionCount: number;
  advancedOffered: boolean;
  advancedAccepted: boolean;
  awaitingChoice: boolean;
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

export interface RecommendationState {
  agent: RecommendationEntity | null;
  database: RecommendationEntity | null;
  stack: RecommendationChip[];
  notes: string[];
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
  stack: [],
  notes: [],
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
    .replace(/<!-- RECOMMENDATION_STATE -->[\s\S]*?<!-- \/RECOMMENDATION_STATE -->/g, "")
    .replace(/<!-- SESSION_STATE -->[\s\S]*?<!-- \/SESSION_STATE -->/g, "")
    .replace(/<!-- PROMPT_STATE -->[\s\S]*$/g, "")
    .replace(/<!-- RECOMMENDATION_STATE -->[\s\S]*$/g, "")
    .replace(/<!-- SESSION_STATE -->[\s\S]*$/g, "")
    .trim();
}

function extractHiddenBlock(content: string, key: string): string | null {
  const pattern = new RegExp(`<!-- ${key} -->([\\s\\S]*?)<!-- \\/${key} -->`);
  const match = content.match(pattern);
  return match ? match[1].trim() : null;
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
      const parsed = JSON.parse(sessionState) as Partial<SessionState>;
      return {
        phase: parsed.phase ?? fallback.phase,
        currentQuestion: parsed.currentQuestion ?? fallback.currentQuestion,
        plannedQuestionCount: parsed.plannedQuestionCount ?? fallback.plannedQuestionCount,
        advancedOffered: parsed.advancedOffered ?? fallback.advancedOffered,
        advancedAccepted: parsed.advancedAccepted ?? fallback.advancedAccepted,
        awaitingChoice: parsed.awaitingChoice ?? fallback.awaitingChoice,
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
        agent: parsed.agent?.label
          ? {
              id: parsed.agent.id,
              label: parsed.agent.label,
              source: parsed.agent.source === "custom" ? "custom" : "preset",
            }
          : null,
        database: parsed.database?.label
          ? {
              id: parsed.database.id,
              label: parsed.database.label,
              source: parsed.database.source === "custom" ? "custom" : "preset",
            }
          : null,
        stack: Array.isArray(parsed.stack)
          ? parsed.stack
              .filter(
                (item): item is RecommendationChip =>
                  Boolean(item && typeof item.label === "string" && typeof item.category === "string")
              )
              .map((item) => ({
                id: item.id,
                label: item.label,
                category: item.category,
                source: item.source === "custom" ? "custom" : "preset",
              }))
          : fallback.stack,
        notes: Array.isArray(parsed.notes)
          ? parsed.notes.filter((note): note is string => typeof note === "string")
          : fallback.notes,
      };
    } catch {
      return fallback;
    }
  }

  return fallback;
}
