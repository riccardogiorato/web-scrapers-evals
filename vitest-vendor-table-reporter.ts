import { Reporter } from "vitest";
import * as fs from "fs";
import * as crypto from "crypto";
import { newsTestSites, academicTestSites, technicalTestSites, ecommerceTestSites, jobListingTestSites, realEstateTestSites, socialMediaTestSites } from "./src/lib/testSites";

type TestMeta = {
  file: string;
  vendor: string;
  siteName: string;
  testName: string;
  category: string;
  id: string;
  url?: string;
  result?: { state: string; duration?: number };
  scrapingTimeMs?: number | null;
};

export default class VendorTableReporter implements Reporter {
  allTests: Map<string, TestMeta> = new Map();
  private siteNameToUrl: Map<string, string> = new Map();

  constructor() {
    // Build mapping from site names to URLs
    const allSites = [
      ...newsTestSites,
      ...academicTestSites,
      ...technicalTestSites,
      ...ecommerceTestSites,
      ...jobListingTestSites,
      ...realEstateTestSites,
      ...socialMediaTestSites
    ];

    for (const site of allSites) {
      this.siteNameToUrl.set(site.name, site.url);
    }
  }

  private generateCacheKey(url: string): string {
    // Generate the same cache key as used by the scraper
    return crypto.createHash('md5').update(url).digest('hex');
  }

