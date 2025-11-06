import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapingOptions {
  url: string;
  render?: boolean;
  country?: string;
  deviceType?: "desktop" | "mobile";
  wait?: number;
  screenshots?: boolean;
  javascript?: boolean;
}

export interface ScrapingResult {
  success: boolean;
  html?: string;
  text?: string;
  screenshot?: string;
  url?: string;
  statusCode?: number;
  error?: string;
}

/**
 * ScrapingBee API Integration
 * Handles JavaScript rendering, proxies, and anti-bot detection
 */
export class ScrapingBeeService {
  private apiKey: string;
  private baseUrl = "https://app.scrapingbee.com/api/v1";

  constructor() {
    this.apiKey = process.env.SCRAPINGBEE_API_KEY || "";
  }

  /**
   * Scrape a website with JavaScript rendering
   */
  async scrape(options: ScrapingOptions): Promise<ScrapingResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: "ScrapingBee API key not configured",
        };
      }

      const params: Record<string, any> = {
        api_key: this.apiKey,
        url: options.url,
        render_js: options.render || true, // Render JavaScript by default
        device_type: options.deviceType || "desktop",
      };

      // Add country proxy if specified (India = IN)
      if (options.country) {
        params.country_code = options.country.toUpperCase();
      }

      // Add wait time for dynamic content
      if (options.wait) {
        params.wait = options.wait;
      }

      // Request screenshot if needed
      if (options.screenshots) {
        params.screenshot = true;
      }

      const response = await axios.get(this.baseUrl, {
        params,
        responseType: "text",
        timeout: 30000, // 30 second timeout
      });

      return {
        success: true,
        html: response.data,
        text: this.extractText(response.data),
        statusCode: response.status,
        url: options.url,
      };
    } catch (error: any) {
      console.error("ScrapingBee error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status,
      };
    }
  }

  /**
   * Scrape Khan Academy content
   */
  async scrapeKhanAcademy(url: string): Promise<ScrapingResult> {
    return this.scrape({
      url: `https://www.khanacademy.org${url}`,
      render: true,
      country: "US",
      wait: 3000, // Wait 3 seconds for JavaScript to load
    });
  }

  /**
   * Scrape Unacademy content
   */
  async scrapeUnacademy(url: string): Promise<ScrapingResult> {
    return this.scrape({
      url: `https://unacademy.com${url}`,
      render: true,
      country: "IN", // India
      wait: 3000,
      deviceType: "desktop",
    });
  }

  /**
   * Scrape Vedantu content
   */
  async scrapeVedantu(url: string): Promise<ScrapingResult> {
    return this.scrape({
      url: `https://www.vedantu.com${url}`,
      render: true,
      country: "IN",
      wait: 3000,
    });
  }

  /**
   * Scrape BYJU'S content
   */
  async scrapeByjus(url: string): Promise<ScrapingResult> {
    return this.scrape({
      url: `https://byjus.com${url}`,
      render: true,
      country: "IN",
      wait: 4000, // BYJU'S has heavier JavaScript
    });
  }

  /**
   * Search Khan Academy and return course data
   */
  async searchKhanAcademy(query: string): Promise<{
    success: boolean;
    results: any[];
    error?: string;
  }> {
    const result = await this.scrapeKhanAcademy(`/search?page_search_query=${encodeURIComponent(query)}`);

    if (!result.success) {
      return { success: false, results: [], error: result.error };
    }

    // TODO: Parse Khan Academy search results from HTML
    // This would require HTML parsing with cheerio or similar
    
    return {
      success: true,
      results: [], // Placeholder - implement parsing logic
    };
  }

  /**
   * Extract text from HTML using cheerio
   */
  private extractText(html: string): string {
    try {
      const $ = cheerio.load(html);
      // Remove script, style, and other non-content tags
      $("script, style, noscript, iframe, svg").remove();
      return $("body").text().replace(/\s+/g, " ").trim();
    } catch (error) {
      console.error("Error extracting text:", error);
      return "";
    }
  }

  /**
   * Parse HTML and extract structured data
   */
  parseHTML(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

// Singleton instance
export const scrapingBeeService = new ScrapingBeeService();

/**
 * Convenience function for scraping
 */
export async function scrapeWebsite(options: ScrapingOptions): Promise<ScrapingResult> {
  return scrapingBeeService.scrape(options);
}

/**
 * Scrape Khan Academy
 */
export async function scrapeKhanAcademy(url: string): Promise<ScrapingResult> {
  return scrapingBeeService.scrapeKhanAcademy(url);
}

/**
 * Scrape Unacademy
 */
export async function scrapeUnacademy(url: string): Promise<ScrapingResult> {
  return scrapingBeeService.scrapeUnacademy(url);
}

/**
 * Scrape Vedantu
 */
export async function scrapeVedantu(url: string): Promise<ScrapingResult> {
  return scrapingBeeService.scrapeVedantu(url);
}

/**
 * Scrape BYJU'S
 */
export async function scrapeByjus(url: string): Promise<ScrapingResult> {
  return scrapingBeeService.scrapeByjus(url);
}

