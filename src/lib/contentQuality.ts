import type { ScrapedContent, TestSite } from "./types.js";

export interface ContentQualityResult {
  ok: boolean;
  reason?: string;
}

const MIN_CONTENT_LENGTH = 120;
const BAD_PAGE_PATTERNS = [
  /access denied/i,
  /are you a robot/i,
  /captcha/i,
  /enable javascript/i,
  /error fetching content/i,
  /failed to fetch/i,
  /forbidden/i,
  /just a moment/i,
  /not found/i,
  /page unavailable/i,
  /please wait while we verify/i,
  /sign in to continue/i,
  /something went wrong/i,
  /temporarily unavailable/i,
  /too many requests/i,
  /unsupported browser/i,
];

const STOPWORDS = new Set([
  "and",
  "api",
  "com",
  "for",
  "jobs",
  "near",
  "page",
  "profile",
  "property",
  "remote",
  "the",
  "usa",
  "web",
]);

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function meaningfulTokens(testSite: TestSite): string[] {
  const url = new URL(testSite.url);
  const domainTokens = url.hostname
    .replace(/^www\./, "")
    .split(".")
    .filter((token) => token.length > 2);
  const nameTokens = normalize(testSite.name)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));

  return Array.from(new Set([...domainTokens, ...nameTokens]));
}

export function evaluateScrapedContent(
  testSite: TestSite,
  result: ScrapedContent,
): ContentQualityResult {
  if (result.error) {
    return { ok: false, reason: result.error };
  }

  const content = result.response?.content?.trim() ?? "";
  const title = result.response?.title?.trim() ?? "";

  if (content.length < MIN_CONTENT_LENGTH) {
    return {
      ok: false,
      reason: `content too short (${content.length} chars)`,
    };
  }

  const searchable = `${title}\n${content.slice(0, 5000)}`;
  const badPattern = BAD_PAGE_PATTERNS.find((pattern) => pattern.test(searchable));

  if (badPattern) {
    return {
      ok: false,
      reason: `looks like a blocked/error page (${badPattern.source})`,
    };
  }

  const normalizedSearchable = normalize(searchable);
  const tokens = meaningfulTokens(testSite);
  const matchedToken = tokens.find((token) =>
    normalizedSearchable.includes(token),
  );

  if (!matchedToken) {
    return {
      ok: false,
      reason: `content does not match expected page tokens: ${tokens.join(", ")}`,
    };
  }

  return { ok: true };
}