  private getCacheFilename(url: string): string {
    // Convert URL to cache filename format - replace dots with dashes
    const domain = url.replace(/^https?:\/\//, '').replace(/[\/\?#].*$/, '').replace(/\./g, '-');
    const cacheKey = this.generateCacheKey(url);
    return `${domain}-${cacheKey}.json`;
  }

  private getScrapingTimeFromCache(vendor: string, url: string): number | null {
    try {
      const filename = this.getCacheFilename(url);
      const cachePath = `cache/${vendor}/${filename}`;

      if (fs.existsSync(cachePath)) {
        const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        return cacheData.data?.response?.scrapingTimeMs || null;
      }
    } catch (error) {
      // Cache file doesn't exist or is invalid
    }
    return null;
  }

  onCollected(files: any) {
    function parseVendorFromSuite(suiteName: string) {
      // Extract vendor from suite name like "firecrawl vendor" or "exa vendor"
      const match = suiteName.match(/^(.+?)\s+vendor$/);
      return match ? match[1] : null;
    }

    function extractSiteNameFromTest(testName: string) {
      // Extract site name from test name like "should scrape BBC Technology News"
      const match = testName.match(/^should scrape (.+)$/);
      return match ? match[1] : testName;
    }

    function getCategoryFromFile(fileName: string, suiteName?: string) {
      // Extract category from file name or suite context
      const fullContext = `${fileName} ${suiteName || ''}`.toLowerCase();
      if (fullContext.includes("news")) return "news";
      if (fullContext.includes("social")) return "social";
      if (fullContext.includes("academic")) return "academic";
      if (fullContext.includes("technical")) return "technical";
      if (fullContext.includes("ecommerce")) return "ecommerce";
      if (fullContext.includes("jobs")) return "jobs";
      if (fullContext.includes("realestate")) return "realestate";
      return "other";
    }

    function walkSuite(this: VendorTableReporter, suite: any, file: string, currentVendor?: string, parentSuiteName?: string) {
      if (suite.tasks) {
        for (const task of suite.tasks) {
          if (task.type === "suite") {
            // Check if this suite defines a vendor
            const vendor = parseVendorFromSuite(task.name);
            const nextVendor = vendor || currentVendor;
            const suiteName = parentSuiteName || task.name;
            walkSuite.call(this, task, file, nextVendor, suiteName);
          } else if (task.type === "test") {
            const vendor = currentVendor || "unknown";
            const siteName = extractSiteNameFromTest(task.name);
            const category = getCategoryFromFile(file, parentSuiteName);
            const url = this.siteNameToUrl.get(siteName);

            this.allTests.set(task.id, {
              file,
              vendor,
              siteName,
              testName: task.name,
              category,
              url,
              id: task.id,
            });
          }
        }
      }
    }
    for (const fileSuite of files) {
      walkSuite.call(this, fileSuite, fileSuite.name);
    }
  }

  onTaskUpdate(taskOrBatch: any) {
    if (Array.isArray(taskOrBatch)) {
      for (const [id, result] of taskOrBatch) {
        const meta = this.allTests.get(id);
        if (meta) {
          meta.result = result;
        }
      }
      return;
    }
    const task = taskOrBatch;
    if (task.type === "test") {
      if (this.allTests.has(task.id)) {
        this.allTests.get(task.id)!.result = task.result;
      }
    }
  }

  onFinished() {
    // Read scraping times from cache files
    for (const test of this.allTests.values()) {
      if (test.url && test.vendor) {
        test.scrapingTimeMs = this.getScrapingTimeFromCache(test.vendor, test.url);
      }
    }

    // Group by siteName (row) and vendor (column) - no categories
    const testData = Array.from(this.allTests.values());
    const vendors = Array.from(new Set(testData.map((t) => t.vendor))).sort();
    const siteNames = Array.from(new Set(testData.map((t) => t.siteName))).sort();

    // Build table rows - flat list of all sites
    const table: Array<Record<string, string>> = [];

    for (const siteName of siteNames) {
      const row: Record<string, string> = { Site: siteName };

      for (const vendor of vendors) {
        const test = testData.find(
          (t) => t.vendor === vendor && t.siteName === siteName
        );

        if (!test) {
          row[vendor] = "-";
        } else if (test.result?.state === "pass" && test.scrapingTimeMs) {
          // Show actual scraping time from cache
          const scrapingTimeS = (test.scrapingTimeMs / 1000).toFixed(1);
          row[vendor] = `${scrapingTimeS}s`;
        } else if (test.result?.state === "fail") {
          // Show X for failed scrapes, with timing if available from cache
          if (test.scrapingTimeMs) {
            const scrapingTimeS = (test.scrapingTimeMs / 1000).toFixed(1);
            row[vendor] = `✗ (${scrapingTimeS}s)`;
          } else {
            row[vendor] = "✗";
          }
        } else {
          row[vendor] = "?";
        }
      }
      table.push(row);
    }

    // Add separator row before summary statistics
    const separatorRow: Record<string, string> = { Site: "---" };
    for (const vendor of vendors) {
      separatorRow[vendor] = "---";
    }
    table.push(separatorRow);

    // Add average time row
    const avgRow: Record<string, string> = { Site: "avg time" };
    for (const vendor of vendors) {
      const vendorTests = testData.filter(
        (t) => t.vendor === vendor && t.scrapingTimeMs && t.scrapingTimeMs > 0
      );

      if (vendorTests.length === 0) {
        avgRow[vendor] = "-";
      } else {
        const totalScrapingTime = vendorTests.reduce(
          (sum, t) => sum + (t.scrapingTimeMs || 0), 0
        );
        const avgScrapingTimeS = (totalScrapingTime / vendorTests.length / 1000).toFixed(1);
        avgRow[vendor] = `${avgScrapingTimeS}s`;
      }
    }
    table.push(avgRow);

    // Add success percentage row
    const successRow: Record<string, string> = { Site: "% success" };
    for (const vendor of vendors) {
      const vendorTests = testData.filter((t) => t.vendor === vendor);
      const passedTests = vendorTests.filter((t) => t.result?.state === "pass");

      if (vendorTests.length === 0) {
        successRow[vendor] = "-";
      } else {
        successRow[vendor] = `${passedTests.length}/${vendorTests.length}`;
      }
    }
    table.push(successRow);

    // Print table without index column, with color
    const columns = ["Site", ...vendors];
    const RED = "\x1b[31m";
    const GREEN = "\x1b[32m";
    const RESET = "\x1b[0m";

    // Colorize table cells
    function colorize(val: string) {
      if (val === "✓") return GREEN + val + RESET;
      if (val === "✗") return RED + val + RESET;
      if (/^✗ \(\d+\.\d+s\)$/.test(val)) return RED + val + RESET; // Failed with timing in red
      if (/^\d+\.\d+s$/.test(val)) return GREEN + val + RESET; // Successful timing in green
      if (/^\d+\/\d+$/.test(val)) {
        // Success rate like "2/3"
        const [passed, total] = val.split('/').map(Number);
        if (passed === total) return GREEN + val + RESET;
        if (passed < total) return RED + val + RESET;
      }
      return val;
    }

    const coloredTable = table.map((row) => {
      const coloredRow: Record<string, string> = {};
      for (const col of columns) {
        coloredRow[col] = colorize(row[col] ?? "");
      }
      return coloredRow;
    });

    // Custom table printer for color support and alignment
    function stripAnsi(str: string) {
      return str.replace(/\x1B\[[0-9;]*m/g, "");
    }

    function printColorTable(
      table: Array<Record<string, string>>,
      columns: string[]
    ) {
      // Calculate max width for each column (excluding ANSI codes)
      const colWidths = columns.map((col) => {
        return Math.max(
          stripAnsi(col).length,
          ...table.map((row) => stripAnsi(row[col] ?? "").length)
        );
      });
      // Print header
      const header = columns
        .map((col, i) => col.padEnd(colWidths[i]))
        .join("  ");
      console.log(header);
      // Print separator
      console.log(colWidths.map((w) => "-".repeat(w)).join("  "));
      // Print rows
      for (const row of table) {
        const line = columns
          .map((col, i) => {
            const val = row[col] ?? "";
            const padLen = colWidths[i] + (val.length - stripAnsi(val).length); // account for color code length
            return val.padEnd(padLen);
          })
          .join("  ");
        console.log(line);
      }
    }

    printColorTable(coloredTable, columns);
  }
}