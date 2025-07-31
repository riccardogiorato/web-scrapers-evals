import { TestSite } from "./types";

// Comprehensive test sites for web scraper evaluation
// Includes real-world use cases (jobs, real estate, social media) and content quality sites (academic, news, technical, e-commerce)

// Job listing test sites - structured employment data
export const jobListingTestSites: TestSite[] = [
  {
    name: "Weworkremotely Remote Full Stack Jobs",
    url: "https://weworkremotely.com/categories/remote-full-stack-programming-jobs#job-listings",
    category: "jobs"
  },
  {
    name: "Indeed Product Manager Usa Jobs",
    url: "https://www.indeed.com/q-product-manager-usa-jobs.html",
    category: "jobs"
  },
  {
    name: "ZipRecruiter Plumber Jobs",
    url: "https://www.ziprecruiter.ie/jobs/search?q=Journeyman+Plumber&utm_source=zr-go-redirect",
    category: "jobs"
  }
];

// Real estate test sites - property listings and details
export const realEstateTestSites: TestSite[] = [
  {
    name: "Zillow Single Family Home",
    url: "https://www.zillow.com/homedetails/123-Main-St-Anytown-CA-90210/12345_zpid/",
    category: "realestate"
  },
  {
    name: "Zillow Condo Listing",
    url: "https://www.zillow.com/prattville-al/",
    category: "realestate"
  },
  {
    name: "Realtor.com Property Details",
    url: "https://www.realtor.com/realestateforsale",
    category: "realestate"
  },
  {
    name: "Redfin Home Listing",
    url: "https://www.redfin.com/houses-near-me",
    category: "realestate"
  }
];

// Social media test sites - public profiles and posts (within ToS)
export const socialMediaTestSites: TestSite[] = [
  {
    name: "Instagram NASA Profile",
    url: "https://www.instagram.com/nasa/",
    category: "social"
  },
  {
    name: "Instagram National Geographic Profile",
    url: "https://www.instagram.com/natgeo/",
    category: "social"
  },
  {
    name: "X.com Elon Musk Profile",
    url: "https://x.com/elonmusk",
    category: "social"
  },
  {
    name: "X.com Together Compute Profile",
    url: "https://x.com/togethercompute",
    category: "social"
  },
];

// Academic test sites - research papers and scholarly content
export const academicTestSites: TestSite[] = [
  { name: "arXiv Computer Science Paper", url: "https://arxiv.org/abs/2301.00001", category: "academic" },
  { name: "PubMed Medical Article", url: "https://pubmed.ncbi.nlm.nih.gov/36000000/", category: "academic" },
  { name: "IEEE Xplore Technical Paper", url: "https://ieeexplore.ieee.org/document/9000000", category: "academic" }
];

// News test sites - articles with potential paywalls
export const newsTestSites: TestSite[] = [
  { name: "BBC Technology News", url: "https://www.bbc.com/news/technology", category: "news" },
  { name: "Reuters Business Article", url: "https://www.reuters.com/business/", category: "news" },
  { name: "New York Times Technology", url: "https://www.nytimes.com/section/technology", category: "news" }
];

// Technical documentation sites - structured content with code examples
export const technicalTestSites: TestSite[] = [
  { name: "MDN Web API Documentation", url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API", category: "technical" },
  { name: "Stack Overflow Question", url: "https://stackoverflow.com/questions/979256/sorting-an-array-of-objects-by-property-values", category: "technical" },
  { name: "GitHub TypeScript README", url: "https://github.com/microsoft/TypeScript/blob/main/README.md", category: "technical" }
];

// E-commerce sites - product information and structured data
export const ecommerceTestSites: TestSite[] = [
  { name: "Amazon Product Page", url: "https://www.amazon.com/New-Amazon-Kindle-glare-free-adjustable/dp/B0DDZQTYHL", category: "ecommerce" },
  { name: "Shopify merch store", url: "https://shopify.supply/products/shopify-counter", category: "ecommerce" },
  { name: "Tesla Store Product", url: "https://shop.tesla.com/product/model-s-key-fob", category: "ecommerce" }
];

// All test sites combined - real-world and content quality
export const ALL_TEST_SITES: TestSite[] = [
  ...jobListingTestSites,
  ...realEstateTestSites,
  ...socialMediaTestSites,
  ...academicTestSites,
  ...newsTestSites,
  ...technicalTestSites,
  ...ecommerceTestSites
];

