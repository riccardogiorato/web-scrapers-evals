import { ScraperFunction, ScrapedContent } from "./types";
import {
  firecrawlClient,
  exaClient,
  linkupClient,
} from "./apiClients";
import { withCache } from "./cache/withCache";

// Scraper client interface
export interface ScraperClient {
  name: string;
  scrape: ScraperFunction;
  healthCheck: () => Promise<boolean>;
}


// Firecrawl scraper implementation
const firecrawlScraperImpl: ScraperFunction = async (url: string, timeout = 30000) => {
  const startTime = Date.now();

  try {
    const response = await firecrawlClient.scrapeUrl(url, {
      formats: [ "markdown" ],
      onlyMainContent: true,
      parsePDF: true,
      maxAge: 86400000, // 1 day
      timeout: timeout
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to scrape with Firecrawl');
    }

    const content = response.markdown || '';
    const title = response.metadata?.title || '';
    const scrapingTimeMs = Date.now() - startTime;

    return {
      url,
      response: {
        title,
        content,
        scrapingTimeMs
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      url,
      error: errorMessage
    };
  }
};

// Exa scraper implementation
const exaScraperImpl: ScraperFunction = async (url: string, timeout = 30000) => {
  const startTime = Date.now();

  try {
    // Note: Exa doesn't support timeout parameter in getContents
    const response = await exaClient.getContents([url], {
      text: true
    });

    if (!response?.results || response.results.length === 0) {
      throw new Error('No results returned from Exa');
    }

    const result = response.results[0];
    const content = result.text || '';
    const title = result.title || '';
    const scrapingTimeMs = Date.now() - startTime;

    return {
      url,
      response: {
        title,
        content,
        scrapingTimeMs
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      url,
      error: errorMessage
    };
  }
};

// Health check functions
async function checkFirecrawl(): Promise<boolean> {
  try {
    const result = await firecrawlClient.scrapeUrl('https://www.firecrawl.dev/', {
      formats: ['markdown']
    });
    return result.success;
  } catch (error) {
    return false;
  }
}

async function checkExa(): Promise<boolean> {
  try {
    const result = await exaClient.getContents(['https://exa.ai/'], {
      text: true
    });
    return !!result?.results && result.results.length > 0;
  } catch (error) {
    return false;
  }
}


// Cached scraper functions
export const firecrawlScraper = withCache("firecrawl", firecrawlScraperImpl);
export const exaScraper = withCache("exa", exaScraperImpl);
// export const linkupScraper = withCache("linkup", linkupScraperImpl);

// Scraper clients array for testing
export const scraperClients: ScraperClient[] = [
  {
    name: "firecrawl",
    scrape: firecrawlScraper,
    healthCheck: checkFirecrawl
  },
  {
    name: "exa",
    scrape: exaScraper,
    healthCheck: checkExa
  },
];

// Export individual implementations for direct use if needed
export {
  firecrawlScraperImpl,
  exaScraperImpl,
};