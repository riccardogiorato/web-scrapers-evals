import { describe, it, expect } from "vitest";
import { firecrawlScraper, exaScraper, tavilyScraper, linkupScraper } from "../lib/scraperClients";
import { ALL_TEST_SITES } from "../lib/testSites";

const vendors = [
  { name: "firecrawl", scraper: firecrawlScraper },
  { name: "exa", scraper: exaScraper },
  { name: "tavily", scraper: tavilyScraper },
  { name: "linkup", scraper: linkupScraper },
];

describe("Web Scraper Evaluation", () => {
  // Run all vendor-site combinations in parallel
  vendors.forEach(({ name, scraper }) => {
    describe(`${name} vendor`, () => {
      ALL_TEST_SITES.forEach((testSite) => {
        it.concurrent(`should scrape ${testSite.name}`, async () => {
          const startTime = Date.now();
          const result = await scraper(testSite.url);
          const endTime = Date.now();
          const totalTime = endTime - startTime;

          // Check that scraping was successful
          expect(result).toBeDefined();
          expect(result.url).toBe(testSite.url);

          // Track failure without throwing error
          if (result.error) {
            console.error(`${name} failed to scrape ${testSite.name}: ${result.error}`);
            console.log(`${name} scraping failed for ${testSite.name} in ${totalTime}ms`);

            // Mark test as failed but don't throw
            expect(result.error).toBeUndefined(); // This will fail the test
            return; // Exit early
          }

          // If successful, we should have response data
          expect(result.response).toBeDefined();
          expect(result.response!.scrapingTimeMs).toBeGreaterThan(0);

          // Log timing information
          console.log(`${name} scraped ${testSite.name} in ${totalTime}ms (reported: ${result.response!.scrapingTimeMs}ms)`);

          // If successful, we should have some content
          expect(result.response!.content!.length).toBeGreaterThan(0);
          
        }, 60000); // 60 second timeout for scraping operations
      });
    });
  });
});
