/**
 * Google Document AI Service
 * OCR and Form Parsing using Google Document AI API
 */

import axios from 'axios';
import { getGoogleOAuthToken } from './google-oauth';

export interface DocumentAIOptions {
  file: File | Buffer;
  processorType?: 'form-parser' | 'ocr';
  mimeType?: string;
}

export interface DocumentAIResult {
  success: boolean;
  extracted_text?: string;
  form_fields?: Record<string, string | boolean>;
  entities?: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  pages?: number;
  error?: string;
}

/**
 * Convert file to base64
 */
function fileToBase64(file: File | Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    if (Buffer.isBuffer(file)) {
      resolve(file.toString('base64'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1] || (reader.result as string);
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get MIME type from file
 */
function getMimeType(file: File | Buffer): string {
  if (Buffer.isBuffer(file)) {
    return 'application/pdf';
  }
  return file.type || 'application/pdf';
}

/**
 * Process document with Google Document AI
 */
export async function processDocument(
  options: DocumentAIOptions
): Promise<DocumentAIResult> {
  const apiKey = process.env.GOOGLE_DOCUMENT_AI_API_KEY;
  const projectId = process.env.GOOGLE_DOCUMENT_AI_PROJECT_ID || 'mentark-edu';
  const location = process.env.GOOGLE_DOCUMENT_AI_LOCATION || 'us';
  const processorType = options.processorType || 'ocr';
  
  // Get processor ID based on type
  const processorId = processorType === 'form-parser'
    ? process.env.GOOGLE_DOCUMENT_AI_FORM_PARSER_ID || '60180463eba9ae5f'
    : process.env.GOOGLE_DOCUMENT_AI_OCR_ID || '234ca2361069f6f2';

  if (!apiKey) {
    return {
      success: false,
      error: 'Google Document AI API key not configured',
    };
  }

  if (!processorId) {
    return {
      success: false,
      error: 'Document AI processor ID not configured',
    };
  }

  try {
    // Convert file to base64
    const base64Content = await fileToBase64(options.file);
    const mimeType = options.mimeType || getMimeType(options.file);

    // Build request URL
    const url = `https://${location}-documentai.googleapis.com/v1/projects/${projectId}/locations/${location}/processors/${processorId}:process`;

    // Prepare request body
    const requestBody = {
      rawDocument: {
        content: base64Content,
        mimeType: mimeType,
      },
    };

    // Try multiple authentication methods:
    // 1. Service account (preferred for server-side Document AI)
    // 2. OAuth token (if service account available)
    // 3. API key (may work for basic operations, but typically requires service account)

    let authHeader: string | null = null;
    let response;

    // Method 1: Try service account first (best for Document AI)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        const { google } = await import('googleapis');
        const auth = new google.auth.GoogleAuth({
          keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const client = await auth.getClient();
        const token = await client.getAccessToken();
        if (token.token) {
          authHeader = `Bearer ${token.token}`;
        }
      } catch (serviceAccountError) {
        console.warn('Service account auth failed:', serviceAccountError);
      }
    }

    // Method 2: Try OAuth token (for service account via getGoogleOAuthToken)
    if (!authHeader) {
      try {
        const oauthToken = await getGoogleOAuthToken();
        if (oauthToken) {
          authHeader = `Bearer ${oauthToken}`;
        }
      } catch (oauthError) {
        console.warn('OAuth token generation failed:', oauthError);
      }
    }

    // Method 3: Try API key (may not work for processors)
    if (!authHeader && apiKey) {
      try {
        response = await axios.post(url, requestBody, {
          headers: {
            'X-Goog-Api-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });
      } catch (apiKeyError: any) {
        // If API key fails, provide helpful error message
        if (apiKeyError.response?.status === 401 || apiKeyError.response?.status === 403) {
          return {
            success: false,
            error: 'Document AI requires service account credentials for server-side operations. OAuth client credentials are for user-facing flows. Please set up a service account and add GOOGLE_APPLICATION_CREDENTIALS environment variable. See docs/DOCUMENT_AI_OAUTH_SETUP.md for instructions.',
          };
        }
        throw apiKeyError;
      }
    } else if (authHeader) {
      // Use service account or OAuth token
      response = await axios.post(url, requestBody, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });
    } else {
      return {
        success: false,
        error: 'No authentication method available. Document AI requires service account credentials. Please set GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to your service account JSON file. See docs/DOCUMENT_AI_OAUTH_SETUP.md for setup instructions.',
      };
    }

    const document = response.data.document;

    // Extract text
    let extractedText = '';
    if (document.text) {
      extractedText = document.text;
    }

    // Extract form fields (if form parser)
    const formFields: Record<string, string | boolean> = {};
    if (processorType === 'form-parser' && document.pages) {
      document.pages.forEach((page: any) => {
        if (page.formFields) {
          page.formFields.forEach((field: any) => {
            const fieldName = field.fieldName?.textAnchor?.content || field.name;
            if (field.fieldValue) {
              const value = field.fieldValue.textAnchor?.content || 
                           field.fieldValue.integerValue || 
                           field.fieldValue.normalizedValue?.text ||
                           '';
              formFields[fieldName] = value;
            } else if (field.fieldValue?.booleanValue !== undefined) {
              formFields[fieldName] = field.fieldValue.booleanValue;
            }
          });
        }
      });
    }

    // Extract entities
    const entities: Array<{ type: string; value: string; confidence: number }> = [];
    if (document.entities) {
      document.entities.forEach((entity: any) => {
        entities.push({
          type: entity.type || 'unknown',
          value: entity.mentionText || entity.textAnchor?.content || '',
          confidence: entity.confidence || 0,
        });
      });
    }

    return {
      success: true,
      extracted_text: extractedText,
      form_fields: Object.keys(formFields).length > 0 ? formFields : undefined,
      entities: entities.length > 0 ? entities : undefined,
      pages: document.pages?.length || 1,
    };
  } catch (error: any) {
    console.error('Document AI processing error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to process document',
    };
  }
}

/**
 * Extract text from document (simple OCR)
 */
export async function extractTextFromDocument(
  file: File | Buffer,
  mimeType?: string
): Promise<{ success: boolean; text?: string; error?: string }> {
  const result = await processDocument({
    file,
    processorType: 'ocr',
    mimeType,
  });

  return {
    success: result.success,
    text: result.extracted_text,
    error: result.error,
  };
}

/**
 * Parse form fields from document (Form Parser)
 */
export async function parseFormFields(
  file: File | Buffer,
  mimeType?: string
): Promise<{ success: boolean; fields?: Record<string, string | boolean>; text?: string; error?: string }> {
  const result = await processDocument({
    file,
    processorType: 'form-parser',
    mimeType,
  });

  return {
    success: result.success,
    fields: result.form_fields,
    text: result.extracted_text,
    error: result.error,
  };
}

