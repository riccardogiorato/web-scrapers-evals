import { Reporter, TestCase, TestModule, TestRunEndReason } from "vitest/node";
import * as fs from "fs";
import * as crypto from "crypto";
import {
  newsTestSites,
  academicTestSites,
  technicalTestSites,
  ecommerceTestSites,
  jobListingTestSites,
  realEstateTestSites,
  socialMediaTestSites,
  extraTestSites,
} from "./src/lib/testSites";

type TestMeta = {
  file: string;
  vendor: string;
  siteName: string;
  testName: string;
  category: string;
  id: string;
  url?: string;
  state?: string;
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
      ...socialMediaTestSites,
      ...extraTestSites,
    ];

    for (const site of allSites) {
      this.siteNameToUrl.set(site.name, site.url);
    }
  }

  private generateCacheKey(url: string): string {
    return crypto.createHash("md5").update(url).digest("hex");
  }

  private getCacheFilename(url: string): string {
    const domain = url
      .replace(/^https?:\/\//, "")
      .replace(/[\/\?#].*$/, "")
      .replace(/\./g, "-");
    const cacheKey = this.generateCacheKey(url);
    return `${domain}-${cacheKey}.json`;
  }

  private getScrapingTimeFromCache(vendor: string, url: string): number | null {
    try {
      const filename = this.getCacheFilename(url);
      const cachePath = `cache/${vendor}/${filename}`;

      if (fs.existsSync(cachePath)) {
        const cacheData = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        return cacheData.data?.response?.scrapingTimeMs || null;
      }
    } catch (error) {
      // Cache file doesn't exist or is invalid
    }
    return null;
  }

  private parseVendorFromSuite(suiteName: string): string | null {
    const match = suiteName.match(/^(.+?)\s+vendor$/);
    return match ? match[1] : null;
  }

  private extractSiteNameFromTest(testName: string): string {
    const match = testName.match(/^should scrape (.+)$/);
    return match ? match[1] : testName;
  }

  private getCategoryFromFile(fileName: string, suiteName?: string): string {
    const fullContext = `${fileName} ${suiteName || ""}`.toLowerCase();
    if (fullContext.includes("news")) return "news";
    if (fullContext.includes("social")) return "social";
    if (fullContext.includes("academic")) return "academic";
    if (fullContext.includes("technical")) return "technical";
    if (fullContext.includes("ecommerce")) return "ecommerce";
    if (fullContext.includes("jobs")) return "jobs";
    if (fullContext.includes("realestate")) return "realestate";
    return "other";
  }

  private getVendorFromTestCase(testCase: TestCase): string {
    let current: TestCase["parent"] = testCase.parent;
    while (current) {
      if (current.type === "module") break;
      const vendor = this.parseVendorFromSuite(current.name);
      if (vendor) return vendor;
      current = current.parent;
    }
    return "unknown";
  }

  onTestModuleCollected(testModule: TestModule): void {
    for (const testCase of testModule.children.allTests()) {
      const vendor = this.getVendorFromTestCase(testCase);
      const siteName = this.extractSiteNameFromTest(testCase.name);
      const parentName =
        testCase.parent.type === "suite" ? testCase.parent.name : undefined;
      const category = this.getCategoryFromFile(
        testModule.moduleId,
        parentName
      );
      const url = this.siteNameToUrl.get(siteName);

      this.allTests.set(testCase.id, {
        file: testModule.moduleId,
        vendor,
        siteName,
        testName: testCase.name,
        category,
        url,
        id: testCase.id,
      });
    }
  }

  onTestCaseResult(testCase: TestCase): void {
    const meta = this.allTests.get(testCase.id);
    if (meta) {
      meta.state = testCase.result().state;
    }
  }

  onTestRunEnd(
    _testModules: ReadonlyArray<TestModule>,
    _unhandledErrors: ReadonlyArray<unknown>,
    _reason: TestRunEndReason
  ): void {
    // Read scraping times from cache files
    for (const test of this.allTests.values()) {
      if (test.url && test.vendor) {
        test.scrapingTimeMs = this.getScrapingTimeFromCache(
          test.vendor,
          test.url
        );
      }
    }

    // Group by siteName (row) and vendor (column)
    const testData = Array.from(this.allTests.values());
    const vendors = Array.from(new Set(testData.map((t) => t.vendor))).sort();
    const siteNames = Array.from(
      new Set(testData.map((t) => t.siteName))
    ).sort();

    const table: Array<Record<string, string>> = [];

    for (const siteName of siteNames) {
      const row: Record<string, string> = { Site: siteName };

      for (const vendor of vendors) {
        const test = testData.find(
          (t) => t.vendor === vendor && t.siteName === siteName
        );

        if (!test) {
          row[vendor] = "-";
        } else if (test.state === "pass" && test.scrapingTimeMs) {
          const scrapingTimeS = (test.scrapingTimeMs / 1000).toFixed(1);
          row[vendor] = `${scrapingTimeS}s`;
        } else if (test.state === "fail") {
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

    // Separator row
    const separatorRow: Record<string, string> = { Site: "---" };
    for (const vendor of vendors) {
      separatorRow[vendor] = "---";
    }
    table.push(separatorRow);

    // Average time row
    const avgRow: Record<string, string> = { Site: "avg time" };
    for (const vendor of vendors) {
      const vendorTests = testData.filter(
        (t) => t.vendor === vendor && t.scrapingTimeMs && t.scrapingTimeMs > 0
      );

      if (vendorTests.length === 0) {
        avgRow[vendor] = "-";
      } else {
        const totalScrapingTime = vendorTests.reduce(
          (sum, t) => sum + (t.scrapingTimeMs || 0),
          0
        );
        const avgScrapingTimeS = (
          totalScrapingTime /
          vendorTests.length /
          1000
        ).toFixed(1);
        avgRow[vendor] = `${avgScrapingTimeS}s`;
      }
    }
    table.push(avgRow);

    // Success percentage row
    const successRow: Record<string, string> = { Site: "% success" };
    for (const vendor of vendors) {
      const vendorTests = testData.filter((t) => t.vendor === vendor);
      const passedTests = vendorTests.filter((t) => t.state === "pass");

      if (vendorTests.length === 0) {
        successRow[vendor] = "-";
      } else {
        successRow[vendor] = `${passedTests.length}/${vendorTests.length}`;
      }
    }
    table.push(successRow);

    const columns = ["Site", ...vendors];
    const RED = "\x1b[31m";
    const GREEN = "\x1b[32m";
    const RESET = "\x1b[0m";

    function colorize(val: string) {
      if (val === "✓") return GREEN + val + RESET;
      if (val === "✗") return RED + val + RESET;
      if (/^✗ \(\d+\.\d+s\)$/.test(val)) return RED + val + RESET;
      if (/^\d+\.\d+s$/.test(val)) return GREEN + val + RESET;
      if (/^\d+\/\d+$/.test(val)) {
        const [passed, total] = val.split("/").map(Number);
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

    function stripAnsi(str: string) {
      return str.replace(/\x1B\[[0-9;]*m/g, "");
    }

    function printColorTable(
      table: Array<Record<string, string>>,
      columns: string[]
    ) {
      const colWidths = columns.map((col) => {
        return Math.max(
          stripAnsi(col).length,
          ...table.map((row) => stripAnsi(row[col] ?? "").length)
        );
      });
      const header = columns
        .map((col, i) => col.padEnd(colWidths[i]))
        .join("  ");
      console.log(header);
      console.log(colWidths.map((w) => "-".repeat(w)).join("  "));
      for (const row of table) {
        const line = columns
          .map((col, i) => {
            const val = row[col] ?? "";
            const padLen = colWidths[i] + (val.length - stripAnsi(val).length);
            return val.padEnd(padLen);
          })
          .join("  ");
        console.log(line);
      }
    }

    printColorTable(coloredTable, columns);
  }
}
