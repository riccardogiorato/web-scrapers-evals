# web-scrapers-evals

Trying to find the best web scraper to allow LLM to access any web page

## Test Results

> 11 November 2025

| Site                                  | exa      | firecrawl |
| ------------------------------------- | -------- | --------- |
| Amazon Product Page                   | 0.3s     | 1.6s      |
| BBC Technology News                   | 0.3s     | 1.2s      |
| GitHub TypeScript README              | 0.3s     | 1.0s      |
| IEEE Xplore Technical Paper           | 0.3s     | 1.1s      |
| Indeed Product Manager Usa Jobs       | ✗ (0.2s) | 0.9s      |
| Instagram NASA Profile                | 0.2s     | ✗ (0.1s)  |
| Instagram National Geographic Profile | ✗ (0.2s) | ✗ (0.1s)  |
| MDN Web API Documentation             | 0.2s     | 0.9s      |
| New York Times Technology             | 0.2s     | ✗ (0.1s)  |
| Nutlope                               | 0.4s     | 0.7s      |
| PubMed Medical Article                | 0.2s     | 0.8s      |
| Realtor.com Property Details          | 0.2s     | 0.9s      |
| Redfin Home Listing                   | 0.2s     | 1.2s      |
| Reuters Business Article              | 0.2s     | 0.6s      |
| Shopify merch store                   | 0.2s     | 1.0s      |
| Stack Overflow Question               | 0.3s     | 1.2s      |
| Tesla Store Product                   | 0.3s     | 14.0s     |
| Together AI                           | 0.3s     | 1.3s      |
| Weworkremotely Remote Full Stack Jobs | 0.2s     | 0.8s      |
| X.com Elon Musk Profile               | ✗ (0.3s) | ✗ (0.1s)  |
| X.com Together Compute Profile        | ✗ (0.2s) | ✗ (0.1s)  |
| Zillow Condo Listing                  | 0.2s     | 0.7s      |
| Zillow Single Family Home             | 0.2s     | 0.8s      |
| ZipRecruiter Plumber Jobs             | 0.2s     | 0.7s      |
| arXiv Computer Science Paper          | 0.3s     | 1.0s      |
| ---                                   | ---      | ---       |
| avg time                              | 0.3s     | 1.3s      |
| % success                             | 21/25    | 20/25     |
