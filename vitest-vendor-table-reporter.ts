import { Reporter } from "vitest";

type TestMeta = {
  file: string;
  vendor: string;
  siteName: string;
  testName: string;
  category: string;
  id: string;
  result?: { state: string; duration?: number };
};

export default class VendorTableReporter implements Reporter {
  allTests: Map<string, TestMeta> = new Map();

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
            this.allTests.set(task.id, {
              file,
              vendor,
              siteName,
              testName: task.name,
              category,
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
          // console.log("[DEBUG BATCH RESULT]", id, meta.testName, result?.state);
        }
      }
      return;
    }
    const task = taskOrBatch;
    if (task.type === "test") {
      // console.log("[DEBUG TEST RESULT]", task.id, task.name, task.result?.state);
      if (this.allTests.has(task.id)) {
        this.allTests.get(task.id)!.result = task.result;
      }
    }
  }

  onFinished() {
    // Group by category and siteName (row) and vendor (column)
    const testData = Array.from(this.allTests.values());
    const vendors = Array.from(new Set(testData.map((t) => t.vendor))).sort();
    const categories = Array.from(new Set(testData.map((t) => t.category))).sort();



    // Build table rows - grouped by category
    const table: Array<Record<string, string>> = [];

    for (const category of categories) {
      // Add category header row
      const categoryHeader: Record<string, string> = { Site: `--- ${category.toUpperCase()} ---` };
      for (const vendor of vendors) {
        categoryHeader[vendor] = "---";
      }
      table.push(categoryHeader);

      // Get sites for this category
      const categorySites = Array.from(new Set(
        testData.filter(t => t.category === category).map(t => t.siteName)
      )).sort();

      for (const siteName of categorySites) {
        const row: Record<string, string> = { Site: siteName };

        for (const vendor of vendors) {
          const test = testData.find(
            (t) => t.vendor === vendor && t.siteName === siteName && t.category === category
          );

          if (!test) {
            row[vendor] = "-";
          } else if (test.result?.state === "pass") {
            // Show timing for successful scrapes (duration is already in seconds)
            const durationS = test.result.duration || 0;
            row[vendor] = `${durationS.toFixed(1)}s`;
          } else if (test.result?.state === "fail") {
            // Show timing for failed scrapes too, but with X indicator
            const durationS = test.result.duration || 0;
            row[vendor] = `✗ (${durationS.toFixed(1)}s)`;
          } else {
            row[vendor] = "?";
          }
        }
        table.push(row);
      }
    }

    // Add average time row
    const avgRow: Record<string, string> = { Site: "avg time" };
    for (const vendor of vendors) {
      const vendorTests = testData.filter(
        (t) => t.vendor === vendor && t.result?.state === "pass"
      );

      if (vendorTests.length === 0) {
        avgRow[vendor] = "-";
      } else {
        const totalDuration = vendorTests.reduce(
          (sum, t) => sum + (t.result?.duration || 0), 0
        );
        const avgDurationS = (totalDuration / vendorTests.length).toFixed(1);
        avgRow[vendor] = `${avgDurationS}s`;
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
        const successRate = Math.round((passedTests.length / vendorTests.length) * 100);
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
