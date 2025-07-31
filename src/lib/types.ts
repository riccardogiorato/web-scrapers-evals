
// Scraping functionality types
export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  responseTime: number;
  error?: string;
}

export type ScraperFunction = (
  url: string,
  timeout?: number
) => Promise<ScrapedContent>;

// Test site interfaces
export interface TestSite {
  name: string;
  url: string;
  category?: 'academic' | 'news' | 'technical' | 'ecommerce' | 'jobs' | 'realestate' | 'social';
}
