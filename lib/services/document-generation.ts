/**
 * Document Generation Service
 * Client-side utilities for document generation
 */

const API_BASE = "/api/documents";

export interface DocumentGenerationOptions {
  doc_type: string;
  format: "pdf" | "docx" | "xlsx" | "html";
  template_id?: string;
  data: any;
  branding?: any;
  options?: {
    compress?: boolean;
    s3_upload?: boolean;
    inline?: boolean;
  };
}

export interface ResumeGenerationOptions {
  template?: string;
  format?: "pdf" | "docx";
  profile?: any;
  branding?: any;
}

export interface CoverLetterOptions {
  job: any;
  profile?: any;
  template?: string;
}

export interface ProjectReportOptions {
  project_id?: string;
  project_data?: any;
  format?: "pdf" | "docx";
  template?: string;
}

export interface FlashcardOptions {
  source?: "practice_questions" | "custom";
  source_id?: string;
  questions?: any[];
  format?: "pdf" | "xlsx";
  template?: string;
}

export interface NotesOptions {
  topic?: string;
  content?: string;
  source?: "search" | "chat" | "custom" | "doubt_solver";
  source_id?: string;
  format?: "pdf" | "docx";
  template?: string;
  depth?: "detailed" | "standard" | "concise";
}

export interface ARKReportOptions {
  ark_id: string;
  format?: "pdf" | "docx" | "xlsx";
  report_type?: "progress" | "completion" | "skills";
}

/**
 * Generate a document using the universal endpoint
 */
export async function generateDocument(
  options: DocumentGenerationOptions
): Promise<{ id: string; download_url: string; format: string }> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate document");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Generate resume
 */
export async function generateResume(
  options: ResumeGenerationOptions
): Promise<{ id: string; download_url: string; format: string }> {
  const response = await fetch(`${API_BASE}/resume`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate resume");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Generate cover letter
 */
export async function generateCoverLetter(
  options: CoverLetterOptions
): Promise<{ id: string; download_url: string; format: string }> {
  const response = await fetch(`${API_BASE}/cover-letter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate cover letter");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Generate project report
 */
export async function generateProjectReport(
  options: ProjectReportOptions
): Promise<{ id: string; download_url: string; format: string }> {
  const response = await fetch(`${API_BASE}/project-report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate project report");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Generate flashcards
 */
export async function generateFlashcards(
  options: FlashcardOptions
): Promise<{ id: string; download_url: string; format: string }> {
  const response = await fetch(`${API_BASE}/flashcards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate flashcards");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Generate study notes
 */
export async function generateStudyNotes(
  options: NotesOptions
): Promise<{ id: string; download_url: string; format: string }> {
  const response = await fetch(`${API_BASE}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate study notes");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Generate ARK report
 */
export async function generateARKReport(
  options: ARKReportOptions
): Promise<{ id: string; download_url: string; format: string }> {
  const response = await fetch(`${API_BASE}/ark-report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate ARK report");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get current resume
 */
export async function getCurrentResume(): Promise<any | null> {
  const response = await fetch(`${API_BASE}/resume`);
  
  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  return result.data?.resume || null;
}

/**
 * List all documents
 */
export async function listDocuments(options?: {
  type?: string;
  format?: string;
  limit?: number;
  offset?: number;
}): Promise<{ documents: any[]; total: number }> {
  const params = new URLSearchParams();
  if (options?.type) params.append("type", options.type);
  if (options?.format) params.append("format", options.format);
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.offset) params.append("offset", options.offset.toString());

  const response = await fetch(`${API_BASE}/list?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error("Failed to list documents");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Download document
 */
export async function downloadDocument(
  documentId: string
): Promise<Blob> {
  const response = await fetch(`${API_BASE}/${documentId}/download`);
  
  if (!response.ok) {
    throw new Error("Failed to download document");
  }

  return response.blob();
}

/**
 * Download document and trigger browser download
 */
export async function downloadDocumentAsFile(
  documentId: string,
  filename?: string
): Promise<void> {
  const blob = await downloadDocument(documentId);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `document-${documentId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}







