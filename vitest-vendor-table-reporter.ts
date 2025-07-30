import { Reporter } from "vitest";

type TestMeta = {
  file: string;
  vendor: string;
  testType: string;
  testName: string;
  id: string;
  result?: { state: string; duration?: number };
};

export default class VendorTableReporter implements Reporter {
  allTests: Map<string, TestMeta> = new Map();

  onCollected(files: any) {
    function parseVendorAndTestType(suiteName: string) {
      const match = suiteName.match(/^\[(.+?)\] (.+)$/);
      if (!match) return { vendor: "unknown", testType: suiteName };
      return { vendor: match[1], testType: match[2] };
    }
    function walkSuite(this: VendorTableReporter, suite: any, file: string) {
      if (suite.tasks) {
        for (const task of suite.tasks) {
          if (task.type === "suite") {
            walkSuite.call(this, task, file);
          } else if (task.type === "test") {
            const parentSuite = suite;
            const { vendor, testType } = parseVendorAndTestType(
              parentSuite.name
            );
            this.allTests.set(task.id, {
              file,
              vendor,
              testType,
              testName: task.name,
              id: task.id,
            });
            // console.log("[onCollected] Collected test:", task.id, task.name);
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
    // Group by testType (row) and vendor (column)
    const testData = Array.from(this.allTests.values());
    const vendors = Array.from(new Set(testData.map((t) => t.vendor)));
    let testTypes = Array.from(new Set(testData.map((t) => t.testType)));
    testTypes = testTypes.sort((a, b) => a.localeCompare(b));
    // Build table rows
    const table: Array<Record<string, string>> = [];
    for (const testType of testTypes) {
      const row: Record<string, string> = { Test: testType };
      for (const vendor of vendors) {
        const tests = testData.filter(
          (t) => t.vendor === vendor && t.testType === testType
        );
        if (tests.length === 0) {
          row[vendor] = "-";
        } else if (testType.toLowerCase().includes("latency")) {
          // Show average latency in seconds (to 2 decimal places)
          const latencies = tests
            .map((t) => t.result?.duration)
            .filter((d): d is number => typeof d === "number");
          if (latencies.length > 0) {
            const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
            row[vendor] = avg.toFixed(2) + "s";
          } else {
            row[vendor] = "?";
          }
        } else if (tests.length === 1) {
          const state = tests[0].result?.state;
          row[vendor] = state === "pass" ? "✓" : state === "fail" ? "✗" : "?";
        } else {
          // Multiple tests per cell: show percent passed
          const passed = tests.filter((t) => t.result?.state === "pass").length;
          row[vendor] = `${passed}/${tests.length} (${Math.round(
            (passed / tests.length) * 100
          )}%)`;
        }
      }
      table.push(row);
    }
    // Add overall row (global pass rate: total passed / total tests, excluding latency)
    const overall: Record<string, string> = { Test: "Overall" };
    for (const vendor of vendors) {
      let totalPassed = 0,
        totalTests = 0;
      for (const testType of testTypes) {
        if (testType.toLowerCase().includes("latency")) continue;
        const tests = testData.filter(
          (t) => t.vendor === vendor && t.testType === testType
        );
        if (tests.length === 0) continue;
        totalPassed += tests.filter((t) => t.result?.state === "pass").length;
        totalTests += tests.length;
      }
      overall[vendor] = totalTests
        ? `${Math.round(
            (totalPassed / totalTests) * 100
          )}% (${totalPassed}/${totalTests})`
        : "-";
    }
    table.push(overall);
    // Print table without index column, with color
    const columns = ["Test", ...vendors];
    const RED = "\x1b[31m";
    const GREEN = "\x1b[32m";
    const RESET = "\x1b[0m";
    // Colorize table cells
    function colorize(val: string) {
      if (val === "✓" || val === "100%") return GREEN + val + RESET;
      if (
        val === "✗" ||
        (/^\d+\/\d+ \(\d+%\)$/.test(val) && !val.includes("100%"))
      )
        return RED + val + RESET;
      if (/^\d+%$/.test(val)) {
        const num = parseInt(val);
        if (num === 100) return GREEN + val + RESET;
        if (num < 100) return RED + val + RESET;
      }
      if (/\(\d+%\)/.test(val)) {
        const percent = parseInt(val.match(/\((\d+)%\)/)?.[1] || "0");
        if (percent === 100) return GREEN + val + RESET;
        if (percent < 100) return RED + val + RESET;
      }
      if (val === "✗") return RED + val + RESET;
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
