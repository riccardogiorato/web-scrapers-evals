# web-scrapers-evals

Trying to find the best web scraper to allow LLM to access any web page

## Current Results

Current cold-cache eval run from 30 June 2026:

| Provider | Success | Avg time | Notes |
| --- | --- | --- | --- |
| firecrawl | 22/25 | 1.8s | Best current success/latency balance in this run. |
| exa | 21/25 | 1.2s | Fastest successful provider on average. |
| linkup | 18/25 | 6.1s | Slowest of the keyed providers and failed several protected pages. |
| parallel | 12/25 | 5.0s | Anonymous Search MCP hit the free-tier rate limit during the full concurrent eval. |

Parallel MCP can perform much better on small or cached runs, but the anonymous free tier is not comparable to keyed providers for a full cold-cache concurrent benchmark. Set `PARALLEL_API_KEY` to evaluate the higher-limit path.

## Test Results

> 30 June 2026, cold cache, full concurrent Vitest matrix.

| Site                                  | firecrawl | exa      | linkup | parallel   |
| ------------------------------------- | --------- | -------- | ------ | ---------- |
| Amazon Product Page                   | 1.7s      | 0.4s     | 3.7s   | 7.0s       |
| arXiv Computer Science Paper          | 0.9s      | 0.4s     | 1.2s   | 3.7s       |
| BBC Technology News                   | 1.1s      | 0.9s     | 3.6s   | 1.3s       |
| GitHub TypeScript README              | 1.1s      | 0.4s     | 3.5s   | 2.1s       |
| IEEE Xplore Technical Paper           | 1.0s      | 0.4s     | ✗      | 2.9s       |
| Indeed Product Manager Usa Jobs       | 0.7s      | 0.8s     | 17.5s  | 6.8s       |
| Instagram NASA Profile                | ✗ (0.4s)  | 1.1s     | 4.4s   | 6.9s       |
| Instagram National Geographic Profile | ✗ (0.2s)  | 1.3s     | ✗      | 6.9s       |
| MDN Web API Documentation             | 0.4s      | 1.7s     | 0.7s   | 7.6s       |
| New York Times Technology             | ✗ (0.3s)  | ✗ (1.6s) | 30.0s  | 5.0s       |
| Nutlope                               | 0.5s      | 1.5s     | 0.6s   | 4.9s       |
| PubMed Medical Article                | 0.4s      | 1.5s     | 0.5s   | 5.0s       |
| Realtor.com Property Details          | 0.4s      | 1.5s     | ✗      | rate limit |
| Redfin Home Listing                   | 0.9s      | 1.4s     | 17.7s  | rate limit |
| Reuters Business Article              | 0.3s      | ✗ (1.2s) | ✗      | rate limit |
| Shopify merch store                   | 0.4s      | 1.3s     | 2.2s   | rate limit |
| Stack Overflow Question               | 0.9s      | 1.3s     | 5.4s   | rate limit |
| Tesla Store Product                   | 0.5s      | 1.3s     | ✗      | rate limit |
| Together AI                           | 0.5s      | 1.3s     | 2.2s   | rate limit |
| Weworkremotely Remote Full Stack Jobs | 0.6s      | 1.4s     | 9.1s   | rate limit |
| X.com Elon Musk Profile               | 4.9s      | ✗ (1.3s) | 0.5s   | rate limit |
| X.com Together Compute Profile        | 7.5s      | ✗ (1.3s) | 0.4s   | rate limit |
| Zillow Condo Listing                  | 5.1s      | 1.3s     | ✗      | rate limit |
| Zillow Single Family Home             | 15.1s     | 1.4s     | ✗      | rate limit |
| ZipRecruiter Plumber Jobs             | 0.4s      | 1.4s     | 6.0s   | rate limit |
| ---                                   | ---       | ---      | ---    | ---        |
| avg time                              | 1.8s      | 1.2s     | 6.1s   | 5.0s       |
| % success                             | 22/25     | 21/25    | 18/25  | 12/25      |

## Parallel MCP Notes

This integration uses `https://search.parallel.ai/mcp` with the `web_fetch` tool. The Search MCP docs say `web_search` runs in `basic` mode for low-latency agent loops, but `web_fetch` is backed by Extract API and does not expose a `basic`/`advanced` mode in the MCP tool schema.

The scraper requests `full_content: true` for scraper-style full-page markdown and falls back to excerpts when full content is empty. Results are cached through the existing `withCache("parallel", ...)` wrapper.

Configuration:

| Env var | Purpose |
| --- | --- |
| `PARALLEL_API_KEY` | Optional Bearer token for higher MCP limits. Omit for anonymous free-tier use. |
| `PARALLEL_MCP_URL` | Override the MCP endpoint. Defaults to `https://search.parallel.ai/mcp`. |
| `PARALLEL_MCP_MAX_CONCURRENCY` | Override Parallel MCP concurrency. Defaults to `1` without an API key and `4` with an API key. |
