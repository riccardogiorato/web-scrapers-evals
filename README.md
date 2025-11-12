# web-scrapers-evals

Trying to find the best web scraper to allow LLM to access any web page

## Test Results

> 12 November 2025

| Site                                  | exa      | firecrawl | linkup | tavily   |
| ------------------------------------- | -------- | --------- | ------ | -------- |
| Amazon Product Page                   | 0.4s     | 1.9s      | 8.7s   | 3.5s     |
| BBC Technology News                   | 1.0s     | 1.4s      | 6.8s   | 1.4s     |
| GitHub TypeScript README              | 0.5s     | 1.3s      | 3.7s   | ✗ (1.5s) |
| IEEE Xplore Technical Paper           | 0.4s     | 1.4s      | 9.1s   | ✗ (1.3s) |
| Indeed Product Manager Usa Jobs       | ✗ (0.2s) | 1.3s      | ✗      | 0.2s     |
| Instagram NASA Profile                | 0.2s     | ✗ (0.2s)  | ✗      | ✗ (0.4s) |
| Instagram National Geographic Profile | ✗ (0.3s) | ✗ (0.1s)  | 3.8s   | ✗ (0.4s) |
| MDN Web API Documentation             | 0.2s     | 1.2s      | 6.5s   | 0.2s     |
| New York Times Technology             | ✗ (0.2s) | ✗ (0.1s)  | 4.3s   | 0.3s     |
| Nutlope                               | 0.6s     | 0.7s      | 1.0s   | 0.8s     |
| PubMed Medical Article                | 0.2s     | 1.1s      | 6.9s   | 1.3s     |
| Realtor.com Property Details          | 0.3s     | 1.2s      | 7.8s   | 0.2s     |
| Redfin Home Listing                   | 0.2s     | 1.3s      | 10.1s  | ✗ (0.3s) |
| Reuters Business Article              | 0.2s     | 0.7s      | 12.8s  | 0.3s     |
| Shopify merch store                   | 0.2s     | 0.9s      | 2.6s   | 2.1s     |
| Stack Overflow Question               | 0.2s     | 1.6s      | ✗      | 0.2s     |
| Tesla Store Product                   | 0.2s     | 23.5s     | ✗      | ✗ (0.4s) |
| Together AI                           | 0.2s     | 1.2s      | 4.2s   | 0.3s     |
| Weworkremotely Remote Full Stack Jobs | 0.3s     | 0.9s      | 12.3s  | 1.4s     |
| X.com Elon Musk Profile               | ✗ (0.3s) | ✗ (0.1s)  | 2.3s   | 0.2s     |
| X.com Together Compute Profile        | ✗ (0.3s) | ✗ (0.1s)  | 2.8s   | ✗ (0.3s) |
| Zillow Condo Listing                  | 0.6s     | 1.1s      | 35.4s  | ✗ (0.3s) |
| Zillow Single Family Home             | 0.2s     | 0.8s      | ✗      | ✗ (0.5s) |
| ZipRecruiter Plumber Jobs             | 0.2s     | 0.7s      | 2.6s   | ✗ (0.5s) |
| arXiv Computer Science Paper          | 0.3s     | 1.3s      | 4.1s   | 1.3s     |
| ---                                   | ---      | ---       | ---    | ---      |
| avg time                              | 0.3s     | 1.8s      | 7.4s   | 0.8s     |
| % success                             | 20/25    | 20/25     | 20/25  | 15/25    |
