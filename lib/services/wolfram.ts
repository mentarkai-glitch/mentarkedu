/**
 * Wolfram Alpha Integration
 * For verified computational and factual answers
 * Using official REST API (no npm package)
 */

import axios from "axios";

const appId = process.env.WOLFRAM_ALPHA_APP_ID;

export interface WolframResult {
  result: string;
  pods?: Array<{
    title: string;
    content: string;
  }>;
  success: boolean;
}

export interface WolframPod {
  title: string;
  subpods: Array<{
    title?: string;
    plaintext?: string;
    img?: {
      src: string;
      alt: string;
    };
  }>;
}

export interface WolframAPIResponse {
  queryresult: {
    success: boolean;
    error?: boolean;
    pods?: WolframPod[];
  };
}

export class WolframService {
  private appId: string | undefined;

  constructor() {
    this.appId = appId;
  }

  /**
   * Check if Wolfram Alpha is available
   */
  isAvailable(): boolean {
    return !!this.appId;
  }

  /**
   * Query Wolfram Alpha
   */
  async query(query: string): Promise<WolframResult> {
    if (!this.appId) {
      return {
        result: "",
        success: false,
      };
    }

    try {
      const response = await axios.get<WolframAPIResponse>(
        "https://api.wolframalpha.com/v2/query",
        {
          params: {
            input: query,
            appid: this.appId,
            output: "json",
          },
        }
      );

      const queryresult = response.data.queryresult;

      if (!queryresult.success) {
        return {
          result: "",
          success: false,
        };
      }

      const result: WolframResult = {
        result: "",
        pods: [],
        success: true,
      };

      // Extract main result from pods
      if (queryresult.pods && queryresult.pods.length > 0) {
        // Find result pod (usually pod with title "Result" or first pod)
        const resultPod = queryresult.pods.find((pod) => pod.title === "Result") || queryresult.pods[0];

        if (resultPod && resultPod.subpods && resultPod.subpods.length > 0) {
          result.result = resultPod.subpods[0].plaintext || resultPod.subpods[0].img?.alt || "";
        }

        // Collect all pod data
        result.pods = queryresult.pods
          .filter((pod) => pod.subpods && pod.subpods.length > 0)
          .map((pod) => ({
            title: pod.title,
            content: pod.subpods
              .map((sp) => sp.plaintext || sp.img?.alt || "")
              .filter(Boolean)
              .join("\n"),
          }));
      }

      // If no result pod found, use first pod
      if (!result.result && result.pods && result.pods.length > 0) {
        result.result = result.pods[0].content;
      }

      return result;
    } catch (error: any) {
      console.error("Wolfram Alpha error:", error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        return {
          result: "",
          success: false,
        };
      }

      return {
        result: "",
        success: false,
      };
    }
  }

  /**
   * Check if a query is suitable for Wolfram
   */
  isSuitableQuery(query: string): boolean {
    const wolframKeywords = [
      "calculate",
      "solve",
      "compute",
      "derivative",
      "integral",
      "graph",
      "plot",
      "convert",
      "factor",
      "expand",
      "integrate",
      "differentiate",
      "plot",
      "minimum",
      "maximum",
      "limit",
      "series",
      "transform",
      "equation",
      "formula",
      "number theory",
      "algebra",
      "calculus",
      "statistics",
      "chemistry",
      "physics",
      "+",
      "-",
      "*",
      "/",
      "^",
      "=",
      ">",
      "<",
      "sum",
      "product",
    ];

    const lowerQuery = query.toLowerCase();
    return wolframKeywords.some((keyword) => lowerQuery.includes(keyword));
  }

  /**
   * Get short result for quick answers
   */
  async getShortResult(query: string): Promise<string> {
    if (!this.appId) {
      return "";
    }

    try {
      const response = await axios.get("https://api.wolframalpha.com/v1/result", {
        params: {
          i: query,
          appid: this.appId,
        },
      });

      return response.data || "";
    } catch (error) {
      console.error("Wolfram short result error:", error);
      return "";
    }
  }
}

export const wolframService = new WolframService();
