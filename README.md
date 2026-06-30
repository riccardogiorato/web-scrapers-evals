# web-scrapers-evals

Trying to find the best web scraper to allow LLM to access any web page

## Leaderboard

Based on success rate and average response time:

🥇 **Gold: Exa** - 22/25 success rate (88%), avg 0.3s
🥈 **Silver: Linkup** - 20/25 success rate (80%), avg 7.2s  
🥉 **Bronze: Firecrawl** - 19/25 success rate (76%), avg 1.8s

## Test Results

> 16 February 2026

| Site                                  | exa      | firecrawl | linkup |
| ------------------------------------- | -------- | --------- | ------ |
| Amazon Product Page                   | 0.3s     | ✗ (0.1s)  | 8.0s   |
| arXiv Computer Science Paper          | 0.3s     | 0.8s      | 3.1s   |
| BBC Technology News                   | 0.4s     | 1.0s      | 6.0s   |
| GitHub TypeScript README              | 0.3s     | 0.7s      | 6.2s   |
| IEEE Xplore Technical Paper           | 0.3s     | 0.9s      | 11.9s  |
| Indeed Product Manager Usa Jobs       | ✗ (0.2s) | 0.8s      | ✗      |
| Instagram NASA Profile                | 0.2s     | ✗ (0.1s)  | 3.8s   |
| Instagram National Geographic Profile | 0.2s     | ✗ (0.1s)  | 3.3s   |
| MDN Web API Documentation             | 0.2s     | 0.4s      | 3.1s   |
| New York Times Technology             | 0.2s     | ✗ (0.1s)  | 7.4s   |
| Nutlope                               | 0.3s     | 0.3s      | 1.4s   |
| PubMed Medical Article                | 0.3s     | 0.5s      | 2.8s   |
| Realtor.com Property Details          | 0.3s     | 0.5s      | 28.2s  |
| Redfin Home Listing                   | 0.2s     | 0.5s      | 9.7s   |
| Reuters Business Article              | 0.2s     | 0.3s      | 37.8s  |
| Shopify merch store                   | 0.2s     | 0.3s      | 3.0s   |
| Stack Overflow Question               | 0.2s     | 0.6s      | ✗      |
| Tesla Store Product                   | 0.2s     | 0.3s      | ✗      |
| Together AI                           | 0.2s     | 0.5s      | 5.3s   |
| Weworkremotely Remote Full Stack Jobs | 0.2s     | 0.4s      | 10.4s  |
| X.com Elon Musk Profile               | ✗ (0.2s) | ✗ (0.1s)  | 35.5s  |
| X.com Together Compute Profile        | ✗ (0.3s) | ✗ (0.1s)  | 3.2s   |
| Zillow Condo Listing                  | 0.3s     | 0.3s      | 18.4s  |
| Zillow Single Family Home             | 0.3s     | 0.3s      | ✗      |
| ZipRecruiter Plumber Jobs             | 0.3s     | 0.3s      | 10.1s  |
| ---                                   | ---      | ---       | ---    |
| avg time                              | 0.3s     | 1.8s      | 7.2s   |
| % success                             | 22/25    | 19/25     | 20/25  |
