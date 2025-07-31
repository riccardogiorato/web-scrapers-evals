import { TestSite } from "./types";

// Comprehensive test sites for web scraper evaluation
// Includes real-world use cases (jobs, real estate, social media) and content quality sites (academic, news, technical, e-commerce)

// Job listing test sites - structured employment data
export const jobListingTestSites: TestSite[] = [
  {
    name: "Indeed Software Engineer Job",
    url: "https://www.indeed.com/viewjob?jk=example-software-engineer",
    category: "jobs"
  },
  {
    name: "LinkedIn Product Manager Position",
    url: "https://www.linkedin.com/jobs/view/example-product-manager",
    category: "jobs"
  },
  {
    name: "Indeed Remote Developer Role",
    url: "https://www.indeed.com/viewjob?jk=remote-developer-example",
    category: "jobs"
  },
  {
    name: "LinkedIn Data Scientist Opening",
    url: "https://www.linkedin.com/jobs/view/data-scientist-example",
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
    url: "https://www.zillow.com/homedetails/456-Oak-Ave-Unit-2B-Somewhere-NY-10001/67890_zpid/",
    category: "realestate"
  },
  {
    name: "Realtor.com Property Details",
    url: "https://www.realtor.com/realestateandhomes-detail/789-Pine-St_Hometown_TX_75001_M12345-67890",
    category: "realestate"
  },
  {
    name: "Redfin Home Listing",
    url: "https://www.redfin.com/CA/Los-Angeles/321-Elm-Dr-90210/home/example",
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
    name: "Instagram Public Post Example",
    url: "https://www.instagram.com/p/example-public-post/",
    category: "social"
  },
  {
    name: "Instagram Science Museum Profile",
    url: "https://www.instagram.com/sciencemuseum/",
    category: "social"
  }
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
  { name: "Stack Overflow Question", url: "https://stackoverflow.com/questions/1", category: "technical" },
  { name: "GitHub TypeScript README", url: "https://github.com/microsoft/TypeScript/blob/main/README.md", category: "technical" }
];

// E-commerce sites - product information and structured data
export const ecommerceTestSites: TestSite[] = [
  { name: "Amazon Product Page", url: "https://www.amazon.com/dp/B08N5WRWNW", category: "ecommerce" },
  { name: "eBay Auction Item", url: "https://www.ebay.com/itm/123456789", category: "ecommerce" },
  { name: "Tesla Store Product", url: "https://shop.tesla.com/product/model-s-key-fob", category: "ecommerce" }
];

// All test sites combined - real-world and content quality
export const allTestSites: TestSite[] = [
  ...jobListingTestSites,
  ...realEstateTestSites,
  ...socialMediaTestSites,
  ...academicTestSites,
  ...newsTestSites,
  ...technicalTestSites,
  ...ecommerceTestSites
];

