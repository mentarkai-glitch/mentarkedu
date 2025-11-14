/**
 * Google Document AI Service
 * OCR and Form Parsing using Google Document AI API
 */

import axios from 'axios';

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

    // Google Document AI requires OAuth token, not API key directly
    // However, for basic OCR, we can use the Document AI REST API with API key
    // For processors, we need OAuth or service account
    // Let's use the simpler OCR endpoint first that works with API key
    
    // Build request URL for REST API (works with API key)
    const url = `https://documentai.googleapis.com/v1/projects/${projectId}/locations/${location}/processors/${processorId}:process`;

    // Prepare request body
    const requestBody = {
      rawDocument: {
        content: base64Content,
        mimeType: mimeType,
      },
    };

    // Make API request - Note: This requires OAuth, not API key
    // For API key, we need to use a different endpoint or get OAuth token
    // Let's try with API key first, and handle OAuth if needed
    
    let response;
    try {
      // Try with API key (may not work for processors, but try anyway)
      response = await axios.post(url, requestBody, {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
      });
    } catch (authError: any) {
      // If API key doesn't work, we need OAuth token
      // For now, return an error asking for OAuth setup
      if (authError.response?.status === 401 || authError.response?.status === 403) {
        return {
          success: false,
          error: 'Document AI requires OAuth authentication. Please set up service account credentials or OAuth token.',
        };
      }
      throw authError;
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

