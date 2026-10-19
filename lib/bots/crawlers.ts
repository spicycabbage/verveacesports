/**
 * Search engines and AI-discovery agents may read public pages. Everything
 * else that looks like a bot, spider, or scraper gets a hard 403 from proxy.ts.
 * robots.txt is only a hint — named groups do not inherit User-agent: *.
 *
 * Google-Extended and Applebot-Extended are robots.txt tokens, not HTTP
 * user-agents. Googlebot / Bingbot are real crawlers (search, including AI
 * Overviews) and must be classified before the generic bot check.
 */

export const ROBOTS_DISALLOW = [
  "/admin",
  "/account",
  "/api/",
  "/cart",
  "/checkout",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/callback",
  "/theme",
  "/offline",
] as const;

/** Search-engine crawlers. Checked before the generic bot deny. */
export const SEARCH_ROBOTS_AGENTS = [
  "Googlebot",
  "Google-InspectionTool",
  "Storebot-Google",
  "AdsBot-Google",
  "Mediapartners-Google",
  "FeedFetcher-Google",
  "bingbot",
  "msnbot",
  "BingPreview",
  "adidxbot",
  "DuckDuckBot",
  "Applebot",
  "Slurp",
  "YandexBot",
  "Baiduspider",
  "Sogou",
  "Yeti",
  "SeznamBot",
  "Qwantify",
  "BraveBot",
  "Kagibot",
] as const;

/** Discovery (training + index) and user-triggered fetchers that cite the store. */
export const LLM_ROBOTS_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "OAI-AdsBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "Meta-ExternalAgent",
  "meta-externalfetcher",
  "cohere-ai",
  "CCBot",
  "DuckAssistBot",
  "YouBot",
  "MistralAI-User",
  "PhindBot",
  "GrokBot",
  "xAI-Grok",
  "Google-Agent",
  "Google-CloudVertexBot",
  "Gemini-Deep-Research",
  "Amzn-SearchBot",
  "Amzn-User",
  "Meta-WebIndexer",
  "DeepSeekBot",
  "ExaBot",
  "TavilyBot",
  "FirecrawlAgent",
] as const;

/** Link unfurlers. Not catalog scrapers; still dropped from analytics. */
const PREVIEW_AGENTS = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "LinkedInBot",
  "Slackbot",
  "Slack-ImgProxy",
  "Discordbot",
  "TelegramBot",
  "WhatsApp",
  "SkypeUriPreview",
  "Pinterestbot",
  "redditbot",
  "Embedly",
  "Iframely",
] as const;

/** Bots that harvest the catalog. Library clients are blocked in the proxy only. */
export const SCRAPER_ROBOTS_AGENTS = [
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "BLEXBot",
  "DataForSeoBot",
  "PetalBot",
  "AspiegelBot",
  "Bytespider",
  "SerpstatBot",
  "SeekportBot",
  "ZoominfoBot",
  "ImagesiftBot",
  "Diffbot",
  "magpie-crawler",
  "MegaIndex",
  "SEOkicks",
  "Sistrix",
  "Barkrowler",
  "LinkpadBot",
  "spbot",
  "crawler4j",
  "YisouSpider",
  "AhrefsSiteAudit",
  "rogerbot",
  "Screaming Frog SEO Spider",
  "linkdexbot",
  "DomainStatsBot",
  "SiteCheckerBotCrawler",
  "Cocolyzebot",
  "SeobilityBot",
  "SenutoBot",
  "BrightEdge",
  "SEOlizer",
  "hypestat",
  "NetcraftSurveyAgent",
  "CensysInspect",
  "Shodan",
  "SimilarWeb",
  "BuiltWith",
  "Wappalyzer",
  "TurnitinBot",
  "Grapeshot",
  "proximic",
  "AwarioBot",
  "Leadfeeder",
  "ia_archiver",
  "archive.org_bot",
  "GoogleOther",
] as const;

const SCRAPER_CLIENT_TOKENS = [
  "Scrapy",
  "python-requests",
  "Python-urllib",
  "aiohttp",
  "python-httpx",
  "httpx/",
  "Go-http-client",
  "Apache-HttpClient",
  "libwww-perl",
  "lwp-trivial",
  "WWW-Mechanize",
  "colly",
  "node-fetch",
  "undici",
  "okhttp",
  "sqlmap",
  "nikto",
  "masscan",
  "zgrab",
  "Nuclei",
  "Nmap Scripting Engine",
  "dirbuster",
  "gobuster",
  "curl/",
  "Wget/",
  "Java/",
  "HTTrack",
  "WebCopier",
  "WebZIP",
  "TeleportPro",
  "Offline Explorer",
  "HeadlessChrome",
  "PhantomJS",
  "Selenium",
  "Puppeteer",
  "Playwright",
  "SlimerJS",
  "Lighthouse",
  "Chrome-Lighthouse",
  "PTST",
] as const;

const SEARCH_UA_RE = compileTokens(SEARCH_ROBOTS_AGENTS);
const LLM_UA_RE = compileTokens(LLM_ROBOTS_AGENTS);
const PREVIEW_UA_RE = compileTokens(PREVIEW_AGENTS);
const SCRAPER_UA_RE = compileTokens([...SCRAPER_ROBOTS_AGENTS, ...SCRAPER_CLIENT_TOKENS]);
const GENERIC_BOT_RE =
  /(?:^|[^a-z])[a-z]*bot(?:[^a-z]|$)|crawler|spider|scraper|headlesschrome|phantomjs|selenium|puppeteer|playwright/i;

export const CONTENT_SIGNAL_PUBLIC = "search=yes, ai-input=yes, ai-train=yes";
export const CONTENT_SIGNAL_PRIVATE = "search=no, ai-input=no, ai-train=no";

export type CrawlerClass = "search" | "llm" | "preview" | "scraper" | "visitor";

export function isPrivateStorePath(pathname: string): boolean {
  return ROBOTS_DISALLOW.some((path) => {
    const prefix = path.endsWith("/") ? path.slice(0, -1) : path;
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

export function contentSignalForPath(pathname: string): string {
  return isPrivateStorePath(pathname) ? CONTENT_SIGNAL_PRIVATE : CONTENT_SIGNAL_PUBLIC;
}

export function classifyUserAgent(ua: string | null): CrawlerClass {
  const raw = ua?.trim() ?? "";
  if (!raw) return "scraper";
  if (SEARCH_UA_RE.test(raw)) return "search";
  if (LLM_UA_RE.test(raw)) return "llm";
  if (PREVIEW_UA_RE.test(raw)) return "preview";
  if (SCRAPER_UA_RE.test(raw)) return "scraper";
  if (GENERIC_BOT_RE.test(raw.replace(/cubot/gi, ""))) return "scraper";
  return "visitor";
}

function compileTokens(tokens: readonly string[]): RegExp {
  const source = [...tokens]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");
  return new RegExp(source, "i");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
