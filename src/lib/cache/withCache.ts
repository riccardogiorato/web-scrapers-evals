import { ScrapedContent, ScraperFunction } from "../types";

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const CACHE_BASE_DIR = './cache';
const CACHE_TTL_SECONDS = 86400; // 24 hours

interface CacheEntry {
    data: ScrapedContent;
    timestamp: number;
  }

function urlToFilename(url: string): string {
    // Create a safe filename from URL using hash to avoid filesystem issues
    const hash = crypto.createHash('md5').update(url).digest('hex');
    const domain = new URL(url).hostname.replace(/\./g, '-');
    return `${domain}-${hash}.json`;
  }
  
  async function ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }
  }
  
  export function withCache(vendor: string, fn: ScraperFunction): ScraperFunction {
    return async (url: string, timeout?: number) => {
      const vendorDir = path.join(CACHE_BASE_DIR, vendor);
      const filename = urlToFilename(url);
      const filePath = path.join(vendorDir, filename);
      
      try {
        // Check if cached file exists and is still valid
        const cached = await fs.readFile(filePath, 'utf-8');
        const cacheEntry: CacheEntry = JSON.parse(cached);
        const now = Date.now();
        
        if (now - cacheEntry.timestamp < CACHE_TTL_SECONDS * 1000) {
          return cacheEntry.data;
        }
      } catch (error) {
        // Cache miss or invalid cache, continue to fetch
      }
      
      // Fetch fresh data
      const result = await fn(url, timeout);
      
      // Save to cache
      try {
        await ensureDir(vendorDir);
        const cacheEntry: CacheEntry = {
          data: result,
          timestamp: Date.now()
        };
        await fs.writeFile(filePath, JSON.stringify(cacheEntry, null, 2));
      } catch (error) {
        console.warn(`Failed to cache result for ${url}:`, error);
      }
      
      return result;
    };
  }
  