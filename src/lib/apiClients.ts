import { createTogetherAI } from "@ai-sdk/togetherai";
import { LinkupClient } from "linkup-sdk";
import FirecrawlApp from "@mendable/firecrawl-js";
import Exa from "exa-js";
import { BraveSearch } from "brave-search";
import "dotenv/config";

export const firecrawlClient = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY ?? "",
});

export const togetheraiClient = createTogetherAI({
  apiKey: process.env.TOGETHER_API_KEY ?? "",
});

export const linkupClient = new LinkupClient({
  apiKey: process.env.LINKUP_API_KEY ?? "",
});

export const exaClient = new Exa(process.env.EXA_API_KEY ?? "");

export const braveSearchClient = new BraveSearch(
  process.env.BRAVE_API_KEY ?? ""
);
