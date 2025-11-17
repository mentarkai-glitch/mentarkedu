/**
 * Visual Exporter Service
 * Handles export of diagrams and visualizations to various formats
 */

export type ExportFormat = 'png' | 'svg' | 'pdf' | 'gif' | 'mp4';

export interface ExportOptions {
  format: ExportFormat;
  width?: number;
  height?: number;
  quality?: number; // 0-1 for image formats
  backgroundColor?: string;
  includeAnimation?: boolean; // For GIF/MP4
  animationDuration?: number; // seconds
  frameRate?: number; // fps for video
}

/**
 * Export canvas element to PNG
 */
export async function exportToPNG(
  canvas: HTMLCanvasElement,
  options: Partial<ExportOptions> = {}
): Promise<Blob> {
  const { width, height, quality = 0.92, backgroundColor } = options;
  
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = width || canvas.width;
  exportCanvas.height = height || canvas.height;
  
  const ctx = exportCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Fill background if specified
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  }
  
  // Draw original canvas
  ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
  
  return new Promise((resolve, reject) => {
    exportCanvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create PNG blob'));
      },
      'image/png',
      quality
    );
  });
}

/**
 * Export SVG element to SVG file
 */
export async function exportToSVG(
  svgElement: SVGSVGElement,
  options: Partial<ExportOptions> = {}
): Promise<Blob> {
  const { width, height, backgroundColor } = options;
  
  // Clone the SVG to avoid modifying the original
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
  
  if (width) clonedSvg.setAttribute('width', width.toString());
  if (height) clonedSvg.setAttribute('height', height.toString());
  
  if (backgroundColor) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', backgroundColor);
    clonedSvg.insertBefore(rect, clonedSvg.firstChild);
  }
  
  // Serialize SVG
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clonedSvg);
  
  // Add XML declaration
  const svgBlob = new Blob(
    ['<?xml version="1.0" encoding="UTF-8"?>', svgString],
    { type: 'image/svg+xml;charset=utf-8' }
  );
  
  return svgBlob;
}

/**
 * Export canvas to PDF using jsPDF
 */
export async function exportToPDF(
  canvas: HTMLCanvasElement,
  options: Partial<ExportOptions> = {}
): Promise<Blob> {
  // Dynamic import to avoid bundling jsPDF if not needed
  const { default: jsPDF } = await import('jspdf');
  
  const { width, height, backgroundColor } = options;
  const pdfWidth = width || canvas.width;
  const pdfHeight = height || canvas.height;
  
  // Convert pixels to mm (assuming 96 DPI)
  const mmWidth = (pdfWidth / 96) * 25.4;
  const mmHeight = (pdfHeight / 96) * 25.4;
  
  const pdf = new jsPDF({
    orientation: mmWidth > mmHeight ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [mmWidth, mmHeight]
  });
  
  if (backgroundColor) {
    pdf.setFillColor(backgroundColor);
    pdf.rect(0, 0, mmWidth, mmHeight, 'F');
  }
  
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight);
  
  return pdf.output('blob');
}

/**
 * Export animated canvas to GIF using gif.js
 */
export async function exportToGIF(
  frames: HTMLCanvasElement[],
  options: Partial<ExportOptions> = {}
): Promise<Blob> {
  // Dynamic import - @ts-ignore for gif.js missing type definitions
  // @ts-ignore
  const GIF = (await import('gif.js')).default as any;
  
  const { width, height, quality = 0.1, animationDuration = 2, frameRate = 10 } = options;
  
  const gif = new GIF({
    workers: 2,
    quality: Math.round(quality * 100),
    width: width || frames[0]?.width || 800,
    height: height || frames[0]?.height || 600,
    repeat: 0 // 0 = repeat forever
  });
  
  const delay = Math.round((animationDuration / frames.length) * 1000);
  
  frames.forEach((frame) => {
    gif.addFrame(frame, { delay });
  });
  
  return new Promise((resolve, reject) => {
    gif.on('finished', (blob: Blob) => {
      resolve(blob);
    });
    
    gif.on('error', (error: Error) => {
      reject(error);
    });
    
    gif.render();
  });
}

/**
 * Export animated canvas to MP4 using MediaRecorder API
 */
export async function exportToMP4(
  frames: HTMLCanvasElement[],
  options: Partial<ExportOptions> = {}
): Promise<Blob> {
  const { width, height, frameRate = 30, animationDuration = 2 } = options;
  
  const canvas = document.createElement('canvas');
  canvas.width = width || frames[0]?.width || 800;
  canvas.height = height || frames[0]?.height || 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  const stream = canvas.captureStream(frameRate);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9'
  });
  
  const chunks: Blob[] = [];
  
  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };
    
    mediaRecorder.onerror = (error) => {
      reject(error);
    };
    
    mediaRecorder.start();
    
    const frameDelay = (animationDuration * 1000) / frames.length;
    let frameIndex = 0;
    
    const drawFrame = () => {
      if (frameIndex >= frames.length) {
        mediaRecorder.stop();
        return;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frames[frameIndex], 0, 0, canvas.width, canvas.height);
      frameIndex++;
      
      setTimeout(drawFrame, frameDelay);
    };
    
    drawFrame();
  });
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

