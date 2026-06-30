import { ScraperFunction, ScrapedContent } from "./types";
import {
  firecrawlClient,
  exaClient,
  linkupClient,
} from "./apiClients";
import { withCache } from "./cache/withCache";
import { fetchParallelMcpContent } from "./parallelMcpClient.js";

// Scraper client interface
export interface ScraperClient {
  name: string;
  scrape: ScraperFunction;
  healthCheck: () => Promise<boolean>;
}

const CACHE_TIME_FIRECRAWL = 604800000; // 1 week

// Firecrawl scraper implementation
const firecrawlScraperImpl: ScraperFunction = async (
  url: string,
  timeout = 30000
) => {
  const startTime = Date.now();

  try {
    const response = await firecrawlClient.scrape(url, {
      formats: ["markdown"],
      maxAge: CACHE_TIME_FIRECRAWL,
      timeout: timeout,
      storeInCache: true,
    });

    const content = response.markdown || "";
    const title = response.metadata?.title || "";
    const scrapingTimeMs = Date.now() - startTime;

    return {
      url,
      response: {
        title,
        content,
        scrapingTimeMs,
      },
    };
  } catch (error) {
    // Return empty response for failed scrapes
    return {
      url,
      response: {
        title: "",
        content: "",
        scrapingTimeMs: Date.now() - startTime,
      },
    };
  }
};

// Exa scraper implementation
const exaScraperImpl: ScraperFunction = async (
  url: string,
  timeout = 30000
) => {
  const startTime = Date.now();

  try {
    // Note: Exa doesn't support timeout parameter in getContents
    const response = await exaClient.getContents([url], {
      text: true,
      livecrawl: "fallback",
      livecrawlTimeout: timeout,
    });

    if (!response?.results || response.results.length === 0) {
      // Exa doesn't have content for this URL, return empty
      return {
        url,
        response: {
          title: "",
          content: "",
          scrapingTimeMs: Date.now() - startTime,
        },
      };
    }

    const result = response.results[0];
    const content = result.text || "";
    const title = result.title || "";
    const scrapingTimeMs = Date.now() - startTime;

    return {
      url,
      response: {
        title,
        content,
        scrapingTimeMs,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      url,
      error: errorMessage,
    };
  }
};

// Linkup scraper implementation
const linkupScraperImpl: ScraperFunction = async (
  url: string,
  timeout = 30000
) => {
  const startTime = Date.now();

  try {
    const response = await linkupClient.fetch({
      url,
      renderJs: true, // Execute JavaScript before extracting content
    });

    const content = response.markdown || "";
    const title = response.markdown.slice(0, 100) || "";
    const scrapingTimeMs = Date.now() - startTime;

    return {
      url,
      response: {
        title,
        content,
        scrapingTimeMs,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      url,
      error: errorMessage,
    };
  }
};

// Parallel Search MCP scraper implementation
const parallelScraperImpl: ScraperFunction = async (
  url: string,
  timeout = 30000,
) => {
  const startTime = Date.now();

  try {
    const response = await fetchParallelMcpContent(url, timeout);

    return {
      url,
      response: {
        title: response.title,
        content: response.content,
        scrapingTimeMs: Date.now() - startTime,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      url,
      error: errorMessage,
    };
  }
};

// Health check functions
async function checkFirecrawl(): Promise<boolean> {
  try {
    const result = await firecrawlClient.scrape("https://www.firecrawl.dev/", {
      formats: ["markdown"],
      maxAge: CACHE_TIME_FIRECRAWL,
    });

    return !!result.markdown;
  } catch (error) {
    return false;
  }
}

async function checkExa(): Promise<boolean> {
  try {
    const result = await exaClient.getContents(["https://exa.ai/"], {
      text: true,
    });
    return !!result?.results && result.results.length > 0;
  } catch (error) {
    return false;
  }
}

async function checkLinkup(): Promise<boolean> {
  try {
    const result = await linkupClient.fetch({
      url: "https://linkup.so/",
      renderJs: true,
    });
    return !!result?.markdown;
  } catch (error) {
    return false;
  }
}

async function checkParallel(): Promise<boolean> {
  try {
    const result = await fetchParallelMcpContent("https://parallel.ai/", 30000);
    return result.content.length > 0;
  } catch (error) {
    return false;
  }
}

// Cached scraper functions
export const firecrawlScraper = withCache("firecrawl", firecrawlScraperImpl);
export const exaScraper = withCache("exa", exaScraperImpl);
export const linkupScraper = withCache("linkup", linkupScraperImpl);
export const parallelScraper = withCache("parallel", parallelScraperImpl);

// Scraper clients array for testing
export const scraperClients: ScraperClient[] = [
  {
    name: "firecrawl",
    scrape: firecrawlScraper,
    healthCheck: checkFirecrawl,
  },
  {
    name: "exa",
    scrape: exaScraper,
    healthCheck: checkExa,
  },
  {
    name: "linkup",
    scrape: linkupScraper,
    healthCheck: checkLinkup,
  },
  {
    name: "parallel",
    scrape: parallelScraper,
    healthCheck: checkParallel,
  },
];

// Export individual implementations for direct use if needed
export {
  firecrawlScraperImpl,
  exaScraperImpl,
  linkupScraperImpl,
  parallelScraperImpl,
};
