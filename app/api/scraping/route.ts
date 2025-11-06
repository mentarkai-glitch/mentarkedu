import { NextRequest } from "next/server";
import { scrapingBeeService } from "@/lib/services/scraping/scrapingbee";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import type { ScrapingOptions } from "@/lib/services/scraping/scrapingbee";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, platform, render, country, deviceType } = body;

    if (!url && !platform) {
      return errorResponse("URL or platform is required", 400);
    }

    // Check if service is available
    if (!scrapingBeeService.isAvailable()) {
      return errorResponse("ScrapingBee API key not configured", 500);
    }

    let result;

    // Platform-specific scraping
    if (platform) {
      const relativeUrl = url || "";
      switch (platform.toLowerCase()) {
        case "khan":
        case "khanacademy":
          result = await scrapingBeeService.scrapeKhanAcademy(relativeUrl);
          break;
        case "unacademy":
          result = await scrapingBeeService.scrapeUnacademy(relativeUrl);
          break;
        case "vedantu":
          result = await scrapingBeeService.scrapeVedantu(relativeUrl);
          break;
        case "byjus":
        case "byjus":
          result = await scrapingBeeService.scrapeByjus(relativeUrl);
          break;
        default:
          return errorResponse(`Unsupported platform: ${platform}`, 400);
      }
    } else {
      // Generic scraping
      const options: ScrapingOptions = {
        url,
        render: render !== false,
        country,
        deviceType: deviceType || "desktop",
      };
      result = await scrapingBeeService.scrape(options);
    }

    if (!result.success) {
      return errorResponse(result.error || "Failed to scrape website", 500);
    }

    return successResponse({
      html: result.html,
      text: result.text,
      screenshot: result.screenshot,
      url: result.url,
      statusCode: result.statusCode,
    });
  } catch (error: any) {
    console.error("Scraping API error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const platform = searchParams.get("platform");

    if (!url && !platform) {
      return errorResponse("URL or platform query parameter is required", 400);
    }

    if (!scrapingBeeService.isAvailable()) {
      return errorResponse("ScrapingBee API key not configured", 500);
    }

    let result;

    if (platform) {
      const relativeUrl = url || "";
      switch (platform.toLowerCase()) {
        case "khan":
        case "khanacademy":
          result = await scrapingBeeService.scrapeKhanAcademy(relativeUrl);
          break;
        case "unacademy":
          result = await scrapingBeeService.scrapeUnacademy(relativeUrl);
          break;
        case "vedantu":
          result = await scrapingBeeService.scrapeVedantu(relativeUrl);
          break;
        case "byjus":
          result = await scrapingBeeService.scrapeByjus(relativeUrl);
          break;
        default:
          return errorResponse(`Unsupported platform: ${platform}`, 400);
      }
    } else {
      result = await scrapingBeeService.scrape({
        url: url!,
        render: true,
        deviceType: "desktop",
      });
    }

    if (!result.success) {
      return errorResponse(result.error || "Failed to scrape website", 500);
    }

    return successResponse({
      html: result.html,
      text: result.text,
      url: result.url,
      statusCode: result.statusCode,
    });
  } catch (error: any) {
    console.error("Scraping API error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}


