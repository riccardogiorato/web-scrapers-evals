import { defineConfig } from "vitest/config";
import VendorTableReporter from "./vitest-vendor-table-reporter";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    testTimeout: 20000, // 20 seconds for all tests
    reporters: ["html", "default", new VendorTableReporter()],
  },
});
