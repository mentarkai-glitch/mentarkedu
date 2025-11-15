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

    if (!result.success || !result.html) {
      return { success: false, results: [], error: result.error || "No HTML content" };
    }

    try {
      const $ = this.parseHTML(result.html);
      const results: any[] = [];

      // Khan Academy search results can appear in different containers
      // Try multiple selectors to catch different result types (courses, videos, exercises)
      
      // 1. Course cards (main results)
      $('[data-testid="search-result-card"], ._1f7s0st, ._1h4dk31, .search-result-item').each((_, element) => {
        const $el = $(element);
        const title = $el.find('h3, .title, [data-testid="title"]').first().text().trim();
        const description = $el.find('p, .description, [data-testid="description"]').first().text().trim();
        const url = $el.find('a').first().attr('href') || '';
        const thumbnail = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || '';
        const type = this.extractKhanAcademyType($el, url);

        if (title) {
          results.push({
            title,
            description,
            url: url.startsWith('http') ? url : `https://www.khanacademy.org${url}`,
            thumbnail,
            type, // 'course', 'video', 'exercise', 'article'
            source: 'khan_academy',
          });
        }
      });

      // 2. Direct video/exercise results
      $('a[href*="/v/"], a[href*="/e/"], a[href*="/a/"]').each((_, element) => {
        const $el = $(element);
        const title = $el.find('span, .text-content').text().trim() || $el.text().trim();
        const url = $el.attr('href') || '';
        
        if (title && url && !results.find(r => r.url === url)) {
          const type = this.extractKhanAcademyType($el, url);
          results.push({
            title,
            description: '',
            url: url.startsWith('http') ? url : `https://www.khanacademy.org${url}`,
            thumbnail: '',
            type,
            source: 'khan_academy',
          });
        }
      });

      // 3. Fallback: Parse JSON-LD structured data if available
      $('script[type="application/ld+json"]').each((_, element) => {
        try {
          const jsonData = JSON.parse($(element).html() || '{}');
          if (jsonData['@type'] === 'Course' || jsonData['@type'] === 'VideoObject') {
            const existing = results.find(r => r.url === jsonData.url || r.title === jsonData.name);
            if (!existing && jsonData.name) {
              results.push({
                title: jsonData.name,
                description: jsonData.description || '',
                url: jsonData.url || '',
                thumbnail: jsonData.thumbnailUrl || '',
                type: jsonData['@type'] === 'Course' ? 'course' : 'video',
                source: 'khan_academy',
              });
            }
          }
        } catch (e) {
          // Skip invalid JSON
        }
      });

      // Remove duplicates based on URL
      const uniqueResults = Array.from(
        new Map(results.map(item => [item.url, item])).values()
      );

      return {
        success: true,
        results: uniqueResults.slice(0, 20), // Limit to top 20 results
      };
    } catch (error: any) {
      console.error("Error parsing Khan Academy results:", error);
      return {
        success: false,
        results: [],
        error: `Parsing error: ${error.message}`,
      };
    }
  }

  /**
   * Extract Khan Academy content type from element or URL
   */
  private extractKhanAcademyType($el: cheerio.Cheerio, url: string): string {
    // Check URL patterns
    if (url.includes('/v/')) return 'video';
    if (url.includes('/e/')) return 'exercise';
    if (url.includes('/a/')) return 'article';
    if (url.includes('/c/')) return 'course';
    
    // Check for class names or data attributes
    const classes = $el.attr('class') || '';
    const dataType = $el.attr('data-type') || $el.find('[data-type]').attr('data-type') || '';
    
    if (dataType) {
      if (dataType.includes('video')) return 'video';
      if (dataType.includes('exercise')) return 'exercise';
      if (dataType.includes('article')) return 'article';
      if (dataType.includes('course')) return 'course';
    }
    
    if (classes.includes('video') || classes.includes('Video')) return 'video';
    if (classes.includes('exercise') || classes.includes('Exercise')) return 'exercise';
    if (classes.includes('article') || classes.includes('Article')) return 'article';
    
    // Default to course
    return 'course';
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
  parseHTML(html: string): cheerio.Root {
    return cheerio.load(html);
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Scrape NIRF rankings for colleges
   */
  async scrapeNIRFRankings(stream: string): Promise<{
    success: boolean;
    colleges: Array<{
      name: string;
      rank: number;
      city: string;
      stream: string;
      url?: string;
    }>;
    error?: string;
  }> {
    try {
      // NIRF website URL - adjust based on actual structure
      const result = await this.scrape({
        url: `https://www.nirfindia.org/2024/Ranking.html`,
        render: true,
        country: "IN",
        wait: 5000, // NIRF site loads slowly
      });

      if (!result.success || !result.html) {
        return { success: false, colleges: [], error: result.error };
      }

      try {
        const $ = this.parseHTML(result.html);
        const colleges: any[] = [];

        // Parse NIRF table structure - adjust selectors based on actual HTML
        $('table tbody tr').each((_, row) => {
          const $row = $(row);
          const rankText = $row.find('td:first-child').text().trim();
          const rank = parseInt(rankText) || 0;
          const name = $row.find('td:nth-child(2)').text().trim();
          const city = $row.find('td:nth-child(3)').text().trim();
          
          if (name && rank > 0) {
            // Filter by stream if provided
            const streamMatch = !stream || 
              name.toLowerCase().includes(stream.toLowerCase()) ||
              stream.toLowerCase().includes('engineering') ||
              stream.toLowerCase().includes('science');
            
            if (streamMatch) {
              colleges.push({ 
                name, 
                rank, 
                city, 
                stream: stream || 'General',
                url: `https://www.nirfindia.org/2024/Ranking.html#${rank}`
              });
            }
          }
        });

        return { success: true, colleges: colleges.slice(0, 20) };
      } catch (error: any) {
        console.error('NIRF parsing error:', error);
        return { success: false, colleges: [], error: error.message };
      }
    } catch (error: any) {
      return { success: false, colleges: [], error: error.message };
    }
  }

  /**
   * Scrape exam schedules from official websites
   */
  async scrapeExamSchedule(examType: 'JEE' | 'NEET' | 'CUET'): Promise<{
    success: boolean;
    schedule: Array<{
      exam: string;
      date: string;
      registrationStart?: string;
      registrationEnd?: string;
      url?: string;
    }>;
    error?: string;
  }> {
    const urls = {
      JEE: 'https://jeemain.nta.ac.in/',
      NEET: 'https://neet.nta.ac.in/',
      CUET: 'https://cuet.samarth.ac.in/'
    };

    try {
      const result = await this.scrape({
        url: urls[examType],
        render: true,
        country: "IN",
        wait: 4000,
      });

      if (!result.success || !result.html) {
        return { success: false, schedule: [], error: result.error };
      }

      try {
        const $ = this.parseHTML(result.html);
        const schedule: any[] = [];

        // Extract exam dates from announcements/notifications
        $('.notification, .announcement, [class*="date"], [class*="schedule"]').each((_, el) => {
          const text = $(el).text();
          const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/);
          if (dateMatch) {
            schedule.push({
              exam: examType,
              date: dateMatch[1],
              url: $(el).find('a').attr('href') || urls[examType]
            });
          }
        });

        // Fallback: Look for common date patterns in page text
        if (schedule.length === 0) {
          const pageText = result.text || '';
          const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g;
          const dates = pageText.match(datePattern);
          if (dates && dates.length > 0) {
            schedule.push({
              exam: examType,
              date: dates[0],
              url: urls[examType]
            });
          }
        }

        return { success: true, schedule: schedule.slice(0, 5) };
      } catch (error: any) {
        console.error('Exam schedule parsing error:', error);
        return { success: false, schedule: [], error: error.message };
      }
    } catch (error: any) {
      return { success: false, schedule: [], error: error.message };
    }
  }

  /**
   * Scrape scholarship information
   */
  async scrapeScholarships(stream: string, budgetConstraint: boolean): Promise<{
    success: boolean;
    scholarships: Array<{
      name: string;
      amount: string;
      eligibility: string;
      deadline?: string;
      url?: string;
    }>;
    error?: string;
  }> {
    if (!budgetConstraint) {
      return { success: true, scholarships: [] };
    }

    try {
      // Scrape from scholarship portals
      const result = await this.scrape({
        url: `https://www.scholarships.gov.in/`,
        render: true,
        country: "IN",
        wait: 4000,
      });

      if (!result.success || !result.html) {
        return { success: false, scholarships: [], error: result.error };
      }

      try {
        const $ = this.parseHTML(result.html);
        const scholarships: any[] = [];

        // Try multiple selectors for scholarship items
        $('.scholarship-item, [class*="scholarship"], .card, .list-item').each((_, el) => {
          const $el = $(el);
          const name = $el.find('h3, .title, h4, [class*="title"]').first().text().trim();
          const amount = $el.find('.amount, [class*="amount"], .value').text().trim();
          const eligibility = $el.find('.eligibility, p, .description').first().text().trim();
          const deadline = $el.find('.deadline, [class*="deadline"], .date').text().trim();
          const url = $el.find('a').first().attr('href');
          
          if (name && (amount || eligibility)) {
            scholarships.push({
              name,
              amount: amount || 'Not specified',
              eligibility: eligibility.substring(0, 200) || 'Check official website',
              deadline: deadline || undefined,
              url: url ? (url.startsWith('http') ? url : `https://www.scholarships.gov.in${url}`) : undefined
            });
          }
        });

        return { success: true, scholarships: scholarships.slice(0, 10) };
      } catch (error: any) {
        console.error('Scholarship parsing error:', error);
        return { success: false, scholarships: [], error: error.message };
      }
    } catch (error: any) {
      return { success: false, scholarships: [], error: error.message };
    }
  }

  /**
   * Scrape college admission requirements from multiple sources
   * Searches NIRF colleges, official college websites, and admission portals
   */
  async scrapeCollegeAdmission(collegeName: string, stream: string): Promise<{
    success: boolean;
    admission: {
      requirements: string[];
      cutoffs?: Record<string, number>;
      fees?: string;
      url?: string;
      lastUpdated?: string;
      applicationProcess?: string[];
      importantDates?: Array<{ event: string; date: string }>;
    };
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          admission: { requirements: [] },
          error: 'ScrapingBee API key not configured'
        };
      }

      // Search strategies: try multiple sources
      const searchUrls = this.buildCollegeSearchUrls(collegeName, stream);
      const results: any = {
        requirements: [],
        cutoffs: {},
        fees: undefined,
        url: undefined,
        lastUpdated: new Date().toISOString(),
        applicationProcess: [],
        importantDates: []
      };

      // Try each URL until we get valid data
      for (const urlConfig of searchUrls) {
        try {
          const result = await this.scrape({
            url: urlConfig.url,
            render: true,
            country: urlConfig.country || "IN",
            wait: urlConfig.wait || 4000,
          });

          if (!result.success || !result.html) continue;

          const $ = this.parseHTML(result.html);
          
          // Extract admission requirements
          const requirements = this.extractAdmissionRequirements($, stream);
          if (requirements.length > 0) {
            results.requirements = requirements;
          }

          // Extract cutoffs (JEE, NEET, CET scores)
          const cutoffs = this.extractCutoffs($, stream);
          if (Object.keys(cutoffs).length > 0) {
            results.cutoffs = { ...results.cutoffs, ...cutoffs };
          }

          // Extract fee structure
          const fees = this.extractFees($);
          if (fees) {
            results.fees = fees;
          }

          // Extract application process
          const appProcess = this.extractApplicationProcess($);
          if (appProcess.length > 0) {
            results.applicationProcess = appProcess;
          }

          // Extract important dates
          const dates = this.extractImportantDates($);
          if (dates.length > 0) {
            results.importantDates = dates;
          }

          // Set source URL if we found data
          if (results.requirements.length > 0 || Object.keys(results.cutoffs).length > 0) {
            results.url = urlConfig.url;
            break; // Found good data, stop searching
          }
        } catch (err) {
          console.error(`Error scraping ${urlConfig.url}:`, err);
          continue;
        }
      }

      // If no requirements found, add generic requirements based on stream
      if (results.requirements.length === 0) {
        results.requirements = this.getDefaultRequirements(stream);
      }

      // Success if we found at least some data
      const hasData = results.requirements.length > 0 || 
                     Object.keys(results.cutoffs).length > 0 || 
                     results.fees;

      return {
        success: hasData,
        admission: results,
        error: hasData ? undefined : 'Could not find admission information for this college'
      };
    } catch (error: any) {
      console.error('College admission scraping error:', error);
      return {
        success: false,
        admission: {
          requirements: this.getDefaultRequirements(stream),
        },
        error: error.message || 'Failed to scrape college admission data'
      };
    }
  }

  /**
   * Build search URLs for college admission information
   */
  private buildCollegeSearchUrls(collegeName: string, stream: string): Array<{
    url: string;
    country?: string;
    wait?: number;
  }> {
    const normalizedName = collegeName.toLowerCase().replace(/\s+/g, '-');
    const urls: Array<{ url: string; country?: string; wait?: number }> = [];

    // 1. Try NIRF website (for ranked colleges)
    urls.push({
      url: `https://www.nirfindia.org/2024/Ranking.html?q=${encodeURIComponent(collegeName)}`,
      country: 'IN',
      wait: 5000
    });

    // 2. Try official college website (common patterns)
    const commonDomains = [
      `.edu`,
      `.ac.in`,
      `.edu.in`
    ];
    
    // Extract college name without common suffixes
    const baseName = collegeName.replace(/\s+(University|College|Institute|Univ|Coll|Inst).*$/i, '');
    const normalizedBase = baseName.toLowerCase().replace(/\s+/g, '');
    
    commonDomains.forEach(domain => {
      urls.push({
        url: `https://${normalizedBase}${domain}/admissions`,
        country: 'IN',
        wait: 4000
      });
    });

    // 3. Try admission portals
    if (stream.toLowerCase().includes('engineering') || stream.toLowerCase().includes('tech')) {
      urls.push({
        url: `https://jeemain.nta.ac.in/`,
        country: 'IN',
        wait: 4000
      });
    }
    
    if (stream.toLowerCase().includes('medical') || stream.toLowerCase().includes('science')) {
      urls.push({
        url: `https://neet.nta.ac.in/`,
        country: 'IN',
        wait: 4000
      });
    }

    // 4. Try Shiksha or similar portals
    urls.push({
      url: `https://www.shiksha.com/college/${normalizedName}/admission`,
      country: 'IN',
      wait: 4000
    });

    // 5. Try Careers360
    urls.push({
      url: `https://www.careers360.com/colleges/${normalizedName}/admission`,
      country: 'IN',
      wait: 4000
    });

    return urls;
  }

  /**
   * Extract admission requirements from HTML
   */
  private extractAdmissionRequirements($: cheerio.Root, stream: string): string[] {
    const requirements: string[] = [];

    // Try multiple selectors for requirements
    const selectors = [
      '.admission-requirements',
      '.requirements',
      '[class*="requirement"]',
      '[class*="eligibility"]',
      '.eligibility-criteria',
      '.admission-criteria'
    ];

    selectors.forEach(selector => {
      $(selector).each((_, el) => {
        const text = $(el).text().trim();
        // Extract bullet points or numbered lists
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 10);
        lines.forEach(line => {
          // Check if line looks like a requirement
          if (line.match(/(minimum|required|eligibility|criteria|qualification|percentage|marks|degree)/i)) {
            if (!requirements.includes(line)) {
              requirements.push(line);
            }
          }
        });
      });
    });

    // Also try to extract from lists
    $('ul li, ol li').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 20 && text.match(/(minimum|required|eligibility|percentage|marks)/i)) {
        if (!requirements.includes(text)) {
          requirements.push(text);
        }
      }
    });

    return requirements.slice(0, 10); // Limit to 10 requirements
  }

  /**
   * Extract cutoff scores from HTML
   */
  private extractCutoffs($: cheerio.Root, stream: string): Record<string, number> {
    const cutoffs: Record<string, number> = {};
    const text = $('body').text();

    // Common exam patterns
    const examPatterns = [
      { name: 'JEE Main', pattern: /JEE\s*Main[:\s]*(\d+(?:\.\d+)?)/i },
      { name: 'JEE Advanced', pattern: /JEE\s*Advanced[:\s]*(\d+(?:\.\d+)?)/i },
      { name: 'NEET', pattern: /NEET[:\s]*(\d+)/i },
      { name: 'CET', pattern: /CET[:\s]*(\d+(?:\.\d+)?)/i },
      { name: 'MHT CET', pattern: /MHT\s*CET[:\s]*(\d+(?:\.\d+)?)/i },
      { name: 'WBJEE', pattern: /WBJEE[:\s]*(\d+(?:\.\d+)?)/i },
    ];

    examPatterns.forEach(exam => {
      const match = text.match(exam.pattern);
      if (match && match[1]) {
        const score = parseFloat(match[1]);
        if (!isNaN(score) && score > 0) {
          cutoffs[exam.name] = score;
        }
      }
    });

    // Try to extract from tables
    $('table td').each((_, el) => {
      const cellText = $(el).text().trim();
      examPatterns.forEach(exam => {
        if (cellText.toLowerCase().includes(exam.name.toLowerCase().split(' ')[0])) {
          const numberMatch = cellText.match(/(\d+(?:\.\d+)?)/);
          if (numberMatch) {
            const score = parseFloat(numberMatch[1]);
            if (!isNaN(score) && score > 0 && !cutoffs[exam.name]) {
              cutoffs[exam.name] = score;
            }
          }
        }
      });
    });

    return cutoffs;
  }

  /**
   * Extract fee structure from HTML
   */
  private extractFees($: cheerio.Root): string | undefined {
    const feeSelectors = [
      '.fee',
      '.fees',
      '[class*="fee"]',
      '[class*="tuition"]'
    ];

    for (const selector of feeSelectors) {
      const feeElement = $(selector).first();
      const text = feeElement.text().trim();
      
      // Look for currency amounts
      const feeMatch = text.match(/(?:₹|Rs|INR)[\s,]*(\d+(?:,\d+)*(?:\.\d+)?)/i);
      if (feeMatch) {
        const amount = feeMatch[1].replace(/,/g, '');
        return `₹${amount}`;
      }
    }

    // Fallback: search entire page
    const pageText = $('body').text();
    const feeMatch = pageText.match(/(?:Annual|Yearly|Total)\s*(?:Fee|Fees)[:\s]*(?:₹|Rs|INR)[\s,]*(\d+(?:,\d+)*(?:\.\d+)?)/i);
    if (feeMatch) {
      const amount = feeMatch[1].replace(/,/g, '');
      return `₹${amount}`;
    }

    return undefined;
  }

  /**
   * Extract application process steps
   */
  private extractApplicationProcess($: cheerio.Root): string[] {
    const steps: string[] = [];
    
    const processSelectors = [
      '.application-process',
      '.admission-process',
      '[class*="process"]',
      '[class*="procedure"]'
    ];

    processSelectors.forEach(selector => {
      $(selector).find('li, .step, .process-step').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 10 && text.length < 200) {
          if (!steps.includes(text)) {
            steps.push(text);
          }
        }
      });
    });

    return steps.slice(0, 8); // Limit to 8 steps
  }

  /**
   * Extract important dates
   */
  private extractImportantDates($: cheerio.Root): Array<{ event: string; date: string }> {
    const dates: Array<{ event: string; date: string }> = [];
    const text = $('body').text();

    // Common date patterns
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/gi;
    const dateMatches = text.match(datePattern) || [];

    // Common event keywords
    const eventKeywords = [
      'application',
      'admission',
      'registration',
      'deadline',
      'exam',
      'result',
      'counseling',
      'merit list'
    ];

    // Try to match dates with nearby events
    $('[class*="date"], [class*="schedule"], .announcement, .notification').each((_, el) => {
      const elText = $(el).text();
      const dateMatch = elText.match(datePattern);
      
      if (dateMatch) {
        const date = dateMatch[0];
        // Find event name in same element
        const eventKeyword = eventKeywords.find(keyword => 
          elText.toLowerCase().includes(keyword)
        );
        
        if (eventKeyword || elText.length < 100) {
          dates.push({
            event: eventKeyword || elText.substring(0, 50).trim(),
            date: date
          });
        }
      }
    });

    return dates.slice(0, 10); // Limit to 10 dates
  }

  /**
   * Get default requirements based on stream
   */
  private getDefaultRequirements(stream: string): string[] {
    const streamLower = stream.toLowerCase();
    const requirements: string[] = [];

    if (streamLower.includes('engineering') || streamLower.includes('tech')) {
      requirements.push(
        'Minimum 60% aggregate in 10+2 with Physics, Chemistry, and Mathematics',
        'Valid JEE Main or state entrance exam score',
        'Age limit: 17-25 years (varies by college)'
      );
    } else if (streamLower.includes('medical') || streamLower.includes('mbbs')) {
      requirements.push(
        'Minimum 50% aggregate in 10+2 with Physics, Chemistry, and Biology',
        'Valid NEET score (mandatory)',
        'Age limit: 17-25 years',
        'Must have studied English as a compulsory subject'
      );
    } else if (streamLower.includes('science')) {
      requirements.push(
        'Minimum 55% aggregate in 10+2 in relevant science subjects',
        'Entrance exam score may be required (varies by college)'
      );
    } else if (streamLower.includes('arts') || streamLower.includes('humanities')) {
      requirements.push(
        'Minimum 50% aggregate in 10+2',
        'Merit-based admission (entrance exam may be required)'
      );
    } else {
      requirements.push(
        'Minimum 50% aggregate in 10+2',
        'Check college website for specific eligibility criteria',
        'Entrance exam or merit-based admission as per college policy'
      );
    }

    return requirements;
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

