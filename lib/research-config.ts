export const MIN_INITIAL_RESEARCH_QUESTIONS = 20;
export const MIN_FOLLOWUP_RESEARCH_QUESTIONS = 1;

export const RESEARCH_DEPTH_MAP = {
  1: {
    label: "Focused",
    description: "Full-depth discovery with the leanest 20+ question budget.",
    questionCap: 20,
    followUpCap: 4,
  },
  2: {
    label: "Balanced",
    description: "Full product research with a broader clarification budget.",
    questionCap: 22,
    followUpCap: 5,
  },
  3: {
    label: "Deep",
    description: "Broad product, data, and delivery comparison with extra ambiguity coverage.",
    questionCap: 24,
    followUpCap: 6,
  },
  4: {
    label: "Intensive",
    description: "The deepest research pass with the largest clarification budget and more follow-up headroom.",
    questionCap: 28,
    followUpCap: 8,
  },
} as const;

export const QUESTION_FOCUS_SEQUENCE = [
  {
    id: "product_and_primary_users",
    label: "product goal and primary users",
  },
  {
    id: "accounts_and_roles",
    label: "accounts, roles, and permissions",
  },
  {
    id: "core_workflow",
    label: "core workflow and main user actions",
  },
  {
    id: "data_and_content",
    label: "data objects, content, and domain entities",
  },
  {
    id: "admin_and_operations",
    label: "admin, moderation, approvals, and internal operations",
  },
  {
    id: "monetization",
    label: "payments, subscriptions, and marketplace logic",
  },
  {
    id: "integrations_and_constraints",
    label: "integrations, search, notifications, sharing, and platform constraints",
  },
] as const;

export type QuestionFocusId = (typeof QUESTION_FOCUS_SEQUENCE)[number]["id"];

export const QUESTION_FOCUS_QUOTAS: Record<QuestionFocusId, number> = {
  product_and_primary_users: 2,
  accounts_and_roles: 2,
  core_workflow: 4,
  data_and_content: 4,
  admin_and_operations: 2,
  monetization: 2,
  integrations_and_constraints: 4,
};

export const FOOD_RECIPE_DOMAIN_PACK = {
  id: "leftover-food",
  label: "Leftover-first food and recipe apps",
  keywords: [
    "recipe",
    "recipes",
    "pantry",
    "leftover",
    "leftovers",
    "fridge",
    "ingredient",
    "ingredients",
    "cupboard",
    "cupboards",
    "scan",
    "scanning",
    "food waste",
    "kitchen",
  ],
  requiredTopics: [
    "ranking_objective",
    "pantry_vs_web_precedence",
    "max_missing_ingredients",
    "substitution_policy",
    "ingredient_normalization",
    "quantity_and_units",
    "expiry_and_freshness",
    "dietary_and_allergen_filters",
    "no_match_fallback",
    "privacy_and_sharing_boundaries",
  ],
  promptInvariants: [
    "Maximize pantry utilization before broad recipe popularity.",
    "Penalize recipes that require many missing ingredients.",
    "Treat missing ingredients as secondary context, not the main ranking goal.",
    "Prefer cook-now and few-extras-needed results over generic relevance.",
    "Require a pantry-first fallback when no strong match exists.",
  ],
} as const;

export const FALLBACK_QUESTION_BUDGET_MAX = RESEARCH_DEPTH_MAP[4].questionCap;

export function getQuestionBudgetMax(researchDepth: number) {
  const depthKey =
    researchDepth >= 4 ? 4 : researchDepth <= 1 ? 1 : (researchDepth as 2 | 3);

  return RESEARCH_DEPTH_MAP[depthKey].questionCap;
}

export function getFollowUpQuestionCap(researchDepth: number) {
  const depthKey =
    researchDepth >= 4 ? 4 : researchDepth <= 1 ? 1 : (researchDepth as 2 | 3);

  return RESEARCH_DEPTH_MAP[depthKey].followUpCap;
}

export function detectFoodRecipeDomain(value: string) {
  const normalized = value.toLowerCase();
  return FOOD_RECIPE_DOMAIN_PACK.keywords.some((keyword) => normalized.includes(keyword));
}
