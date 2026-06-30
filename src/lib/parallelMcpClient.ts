import crypto from "crypto";

interface ParallelMcpExtractResult {
  url: string;
  title?: string | null;
  excerpts?: string[] | null;
  full_content?: string | null;
}

interface ParallelMcpStructuredContent {
  results?: ParallelMcpExtractResult[];
  errors?: unknown[];
}

interface ParallelMcpResponse {
  result?: {
    structuredContent?: ParallelMcpStructuredContent;
    isError?: boolean;
  };
  error?: {
    message?: string;
  };
}

const PARALLEL_MCP_URL =
  process.env.PARALLEL_MCP_URL ?? "https://search.parallel.ai/mcp";
const PARALLEL_API_KEY = process.env.PARALLEL_API_KEY;
const DEFAULT_PARALLEL_MCP_MAX_CONCURRENCY = PARALLEL_API_KEY ? 4 : 1;
const parsedMaxConcurrency = Number.parseInt(
  process.env.PARALLEL_MCP_MAX_CONCURRENCY ??
    String(DEFAULT_PARALLEL_MCP_MAX_CONCURRENCY),
  10,
);
const PARALLEL_MCP_MAX_CONCURRENCY =
  Number.isFinite(parsedMaxConcurrency) && parsedMaxConcurrency > 0
    ? parsedMaxConcurrency
    : DEFAULT_PARALLEL_MCP_MAX_CONCURRENCY;
const PARALLEL_MCP_SESSION_ID =
  process.env.PARALLEL_MCP_SESSION_ID ??
  `web-scrapers-evals-${crypto.randomUUID()}`;

function parallelHeaders(extraHeaders: Record<string, string> = {}) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    ...(PARALLEL_API_KEY
      ? { Authorization: `Bearer ${PARALLEL_API_KEY}` }
      : {}),
    ...extraHeaders,
  };
}

let activeRequests = 0;
const requestQueue: Array<() => void> = [];

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

async function runWithConcurrencyLimit<T>(fn: () => Promise<T>): Promise<T> {
  if (activeRequests >= PARALLEL_MCP_MAX_CONCURRENCY) {
    await new Promise<void>((resolve) => requestQueue.push(resolve));
  }

  activeRequests += 1;

  try {
    return await fn();
  } finally {
    activeRequests -= 1;
    requestQueue.shift()?.();
  }
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeout: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(new Error(`timeout after ${timeout}ms`)),
    timeout,
  );

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function initializeMcpSession(timeout: number): Promise<string> {
  const response = await fetchWithTimeout(
    PARALLEL_MCP_URL,
    {
      method: "POST",
      headers: parallelHeaders(),
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-03-26",
          capabilities: {},
          clientInfo: {
            name: "web-scrapers-evals",
            version: "0.0.1",
          },
        },
      }),
    },
    timeout,
  );

  if (!response.ok) {
    throw new Error(`MCP initialize failed with HTTP ${response.status}`);
  }

  const sessionId = response.headers.get("mcp-session-id");

  if (!sessionId) {
    throw new Error("MCP initialize did not return mcp-session-id");
  }

  return sessionId;
}

export async function fetchParallelMcpContent(
  url: string,
  timeout: number,
): Promise<{ title: string; content: string }> {
  return runWithConcurrencyLimit(async () => {
    const mcpSessionId = await initializeMcpSession(timeout);
    const response = await fetchWithTimeout(
      PARALLEL_MCP_URL,
      {
        method: "POST",
        headers: parallelHeaders({ "Mcp-Session-Id": mcpSessionId }),
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "tools/call",
          params: {
            name: "web_fetch",
            arguments: {
              urls: [url],
              objective:
                "Extract the whole page as markdown for a scraper benchmark.",
              full_content: true,
              session_id: PARALLEL_MCP_SESSION_ID,
            },
          },
        }),
      },
      timeout,
    );

    const rawBody = await response.text();
    let body: ParallelMcpResponse;

    try {
      body = JSON.parse(rawBody) as ParallelMcpResponse;
    } catch {
      throw new Error(`MCP returned non-JSON response: ${rawBody.slice(0, 200)}`);
    }

    if (!response.ok) {
      throw new Error(
        body.error?.message ?? `MCP web_fetch failed with HTTP ${response.status}`,
      );
    }

    if (body.error?.message) {
      throw new Error(body.error.message);
    }

    if (body.result?.isError) {
      throw new Error("MCP web_fetch returned an error result");
    }

    const structuredContent = body.result?.structuredContent;
    const errors = structuredContent?.errors ?? [];

    if (errors.length > 0) {
      throw new Error(errors.map(formatError).join("; "));
    }

    const result = structuredContent?.results?.[0];

    if (!result) {
      throw new Error("MCP web_fetch returned no results");
    }

    const fullContent = result.full_content?.trim() ?? "";
    const excerptContent = result.excerpts?.filter(Boolean).join("\n\n") ?? "";
    const content = fullContent.length > 0 ? fullContent : excerptContent;

    return {
      title: result.title ?? "",
      content,
    };
  });
}
