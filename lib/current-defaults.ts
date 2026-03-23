export const LATEST_STABLE_DEFAULTS = {
  freshnessPolicy:
    "Prefer the latest stable framework and model families unless the user explicitly pins an older version or cites a compatibility reason.",
  frameworkDefaults: [
    "Next.js 16",
    "React 19",
    "Tailwind CSS 4",
  ],
  multimodalDefaults: [
    "OpenAI: gpt-5.4 for highest-quality multimodal extraction, gpt-5.4-mini for lower-latency cost-sensitive flows",
    "Anthropic: Claude Opus 4.6 for hardest reasoning-heavy cases, Claude Sonnet 4.6 for balanced multimodal app workflows",
  ],
  avoidLegacyExamples: [
    "Do not use Next.js 15 as the default example when the user did not pin it.",
    "Do not use GPT-4o as the default OpenAI example when the user did not pin it.",
    "Do not use Claude 3.5 as the default Anthropic example when the user did not pin it.",
  ],
} as const;
